// @flow

import PQueue from 'p-queue';
import errorObjectParser from 'serialize-error';
import EventEmitter from 'events';
import type { Logger } from './logger';
import makeLogger from './logger';
import {
  clearDatabase,
  dequeueFromDatabase,
  incrementJobAttemptInDatabase,
  incrementCleanupAttemptInDatabase,
  markJobCompleteInDatabase,
  markJobPendingInDatabase,
  markJobErrorInDatabase,
  markJobCleanupInDatabase,
  markJobAbortedInDatabase,
  markJobStartAfterInDatabase,
  markCleanupStartAfterInDatabase,
  updateCleanupInDatabase,
  getCleanupFromDatabase,
  getJobFromDatabase,
  removePathFromCleanupDataInDatabase,
  markQueueForCleanupInDatabase,
  removeCleanupFromDatabase,
  JOB_PENDING_STATUS,
  JOB_ABORTED_STATUS,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_STATUS,
  JOB_COMPLETE_STATUS,
} from './database';
import { AbortError } from './errors';

const PRIORITY_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER / 2);

type HandlerFunction = (Array<any>, AbortSignal, (Object, number) => Promise<void>) => Promise<void>;
type CleanupFunction = (Object | void, Array<any>, Array<string> => Promise<void>) => Promise<void>;
type RetryDelayFunction = (number) => number;
type EmitCallback = (string, Array<any>) => void;

type Options = {
  logger?: Logger
};

export default class BatteryQueue extends EventEmitter {
  declare logger: Logger;
  declare dequeueQueue: PQueue;
  declare handlerMap: Map<string, Array<HandlerFunction>>;
  declare retryDelayMap: Map<string, (number) => number>;
  declare cleanupMap: Map<string, Array<CleanupFunction>>;
  declare queueMap: Map<string, PQueue>;
  declare abortControllerMap: Map<string, Map<number, AbortController>>;
  declare isClearing: boolean;
  declare onIdlePromise: Promise<void> | void;
  declare jobIds: Set<number>;
  declare emitCallbacks: Array<EmitCallback>;

  constructor(options?: Options = {}) {
    super();
    this.dequeueQueue = new PQueue({ concurrency: 1 });
    this.handlerMap = new Map();
    this.cleanupMap = new Map();
    this.retryDelayMap = new Map();
    this.queueMap = new Map();
    this.jobIds = new Set();
    this.abortControllerMap = new Map();
    this.isClearing = false;
    this.emitCallbacks = [];
    this.logger = options.logger || makeLogger('Battery Queue');
  }

  emit(type:string, ...args:Array<any>) {
    for (const emitCallback of this.emitCallbacks) {
      emitCallback(type, args);
    }
    return super.emit(type, ...args);
  }

  setRetryDelay(type:string, delayOrFunction:number | RetryDelayFunction) {
    if (typeof delayOrFunction === 'number') {
      this.retryDelayMap.set(type, () => delayOrFunction);
    } else if (typeof delayOrFunction === 'function') {
      this.retryDelayMap.set(type, delayOrFunction);
    } else {
      this.logger.error(`Unable to set retry delay for ${type}, unknown handler type ${typeof delayOrFunction}`);
    }
  }

  removeRetryDelay(type:string) {
    this.retryDelayMap.delete(type);
  }

  addHandler(type:string, handler: HandlerFunction) {
    const handlers = this.handlerMap.get(type) || [];
    handlers.push(handler);
    this.handlerMap.set(type, handlers);
  }

  removeHandler(type:string, handler: HandlerFunction) {
    const handlers = (this.handlerMap.get(type) || []).filter((f) => f !== handler);
    if (handlers.length > 0) {
      this.handlerMap.set(type, handlers);
    } else {
      this.handlerMap.delete(type);
    }
  }

  addCleanup(type:string, cleanup: CleanupFunction) {
    const cleanups = this.cleanupMap.get(type) || [];
    cleanups.push(cleanup);
    this.cleanupMap.set(type, cleanups);
  }

