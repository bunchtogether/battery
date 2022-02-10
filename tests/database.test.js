// @flow

import { v4 as uuidv4 } from 'uuid';
import { asyncEmitMatchers, getNextEmit } from './lib/emit';
import {
  enqueueToDatabase,
  bulkEnqueueToDatabase,
  getJobsInQueueFromDatabase,
  getCleanupsInQueueFromDatabase,
  getJobsInDatabase,
  dequeueFromDatabase,
  dequeueFromDatabaseNotIn,
  markJobCompleteInDatabase,
  markJobCompleteThenRemoveFromDatabase,
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
  getJobsWithTypeFromDatabase,
  markCleanupStartAfterInDatabase,
  markQueueForCleanupInDatabase,
  markQueueForCleanupAndRemoveInDatabase,
  markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase,
  markQueuePendingInDatabase,
  markQueueJobsGreaterThanIdPendingInDatabase,
  clearDatabase,
  setMetadataInDatabase,
  getMetadataFromDatabase,
  updateMetadataInDatabase,
  clearMetadataInDatabase,
  storeAuthDataInDatabase,
  getAuthDataFromDatabase,
  removeAuthDataFromDatabase,
  getContiguousIds,
  jobEmitter,
  removeJobsWithQueueIdAndTypeFromDatabase,
  removeQueueFromDatabase,
  removeCompletedExpiredItemsFromDatabase,
  updateUnloadDataInDatabase,
  getUnloadDataFromDatabase,
  clearUnloadDataInDatabase,
  updateJobInDatabase,
  getGreatestJobIdFromQueueInDatabase,
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

  beforeAll(() => {
    jasmine.addAsyncMatchers(asyncEmitMatchers);
  });

  it('Gets jobs of a certain type from the database', async () => {
    const queueId = uuidv4();
    const typeA = uuidv4();
    const typeB = uuidv4();
    const idA = await enqueueToDatabase(queueId, typeA, []);
    const idB = await enqueueToDatabase(queueId, typeB, []);
    await expectAsync(getJobsWithTypeFromDatabase(typeA)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: typeA,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await expectAsync(getJobsWithTypeFromDatabase(typeB)).toBeResolvedTo([{
      id: idB,
      queueId,
      type: typeB,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Job emitter emits job updates', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const jobAddPromiseA = getNextEmit(jobEmitter, 'jobAdd');

    const idA = await enqueueToDatabase(queueId, type, []);

    await expectAsync(jobAddPromiseA).toBeResolvedTo([idA, queueId, type]);

    const jobAddPromiseB = getNextEmit(jobEmitter, 'jobAdd');
    const [idF] = await bulkEnqueueToDatabase([[queueId, type, [], {}]]);

    await expectAsync(jobAddPromiseB).toBeResolvedTo([idF, queueId, type]);

    const jobDeletePromiseA = getNextEmit(jobEmitter, 'jobDelete');
    await removeJobsWithQueueIdAndTypeFromDatabase(queueId, type);

    await expectAsync(jobDeletePromiseA).toBeResolvedTo([idA, queueId]);

    const idB = await enqueueToDatabase(queueId, type, []);
    const jobDeletePromiseB = getNextEmit(jobEmitter, 'jobDelete');
    await removeQueueFromDatabase(queueId);

    await expectAsync(jobDeletePromiseB).toBeResolvedTo([idB, queueId]);

    const idC = await enqueueToDatabase(queueId, type, []);
    const jobDeletePromiseC = getNextEmit(jobEmitter, 'jobDelete');
    await markJobCompleteInDatabase(idC);
    await removeCompletedExpiredItemsFromDatabase(0);

    await expectAsync(jobDeletePromiseC).toBeResolvedTo([idC, queueId]);

    const idD = await enqueueToDatabase(queueId, type, []);
    const jobUpdatePromiseA = getNextEmit(jobEmitter, 'jobUpdate');
    await updateJobInDatabase(idD, (x) => {
      if (typeof x === 'undefined') {
        return;
      }
      x.status = JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign
      return x; // eslint-disable-line consistent-return
    });

    await expectAsync(jobUpdatePromiseA).toBeResolvedTo([idD, queueId, type, JOB_ABORTED_STATUS]);
    await removeQueueFromDatabase(queueId);

    const idE = await enqueueToDatabase(queueId, type, []);
    const jobUpdatePromiseB = getNextEmit(jobEmitter, 'jobUpdate');
    await markQueueForCleanupInDatabase(queueId);

    await expectAsync(jobUpdatePromiseB).toBeResolvedTo([idE, queueId, type, JOB_ABORTED_STATUS]);

    const jobsClearPromise = getNextEmit(jobEmitter, 'jobsClear');
    await clearDatabase();
    await expectAsync(jobsClearPromise).toBeResolvedTo([]);
  });

  it('Emits a jobUpdate and followed by a jobDelete and removes from the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, []);
    markJobCompleteThenRemoveFromDatabase(id);
    const updatePromise = expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, type, JOB_COMPLETE_STATUS);
    const deletePromise = expectAsync(jobEmitter).toEmit('jobDelete', id, queueId);
    await updatePromise;
    await deletePromise;
  });

  it('Increments cleanup attempts', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateCleanupValuesInDatabase(id, queueId, data);

    await expectAsync(getCleanupFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      data,
      attempt: 0,
      startAfter: jasmine.any(Number),
    });
    await incrementCleanupAttemptInDatabase(id, queueId);

    await expectAsync(getCleanupFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      data,
      attempt: 1,
      startAfter: jasmine.any(Number),
    });
  });

  it('Increments cleanup attempts if cleanup data does not initially exist', async () => {
    const id = Math.round(1000 + Math.random() * 1000);
    const queueId = uuidv4();

    await incrementCleanupAttemptInDatabase(id, queueId);

    await expectAsync(getCleanupFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      data: {},
      attempt: 1,
      startAfter: jasmine.any(Number),
    });
  });

  it('Gets jobs by ID from database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    await expectAsync(getGreatestJobIdFromQueueInDatabase(queueId)).toBeResolvedTo(0);
    const idA = await enqueueToDatabase(queueId, type, []);
    await expectAsync(getGreatestJobIdFromQueueInDatabase(queueId)).toBeResolvedTo(idA);
    const idB = await enqueueToDatabase(queueId, type, []);
    await expectAsync(getGreatestJobIdFromQueueInDatabase(queueId)).toBeResolvedTo(idB);
    await expectAsync(getJobsInDatabase([idA, idB])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idB,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await removeJobFromDatabase(idA);

    await expectAsync(getJobsInDatabase([idA, idB])).toBeResolvedTo([{
      id: idB,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await removeJobFromDatabase(idB);

    await expectAsync(getJobsInDatabase([idA, idB])).toBeResolvedTo([]);
  });

  it('Marks a job as aborted if it was in cleanup status', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, []);
    await markJobCleanupInDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await markJobAsAbortedOrRemoveFromDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Removes a job if it was in cleanup and remove status', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, []);
    await markJobCompleteInDatabase(id);
    await markJobCleanupAndRemoveInDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await markJobAsAbortedOrRemoveFromDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
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

    await expectAsync(getCleanupFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      data: data1,
      attempt: 0,
      startAfter: jasmine.any(Number),
    });

    await expectAsync(getCleanupsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      data: data1,
      attempt: 0,
      startAfter: jasmine.any(Number),
    }]);

    await updateCleanupValuesInDatabase(id, queueId, data2);

    await expectAsync(getCleanupFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      data: Object.assign({}, data1, data2),
      attempt: 0,
      startAfter: jasmine.any(Number),
    });

    await expectAsync(getCleanupsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      data: Object.assign({}, data1, data2),
      attempt: 0,
      startAfter: jasmine.any(Number),
    }]);

    await removePathFromCleanupDataInDatabase(id, ['a']);

    await expectAsync(getCleanupFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      data: data2,
      attempt: 0,
      startAfter: jasmine.any(Number),
    });

    await expectAsync(getCleanupsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      data: data2,
      attempt: 0,
      startAfter: jasmine.any(Number),
    }]);

    await removeCleanupFromDatabase(id);

    expect(await getCleanupFromDatabase(id)).toBeUndefined();

    await expectAsync(getCleanupsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
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

    expect(cleanupBeforeDatabase.startAfter).toBeLessThanOrEqual(Date.now());

    await markCleanupStartAfterInDatabase(id, Date.now() + 1000);

    const cleanupAfterDatabase = await getCleanupFromDatabase(id);
    if (typeof cleanupAfterDatabase === 'undefined') {
      throw new Error('Cleanup does not exist');
    }

    expect(cleanupAfterDatabase.startAfter).toBeGreaterThan(Date.now() - 1);
  });

  it('Adds and removes jobs from the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, []);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await removeJobFromDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
  });

  it('Removes a job with aborted status from the database if marked as "cleanup and remove" ', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, []);
    await markJobAbortedInDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await markJobCleanupAndRemoveInDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
  });

  it('Removes a job with pending status from the database if marked as "cleanup and remove" ', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const id = await enqueueToDatabase(queueId, type, []);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    await markJobCleanupAndRemoveInDatabase(id);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
  });

  it('Gets all jobs from the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();


    const idA = await enqueueToDatabase(queueId, type, []);
    const idB = await enqueueToDatabase(queueId, type, []);
    const idC = await enqueueToDatabase(queueId, type, []);
    const idD = await enqueueToDatabase(queueId, type, []);
    const idE = await enqueueToDatabase(queueId, type, []);
    const idF = await enqueueToDatabase(queueId, type, []);

    await markJobCompleteInDatabase(idB);
    await markJobErrorInDatabase(idC);
    await markJobCleanupInDatabase(idD);
    await markJobAbortedInDatabase(idE);
    // Mark idF as complete before marking cleanup
    await markJobCompleteInDatabase(idF);
    await markJobCleanupAndRemoveInDatabase(idF);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idB,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idC,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idD,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idE,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idF,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Dequeues items in pending state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([{
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Dequeues items in error state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobErrorInDatabase(id);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([{
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Dequeues items in cleanup state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCleanupInDatabase(id);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([{
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });


  it('Dequeues items in cleanup and remove state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);
    await markJobCleanupAndRemoveInDatabase(id);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([{
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Does not dequeue items in complete state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([]);
  });

  it('Does not dequeue items in abort state', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
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
    const idA = await enqueueToDatabase(queueId, type, argsA);
    const idB = await enqueueToDatabase(queueId, type, argsB);
    const idC = await enqueueToDatabase(queueId, type, argsC);

    await expectAsync(dequeueFromDatabaseNotIn([])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idA])).toBeResolvedTo([{
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idC])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idB])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idC])).toBeResolvedTo([{
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idB, idC])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB])).toBeResolvedTo([{
      id: idC,
      queueId,
      type,
      args: argsC,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB, idC])).toBeResolvedTo([]);
  });


  it('Does not dequeue items in complete state and not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA);
    const idB = await enqueueToDatabase(queueId, type, argsB);

    await markJobErrorInDatabase(idA);
    await markJobCompleteInDatabase(idB);

    await expectAsync(dequeueFromDatabaseNotIn([idA])).toBeResolvedTo([]);
  });

  it('Dequeues items in error state not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA);
    const idB = await enqueueToDatabase(queueId, type, argsB);

    await markJobErrorInDatabase(idA);
    await markJobErrorInDatabase(idB);

    await expectAsync(dequeueFromDatabaseNotIn([idA])).toBeResolvedTo([{
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idB])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB])).toBeResolvedTo([]);
  });

  it('Dequeues items in cleanup state not in a specified array', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA);
    const idB = await enqueueToDatabase(queueId, type, argsB);

    await markJobCleanupInDatabase(idA);
    await markJobCleanupInDatabase(idB);

    await expectAsync(dequeueFromDatabaseNotIn([idA])).toBeResolvedTo([{
      id: idB,
      queueId,
      type,
      args: argsB,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idB])).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: argsA,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);

    await expectAsync(dequeueFromDatabaseNotIn([idA, idB])).toBeResolvedTo([]);
  });

  it('Restores a prematurely removed job into the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await removeJobFromDatabase(id);
    await restoreJobToDatabaseForCleanupAndRemove(id, queueId, type, args);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Increments attempt in database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await incrementJobAttemptInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks pending jobs as aborted when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });


  it('Removes pending jobs with job IDs greater than a specified number for cleanup and removal', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });

    const greatestJobId = await getGreatestJobIdFromQueueInDatabase(queueId);

    expect(greatestJobId).toEqual(id);

    await markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, greatestJobId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });

    await markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, 0);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo(undefined);
  });

  it('Removes pending jobs when marking queue for cleanup and removal', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupAndRemoveInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo(undefined);
  });

  it('Removes aborted jobs when marking queue for cleanup and removal', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await markJobAbortedInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupAndRemoveInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo(undefined);
  });

  it('Marks completed jobs for cleanup when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks completed jobs for cleanup and removal when marking queue for cleanup and removal', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupAndRemoveInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks completed jobs with job IDs greater than a specified number for cleanup and removal when marking queue for cleanup and removal', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });

    const greatestJobId = await getGreatestJobIdFromQueueInDatabase(queueId);

    expect(greatestJobId).toEqual(id);

    await markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, greatestJobId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });

    await markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, 0);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks job start-after time in database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
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

    expect(jobAfterUpdate.startAfter).toBeGreaterThan(Date.now() - 1);
  });

  it('Marks errored jobs for cleanup when marking queue for cleanup', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobErrorInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks errored jobs for cleanup and removal when marking queue for cleanup and removal', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobErrorInDatabase(id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueForCleanupAndRemoveInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Sets pending job attempts to zero when marking a queue as pending', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueuePendingInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks aborted jobs as pending when marking a queue as pending', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await markJobAbortedInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueuePendingInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Does not update completed jobs when marking a queue as pending', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueuePendingInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Sets error job attempts to zero when marking a queue as pending', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobErrorInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueuePendingInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Sets cleanup job attempts to zero when marking a queue as pending', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCleanupInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueuePendingInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Does not update cleanup and remove jobs when marking a queue as pending', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);
    await markJobCleanupAndRemoveInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueuePendingInDatabase(queueId);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Sets pending job attempts to zero when marking a queue as pending with job ids greater than a number', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });

    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Marks aborted jobs as pending when marking a queue as pending with job ids greater than a number', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);

    await markJobAbortedInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Does not update completed jobs when marking a queue as pending with job ids greater than a number', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Sets error job attempts to zero when marking a queue as pending with job ids greater than a number', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobErrorInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, id);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);

    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ERROR_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Sets cleanup job attempts to zero when marking a queue as pending with job ids greater than a number', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCleanupInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });

  it('Does not update cleanup and remove jobs when marking a queue as pending with job ids greater than a number', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await markJobCompleteInDatabase(id);
    await markJobCleanupAndRemoveInDatabase(id);
    await incrementJobAttemptInDatabase(id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, id);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
    await markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);
    await expectAsync(getJobFromDatabase(id)).toBeResolvedTo({
      id,
      queueId,
      type,
      args,
      attempt: 1,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    });
  });


  it('Bulk enqueues items to the database', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    const items = [
      [queueId, type, [valueA], {}],
      [queueId, type, [valueB], {}],
    ];
    await bulkEnqueueToDatabase(items);

    await expectAsync(dequeueFromDatabase()).toBeResolvedTo([{
      id: jasmine.any(Number),
      queueId,
      type,
      args: [valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: jasmine.any(Number),
      queueId,
      type,
      args: [valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_PENDING_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Gets, sets, updates and clears arbitrary metadata', async () => {
    const id = uuidv4();
    const keyA = uuidv4();
    const valueA = uuidv4();
    const keyB = uuidv4();
    const valueB = uuidv4();

    expect(await getMetadataFromDatabase(id)).toBeUndefined();
    await setMetadataInDatabase(id, { [keyA]: valueA });
    await expectAsync(getMetadataFromDatabase(id)).toBeResolvedTo({ [keyA]: valueA });
    await updateMetadataInDatabase(id, (data:any) => {
      if (typeof data === 'object' || typeof data === 'undefined') {
        const newData = Object.assign({}, data, { [keyB]: valueB });
        return newData;
      }
      throw new Error(`Invalid data type ${typeof data}`);
    });
    await expectAsync(getMetadataFromDatabase(id)).toBeResolvedTo({ [keyA]: valueA, [keyB]: valueB });
    await clearMetadataInDatabase(id);

    expect(await getMetadataFromDatabase(id)).toBeUndefined();
  });

  it('Clears arbitrary metadata if the update transform function returns false', async () => {
    const id = uuidv4();
    const key = uuidv4();
    const value = uuidv4();
    await setMetadataInDatabase(id, { [key]: value });
    await expectAsync(getMetadataFromDatabase(id)).toBeResolvedTo({ [key]: value });
    await updateMetadataInDatabase(id, () => false);

    expect(await getMetadataFromDatabase(id)).toBeUndefined();
  });

  it('Does not update arbitrary metadata if the update transform function returns undefined', async () => {
    const id = uuidv4();
    const key = uuidv4();
    const value = uuidv4();
    await setMetadataInDatabase(id, { [key]: value });
    await expectAsync(getMetadataFromDatabase(id)).toBeResolvedTo({ [key]: value });
    await updateMetadataInDatabase(id, () => undefined);
    await expectAsync(getMetadataFromDatabase(id)).toBeResolvedTo({ [key]: value });
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

  it('Gets and sets unload data in database', async () => {
    const keyA = uuidv4();
    const valueA = uuidv4();
    const keyB = uuidv4();
    const valueB = uuidv4();

    expect(await getUnloadDataFromDatabase()).toBeUndefined();
    await updateUnloadDataInDatabase(() => ({ [keyA]: valueA }));
    await updateUnloadDataInDatabase((existing:Object) => {
      expect(existing).toEqual({ [keyA]: valueA });
      return Object.assign({ [keyB]: valueB }, existing);
    });
    await expectAsync(getUnloadDataFromDatabase()).toBeResolvedTo(({ [keyA]: valueA, [keyB]: valueB }));
    await clearUnloadDataInDatabase();

    expect(await getUnloadDataFromDatabase()).toBeUndefined();
  });


  it('Aborts jobs if they are added to a queue containing aborted jobs', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const idA = await enqueueToDatabase(queueId, type, []);
    await markJobAbortedInDatabase(idA);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    const idB = await enqueueToDatabase(queueId, type, []);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idB,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });

  it('Aborts jobs if they are added to a queue containing aborted jobs', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const idA = await enqueueToDatabase(queueId, type, []);
    await markJobAbortedInDatabase(idA);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
    const [idB] = await bulkEnqueueToDatabase([[queueId, type, [], {}]]);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }, {
      id: idB,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
      prioritize: false,
    }]);
  });
});
