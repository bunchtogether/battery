// @flow

import { JSONPath } from 'jsonpath-plus';
import merge from 'lodash/merge';
import unset from 'lodash/unset';
import EventEmitter from 'events';
import makeLogger from './logger';

// Local job emitter is for this process only,
// jobEmitter is bridged when a MessagePort is open
export const localJobEmitter = new EventEmitter();
export const jobEmitter = new EventEmitter();

const logger = makeLogger('Jobs Database');

export class JobDoesNotExistError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'JobDoesNotExistError';
  }
}

export class CleanupDoesNotExistError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'CleanupDoesNotExistError';
  }
}

export type Job = {
  id: number,
  queueId:string,
  type:string,
  args:Array<any>,
  attempt: number,
  created: number,
  status: number,
  startAfter: number
};


type Cleanup = {
  id: number,
  queueId:string,
  data: Object,
  attempt: number,
  startAfter: number
};

export const QUEUE_ERROR_STATUS = 0;
export const QUEUE_PENDING_STATUS = 1;
export const QUEUE_COMPLETE_STATUS = 2;
export const QUEUE_EMPTY_STATUS = 3;

export const JOB_ABORTED_STATUS = 2;
export const JOB_COMPLETE_STATUS = 1;
export const JOB_PENDING_STATUS = 0;
export const JOB_ERROR_STATUS = -1;
export const JOB_CLEANUP_STATUS = -2;
export const JOB_CLEANUP_AND_REMOVE_STATUS = -3;

export const databasePromise = (async () => {
  const request = self.indexedDB.open('battery-queue-06', 1);

  request.onupgradeneeded = function (e) {
    try {
      const store = e.target.result.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true });
      store.createIndex('statusIndex', 'status', { unique: false });
      store.createIndex('queueIdIndex', 'queueId', { unique: false });
      store.createIndex('queueIdTypeIndex', ['queueId', 'type'], { unique: false });
      store.createIndex('statusQueueIdIndex', ['queueId', 'status'], { unique: false });
      store.createIndex('createdIndex', 'created', { unique: false });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
    try {
      e.target.result.createObjectStore('metadata', { keyPath: 'id' });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
    try {
      const store = e.target.result.createObjectStore('cleanups', { keyPath: 'id' });
      store.createIndex('queueIdIndex', 'queueId', { unique: false });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
    try {
      e.target.result.createObjectStore('auth-data', { keyPath: 'id' });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
    try {
      const store = e.target.result.createObjectStore('arg-lookup', { keyPath: 'id', autoIncrement: true });
      store.createIndex('jobIdIndex', 'jobId', { unique: false });
      store.createIndex('keyIndex', 'key', { unique: false });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
  };

  const db = await new Promise((resolve, reject) => {
    request.onerror = () => {
      reject(new Error('Unable to open database'));
    };
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });

  return db;
})();

async function getReadWriteObjectStore(name:string) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readwrite', { durability: 'relaxed' });
  const objectStore = transaction.objectStore(name);
  transaction.onabort = (event) => {
    logger.error(`Read-write "${name}" transaction was aborted`);
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error(`Error in read-write "${name}" transaction`);
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadOnlyObjectStore(name:string) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readonly', { durability: 'relaxed' });
  const objectStore = transaction.objectStore(name);
  transaction.onabort = (event) => {
    logger.error(`Read-only "${name}" transaction was aborted`);
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error(`Error in read-only "${name}" transaction`);
    logger.errorObject(event);
  };
  return objectStore;
}

function getReadWriteArgLookupObjectStore() {
  return getReadWriteObjectStore('arg-lookup');
}

function getReadOnlyArgLookupObjectStore() {
  return getReadOnlyObjectStore('arg-lookup');
}

function getReadWriteAuthObjectStore() {
  return getReadWriteObjectStore('auth-data');
}

function getReadOnlyAuthObjectStore() {
  return getReadOnlyObjectStore('auth-data');
}

function getReadWriteMetadataObjectStore() {
  return getReadWriteObjectStore('metadata');
}

function getReadOnlyMetadataObjectStore() {
  return getReadOnlyObjectStore('metadata');
}

function getReadWriteJobsObjectStore() {
  return getReadWriteObjectStore('jobs');
}

function getReadOnlyJobsObjectStore() {
  return getReadOnlyObjectStore('jobs');
}

function getReadWriteCleanupsObjectStore() {
  return getReadWriteObjectStore('cleanups');
}

function getReadOnlyCleanupsObjectStore() {
  return getReadOnlyObjectStore('cleanups');
}

async function getReadWriteObjectStoreAndTransactionPromise(name:string) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readwrite', { durability: 'relaxed' });
  const objectStore = transaction.objectStore(name);
  const promise = new Promise((resolve, reject) => {
    transaction.onabort = (event) => {
      logger.error(`Read-write "${name}" transaction was aborted`);
      logger.errorObject(event);
      reject(new Error(`Read-write "${name}" transaction was aborted`));
    };
    transaction.onerror = (event) => {
      logger.error(`Error in read-write "${name}" transaction`);
      logger.errorObject(event);
      reject(new Error(`Error in read-write "${name}" transaction`));
    };
    transaction.oncomplete = () => {
      resolve();
    };
  });
  return [objectStore, promise];
}

async function getReadOnlyObjectStoreAndTransactionPromise(name:string) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readonly', { durability: 'relaxed' });
  const objectStore = transaction.objectStore(name);
  const promise = new Promise((resolve, reject) => {
    transaction.onabort = (event) => {
      logger.error(`Read-write "${name}" transaction was aborted`);
      logger.errorObject(event);
      reject(new Error(`Read-write "${name}" transaction was aborted`));
    };
    transaction.onerror = (event) => {
      logger.error(`Error in read-write "${name}" transaction`);
      logger.errorObject(event);
      reject(new Error(`Error in read-write "${name}" transaction`));
    };
    transaction.oncomplete = () => {
      resolve();
    };
  });
  return [objectStore, promise];
}


function getReadWriteJobsObjectStoreAndTransactionPromise() {
  return getReadWriteObjectStoreAndTransactionPromise('jobs');
}

function getReadOnlyJobsObjectStoreAndTransactionPromise() {
  return getReadOnlyObjectStoreAndTransactionPromise('jobs');
}

function getReadWriteArgLookupObjectStoreAndTransactionPromise() {
  return getReadWriteObjectStoreAndTransactionPromise('arg-lookup');
}

function getReadWriteMetadataObjectStoreAndTransactionPromise() {
  return getReadWriteObjectStoreAndTransactionPromise('metadata');
}

function removeJobFromObjectStore(store:IDBObjectStore, id:number, queueId:string) {
  const deleteRequest = store.delete(id);
  deleteRequest.onsuccess = function () {
    localJobEmitter.emit('jobDelete', id, queueId);
    jobEmitter.emit('jobDelete', id, queueId);
    removeArgLookupsForJobAsMicrotask(id);
  };
  deleteRequest.onerror = function (event) {
    logger.error(`Request error while removing job ${id} in queue ${queueId} from database`);
    logger.errorObject(event);
  };
}

async function clearAllMetadataInDatabase() {
  const store = await getReadWriteMetadataObjectStore();
  const request = store.clear();
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error('Error while clearing queue data database');
      logger.errorObject(event);
      reject(new Error('Error while clearing queue data database'));
    };
  });
}

