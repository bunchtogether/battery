// @flow

import { v4 as uuidv4 } from 'uuid';
import { expectEmit } from './lib/emit';
import {
  enqueueToDatabase,
  getQueueStatus,
  markJobCompleteInDatabase,
  markJobErrorInDatabase,
  markJobAbortedInDatabase,
  markJobCleanupInDatabase,
  removeQueueIdFromJobsDatabase,
  clearDatabase,
  QUEUE_ERROR_STATUS,
  QUEUE_PENDING_STATUS,
  QUEUE_COMPLETE_STATUS,
  QUEUE_EMPTY_STATUS,
} from '../src/database';


import BatteryQueueWatcher from '../src/queue-watcher';

describe('Queue Watcher', () => {
  afterEach(async () => {
    await clearDatabase();
  });

  it('Should emit queue status', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const watcher = new BatteryQueueWatcher(queueId);
    //
    const pendingEmitPromiseA = expectEmit(watcher, 'status', QUEUE_PENDING_STATUS);
    const id = await enqueueToDatabase(queueId, type, [], 0);
    await pendingEmitPromiseA;

    expect(await getQueueStatus(queueId)).toEqual(QUEUE_PENDING_STATUS);
    //
    const completeEmitPromise = expectEmit(watcher, 'status', QUEUE_COMPLETE_STATUS);
    await markJobCompleteInDatabase(id);
    await completeEmitPromise;

    expect(await getQueueStatus(queueId)).toEqual(QUEUE_COMPLETE_STATUS);
    //
    const errorEmitPromiseA = expectEmit(watcher, 'status', QUEUE_ERROR_STATUS);
    await markJobAbortedInDatabase(id);
    await errorEmitPromiseA;

    expect(await getQueueStatus(queueId)).toEqual(QUEUE_ERROR_STATUS);
    //
    const pendingEmitPromiseB = expectEmit(watcher, 'status', QUEUE_PENDING_STATUS);
    await markJobErrorInDatabase(id);
    await pendingEmitPromiseB;

    expect(await getQueueStatus(queueId)).toEqual(QUEUE_PENDING_STATUS);
    //
    const errorEmitPromiseB = expectEmit(watcher, 'status', QUEUE_ERROR_STATUS);
    await markJobCleanupInDatabase(id);
    await errorEmitPromiseB;

    expect(await getQueueStatus(queueId)).toEqual(QUEUE_ERROR_STATUS);
    //
    const emptyEmitPromise = expectEmit(watcher, 'status', QUEUE_EMPTY_STATUS);
    await removeQueueIdFromJobsDatabase(queueId);
    await emptyEmitPromise;

    expect(await getQueueStatus(queueId)).toEqual(QUEUE_EMPTY_STATUS);
  });
});
