// @flow

import { merge, unset } from 'lodash';
import makeLogger from './logger';

const logger = makeLogger('Operations Database');

type Operation = {
  id: number,
  queueId:string,
  type:string,
  args:Array<any>,
  attemptsRemaining: number,
  created: number,
  status: number,
  startAfter: number
}

export const OPERATION_ABORTED_STATUS = 2;
export const OPERATION_COMPLETE_STATUS = 1;
export const OPERATION_PENDING_STATUS = 0;
export const OPERATION_ERROR_STATUS = -1;
export const OPERATION_CLEANUP_STATUS = -2;

export const databasePromise = (async () => {
  const request = self.indexedDB.open('operations-009', 1);

  request.onupgradeneeded = function (e) {
    try {
      const store = e.target.result.createObjectStore('operations', { keyPath: 'id', autoIncrement: true });
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
      e.target.result.createObjectStore('auth', { keyPath: 'teamId' });
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
  const transaction = database.transaction(['auth'], 'readwrite');
  const objectStore = transaction.objectStore('auth');
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
  const transaction = database.transaction(['auth'], 'readonly');
  const objectStore = transaction.objectStore('auth');
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

async function getReadWriteOperationsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['operations'], 'readwrite');
  const objectStore = transaction.objectStore('operations');
  transaction.onabort = (event) => {
    logger.error('Read-write operations transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-write operations transaction');
    logger.errorObject(event);
  };
  return objectStore;
}

async function getReadOnlyOperationsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['operations'], 'readonly');
  const objectStore = transaction.objectStore('operations');
  transaction.onabort = (event) => {
    logger.error('Read-only operations transaction was aborted');
    logger.errorObject(event);
  };
  transaction.onerror = (event) => {
    logger.error('Error in read-only operations transaction');
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

async function clearOperationsDatabase() {
  const store = await getReadWriteOperationsObjectStore();
  const request = store.clear();
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error('Error while clearing operations database');
      logger.errorObject(event);
      reject(new Error('Error while clearing operations database'));
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
  await clearOperationsDatabase();
  await clearCleanupsDatabase();
  await clearQueueDataDatabase();
}

export async function removeOperationsWithQueueIdAndTypeFromDatabase(queueId:string, type:string) {
  const store = await getReadWriteOperationsObjectStore();
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
      logger.error(`Request error while removing operations with queue ${queueId} and type ${type} from operations database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing operations with queue ${queueId} and type ${type} from operations database`));
    };
  });
}

async function removeQueueIdFromOperationsDatabase(queueId:string) {
  const store = await getReadWriteOperationsObjectStore();
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
      logger.error(`Request error while removing queue ${queueId} from operations database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing queue ${queueId} from operations database`));
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
      logger.error(`Request error while removing queue ${queueId} from operations database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing queue ${queueId} from operations database`));
    };
  });
}

export async function removeQueueIdFromDatabase(queueId:string) {
  await removeQueueIdFromOperationsDatabase(queueId);
  await removeQueueIdFromCleanupsDatabase(queueId);
}

export async function removeCompletedExpiredItemsFromDatabase(maxAge:number) {
  const store = await getReadWriteOperationsObjectStore();
  const index = store.index('statusCreatedIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.bound([OPERATION_COMPLETE_STATUS, 0], [OPERATION_COMPLETE_STATUS, Date.now() - maxAge]));
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
      logger.error('Request error while removing completed exired items from operations database');
      logger.errorObject(event);
      reject(new Error('Request error while removing completed exired items from operations database'));
    };
  });
  for (const queueId of queueIds) {
    await removeQueueIdFromDatabase(queueId);
  }
}

export async function getOperationFromDatabase(id:number):Promise<Operation | void> {
  const store = await getReadOnlyOperationsObjectStore();
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

export async function removePathFromCleanupDataInDatabase(id:number, queueId:string, path:Array<string>) {
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.put({
    id,
    queueId,
    data: unset(value || {}, path),
  });
  return new Promise((resolve, reject) => {
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
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.put({
    id,
    queueId,
    data: merge({}, value, data),
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

export async function getCleanupFromDatabase(id:number) {
  const store = await getReadOnlyCleanupsObjectStore();
  const request = store.get(id);
  const cleanupData = await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting ${id}`));
    };
  });
  return typeof cleanupData !== 'undefined' ? cleanupData.data : undefined;
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

export async function markOperationStatusInDatabase(id:number, status:number) {
  const value = await getOperationFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to mark ${id} as statys ${status} in database, operation does not exist`);
  }
  value.status = status;
  const store = await getReadWriteOperationsObjectStore();
  const request = store.put(value);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while marking ${id} complete`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking ${id} complete`));
    };
  });
}

export function markOperationCompleteInDatabase(id:number) {
  return markOperationStatusInDatabase(id, OPERATION_COMPLETE_STATUS);
}

export function markOperationPendingInDatabase(id:number) {
  return markOperationStatusInDatabase(id, OPERATION_PENDING_STATUS);
}

export function markOperationErrorInDatabase(id:number) {
  return markOperationStatusInDatabase(id, OPERATION_ERROR_STATUS);
}

export function markOperationCleanupInDatabase(id:number) {
  return markOperationStatusInDatabase(id, OPERATION_CLEANUP_STATUS);
}

export function markOperationAbortedInDatabase(id:number) {
  return markOperationStatusInDatabase(id, OPERATION_ABORTED_STATUS);
}

