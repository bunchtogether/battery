// @flow

import EventEmitter from 'events';
import type { Logger } from './logger';
import makeLogger from './logger';
import { jobEmitter, localJobEmitter } from './database';

type Options = {
  logger?: Logger
};

const canUseSyncManager = 'serviceWorker' in navigator && 'SyncManager' in window;

class RedundantServiceWorkerError extends Error {}

export default class BatteryQueueServiceWorkerInterface extends EventEmitter {
  declare serviceWorker: ServiceWorker;
  declare logger: Logger;
  declare port: MessagePort | void;
  declare portHeartbeatInterval: void | IntervalID;
  declare handlePortHeartbeat: void | () => void;
  declare handleBeforeUnload: void | () => void;
  declare queueIds: Set<string> | void;
  declare isSyncing: boolean;
  declare handleJobAdd: void | () => void;
  declare linkPromise: void | Promise<MessagePort>;

  constructor(options?: Options = {}) {
    super();
    this.logger = options.logger || makeLogger('Battery Queue Worker Interface');
    // This is a no-op to prevent errors from being thrown in the browser context.
    // Errors are logged in the worker.
    this.on('error', () => {});
    this.isSyncing = false;
  }

  async getRegistrationAndController() {
    const serviceWorker = navigator && navigator.serviceWorker;

    if (!serviceWorker) {
      throw new Error('Service worker not available');
    }

    const registration = await serviceWorker.ready;

    const { controller } = serviceWorker;

    if (!controller) {
      throw new Error('Service worker controller not available');
    }

    while (controller.state !== 'activated') {
      const state = controller.state;
      let hadControllerChange = false;
      this.logger.info(`Service worker in "${state}" state, waiting for state or controller change`);
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          controller.removeEventListener('statechange', handleStateChange);
          serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          throw new Error(`Unable to get service worker controller, state did not change from "${state}" within 5000ms`);
        }, 5000);
        const handleStateChange = () => {
          if (controller.state !== 'activated') {
            return;
          }
          clearTimeout(timeout);
          controller.removeEventListener('statechange', handleStateChange);
          serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        };
        const handleControllerChange = () => {
          hadControllerChange = true;
          clearTimeout(timeout);
          controller.removeEventListener('statechange', handleStateChange);
          serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        };
        serviceWorker.addEventListener('controllerchange', handleControllerChange);
        controller.addEventListener('statechange', handleStateChange);
      });
      if (hadControllerChange) {
        return this.getRegistrationAndController();
      }
    }
    return [registration, controller];
  }

  async unlink(maxDuration?: number = 60000) {
    const linkPromise = this.linkPromise;
    if (typeof linkPromise !== 'undefined') {
      try {
        await linkPromise;
      } catch (error) {
        this.logger.error('Link promise error while waiting to unlink');
        this.logger.errorStack(error);
      }
    }
    const port = this.port;
    if (!(port instanceof MessagePort)) {
      return;
    }
    delete this.port;
    clearInterval(this.portHeartbeatInterval);
    delete this.portHeartbeatInterval;
    const handlePortHeartbeat = this.handlePortHeartbeat;
    if (typeof handlePortHeartbeat === 'function') {
      this.removeListener('heartbeat', this.handlePortHeartbeat);
    }
    const handleBeforeUnload = this.handleBeforeUnload;
    if (typeof handlePortHeartbeat === 'function') {
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
    }
    await new Promise((resolve) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('unlinkComplete', handleUnlinkComplete);
        this.removeListener('unlinkError', handleUnlinkError);
        this.logger.error(`Did not receive unlink response within ${maxDuration}ms`);
        resolve();
      }, maxDuration);
      const handleUnlinkComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('unlinkComplete', handleUnlinkComplete);
        this.removeListener('unlinkError', handleUnlinkError);
        resolve();
      };
      const handleUnlinkError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('unlinkComplete', handleUnlinkComplete);
        this.removeListener('unlinkError', handleUnlinkError);
        this.logger.error('Received unlink error');
        this.logger.errorStack(error);
        resolve();
      };
      this.addListener('unlinkComplete', handleUnlinkComplete);
      this.addListener('unlinkError', handleUnlinkError);
      port.postMessage({ type: 'unlink', args: [requestId] });
    });
    try {
      port.close();
    } catch (error) {
      this.logger.error('Error while closing MessageChannel port with redundant service worker');
      this.logger.errorStack(error);
    }
    port.onmessage = null;
    this.emit('unlink');
    this.logger.info('Unlinked');
  }

  async link() {
    if (this.port instanceof MessagePort) {
      return this.port;
    }
    if (this.linkPromise) {
      return this.linkPromise;
    }
    const linkPromise = this._link().finally(() => { // eslint-disable-line no-underscore-dangle
      delete this.linkPromise;
    });
    this.linkPromise = linkPromise;
    return linkPromise;
  }

  async _link() {
    if (this.port instanceof MessagePort) {
      return this.port;
    }

    const [registration, controller] = await this.getRegistrationAndController();

    const messageChannel = new MessageChannel();

    const port = messageChannel.port1;
    this.port = messageChannel.port1;

    const handleUpdateFound = async () => {
      const installingWorker = registration.installing;
      const activeWorker = registration.active;
      if (!installingWorker) {
        return;
      }
      if (!activeWorker) {
        return;
      }
      registration.removeEventListener('updatefound', handleUpdateFound);
      controller.removeEventListener('statechange', handleStateChange);
      try {
        await this.unlink();
        this.logger.info('Unlinked service worker after detecting new service worker');
      } catch (error) {
        this.logger.error('Unable to unlink service worker after detecting new service worker');
        this.logger.errorStack(error);
      }
    };

    const handleStateChange = async () => {
      this.logger.warn(`Service worker state change to ${controller.state}`);
      if (controller.state !== 'redundant') {
        return;
      }
      registration.removeEventListener('updatefound', handleUpdateFound);
      controller.removeEventListener('statechange', handleStateChange);
      try {
        await this.unlink();
        this.logger.info('Unlinked service worker after detecting redundant service worker');
      } catch (error) {
        this.logger.error('Unable to unlink service worker after detecting redundant service worker');
        this.logger.errorStack(error);
      }
    };

    registration.addEventListener('updatefound', handleUpdateFound);
    controller.addEventListener('statechange', handleStateChange);

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          messageChannel.port1.onmessage = null;
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
            controller.removeEventListener('statechange', handleStateChangeBeforeLink);
            resolve();
          }
        };
        // $FlowFixMe
        controller.postMessage({ type: 'BATTERY_QUEUE_WORKER_INITIALIZATION' }, [
          messageChannel.port2,
        ]);
      });
    } catch (error) {
      registration.removeEventListener('updatefound', handleUpdateFound);
      controller.removeEventListener('statechange', handleStateChange);
      if (error instanceof RedundantServiceWorkerError) {
        return messageChannel.port1;
      }
      throw error;
    }

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

    let didLogHeartbeatTimeout = false;
    let didReceiveHeartbeat = true;

    const handlePortHeartbeat = () => {
      didLogHeartbeatTimeout = false;
      didReceiveHeartbeat = true;
    };
    this.addListener('heartbeat', handlePortHeartbeat);
    this.handlePortHeartbeat = handlePortHeartbeat;

    const sendHeartbeat = () => {
      if (!didReceiveHeartbeat) {
        if (!didLogHeartbeatTimeout) {
          this.logger.error('Did not receive port heartbeat');
          didLogHeartbeatTimeout = true;
        }
      }
      didReceiveHeartbeat = false;
      port.postMessage({ type: 'heartbeat', args: [10000] });
    };
    this.portHeartbeatInterval = setInterval(sendHeartbeat, 10000);
    sendHeartbeat();
    const handleBeforeUnload = () => {
      if (!canUseSyncManager) {
        return;
      }
      // $FlowFixMe
      registration.sync.register('unload');
    };
    this.handleBeforeUnload = handleBeforeUnload;
    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });

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

  async updateDurationEstimates(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);
        this.removeListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);
        reject(new Error(`Did not receive update duration estimates response within ${maxDuration}ms`));
      }, maxDuration);
      const handleUpdateDurationEstimatesComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);
        this.removeListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);
        resolve();
      };
      const handleUpdateDurationEstimatesError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);
        this.removeListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);
        reject(error);
      };
      this.addListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);
      this.addListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);
      port.postMessage({ type: 'updateDurationEstimates', args: [requestId] });
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

  async abortAndRemoveQueue(queueId:string, maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortAndRemoveQueueError', handleAbortQueueError);
        reject(new Error(`Did not receive abort queue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleAbortQueueComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortAndRemoveQueueError', handleAbortQueueError);
        resolve();
      };
      const handleAbortQueueError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortAndRemoveQueueError', handleAbortQueueError);
        reject(error);
      };
      this.addListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);
      this.addListener('abortAndRemoveQueueError', handleAbortQueueError);
      port.postMessage({ type: 'abortAndRemoveQueue', args: [requestId, queueId] });
    });
  }

  async abortAndRemoveQueueJobsGreaterThanId(queueId:string, id:number, maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);
        this.removeListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);
        reject(new Error(`Did not receive abort queue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleAbortAndRemoveQueueJobsGreaterThanIdComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);
        this.removeListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);
        resolve();
      };
      const handleAbortAndRemoveQueueJobsGreaterThanIdError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);
        this.removeListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);
        reject(error);
      };
      this.addListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);
      this.addListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);
      port.postMessage({ type: 'abortAndRemoveQueueJobsGreaterThanId', args: [requestId, queueId, id] });
    });
  }

  async retryQueue(queueId:string, maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('retryQueueComplete', handleRetryQueueComplete);
        this.removeListener('retryQueueError', handleRetryQueueError);
        reject(new Error(`Did not receive retry queue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleRetryQueueComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('retryQueueComplete', handleRetryQueueComplete);
        this.removeListener('retryQueueError', handleRetryQueueError);
        resolve();
      };
      const handleRetryQueueError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('retryQueueComplete', handleRetryQueueComplete);
        this.removeListener('retryQueueError', handleRetryQueueError);
        reject(error);
      };
      this.addListener('retryQueueComplete', handleRetryQueueComplete);
      this.addListener('retryQueueError', handleRetryQueueError);
      port.postMessage({ type: 'retryQueue', args: [requestId, queueId] });
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

  async runUnloadHandlers(maxDuration?: number = 10000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);
        this.removeListener('runUnloadHandlersError', handleRunUnloadHandlersError);
        reject(new Error(`Did not receive run unload handlers response within ${maxDuration}ms`));
      }, maxDuration);
      const handleRunUnloadHandlersComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);
        this.removeListener('runUnloadHandlersError', handleRunUnloadHandlersError);
        resolve();
      };
      const handleRunUnloadHandlersError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);
        this.removeListener('runUnloadHandlersError', handleRunUnloadHandlersError);
        reject(error);
      };
      this.addListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);
      this.addListener('runUnloadHandlersError', handleRunUnloadHandlersError);
      port.postMessage({ type: 'runUnloadHandlers', args: [requestId] });
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
        this.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleEnableStartOnJobError);
        reject(new Error(`Did not receive enableStartOnJob response within ${maxDuration}ms`));
      }, maxDuration);
      const handleEnableStartOnJobComplete = (responseId:number) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);
        this.removeListener('enableStartOnJobError', handleEnableStartOnJobError);
        resolve();
      };
      const handleEnableStartOnJobError = (responseId:number, error:Error) => {
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

  async getDurationEstimate(queueId:string, maxDuration?: number = 1000) {
    const port = await this.link();
    return new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);
        this.removeListener('getDurationEstimateError', handleGetDurationEstimateError);
        reject(new Error(`Did not receive duration estimate response within ${maxDuration}ms`));
      }, maxDuration);
      const handleGetDurationEstimateComplete = (responseId:number, values:[number, number]) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);
        this.removeListener('getDurationEstimateError', handleGetDurationEstimateError);
        resolve(values);
      };
      const handleGetDurationEstimateError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);
        this.removeListener('getDurationEstimateError', handleGetDurationEstimateError);
        reject(error);
      };
      this.addListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);
      this.addListener('getDurationEstimateError', handleGetDurationEstimateError);
      port.postMessage({ type: 'getDurationEstimate', args: [requestId, queueId] });
    });
  }

  async getCurrentJobType(queueId:string, maxDuration?: number = 1000) {
    const port = await this.link();
    return new Promise((resolve, reject) => {
      const requestId = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);
        this.removeListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);
        reject(new Error(`Did not receive duration estimate response within ${maxDuration}ms`));
      }, maxDuration);
      const handleGetCurrentJobTypeComplete = (responseId:number, type:string | void) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);
        this.removeListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);
        resolve(type);
      };
      const handleGetCurrentJobTypeError = (responseId:number, error:Error) => {
        if (responseId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);
        this.removeListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);
        reject(error);
      };
      this.addListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);
      this.addListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);
      port.postMessage({ type: 'getCurrentJobType', args: [requestId, queueId] });
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
