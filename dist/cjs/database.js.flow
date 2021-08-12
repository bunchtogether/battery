// @flow

import merge from 'lodash/merge';
import unset from 'lodash/unset';
import makeLogger from './logger';

const logger = makeLogger('Jobs Database');

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


export const JOB_ABORTED_STATUS = 2;
export const JOB_COMPLETE_STATUS = 1;
export const JOB_PENDING_STATUS = 0;
export const JOB_ERROR_STATUS = -1;
export const JOB_CLEANUP_STATUS = -2;

export const databasePromise = (async () => {
  const request = self.indexedDB.open('battery-queue-01', 2);

  request.onupgradeneeded = function (e) {
    try {
      const store = e.target.result.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true });
      store.createIndex('statusIndex', 'status', { unique: false });
      store.createIndex('queueIdIndex', 'queueId', { unique: false });
      store.createIndex('queueIdTypeIndex', ['queueId', 'type'], { unique: false });
      store.createIndex('statusQueueIdIndex', ['queueId', 'status'], { unique: false });
      store.createIndex('statusCreatedIndex', ['status', 'created'], { unique: false });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
    try {
      e.target.result.createObjectStore('queue-data', { keyPath: 'queueId' });
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

async function getReadWriteAuthObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['auth-data'], 'readwrite');
  const objectStore = transaction.objectStore('auth-data');
  transaction.onabort = (event) => {
    logger.error('Read-write auth transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-write auth transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadOnlyAuthObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['auth-data'], 'readonly');
  const objectStore = transaction.objectStore('auth-data');
  transaction.onabort = (event) => {
    logger.error('Read-only auth transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-only auth transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadWriteQueueDataObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['queue-data'], 'readwrite');
  const objectStore = transaction.objectStore('queue-data');
  transaction.onabort = (event) => {
    logger.error('Read-write queue data transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-write queue data transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadOnlyQueueDataObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['queue-data'], 'readonly');
  const objectStore = transaction.objectStore('queue-data');
  transaction.onabort = (event) => {
    logger.error('Read-only queue data transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-only queue data transaction');
    logger.errorObject(event);
  };
  return objectStore;
}


async function getReadWriteJobsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readwrite');
  const objectStore = transaction.objectStore('jobs');
  transaction.onabort = (event) => {
    logger.error('Read-write jobs transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-write jobs transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadOnlyJobsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readonly');
  const objectStore = transaction.objectStore('jobs');
  transaction.onabort = (event) => {
    logger.error('Read-only jobs transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-only jobs transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadWriteCleanupsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['cleanups'], 'readwrite');
  const objectStore = transaction.objectStore('cleanups');
  transaction.onabort = (event) => {
    logger.error('Read-write cleanups transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-write cleanups transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadOnlyCleanupsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['cleanups'], 'readonly');
  const objectStore = transaction.objectStore('cleanups');
  transaction.onabort = (event) => {
    logger.error('Read-only cleanups transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-only cleanups transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function clearQueueDataDatabase() {
  const store = await getReadWriteQueueDataObjectStore();
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
  await clearQueueDataDatabase();
}

export async function removeJobsWithQueueIdAndTypeFromDatabase(queueId:string, type:string) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdTypeIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.only([queueId, type]));
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
      logger.error(`Request error while removing jobs with queue ${queueId} and type ${type} from jobs database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing jobs with queue ${queueId} and type ${type} from jobs database`));
    };
  });
}

async function removeQueueIdFromJobsDatabase(queueId:string) {
  const store = await getReadWriteJobsObjectStore();
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
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('statusCreatedIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.bound([JOB_COMPLETE_STATUS, 0], [JOB_COMPLETE_STATUS, Date.now() - maxAge]));
  const queueIds = new Set();
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        queueIds.add(cursor.value.queueId);
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = function (event) {
      logger.error('Request error while removing completed exired items from jobs database');
      logger.errorObject(event);
      reject(new Error('Request error while removing completed exired items from jobs database'));
    };
  });
  for (const queueId of queueIds) {
    await removeQueueIdFromDatabase(queueId);
  }
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

export async function removePathFromCleanupDataInDatabase(id:number, path:Array<string>) {
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  if (typeof value === 'undefined') {
    return;
  }
  const { queueId, attempt, startAfter } = value;
  const data = Object.assign({}, value.data);
  unset(data, path);
  const request = store.put({
    id,
    queueId,
    attempt,
    startAfter,
    data,
  });
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while removing path ${Array.isArray(path) ? path.join('.') : path} from cleanup data for ${id} in queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Error while removing path ${Array.isArray(path) ? path.join('.') : path} from cleanup data for ${id} in queue ${queueId}`));
    };
  });
}

export async function updateCleanupInDatabase(id:number, queueId:string, data:Object) {
  if (typeof id !== 'number') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "id" argument type "${typeof id}"`);
  }
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "queueId" argument type "${typeof queueId}"`);
  }
  if (typeof data !== 'object') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "data" argument type "${typeof data}"`);
  }
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  const combinedData = typeof value === 'undefined' ? data : merge({}, value.data, data);
  const request = store.put({
    id,
    queueId,
    attempt: 0,
    startAfter: Date.now(),
    data: combinedData,
  });
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while updating cleanup data for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Error while updating cleanup data for ${id}`));
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

export async function getQueueDataFromDatabase(queueId:string) {
  const store = await getReadOnlyQueueDataObjectStore();
  const request = store.get(queueId);
  const queueData = await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting queue ${queueId} data`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting queue ${queueId} data`));
    };
  });
  return typeof queueData !== 'undefined' ? queueData.data : undefined;
}

export async function updateQueueDataInDatabase(queueId:string, data:Object) {
  const value = await getQueueDataFromDatabase(queueId);
  const store = await getReadWriteQueueDataObjectStore();
  const request = store.put({
    queueId,
    data: merge({}, value, data),
  });
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while updating queue ${queueId} data`);
      logger.errorObject(event);
      reject(new Error(`Error while updating queue ${queueId} data`));
    };
  });
}