async function clearJobsDatabase() {
  const store = await getReadWriteJobsObjectStore();
  const request = store.clear();
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error('Error while clearing jobs database');
      logger.errorObject(event);
      reject(new Error('Error while clearing jobs database'));
    };
  });
  localJobEmitter.emit('jobsClear');
  jobEmitter.emit('jobsClear');
}

async function clearCleanupsDatabase() {
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.clear();
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error('Error while clearing cleanups database');
      logger.errorObject(event);
      reject(new Error('Error while clearing cleanups database'));
    };
  });
}

export async function clearDatabase() {
  await clearJobsDatabase();
  await clearCleanupsDatabase();
  await clearAllMetadataInDatabase();
}

export async function removeJobsWithQueueIdAndTypeFromDatabase(queueId:string, type:string) {
  const [store, promise] = await getReadWriteJobsObjectStoreAndTransactionPromise();
  const index = store.index('queueIdTypeIndex');
  // $FlowFixMe
  const request = index.getAllKeys(IDBKeyRange.only([queueId, type]));
  request.onsuccess = function (event) {
    for (const id of event.target.result) {
      removeJobFromObjectStore(store, id, queueId);
    }
  };
  request.onerror = function (event) {
    logger.error(`Request error while removing jobs with queue ${queueId} and type ${type} from jobs database`);
    logger.errorObject(event);
  };
  await promise;
}

export async function removeQueueIdFromJobsDatabase(queueId:string) {
  const [store, promise] = await getReadWriteJobsObjectStoreAndTransactionPromise();
  const index = store.index('queueIdIndex');
  // $FlowFixMe
  const request = index.getAllKeys(IDBKeyRange.only(queueId));
  request.onsuccess = function (event) {
    for (const id of event.target.result) {
      removeJobFromObjectStore(store, id, queueId);
    }
  };
  request.onerror = function (event) {
    logger.error(`Request error while removing queue ${queueId} from jobs database`);
    logger.errorObject(event);
  };
  await promise;
}

async function removeQueueIdFromCleanupsDatabase(queueId:string) {
  const store = await getReadWriteCleanupsObjectStore();
  const index = store.index('queueIdIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.only(queueId));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = function (event) {
      logger.error(`Request error while removing queue ${queueId} from jobs database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing queue ${queueId} from jobs database`));
    };
  });
}

export async function removeQueueIdFromDatabase(queueId:string) {
  await removeQueueIdFromJobsDatabase(queueId);
  await removeQueueIdFromCleanupsDatabase(queueId);
}

export async function removeCompletedExpiredItemsFromDatabase(maxAge:number) {
  const [store, promise] = await getReadWriteJobsObjectStoreAndTransactionPromise();
  const index = store.index('createdIndex');
  // $FlowFixMe
  const request = index.getAll(IDBKeyRange.bound(0, Date.now() - maxAge));
  request.onsuccess = function (event) {
    for (const { id, queueId, status } of event.target.result) {
      if (status !== JOB_COMPLETE_STATUS) {
        continue;
      }
      removeJobFromObjectStore(store, id, queueId);
    }
  };
  request.onerror = function (event) {
    logger.error('Request error while removing completed exired items from jobs database');
    logger.errorObject(event);
  };
  await promise;
}

