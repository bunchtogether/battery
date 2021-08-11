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
  markJobStartAfterInDatabase,
  incrementJobAttemptInDatabase,
  getJobFromDatabase,
  updateCleanupInDatabase,
  getCleanupFromDatabase,
  incrementCleanupAttemptInDatabase,
  removePathFromCleanupDataInDatabase,
  removeCleanupFromDatabase,
  markCleanupStartAfterInDatabase,
  markQueueForCleanupInDatabase,
  getQueueDataFromDatabase,
  clearDatabase,
  updateQueueDataInDatabase,
  storeAuthDataInDatabase,
  getAuthDataFromDatabase,
  removeAuthDataFromDatabase,
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


  it('Increments cleanup attempts', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateCleanupInDatabase(id, queueId, data);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data,
      attempt: 0,
      startAfter: jasmine.any(Number),
    }));
    await incrementCleanupAttemptInDatabase(id, queueId);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data,
      attempt: 1,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Increments cleanup attempts if cleanup data does not initially exist', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();

    await incrementCleanupAttemptInDatabase(id, queueId);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data: {},
      attempt: 1,
      startAfter: jasmine.any(Number),
    }));
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

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data: data1,
      attempt: 0,
      startAfter: jasmine.any(Number),
    }));

    await updateCleanupInDatabase(id, queueId, data2);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data: Object.assign({}, data1, data2),
      attempt: 0,
      startAfter: jasmine.any(Number),
    }));

    await removePathFromCleanupDataInDatabase(id, ['a']);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data: data2,
      attempt: 0,
      startAfter: jasmine.any(Number),
    }));

    await removeCleanupFromDatabase(id);

    expect(await getCleanupFromDatabase(id)).toBeUndefined();
  });

  it('Marks cleanup start-after time in database', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateCleanupInDatabase(id, queueId, data);

    const cleanupBeforeDatabase = await getCleanupFromDatabase(id);
    if (typeof cleanupBeforeDatabase === 'undefined') {
      throw new Error('Cleanup does not exist');
    }

    expect(cleanupBeforeDatabase.startAfter).toBeLessThan(Date.now());

    await markCleanupStartAfterInDatabase(id, Date.now() + 1000);

    const cleanupAfterDatabase = await getCleanupFromDatabase(id);
    if (typeof cleanupAfterDatabase === 'undefined') {
      throw new Error('Cleanup does not exist');
    }

    expect(cleanupAfterDatabase.startAfter).toBeGreaterThan(Date.now());
  });

  it('Dequeues items in pending state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Dequeues items in error state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobErrorInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Dequeues items in cleanup state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobCleanupInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Does not dequeue items in complete state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobCompleteInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([]);
  });

  it('Does not dequeue items in abort state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobAbortedInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([]);
  });

  it('Increments attempt in database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await incrementJobAttemptInDatabase(id);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Marks pending jobs as aborted when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
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
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Marks completed jobs for cleanup when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobCompleteInDatabase(id);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
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
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    }));
  });

  it('Marks job start-after time in database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobCompleteInDatabase(id);
    const jobBeforeUpdate = await getJobFromDatabase(id);
    if (typeof jobBeforeUpdate === 'undefined') {
      throw new Error('Job does not exist');
    }

    expect(jobBeforeUpdate.startAfter).toBeLessThan(Date.now());
    await markJobStartAfterInDatabase(id, Date.now() + 1000);
    const jobAfterUpdate = await getJobFromDatabase(id);
    if (typeof jobAfterUpdate === 'undefined') {
      throw new Error('Job does not exist');
    }

    expect(jobAfterUpdate.startAfter).toBeGreaterThan(Date.now());
  });

  it('Marks errored jobs for cleanup when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobErrorInDatabase(id);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
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
      attempt: 0,
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
    const items = [
      [type, [valueA]],
      [type, [valueB]],
    ];
    await bulkEnqueueToDatabase(queueId, items, 0);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id: jasmine.any(Number),
      queueId,
      type,
      args: [valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: jasmine.any(Number),
      queueId,
      type,
      args: [valueB],
      attempt: 0,
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

  it('Gets and sets auth data in database', async () => {
    const id = uuidv4();
    const data = {
      [uuidv4()]: uuidv4(),
    };

    expect(await getAuthDataFromDatabase(id)).toBeUndefined();
    await storeAuthDataInDatabase(id, data);

    expect(await getAuthDataFromDatabase(id)).toEqual(data);
    await removeAuthDataFromDatabase(id);

    expect(await getAuthDataFromDatabase(id)).toBeUndefined();
  });
});
