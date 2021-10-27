import PQueue from 'p-queue';
import EventEmitter from 'events';
import makeLogger from './logger';
import { jobEmitter, localJobEmitter, clearDatabase, dequeueFromDatabase, dequeueFromDatabaseNotIn, incrementJobAttemptInDatabase, incrementCleanupAttemptInDatabase, markJobCompleteInDatabase, markJobCompleteThenRemoveFromDatabase, markJobPendingInDatabase, markJobErrorInDatabase, markJobStartAfterInDatabase, markJobAsAbortedOrRemoveFromDatabase, markCleanupStartAfterInDatabase, markQueuePendingInDatabase, updateCleanupValuesInDatabase, getCleanupFromDatabase, removePathFromCleanupDataInDatabase, getJobFromDatabase, markQueueForCleanupInDatabase, markQueueForCleanupAndRemoveInDatabase, markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase, removeCleanupFromDatabase, restoreJobToDatabaseForCleanupAndRemove, getUnloadDataFromDatabase, clearUnloadDataInDatabase, getGreatestJobIdFromQueueInDatabase, JOB_PENDING_STATUS, JOB_ERROR_STATUS, JOB_CLEANUP_STATUS, JOB_CLEANUP_AND_REMOVE_STATUS } from './database';
import { AbortError } from './errors';
export const CLEANUP_JOB_TYPE = 'CLEANUP_JOB_TYPE';
const PRIORITY_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER / 2);
export default class BatteryQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.stopped = false;
    this.dequeueQueue = new PQueue({
      concurrency: 1
    });
    this.unloadQueue = new PQueue({
      concurrency: 1
    });
    this.handlerMap = new Map();
    this.cleanupMap = new Map();
    this.durationEstimateHandlerMap = new Map();
    this.durationEstimateMap = new Map();
    this.durationEstimateUpdaterMap = new Map();
    this.retryJobDelayMap = new Map();
    this.retryCleanupDelayMap = new Map();
    this.queueCurrentJobTypeMap = new Map();
    this.queueMap = new Map();
    this.jobIds = new Set();
    this.durationEstimateUpdaterMap = new Map();
    this.abortControllerMap = new Map();
    this.isClearing = false;
    this.emitCallbacks = [];
    this.logger = options.logger || makeLogger('Battery Queue');
    this.addListener('error', error => {
      this.logger.errorStack(error);
    });
    this.addListener('heartbeat', interval => {
      clearTimeout(this.heartbeatExpiresTimeout);
      this.heartbeatExpiresTimestamp = Date.now() + Math.round(interval * 2.5);
      this.heartbeatExpiresTimeout = setTimeout(() => {
        if (typeof this.heartbeatExpiresTimestamp !== 'number') {
          return;
        }

        this.logger.warn(`Heartbeat timeout after ${Math.round(interval * 2.1)}ms`);
        this.unloadClient();
      }, Math.round(interval * 2.1));
    });
  }

  abortJob(queueId, jobId) {
    const queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap !== 'undefined') {
      const abortController = queueAbortControllerMap.get(jobId);

      if (typeof abortController !== 'undefined') {
        abortController.abort();
        return true;
      }
    }

    return false;
  }

  enableStartOnJob() {
    this.disableStartOnJob(); // Prevent handlers from being added multiple times

    let didRequestJobAddDequeue = false;

    const handleJobAdd = () => {
      if (didRequestJobAddDequeue) {
        return;
      }

      didRequestJobAddDequeue = true;
      self.queueMicrotask(() => {
        didRequestJobAddDequeue = false;
        this.dequeue();
      });
    };

    jobEmitter.addListener('jobAdd', handleJobAdd);
    this.handleJobAdd = handleJobAdd;

    const handleJobDelete = (id, queueId) => {
      this.abortJob(queueId, id);
    };

    jobEmitter.addListener('jobDelete', handleJobDelete);
    this.handleJobDelete = handleJobDelete;

    const handleJobUpdate = (id, queueId, type, status) => {
      if (status !== JOB_CLEANUP_AND_REMOVE_STATUS && status !== JOB_CLEANUP_STATUS) {
        return;
      }

      const didAbort = this.abortJob(queueId, id);

      if (didAbort) {
        return;
      }

      getJobFromDatabase(id).then(job => {
        if (typeof job === 'undefined') {
          this.logger.error(`Unable to cleanup and remove ${type} job #${id} in queue ${queueId}, job does not exist`);
          return;
        }

        if (this.jobIds.has(id)) {
          return;
        }

        const {
          args
        } = job;
        this.startCleanup(id, queueId, args, type, true);
      }).catch(error => {
        this.logger.error(`Error while cleaning up and removing ${type} job #${id} in queue ${queueId}`);
        this.logger.errorStack(error);
      });
    };

    jobEmitter.addListener('jobUpdate', handleJobUpdate);
    this.handleJobUpdate = handleJobUpdate;
  }

  disableStartOnJob() {
    const handleJobAdd = this.handleJobAdd;

    if (typeof handleJobAdd === 'function') {
      jobEmitter.removeListener('jobAdd', handleJobAdd);
      delete this.handleJobAdd;
    }

    const handleJobUpdate = this.handleJobUpdate;

    if (typeof handleJobUpdate === 'function') {
      jobEmitter.removeListener('jobUpdate', handleJobUpdate);
      delete this.handleJobUpdate;
    }

    const handleJobDelete = this.handleJobDelete;

    if (typeof handleJobDelete === 'function') {
      jobEmitter.removeListener('jobDelete', handleJobDelete);
      delete this.handleJobDelete;
    }
  }

  emit(type, ...args) {
    for (const emitCallback of this.emitCallbacks) {
      emitCallback(type, args);
    }

    return super.emit(type, ...args);
  }

  async getQueueIds() {
    await this.dequeue();
    const queueIds = new Set(this.queueMap.keys());
    return queueIds;
  }

  setUnload(handleUnload) {
    if (typeof this.handleUnload === 'function') {
      throw new Error('Unload handler already exists');
    }

    this.handleUnload = handleUnload;
  }

  removeUnload() {
    if (typeof this.handleUnload !== 'function') {
      throw new Error('Unload handler does not exist');
    }

    delete this.handleUnload;
  }

  setRetryJobDelay(type, retryJobDelayFunction) {
    if (this.retryJobDelayMap.has(type)) {
      throw new Error(`Retry job delay handler for type "${type}" already exists`);
    }

    this.retryJobDelayMap.set(type, retryJobDelayFunction);
  }

  removeRetryJobDelay(type) {
    if (!this.retryJobDelayMap.has(type)) {
      throw new Error(`Retry job delay handler for type "${type}" does not exist`);
    }

    this.retryJobDelayMap.delete(type);
  }

  async getRetryJobDelay(type, attempt, error) {
    const retryJobDelayFunction = this.retryJobDelayMap.get(type);

    if (typeof retryJobDelayFunction !== 'function') {
      return false;
    }

    let result = false;

    try {
      result = await retryJobDelayFunction(attempt, error);
    } catch (retryDelayError) {
      this.logger.error(`Error in retry job delay handler for type "${type}" on attempt ${attempt}`);
      this.emit('error', retryDelayError);
      return false;
    }

    if (typeof result !== 'number' && result !== false) {
      throw new Error(`Retry job delay function for type "${type}" returned invalid response, should be a number (milliseconds) or false`);
    }

    return result;
  }

  setRetryCleanupDelay(type, retryCleanupDelayFunction) {
    if (this.retryCleanupDelayMap.has(type)) {
      throw new Error(`Retry cleanup delay handler for type "${type}" already exists`);
    }

    this.retryCleanupDelayMap.set(type, retryCleanupDelayFunction);
  }

  removeRetryCleanupDelay(type) {
    if (!this.retryCleanupDelayMap.has(type)) {
      throw new Error(`Retry cleanup delay handler for type "${type}" does not exist`);
    }

    this.retryCleanupDelayMap.delete(type);
  }

  async getRetryCleanupDelay(type, attempt, error) {
    const retryCleanupDelayFunction = this.retryCleanupDelayMap.get(type);

    if (typeof retryCleanupDelayFunction !== 'function') {
      return false;
    }

    let result = false;

    try {
      result = await retryCleanupDelayFunction(attempt, error);
    } catch (retryDelayError) {
      this.logger.error(`Error in retry cleanup delay handler for type "${type}" on attempt ${attempt}`);
      this.emit('error', retryDelayError);
      return false;
    }

    if (typeof result !== 'number' && result !== false) {
      throw new Error(`Retry cleanup delay function for type "${type}" returned invalid response, should be a number (milliseconds) or false`);
    }

    return result;
  }

  setHandler(type, handler) {
    if (this.handlerMap.has(type)) {
      throw new Error(`Handler for type "${type}" already exists`);
    }

    this.handlerMap.set(type, handler);
  }

  removeHandler(type) {
    if (!this.handlerMap.has(type)) {
      throw new Error(`Handler for type "${type}" does not exist`);
    }

    this.handlerMap.delete(type);
  }

  setCleanup(type, cleanup) {
    if (this.cleanupMap.has(type)) {
      throw new Error(`Cleanup for type "${type}" already exists`);
    }

    this.cleanupMap.set(type, cleanup);
  }

  removeCleanup(type) {
    if (!this.cleanupMap.has(type)) {
      throw new Error(`Cleanup for type "${type}" does not exist`);
    }

    this.cleanupMap.delete(type);
  }

  setDurationEstimateHandler(type, timeEstimationHandler) {
    if (this.durationEstimateHandlerMap.has(type)) {
      throw new Error(`Time estimation handler for type "${type}" already exists`);
    }

    this.durationEstimateHandlerMap.set(type, timeEstimationHandler);
  }

  removeDurationEstimateHandler(type) {
    if (!this.durationEstimateHandlerMap.has(type)) {
      throw new Error(`Time estimation handler for type "${type}" does not exist`);
    }

    this.durationEstimateHandlerMap.delete(type);
  }

  addDurationEstimate(queueId, jobId, duration, pending) {
    const queueDurationEstimateMap = this.durationEstimateMap.get(queueId);

    if (typeof queueDurationEstimateMap === 'undefined') {
      this.durationEstimateMap.set(queueId, new Map([[jobId, [duration, pending]]]));
      this.emitDurationEstimate(queueId);
      return;
    }

    queueDurationEstimateMap.set(jobId, [duration, pending]);
    this.emitDurationEstimate(queueId);
  }

  removeDurationEstimate(queueId, jobId) {
    if (typeof jobId !== 'number') {
      this.durationEstimateMap.delete(queueId);
      this.emitDurationEstimate(queueId);
      return;
    }

    const queueDurationEstimateMap = this.durationEstimateMap.get(queueId);

    if (typeof queueDurationEstimateMap === 'undefined') {
      this.emitDurationEstimate(queueId);
      return;
    }

    queueDurationEstimateMap.delete(jobId);
    this.emitDurationEstimate(queueId);
  }

  updateDurationEstimates() {
    for (const updateDurationEstimate of this.durationEstimateUpdaterMap.values()) {
      updateDurationEstimate();
    }
  }

  getDurationEstimate(queueId) {
    const queueDurationEstimateMap = this.durationEstimateMap.get(queueId);
    let totalDuration = 0;
    let totalPending = 0;

    if (typeof queueDurationEstimateMap === 'undefined') {
      return [totalDuration, totalPending];
    }

    for (const [duration, pending] of queueDurationEstimateMap.values()) {
      totalDuration += duration;
      totalPending += pending;
    }

    return [totalDuration, totalPending];
  }

  emitDurationEstimate(queueId) {
    const [totalDuration, totalPending] = this.getDurationEstimate(queueId);
    this.emit('queueDuration', queueId, totalDuration, totalPending);
  }

  setCurrentJobType(queueId, type) {
    if (typeof type === 'string') {
      this.queueCurrentJobTypeMap.set(queueId, type);
    } else {
      this.queueCurrentJobTypeMap.delete(queueId);
    }

    this.emit('queueJobType', queueId, type);
  }

  getCurrentJobType(queueId) {
    return this.queueCurrentJobTypeMap.get(queueId);
  }

  async clear() {
    this.isClearing = true;
    await this.onIdle();
    this.emit('clearing');
    await clearDatabase();
    this.dequeueQueue.start();
    this.isClearing = false;
  }

  addToQueue(queueId, priority, autoStart, func) {
    if (this.stopped) {
      return;
    }

    const queue = this.queueMap.get(queueId);

    if (typeof queue !== 'undefined') {
      queue.add(func, {
        priority
      });
      return;
    }

    const newQueue = new PQueue({
      concurrency: 1,
      autoStart
    });
    this.queueMap.set(queueId, newQueue);
    newQueue.add(func, {
      priority
    });
    newQueue.on('idle', async () => {
      this.setCurrentJobType(queueId, undefined);

      if (!this.isClearing) {
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            this.removeListener('clearing', handleClearing);
            newQueue.removeListener('active', handleActive);
            resolve();
          }, 5000);

          const handleClearing = () => {
            clearTimeout(timeout);
            this.removeListener('clearing', handleClearing);
            newQueue.removeListener('active', handleActive);
            resolve();
          };

          const handleActive = () => {
            clearTimeout(timeout);
            this.removeListener('clearing', handleClearing);
            newQueue.removeListener('active', handleActive);
            resolve();
          };

          this.addListener('clearing', handleClearing);
          newQueue.addListener('active', handleActive);
        });
      }

      if (newQueue.pending > 0 || newQueue.size > 0) {
        return;
      }

      this.queueMap.delete(queueId);
      this.emit('queueInactive', queueId);
    });
    this.emit('queueActive', queueId);
  }

  async abortQueue(queueId) {
    this.logger.info(`Aborting queue ${queueId}`);
    this.removeDurationEstimate(queueId); // Abort active jobs

    const queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap !== 'undefined') {
      for (const abortController of queueAbortControllerMap.values()) {
        abortController.abort();
      }
    } // Changes:
    // * JOB_ERROR_STATUS -> JOB_CLEANUP_STATUS
    // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_STATUS
    // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_PENDING_STATUS -> JOB_ABORTED_STATUS


    const jobs = await markQueueForCleanupInDatabase(queueId);
    await this.startJobs(jobs);
  }

  async retryQueue(queueId) {
    this.logger.info(`Retrying queue ${queueId}`);
    const lastJobId = await getGreatestJobIdFromQueueInDatabase(queueId);
    const priority = PRIORITY_OFFSET - lastJobId - 0.5;
    this.addToQueue(queueId, priority, true, async () => {
      // Resets job attempts. Changes:
      // * JOB_ABORTED_STATUS -> JOB_PENDING_STATUS
      // * JOB_ERROR_STATUS -> JOB_ERROR_STATUS
      // * JOB_CLEANUP_STATUS -> JOB_CLEANUP_STATUS
      // * JOB_COMPLETE_STATUS -> JOB_COMPLETE_STATUS
      // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
      const jobs = await markQueuePendingInDatabase(queueId);
      await this.startJobs(jobs);
    });
  }

  async abortAndRemoveQueue(queueId) {
    this.logger.info(`Aborting and removing queue ${queueId}`);
    this.removeDurationEstimate(queueId); // Abort active jobs

    const queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap !== 'undefined') {
      for (const abortController of queueAbortControllerMap.values()) {
        abortController.abort();
      }
    } // Changes:
    // * JOB_ERROR_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_CLEANUP_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * Removes other statuses


    const jobs = await markQueueForCleanupAndRemoveInDatabase(queueId);
    await this.startJobs(jobs);
  }

  async abortAndRemoveQueueJobsGreaterThanId(queueId, id) {
    this.logger.info(`Aborting and removing jobs with ID greater than ${id} in queue ${queueId}`); // Abort active jobs

    const queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap !== 'undefined') {
      for (const [jobId, abortController] of queueAbortControllerMap) {
        if (jobId > id) {
          this.removeDurationEstimate(queueId, jobId);
          abortController.abort();
        }
      }
    } // Changes:
    // * JOB_ERROR_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_CLEANUP_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
    // * Removes other statuses


    const jobs = await markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, id);
    await this.startJobs(jobs);
  }

  async dequeue() {
    if (this.stopped) {
      return;
    }

    if (this.dequeueQueue.size === 0) {
      // Add a subsequent dequeue
      this.dequeueQueue.add(this.startJobs.bind(this));
    }

    await this.dequeueQueue.onIdle();
  }

  async startJobs(newJobs) {
    // eslint-disable-line consistent-return
    const jobs = Array.isArray(newJobs) ? newJobs : await dequeueFromDatabaseNotIn([...this.jobIds.keys()]);
    const queueIds = new Set();

    for (const {
      id,
      queueId,
      args,
      type,
      status,
      attempt,
      startAfter
    } of jobs) {
      if (this.jobIds.has(id)) {
        continue;
      } // Pause queues before adding items into them to avoid starting things out of priority


      if (!queueIds.has(queueId)) {
        const queue = this.queueMap.get(queueId);

        if (typeof queue !== 'undefined') {
          queue.pause();
        }

        queueIds.add(queueId);
      }

      if (status === JOB_PENDING_STATUS) {
        this.startJob(id, queueId, args, type, attempt + 1, startAfter, false);
      } else if (status === JOB_ERROR_STATUS) {
        this.startErrorHandler(id, queueId, args, type, attempt, startAfter, false);
      } else if (status === JOB_CLEANUP_STATUS) {
        this.startCleanup(id, queueId, args, type, false);
      } else if (status === JOB_CLEANUP_AND_REMOVE_STATUS) {
        this.startCleanup(id, queueId, args, type, false);
      } else {
        throw new Error(`Unknown job status ${status} in job ${id} of queue ${queueId}`);
      }
    }

    for (const queueId of queueIds) {
      const queue = this.queueMap.get(queueId);

      if (typeof queue !== 'undefined') {
        queue.start();
      } else {
        this.logger.error(`Unable to start queue ${queueId} after dequeue; queue does not exist`);
      }
    }
  }

  async stop() {
    if (typeof this.stopPromise === 'undefined') {
      this.stopped = true;

      this.stopPromise = (async () => {
        await this.dequeueQueue.onIdle();
        const idlePromises = [];

        for (const [queueId, queue] of this.queueMap) {
          const interval = setInterval(() => {
            this.logger.info(`Waiting on queue ${queueId} stop() request. Queue ${queue.isPaused ? 'is paused' : 'is not paused'}, with ${queue.pending} ${queue.pending === 1 ? 'job' : 'jobs'} pending and ${queue.size} ${queue.size === 1 ? 'job' : 'jobs'} remaining.`);
          }, 250);
          queue.clear();
          idlePromises.push(queue.onIdle().finally(() => {
            clearInterval(interval);
          }));
        }

        await Promise.all(idlePromises);
        this.jobIds.clear();
        this.abortControllerMap.clear();
        delete this.stopPromise;
        this.emit('stop');
        this.stopped = false;
      })();
    }

    await this.stopPromise;
  }

  async onIdle(maxDuration) {
    if (typeof this.onIdlePromise === 'undefined') {
      this.onIdlePromise = (async () => {
        const timeout = typeof maxDuration === 'number' ? Date.now() + maxDuration : -1;
        const start = Date.now();

        while (true) {
          // eslint-disable-line no-constant-condition
          if (timeout !== -1 && Date.now() > timeout) {
            this.logger.warn(`Idle timeout after ${Date.now() - start}ms`);
            break;
          }

          await this.dequeueQueue.onIdle();

          for (const [queueId, queue] of this.queueMap) {
            const interval = setInterval(() => {
              this.logger.info(`Waiting on queue ${queueId} onIdle() request. Queue ${queue.isPaused ? 'is paused' : 'is not paused'}, with ${queue.pending} ${queue.pending === 1 ? 'job' : 'jobs'} pending and ${queue.size} ${queue.size === 1 ? 'job' : 'jobs'} remaining.`);
            }, 250);
            await queue.onIdle();
            clearInterval(interval);
          }

          const jobsInterval = setInterval(() => {
            this.logger.info('Waiting on jobs');
          }, 250);
          const jobs = await dequeueFromDatabase();
          clearInterval(jobsInterval);

          if (jobs.length > 0) {
            const interval = setInterval(() => {
              this.logger.info('Waiting on dequeue');
            }, 250);
            await this.dequeue();
            clearInterval(interval);
            continue;
          }

          break;
        }

        delete this.onIdlePromise;
        this.emit('idle');
      })();
    }

    await this.onIdlePromise;
  }

  getAbortController(id, queueId) {
    let queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap === 'undefined') {
      queueAbortControllerMap = new Map();
      this.abortControllerMap.set(queueId, queueAbortControllerMap);
    }

    const abortController = queueAbortControllerMap.get(id);

    if (typeof abortController !== 'undefined') {
      return abortController;
    }

    const newAbortController = new AbortController();
    queueAbortControllerMap.set(id, newAbortController);
    return newAbortController;
  }

  removeAbortController(id, queueId) {
    const queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap === 'undefined') {
      this.logger.warn(`Abort controller map for ${id} in queue ${queueId} does not exist`);
      return;
    }

    const abortController = queueAbortControllerMap.get(id);

    if (typeof abortController === 'undefined') {
      this.logger.warn(`Abort controller for ${id} in queue ${queueId} does not exist`);
      return;
    }

    queueAbortControllerMap.delete(id);

    if (queueAbortControllerMap.size === 0) {
      this.abortControllerMap.delete(queueId);
    }
  }

  async runCleanup(id, queueId, args, type) {
    this.emit('cleanupStart', {
      id
    });
    const cleanup = this.cleanupMap.get(type);

    if (typeof cleanup !== 'function') {
      this.logger.warn(`No cleanup for job type ${type}`);
      await removeCleanupFromDatabase(id);
      this.emit('cleanup', {
        id
      });
      return;
    }

    const cleanupJob = await getCleanupFromDatabase(id);
    const {
      data,
      startAfter
    } = typeof cleanupJob === 'undefined' ? {
      data: undefined,
      startAfter: 0
    } : cleanupJob;
    const delay = startAfter - Date.now();

    if (delay > 0) {
      this.logger.info(`Delaying retry of ${type} job #${id} cleanup in queue ${queueId} by ${delay}ms to ${new Date(startAfter).toLocaleString()}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      await cleanup(data, args, path => removePathFromCleanupDataInDatabase(id, path));
    } catch (error) {
      const attempt = await incrementCleanupAttemptInDatabase(id, queueId);

      if (error.name === 'FatalError') {
        this.logger.error(`Fatal error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt}`);
        this.emit('error', error);
        await removeCleanupFromDatabase(id);
        this.emit('fatalCleanupError', {
          id,
          queueId
        });
        return;
      }

      const retryCleanupDelay = await this.getRetryCleanupDelay(type, attempt, error);

      if (retryCleanupDelay === false) {
        this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt} with no additional attempts requested`);
        this.emit('error', error);
        await removeCleanupFromDatabase(id);
        this.emit('fatalCleanupError', {
          id,
          queueId
        });
        return;
      }

      this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt}, retrying ${retryCleanupDelay > 0 ? `in ${retryCleanupDelay}ms` : 'immediately'}`);
      this.emit('error', error);

      if (retryCleanupDelay > 0) {
        this.emit('retryCleanupDelay', {
          id,
          queueId,
          retryCleanupDelay
        });
        const newStartAfter = Date.now() + retryCleanupDelay;
        await markCleanupStartAfterInDatabase(id, newStartAfter);
      }

      await this.runCleanup(id, queueId, args, type);
      return;
    }

    await removeCleanupFromDatabase(id);
    this.emit('cleanup', {
      id
    });
  }

  startCleanup(id, queueId, args, type, autoStart) {
    this.logger.info(`Adding ${type} cleanup job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    this.removeDurationEstimate(queueId, id);
    const priority = PRIORITY_OFFSET + id;

    const run = async () => {
      this.setCurrentJobType(queueId, CLEANUP_JOB_TYPE);
      this.logger.info(`Starting ${type} cleanup #${id} in queue ${queueId}`);
      await this.runCleanup(id, queueId, args, type); // Job could be marked for removal while cleanup is running

      await markJobAsAbortedOrRemoveFromDatabase(id);
      this.jobIds.delete(id);
    };

    this.addToQueue(queueId, priority, autoStart, run);
  }

  startErrorHandler(id, queueId, args, type, attempt, startAfter, autoStart) {
    this.logger.info(`Adding ${type} error handler job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET + id;
    const abortController = this.getAbortController(id, queueId);

    const run = async () => {
      this.setCurrentJobType(queueId, CLEANUP_JOB_TYPE);
      this.logger.info(`Starting ${type} error handler #${id} in queue ${queueId}`);
      await this.runCleanup(id, queueId, args, type);

      if (abortController.signal.aborted) {
        // Job could be marked for removal while error handler is running
        await markJobAsAbortedOrRemoveFromDatabase(id);
        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
      } else {
        await markJobPendingInDatabase(id);
        this.logger.info(`Retrying ${type} job #${id} in queue ${queueId}`);
        this.emit('retry', {
          id
        });
        this.startJob(id, queueId, args, type, attempt + 1, startAfter, true);
      }

      this.logger.info(`Completed ${type} error handler #${id} in queue ${queueId}`);
    };

    this.addToQueue(queueId, priority, autoStart, run);
  }

  async delayJobStart(id, queueId, type, signal, startAfter) {
    if (signal.aborted) {
      throw new AbortError(`Queue ${queueId} was aborted`);
    }

    const duration = startAfter - Date.now();

    if (duration > 0) {
      this.logger.info(`Delaying start of ${type} job #${id} in queue ${queueId} by ${duration}ms`);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          signal.removeEventListener('abort', handleAbort);
          resolve();
        }, duration);

        const handleAbort = () => {
          clearTimeout(timeout);
          signal.removeEventListener('abort', handleAbort);
          reject(new AbortError(`Queue ${queueId} was aborted`));
        };

        signal.addEventListener('abort', handleAbort);
      });
    }
  }

  startJob(id, queueId, args, type, attempt, startAfter, autoStart) {
    this.logger.info(`Adding ${type} job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET - id;

    const updateCleanupData = data => updateCleanupValuesInDatabase(id, queueId, data);

    const updateDuration = (duration, pending) => {
      this.addDurationEstimate(queueId, id, duration, pending);
    };

    const updateDurationEstimate = () => {
      const durationEstimateHandler = this.durationEstimateHandlerMap.get(type);

      if (typeof durationEstimateHandler === 'function') {
        try {
          const durationEstimate = durationEstimateHandler(args);
          this.addDurationEstimate(queueId, id, durationEstimate, durationEstimate);
          return durationEstimate;
        } catch (error) {
          this.logger.error(`Unable to estimate duration of ${type} job #${id} in queue ${queueId}`);
          this.logger.errorStack(error);
        }
      }

      return 0;
    };

    updateDurationEstimate();
    this.durationEstimateUpdaterMap.set(id, updateDurationEstimate);
    const abortController = this.getAbortController(id, queueId);

    const run = async () => {
      const start = Date.now();
      const durationEstimate = updateDurationEstimate();
      this.durationEstimateUpdaterMap.delete(id);

      if (abortController.signal.aborted) {
        this.emit('fatalError', {
          id,
          queueId,
          error: new AbortError(`Queue ${queueId} was aborted`)
        });
        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
        this.removeDurationEstimate(queueId, id);
        return;
      }

      const handler = this.handlerMap.get(type);

      if (typeof handler !== 'function') {
        this.logger.warn(`No handler for job type ${type}`);
        await markJobCompleteInDatabase(id);
        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
        this.addDurationEstimate(queueId, id, Date.now() - start, 0);
        return;
      }

      this.setCurrentJobType(queueId, type);
      let handlerDidRun = false;

      try {
        // Mark as error in database so the job is cleaned up and retried if execution
        // stops before job completion or error.
        await markJobErrorInDatabase(id);
        await this.delayJobStart(id, queueId, type, abortController.signal, startAfter);
        this.logger.info(`Starting ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
        handlerDidRun = true;
        const shouldKeepJobInDatabase = await handler(args, abortController.signal, updateCleanupData, updateDuration);

        if (abortController.signal.aborted) {
          throw new AbortError(`Queue ${queueId} was aborted`);
        }

        if (shouldKeepJobInDatabase === false) {
          await markJobCompleteThenRemoveFromDatabase(id);
        } else {
          await markJobCompleteInDatabase(id);
        }

        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
        const duration = Date.now() - start;

        if (typeof durationEstimate === 'number') {
          const estimatedToActualRatio = durationEstimate / duration;

          if (estimatedToActualRatio < 0.8 || estimatedToActualRatio > 1.25) {
            this.logger.warn(`Duration estimate of ${type} job #${id} (${durationEstimate}ms) was ${Math.round(100 * estimatedToActualRatio)}% of actual value (${duration}ms)`);
          }
        }

        this.addDurationEstimate(queueId, id, duration, 0);
        this.logger.info(`Completed ${type} job #${id} in queue ${queueId} attempt ${attempt} in ${duration}ms`);
        return;
      } catch (error) {
        if (error.name === 'JobDoesNotExistError') {
          this.logger.error(`Job does not exist error for ${type} job #${id} in queue ${queueId} attempt ${attempt}`);

          if (handlerDidRun) {
            this.emit('fatalError', {
              id,
              queueId,
              error
            });
            await restoreJobToDatabaseForCleanupAndRemove(id, queueId, type, args);
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
            this.startCleanup(id, queueId, args, type, true);
          } else {
            this.emit('fatalError', {
              id,
              queueId,
              error
            });
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
            this.removeDurationEstimate(queueId, id);
          }

          return;
        }

        if (abortController.signal.aborted) {
          if (error.name !== 'AbortError') {
            this.logger.error(`Abort signal following error in ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
            this.emit('error', error);
          } else {
            this.logger.warn(`Received abort signal for ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
          }

          if (handlerDidRun) {
            this.emit('fatalError', {
              id,
              queueId,
              error
            });
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
            this.startCleanup(id, queueId, args, type, true);
          } else {
            this.emit('fatalError', {
              id,
              queueId,
              error
            });
            await markJobAsAbortedOrRemoveFromDatabase(id);
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
            this.removeDurationEstimate(queueId, id);
          }

          return;
        }

        await incrementJobAttemptInDatabase(id);

        if (error.name === 'FatalError') {
          this.logger.error(`Fatal error in ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
          this.emit('error', error);
          this.emit('fatalError', {
            id,
            queueId,
            error
          });
          this.jobIds.delete(id);
          this.removeAbortController(id, queueId);
          await this.abortQueue(queueId);
          return;
        }

        const retryDelay = await this.getRetryJobDelay(type, attempt, error);

        if (retryDelay === false) {
          this.logger.error(`Error in ${type} job #${id} in queue ${queueId} attempt ${attempt} with no additional attempts requested`);
          this.emit('error', error);
          this.emit('fatalError', {
            id,
            queueId,
            error
          });
          this.jobIds.delete(id);
          this.removeAbortController(id, queueId);
          await this.abortQueue(queueId);
          return;
        }

        this.logger.error(`Error in ${type} job #${id} in queue ${queueId} attempt ${attempt}, retrying ${retryDelay > 0 ? `in ${retryDelay}ms` : 'immediately'}`);
        this.emit('error', error);

        if (retryDelay > 0) {
          this.emit('retryDelay', {
            id,
            queueId,
            retryDelay
          });
          const newStartAfter = Date.now() + retryDelay;
          await markJobStartAfterInDatabase(id, newStartAfter);
          this.jobIds.delete(id);
          this.startErrorHandler(id, queueId, args, type, attempt, newStartAfter, true);
        } else {
          this.jobIds.delete(id);
          this.startErrorHandler(id, queueId, args, type, attempt, startAfter, true);
        }
      }
    };

    this.addToQueue(queueId, priority, autoStart, run);
    this.emit('dequeue', {
      id
    });
  }

  async handlePortMessage(event) {
    if (!(event instanceof MessageEvent)) {
      return;
    }

    const {
      data
    } = event;

    if (!data || typeof data !== 'object') {
      this.logger.warn('Invalid message data');
      this.logger.warnObject(event);
      return;
    }

    const {
      type,
      args
    } = data;

    if (typeof type !== 'string') {
      this.logger.warn('Unknown message type');
      this.logger.warnObject(event);
      return;
    }

    if (!Array.isArray(args)) {
      this.logger.warn('Unknown arguments type');
      this.logger.warnObject(event);
      return;
    }

    const port = this.port;

    switch (type) {
      case 'heartbeat':
        this.emit('heartbeat', ...args);
        return;

      case 'jobAdd':
        jobEmitter.emit('jobAdd', ...args);
        return;

      case 'jobDelete':
        jobEmitter.emit('jobDelete', ...args);
        return;

      case 'jobUpdate':
        jobEmitter.emit('jobUpdate', ...args);
        return;

      case 'jobsClear':
        jobEmitter.emit('jobsClear', ...args);
        return;

      default:
        break;
    }

    const [requestId, ...requestArgs] = args;

    if (typeof requestId !== 'number') {
      throw new Error('Request arguments should start with a requestId number');
    }

    switch (type) {
      case 'unlink':
        this.logger.warn('Unlinking worker interface');

        try {
          await this.stop();
          this.emit('unlinkComplete', requestId);
        } catch (error) {
          this.emit('unlinkError', requestId, error);
          this.logger.error('Unable to handle unlink message');
          this.emit('error', error);
        }

        if (port instanceof MessagePort) {
          port.onmessage = null;
          delete this.port;
        }

        break;

      case 'clear':
        try {
          await this.clear();
          this.emit('clearComplete', requestId);
        } catch (error) {
          this.emit('clearError', requestId, error);
          this.logger.error('Unable to handle clear message');
          this.emit('error', error);
        }

        break;

      case 'abortAndRemoveQueueJobsGreaterThanId':
        try {
          const [queueId, id] = requestArgs;

          if (typeof queueId !== 'string') {
            throw new Error(`Invalid "queueId" argument with type ${typeof queueId}, should be type string`);
          }

          if (typeof id !== 'number') {
            throw new Error(`Invalid "id" argument with type ${typeof id}, should be type number`);
          }

          await this.abortAndRemoveQueueJobsGreaterThanId(queueId, id);
          this.emit('abortAndRemoveQueueJobsGreaterThanIdComplete', requestId);
        } catch (error) {
          this.emit('abortAndRemoveQueueJobsGreaterThanIdError', requestId, error);
          this.logger.error('Unable to handle abort and remove queue jobs greater than ID message');
          this.emit('error', error);
        }

        break;

      case 'abortAndRemoveQueue':
        try {
          const [queueId] = requestArgs;

          if (typeof queueId !== 'string') {
            throw new Error(`Invalid "queueId" argument with type ${typeof queueId}, should be type string`);
          }

          await this.abortAndRemoveQueue(queueId);
          this.emit('abortAndRemoveQueueComplete', requestId);
        } catch (error) {
          this.emit('abortAndRemoveQueueError', requestId, error);
          this.logger.error('Unable to handle abort and remove queue message');
          this.emit('error', error);
        }

        break;

      case 'updateDurationEstimates':
        try {
          await this.updateDurationEstimates();
          this.emit('updateDurationEstimatesComplete', requestId);
        } catch (error) {
          this.emit('updateDurationEstimatesError', requestId, error);
          this.logger.error('Unable to handle update duration estimates message');
          this.emit('error', error);
        }

        break;

      case 'abortQueue':
        try {
          const [queueId] = requestArgs;

          if (typeof queueId !== 'string') {
            throw new Error(`Invalid "queueId" argument with type ${typeof queueId}, should be type string`);
          }

          await this.abortQueue(queueId);
          this.emit('abortQueueComplete', requestId);
        } catch (error) {
          this.emit('abortQueueError', requestId, error);
          this.logger.error('Unable to handle abort queue message');
          this.emit('error', error);
        }

        break;

      case 'retryQueue':
        try {
          const [queueId] = requestArgs;

          if (typeof queueId !== 'string') {
            throw new Error(`Invalid "queueId" argument with type ${typeof queueId}, should be type string`);
          }

          await this.retryQueue(queueId);
          this.emit('retryQueueComplete', requestId);
        } catch (error) {
          this.emit('retryQueueError', requestId, error);
          this.logger.error('Unable to handle retry queue message');
          this.emit('error', error);
        }

        break;

      case 'dequeue':
        try {
          await this.dequeue();
          this.emit('dequeueComplete', requestId);
        } catch (error) {
          this.emit('dequeueError', requestId, error);
          this.logger.error('Unable to handle dequeue message');
          this.emit('error', error);
        }

        break;

      case 'enableStartOnJob':
        try {
          this.enableStartOnJob();
          this.emit('enableStartOnJobComplete', requestId);
        } catch (error) {
          this.emit('enableStartOnJobError', requestId, error);
          this.logger.error('Unable to handle enableStartOnJob message');
          this.emit('error', error);
        }

        break;

      case 'disableStartOnJob':
        try {
          this.disableStartOnJob();
          this.emit('disableStartOnJobComplete', requestId);
        } catch (error) {
          this.emit('disableStartOnJobError', requestId, error);
          this.logger.error('Unable to handle disableStartOnJob message');
          this.emit('error', error);
        }

        break;

      case 'getQueueIds':
        try {
          const queueIds = await this.getQueueIds();
          this.emit('getQueuesComplete', requestId, [...queueIds]);
        } catch (error) {
          this.emit('getQueuesError', requestId, error);
          this.logger.error('Unable to handle getQueueIds message');
          this.emit('error', error);
        }

        break;

      case 'getDurationEstimate':
        try {
          const [queueId] = requestArgs;

          if (typeof queueId !== 'string') {
            throw new Error(`Invalid "queueId" argument with type ${typeof queueId}, should be type string`);
          }

          const values = await this.getDurationEstimate(queueId);
          this.emit('getDurationEstimateComplete', requestId, values);
        } catch (error) {
          this.emit('getDurationEstimateError', requestId, error);
          this.logger.error('Unable to handle get duration estimate message');
          this.emit('error', error);
        }

        break;

      case 'getCurrentJobType':
        try {
          const [queueId] = requestArgs;

          if (typeof queueId !== 'string') {
            throw new Error(`Invalid "queueId" argument with type ${typeof queueId}, should be type string`);
          }

          const currentJobType = this.getCurrentJobType(queueId);
          this.emit('getCurrentJobTypeComplete', requestId, currentJobType);
        } catch (error) {
          this.emit('getCurrentJobTypeError', requestId, error);
          this.logger.error('Unable to handle get current job type message');
          this.emit('error', error);
        }

        break;

      case 'runUnloadHandlers':
        try {
          await this.runUnloadHandlers();
          this.emit('runUnloadHandlersComplete', requestId);
        } catch (error) {
          this.emit('runUnloadHandlersError', requestId, error);
          this.logger.error('Unable to run unload handlers message');
          this.emit('error', error);
        }

        break;

      case 'idle':
        try {
          const [maxDuration, start] = requestArgs;

          if (typeof maxDuration !== 'number') {
            throw new Error(`Invalid "queueId" argument with type ${typeof maxDuration}, should be type number`);
          }

          if (typeof start !== 'number') {
            throw new Error(`Invalid "queueId" argument with type ${typeof start}, should be type number`);
          }

          await this.onIdle(maxDuration - (Date.now() - start));
          this.emit('idleComplete', requestId);
        } catch (error) {
          this.emit('idleError', requestId, error);
          this.logger.error('Unable to handle idle message');
          this.emit('error', error);
        }

        break;

      default:
        this.logger.warn(`Unknown worker interface message type ${type}`);
    }
  }

  async unloadClient() {
    this.logger.info('Detected client unload');
    const heartbeatExpiresTimestamp = this.heartbeatExpiresTimestamp;

    if (typeof heartbeatExpiresTimestamp !== 'number') {
      return;
    }

    clearTimeout(this.heartbeatExpiresTimeout);
    delete this.heartbeatExpiresTimestamp;
    const delay = heartbeatExpiresTimestamp - Date.now();

    if (delay > 0) {
      await new Promise(resolve => {
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          this.removeListener('heartbeat', handleHeartbeat);
          resolve();
        }, delay);

        const handleHeartbeat = () => {
          clearTimeout(timeout);
          this.removeListener('heartbeat', handleHeartbeat);
          resolve();
        };

        this.addListener('heartbeat', handleHeartbeat);
      });
    }

    if (typeof this.heartbeatExpiresTimestamp === 'number') {
      this.logger.info('Cancelling client unload, heartbeat detected');
      return;
    }

    this.logger.info('Unloading');
    await this.runUnloadHandlers();
    this.emit('unloadClient');
    await this.onIdle();
  }

  runUnloadHandlers() {
    return this.unloadQueue.add(async () => {
      const handleUnload = this.handleUnload;

      if (typeof handleUnload === 'function') {
        try {
          const unloadData = await getUnloadDataFromDatabase();
          await handleUnload(unloadData);
          await clearUnloadDataInDatabase();
        } catch (error) {
          this.logger.error('Error in unload handler');
          this.logger.errorStack(error);
        }
      }
    });
  }

  listenForServiceWorkerInterface() {
    let activeEmitCallback;
    let handleJobAdd;
    let handleJobDelete;
    let handleJobUpdate;
    let handleJobsClear;
    self.addEventListener('sync', event => {
      this.logger.info(`SyncManager event ${event.tag}${event.lastChance ? ', last chance' : ''}`);

      if (event.tag === 'syncManagerOnIdle') {
        this.logger.info('Starting SyncManager idle handler');
        this.emit('syncManagerOnIdle');
        event.waitUntil(this.onIdle().catch(error => {
          this.logger.error(`SyncManager event handler failed${event.lastChance ? ' on last chance' : ''}`);
          this.logger.errorStack(error);
        }));
      } else if (event.tag === 'unload') {
        this.logger.info('Starting SyncManager unload client handler');
        event.waitUntil(this.unloadClient().catch(error => {
          this.logger.error(`SyncManager event handler failed${event.lastChance ? ' on last chance' : ''}`);
          this.logger.errorStack(error);
        }));
      } else {
        this.logger.warn(`Received unknown SyncManager event tag ${event.tag}`);
      }
    });
    self.addEventListener('message', event => {
      if (!(event instanceof ExtendableMessageEvent)) {
        return;
      }

      const {
        data
      } = event;

      if (!data || typeof data !== 'object') {
        return;
      }

      const {
        type
      } = data;

      if (type !== 'BATTERY_QUEUE_WORKER_INITIALIZATION') {
        return;
      }

      if (!Array.isArray(event.ports)) {
        return;
      }

      const port = event.ports[0];

      if (!(port instanceof MessagePort)) {
        return;
      }

      this.emitCallbacks = this.emitCallbacks.filter(x => x !== activeEmitCallback);
      const previousPort = this.port;

      if (previousPort instanceof MessagePort) {
        this.logger.info('Closing previous worker interface');
        previousPort.close();
      }

      if (typeof handleJobAdd === 'function') {
        localJobEmitter.removeListener('jobAdd', handleJobAdd);
      }

      if (typeof handleJobDelete === 'function') {
        localJobEmitter.removeListener('jobDelete', handleJobDelete);
      }

      if (typeof handleJobUpdate === 'function') {
        localJobEmitter.removeListener('jobUpdate', handleJobUpdate);
      }

      if (typeof handleJobsClear === 'function') {
        localJobEmitter.removeListener('jobsClear', handleJobsClear);
      }

      port.onmessage = this.handlePortMessage.bind(this);

      handleJobAdd = (...args) => {
        port.postMessage({
          type: 'jobAdd',
          args
        });
      };

      handleJobDelete = (...args) => {
        port.postMessage({
          type: 'jobDelete',
          args
        });
      };

      handleJobUpdate = (...args) => {
        port.postMessage({
          type: 'jobUpdate',
          args
        });
      };

      handleJobsClear = (...args) => {
        port.postMessage({
          type: 'jobsClear',
          args
        });
      };

      localJobEmitter.addListener('jobAdd', handleJobAdd);
      localJobEmitter.addListener('jobDelete', handleJobDelete);
      localJobEmitter.addListener('jobUpdate', handleJobUpdate);
      localJobEmitter.addListener('jobsClear', handleJobsClear);

      const emitCallback = (t, args) => {
        port.postMessage({
          type: t,
          args
        });
      };

      activeEmitCallback = emitCallback;
      this.emitCallbacks.push(emitCallback);
      this.port = port;
      port.postMessage({
        type: 'BATTERY_QUEUE_WORKER_CONFIRMATION'
      });
      this.logger.info('Linked to worker interface');
    });
    self.addEventListener('messageerror', event => {
      this.logger.error('Service worker interface message error');
      this.logger.errorObject(event);
    });
  }

}
//# sourceMappingURL=queue.js.map