export async function updateJobInDatabase(id:number, transform:(Job | void) => Job | void | false):Promise<Job | void> {
  const store = await getReadWriteJobsObjectStore();
  const request = store.get(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      let newValue;
      const value = request.result;
      try {
        newValue = transform(value);
      } catch (error) {
        reject(error);
        return;
      }
      if (typeof newValue === 'undefined') {
        resolve();
      } else if (newValue === false) {
        if (typeof value !== 'undefined') {
          const { queueId, type } = value;
          const deleteRequest = store.delete(id);
          deleteRequest.onsuccess = function () {
            localJobEmitter.emit('jobDelete', id, queueId);
            jobEmitter.emit('jobDelete', id, queueId);
            removeArgLookupsForJobAsMicrotask(id);
            resolve();
          };
          deleteRequest.onerror = function (event) {
            logger.error(`Delete request error while updating job ${id} in queue ${queueId} and type ${type} in jobs database`);
            logger.errorObject(event);
            reject(new Error(`Delete request error while updating job ${id} in queue ${queueId} and type ${type} from jobs database`));
          };
        }
      } else {
        const putRequest = store.put(newValue);
        const { queueId, type, status } = newValue;
        putRequest.onsuccess = function () {
          localJobEmitter.emit('jobUpdate', id, queueId, type, status);
          jobEmitter.emit('jobUpdate', id, queueId, type, status);
          resolve();
        };
        putRequest.onerror = function (event) {
          logger.error(`Put request error while updating job ${id} in queue ${queueId} and type ${type} in jobs database`);
          logger.errorObject(event);
          reject(new Error(`Put request error while updating job ${id} in queue ${queueId} and type ${type} from jobs database`));
        };
      }
    };
    request.onerror = function (event) {
      logger.error(`Get request error while updating ${id}`);
      logger.errorObject(event);
      reject(new Error(`Get request error while updating ${id}`));
    };
  });
}

export async function getJobFromDatabase(id:number):Promise<Job | void> {
  const store = await getReadOnlyJobsObjectStore();
  const request = store.get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting ${id}`));
    };
  });
}

export async function updateCleanupInDatabase(id:number, transform:(Cleanup | void) => Object):Promise<Cleanup | void> {
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.get(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      let newValue;
      try {
        newValue = transform(request.result);
      } catch (error) {
        reject(error);
        return;
      }
      if (typeof newValue === 'undefined') {
        resolve();
      } else {
        const putRequest = store.put(newValue);
        putRequest.onsuccess = function () {
          resolve();
        };
        putRequest.onerror = function (event) {
          logger.error(`Put request error while updating ${id} cleanup`);
          logger.errorObject(event);
          reject(new Error(`Put request error while updating ${id} cleanup`));
        };
      }
    };
    request.onerror = function (event) {
      logger.error(`Get request error while updating ${id} cleanup`);
      logger.errorObject(event);
      reject(new Error(`Get request error while updating ${id} cleanup`));
    };
  });
}

export async function removePathFromCleanupDataInDatabase(id:number, path:Array<string>) {
  await updateCleanupInDatabase(id, (value: Cleanup | void) => {
    if (typeof value === 'undefined') {
      return;
    }
    const { queueId, attempt, startAfter } = value;
    const data = Object.assign({}, value.data);
    unset(data, path);
    return { // eslint-disable-line consistent-return
      id,
      queueId,
      attempt,
      startAfter,
      data,
    };
  });
}


export async function updateCleanupValuesInDatabase(id:number, queueId:string, data:Object) {
  if (typeof id !== 'number') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "id" argument type "${typeof id}"`);
  }
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  if (typeof data !== 'object') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "data" argument type "${typeof data}"`);
  }
  await updateCleanupInDatabase(id, (value: Cleanup | void) => {
    const combinedData = typeof value === 'undefined' ? data : merge({}, value.data, data);
    return {
      id,
      queueId,
      attempt: 0,
      startAfter: Date.now(),
      data: combinedData,
    };
  });
}

export async function silentlyRemoveJobFromDatabase(id:number) {
  const store = await getReadWriteJobsObjectStore();
  const request = store.delete(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Delete request error while removing job ${id} from database`);
      logger.errorObject(event);
      reject(new Error(`Delete request error while removing job ${id} from database`));
    };
  });
}

export async function removeJobFromDatabase(id:number) {
  const store = await getReadWriteJobsObjectStore();
  const request = store.get(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      const job = request.result;
      if (typeof job === 'undefined') {
        resolve();
        return;
      }
      const { queueId, type } = job;
      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = function () {
        localJobEmitter.emit('jobDelete', id, queueId);
        jobEmitter.emit('jobDelete', id, queueId);
        removeArgLookupsForJobAsMicrotask(id);
        resolve();
      };
      deleteRequest.onerror = function (event) {
        logger.error(`Delete request error while removing job ${id} in queue ${queueId} with type ${type} from database`);
        logger.errorObject(event);
        reject(new Error(`Delete request error while removing job ${id} in queue ${queueId} with type ${type} from database`));
      };
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting ${id} before removing from database`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting ${id} before removing from database`));
    };
  });
}

