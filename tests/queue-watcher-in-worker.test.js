// @flow

import { v4 as uuidv4 } from 'uuid';
import { getServiceWorkerAndRegistration } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import {
  enqueueToDatabase,
  getJobsInQueueFromDatabase,
  JOB_PENDING_STATUS,
  JOB_COMPLETE_STATUS,
  QUEUE_PENDING_STATUS,
  QUEUE_COMPLETE_STATUS,
} from '../src/database';
import { asyncEmitMatchers } from './lib/emit';
import {
  TRIGGER_NO_ERROR,
} from './lib/echo-handler';

import BatteryQueueWatcher from '../src/queue-watcher';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const queueInterface = new BatteryQueueServiceWorkerInterface();

describe('Queue Watcher in Worker', () => {
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
    await queueInterface.disableStartOnJob();
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const watcher = new BatteryQueueWatcher(queueId);
    const id = await enqueueToDatabase(queueId, 'echo', args, 0, false);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, value],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_PENDING_STATUS);
    await queueInterface.dequeue();
    await expectAsync(watcher).toEmit('status', QUEUE_COMPLETE_STATUS);
    await queueInterface.onIdle();
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
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_COMPLETE_STATUS);
  });
});

