import merge from 'lodash/merge';
import unset from 'lodash/unset';
import EventEmitter from 'events';
import makeLogger from './logger'; // Local job emitter is for this process only,
// jobEmitter is bridged when a MessagePort is open

export const localJobEmitter = new EventEmitter();
export const jobEmitter = new EventEmitter();
const logger = makeLogger('Jobs Database');
export const QUEUE_ERROR_STATUS = 0;
export const QUEUE_PENDING_STATUS = 1;
export const QUEUE_COMPLETE_STATUS = 2;
export const QUEUE_EMPTY_STATUS = 3;
export const JOB_ABORTED_STATUS = 2;
export const JOB_COMPLETE_STATUS = 1;
export const JOB_PENDING_STATUS = 0;
export const JOB_ERROR_STATUS = -1;
export const JOB_CLEANUP_STATUS = -2;
export const databasePromise = (async () => {
  const request = self.indexedDB.open('battery-queue-01', 2);

  request.onupgradeneeded = function (e) {
    try {
      const store = e.target.result.createObjectStore('jobs', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('statusIndex', 'status', {
        unique: false
      });
      store.createIndex('queueIdIndex', 'queueId', {
        unique: false
      });
      store.createIndex('queueIdTypeIndex', ['queueId', 'type'], {
        unique: false
      });
      store.createIndex('statusQueueIdIndex', ['queueId', 'status'], {
        unique: false
      });
      store.createIndex('createdIndex', 'created', {
        unique: false
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      e.target.result.createObjectStore('queue-data', {
        keyPath: 'queueId'
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      const store = e.target.result.createObjectStore('cleanups', {
        keyPath: 'id'
      });
      store.createIndex('queueIdIndex', 'queueId', {
        unique: false
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      e.target.result.createObjectStore('auth-data', {
        keyPath: 'id'
      });
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

  transaction.onabort = event => {
    logger.error('Read-write auth transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write auth transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadOnlyAuthObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['auth-data'], 'readonly');
  const objectStore = transaction.objectStore('auth-data');

  transaction.onabort = event => {
    logger.error('Read-only auth transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-only auth transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadWriteQueueDataObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['queue-data'], 'readwrite');
  const objectStore = transaction.objectStore('queue-data');

  transaction.onabort = event => {
    logger.error('Read-write queue data transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write queue data transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadOnlyQueueDataObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['queue-data'], 'readonly');
  const objectStore = transaction.objectStore('queue-data');

  transaction.onabort = event => {
    logger.error('Read-only queue data transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-only queue data transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadWriteJobsObjectStoreAndTransactionPromise() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readwrite');
  const objectStore = transaction.objectStore('jobs');
  const promise = new Promise((resolve, reject) => {
    transaction.onabort = event => {
      logger.error('Read-write jobs transaction was aborted');
      logger.errorObject(event);
      reject(new Error('Read-write jobs transaction was aborted'));
    };

    transaction.onerror = event => {
      logger.error('Error in read-write jobs transaction');
      logger.errorObject(event);
      reject(new Error('Error in read-write jobs transaction'));
    };

    transaction.oncomplete = () => {
      resolve();
    };
  });
  return [objectStore, promise];
}

async function getReadOnlyJobsObjectStoreAndTransactionPromise() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readonly');
  const objectStore = transaction.objectStore('jobs');
  const promise = new Promise((resolve, reject) => {
    transaction.onabort = event => {
      logger.error('Read-only jobs transaction was aborted');
      logger.errorObject(event);
      reject(new Error('Read-only jobs transaction was aborted'));
    };

    transaction.onerror = event => {
      logger.error('Error in read-only jobs transaction');
      logger.errorObject(event);
      reject(new Error('Error in read-only jobs transaction'));
    };

    transaction.oncomplete = () => {
      resolve();
    };
  });
  return [objectStore, promise];
}

async function getReadWriteJobsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readwrite');
  const objectStore = transaction.objectStore('jobs');

  transaction.onabort = event => {
    logger.error('Read-write jobs transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write jobs transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadOnlyJobsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs'], 'readonly');
  const objectStore = transaction.objectStore('jobs');

  transaction.onabort = event => {
    logger.error('Read-only jobs transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-only jobs transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadWriteCleanupsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['cleanups'], 'readwrite');
  const objectStore = transaction.objectStore('cleanups');

  transaction.onabort = event => {
    logger.error('Read-write cleanups transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write cleanups transaction');
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadOnlyCleanupsObjectStore() {
  const database = await databasePromise;
  const transaction = database.transaction(['cleanups'], 'readonly');
  const objectStore = transaction.objectStore('cleanups');

  transaction.onabort = event => {
    logger.error('Read-only cleanups transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
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
  await clearQueueDataDatabase();
}
export async function removeJobsWithQueueIdAndTypeFromDatabase(queueId, type) {
  const [store, promise] = await getReadWriteJobsObjectStoreAndTransactionPromise();
  const index = store.index('queueIdTypeIndex'); // $FlowFixMe

  const request = index.getAllKeys(IDBKeyRange.only([queueId, type]));

  request.onsuccess = function (event) {
    for (const id of event.target.result) {
      localJobEmitter.emit('jobDelete', id, queueId);
      jobEmitter.emit('jobDelete', id, queueId);
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = function (deleteEvent) {
        logger.error(`Request error while removing job ${id} in queue ${queueId} and type ${type} from jobs database`);
        logger.errorObject(deleteEvent);
      };
    }
  };

  request.onerror = function (event) {
    logger.error(`Request error while removing jobs with queue ${queueId} and type ${type} from jobs database`);
    logger.errorObject(event);
  };

  await promise;
}
export async function removeQueueIdFromJobsDatabase(queueId) {
  const [store, promise] = await getReadWriteJobsObjectStoreAndTransactionPromise();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAllKeys(IDBKeyRange.only(queueId));

  request.onsuccess = function (event) {
    for (const id of event.target.result) {
      localJobEmitter.emit('jobDelete', id, queueId);
      jobEmitter.emit('jobDelete', id, queueId);
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = function (deleteEvent) {
        logger.error(`Request error while removing job ${id} in queue ${queueId} from jobs database`);
        logger.errorObject(deleteEvent);
      };
    }
  };

  request.onerror = function (event) {
    logger.error(`Request error while removing queue ${queueId} from jobs database`);
    logger.errorObject(event);
  };

  await promise;
}

async function removeQueueIdFromCleanupsDatabase(queueId) {
  const store = await getReadWriteCleanupsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

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

export async function removeQueueIdFromDatabase(queueId) {
  await removeQueueIdFromJobsDatabase(queueId);
  await removeQueueIdFromCleanupsDatabase(queueId);
}
export async function removeCompletedExpiredItemsFromDatabase(maxAge) {
  const [store, promise] = await getReadWriteJobsObjectStoreAndTransactionPromise();
  const index = store.index('createdIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.bound(0, Date.now() - maxAge));

  request.onsuccess = function (event) {
    for (const {
      id,
      queueId,
      status
    } of event.target.result) {
      if (status !== JOB_COMPLETE_STATUS) {
        continue;
      }

      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = function () {
        localJobEmitter.emit('jobDelete', id, queueId);
        jobEmitter.emit('jobDelete', id, queueId);
      };

      deleteRequest.onerror = function (deleteEvent) {
        logger.error(`Request error while removing job ${id} in queue ${queueId} from completed exired items from jobs database`);
        logger.errorObject(deleteEvent);
      };
    }
  };

  request.onerror = function (event) {
    logger.error('Request error while removing completed exired items from jobs database');
    logger.errorObject(event);
  };

  await promise;
}
export async function updateJobInDatabase(id, transform) {
  const store = await getReadWriteJobsObjectStore();
  const request = store.get(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      const newValue = transform(request.result);

      if (typeof newValue === 'undefined') {
        resolve();
      } else {
        const putRequest = store.put(newValue);

        putRequest.onsuccess = function () {
          localJobEmitter.emit('jobUpdate', newValue.id, newValue.queueId, newValue.type, newValue.status);
          jobEmitter.emit('jobUpdate', newValue.id, newValue.queueId, newValue.type, newValue.status);
          resolve();
        };

        putRequest.onerror = function (event) {
          logger.error(`Put request error while updating ${id}`);
          logger.errorObject(event);
          reject(new Error(`Put request error while updating ${id}`));
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
export async function getJobFromDatabase(id) {
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
export async function updateCleanupInDatabase(id, transform) {
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.get(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      const newValue = transform(request.result);

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
export async function removePathFromCleanupDataInDatabase(id, path) {
  await updateCleanupInDatabase(id, value => {
    if (typeof value === 'undefined') {
      return;
    }

    const {
      queueId,
      attempt,
      startAfter
    } = value;
    const data = Object.assign({}, value.data);
    unset(data, path);
    return {
      // eslint-disable-line consistent-return
      id,
      queueId,
      attempt,
      startAfter,
      data
    };
  });
}
export async function updateCleanupValuesInDatabase(id, queueId, data) {
  if (typeof id !== 'number') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "id" argument type "${typeof id}"`);
  }

  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "queueId" argument type "${typeof queueId}"`);
  }

  if (typeof data !== 'object') {
    throw new TypeError(`Unable to update cleanup in database, received invalid "data" argument type "${typeof data}"`);
  }

  await updateCleanupInDatabase(id, value => {
    const combinedData = typeof value === 'undefined' ? data : merge({}, value.data, data);
    return {
      id,
      queueId,
      attempt: 0,
      startAfter: Date.now(),
      data: combinedData
    };
  });
}
export async function removeCleanupFromDatabase(id) {
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
export async function getCleanupFromDatabase(id) {
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
export async function getQueueDataFromDatabase(queueId) {
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
export async function updateQueueDataInDatabase(queueId, data) {
  const value = await getQueueDataFromDatabase(queueId);
  const store = await getReadWriteQueueDataObjectStore();
  const request = store.put({
    queueId,
    data: merge({}, value, data)
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
export async function markJobStatusInDatabase(id, status) {
  return updateJobInDatabase(id, value => {
    if (typeof value === 'undefined') {
      throw new Error(`Unable to mark job ${id} as status ${status} in database, job does not exist`);
    }

    value.status = status; // eslint-disable-line no-param-reassign

    return value;
  });
}
export function markJobCompleteInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_COMPLETE_STATUS);
}
export function markJobPendingInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_PENDING_STATUS);
}
export function markJobErrorInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_ERROR_STATUS);
}
export function markJobCleanupInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_CLEANUP_STATUS);
}
export function markJobAbortedInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_ABORTED_STATUS);
}
export async function markJobStartAfterInDatabase(id, startAfter) {
  return updateJobInDatabase(id, value => {
    if (typeof value === 'undefined') {
      throw new Error(`Unable to mark job ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, job does not exist`);
    }

    if (startAfter < value.startAfter) {
      return;
    }

    value.startAfter = startAfter; // eslint-disable-line no-param-reassign

    return value; // eslint-disable-line consistent-return
  });
}
export async function markCleanupStartAfterInDatabase(id, startAfter) {
  await updateCleanupInDatabase(id, value => {
    if (typeof value === 'undefined') {
      throw new Error(`Unable to mark cleanup ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, cleanup does not exist`);
    }

    if (startAfter < value.startAfter) {
      return;
    }

    value.startAfter = startAfter; // eslint-disable-line  no-param-reassign

    return value; // eslint-disable-line consistent-return
  });
}
export async function markQueueForCleanupInDatabase(queueId) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

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
export async function incrementJobAttemptInDatabase(id) {
  await updateJobInDatabase(id, value => {
    if (typeof value === 'undefined') {
      throw new Error(`Unable to increment attempts for job ${id} in database, job does not exist`);
    }

    value.attempt += 1; // eslint-disable-line no-param-reassign

    return value;
  });
}
export async function incrementCleanupAttemptInDatabase(id, queueId) {
  let attempt = 1;
  await updateCleanupInDatabase(id, value => {
    if (typeof value === 'undefined') {
      return {
        id,
        queueId,
        attempt: 1,
        startAfter: Date.now(),
        data: {}
      };
    }

    attempt = value.attempt + 1;
    value.attempt = attempt; // eslint-disable-line no-param-reassign

    return value;
  });
  return attempt;
}
export async function bulkEnqueueToDatabase(queueId, items, delay) {
  // eslint-disable-line no-underscore-dangle
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
        startAfter: Date.now() + delay
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
export async function enqueueToDatabase(queueId, type, args, delay) {
  // eslint-disable-line no-underscore-dangle
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
    startAfter: Date.now() + delay
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
export async function dequeueFromDatabase() {
  // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusIndex'); // $FlowFixMe

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
export function getContiguousIds(ids) {
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
export async function dequeueFromDatabaseNotIn(ids) {
  // eslint-disable-line no-underscore-dangle
  if (ids.length === 0) {
    return dequeueFromDatabase();
  }

  const [store, promise] = await getReadOnlyJobsObjectStoreAndTransactionPromise();
  const index = store.index('statusIndex');
  const jobs = []; // $FlowFixMe

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
export async function getJobsFromDatabase(queueId) {
  // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to get completed jobs database, received invalid "queueId" argument type "${typeof queueId}"`);
  }

  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

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
export async function getCompletedJobsCountFromDatabase(queueId) {
  // eslint-disable-line no-underscore-dangle
  const jobs = await getCompletedJobsFromDatabase(queueId);
  return jobs.length;
}
export async function getCompletedJobsFromDatabase(queueId) {
  // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to get completed jobs database, received invalid "queueId" argument type "${typeof queueId}"`);
  }

  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusQueueIdIndex'); // $FlowFixMe

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
export async function storeAuthDataInDatabase(id, data) {
  // eslint-disable-line no-underscore-dangle
  if (typeof id !== 'string') {
    throw new TypeError(`Unable to store auth data in database, received invalid "id" argument type "${typeof id}"`);
  }

  if (typeof data !== 'object') {
    throw new TypeError(`Unable to store auth data in database, received invalid "data" argument type "${typeof data}"`);
  }

  const store = await getReadWriteAuthObjectStore();
  const request = store.put({
    id,
    data
  });
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
export async function getAuthDataFromDatabase(id) {
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
export async function removeAuthDataFromDatabase(id) {
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
export async function getQueueStatus(queueId) {
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusQueueIdIndex'); // $FlowFixMe

  const abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ABORTED_STATUS])); // $FlowFixMe

  const completeRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS])); // $FlowFixMe

  const pendingRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_PENDING_STATUS])); // $FlowFixMe

  const errorRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ERROR_STATUS])); // $FlowFixMe

  const cleanupRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_CLEANUP_STATUS]));
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
  const [abortedCount, completeCount, pendingCount, errorCount, cleanupCount] = await Promise.all([abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise]);

  if (abortedCount > 0 || cleanupCount > 0) {
    return QUEUE_ERROR_STATUS;
  }

  if (errorCount > 0 || pendingCount > 0) {
    return QUEUE_PENDING_STATUS;
  }

  if (completeCount > 0) {
    return QUEUE_COMPLETE_STATUS;
  }

  return QUEUE_EMPTY_STATUS;
}
//# sourceMappingURL=database.js.map