export async function removeCleanupFromDatabase(id:number) {
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while removing cleanup data for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Error while removing cleanup data for ${id}`));
    };
  });
}

export async function getCleanupFromDatabase(id:number):Promise<Cleanup | void> {
  const store = await getReadOnlyCleanupsObjectStore();
  const request = store.get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting ${id}`));
    };
  });
}

export async function getMetadataFromDatabase(id:string) {
  const store = await getReadOnlyMetadataObjectStore();
  const request = store.get(id);
  const response = await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting ${id} metadata`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting ${id} metadata`));
    };
  });
  return typeof response !== 'undefined' ? response.metadata : undefined;
}

export async function clearMetadataInDatabase(id:string) {
  const store = await getReadWriteMetadataObjectStore();
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while clearing ${id} metadata`);
      logger.errorObject(event);
      reject(new Error(`Error while clearing ${id} metadata`));
    };
  });
}

export async function setMetadataInDatabase(id:string, metadata:Object) {
  const store = await getReadWriteMetadataObjectStore();
  const request = store.put({
    id,
    metadata,
  });
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while setting ${id} metadata`);
      logger.errorObject(event);
      reject(new Error(`Error while setting ${id} metadata`));
    };
  });
}

export async function updateMetadataInDatabase(id:string, metadata:Object) {
  const [store, promise] = await getReadWriteMetadataObjectStoreAndTransactionPromise();
  const request = store.get(id);
  request.onsuccess = function () {
    const response = request.result;
    if (typeof response === 'undefined') {
      const putRequest = store.put({
        id,
        metadata,
      });
      putRequest.onerror = function (event) {
        logger.error(`Error in put request while updating ${id} metadata`);
        logger.errorObject(event);
      };
    } else {
      const putRequest = store.put({
        id,
        metadata: merge({}, response.metadata, metadata),
      });
      putRequest.onerror = function (event) {
        logger.error(`Error in put request while updating ${id} metadata`);
        logger.errorObject(event);
      };
    }
  };
  request.onerror = function (event) {
    logger.error(`Error while updating ${id} metadata`);
    logger.errorObject(event);
  };
  await promise;
}

export function markJobStatusInDatabase(id:number, status:number) {
  return updateJobInDatabase(id, (value:Job | void) => {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError(`Unable to mark job ${id} as status ${status} in database, job does not exist`);
    }
    value.status = status; // eslint-disable-line no-param-reassign
    return value;
  });
}

export function markJobCompleteInDatabase(id:number) {
  return markJobStatusInDatabase(id, JOB_COMPLETE_STATUS);
}

export function markJobPendingInDatabase(id:number) {
  return markJobStatusInDatabase(id, JOB_PENDING_STATUS);
}

export function markJobErrorInDatabase(id:number) {
  return markJobStatusInDatabase(id, JOB_ERROR_STATUS);
}

export function markJobCleanupInDatabase(id:number) {
  return markJobStatusInDatabase(id, JOB_CLEANUP_STATUS);
}

export function markJobAbortedInDatabase(id:number) {
  return markJobStatusInDatabase(id, JOB_ABORTED_STATUS);
}

export function markJobCleanupAndRemoveInDatabase(id:number) {
  return updateJobInDatabase(id, (value:Job | void) => {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError(`Unable to mark job ${id} as status ${JOB_CLEANUP_AND_REMOVE_STATUS} in database, job does not exist`);
    }
    if (value.status === JOB_PENDING_STATUS) {
      return false;
    }
    if (value.status === JOB_ABORTED_STATUS) {
      return false;
    }
    value.status = JOB_CLEANUP_AND_REMOVE_STATUS; // eslint-disable-line no-param-reassign
    return value;
  });
}

export function markJobAsAbortedOrRemoveFromDatabase(id:number) {
  return updateJobInDatabase(id, (value:Job | void) => {
    if (typeof value === 'undefined') {
      return;
    }
    if (value.status === JOB_ERROR_STATUS) {
      value.status = JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign
      return value; // eslint-disable-line consistent-return
    }
    if (value.status === JOB_CLEANUP_STATUS) {
      value.status = JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign
      return value; // eslint-disable-line consistent-return
    }
    if (value.status === JOB_CLEANUP_AND_REMOVE_STATUS) {
      return false; // eslint-disable-line consistent-return
    }
    throw new Error(`Unable to mark job ${id} as aborted or remove after cleanup, unable to handle status ${value.status}`);
  });
}

export function markJobStartAfterInDatabase(id:number, startAfter:number) {
  return updateJobInDatabase(id, (value:Job | void) => {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError(`Unable to mark job ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, job does not exist`);
    }
    if (startAfter < value.startAfter) {
      return;
    }
    value.startAfter = startAfter; // eslint-disable-line no-param-reassign
    return value; // eslint-disable-line consistent-return
  });
}

