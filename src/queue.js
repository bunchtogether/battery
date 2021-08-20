// @flow

import PQueue from 'p-queue';
import EventEmitter from 'events';
import type { Logger } from './logger';
import makeLogger from './logger';
import type { Job } from './database';
import {
  jobEmitter,
  localJobEmitter,
  clearDatabase,
  dequeueFromDatabase,
  dequeueFromDatabaseNotIn,
  incrementJobAttemptInDatabase,
  incrementCleanupAttemptInDatabase,
  markJobCompleteInDatabase,
  markJobPendingInDatabase,
  markJobErrorInDatabase,
  markJobStartAfterInDatabase,
  markJobAsAbortedOrRemoveFromDatabase,
  markCleanupStartAfterInDatabase,
  updateCleanupValuesInDatabase,
  getCleanupFromDatabase,
  removePathFromCleanupDataInDatabase,
  getJobFromDatabase,
  markQueueForCleanupInDatabase,
  removeCleanupFromDatabase,
  restoreJobToDatabaseForCleanupAndRemove,
  JOB_PENDING_STATUS,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_STATUS,
  JOB_CLEANUP_AND_REMOVE_STATUS,
} from './database';
import { AbortError } from './errors';

const PRIORITY_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER / 2);

type HandlerFunction = (Array<any>, AbortSignal, (Object) => Promise<void>) => Promise<void>;
type CleanupFunction = (Object | void, Array<any>, Array<string> => Promise<void>) => Promise<void>;
type RetryDelayFunction = (number, Error) => number | false | Promise<number | false>;
type EmitCallback = (string, Array<any>) => void;

type Options = {
  logger?: Logger,
  startOnJob?: boolean
};

export default class BatteryQueue extends EventEmitter {
  declare logger: Logger;
  declare dequeueQueue: PQueue;
  declare handlerMap: Map<string, HandlerFunction>;
  declare retryJobDelayMap: Map<string, RetryDelayFunction>;
  declare retryCleanupDelayMap: Map<string, RetryDelayFunction>;
  declare cleanupMap: Map<string, CleanupFunction>;
  declare queueMap: Map<string, PQueue>;
  declare abortControllerMap: Map<string, Map<number, AbortController>>;
  declare isClearing: boolean;
  declare onIdlePromise: Promise<void> | void;
  declare jobIds: Set<number>;
  declare emitCallbacks: Array<EmitCallback>;
  declare port: MessagePort | void;
  declare handleJobAdd: void | () => void;
  declare handleJobUpdate: void | (number, string, string, number) => void;
  declare handleJobDelete: void | (number, string) => void;

