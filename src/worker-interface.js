// @flow

import EventEmitter from 'events';
import { deserializeError } from 'serialize-error';
import type { Logger } from './logger';
import makeLogger from './logger';

export class BatteryQueueServiceWorkerInterface extends EventEmitter {
  declare serviceWorker: ServiceWorker;
  declare logger: Logger;
  declare port: MessagePort | void;

  constructor(logger?: Logger = makeLogger('BatteryQueue Worker Interface')) {
    super();
    this.logger = logger;
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
      const controller = this.getController();
      // $FlowFixMe
      controller.postMessage({ type: 'BATTERY_QUEUE_WORKER_INITIALIZATION' }, [
        messageChannel.port2,
      ]);
    });

    this.logger.info('Linked to worker');

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
      this.emit(type, ...args);
    };

    this.port = messageChannel.port1;
    return messageChannel.port1;
  }

  async clear(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const id = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        reject(new Error(`Did not receive clear response within ${maxDuration}ms`));
      }, maxDuration);
      const handleClearComplete = ({ id: responseId }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        resolve();
      };
      const handleClearError = ({ id: responseId, errorObject }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('clearComplete', handleClearComplete);
        this.removeListener('clearError', handleClearError);
        const error = deserializeError(errorObject);
        reject(error);
      };
      this.addListener('clearComplete', handleClearComplete);
      this.addListener('clearError', handleClearError);
      port.postMessage({ type: 'clear', value: { id } });
    });
  }

  async abortQueue(queueId:string, maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const id = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        reject(new Error(`Did not receive abort queue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleAbortQueueComplete = ({ id: responseId }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        resolve();
      };
      const handleAbortQueueError = ({ id: responseId, errorObject }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('abortQueueComplete', handleAbortQueueComplete);
        this.removeListener('abortQueueError', handleAbortQueueError);
        const error = deserializeError(errorObject);
        reject(error);
      };
      this.addListener('abortQueueComplete', handleAbortQueueComplete);
      this.addListener('abortQueueError', handleAbortQueueError);
      port.postMessage({ type: 'abortQueue', value: { id, queueId } });
    });
  }

  async dequeue(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const id = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        reject(new Error(`Did not receive dequeue response within ${maxDuration}ms`));
      }, maxDuration);
      const handleDequeueComplete = ({ id: responseId }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        resolve();
      };
      const handleDequeueError = ({ id: responseId, errorObject }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('dequeueComplete', handleDequeueComplete);
        this.removeListener('dequeueError', handleDequeueError);
        const error = deserializeError(errorObject);
        reject(error);
      };
      this.addListener('dequeueComplete', handleDequeueComplete);
      this.addListener('dequeueError', handleDequeueError);
      port.postMessage({ type: 'dequeue', value: { id } });
    });
  }

  async onIdle(maxDuration?: number = 1000) {
    const port = await this.link();
    await new Promise((resolve, reject) => {
      const id = Math.random();
      const timeout = setTimeout(() => {
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        reject(new Error(`Did not receive idle response within ${maxDuration}ms`));
      }, maxDuration);
      const handleIdleComplete = ({ id: responseId }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        resolve();
      };
      const handleIdleError = ({ id: responseId, errorObject }) => {
        if (id !== responseId) {
          return;
        }
        clearTimeout(timeout);
        this.removeListener('idleComplete', handleIdleComplete);
        this.removeListener('idleError', handleIdleError);
        const error = deserializeError(errorObject);
        reject(error);
      };
      this.addListener('idleComplete', handleIdleComplete);
      this.addListener('idleError', handleIdleError);
      port.postMessage({ type: 'idle', value: { id, maxDuration, start: Date.now() } });
    });
  }
}