export function markCleanupStartAfterInDatabase(id:number, startAfter:number) {
  return updateCleanupInDatabase(id, (value: Cleanup | void) => {
    if (typeof value === 'undefined') {
      throw new CleanupDoesNotExistError(`Unable to mark cleanup ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, cleanup does not exist`);
    }
    if (startAfter < value.startAfter) {
      return;
    }
    value.startAfter = startAfter; // eslint-disable-line  no-param-reassign
    return value; // eslint-disable-line consistent-return
  });
}

export async function markQueueForCleanupInDatabase(queueId:string) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.only(queueId));
  const jobs = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const value = Object.assign({}, cursor.value);
        switch (value.status) {
          case JOB_ERROR_STATUS:
            value.status = JOB_CLEANUP_STATUS;
            jobs.push(value);
            break;
          case JOB_COMPLETE_STATUS:
            value.status = JOB_CLEANUP_STATUS;
            jobs.push(value);
            break;
          case JOB_PENDING_STATUS:
            value.status = JOB_ABORTED_STATUS;
            break;
          case JOB_CLEANUP_STATUS:
            cursor.continue();
            return;
          case JOB_ABORTED_STATUS:
            cursor.continue();
            return;
          default:
            logger.warn(`Unhandled job status ${value.status}`);
            cursor.continue();
            return;
        }
        const updateRequest = cursor.update(value);
        updateRequest.onsuccess = function () {
          localJobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);
          jobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);
          cursor.continue();
        };
        updateRequest.onerror = function (event2) {
          logger.error(`Update request error while marking queue ${queueId} error`);
          logger.errorObject(event2);
          cursor.continue();
        };
      } else {
        resolve();
      }
    };
    request.onerror = function (event) {
      logger.error(`Request error while marking queue ${queueId} error`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking queue ${queueId} error`));
    };
  });
  return jobs;
}

export async function incrementJobAttemptInDatabase(id:number) {
  await updateJobInDatabase(id, (value:Job | void) => {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError(`Unable to increment attempts for job ${id} in database, job does not exist`);
    }
    value.attempt += 1; // eslint-disable-line no-param-reassign
    return value;
  });
}

export async function incrementCleanupAttemptInDatabase(id:number, queueId:string) {
  let attempt = 1;
  await updateCleanupInDatabase(id, (value: Cleanup | void) => {
    if (typeof value === 'undefined') {
      return {
        id,
        queueId,
        attempt: 1,
        startAfter: Date.now(),
        data: {},
      };
    }
    attempt = value.attempt + 1;
    value.attempt = attempt; // eslint-disable-line no-param-reassign
    return value;
  });
  return attempt;
}

export async function bulkEnqueueToDatabase(queueId: string, items:Array<[string, Array<any>]>, delay: number) { // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to bulk enqueue in database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  if (!Array.isArray(items)) {
    throw new TypeError(`Unable to bulk enqueue in database, received invalid "items" argument type "${typeof items}"`);
  }
  for (let i = 0; i < items.length; i += 1) {
    const [type, args] = items[i];
    if (typeof type !== 'string') {
      throw new TypeError(`Unable to bulk enqueue in database, received invalid items[${i}] "type" argument type "${typeof type}"`);
    }
    if (!Array.isArray(args)) {
      throw new TypeError(`Unable to bulk enqueue in database, received invalid items[${i}] "args" argument type "${typeof args}"`);
    }
  }
  if (typeof delay !== 'number') {
    throw new TypeError(`Unable to bulk enqueue in database, received invalid "delay" argument type "${typeof delay}"`);
  }
  const ids = [];
  const store = await getReadWriteJobsObjectStore();
  await new Promise((resolve, reject) => {
    for (let i = 0; i < items.length; i += 1) {
      const [type, args] = items[i];
      const value = {
        queueId,
        type,
        args,
        attempt: 0,
        created: Date.now(),
        status: JOB_PENDING_STATUS,
        startAfter: Date.now() + delay,
      };
      const request = store.put(value);
      request.onsuccess = function () {
        const id = request.result;
        ids.push(request.result);
        localJobEmitter.emit('jobAdd', id, queueId, type);
        jobEmitter.emit('jobAdd', id, queueId, type);
        resolve(request.result);
      };
      request.onerror = function (event) {
        logger.error(`Request error while bulk enqueueing ${items.length} ${items.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`);
        logger.errorObject(event);
        reject(new Error(`Request error while bulk enqueueing ${items.length} ${items.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`));
      };
    }
  });
  return ids;
}

export async function enqueueToDatabase(queueId: string, type: string, args: Array<any>, delay: number) { // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to enqueue in database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  if (typeof type !== 'string') {
    throw new TypeError(`Unable to enqueue in database, received invalid "type" argument type "${typeof type}"`);
  }
  if (!Array.isArray(args)) {
    throw new TypeError(`Unable to enqueue in database, received invalid "args" argument type "${typeof args}"`);
  }
  if (typeof delay !== 'number') {
    throw new TypeError(`Unable to enqueue in database, received invalid "delay" argument type "${typeof delay}"`);
  }
  const value = {
    queueId,
    type,
    args,
    attempt: 0,
    created: Date.now(),
    status: JOB_PENDING_STATUS,
    startAfter: Date.now() + delay,
  };
  const store = await getReadWriteJobsObjectStore();

  const request = store.put(value);
  const id = await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while enqueueing ${type} job`);
      logger.errorObject(event);
      reject(new Error(`Request error while enqueueing ${type} job`));
    };
  });
  localJobEmitter.emit('jobAdd', id, queueId, type);
  jobEmitter.emit('jobAdd', id, queueId, type);
  return id;
}

