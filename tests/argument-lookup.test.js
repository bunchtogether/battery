// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
  clearDatabase,
  getArgLookupJobPathMap,
  addArgLookup,
  lookupArgs,
  lookupArg,
  getJobFromDatabase,
  markJobCleanupAndRemoveInDatabase,
  markJobCompleteInDatabase,
  markJobsWithArgLookupKeyCleanupAndRemoveInDatabase,
  removeArgLookupsAndCleanupsForJobAsMicrotask,
  JOB_COMPLETE_STATUS,
  JOB_CLEANUP_AND_REMOVE_STATUS,
} from '../src/database';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

describe('Argument Lookup', () => {
  afterEach(async () => {
    await clearDatabase();
  });

  it('Adds and removes argument lookups', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const key = uuidv4();
    const jsonPath = '$';
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await addArgLookup(id, key, jsonPath);
    await expectAsync(getArgLookupJobPathMap(key)).toBeResolvedTo(new Map([[id, jsonPath]]));
    removeArgLookupsAndCleanupsForJobAsMicrotask(id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectAsync(getArgLookupJobPathMap(key)).toBeResolvedTo(new Map());
  });

  it('Automatically removes argument lookups when a job is removed', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const key = uuidv4();
    const jsonPath = '$';
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await addArgLookup(id, key, jsonPath);
    await expectAsync(getArgLookupJobPathMap(key)).toBeResolvedTo(new Map([[id, jsonPath]]));
    await markJobCleanupAndRemoveInDatabase(id);
    await expectAsync(getArgLookupJobPathMap(key)).toBeResolvedTo(new Map());
  });

  it('Returns an empty array if no keys match', async () => {
    const key = uuidv4();
    await expectAsync(lookupArgs(key)).toBeResolvedTo([]);
  });

  it('Returns undefined if no keys match', async () => {
    const key = uuidv4();
    await expectAsync(lookupArg(key)).toBeResolvedTo(undefined);
  });

  it('Gets arguments by JSON path', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const key = uuidv4();
    const jsonPath = '$';
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA);
    const idB = await enqueueToDatabase(queueId, type, argsB);
    await addArgLookup(idA, key, jsonPath);
    await addArgLookup(idB, key, jsonPath);
    await expectAsync(lookupArgs(key)).toBeResolvedTo([argsA, argsB]);
    await expectAsync(lookupArg(key)).toBeResolvedTo(argsA);
  });

  it('Gets selects argument path by JSON path', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const key = uuidv4();
    const jsonPath = '$[0]';
    const argsA = [uuidv4()];
    const argsB = [uuidv4()];
    const idA = await enqueueToDatabase(queueId, type, argsA);
    const idB = await enqueueToDatabase(queueId, type, argsB);
    await addArgLookup(idA, key, jsonPath);
    await addArgLookup(idB, key, jsonPath);
    await expectAsync(lookupArgs(key)).toBeResolvedTo([argsA[0], argsB[0]]);
    await expectAsync(lookupArg(key)).toBeResolvedTo(argsA[0]);
  });

  it('Marks jobs with matching key for cleanup and delete', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const key = uuidv4();
    const jsonPath = '$';
    const args = [uuidv4()];
    const id = await enqueueToDatabase(queueId, type, args);
    await addArgLookup(id, key, jsonPath);
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
    await markJobsWithArgLookupKeyCleanupAndRemoveInDatabase(key);
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
});