  removeCleanup(type:string, cleanup: CleanupFunction) {
    const cleanups = (this.cleanupMap.get(type) || []).filter((f) => f !== cleanup);
    if (cleanups.length > 0) {
      this.cleanupMap.set(type, cleanups);
    } else {
      this.cleanupMap.delete(type);
    }
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
            resolve();
          }, 5000);
          const handleClearing = () => {
            clearTimeout(timeout);
            this.removeListener('clearing', handleClearing);
            resolve();
          };
          this.addListener('clearing', handleClearing);
        });
      }
      if (newQueue.pending > 0 || newQueue.size > 0) {
        return;
      }
      this.queueMap.delete(queueId);
    });
  }

  async abortQueue(queueId: string) {
    this.logger.info(`Aborting queue ${queueId}`);
    // Changes:
    // * JOB_ERROR_STATUS -> JOB_CLEANUP_STATUS
    // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_STATUS
    // * JOB_PENDING_STATUS -> JOB_ABORTED_STATUS
    await markQueueForCleanupInDatabase(queueId);
    // Abort active jobs
    const queueAbortControllerMap = this.abortControllerMap.get(queueId);
    if (typeof queueAbortControllerMap !== 'undefined') {
      for (const abortController of queueAbortControllerMap.values()) {
        abortController.abort();
      }
    }
    this.abortControllerMap.delete(queueId);
  }

  dequeue():void | Promise<void> {
    if (this.dequeueQueue.size === 0) {
      // Add a subsequent dequeue
      this.dequeueQueue.add(this._dequeue.bind(this)); // eslint-disable-line no-underscore-dangle
    }
    return this.dequeueQueue.onIdle();
  }

  async _dequeue() { // eslint-disable-line consistent-return
    const jobs = await dequeueFromDatabase();
    const queueIds = new Set();
    for (const { id, queueId, args, type, status, attempt, maxAttempts, startAfter } of jobs) {
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
        this.startJob(id, queueId, args, type, attempt, maxAttempts, startAfter);
      } else if (status === JOB_ERROR_STATUS) {
        this.startErrorHandler(id, queueId, args, type);
      } else if (status === JOB_CLEANUP_STATUS) {
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

  async onIdle(maxDuration?: number = 5000) {
    if (typeof this.onIdlePromise === 'undefined') {
      this.onIdlePromise = (async () => {
        const timeout = Date.now() + maxDuration;
        while (true) {
          if (Date.now() > timeout) {
            this.logger.warn(`Idle timeout after ${maxDuration}ms`);
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
  }

  async runCleanups(id:number, queueId:string, args:Array<any>, type:string) {
    const removePathFromCleanupData = (path:Array<string>) => removePathFromCleanupDataInDatabase(id, path);
    const cleanups = this.cleanupMap.get(type);
    let hasFatalError = false;
    let hasError = false;
    let delayRetryErrorMs = 0;
    if (Array.isArray(cleanups)) {
      const cleanupJob = await getCleanupFromDatabase(id);
      if (typeof cleanupJob === 'undefined') {
        for (const cleanup of cleanups) {
          try {
            await cleanup({}, args, removePathFromCleanupData);
          } catch (error) {
            this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt 1 with 0 attempts remaining, no cleanup data found`);
            this.logger.errorStack(error);
            hasFatalError = true;
            hasError = true;
          }
        }
      } else {
        const { data, startAfter } = cleanupJob;
        const delay = startAfter - Date.now();
        if (delay > 0) {
          this.logger.warn(`Delaying retry of ${type} job #${id} cleanup in queue ${queueId} by ${delay}ms to ${new Date(startAfter).toLocaleString()}`);
          this.emit('delayCleanupRetry', { id, queueId, delay });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        for (const cleanup of cleanups) {
          try {
            await cleanup(data, args, removePathFromCleanupData);
          } catch (error) {
            const [attempt, maxAttempts] = await incrementCleanupAttemptInDatabase(id);
            hasError = true;
            if (error.name === 'FatalCleanupError') {
              hasFatalError = true;
              this.logger.error(`Fatal error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt}`);
              this.logger.errorStack(error);
            } else if (attempt >= maxAttempts) {
              hasFatalError = true;
              this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt} with no attempts remaining`);
              this.logger.errorStack(error);
            } else {
              this.logger.error(`Error in ${type} job #${id} cleanup in queue ${queueId} attempt ${attempt} with ${maxAttempts - attempt} ${maxAttempts - attempt === 1 ? 'attempt' : 'attempts'} remaining`);
              this.logger.errorStack(error);
              if (error.name === 'DelayRetryError') {
                delayRetryErrorMs = error.delay || 0;
              }
            }
          }
        }
      }
    } else {
      this.logger.warn(`No cleanup for job type ${type}`);
    }
    if (hasFatalError) {
      await removeCleanupFromDatabase(id);
      this.jobIds.delete(id);
      this.emit('fatalCleanupError', { id, queueId });
      return;
    } else if (hasError) {
      if (delayRetryErrorMs > 0) {
        const newStartAfter = Date.now() + delayRetryErrorMs;
        await markCleanupStartAfterInDatabase(id, newStartAfter);
      }
      this.emit('dequeueCleanup', { id });
      await this.runCleanups(id, queueId, args, type);
      return;
    }
    await removeCleanupFromDatabase(id);
    this.jobIds.delete(id);
    this.emit('cleanupComplete', { id });
  }

  startCleanup(id:number, queueId:string, args:Array<any>, type:string) {
    this.logger.info(`Adding ${type} cleanup job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET + id;
    const run = async () => {
      this.logger.info(`Starting ${type} cleanup job #${id} in queue ${queueId}`);
      await this.runCleanups(id, queueId, args, type);
      await markJobAbortedInDatabase(id);
    };
    this.addToQueue(queueId, priority, run);
    this.emit('dequeueCleanup', { id });
  }

  startErrorHandler(id:number, queueId:string, args:Array<any>, type:string) {
    this.logger.info(`Adding ${type} error handler job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET + id;
    const run = async () => {
      this.logger.info(`Starting ${type} error handler job #${id} in queue ${queueId}`);
      await this.runCleanups(id, queueId, args, type);
      const [attempt, maxAttempts] = await incrementJobAttemptInDatabase(id);
      if (attempt >= maxAttempts) {
        this.logger.warn(`Not retrying ${type} job #${id} in queue ${queueId} after ${maxAttempts} failed ${maxAttempts === 1 ? 'attempt' : 'attempts'}, cleaning up queue`);
        await markJobAbortedInDatabase(id);
        this.emit('fatalError', { queueId });
        await this.abortQueue(queueId);
      } else {
        await markJobPendingInDatabase(id);
        this.logger.info(`Retrying ${type} job #${id} in queue ${queueId}, ${maxAttempts - attempt} ${maxAttempts - attempt === 1 ? 'attempt' : 'attempts'} remaining`);
        this.emit('retry', { id });
      }
      await this.dequeue();
    };
    this.addToQueue(queueId, priority, run);
    this.emit('dequeueCleanup', { id });
  }

  async delayJobStart(id:number, queueId:string, type:string, signal: AbortSignal, startAfter: number) {
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
          reject(new AbortError('Aborted'));
        };
        signal.addEventListener('abort', handleAbort);
      });
    }
  }

  startJob(id:number, queueId:string, args:Array<any>, type:string, attempt:number, maxAttempts:number, startAfter: number) {
    this.logger.info(`Adding ${type} job #${id} to queue ${queueId}`);
    this.jobIds.add(id);
    const priority = PRIORITY_OFFSET - id;
    const abortController = this.getAbortController(id, queueId);
    const updateCleanupData = (data:Object, maxCleanupAttempts:number) => updateCleanupInDatabase(id, queueId, data, maxCleanupAttempts);
    const run = async () => {
      await this.delayJobStart(id, queueId, type, abortController.signal, startAfter);
      const attemptsRemaining = maxAttempts - attempt - 1;
      if (attemptsRemaining > 0) {
        this.logger.info(`Starting ${type} job #${id} in queue ${queueId} attempt ${attempt + 1} with ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining`);
      } else {
        this.logger.info(`Starting ${type} job #${id} in queue ${queueId} attempt ${attempt + 1} with no attempts remaining`);
      }
      const handlers = this.handlerMap.get(type);
      let hasError = false;
      let hasFatalError = false;
      let delayRetryErrorMs = 0;
      if (Array.isArray(handlers)) {
        for (const handler of handlers) {
          try {
            await handler(args, abortController.signal, updateCleanupData);
            if (abortController.signal.aborted) {
              throw new AbortError('Aborted');
            }
          } catch (error) {
            if (attemptsRemaining > 0) {
              this.logger.error(`Error in ${type} job #${id} in queue ${queueId} attempt ${attempt + 1} with ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining`);
            } else {
              this.logger.error(`Error in ${type} job #${id} in queue ${queueId} attempt ${attempt + 1} with no attempts remaining`);
            }
            this.logger.errorStack(error);
            hasError = true;
            if (error.name === 'FatalQueueError') {
              hasFatalError = true;
            }
            if (error.name === 'DelayRetryError') {
              delayRetryErrorMs = error.delay || 0;
            }
            break;
          }
        }
      } else {
        this.logger.warn(`No handler for job type ${type}`);
      }
      this.removeAbortController(id, queueId);
      this.jobIds.delete(id);
      if (!hasError) {
        // Rely on AbortController to prevent items in aborted queues from being marked as complete
        await markJobCompleteInDatabase(id);
        this.emit('complete', { id });
        return;
      }
      const job = await getJobFromDatabase(id);
      if (typeof job === 'undefined') {
        this.logger.error(`Unable to get ${type} job #${id} in queue ${queueId} following error`);
        return;
      }
      if (job.status === JOB_CLEANUP_STATUS) {
        throw new Error(`Found cleanup status for ${type} job #${id} in queue ${queueId} following error, this should not happen`);
      }
      if (job.status === JOB_COMPLETE_STATUS) {
        throw new Error(`Found complete status for ${type} job #${id} in queue ${queueId} following error, this should not happen`);
      }
      if (job.status === JOB_ERROR_STATUS) {
        throw new Error(`Found error status for ${type} job #${id} in queue ${queueId} following error, this should not happen`);
      }
      if (job.status === JOB_ABORTED_STATUS) {
        // Job was aborted while running
        this.logger.error(`Found aborted status for ${type} job #${id} in queue ${queueId} following error, starting cleanup`);
        await markJobErrorInDatabase(id);
      } else if (hasFatalError) {
        await markJobCleanupInDatabase(id);
        this.emit('fatalError', { queueId });
        await this.abortQueue(queueId);
      } else if (delayRetryErrorMs > 0) {
        const newStartAfter = Date.now() + delayRetryErrorMs;
        this.logger.warn(`Delaying retry of ${type} job #${id} in queue ${queueId} by ${delayRetryErrorMs}ms to ${new Date(newStartAfter).toLocaleString()} following DelayRetryError`);
        this.emit('delayRetry', { id, queueId, delay: delayRetryErrorMs });
        await markJobStartAfterInDatabase(id, newStartAfter);
        await markJobErrorInDatabase(id);
      } else {
        const retryDelayFunction = this.retryDelayMap.get(type);
        if (typeof retryDelayFunction === 'function') {
          const delayRetryMs = retryDelayFunction(attempt + 1);
          if (delayRetryMs > 0) {
            const newStartAfter = Date.now() + delayRetryMs;
            this.logger.warn(`Delaying retry of ${type} job #${id} in queue ${queueId} by ${delayRetryMs}ms to ${new Date(newStartAfter).toLocaleString()}`);
            this.emit('delayRetry', { id, queueId, delay: delayRetryMs });
            await markJobStartAfterInDatabase(id, newStartAfter);
          }
        }
        await markJobErrorInDatabase(id);
      }
      await this.dequeue();
    };
    this.addToQueue(queueId, priority, run);
    this.emit('dequeue', { id });
  }

  handleInitializationMessage(event:ExtendableMessageEvent) {
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
    port.postMessage({ type: 'BATTERY_QUEUE_WORKER_CONFIRMATION' });
    this.logger.info('Linked to interface');
    port.onmessage = this.handlePortMessage.bind(this);
    this.emitCallbacks.push((t:string, args:Array<any>) => {
      port.postMessage({ type: t, args });
    });
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
    const { type, value } = data;
    if (typeof type !== 'string') {
      this.logger.warn('Unknown message type');
      this.logger.warnObject(event);
      return;
    }
    if (value === null || typeof value !== 'object') {
      throw new Error('Message payload should be an object');
    }
    const { id } = value;
    if (typeof id !== 'number') {
      throw new Error('Message payload should include property id with type number');
    }
    switch (type) {
      case 'clear':
        try {
          await this.clear();
          this.emit('clearComplete', { id });
        } catch (error) {
          this.emit('clearError', { errorObject: errorObjectParser.serializeError(error), id });
          this.logger.error('Unable to handle clear message');
          this.logger.errorStack(error);
        }
        break;
      case 'abortQueue':
        try {
          const { queueId } = value;
          if (typeof queueId !== 'string') {
            throw new Error('Message abort queue payload should include property queueId with type string');
          }
          await this.abortQueue(queueId);
          this.emit('abortQueueComplete', { id });
        } catch (error) {
          this.emit('abortQueueError', { errorObject: errorObjectParser.serializeError(error), id });
          this.logger.error('Unable to handle abort queue message');
          this.logger.errorStack(error);
        }
        break;
      case 'dequeue':
        try {
          await this.dequeue();
          this.emit('dequeueComplete', { id });
        } catch (error) {
          this.emit('dequeueError', { errorObject: errorObjectParser.serializeError(error), id });
          this.logger.error('Unable to handle dequeue message');
          this.logger.errorStack(error);
        }
        break;
      case 'idle':
        try {
          const { maxDuration, start } = value;
          if (typeof maxDuration !== 'number') {
            throw new Error('Message idle payload should include property maxDuration with type number');
          }
          if (typeof start !== 'number') {
            throw new Error('Message idle payload should include property start with type number');
          }
          await this.onIdle(maxDuration - (Date.now() - start));
          this.emit('idleComplete', { id });
        } catch (error) {
          this.emit('idleError', { errorObject: errorObjectParser.serializeError(error), id });
          this.logger.error('Unable to handle idle message');
          this.logger.errorStack(error);
        }
        break;
      default:
        this.logger.warn(`Unknown worker interface message type ${type}`);
    }
  }

  listenForServiceWorkerInterface() {
    self.addEventListener('message', this.handleInitializationMessage.bind(this));
  }
}

