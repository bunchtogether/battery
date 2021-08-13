// @flow

import { v4 as uuidv4 } from 'uuid';
import { getServiceWorkerAndRegistration, unregister } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import {
  enqueueToDatabase,
  jobEmitter,
  // JOB_ABORTED_STATUS,
  JOB_COMPLETE_STATUS,
  // JOB_PENDING_STATUS,
  JOB_ERROR_STATUS,
  // JOB_CLEANUP_STATUS,

} from '../src/database';
import { expectEmit, getNextEmit } from './lib/emit';
import {
  TRIGGER_ERROR,
  TRIGGER_NO_ERROR,
  TRIGGER_100MS_DELAY,
} from './lib/echo-handler';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const queueInterface = new BatteryQueueServiceWorkerInterface();

describe('Worker', () => {
  beforeAll(async () => {
    await getServiceWorkerAndRegistration();
    await queueInterface.enableStartOnJob();
  });

  afterAll(async () => {
    await queueInterface.disableStartOnJob();
  });

  afterEach(async () => {
    await queueInterface.clear();
  });

  it('Should send a sync event', async () => {
    queueInterface.sync();
    await expectEmit(queueInterface, 'syncManagerOnIdle');
  });

  it('Detects when a service worker unregisters and attempts to re-link', async () => {
    await unregister();
    getServiceWorkerAndRegistration('/worker-alt.js');
    await expectEmit(queueInterface, 'unlink');
    await unregister();
    await getServiceWorkerAndRegistration();
    queueInterface.link();
    await expectEmit(queueInterface, 'link');
  });

  it('Should clear the service worker', async () => {
    const jobsClearPromise = expectEmit(jobEmitter, 'jobsClear');
    const clearedPromise = expectEmit(queueInterface, 'clearing');
    await queueInterface.clear();
    await jobsClearPromise;
    await clearedPromise;
  });

  it('Enqueues to the database and is handled', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const jobAddPromise = getNextEmit(jobEmitter, 'jobAdd');
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await expectEmit(jobEmitter, 'jobUpdate', id, queueId, 'echo', JOB_ERROR_STATUS);
    await expectEmit(jobEmitter, 'jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);

    expect(await jobAddPromise).toEqual([id, queueId, 'echo']);
  });

  it('Gets active and inactive queueIds', async () => {
    const queueIdA = uuidv4();
    const queueIdB = uuidv4();
    const value = uuidv4();
    await enqueueToDatabase(queueIdA, 'echo', [TRIGGER_100MS_DELAY, value], 0);

    expect(await queueInterface.getQueueIds()).toEqual(new Set([queueIdA]));

    await enqueueToDatabase(queueIdB, 'echo', [TRIGGER_100MS_DELAY, value], 0);
    await getNextEmit(queueInterface, 'dequeue');

    expect(await queueInterface.getQueueIds()).toEqual(new Set([queueIdA, queueIdB]));
    await queueInterface.onIdle();
    await queueInterface.clear();

    expect(await queueInterface.getQueueIds()).toEqual(new Set([]));
    await queueInterface.onIdle();
    await enqueueToDatabase(queueIdA, 'echo', [TRIGGER_NO_ERROR, value], 0);

    expect(await queueInterface.getQueueIds()).toEqual(new Set([queueIdA]));
  });

  it('Enqueues to the database and throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_ERROR, value];
    await enqueueToDatabase(queueId, 'echo', args, 0);
    await expectEmit(queueInterface, 'fatalError', { queueId });
  });

  it('Waits for the queue to idle', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await expectEmit(jobEmitter, 'jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    queueInterface.onIdle(5000);
    await expectEmit(queueInterface, 'idle');
  });
});
