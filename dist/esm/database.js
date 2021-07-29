import merge from 'lodash/merge';
import unset from 'lodash/unset';
import makeLogger from './logger';
const logger = makeLogger('Jobs Database');
export const JOB_ABORTED_STATUS = 2;
export const JOB_COMPLETE_STATUS = 1;
export const JOB_PENDING_STATUS = 0;
export const JOB_ERROR_STATUS = -1;
export const JOB_CLEANUP_STATUS = -2;
export const databasePromise = (async () => {
  const request = self.indexedDB.open('battery-queue', 1);

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
      store.createIndex('statusCreatedIndex', ['status', 'created'], {
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
      e.target.result.createObjectStore('auth', {
        keyPath: 'teamId'
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
  const transaction = database.transaction(['auth'], 'readwrite');
  const objectStore = transaction.objectStore('auth');

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
  const transaction = database.transaction(['auth'], 'readonly');
  const objectStore = transaction.objectStore('auth');

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
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdTypeIndex'); // $FlowFixMe

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

async function removeQueueIdFromJobsDatabase(queueId) {
  const store = await getReadWriteJobsObjectStore();
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
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('statusCreatedIndex'); // $FlowFixMe

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
export async function removePathFromCleanupDataInDatabase(id, queueId, path) {
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.put({
    id,
    queueId,
    data: unset(value || {}, path)
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
export async function updateCleanupInDatabase(id, queueId, data) {
  const value = await getCleanupFromDatabase(id);
  const store = await getReadWriteCleanupsObjectStore();
  const request = store.put({
    id,
    queueId,
    data: merge({}, value, data)
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
  const value = await getJobFromDatabase(id);

  if (typeof value === 'undefined') {
    throw new Error(`Unable to mark job ${id} start-after time to ${new Date(startAfter).toLocaleString()} in database, job does not exist`);
  }

  value.startAfter = startAfter;
  const store = await getReadWriteJobsObjectStore();
  const request = store.put(value);
  return new Promise((resolve, reject) => {
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
export async function markQueueForCleanupInDatabase(queueId) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.openCursor(IDBKeyRange.only(queueId));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        const value = Object.assign({}, cursor.value);

        switch (value.status) {
          case JOB_ERROR_STATUS:
            value.status = JOB_CLEANUP_STATUS;
            break;

          case JOB_COMPLETE_STATUS:
            value.status = JOB_CLEANUP_STATUS;
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
}
export async function incrementAttemptInDatabase(id) {
  const value = await getJobFromDatabase(id);

  if (typeof value === 'undefined') {
    throw new Error(`Unable to decrement attempts remaining for job ${id} in database, job does not exist`);
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
      logger.error(`Request error while incrementing attempt to ${attempt} for ${id}`);
      logger.errorObject(event);
      reject(new Error(`Request error while incrementing attempt to ${attempt} for ${id}`));
    };
  });
  return [attempt, value.maxAttempts];
}
export async function bulkEnqueueToDatabase(queueId, items, delay) {
  // eslint-disable-line no-underscore-dangle
  const store = await getReadWriteJobsObjectStore();
  await new Promise((resolve, reject) => {
    for (let i = 0; i < items.length; i += 1) {
      const [type, args, maxAttempts] = items[i];
      const value = {
        queueId,
        type,
        args,
        attempt: 0,
        maxAttempts,
        created: Date.now(),
        status: JOB_PENDING_STATUS,
        startAfter: Date.now() + delay
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
export async function enqueueToDatabase(queueId, type, args, maxAttempts, delay) {
  // eslint-disable-line no-underscore-dangle
  const value = {
    queueId,
    type,
    args,
    attempt: 0,
    maxAttempts,
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
  return id;
}
export async function dequeueFromDatabase() {
  // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusIndex'); // $FlowFixMe

  const request = index.openCursor(IDBKeyRange.bound(JOB_CLEANUP_STATUS, JOB_PENDING_STATUS));
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
export async function storeAuthDataInDatabase(value) {
  // eslint-disable-line no-underscore-dangle
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
export async function getAuthDataFromDatabase(teamId) {
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
export async function removeAuthDataFromDatabase(teamId) {
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
//# sourceMappingURL=database.js.map