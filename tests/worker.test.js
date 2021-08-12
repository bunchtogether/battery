// @flow

import { v4 as uuidv4 } from 'uuid';
import { serviceWorkerPromise } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import {
  enqueueToDatabase,
} from '../src/database';
import { expectEmit } from './lib/emit';
import {
  TRIGGER_ERROR,
  TRIGGER_NO_ERROR,
} from './lib/echo-handler';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const queueInterface = new BatteryQueueServiceWorkerInterface();

describe('Worker', () => {
  beforeAll(async () => {
    await serviceWorkerPromise;
  });

  afterEach(async () => {
    await queueInterface.clear();
  });

  it('Should clear the service worker', async () => {
    const clearedPromise = expectEmit(queueInterface, 'clearing');
    await queueInterface.clear();
    await clearedPromise;
  });

  it('Enqueues to the database and is handled', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await queueInterface.dequeue();
    await expectEmit(queueInterface, 'complete', { id });
  });

  it('Enqueues to the database and throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_ERROR, value];
    await enqueueToDatabase(queueId, 'echo', args, 0);
    await queueInterface.dequeue();
    await expectEmit(queueInterface, 'fatalError', { queueId });
  });

  it('Waits for the queue to idle', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    const idlePromise = expectEmit(queueInterface, 'idle');
    await queueInterface.dequeue();
    await expectEmit(queueInterface, 'complete', { id });
    await queueInterface.onIdle(5000);
    await idlePromise;
  });
});
