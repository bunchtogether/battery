// @flow


import { getServiceWorkerAndRegistration } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import { asyncEmitMatchers } from './lib/emit';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const queueInterface = new BatteryQueueServiceWorkerInterface();

describe('Worker (Relink)', () => {
  beforeAll(async () => {
    jasmine.addAsyncMatchers(asyncEmitMatchers);
  });

  afterAll(async () => {
    await queueInterface.unlink();
  });

  it('Should relink if a service worker is redundant', async () => {
    await getServiceWorkerAndRegistration();
    const serviceWorker = navigator && navigator.serviceWorker;
    if (!serviceWorker) {
      throw new Error('Could not get service worker');
    }
    const { controller } = serviceWorker;
    if (!controller) {
      throw new Error('Could not get service worker controller');
    }
    const redundantStatePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        controller.removeEventListener('statechange', handleStateChange);
        reject(new Error('Timeout when waiting for service worker to change to redundant state'));
      }, 5000);
      const handleStateChange = () => {
        if (controller.state !== 'redundant') {
          return;
        }
        clearTimeout(timeout);
        controller.removeEventListener('statechange', handleStateChange);
        resolve();
      };
      controller.addEventListener('statechange', handleStateChange);
    });
    getServiceWorkerAndRegistration('/worker-alt.js');
    await redundantStatePromise;
    const linkPromise = queueInterface.link();
    await getServiceWorkerAndRegistration();
    await linkPromise;

    expect(queueInterface.port).toBeDefined();
  });
});