export async function restoreJobToDatabaseForCleanupAndRemove(id:number, queueId: string, type: string, args: Array<any>) { // eslint-disable-line no-underscore-dangle
  if (typeof id !== 'number') {
    throw new TypeError(`Unable to restore to database, received invalid "id" argument type "${typeof id}"`);
  }
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to restore to database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  if (typeof type !== 'string') {
    throw new TypeError(`Unable to restore to database, received invalid "type" argument type "${typeof type}"`);
  }
  if (!Array.isArray(args)) {
    throw new TypeError(`Unable to restore to database, received invalid "args" argument type "${typeof args}"`);
  }
  const value = {
    id,
    queueId,
    type,
    args,
    attempt: 1,
    created: Date.now(),
    status: JOB_CLEANUP_AND_REMOVE_STATUS,
    startAfter: Date.now(),
  };
  const store = await getReadWriteJobsObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while enqueueing ${type} job`);
      logger.errorObject(event);
      reject(new Error(`Request error while enqueueing ${type} job`));
    };
  });
  localJobEmitter.emit('jobAdd', id, queueId, type);
  jobEmitter.emit('jobAdd', id, queueId, type);
  return id;
}

export async function dequeueFromDatabase():Promise<Array<Job>> { // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusIndex');
  // $FlowFixMe
  const request = index.getAll(IDBKeyRange.bound(JOB_CLEANUP_AND_REMOVE_STATUS, JOB_PENDING_STATUS));
  const jobs = await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      logger.error('Request error while dequeing');
      logger.errorObject(event);
      reject(new Error('Request error while dequeing'));
    };
  });
  return jobs;
}

export function getContiguousIds(ids:Array<number>) {
  ids.sort((a, b) => a - b);
  const points = [[0, ids[0] - 1]];
  for (let i = 0; i < ids.length; i += 1) {
    if (ids[i] + 1 !== ids[i + 1]) {
      if (i + 1 >= ids.length) {
        points.push([ids[i] + 1, Infinity]);
      } else {
        points.push([ids[i] + 1, ids[i + 1] - 1]);
      }
    }
  }
  return points;
}

export async function dequeueFromDatabaseNotIn(ids:Array<number>):Promise<Array<Job>> { // eslint-disable-line no-underscore-dangle
  if (ids.length === 0) {
    return dequeueFromDatabase();
  }
  const [store, promise] = await getReadOnlyJobsObjectStoreAndTransactionPromise();
  const index = store.index('statusIndex');
  const jobs = [];
  // $FlowFixMe
  const request = index.getAllKeys(IDBKeyRange.bound(JOB_CLEANUP_AND_REMOVE_STATUS, JOB_PENDING_STATUS));
  request.onsuccess = function (event) {
    for (const id of event.target.result) {
      if (ids.includes(id)) {
        continue;
      }
      const getRequest = store.get(id);
      getRequest.onsuccess = function () {
        jobs.push(getRequest.result);
      };
      getRequest.onerror = function (event2) {
        logger.error(`Request error while getting job ${id}`);
        logger.errorObject(event2);
      };
    }
  };
  request.onerror = function (event) {
    logger.error('Request error while dequeing');
    logger.errorObject(event);
  };
  await promise;
  return jobs;
}

export async function getJobsInQueueFromDatabase(queueId: string):Promise<Array<Job>> { // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to get jobs in queue from database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('queueIdIndex');
  // $FlowFixMe
  const request = index.getAll(IDBKeyRange.only(queueId));
  const jobs = await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      logger.error('Request error while dequeing');
      logger.errorObject(event);
      reject(new Error('Request error while dequeing'));
    };
  });
  return jobs;
}

export async function getJobsInDatabase(jobIds: Array<number>):Promise<Array<Job>> { // eslint-disable-line no-underscore-dangle
  if (!Array.isArray(jobIds)) {
    throw new TypeError(`Unable to get jobs from database, received invalid "jobIds" argument type "${typeof jobIds}"`);
  }
  const [store, promise] = await getReadOnlyJobsObjectStoreAndTransactionPromise();
  const jobs = [];
  for (const jobId of jobIds) {
    const request = store.get(jobId);
    request.onsuccess = function () {
      if (typeof request.result !== 'undefined') {
        jobs.push(request.result);
      }
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting job ${jobId}`);
      logger.errorObject(event);
    };
  }
  await promise;
  return jobs;
}

export async function getCompletedJobsCountFromDatabase(queueId: string) { // eslint-disable-line no-underscore-dangle
  const jobs = await getCompletedJobsFromDatabase(queueId);
  return jobs.length;
}

