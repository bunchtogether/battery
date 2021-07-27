// @flow

import { v4 as uuidv4 } from 'uuid';

import {
  enqueueToDatabase,
  bulkEnqueueToDatabase,
  dequeueFromDatabase,
  markJobCompleteInDatabase,
  markJobErrorInDatabase,
  markJobAbortedInDatabase,
  markJobCleanupInDatabase,
  decrementAttemptsRemainingInDatabase,
  getJobFromDatabase,
  updateCleanupInDatabase,
  getCleanupFromDatabase,
  removeCleanupFromDatabase,
  markQueueForCleanupInDatabase,
  getQueueDataFromDatabase,
  clearDatabase,
  updateQueueDataInDatabase,
  JOB_PENDING_STATUS,
  JOB_COMPLETE_STATUS,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_STATUS,
  JOB_ABORTED_STATUS,
} from '../src/database';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('IndexedDB Database', () => {
  afterEach(async () => {
    await clearDatabase();
  });


  it('Adds and removes cleanup data', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();
    const data1 = {
      a: uuidv4(),
    };
    const data2 = {
      b: uuidv4(),
    };
    await updateCleanupInDatabase(id, queueId, data1);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining(data1));
    await updateCleanupInDatabase(id, queueId, data2);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining(Object.assign({}, data1, data2)));
    await removeCleanupFromDatabase(id);

    expect(await getCleanupFromDatabase(id)).toBeUndefined();
  });


  it('Dequeues items in pending state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = 1;
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Dequeues items in error state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = 1;
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await markJobErrorInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Dequeues items in cleanup state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = 1;
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await markJobCleanupInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Does not dequeue items in complete state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = 1;
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await markJobCompleteInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([]);
  });

  it('Does not dequeue items in abort state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = 1;
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await markJobAbortedInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([]);
  });

  it('Decrements attempts remaining in database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = Math.round(1 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await decrementAttemptsRemainingInDatabase(id);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts - 1,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Marks pending jobs as aborted when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = Math.round(1 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }));
    await markQueueForCleanupInDatabase(queueId);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Marks completed jobs for cleanup when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = Math.round(1 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await markJobCompleteInDatabase(id);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }));
    await markQueueForCleanupInDatabase(queueId);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Marks errored jobs for cleanup when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const maxAttempts = Math.round(1 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, type, args, maxAttempts, 0);
    await markJobErrorInDatabase(id);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
    }));
    await markQueueForCleanupInDatabase(queueId);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Bulk enqueues items to the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    const maxAttempts = Math.round(2 + Math.random() * 10);
    const items = [
      [type, [valueA], maxAttempts],
      [type, [valueB], maxAttempts],
    ];
    await bulkEnqueueToDatabase(queueId, items, 0);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id: jasmine.any(Number),
      queueId,
      type,
      args: [valueA],
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: jasmine.any(Number),
      queueId,
      type,
      args: [valueB],
      attemptsRemaining: maxAttempts,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Gets and sets queue data in database', async () => {
    const queueId = uuidv4();
    const key = uuidv4();
    const value = uuidv4();

    expect(await getQueueDataFromDatabase(queueId)).toBeUndefined();
    await updateQueueDataInDatabase(queueId, { [key]: value });

    expect(await getQueueDataFromDatabase(queueId)).toEqual({ [key]: value });
  });
});
