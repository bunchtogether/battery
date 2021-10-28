// @flow

import { v4 as uuidv4 } from 'uuid';
import { asyncEmitMatchers } from './lib/emit';
import {
  enqueueToDatabase,
  getQueueStatus,
  markJobCompleteInDatabase,
  markJobErrorInDatabase,
  markJobAbortedInDatabase,
  markJobCleanupInDatabase,
  removeQueueFromDatabase,
  clearDatabase,
  QUEUE_ERROR_STATUS,
  QUEUE_PENDING_STATUS,
  QUEUE_COMPLETE_STATUS,
  QUEUE_EMPTY_STATUS,
} from '../src/database';


import BatteryQueueWatcher from '../src/queue-watcher';

describe('Queue Watcher', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(asyncEmitMatchers);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('Should emit queue status', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const watcher = new BatteryQueueWatcher(queueId);
    //
    const pendingEmitPromiseA = expectAsync(watcher).toEmit('status', QUEUE_PENDING_STATUS);
    const id = await enqueueToDatabase(queueId, type, [], 0, false);
    await pendingEmitPromiseA;
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_PENDING_STATUS);

    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_PENDING_STATUS);
    //
    const completeEmitPromise = expectAsync(watcher).toEmit('status', QUEUE_COMPLETE_STATUS);
    await markJobCompleteInDatabase(id);
    await completeEmitPromise;
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_COMPLETE_STATUS);

    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_COMPLETE_STATUS);
    //
    const errorEmitPromiseA = expectAsync(watcher).toEmit('status', QUEUE_ERROR_STATUS);
    await markJobAbortedInDatabase(id);
    await errorEmitPromiseA;
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_ERROR_STATUS);

    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_ERROR_STATUS);
    //
    const pendingEmitPromiseB = expectAsync(watcher).toEmit('status', QUEUE_PENDING_STATUS);
    await markJobErrorInDatabase(id);
    await pendingEmitPromiseB;
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_PENDING_STATUS);

    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_PENDING_STATUS);
    //
    const errorEmitPromiseB = expectAsync(watcher).toEmit('status', QUEUE_ERROR_STATUS);
    await markJobCleanupInDatabase(id);
    await errorEmitPromiseB;
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_ERROR_STATUS);

    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_ERROR_STATUS);
    //
    const emptyEmitPromise = expectAsync(watcher).toEmit('status', QUEUE_EMPTY_STATUS);
    await removeQueueFromDatabase(queueId);
    await emptyEmitPromise;
    await expectAsync(watcher.getStatus()).toBeResolvedTo(QUEUE_EMPTY_STATUS);

    await expectAsync(getQueueStatus(queueId)).toBeResolvedTo(QUEUE_EMPTY_STATUS);
  });
});