export async function getCompletedJobsFromDatabase(queueId: string):Promise<Array<Job>> { // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to get completed jobs database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusQueueIdIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS]));
  const jobs = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        jobs.push(cursor.value);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting completed jobs for queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting completed jobs for queue ${queueId}`));
    };
  });
  return jobs;
}

export async function storeAuthDataInDatabase(id:string, data: Object) { // eslint-disable-line no-underscore-dangle
  if (typeof id !== 'string') {
    throw new TypeError(`Unable to store auth data in database, received invalid "id" argument type "${typeof id}"`);
  }
  if (typeof data !== 'object') {
    throw new TypeError(`Unable to store auth data in database, received invalid "data" argument type "${typeof data}"`);
  }
  const store = await getReadWriteAuthObjectStore();
  const request = store.put({ id, data });
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while storing auth data for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while storing auth data for ${id}`));
    };
  });
}

export async function getAuthDataFromDatabase(id:string) {
  if (typeof id !== 'string') {
    throw new TypeError(`Unable to store auth data in database, received invalid "id" argument type "${typeof id}"`);
  }
  const store = await getReadOnlyAuthObjectStore();
  const request = store.get(id);
  const authData = await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting auth data for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting auth data for ${id}`));
    };
  });
  return typeof authData !== 'undefined' ? authData.data : undefined;
}

export async function removeAuthDataFromDatabase(id:string) {
  if (typeof id !== 'string') {
    throw new TypeError(`Unable to store auth data in database, received invalid "id" argument type "${typeof id}"`);
  }
  const store = await getReadWriteAuthObjectStore();
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while removing auth data for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Error while removing auth data for ${id}`));
    };
  });
}

export async function getQueueStatus(queueId:string) {
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusQueueIdIndex');
  // $FlowFixMe
  const abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ABORTED_STATUS]));
  // $FlowFixMe
  const completeRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS]));
  // $FlowFixMe
  const pendingRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_PENDING_STATUS]));
  // $FlowFixMe
  const errorRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ERROR_STATUS]));
  // $FlowFixMe
  const cleanupRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_CLEANUP_STATUS]));
  // $FlowFixMe
  const cleanupAndRemoveRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_CLEANUP_AND_REMOVE_STATUS]));
  const abortedCountPromise = new Promise((resolve, reject) => {
    abortedRequest.onsuccess = function (event) {
      resolve(event.target.result.length);
    };
    abortedRequest.onerror = function (event) {
      logger.error(`Request error while getting status of queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting status of queue ${queueId}`));
    };
  });
  const completeCountPromise = new Promise((resolve, reject) => {
    completeRequest.onsuccess = function (event) {
      resolve(event.target.result.length);
    };
    completeRequest.onerror = function (event) {
      logger.error(`Request error while getting status of queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting status of queue ${queueId}`));
    };
  });
  const pendingCountPromise = new Promise((resolve, reject) => {
    pendingRequest.onsuccess = function (event) {
      resolve(event.target.result.length);
    };
    pendingRequest.onerror = function (event) {
      logger.error(`Request error while getting status of queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting status of queue ${queueId}`));
    };
  });
  const errorCountPromise = new Promise((resolve, reject) => {
    errorRequest.onsuccess = function (event) {
      resolve(event.target.result.length);
    };
    errorRequest.onerror = function (event) {
      logger.error(`Request error while getting status of queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting status of queue ${queueId}`));
    };
  });
  const cleanupCountPromise = new Promise((resolve, reject) => {
    cleanupRequest.onsuccess = function (event) {
      resolve(event.target.result.length);
    };
    cleanupRequest.onerror = function (event) {
      logger.error(`Request error while getting status of queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting status of queue ${queueId}`));
    };
  });
  const cleanupAndRemoveCountPromise = new Promise((resolve, reject) => {
    cleanupAndRemoveRequest.onsuccess = function (event) {
      resolve(event.target.result.length);
    };
    cleanupAndRemoveRequest.onerror = function (event) {
      logger.error(`Request error while getting status of queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting status of queue ${queueId}`));
    };
  });
  const [
    abortedCount,
    completeCount,
    pendingCount,
    errorCount,
    cleanupCount,
    cleanupAndRemoveCount,
  ] = await Promise.all([
    abortedCountPromise,
    completeCountPromise,
    pendingCountPromise,
    errorCountPromise,
    cleanupCountPromise,
    cleanupAndRemoveCountPromise,
  ]);
  if (abortedCount > 0 || cleanupCount > 0) {
    return QUEUE_ERROR_STATUS;
  }
  if (errorCount > 0 || pendingCount > 0 || cleanupAndRemoveCount > 0) {
    return QUEUE_PENDING_STATUS;
  }
  if (completeCount > 0) {
    return QUEUE_COMPLETE_STATUS;
  }
  return QUEUE_EMPTY_STATUS;
}

