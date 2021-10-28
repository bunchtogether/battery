// @flow

import { v4 as uuidv4 } from 'uuid';
import { getServiceWorkerAndRegistration, unregister } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import {
  enqueueToDatabase,
  getJobsInQueueFromDatabase,
  jobEmitter,
  JOB_COMPLETE_STATUS,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_AND_REMOVE_STATUS,
  getQueueStatus,
  QUEUE_ERROR_STATUS,
} from '../src/database';
import { asyncEmitMatchers, getNextEmit } from './lib/emit';
import {
  TRIGGER_ERROR,
  TRIGGER_NO_ERROR,
  TRIGGER_100MS_DELAY,
} from './lib/echo-handler';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const queueInterface = new BatteryQueueServiceWorkerInterface();

describe('Worker', () => {
  beforeAll(async () => {
    jasmine.addAsyncMatchers(asyncEmitMatchers);
    await getServiceWorkerAndRegistration();
    await queueInterface.enableStartOnJob();
  });

  afterAll(async () => {
    await queueInterface.disableStartOnJob();
    await queueInterface.unlink();
  });

  afterEach(async () => {
    await queueInterface.clear();
  });

  it('Should send a sync event', async () => {
    queueInterface.sync();
    await expectAsync(queueInterface).toEmit('syncManagerOnIdle');
  });

  it('Detects when a service worker unregisters and attempts to re-link', async () => {
    await unregister();
    getServiceWorkerAndRegistration('/worker-alt.js');
    await expectAsync(queueInterface).toEmit('unlink');
    const linkPromise = expectAsync(queueInterface).toEmit(15000, 'link');
    await unregister();
    await getServiceWorkerAndRegistration();
    queueInterface.link();
    await linkPromise;
  });

  it('Should clear the service worker', async () => {
    const jobsClearPromise = expectAsync(jobEmitter).toEmit('jobsClear');
    const clearedPromise = expectAsync(queueInterface).toEmit('clearing');
    await queueInterface.clear();
    await jobsClearPromise;
    await clearedPromise;
  });

  it('Enqueues to the database and is handled', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const jobAddPromise = expectAsync(jobEmitter).toEmit('jobAdd', jasmine.any(Number), queueId, 'echo');
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_ERROR_STATUS);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    await jobAddPromise;
  });

  it('Gets active and inactive queueIds', async () => {
    const queueIdA = uuidv4();
    const queueIdB = uuidv4();
    const value = uuidv4();
    await enqueueToDatabase(queueIdA, 'echo', [TRIGGER_100MS_DELAY, value], 0, false);

    await expectAsync(queueInterface.getQueueIds()).toBeResolvedTo(new Set([queueIdA]));

    await enqueueToDatabase(queueIdB, 'echo', [TRIGGER_100MS_DELAY, value], 0, false);
    await getNextEmit(queueInterface, 'dequeue');

    await expectAsync(queueInterface.getQueueIds()).toBeResolvedTo(new Set([queueIdA, queueIdB]));
    await queueInterface.onIdle();
    await queueInterface.clear();

    await expectAsync(queueInterface.getQueueIds()).toBeResolvedTo(new Set([]));
    await queueInterface.onIdle();
    await enqueueToDatabase(queueIdA, 'echo', [TRIGGER_NO_ERROR, value], 0, false);

    await expectAsync(queueInterface.getQueueIds()).toBeResolvedTo(new Set([queueIdA]));
  });

  it('Enqueues to the database and throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(queueInterface).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
  });

  it('Waits for the queue to idle', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    queueInterface.onIdle(5000);
    await expectAsync(queueInterface).toEmit('idle');
  });

  it('Aborts and removes a queue from the database', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    await queueInterface.onIdle(5000);
    queueInterface.abortAndRemoveQueue(queueId);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_CLEANUP_AND_REMOVE_STATUS);
    await expectAsync(jobEmitter).toEmit('jobDelete', id, queueId);
  });

  it('Aborts and removes a queue with a job greater than a specified number from the database', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    await queueInterface.onIdle(5000);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, value],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    queueInterface.abortAndRemoveQueueJobsGreaterThanId(queueId, id);
    await queueInterface.onIdle(5000);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, value],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    queueInterface.abortAndRemoveQueueJobsGreaterThanId(queueId, 0);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_CLEANUP_AND_REMOVE_STATUS);
    await expectAsync(jobEmitter).toEmit('jobDelete', id, queueId);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
  });

  it('Estimates duration in a queue', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await queueInterface.onIdle(5000);
    const [duration, pending] = await queueInterface.getDurationEstimate(queueId);

    expect(duration).toBeGreaterThan(0);
    expect(pending).toEqual(0);
  });

  it('Updates queue duration estimates', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    await queueInterface.disableStartOnJob();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_100MS_DELAY, value], 0, false);
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value], 0, false);
    queueInterface.dequeue();
    await expectAsync(queueInterface).toEmit('queueDuration', queueId, 100, 100);
    await expectAsync(queueInterface).toEmit('queueDuration', queueId, 105, 105);
    await expectAsync(queueInterface).toEmit('queueDuration', queueId, 105, 105);
    queueInterface.updateDurationEstimates();
    await expectAsync(queueInterface).toEmit('queueDuration', queueId, 105, 105);
    await queueInterface.onIdle(5000);
    await queueInterface.enableStartOnJob();
  });

  it('Gets current job type in a queue', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_100MS_DELAY, value];
    await expectAsync(queueInterface.getCurrentJobType(queueId)).toBeResolvedTo(undefined);
    await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(queueInterface).toEmit('queueJobType', queueId, 'echo');
    await expectAsync(queueInterface.getCurrentJobType(queueId)).toBeResolvedTo('echo');
    await queueInterface.onIdle(5000);
    await expectAsync(queueInterface.getCurrentJobType(queueId)).toBeResolvedTo(undefined);
  });

  it('Retries a queue', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(queueInterface).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await queueInterface.onIdle(5000);
    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_ERROR_STATUS);
    await queueInterface.retryQueue(queueId);
    await expectAsync(queueInterface).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await queueInterface.onIdle(5000);
    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_ERROR_STATUS);
  });
});