export async function markQueueForCleanupInDatabase(queueId:string) {
  const store = await getReadWriteOperationsObjectStore();
  const index = store.index('queueIdIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.only(queueId));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const value = Object.assign({}, cursor.value);
        switch (value.status) {
          case OPERATION_ERROR_STATUS:
            value.status = OPERATION_CLEANUP_STATUS;
            break;
          case OPERATION_COMPLETE_STATUS:
            value.status = OPERATION_CLEANUP_STATUS;
            break;
          case OPERATION_PENDING_STATUS:
            value.status = OPERATION_ABORTED_STATUS;
            break;
          case OPERATION_CLEANUP_STATUS:
            cursor.continue();
            return;
          case OPERATION_ABORTED_STATUS:
            cursor.continue();
            return;
          default:
            logger.warn(`Unhandled operation status ${value.status}`);
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
}

export async function incrementAttemptsRemainingInDatabase(id:number) {
  const value = await getOperationFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to increment attempts remaining for operation ${id} in database, operation does not exist`);
  }
  const attemptsRemaining = value.attemptsRemaining + 1;
  value.attemptsRemaining = attemptsRemaining;
  const store = await getReadWriteOperationsObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while increment attempts remaining for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while increment attempts remaining for ${id}`));
    };
  });
  return attemptsRemaining;
}

export async function decrementAttemptsRemainingInDatabase(id:number) {
  const value = await getOperationFromDatabase(id);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to decrement attempts remaining for operation ${id} in database, operation does not exist`);
  }
  const attemptsRemaining = value.attemptsRemaining - 1;
  value.attemptsRemaining = attemptsRemaining;
  const store = await getReadWriteOperationsObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Request error while decrementing attempts remaining for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while decrementing attempts remaining for ${id}`));
    };
  });
  return attemptsRemaining;
}

export async function bulkEnqueueToDatabase(queueId: string, items:Array<[string, Array<any>, number]>, delay: number) { // eslint-disable-line no-underscore-dangle
  const store = await getReadWriteOperationsObjectStore();
  await new Promise((resolve, reject) => {
    for (let i = 0; i < items.length; i += 1) {
      const [type, args, maxAttempts] = items[i];
      const value = {
        queueId,
        type,
        args,
        attemptsRemaining: maxAttempts,
        created: Date.now(),
        status: OPERATION_PENDING_STATUS,
        startAfter: Date.now() + delay,
      };
      const request = store.put(value);
      if (i === items.length - 1) {
        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function (event) {
          logger.error(`Request error while bulk enqueueing ${items.length} ${items.length === 1 ? 'operation' : 'operations'} in queue ${queueId}`);
          logger.errorObject(event);
          reject(new Error(`Request error while bulk enqueueing ${items.length} ${items.length === 1 ? 'operation' : 'operations'} in queue ${queueId}`));
        };
      }
    }
  });
}

export async function enqueueToDatabase(queueId: string, type: string, args: Array<any>, maxAttempts: number, delay: number) { // eslint-disable-line no-underscore-dangle
  const value = {
    queueId,
    type,
    args,
    attemptsRemaining: maxAttempts,
    created: Date.now(),
    status: OPERATION_PENDING_STATUS,
    startAfter: Date.now() + delay,
  };
  const store = await getReadWriteOperationsObjectStore();
  const request = store.put(value);
  const id = await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while enqueueing ${type} operation`);
      logger.errorObject(event);
      reject(new Error(`Request error while enqueueing ${type} operation`));
    };
  });
  return id;
}

export async function dequeueFromDatabase():Promise<Array<Operation>> { // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyOperationsObjectStore();
  const index = store.index('statusIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.bound(OPERATION_CLEANUP_STATUS, OPERATION_PENDING_STATUS));
  const operations = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        operations.push(cursor.value);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = function (event) {
      logger.error('Request error while dequeing');
      logger.errorObject(event);
      reject(new Error('Request error while dequeing'));
    };
  });
  return operations;
}

export async function getCompletedOperationsCountFromDatabase(queueId: string) { // eslint-disable-line no-underscore-dangle
  const operations = await getCompletedOperationsFromDatabase(queueId);
  return operations.length;
}

export async function getCompletedOperationsFromDatabase(queueId: string):Promise<Array<Operation>> { // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyOperationsObjectStore();
  const index = store.index('statusQueueIdIndex');
  // $FlowFixMe
  const request = index.openCursor(IDBKeyRange.only([queueId, OPERATION_COMPLETE_STATUS]));
  const operations = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        operations.push(cursor.value);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting completed operations for queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting completed operations for queue ${queueId}`));
    };
  });
  return operations;
}

export async function storeAuthDataInDatabase(value: Object) { // eslint-disable-line no-underscore-dangle
  const store = await getReadWriteAuthObjectStore();
  const request = store.put(value);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error('Request error while storing auth data');
      logger.errorObject(event);
      reject(new Error('Request error while storing auth data'));
    };
  });
}

export async function getAuthDataFromDatabase(teamId:string) {
  const store = await getReadOnlyAuthObjectStore();
  const request = store.get(teamId);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (event) {
      logger.error(`Request error while getting auth data for team ${teamId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting auth data for team ${teamId}`));
    };
  });
}

export async function removeAuthDataFromDatabase(teamId:string) {
  const store = await getReadWriteAuthObjectStore();
  const request = store.delete(teamId);
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };
    request.onerror = function (event) {
      logger.error(`Error while removing auth data for ${teamId}`);
      logger.errorObject(event);
      reject(new Error(`Error while removing auth data for ${teamId}`));
    };
  });
}