export async function addArgLookup(jobId:number, key:string, jsonPath:string) {
  if (typeof jobId !== 'number') {
    throw new TypeError(`Unable add argument lookup, received invalid "jobId" argument type "${typeof jobId}"`);
  }
  if (typeof key !== 'string') {
    throw new TypeError(`Unable add argument lookup, received invalid "key" argument type "${typeof key}"`);
  }
  if (typeof jsonPath !== 'string') {
    throw new TypeError(`Unable add argument lookup, received invalid "jsonPath" argument type "${typeof jsonPath}"`);
  }
  const store = await getReadWriteArgLookupObjectStore();
  const request = store.put({
    jobId,
    key,
    jsonPath,
  });
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while adding argument lookup for job ${jobId} with key "${key}" and JSON path "${jsonPath}"`);
      logger.errorObject(event);
      reject(new Error(`Error while adding argument lookup for job ${jobId} with key "${key}" and JSON path "${jsonPath}"`));
    };
  });
}

export async function getArgLookupJobPathMap(key:string) {
  if (typeof key !== 'string') {
    throw new TypeError(`Unable to lookup arguments, received invalid "key" argument type "${typeof key}"`);
  }
  const store = await getReadOnlyArgLookupObjectStore();
  const index = store.index('keyIndex');
  // $FlowFixMe
  const request = index.getAll(IDBKeyRange.only(key));
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const map: Map<number, string> = new Map(event.target.result.map((x) => [x.jobId, x.jsonPath]));
      resolve(map);
    };
    request.onerror = function (event) {
      logger.error(`Request error looking up arguments for key ${key}`);
      logger.errorObject(event);
      reject(new Error(`Request error looking up arguments for key ${key}`));
    };
  });
}


export async function markJobsWithArgLookupKeyCleanupAndRemoveInDatabase(key:string) {
  const map = await getArgLookupJobPathMap(key);
  for (const jobId of map.keys()) {
    await markJobCleanupAndRemoveInDatabase(jobId);
  }
}

export async function lookupArgs(key:string) {
  const map = await getArgLookupJobPathMap(key);
  if (map.size === 0) {
    return [];
  }
  const jobs = await getJobsInDatabase([...map.keys()]);
  const results = [];
  for (const { id, args } of jobs) {
    const jsonPath = map.get(id);
    if (typeof jsonPath !== 'string') {
      continue;
    }
    for (const result of JSONPath({ path: jsonPath, json: args })) {
      results.push(result);
    }
  }
  return results;
}

export async function lookupArg(key:string) {
  const results = await lookupArgs(key);
  return results[0];
}

function removeArgLookupsForJobAsMicrotask(jobId:number) {
  self.queueMicrotask(() => removeArgLookupsForJob(jobId).catch((error) => {
    logger.error(`Unable to remove argument lookups for job ${jobId} in microtask`);
    logger.errorStack(error);
  }));
}

export async function removeArgLookupsForJob(jobId:number) {
  const [store, promise] = await getReadWriteArgLookupObjectStoreAndTransactionPromise();
  const index = store.index('jobIdIndex');
  // $FlowFixMe
  const request = index.getAllKeys(IDBKeyRange.only(jobId));
  request.onsuccess = function (event) {
    for (const id of event.target.result) {
      const deleteRequest = store.delete(id);
      deleteRequest.onerror = function (deleteEvent) {
        logger.error(`Delete request error while removing argument lookups for job ${jobId}`);
        logger.errorObject(deleteEvent);
      };
    }
  };
  request.onerror = function (event) {
    logger.error(`Request error while removing argument lookups for job ${jobId}`);
    logger.errorObject(event);
  };
  await promise;
}

const UNLOAD_DATA_ID = '_UNLOAD_DATA';

export async function updateUnloadDataInDatabase(transform:(Object | void) => Object | void | false):Promise<Object | void> {
  const store = await getReadWriteMetadataObjectStore();
  const request = store.get(UNLOAD_DATA_ID);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      let newValue;
      const response = request.result;
      const value = typeof response !== 'undefined' ? response.metadata : undefined;
      try {
        newValue = transform(value);
      } catch (error) {
        reject(error);
        return;
      }
      if (typeof newValue === 'undefined') {
        resolve();
      } else if (newValue === false) {
        if (typeof value !== 'undefined') {
          const deleteRequest = store.delete(UNLOAD_DATA_ID);
          deleteRequest.onsuccess = function () {
            resolve();
          };
          deleteRequest.onerror = function (event) {
            logger.error('Delete request error while updating unload data in metadata database');
            logger.errorObject(event);
            reject(new Error('Delete request error while updating unload data in metadata database'));
          };
        }
      } else {
        const putRequest = store.put({
          id: UNLOAD_DATA_ID,
          metadata: newValue,
        });
        putRequest.onsuccess = function () {
          resolve();
        };
        putRequest.onerror = function (event) {
          logger.error('Put request error while updating unload data in metadata database');
          logger.errorObject(event);
          reject(new Error('Put request error while updating unload data in metadata database'));
        };
      }
    };
    request.onerror = function (event) {
      logger.error('Get request error while updating unload data in metadata database');
      logger.errorObject(event);
      reject(new Error('Get request error while updating unload data in metadata database'));
    };
  });
}

export function getUnloadDataFromDatabase() {
  return getMetadataFromDatabase(UNLOAD_DATA_ID);
}

export function clearUnloadDataInDatabase() {
  return clearMetadataInDatabase(UNLOAD_DATA_ID);
}