  constructor(options?: Options = {}) {
    super();
    this.dequeueQueue = new PQueue({ concurrency: 1 });
    this.handlerMap = new Map();
    this.cleanupMap = new Map();
    this.retryJobDelayMap = new Map();
    this.retryCleanupDelayMap = new Map();
    this.queueMap = new Map();
    this.jobIds = new Set();
    this.abortControllerMap = new Map();
    this.isClearing = false;
    this.emitCallbacks = [];
    this.logger = options.logger || makeLogger('Battery Queue');
    this.addListener('error', (error) => {
      this.logger.errorStack(error);
    });
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
    const handleJobDelete = (id:number, queueId:string) => {
      if (this.jobIds.has(id)) {
        const queueAbortControllerMap = this.abortControllerMap.get(queueId);
        if (typeof queueAbortControllerMap !== 'undefined') {
          const abortController = queueAbortControllerMap.get(id);
          if (typeof abortController !== 'undefined') {
            abortController.abort();
          }
        }
      }
    };
    jobEmitter.addListener('jobDelete', handleJobDelete);
    this.handleJobDelete = handleJobDelete;

    const handleJobUpdate = (id:number, queueId:string, type:string, status:number) => {
      if (status !== JOB_CLEANUP_AND_REMOVE_STATUS) {
        return;
      }
      if (this.jobIds.has(id)) {
        const queueAbortControllerMap = this.abortControllerMap.get(queueId);
        if (typeof queueAbortControllerMap !== 'undefined') {
          const abortController = queueAbortControllerMap.get(id);
          if (typeof abortController !== 'undefined') {
            abortController.abort();
          }
        }
        return;
      }
      getJobFromDatabase(id).then((job:Job | void) => {
        if (typeof job === 'undefined') {
          this.logger.error(`Unable to cleanup and remove ${type} job #${id} in queue ${queueId}, job does not exist`);
          return;
        }
        if (this.jobIds.has(id)) {
          return;
        }
        const { args } = job;
        console.log('START CLEANUP');
        this.startCleanup(id, queueId, args, type);
      }).catch((error) => {
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

  emit(type:string, ...args:Array<any>) {
    for (const emitCallback of this.emitCallbacks) {
      emitCallback(type, args);
    }
    return super.emit(type, ...args);
  }

  async getQueueIds() {
    await this.dequeue();
    const queueIds:Set<string> = new Set(this.queueMap.keys());
    return queueIds;
  }

  setRetryJobDelay(type:string, retryJobDelayFunction:RetryDelayFunction) {
    if (this.retryJobDelayMap.has(type)) {
      throw new Error(`Retry job delay handler for type "${type}" already exists`);
    }
    this.retryJobDelayMap.set(type, retryJobDelayFunction);
  }

  removeRetryJobDelay(type:string) {
    if (!this.retryJobDelayMap.has(type)) {
      throw new Error(`Retry job delay handler for type "${type}" does not exist`);
    }
    this.retryJobDelayMap.delete(type);
  }

  async getRetryJobDelay(type:string, attempt: number, error:Error) {
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

  setRetryCleanupDelay(type:string, retryCleanupDelayFunction:RetryDelayFunction) {
    if (this.retryCleanupDelayMap.has(type)) {
      throw new Error(`Retry cleanup delay handler for type "${type}" already exists`);
    }
    this.retryCleanupDelayMap.set(type, retryCleanupDelayFunction);
  }

  removeRetryCleanupDelay(type:string) {
    if (!this.retryCleanupDelayMap.has(type)) {
      throw new Error(`Retry cleanup delay handler for type "${type}" does not exist`);
    }
    this.retryCleanupDelayMap.delete(type);
  }

  async getRetryCleanupDelay(type:string, attempt: number, error:Error) {
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

  setHandler(type:string, handler: HandlerFunction) {
    if (this.handlerMap.has(type)) {
      throw new Error(`Handler for type "${type}" already exists`);
    }
    this.handlerMap.set(type, handler);
  }

  removeHandler(type:string) {
    if (!this.handlerMap.has(type)) {
      throw new Error(`Handler for type "${type}" does not exist`);
    }
    this.handlerMap.delete(type);
  }

  setCleanup(type:string, cleanup: CleanupFunction) {
    if (this.cleanupMap.has(type)) {
      throw new Error(`Cleanup for type "${type}" already exists`);
    }
    this.cleanupMap.set(type, cleanup);
  }

  removeCleanup(type:string) {
    if (!this.cleanupMap.has(type)) {
      throw new Error(`Cleanup for type "${type}" does not exist`);
    }
    this.cleanupMap.delete(type);
  }

  async clear() {
    this.isClearing = true;
    await this.onIdle();
    this.emit('clearing');
    await clearDatabase();
    this.dequeueQueue.start();
    this.isClearing = false;
  }

  addToQueue(queueId:string, priority: number, func: () => Promise<void>) {
    const queue = this.queueMap.get(queueId);
    if (typeof queue !== 'undefined') {
      queue.add(func, { priority });
      return;
    }
    const newQueue = new PQueue({ concurrency: 1, autoStart: false });
    this.queueMap.set(queueId, newQueue);
    newQueue.add(func, { priority });
    newQueue.on('idle', async () => {
      if (!this.isClearing) {
        await new Promise((resolve) => {
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

  async abortQueue(queueId: string) {
    this.logger.info(`Aborting queue ${queueId}`);
    // Abort active jobs
    const queueAbortControllerMap = this.abortControllerMap.get(queueId);
    if (typeof queueAbortControllerMap !== 'undefined') {
      for (const abortController of queueAbortControllerMap.values()) {
        abortController.abort();
      }
    }
    // Changes:
    // * JOB_ERROR_STATUS -> JOB_CLEANUP_STATUS
    // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_STATUS
    // * JOB_PENDING_STATUS -> JOB_ABORTED_STATUS
    const jobs = await markQueueForCleanupInDatabase(queueId);
    await this.startJobs(jobs);
  }

  dequeue():void | Promise<void> {
    if (this.dequeueQueue.size === 0) {
      // Add a subsequent dequeue
      this.dequeueQueue.add(this.startJobs.bind(this));
    }
    return this.dequeueQueue.onIdle();
  }

  async startJobs(newJobs?:Array<Job>) { // eslint-disable-line consistent-return
    const jobs = Array.isArray(newJobs) ? newJobs : await dequeueFromDatabaseNotIn([...this.jobIds.keys()]);
    const queueIds = new Set();
    for (const { id, queueId, args, type, status, attempt, startAfter } of jobs) {
      if (this.jobIds.has(id)) {
        continue;
      }
      // Pause queues before adding items into them to avoid starting things out of priority
      if (!queueIds.has(queueId)) {
        const queue = this.queueMap.get(queueId);
        if (typeof queue !== 'undefined') {
          queue.pause();
        }
        queueIds.add(queueId);
      }
      if (status === JOB_PENDING_STATUS) {
        this.startJob(id, queueId, args, type, attempt + 1, startAfter);
      } else if (status === JOB_ERROR_STATUS) {
        this.startErrorHandler(id, queueId, args, type, attempt, startAfter);
      } else if (status === JOB_CLEANUP_STATUS) {
        this.startCleanup(id, queueId, args, type);
      } else if (status === JOB_CLEANUP_AND_REMOVE_STATUS) {
        this.startCleanup(id, queueId, args, type);
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

  async onIdle(maxDuration?: number) {
    if (typeof this.onIdlePromise === 'undefined') {
      this.onIdlePromise = (async () => {
        const timeout = typeof maxDuration === 'number' ? Date.now() + maxDuration : -1;
        const start = Date.now();
        while (true) { // eslint-disable-line no-constant-condition
          if (timeout !== -1 && Date.now() > timeout) {
            this.logger.warn(`Idle timeout after ${Date.now() - start}ms`);
            break;
          }
          await this.dequeueQueue.onIdle();
          for (const [queueId, queue] of this.queueMap) {
            const interval = setInterval(() => {
              this.logger.info(`Waiting on queue ${queueId}`);
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

  getAbortController(id:number, queueId:string) {
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

  removeAbortController(id:number, queueId:string) {
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

  async runCleanup(id:number, queueId:string, args:Array<any>, type:string) {
    this.emit('cleanupStart', { id });
    const cleanup = this.cleanupMap.get(type);
    if (typeof cleanup !== 'function') {
      this.logger.warn(`No cleanup for job type ${type}`);
      await removeCleanupFromDatabase(id);
      this.emit('cleanup', { id });
      return;
    }
    const cleanupJob = await getCleanupFromDatabase(id);
    const { data, startAfter } = typeof cleanupJob === 'undefined' ? { data: undefined, startAfter: 0 } : cleanupJob;
    const delay = startAfter - Date.now();
    if (delay > 0) {
      this.logger.info(`Delaying retry of ${type} job #${id} cleanup in queue ${queueId} by ${delay}ms to ${new Date(startAfter).toLocaleString()}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      await cleanup(data, args, (path:Array<string>) => removePathFromCleanupDataInDatabase(id, path));
    } catch (error) {
      const attempt = await incrementCleanupAttemptInDatabase(id, queueId);
      if (error.name === 'FatalCleanupError') {
        this.logger.error(`Fatal error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt}`);
        this.emit('error', error);
        await removeCleanupFromDatabase(id);
        this.emit('fatalCleanupError', { id, queueId });
        return;
      }
      const retryCleanupDelay = await this.getRetryCleanupDelay(type, attempt, error);
      if (retryCleanupDelay === false) {
        this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt} with no additional attempts requested`);
        this.emit('error', error);
        await removeCleanupFromDatabase(id);
        this.emit('fatalCleanupError', { id, queueId });
        return;
      }
      this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt}, retrying ${retryCleanupDelay > 0 ? `in ${retryCleanupDelay}ms'}` : 'immediately'}`);
      this.emit('error', error);
      if (retryCleanupDelay > 0) {
        this.emit('retryCleanupDelay', { id, queueId, retryCleanupDelay });
        const newStartAfter = Date.now() + retryCleanupDelay;
        await markCleanupStartAfterInDatabase(id, newStartAfter);
      }
      await this.runCleanup(id, queueId, args, type);
      return;
    }
    await removeCleanupFromDatabase(id);
    this.emit('cleanup', { id });
  }

  startCleanup(id:number, queueId:string, args:Array<any>, type:string) {
    this.logger.info(`Adding ${type} cleanup job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET + id;
    const run = async () => {
      this.logger.info(`Starting ${type} cleanup #${id} in queue ${queueId}`);
      await this.runCleanup(id, queueId, args, type);
      // Job could be marked for removal while cleanup is running
      await markJobAsAbortedOrRemoveFromDatabase(id);
      this.jobIds.delete(id);
    };
    this.addToQueue(queueId, priority, run);
  }

  startErrorHandler(id:number, queueId:string, args:Array<any>, type:string, attempt: number, startAfter: number) {
    this.logger.info(`Adding ${type} error handler job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET + id;
    const abortController = this.getAbortController(id, queueId);
    const run = async () => {
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
        this.emit('retry', { id });
        this.startJob(id, queueId, args, type, attempt + 1, startAfter);
      }
    };
    this.addToQueue(queueId, priority, run);
  }

  async delayJobStart(id:number, queueId:string, type:string, signal: AbortSignal, startAfter: number) {
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

  startJob(id:number, queueId:string, args:Array<any>, type:string, attempt:number, startAfter: number) {
    this.logger.info(`Adding ${type} job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET - id;
    const updateCleanupData = (data:Object) => updateCleanupValuesInDatabase(id, queueId, data);
    const abortController = this.getAbortController(id, queueId);
    const run = async () => {
      if (abortController.signal.aborted) {
        this.emit('fatalError', { id, queueId, error: new AbortError(`Queue ${queueId} was aborted`) });
        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
        return;
      }
      this.logger.info(`Starting ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
      const handler = this.handlerMap.get(type);
      if (typeof handler !== 'function') {
        this.logger.warn(`No handler for job type ${type}`);
        await markJobCompleteInDatabase(id);
        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
        return;
      }
      let handlerDidRun = false;
      try {
        // Mark as error in database so the job is cleaned up and retried if execution
        // stops before job completion or error.
        await markJobErrorInDatabase(id);
        await this.delayJobStart(id, queueId, type, abortController.signal, startAfter);
        handlerDidRun = true;
        await handler(args, abortController.signal, updateCleanupData);
        if (abortController.signal.aborted) {
          console.log('caught aborted');
          throw new AbortError(`Queue ${queueId} was aborted`);
        }
        await markJobCompleteInDatabase(id);
        this.removeAbortController(id, queueId);
        this.jobIds.delete(id);
        return;
      } catch (error) {
        if (error.name === 'JobDoesNotExistError') {
          this.logger.error(`Job does not exist error for ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
          if (handlerDidRun) {
            await restoreJobToDatabaseForCleanupAndRemove(id, queueId, type, args);
            this.emit('fatalError', { id, queueId, error });
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
            this.startCleanup(id, queueId, args, type);
          } else {
            this.emit('fatalError', { id, queueId, error });
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
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
            this.emit('fatalError', { id, queueId, error });
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
            this.startCleanup(id, queueId, args, type);
          } else {
            await markJobAsAbortedOrRemoveFromDatabase(id);
            this.emit('fatalError', { id, queueId, error });
            this.jobIds.delete(id);
            this.removeAbortController(id, queueId);
          }
          return;
        }
        await incrementJobAttemptInDatabase(id);
        if (error.name === 'FatalError') {
          this.logger.error(`Fatal error in ${type} job #${id} in queue ${queueId} attempt ${attempt}`);
          this.emit('error', error);
          this.emit('fatalError', { id, queueId, error });
          this.jobIds.delete(id);
          this.removeAbortController(id, queueId);
          await this.abortQueue(queueId);
          return;
        }
        const retryDelay = await this.getRetryJobDelay(type, attempt, error);
        if (retryDelay === false) {
          this.logger.error(`Error in ${type} job #${id} in queue ${queueId} attempt ${attempt} with no additional attempts requested`);
          this.emit('error', error);
          this.emit('fatalError', { id, queueId, error });
          this.jobIds.delete(id);
          this.removeAbortController(id, queueId);
          await this.abortQueue(queueId);
          return;
        }
        this.logger.error(`Error in ${type} job #${id} in queue ${queueId} attempt ${attempt}, retrying ${retryDelay > 0 ? `in ${retryDelay}ms'}` : 'immediately'}`);
        this.emit('error', error);
        if (retryDelay > 0) {
          this.emit('retryDelay', { id, queueId, retryDelay });
          const newStartAfter = Date.now() + retryDelay;
          await markJobStartAfterInDatabase(id, newStartAfter);
          this.jobIds.delete(id);
          this.startErrorHandler(id, queueId, args, type, attempt, newStartAfter);
        } else {
          this.jobIds.delete(id);
          this.startErrorHandler(id, queueId, args, type, attempt, startAfter);
        }
      }
    };
    this.addToQueue(queueId, priority, run);
    this.emit('dequeue', { id });
  }

  async handlePortMessage(event:MessageEvent) {
    if (!(event instanceof MessageEvent)) {
      return;
    }
    const { data } = event;
    if (!data || typeof data !== 'object') {
      this.logger.warn('Invalid message data');
      this.logger.warnObject(event);
      return;
    }
    const { type, args } = data;
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
      case 'unlink':
        this.logger.warn('Unlinking worker interface');
        if (port instanceof MessagePort) {
          port.onmessage = null;
          delete this.port;
        }
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

  listenForServiceWorkerInterface() {
    let activeEmitCallback;
    let handleJobAdd;
    let handleJobDelete;
    let handleJobUpdate;
    let handleJobsClear;

    self.addEventListener('sync', (event) => {
      this.logger.info(`SyncManager event ${event.tag}${event.lastChance ? ', last chance' : ''}`);
      if (event.tag === 'syncManagerOnIdle') {
        this.logger.info('Starting SyncManager handler');
        this.emit('syncManagerOnIdle');
        event.waitUntil(this.onIdle().catch((error) => {
          this.logger.error(`SyncManager event handler failed${event.lastChance ? ' on last chance' : ''}`);
          this.logger.errorStack(error);
        }));
      } else {
        this.logger.warn(`Received unknown SyncManager event tag ${event.tag}`);
      }
    });

    self.addEventListener('message', (event:ExtendableMessageEvent) => {
      if (!(event instanceof ExtendableMessageEvent)) {
        return;
      }
      const { data } = event;
      if (!data || typeof data !== 'object') {
        return;
      }
      const { type } = data;
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
      this.emitCallbacks = this.emitCallbacks.filter((x) => x !== activeEmitCallback);
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
      port.postMessage({ type: 'BATTERY_QUEUE_WORKER_CONFIRMATION' });
      this.logger.info('Linked to worker interface');
      port.onmessage = this.handlePortMessage.bind(this);

      handleJobAdd = (...args:Array<any>) => {
        port.postMessage({ type: 'jobAdd', args });
      };
      handleJobDelete = (...args:Array<any>) => {
        port.postMessage({ type: 'jobDelete', args });
      };
      handleJobUpdate = (...args:Array<any>) => {
        port.postMessage({ type: 'jobUpdate', args });
      };
      handleJobsClear = (...args:Array<any>) => {
        port.postMessage({ type: 'jobsClear', args });
      };
      localJobEmitter.addListener('jobAdd', handleJobAdd);
      localJobEmitter.addListener('jobDelete', handleJobDelete);
      localJobEmitter.addListener('jobUpdate', handleJobUpdate);
      localJobEmitter.addListener('jobsClear', handleJobsClear);
      const emitCallback = (t:string, args:Array<any>) => {
        port.postMessage({ type: t, args });
      };
      activeEmitCallback = emitCallback;
      this.emitCallbacks.push(emitCallback);
      this.port = port;
    });
    self.addEventListener('messageerror', (event:MessageEvent) => {
      this.logger.error('Service worker interface message error');
      this.logger.errorObject(event);
    });
  }
}

