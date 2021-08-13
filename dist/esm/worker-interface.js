import EventEmitter from 'events';
import makeLogger from './logger';
import { jobEmitter, localJobEmitter } from './database';
export default class BatteryQueueServiceWorkerInterface extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = options.logger || makeLogger('Battery Queue Worker Interface'); // This is a no-op to prevent errors from being thrown in the browser context.
    // Errors are logged in the worker.

    this.on('error', () => {});
  }

  getController() {
    const controller = navigator && navigator.serviceWorker && navigator.serviceWorker.controller;

    if (controller instanceof ServiceWorker) {
      return controller;
    }

    throw new Error('Service worker controller does not exist');
  }

  async link() {
    if (this.port instanceof MessagePort) {
      return this.port;
    }

    const serviceWorker = navigator && navigator.serviceWorker;

    if (!serviceWorker) {
      throw new Error('Service worker not available');
    }

    await serviceWorker.ready;
    const messageChannel = new MessageChannel();
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        messageChannel.port1.onmessage = null;
        reject(new Error('Unable to link to service worker'));
      }, 1000);

      messageChannel.port1.onmessage = event => {
        if (!(event instanceof MessageEvent)) {
          return;
        }

        const {
          data
        } = event;

        if (!data || typeof data !== 'object') {
          this.logger.warn('Unknown message type');
          this.logger.warnObject(event);
          return;
        }

        const {
          type
        } = data;

        if (typeof type !== 'string') {
          this.logger.warn('Unknown message type');
          this.logger.warnObject(event);
          return;
        }

        if (type === 'BATTERY_QUEUE_WORKER_CONFIRMATION') {
          clearTimeout(timeout);
          resolve();
        }
      };

      const controller = this.getController(); // $FlowFixMe

      controller.postMessage({
        type: 'BATTERY_QUEUE_WORKER_INITIALIZATION'
      }, [messageChannel.port2]);
    });

    messageChannel.port1.onmessage = event => {
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

      const queueIds = this.queueIds;

      switch (type) {
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

        case 'queueActive':
          if (queueIds instanceof Set) {
            const queueId = args[0];

            if (typeof queueId === 'string') {
              queueIds.add(queueId);
            }
          }

          break;

        case 'queueInactive':
          if (queueIds instanceof Set) {
            const queueId = args[0];

            if (typeof queueId === 'string') {
              queueIds.delete(queueId);

              if (queueIds.size === 0) {
                delete this.queueIds;
              }
            }
          }

          break;

        default:
          break;
      }

      this.emit(type, ...args);
    };

    const port = messageChannel.port1;

    const handleJobAdd = (...args) => {
      port.postMessage({
        type: 'jobAdd',
        args
      });
    };

    const handleJobDelete = (...args) => {
      port.postMessage({
        type: 'jobDelete',
        args
      });
    };

    const handleJobUpdate = (...args) => {
      port.postMessage({
        type: 'jobUpdate',
        args
      });
    };

    const handleJobsClear = (...args) => {
      port.postMessage({
        type: 'jobsClear',
        args
      });
    };

    localJobEmitter.addListener('jobAdd', handleJobAdd);
    localJobEmitter.addListener('jobDelete', handleJobDelete);
    localJobEmitter.addListener('jobUpdate', handleJobUpdate);
    localJobEmitter.addListener('jobsClear', handleJobsClear);
    this.port = messageChannel.port1;
    this.logger.info('Linked to worker');
    return messageChannel.port1;
  }

  async clear(maxDuration = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        reject(new Error(`Did not receive clear response within ${maxDuration}ms`));
      }, maxDuration);

      const handleClearComplete = responseId => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        resolve();
      };

      const handleClearError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        reject(error);
      };

      this.addListener('clearComplete', handleClearComplete);
      this.addListener('clearError', handleClearError);
      port.postMessage({
        type: 'clear',
        args: [requestId]
      });
    });
  }

  async abortQueue(queueId, maxDuration = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        reject(new Error(`Did not receive abort queue response within ${maxDuration}ms`));
      }, maxDuration);

      const handleAbortQueueComplete = responseId => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        resolve();
      };

      const handleAbortQueueError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        reject(error);
      };

      this.addListener('abortQueueComplete', handleAbortQueueComplete);
      this.addListener('abortQueueError', handleAbortQueueError);
      port.postMessage({
        type: 'abortQueue',
        args: [requestId, queueId]
      });
    });
  }

  async dequeue(maxDuration = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        reject(new Error(`Did not receive dequeue response within ${maxDuration}ms`));
      }, maxDuration);

      const handleDequeueComplete = responseId => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        resolve();
      };

      const handleDequeueError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        reject(error);
      };

      this.addListener('dequeueComplete', handleDequeueComplete);
      this.addListener('dequeueError', handleDequeueError);
      port.postMessage({
        type: 'dequeue',
        args: [requestId]
      });
    });
  }

  async onIdle(maxDuration = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        reject(new Error(`Did not receive idle response within ${maxDuration}ms`));
      }, maxDuration);

      const handleIdleComplete = responseId => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        resolve();
      };

      const handleIdleError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        reject(error);
      };

      this.addListener('idleComplete', handleIdleComplete);
      this.addListener('idleError', handleIdleError);
      port.postMessage({
        type: 'idle',
        args: [requestId, maxDuration, Date.now()]
      });
    });
  }

  async getQueueIds(maxDuration = 1000) {
    if (this.queueIds instanceof Set) {
      return this.queueIds;
    }

    const port = await this.link();
    const queueIds = await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('getQueuesComplete', handleGetQueuesComplete);
        this.removeListener('getQueuesError', handleGetQueuesError);
        reject(new Error(`Did not receive idle response within ${maxDuration}ms`));
      }, maxDuration);

      const handleGetQueuesComplete = (responseId, qIds) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('getQueuesComplete', handleGetQueuesComplete);
        this.removeListener('getQueuesError', handleGetQueuesError);
        resolve(new Set(qIds));
      };

      const handleGetQueuesError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('getQueuesComplete', handleGetQueuesComplete);
        this.removeListener('getQueuesError', handleGetQueuesError);
        reject(error);
      };

      this.addListener('getQueuesComplete', handleGetQueuesComplete);
      this.addListener('getQueuesError', handleGetQueuesError);
      port.postMessage({
        type: 'getQueueIds',
        args: [requestId]
      });
    });

    if (queueIds.size > 0) {
      this.queueIds = queueIds;
    }

    return queueIds;
  }

}
//# sourceMappingURL=worker-interface.js.map