export async function markJobStatusInDatabase(id:number, status:number) {
  const value = await getJobFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to mark job ${id} as status ${status} in database, job does not exist`);
  }
  value.status = status;
  const store = await getReadWriteJobsObjectStore();
  const request = store.put(value);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while marking job ${id} as status ${status}`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking job ${id} as status ${status}`));
    };
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

export async function markJobStartAfterInDatabase(id:number, startAfter:number) {
  const value = await getJobFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to mark job ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, job does not exist`);
  }
  if (startAfter < value.startAfter) {
    return;
  }
  value.startAfter = startAfter;
  const store = await getReadWriteJobsObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while marking job ${id} start-after time to ${new Date(startAfter).toLocaleString()}`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking job ${id} start-after time to ${new Date(startAfter).toLocaleString()}`));
    };
  });
}

export async function markCleanupStartAfterInDatabase(id:number, startAfter:number) {
  const value = await getCleanupFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to mark cleanup ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, cleanup does not exist`);
  }
  if (startAfter < value.startAfter) {
    return;
  }
  value.startAfter = startAfter;
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while marking cleanup ${id} start-after time to ${new Date(startAfter).toLocaleString()}`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking cleanup ${id} start-after time to ${new Date(startAfter).toLocaleString()}`));
    };
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
  const value = await getJobFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to increment attempts for job ${id} in database, job does not exist`);
  }
  const attempt = value.attempt + 1;
  value.attempt = attempt;
  const store = await getReadWriteJobsObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while incrementing attempt to ${attempt} for job ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while incrementing attempt to ${attempt} for job ${id}`));
    };
  });
  return attempt;
}

export async function incrementCleanupAttemptInDatabase(id:number, queueId:string) {
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  if (typeof value === 'undefined') {
    const request = store.put({
      id,
      queueId,
      attempt: 1,
      startAfter: Date.now(),
      data: {},
    });
    await new Promise((resolve, reject) => {
      request.onsuccess = function () {
        resolve();
      };
      request.onerror = function (event) {
        logger.error(`Request error while incrementing attempt to 1 for cleanup ${id}`);
        logger.errorObject(event);
        reject(new Error(`Request error while incrementing attempt to 1 for cleanup ${id}`));
      };
    });
    return 1;
  }
  const attempt = value.attempt + 1;
  value.attempt = attempt;
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while incrementing attempt to ${attempt} for cleanup ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while incrementing attempt to ${attempt} for cleanup ${id}`));
    };
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
      if (i === items.length - 1) {
        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function (event) {
          logger.error(`Request error while bulk enqueueing ${items.length} ${items.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`);
          logger.errorObject(event);
          reject(new Error(`Request error while bulk enqueueing ${items.length} ${items.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`));
        };
      }
    }
  });
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
  return id;
}

export async function dequeueFromDatabase():Promise<Array<Job>> { // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusIndex');
  // $FlowFixMe
  const request = index.getAll(IDBKeyRange.bound(JOB_CLEANUP_STATUS, JOB_PENDING_STATUS));
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
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readonly');
  const store = transaction.objectStore('jobs');
  const index = store.index('statusIndex');
  const jobs = [];
  const promise = new Promise((resolve, reject) => {
    transaction.onabort = (event) => {
      logger.error('Read-write jobs transaction was aborted');
      logger.errorObject(event);
      reject(new Error('Read-write jobs transaction was aborted'));
    };
    transaction.onerror = (event) => {
      logger.error('Error in read-write jobs transaction');
      logger.errorObject(event);
      reject(new Error('Error in read-write jobs transaction'));
    };
    transaction.oncomplete = () => {
      resolve();
    };
  });
  // $FlowFixMe
  const request = index.getAllKeys(IDBKeyRange.bound(JOB_CLEANUP_STATUS, JOB_PENDING_STATUS));
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
