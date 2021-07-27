import PQueue from 'p-queue';
import { serializeError } from 'serialize-error';
import EventEmitter from 'events'; // import { serializeError, deserializeError } from 'serialize-error';

import makeLogger from './logger';
import { clearDatabase, dequeueFromDatabase, decrementAttemptsRemainingInDatabase, markOperationCompleteInDatabase, markOperationPendingInDatabase, markOperationErrorInDatabase, markOperationCleanupInDatabase, markOperationAbortedInDatabase, updateCleanupInDatabase, getCleanupFromDatabase, getOperationFromDatabase, removePathFromCleanupDataInDatabase, markQueueForCleanupInDatabase, removeCleanupFromDatabase, OPERATION_PENDING_STATUS, OPERATION_ABORTED_STATUS, OPERATION_ERROR_STATUS, OPERATION_CLEANUP_STATUS, OPERATION_COMPLETE_STATUS } from './database';
import { AbortError } from './errors';
const PRIORITY_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER / 2);
const logger = makeLogger('BatteryQueue');
export class BatteryQueue extends EventEmitter {
  constructor() {
    super();
    this.dequeueQueue = new PQueue({
      concurrency: 1
    });
    this.handlerMap = new Map();
    this.cleanupMap = new Map();
    this.retryDelayMap = new Map();
    this.queueMap = new Map();
    this.operationIds = new Set();
    this.abortControllerMap = new Map();
    this.isClearing = false;
    this.emitCallbacks = [];
  }

  emit(type, ...args) {
    for (const emitCallback of this.emitCallbacks) {
      emitCallback(type, args);
    }

    return super.emit(type, ...args);
  }

  setRetryDelay(type, delayOrFunction) {
    if (typeof delayOrFunction === 'number') {
      this.retryDelayMap.set(type, () => delayOrFunction);
    } else if (typeof delayOrFunction === 'function') {
      this.retryDelayMap.set(type, delayOrFunction);
    } else {
      logger.error(`Unable to set retry delay for ${type}, unknown handler type ${typeof delayOrFunction}`);
    }
  }

  addHandler(type, handler) {
    const handlers = this.handlerMap.get(type) || [];
    handlers.push(handler);
    this.handlerMap.set(type, handlers);
  }

  removeHandler(type, handler) {
    const handlers = (this.handlerMap.get(type) || []).filter(f => f !== handler);

    if (handlers.length > 0) {
      this.handlerMap.set(type, handlers);
    } else {
      this.handlerMap.delete(type);
    }
  }

  addCleanup(type, cleanup) {
    const cleanups = this.cleanupMap.get(type) || [];
    cleanups.push(cleanup);
    this.cleanupMap.set(type, cleanups);
  }

