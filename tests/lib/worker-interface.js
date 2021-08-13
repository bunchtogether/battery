// @flow

import EventEmitter from 'events';
import makeLogger from '../../src/logger';

const logger = makeLogger('Service Worker Interface');

const loadPromise = new Promise((resolve) => {
  window.addEventListener('load', resolve);
});

export const serviceWorkerEmitter = new EventEmitter();

const register = async (url?:string = '/worker.js') => {
  const { navigator } = window;
  if (typeof navigator !== 'object') {
    throw new Error('Navigator does not exist');
  }

  await loadPromise;

  const initialServiceWorker = navigator && navigator.serviceWorker;

  if (typeof initialServiceWorker !== 'undefined') {
    const initialRegistrations = await initialServiceWorker.getRegistrations();
    for (const initialRegistration of initialRegistrations) {
      logger.warn('Unregistering existing service worker, this should only happen in test environments');
      await initialRegistration.unregister();
    }
  }

  let registration;

  try {
    registration = await navigator.serviceWorker.register(url, { type: 'module', scope: '/' });
  } catch (error) {
    logger.error('Unable to load service worker');
    logger.errorStack(error);
  }

  if (typeof registration === 'undefined') {
    throw new Error('Service worker not available');
  }

  const newWorker = registration.installing || registration.waiting || registration.active;

  if (newWorker.state !== 'activated') {
    await new Promise((resolve) => {
      const handleStateChange = () => {
        logger.info(`State changed to "${newWorker.state}"`);
        if (newWorker.state === 'activated') {
          resolve();
          newWorker.removeEventListener('statechange', handleStateChange);
        }
      };
      newWorker.addEventListener('statechange', handleStateChange);
    });
  }

  const serviceWorker = navigator && navigator.serviceWorker;

  if (!serviceWorker) {
    throw new Error('Service worker not available');
  }

  await serviceWorker.ready;

  // https://w3c.github.io/ServiceWorker/#navigator-service-worker-controller
  // https://stackoverflow.com/questions/51597231/register-service-worker-after-hard-refresh
  if (!serviceWorker.controller) {
    logger.warn('Service worker controller not available, most likely as a result of a hard refresh. Reloading.');
    window.location.reload();
  }

  registration.onupdatefound = () => {
    logger.info('Updated to latest version');
  };

  await registration.update();

  serviceWorker.addEventListener('statechange', (e) => {
    logger.warn(`Service worker state change to ${e.target.state}`);
  });

  serviceWorker.onmessage = function (event) {
    if (!(event instanceof MessageEvent)) {
      return;
    }
    const { data } = event;
    if (!data || typeof data !== 'object') {
      logger.warn('Unknown message type', event);
      return;
    }

    const { type, value } = data;

    if (typeof type !== 'string') {
      logger.warn('Unknown message type', event);
      return;
    }
    serviceWorkerEmitter.emit(type, value);
  };

  return [serviceWorker, registration];
};

let serviceWorkerPromise = null;

export const getServiceWorkerAndRegistration = (url?:string) => {
  if (serviceWorkerPromise !== null) {
    return serviceWorkerPromise;
  }
  serviceWorkerPromise = register(url);
  return serviceWorkerPromise;
};

export async function unregister() {
  if (serviceWorkerPromise === null) {
    return;
  }
  const [serviceWorker, registration] = await serviceWorkerPromise; // eslint-disable-line no-unused-vars
  await registration.unregister();
  serviceWorkerPromise = null;
}

export async function postMessage(type:string, value:Object) {
  await serviceWorkerPromise;
  const controller = navigator && navigator.serviceWorker && navigator.serviceWorker.controller;
  if (!controller) {
    throw new Error('Controller does not exist');
  }
  controller.postMessage({ type, value });
}

