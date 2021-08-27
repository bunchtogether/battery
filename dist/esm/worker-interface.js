import EventEmitter from 'events';
import makeLogger from './logger';
import { jobEmitter, localJobEmitter } from './database';
const canUseSyncManager = 'serviceWorker' in navigator && 'SyncManager' in window;

class RedundantServiceWorkerError extends Error {}

export default class BatteryQueueServiceWorkerInterface extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = options.logger || makeLogger('Battery Queue Worker Interface'); // This is a no-op to prevent errors from being thrown in the browser context.
    // Errors are logged in the worker.

    this.on('error', () => {});
    this.isSyncing = false;
  }

  async getController() {
    const serviceWorker = navigator && navigator.serviceWorker;

    if (!serviceWorker) {
      throw new Error('Service worker not available');
    }

    await serviceWorker.ready;
    const {
      controller
    } = serviceWorker;

    if (!controller) {
      throw new Error('Service worker controller not available');
    }

    if (controller.state === 'redundant') {
      this.logger.warn('Service worker in redudant state, waiting for controller change');
      await new Promise(resolve => {
        const timeout = setTimeout(() => {
          serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        }, 5000);

        const handleControllerChange = () => {
          clearTimeout(timeout);
          serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        };

        serviceWorker.addEventListener('controllerchange', handleControllerChange);
      });
      return this.getController();
    }

    return controller;
  }

  async link() {
    if (this.port instanceof MessagePort) {
      return this.port;
    }

    const controller = await this.getController();
    const messageChannel = new MessageChannel();
    const port = messageChannel.port1;

    const handleStateChange = () => {
      this.logger.warn(`Service worker state change to ${controller.state}`);

      if (controller.state !== 'redundant') {
        return;
      }

      this.logger.warn('Unlinking');

      try {
        port.postMessage({
          type: 'unlink',
          args: []
        });
      } catch (error) {
        this.logger.error('Error while posting unlink message to redundant service worker');
        this.logger.errorStack(error);
      }

      try {
        messageChannel.port1.close();
        messageChannel.port2.close();
      } catch (error) {
        this.logger.error('Error while closing MessageChannel ports with redundant service worker');
        this.logger.errorStack(error);
      }

      messageChannel.port1.onmessage = null;
      delete this.port;
      this.emit('unlink');
      self.queueMicrotask(() => {
        this.link().catch(error => {
          this.logger.error('Unable to re-link service worker');
          this.logger.errorStack(error);
        });
      });
    };

    controller.addEventListener('statechange', handleStateChange);

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          messageChannel.port1.onmessage = null;
          controller.removeEventListener('statechange', handleStateChange);
          controller.removeEventListener('statechange', handleStateChangeBeforeLink);
          reject(new Error('Unable to link to service worker'));
        }, 1000);

        const handleStateChangeBeforeLink = () => {
          if (controller.state !== 'redundant') {
            return;
          }

          clearTimeout(timeout);
          controller.removeEventListener('statechange', handleStateChangeBeforeLink);
          reject(new RedundantServiceWorkerError('Service worker in redundant state'));
        };

        controller.addEventListener('statechange', handleStateChangeBeforeLink);

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
            controller.removeEventListener('statechange', handleStateChangeBeforeLink);
            resolve();
          }
        }; // $FlowFixMe


        controller.postMessage({
          type: 'BATTERY_QUEUE_WORKER_INITIALIZATION'
        }, [messageChannel.port2]);
      });
    } catch (error) {
      if (error instanceof RedundantServiceWorkerError) {
        return messageChannel.port1;
      }

      controller.removeEventListener('statechange', handleStateChange);
      throw error;
    }

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
    this.emit('link');
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

  async enableStartOnJob(maxDuration = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleEnableStartOnJobError);
        reject(new Error(`Did not receive enableStartOnJob response within ${maxDuration}ms`));
      }, maxDuration);

      const handleEnableStartOnJobComplete = responseId => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleEnableStartOnJobError);
        resolve();
      };

      const handleEnableStartOnJobError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleEnableStartOnJobError);
        reject(error);
      };

      this.addListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);
      this.addListener('enableStartOnJobError', handleEnableStartOnJobError);
      port.postMessage({
        type: 'enableStartOnJob',
        args: [requestId]
      });
    });

    const handleJobAdd = () => {
      this.sync();
    };

    jobEmitter.addListener('jobAdd', handleJobAdd);
    this.handleJobAdd = handleJobAdd;
  }

  async disableStartOnJob(maxDuration = 1000) {
    const handleJobAdd = this.handleJobAdd;

    if (typeof handleJobAdd === 'function') {
      jobEmitter.removeListener('jobAdd', handleJobAdd);
    }

    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);
        this.removeListener('disableStartOnJobError', handledisableStartOnJobError);
        reject(new Error(`Did not receive disableStartOnJob response within ${maxDuration}ms`));
      }, maxDuration);

      const handledisableStartOnJobComplete = responseId => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);
        this.removeListener('disableStartOnJobError', handledisableStartOnJobError);
        resolve();
      };

      const handledisableStartOnJobError = (responseId, error) => {
        if (responseId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        this.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);
        this.removeListener('disableStartOnJobError', handledisableStartOnJobError);
        reject(error);
      };

      this.addListener('disableStartOnJobComplete', handledisableStartOnJobComplete);
      this.addListener('disableStartOnJobError', handledisableStartOnJobError);
      port.postMessage({
        type: 'disableStartOnJob',
        args: [requestId]
      });
    });
  }

  async sync() {
    if (!canUseSyncManager) {
      return;
    }

    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      await this.link();
      this.logger.info('Sending sync event');
      const serviceWorker = navigator && navigator.serviceWorker;

      if (!serviceWorker) {
        throw new Error('Service worker not available');
      }

      const registration = await serviceWorker.ready; // $FlowFixMe

      registration.sync.register('syncManagerOnIdle');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.removeListener('syncManagerOnIdle', handleOnIdleSync);
          reject(new Error('Unable to sync, did not receive syncManagerOnIdle acknowledgement'));
        }, 5000);

        const handleOnIdleSync = () => {
          clearTimeout(timeout);
          this.removeListener('syncManagerOnIdle', handleOnIdleSync);
          resolve();
        };

        this.addListener('syncManagerOnIdle', handleOnIdleSync);
      });
      await new Promise(resolve => {
        const handleIdle = () => {
          this.removeListener('idle', handleIdle);
          this.removeListener('unlink', handleUnlink);
          resolve();
        };

        const handleUnlink = () => {
          this.removeListener('idle', handleIdle);
          this.removeListener('unlink', handleUnlink);
          resolve();
        };

        this.addListener('idle', handleIdle);
        this.addListener('unlink', handleUnlink);
      });
    } catch (error) {
      this.logger.error('Unable to sync');
      this.emit('error', error);
      this.logger.errorStack(error);
    }

    this.isSyncing = false;
  }

}
//# sourceMappingURL=worker-interface.js.map