  removeCleanup(type, cleanup) {
    const cleanups = (this.cleanupMap.get(type) || []).filter(f => f !== cleanup);

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

  addToQueue(queueId, priority, func) {
    const queue = this.queueMap.get(queueId);

    if (typeof queue !== 'undefined') {
      queue.add(func, {
        priority
      });
      return;
    }

    const newQueue = new PQueue({
      concurrency: 1,
      autoStart: false
    });
    this.queueMap.set(queueId, newQueue);
    newQueue.add(func, {
      priority
    });
    newQueue.on('idle', async () => {
      if (!this.isClearing) {
        await new Promise(resolve => {
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

  async abortQueue(queueId) {
    logger.info(`Aborting queue ${queueId}`); // Changes:
    // * OPERATION_ERROR_STATUS -> OPERATION_CLEANUP_STATUS
    // * OPERATION_COMPLETE_STATUS -> OPERATION_CLEANUP_STATUS
    // * OPERATION_PENDING_STATUS -> OPERATION_ABORTED_STATUS

    await markQueueForCleanupInDatabase(queueId); // Abort active operations

    const queueAbortControllerMap = this.abortControllerMap.get(queueId);

    if (typeof queueAbortControllerMap !== 'undefined') {
      for (const abortController of queueAbortControllerMap.values()) {
        abortController.abort();
      }
    }

    this.abortControllerMap.delete(queueId);
  }

  dequeue() {
    if (this.dequeueQueue.size === 0) {
      // Add a subsequent dequeue
      this.dequeueQueue.add(this._dequeue.bind(this)); // eslint-disable-line no-underscore-dangle
    }

    return this.dequeueQueue.onIdle();
  }

  async _dequeue() {
    // eslint-disable-line consistent-return
    const operations = await dequeueFromDatabase();
    const queueIds = new Set();

    for (const {
      id,
      queueId,
      args,
      type,
      status,
      attemptsRemaining,
      startAfter
    } of operations) {
      // Pause queues before adding items into them to avoid starting things out of priority
      if (!queueIds.has(queueId)) {
        const queue = this.queueMap.get(queueId);

        if (typeof queue !== 'undefined') {
          queue.pause();
        }

        queueIds.add(queueId);
      }

      if (status === OPERATION_PENDING_STATUS) {
        this.startOperation(id, queueId, args, type, attemptsRemaining, startAfter);
      } else if (status === OPERATION_ERROR_STATUS) {
        this.startErrorHandler(id, queueId, args, type);
      } else if (status === OPERATION_CLEANUP_STATUS) {
        this.startCleanup(id, queueId, args, type);
      } else {
        throw new Error(`Unknown operation status ${status} in operation ${id} of queue ${queueId}`);
      }
    }

    for (const queueId of queueIds) {
      const queue = this.queueMap.get(queueId);

      if (typeof queue !== 'undefined') {
        queue.start();
      } else {
        logger.error(`Unable to start queue ${queueId} after dequeue; queue does not exist`);
      }
    }
  }

  async onIdle(maxDuration = 5000) {
    if (typeof this.onIdlePromise === 'undefined') {
      this.onIdlePromise = (async () => {
        const timeout = Date.now() + maxDuration;

        while (true) {
          if (Date.now() > timeout) {
            logger.warn(`Idle timeout after ${maxDuration}ms`);
            break;
          }

          await this.dequeueQueue.onIdle();

          for (const [queueId, queue] of this.queueMap) {
            const interval = setInterval(() => {
              logger.info(`Waiting on queue ${queueId}`);
            }, 250);
            await queue.onIdle();
            clearInterval(interval);
          }

          const operationsInterval = setInterval(() => {
            logger.info('Waiting on operations');
          }, 250);
          const operations = await dequeueFromDatabase();
          clearInterval(operationsInterval);

          if (operations.length > 0) {
            const interval = setInterval(() => {
              logger.info('Waiting on dequeue');
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
      logger.warn(`Abort controller map for ${id} in queue ${queueId} does not exist`);
      return;
    }

    const abortController = queueAbortControllerMap.get(id);

    if (typeof abortController === 'undefined') {
      logger.warn(`Abort controller for ${id} in queue ${queueId} does not exist`);
      return;
    }

    queueAbortControllerMap.delete(id);
  }

  startCleanup(id, queueId, args, type) {
    if (this.operationIds.has(id)) {
      logger.info(`Skipping active ${type} cleanup #${id} in queue ${queueId}`);
      return;
    }

    logger.info(`Adding ${type} cleanup operation #${id} to queue ${queueId}`);
    this.operationIds.add(id);
    const priority = PRIORITY_OFFSET + id;

    const removePathFromCleanupData = path => removePathFromCleanupDataInDatabase(id, queueId, path);

    const run = async () => {
      logger.info(`Starting ${type} cleanup operation #${id} in queue ${queueId}`);
      const cleanups = this.cleanupMap.get(type);

      if (Array.isArray(cleanups)) {
        const cleanupData = await getCleanupFromDatabase(id);

        for (const cleanup of cleanups) {
          await cleanup(cleanupData, args, removePathFromCleanupData);
        }
      } else {
        logger.warn(`No cleanup for operation type ${type}`);
      }

      await removeCleanupFromDatabase(id);
      this.operationIds.delete(id);
      this.emit('cleanup', {
        id
      });
      await markOperationAbortedInDatabase(id);
    };

    this.addToQueue(queueId, priority, run);
    this.emit('dequeueCleanup', {
      id
    });
  }

  startErrorHandler(id, queueId, args, type) {
    if (this.operationIds.has(id)) {
      logger.info(`Skipping active ${type} error handler operation #${id} in queue ${queueId}`);
      return;
    }

    logger.info(`Adding ${type} error handler operation #${id} to queue ${queueId}`);
    this.operationIds.add(id);
    const priority = PRIORITY_OFFSET + id;

    const removePathFromCleanupData = path => removePathFromCleanupDataInDatabase(id, queueId, path);

    const run = async () => {
      logger.info(`Starting ${type} error handler operation #${id} in queue ${queueId}`);
      const cleanups = this.cleanupMap.get(type);

      if (Array.isArray(cleanups)) {
        const cleanupData = await getCleanupFromDatabase(id);

        for (const cleanup of cleanups) {
          await cleanup(cleanupData, args, removePathFromCleanupData);
        }
      } else {
        logger.warn(`No cleanup for operation type ${type}`);
      }

      await removeCleanupFromDatabase(id);
      this.operationIds.delete(id);
      this.emit('cleanup', {
        id
      });
      const attemptsRemaining = await decrementAttemptsRemainingInDatabase(id);

      if (attemptsRemaining <= 0) {
        logger.warn(`Not retrying ${type} operation #${id} in queue ${queueId} after maximum failed attempts, cleaning up queue`);
        await markOperationAbortedInDatabase(id);
        this.emit('fatalError', {
          queueId
        });
        await this.abortQueue(queueId);
      } else {
        await markOperationPendingInDatabase(id);
        logger.info(`Retrying ${type} operation #${id} in queue ${queueId}, ${attemptsRemaining} attempts remaining`);
        this.emit('retry', {
          id
        });
      }

      await this.dequeue();
    };

    this.addToQueue(queueId, priority, run);
    this.emit('dequeueCleanup', {
      id
    });
  }

  async delayStart(id, queueId, type, signal, startAfter) {
    const duration = startAfter - Date.now();

    if (duration > 0) {
      logger.info(`Delaying start of ${type} operation #${id} in queue ${queueId} by ${duration}ms`);
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

  startOperation(id, queueId, args, type, attemptsRemaining, startAfter) {
    if (this.operationIds.has(id)) {
      logger.info(`Skipping active ${type} operation #${id} in queue ${queueId}`);
      return;
    }

    logger.info(`Adding ${type} operation #${id} to queue ${queueId}`);
    this.operationIds.add(id);
    const priority = PRIORITY_OFFSET - id;
    const abortController = this.getAbortController(id, queueId);

    const updateCleanupData = data => updateCleanupInDatabase(id, queueId, data);

    const run = async () => {
      await this.delayStart(id, queueId, type, abortController.signal, startAfter);
      logger.info(`Starting ${type} operation #${id} in queue ${queueId} with ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining`);
      const handlers = this.handlerMap.get(type);
      let hasError = false;
      let hasFatalError = false;

      if (Array.isArray(handlers)) {
        for (const handler of handlers) {
          try {
            await handler(args, abortController.signal, updateCleanupData);

            if (abortController.signal.aborted) {
              throw new AbortError('Aborted');
            }
          } catch (error) {
            logger.error(`Error in ${type} operation #${id} in queue ${queueId} with ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining`);
            logger.errorStack(error);
            hasError = true;

            if (error.name === 'FatalQueueError') {
              hasFatalError = true;
            }

            break;
          }
        }
      } else {
        logger.warn(`No handler for operation type ${type}`);
      }

      this.removeAbortController(id, queueId);
      this.operationIds.delete(id);

      if (!hasError) {
        // Rely on AbortController to prevent items in aborted queues from being marked as complete
        await markOperationCompleteInDatabase(id);
        this.emit('complete', {
          id
        });
        return;
      }

      const operation = await getOperationFromDatabase(id);

      if (typeof operation === 'undefined') {
        logger.error(`Unable to get ${type} operation #${id} in queue ${queueId} following error`);
        return;
      }

      if (operation.status === OPERATION_CLEANUP_STATUS) {
        throw new Error(`Found cleanup status for ${type} operation #${id} in queue ${queueId} following error, this should not happen`);
      }

      if (operation.status === OPERATION_COMPLETE_STATUS) {
        throw new Error(`Found complete status for ${type} operation #${id} in queue ${queueId} following error, this should not happen`);
      }

      if (operation.status === OPERATION_ERROR_STATUS) {
        throw new Error(`Found error status for ${type} operation #${id} in queue ${queueId} following error, this should not happen`);
      }

      if (operation.status === OPERATION_ABORTED_STATUS) {
        // Operation was aborted while running
        logger.error(`Found aborted status for ${type} operation #${id} in queue ${queueId} following error, starting cleanup`);
        await markOperationErrorInDatabase(id);
      } else if (hasFatalError) {
        await markOperationCleanupInDatabase(id);
        this.emit('fatalError', {
          queueId
        });
        await this.abortQueue(queueId);
      } else {
        await markOperationErrorInDatabase(id);
      }

      await this.dequeue();
    };

    this.addToQueue(queueId, priority, run);
    this.emit('dequeue', {
      id
    });
  }

  handleInitializationMessage(event) {
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

    port.postMessage({
      type: 'BATTERY_QUEUE_WORKER_CONFIRMATION'
    });
    logger.info('Linked to interface');
    port.onmessage = this.handlePortMessage.bind(this);
    this.emitCallbacks.push((t, args) => {
      port.postMessage({
        type: t,
        args
      });
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
      logger.warn('Invalid message data');
      logger.warnObject(event);
      return;
    }

    const {
      type,
      value
    } = data;

    if (typeof type !== 'string') {
      logger.warn('Unknown message type');
      logger.warnObject(event);
      return;
    }

    if (value === null || typeof value !== 'object') {
      throw new Error('Message payload should be an object');
    }

    const {
      id
    } = value;

    if (typeof id !== 'number') {
      throw new Error('Message payload should include property id with type number');
    }

    switch (type) {
      case 'clear':
        try {
          await this.clear();
          this.emit('clearComplete', {
            id
          });
        } catch (error) {
          this.emit('clearError', {
            errorObject: serializeError(error),
            id
          });
          logger.error('Unable to handle clear message');
          logger.errorStack(error);
        }

        break;

      case 'abortQueue':
        try {
          const {
            queueId
          } = value;

          if (typeof queueId !== 'string') {
            throw new Error('Message abort queue payload should include property queueId with type string');
          }

          await this.abortQueue(queueId);
          this.emit('abortQueueComplete', {
            id
          });
        } catch (error) {
          this.emit('abortQueueError', {
            errorObject: serializeError(error),
            id
          });
          logger.error('Unable to handle abort queue message');
          logger.errorStack(error);
        }

        break;

      case 'dequeue':
        try {
          await this.dequeue();
          this.emit('dequeueComplete', {
            id
          });
        } catch (error) {
          this.emit('dequeueError', {
            errorObject: serializeError(error),
            id
          });
          logger.error('Unable to handle dequeue message');
          logger.errorStack(error);
        }

        break;

      case 'idle':
        try {
          const {
            maxDuration,
            start
          } = value;

          if (typeof maxDuration !== 'number') {
            throw new Error('Message idle payload should include property maxDuration with type number');
          }

          if (typeof start !== 'number') {
            throw new Error('Message idle payload should include property start with type number');
          }

          await this.onIdle(maxDuration - (Date.now() - start));
          this.emit('idleComplete', {
            id
          });
        } catch (error) {
          this.emit('idleError', {
            errorObject: serializeError(error),
            id
          });
          logger.error('Unable to handle idle message');
          logger.errorStack(error);
        }

        break;

      default:
        logger.warn(`Unknown worker interface message type ${type}`);
    }
  }

  listenForServiceWorkerInterface() {
    self.addEventListener('message', this.handleInitializationMessage.bind(this));
  }

}
//# sourceMappingURL=queue.js.map