// @flow

import EventEmitter from 'events';
import type { Logger } from './logger';
import makeLogger from './logger';
import { jobEmitter, localJobEmitter } from './database';

type Options = {
  logger?: Logger
};

const canUseSyncManager = 'serviceWorker' in navigator && 'SyncManager' in window;

export default class BatteryQueueServiceWorkerInterface extends EventEmitter {
  declare serviceWorker: ServiceWorker;
  declare logger: Logger;
  declare port: MessagePort | void;
  declare queueIds: Set<string> | void;
  declare isSyncing: boolean;
  declare handleJobAdd: void | () => void;

  constructor(options?: Options = {}) {
    super();
    this.logger = options.logger || makeLogger('Battery Queue Worker Interface');
    // This is a no-op to prevent errors from being thrown in the browser context.
    // Errors are logged in the worker.
    this.on('error', () => {});
    this.isSyncing = false;
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

    const controller = this.getController();

    controller.addEventListener('statechange', () => {
      this.logger.warn(`Service worker state change to ${controller.state}`);
      if (controller.state !== 'redundant') {
        return;
      }
      this.logger.warn('Detected redundant service worker, unlinking');
      messageChannel.port1.close();
      messageChannel.port2.close();
      port.postMessage({ type: 'unlink', args: [] });
      delete this.port;
      this.emit('unlink');
      self.queueMicrotask(() => {
        this.link().catch((error) => {
          this.logger.error('Unable to re-link service worker');
          this.logger.errorStack(error);
        });
      });
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        messageChannel.port1.onmessage = null;
        reject(new Error('Unable to link to service worker'));
      }, 1000);
      messageChannel.port1.onmessage = (event:MessageEvent) => {
        if (!(event instanceof MessageEvent)) {
          return;
        }
        const { data } = event;
        if (!data || typeof data !== 'object') {
          this.logger.warn('Unknown message type');
          this.logger.warnObject(event);
          return;
        }
        const { type } = data;
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
      // $FlowFixMe
      controller.postMessage({ type: 'BATTERY_QUEUE_WORKER_INITIALIZATION' }, [
        messageChannel.port2,
      ]);
    });


    messageChannel.port1.onmessage = (event:MessageEvent) => {
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

    const handleJobAdd = (...args:Array<any>) => {
      port.postMessage({ type: 'jobAdd', args });
    };
    const handleJobDelete = (...args:Array<any>) => {
      port.postMessage({ type: 'jobDelete', args });
    };
    const handleJobUpdate = (...args:Array<any>) => {
      port.postMessage({ type: 'jobUpdate', args });
    };
    const handleJobsClear = (...args:Array<any>) => {
      port.postMessage({ type: 'jobsClear', args });
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

  async clear(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        reject(new Error(`Did not receive clear response within ${maxDuration}ms`));
      }, maxDuration);
      const handleClearComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        resolve();
      };
      const handleClearError = (responseId:number, error:Error) => {
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
      port.postMessage({ type: 'clear', args: [requestId] });
    });
  }

  async abortQueue(queueId:string, maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        reject(new Error(`Did not receive abort queue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleAbortQueueComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        resolve();
      };
      const handleAbortQueueError = (responseId:number, error:Error) => {
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
      port.postMessage({ type: 'abortQueue', args: [requestId, queueId] });
    });
  }

  async dequeue(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        reject(new Error(`Did not receive dequeue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleDequeueComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        resolve();
      };
      const handleDequeueError = (responseId:number, error:Error) => {
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
      port.postMessage({ type: 'dequeue', args: [requestId] });
    });
  }

  async onIdle(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        reject(new Error(`Did not receive idle response within ${maxDuration}ms`));
      }, maxDuration);
      const handleIdleComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        resolve();
      };
      const handleIdleError = (responseId:number, error:Error) => {
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
      port.postMessage({ type: 'idle', args: [requestId, maxDuration, Date.now()] });
    });
  }

  async getQueueIds(maxDuration?: number = 1000) {
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
      const handleGetQueuesComplete = (responseId:number, qIds:Array<string>) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('getQueuesComplete', handleGetQueuesComplete);
        this.removeListener('getQueuesError', handleGetQueuesError);
        resolve((new Set(qIds): Set<string>));
      };
      const handleGetQueuesError = (responseId:number, error:Error) => {
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
      port.postMessage({ type: 'getQueueIds', args: [requestId] });
    });
    if (queueIds.size > 0) {
      this.queueIds = queueIds;
    }
    return queueIds;
  }

  async enableStartOnJob(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('enableStartOnJobComplete', handleenableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleenableStartOnJobError);
        reject(new Error(`Did not receive enableStartOnJob response within ${maxDuration}ms`));
      }, maxDuration);
      const handleenableStartOnJobComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('enableStartOnJobComplete', handleenableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleenableStartOnJobError);
        resolve();
      };
      const handleenableStartOnJobError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('enableStartOnJobComplete', handleenableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleenableStartOnJobError);
        reject(error);
      };
      this.addListener('enableStartOnJobComplete', handleenableStartOnJobComplete);
      this.addListener('enableStartOnJobError', handleenableStartOnJobError);
      port.postMessage({ type: 'enableStartOnJob', args: [requestId] });
    });
    const handleJobAdd = () => {
      this.sync();
    };
    jobEmitter.addListener('jobAdd', handleJobAdd);
    this.handleJobAdd = handleJobAdd;
  }

  async disableStartOnJob(maxDuration?: number = 1000) {
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
      const handledisableStartOnJobComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);
        this.removeListener('disableStartOnJobError', handledisableStartOnJobError);
        resolve();
      };
      const handledisableStartOnJobError = (responseId:number, error:Error) => {
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
      port.postMessage({ type: 'disableStartOnJob', args: [requestId] });
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
      const registration = await serviceWorker.ready;
      // $FlowFixMe
      registration.sync.register('syncManagerOnIdle');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.removeListener('syncManagerOnIdle');
          reject(new Error('Unable to sync, did not receive syncManagerOnIdle acknowledgement'));
        }, 5000);
        const handleOnIdleSync = () => {
          clearTimeout(timeout);
          this.removeListener('syncManagerOnIdle', handleOnIdleSync);
          resolve();
        };
        this.addListener('syncManagerOnIdle', handleOnIdleSync);
      });
      await new Promise((resolve) => {
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
