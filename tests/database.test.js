// @flow

import { v4 as uuidv4 } from 'uuid';
import { getNextEmit } from './lib/emit';
import {
  enqueueToDatabase,
  bulkEnqueueToDatabase,
  getJobsFromDatabase,
  dequeueFromDatabase,
  dequeueFromDatabaseNotIn,
  markJobCompleteInDatabase,
  markJobErrorInDatabase,
  markJobAbortedInDatabase,
  markJobCleanupInDatabase,
  markJobCleanupAndRemoveInDatabase,
  markJobStartAfterInDatabase,
  markJobAsAbortedOrRemoveFromDatabase,
  incrementJobAttemptInDatabase,
  getJobFromDatabase,
  updateCleanupValuesInDatabase,
  getCleanupFromDatabase,
  incrementCleanupAttemptInDatabase,
  removePathFromCleanupDataInDatabase,
  removeCleanupFromDatabase,
  removeJobFromDatabase,
  restoreJobToDatabaseForCleanupAndRemove,
  markCleanupStartAfterInDatabase,
  markQueueForCleanupInDatabase,
  getQueueDataFromDatabase,
  clearDatabase,
  updateQueueDataInDatabase,
  storeAuthDataInDatabase,
  getAuthDataFromDatabase,
  removeAuthDataFromDatabase,
  getContiguousIds,
  jobEmitter,
  removeJobsWithQueueIdAndTypeFromDatabase,
  removeQueueIdFromJobsDatabase,
  removeCompletedExpiredItemsFromDatabase,
  updateJobInDatabase,
  JOB_PENDING_STATUS,
  JOB_COMPLETE_STATUS,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_STATUS,
  JOB_CLEANUP_AND_REMOVE_STATUS,
  JOB_ABORTED_STATUS,
} from '../src/database';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('IndexedDB Database', () => {
  afterEach(async () => {
    await clearDatabase();
  });

  it('Job emitter emits job updates', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const jobAddPromiseA = getNextEmit(jobEmitter, 'jobAdd');

    const idA = await enqueueToDatabase(queueId, type, [], 0);

    await expectAsync(jobAddPromiseA).toBeResolvedTo([idA, queueId, type]);
    const jobDeletePromiseA = getNextEmit(jobEmitter, 'jobDelete');
    await removeJobsWithQueueIdAndTypeFromDatabase(queueId, type);

    await expectAsync(jobDeletePromiseA).toBeResolvedTo([idA, queueId]);

    const idB = await enqueueToDatabase(queueId, type, [], 0);
    const jobDeletePromiseB = getNextEmit(jobEmitter, 'jobDelete');
    await removeQueueIdFromJobsDatabase(queueId);

    await expectAsync(jobDeletePromiseB).toBeResolvedTo([idB, queueId]);

    const idC = await enqueueToDatabase(queueId, type, [], 0);
    const jobDeletePromiseC = getNextEmit(jobEmitter, 'jobDelete');
    await markJobCompleteInDatabase(idC);
    await removeCompletedExpiredItemsFromDatabase(0);

    await expectAsync(jobDeletePromiseC).toBeResolvedTo([idC, queueId]);

    const idD = await enqueueToDatabase(queueId, type, [], 0);
    const jobUpdatePromiseA = getNextEmit(jobEmitter, 'jobUpdate');
    await updateJobInDatabase(idD, (x) => {
      if (typeof x === 'undefined') {
        return;
      }
      x.status = JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign
      return x; // eslint-disable-line consistent-return
    });

    await expectAsync(jobUpdatePromiseA).toBeResolvedTo([idD, queueId, type, JOB_ABORTED_STATUS]);
    await removeQueueIdFromJobsDatabase(queueId);

    const idE = await enqueueToDatabase(queueId, type, [], 0);
    const jobUpdatePromiseB = getNextEmit(jobEmitter, 'jobUpdate');
    await markQueueForCleanupInDatabase(queueId);

    await expectAsync(jobUpdatePromiseB).toBeResolvedTo([idE, queueId, type, JOB_ABORTED_STATUS]);

    const jobAddPromiseB = getNextEmit(jobEmitter, 'jobAdd');
    const [idF] = await bulkEnqueueToDatabase(queueId, [[type, []]], 0);

    await expectAsync(jobAddPromiseB).toBeResolvedTo([idF, queueId, type]);

    const jobsClearPromise = getNextEmit(jobEmitter, 'jobsClear');
    await clearDatabase();

    await expectAsync(jobsClearPromise).toBeResolvedTo([]);
  });

  it('Increments cleanup attempts', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateCleanupValuesInDatabase(id, queueId, data);

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


  it('Marks a job as aborted if it was in cleanup status', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 0);
    await markJobCleanupInDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await markJobAsAbortedOrRemoveFromDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }]);
  });

  it('Removes a job if it was in cleanup and remove status', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 0);
    await markJobCompleteInDatabase(id);
    await markJobCleanupAndRemoveInDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await markJobAsAbortedOrRemoveFromDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([]);
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


    await updateCleanupValuesInDatabase(id, queueId, data1);

    expect(await getCleanupFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      data: data1,
      attempt: 0,
      startAfter: jasmine.any(Number),
    }));

    await updateCleanupValuesInDatabase(id, queueId, data2);

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
    await updateCleanupValuesInDatabase(id, queueId, data);

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

  it('Adds and removes jobs from the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 0);

    expect(await getJobsFromDatabase(queueId)).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);
    await removeJobFromDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([]);
  });

  it('Removes a job with aborted status from the database if marked as "cleanup and remove" ', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 0);
    await markJobAbortedInDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await markJobCleanupAndRemoveInDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([]);
  });

  it('Removes a job with pending status from the database if marked as "cleanup and remove" ', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 0);

    expect(await getJobsFromDatabase(queueId)).toEqual([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await markJobCleanupAndRemoveInDatabase(id);

    expect(await getJobsFromDatabase(queueId)).toEqual([]);
  });

  it('Gets all jobs from the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();


    const idA = await enqueueToDatabase(queueId, type, [], 0);
    const idB = await enqueueToDatabase(queueId, type, [], 0);
    const idC = await enqueueToDatabase(queueId, type, [], 0);
    const idD = await enqueueToDatabase(queueId, type, [], 0);
    const idE = await enqueueToDatabase(queueId, type, [], 0);
    const idF = await enqueueToDatabase(queueId, type, [], 0);

    await markJobCompleteInDatabase(idB);
    await markJobErrorInDatabase(idC);
    await markJobCleanupInDatabase(idD);
    await markJobAbortedInDatabase(idE);
    // Mark idF as complete before marking cleanup
    await markJobCompleteInDatabase(idF);
    await markJobCleanupAndRemoveInDatabase(idF);

    expect(await getJobsFromDatabase(queueId)).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idC,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idD,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idE,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idF,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
    })]);
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


  it('Dequeues items in cleanup and remove state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobCompleteInDatabase(id);
    await markJobCleanupAndRemoveInDatabase(id);

    expect(await dequeueFromDatabase()).toEqual([jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
    })]);
  });

  it('Does not dequeue items in complete state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobCompleteInDatabase(id);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([]);
  });

  it('Does not dequeue items in abort state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await markJobAbortedInDatabase(id);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([]);
  });

  it('Should get the lowest and highest elements of contiguous sequences of integers in an array', () => {
    expect(getContiguousIds([1, 2])).toEqual([[0, 0], [3, Infinity]]);
    expect(getContiguousIds([1, 3])).toEqual([[0, 0], [2, 2], [4, Infinity]]);
    expect(getContiguousIds([1, 3, 5])).toEqual([[0, 0], [2, 2], [4, 4], [6, Infinity]]);
    expect(getContiguousIds([1, 2, 3, 5])).toEqual([[0, 0], [4, 4], [6, Infinity]]);
    expect(getContiguousIds([1, 2, 3, 5])).toEqual([[0, 0], [4, 4], [6, Infinity]]);
    expect(getContiguousIds([1, 2, 3, 4, 5])).toEqual([[0, 0], [6, Infinity]]);
    expect(getContiguousIds([1, 2, 3, 7, 8, 9, 13, 14, 15])).toEqual([[0, 0], [4, 6], [10, 12], [16, Infinity]]);
  });

  it('Dequeues items in pending state not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const argsC = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA, 0);
    const idB = await enqueueToDatabase(queueId, type, argsB, 0);
    const idC = await enqueueToDatabase(queueId, type, argsC, 0);

    expect(await dequeueFromDatabaseNotIn([])).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idA])).toEqual([jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idC])).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idB])).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    }), jasmine.objectContaining({
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idA, idC])).toEqual([jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idB, idC])).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idA, idB])).toEqual([jasmine.objectContaining({
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB, idC])).toBeResolvedTo([]);
  });


  it('Does not dequeue items in complete state and not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA, 0);
    const idB = await enqueueToDatabase(queueId, type, argsB, 0);

    await markJobErrorInDatabase(idA);
    await markJobCompleteInDatabase(idB);

    await expectAsync(dequeueFromDatabaseNotIn([idA])).toBeResolvedTo([]);
  });

  it('Dequeues items in error state not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA, 0);
    const idB = await enqueueToDatabase(queueId, type, argsB, 0);

    await markJobErrorInDatabase(idA);
    await markJobErrorInDatabase(idB);

    expect(await dequeueFromDatabaseNotIn([idA])).toEqual([jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idB])).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB])).toBeResolvedTo([]);
  });

  it('Dequeues items in cleanup state not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA, 0);
    const idB = await enqueueToDatabase(queueId, type, argsB, 0);

    await markJobCleanupInDatabase(idA);
    await markJobCleanupInDatabase(idB);

    expect(await dequeueFromDatabaseNotIn([idA])).toEqual([jasmine.objectContaining({
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    expect(await dequeueFromDatabaseNotIn([idB])).toEqual([jasmine.objectContaining({
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
    })]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB])).toBeResolvedTo([]);
  });

  it('Restores a prematurely removed job into the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args, 0);
    await removeJobFromDatabase(id);
    await restoreJobToDatabaseForCleanupAndRemove(id, queueId, type, args);

    expect(await getJobFromDatabase(id)).toEqual(jasmine.objectContaining({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
    }));
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

    await expectAsync(getQueueDataFromDatabase(queueId)).toBeResolvedTo({ [key]: value });
  });

  it('Gets and sets auth data in database', async () => {
    const id = uuidv4();
    const data = {
      [uuidv4()]: uuidv4(),
    };

    expect(await getAuthDataFromDatabase(id)).toBeUndefined();
    await storeAuthDataInDatabase(id, data);

    await expectAsync(getAuthDataFromDatabase(id)).toBeResolvedTo(data);
    await removeAuthDataFromDatabase(id);

    expect(await getAuthDataFromDatabase(id)).toBeUndefined();
  });
});
