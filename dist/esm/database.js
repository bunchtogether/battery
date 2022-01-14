import { JSONPath } from 'jsonpath-plus';
import merge from 'lodash/merge';
import unset from 'lodash/unset';
import uniq from 'lodash/uniq';
import EventEmitter from 'events';
import makeLogger from './logger'; // Local job emitter is for this process only,
// jobEmitter is bridged when a MessagePort is open

export const localJobEmitter = new EventEmitter();
export const jobEmitter = new EventEmitter();
const logger = makeLogger('Jobs Database');
export class JobDoesNotExistError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JobDoesNotExistError';
  }

}
export class CleanupDoesNotExistError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CleanupDoesNotExistError';
  }

}
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
  const request = self.indexedDB.open('battery-queue-08', 1);

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
      store.createIndex('typeIndex', 'type', {
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
      e.target.result.createObjectStore('metadata', {
        keyPath: 'id'
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

    try {
      const store = e.target.result.createObjectStore('arg-lookup', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('jobIdIndex', 'jobId', {
        unique: false
      });
      store.createIndex('keyIndex', 'key', {
        unique: false
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

async function getReadWriteObjectStore(name) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readwrite', {
    durability: 'relaxed'
  });
  const objectStore = transaction.objectStore(name);

  transaction.onabort = event => {
    logger.error(`Read-write "${name}" transaction was aborted`);
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error(`Error in read-write "${name}" transaction`);
    logger.errorObject(event);
  };

  return objectStore;
}

async function getReadOnlyObjectStore(name) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readonly', {
    durability: 'relaxed'
  });
  const objectStore = transaction.objectStore(name);

  transaction.onabort = event => {
    logger.error(`Read-only "${name}" transaction was aborted`);
    logger.errorObject(event);
  };

  transaction.onerror = event => {
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

async function getReadWriteJobCleanupAndArgLookupStores() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs', 'cleanups', 'arg-lookup'], 'readwrite', {
    durability: 'relaxed'
  });

  transaction.onabort = event => {
    logger.error('Read-write \'jobs\', \'cleanups\', and \'arg-lookup\' transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write \'jobs\', \'cleanups\', and \'arg-lookup\' transaction');
    logger.errorObject(event);
  };

  return [transaction.objectStore('jobs'), transaction.objectStore('cleanups'), transaction.objectStore('arg-lookup')];
}

async function getReadWriteJobAndCleanupStores() {
  const database = await databasePromise;
  const transaction = database.transaction(['jobs', 'cleanups'], 'readwrite', {
    durability: 'relaxed'
  });

  transaction.onabort = event => {
    logger.error('Read-write \'jobs\' and \'cleanups\' transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write \'jobs\' and \'cleanups\' transaction');
    logger.errorObject(event);
  };

  return [transaction.objectStore('jobs'), transaction.objectStore('cleanups')];
}

async function getReadOnlyObjectStoreAndTransactionPromise(name) {
  const database = await databasePromise;
  const transaction = database.transaction([name], 'readonly', {
    durability: 'relaxed'
  });
  const objectStore = transaction.objectStore(name);
  const promise = new Promise((resolve, reject) => {
    transaction.onabort = event => {
      logger.error(`Read-write "${name}" transaction was aborted`);
      logger.errorObject(event);
      reject(new Error(`Read-write "${name}" transaction was aborted`));
    };

    transaction.onerror = event => {
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

function getReadOnlyJobsObjectStoreAndTransactionPromise() {
  return getReadOnlyObjectStoreAndTransactionPromise('jobs');
}

function silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, onSuccess, onError) {
  const jobDeleteRequest = jobsObjectStore.delete(jobId);

  jobDeleteRequest.onerror = function (event) {
    logger.error(`Request error while removing job ${jobId} in queue ${queueId} from database`);
    logger.errorObject(event);

    if (typeof onError === 'function') {
      onError(new Error(`Request error while removing job ${jobId} in queue ${queueId} from database`));
    }
  };

  const cleanupDeleteRequest = cleanupsObjectStore.delete(jobId);

  cleanupDeleteRequest.onerror = function (event) {
    logger.error(`Request error while removing cleanup for job ${jobId} in queue ${queueId} from database`);
    logger.errorObject(event);

    if (typeof onError === 'function') {
      onError(new Error(`Request error while removing cleanup for job ${jobId} in queue ${queueId} from database`));
    }
  };

  const argLookupJobIdIndex = argLookupObjectStore.index('jobIdIndex'); // $FlowFixMe

  const argLookupJobRequest = argLookupJobIdIndex.getAllKeys(IDBKeyRange.only(jobId));

  argLookupJobRequest.onsuccess = function (event) {
    for (const id of event.target.result) {
      const argLookupDeleteRequest = argLookupObjectStore.delete(id);

      argLookupDeleteRequest.onerror = function (deleteEvent) {
        logger.error(`Delete request error while removing argument lookups for job ${jobId} in queue ${queueId} from database`);
        logger.errorObject(deleteEvent);

        if (typeof onError === 'function') {
          onError(new Error(`Delete request error while removing argument lookups for job ${jobId} in queue ${queueId} from database`));
        }
      };
    }

    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  argLookupJobRequest.onerror = function (event) {
    logger.error(`Request error while removing argument lookups for job ${jobId} in queue ${queueId} from database`);
    logger.errorObject(event);

    if (typeof onError === 'function') {
      onError(new Error(`Request error while removing argument lookups for job ${jobId} in queue ${queueId} from database`));
    }
  };
}

function removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, onSuccess, onError) {
  queueMicrotask(() => {
    localJobEmitter.emit('jobDelete', jobId, queueId);
    jobEmitter.emit('jobDelete', jobId, queueId);
  });
  return silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, onSuccess, onError);
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

    store.transaction.commit();
  });
}

async function clearJobsDatabase() {
  const store = await getReadWriteJobsObjectStore();
  const request = store.clear();
  localJobEmitter.emit('jobsClear');
  jobEmitter.emit('jobsClear');
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve();
    };

    request.onerror = function (event) {
      logger.error('Error while clearing jobs database');
      logger.errorObject(event);
      reject(new Error('Error while clearing jobs database'));
    };

    store.transaction.commit();
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

    store.transaction.commit();
  });
}

export async function clearDatabase() {
  await clearJobsDatabase();
  await clearCleanupsDatabase();
  await clearAllMetadataInDatabase();
}
export async function removeJobsWithQueueIdAndTypeFromDatabase(queueId, type) {
  const [jobsObjectStore, cleanupsObjectStore, argLookupObjectStore] = await getReadWriteJobCleanupAndArgLookupStores();
  const index = jobsObjectStore.index('queueIdTypeIndex'); // $FlowFixMe

  const request = index.getAllKeys(IDBKeyRange.only([queueId, type]));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const jobIds = event.target.result;

      for (let i = 0; i < jobIds.length; i += 1) {
        const jobId = jobIds[i];

        if (i === jobIds.length - 1) {
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, resolve, reject);
        } else {
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
        }
      }
    };

    request.onerror = function (event) {
      logger.error(`Request error while removing jobs with queue ${queueId} and type ${type} from jobs database`);
      logger.errorObject(event);
    };
  });
}
export async function removeQueueFromDatabase(queueId) {
  const [jobsObjectStore, cleanupsObjectStore, argLookupObjectStore] = await getReadWriteJobCleanupAndArgLookupStores();
  const index = jobsObjectStore.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAllKeys(IDBKeyRange.only(queueId));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const jobIds = event.target.result;

      for (let i = 0; i < jobIds.length; i += 1) {
        const jobId = jobIds[i];

        if (i === jobIds.length - 1) {
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, () => {
            jobsObjectStore.transaction.commit();
            resolve();
          }, reject);
        } else {
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
        }
      }
    };

    request.onerror = function (event) {
      logger.error(`Request error while removing queue ${queueId} from jobs database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing queue ${queueId} from jobs database`));
    };
  });
}
export async function removeCompletedExpiredItemsFromDatabase(maxAge) {
  const [jobsObjectStore, cleanupsObjectStore, argLookupObjectStore] = await getReadWriteJobCleanupAndArgLookupStores();
  const index = jobsObjectStore.index('statusCreatedIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.bound([JOB_COMPLETE_STATUS, 0], [JOB_COMPLETE_STATUS, Date.now() - maxAge]));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const jobs = event.target.result;

      for (let i = 0; i < jobs.length; i += 1) {
        const {
          id: jobId,
          queueId
        } = jobs[i];

        if (i === jobs.length - 1) {
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, () => {
            jobsObjectStore.transaction.commit();
            resolve();
          }, reject);
        } else {
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
        }
      }

      if (jobs.length === 0) {
        resolve();
      }
    };

    request.onerror = function (event) {
      logger.error(`Request error while removing completed jobs with age > ${maxAge}ms`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing completed jobs with age > ${maxAge}ms`));
    };
  });
}
export async function updateJobInDatabase(id, transform) {
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
          const {
            queueId,
            type
          } = value;
          const deleteRequest = store.delete(id);
          localJobEmitter.emit('jobDelete', id, queueId);
          jobEmitter.emit('jobDelete', id, queueId);

          deleteRequest.onsuccess = function () {
            removeArgLookupsAndCleanupsForJobAsMicrotask(id);
            resolve();
          };

          deleteRequest.onerror = function (event) {
            logger.error(`Delete request error while updating job ${id} in queue ${queueId} and type ${type} in jobs database`);
            logger.errorObject(event);
            reject(new Error(`Delete request error while updating job ${id} in queue ${queueId} and type ${type} from jobs database`));
          };
        } else {
          resolve();
        }
      } else {
        const {
          queueId,
          type,
          status
        } = newValue;
        const putRequest = store.put(newValue);
        localJobEmitter.emit('jobUpdate', id, queueId, type, status);
        jobEmitter.emit('jobUpdate', id, queueId, type, status);

        putRequest.onsuccess = function () {
          resolve();
        };

        putRequest.onerror = function (event) {
          logger.error(`Put request error while updating job ${id} in queue ${queueId} and type ${type} in jobs database`);
          logger.errorObject(event);
          reject(new Error(`Put request error while updating job ${id} in queue ${queueId} and type ${type} from jobs database`));
        };
      }

      store.transaction.commit();
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

    store.transaction.commit();
  });
}
export async function updateCleanupInDatabase(id, transform) {
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

      store.transaction.commit();
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
export async function silentlyRemoveQueueFromDatabase(queueId) {
  const [jobsObjectStore, cleanupsObjectStore, argLookupObjectStore] = await getReadWriteJobCleanupAndArgLookupStores();
  const index = jobsObjectStore.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAllKeys(IDBKeyRange.only(queueId));
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const jobIds = event.target.result;

      for (let i = 0; i < jobIds.length; i += 1) {
        const jobId = jobIds[i];

        if (i === jobIds.length - 1) {
          silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, () => {
            jobsObjectStore.transaction.commit();
            resolve();
          }, reject);
        } else {
          silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
        }
      }
    };

    request.onerror = function (event) {
      logger.error(`Request error while removing queue ${queueId} from jobs database`);
      logger.errorObject(event);
      reject(new Error(`Request error while removing queue ${queueId} from jobs database`));
    };
  });
}
export async function silentlyRemoveJobFromDatabase(id) {
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

    store.transaction.commit();
  });
}
export async function removeJobFromDatabase(jobId) {
  const [jobsObjectStore, cleanupsObjectStore, argLookupObjectStore] = await getReadWriteJobCleanupAndArgLookupStores();
  const request = jobsObjectStore.get(jobId);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      const job = request.result;

      if (typeof job === 'undefined') {
        resolve();
        jobsObjectStore.transaction.commit();
        return;
      }

      removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, job.id, job.queueId, () => {
        resolve();
      }, reject);
      jobsObjectStore.transaction.commit();
    };

    request.onerror = function (event) {
      logger.error(`Request error while getting job ${jobId} before removing from database`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting job ${jobId} before removing from database`));
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

    store.transaction.commit();
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

    store.transaction.commit();
  });
}
export async function getMetadataFromDatabase(id) {
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

    store.transaction.commit();
  });
  return typeof response !== 'undefined' ? response.metadata : undefined;
}
export async function clearMetadataInDatabase(id) {
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

    store.transaction.commit();
  });
}
export async function setMetadataInDatabase(id, metadata) {
  const store = await getReadWriteMetadataObjectStore();
  const request = store.put({
    id,
    metadata
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

    store.transaction.commit();
  });
}
export async function updateMetadataInDatabase(id, transform) {
  const store = await getReadWriteMetadataObjectStore();
  const request = store.get(id);
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
          const deleteRequest = store.delete(id);

          deleteRequest.onsuccess = function () {
            resolve();
          };

          deleteRequest.onerror = function (event) {
            logger.error(`Delete request error while updating ${id} in metadata database`);
            logger.errorObject(event);
            reject(new Error(`Delete request error while updating ${id} in metadata database`));
          };
        }
      } else {
        const putRequest = store.put({
          id,
          metadata: newValue
        });

        putRequest.onsuccess = function () {
          resolve();
        };

        putRequest.onerror = function (event) {
          logger.error(`Put request error while updating ${id} in metadata database`);
          logger.errorObject(event);
          reject(new Error(`Put request error while updating ${id} in metadata database`));
        };
      }

      store.transaction.commit();
    };

    request.onerror = function (event) {
      logger.error(`Get request error while updating ${id} in metadata database`);
      logger.errorObject(event);
      reject(new Error(`Get request error while updating ${id} in metadata database`));
    };
  });
}
export function markJobStatusInDatabase(id, status) {
  return updateJobInDatabase(id, value => {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError(`Unable to mark job ${id} as status ${status} in database, job does not exist`);
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
export async function markJobCompleteThenRemoveFromDatabase(id) {
  const [jobsObjectStore, cleanupsObjectStore, argLookupObjectStore] = await getReadWriteJobCleanupAndArgLookupStores();
  const request = jobsObjectStore.get(id);
  await new Promise((resolve, reject) => {
    request.onsuccess = function () {
      const value = request.result;

      if (typeof value !== 'undefined') {
        const {
          queueId,
          type
        } = value;
        localJobEmitter.emit('jobUpdate', id, queueId, type, JOB_COMPLETE_STATUS);
        jobEmitter.emit('jobUpdate', id, queueId, type, JOB_COMPLETE_STATUS);
        removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, id, queueId, () => {
          jobsObjectStore.transaction.commit();
          resolve();
        });
      }
    };

    request.onerror = function (event) {
      logger.error(`Get request error while marking job ${id} complete then removing from jobs database`);
      logger.errorObject(event);
      reject(new Error(`Get request error while marking job ${id} complete then removing from jobs database`));
    };
  });
}
export function markJobCleanupAndRemoveInDatabase(id) {
  return updateJobInDatabase(id, value => {
    if (typeof value === 'undefined') {
      return false;
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
export function markJobAsAbortedOrRemoveFromDatabase(id) {
  return updateJobInDatabase(id, value => {
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
export function markJobStartAfterInDatabase(id, startAfter) {
  return updateJobInDatabase(id, value => {
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
export function markCleanupStartAfterInDatabase(id, startAfter) {
  return updateCleanupInDatabase(id, value => {
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
export async function markQueueForCleanupInDatabase(queueId) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(queueId));
  const jobs = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const length = event.target.result.length;
      let lastRequest;

      for (let i = 0; i < length; i += 1) {
        const value = Object.assign({}, event.target.result[i]);

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
            jobs.push(value);
            continue;

          case JOB_CLEANUP_AND_REMOVE_STATUS:
            jobs.push(value);
            continue;

          case JOB_ABORTED_STATUS:
            continue;

          default:
            logger.warn(`Unhandled job status ${value.status} while marking queue ${queueId} for cleanup`);
            continue;
        }

        const putRequest = store.put(value);
        localJobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);
        jobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);
        lastRequest = putRequest;

        putRequest.onerror = function (event2) {
          logger.error(`Put request error while marking queue ${queueId} for cleanup`);
          logger.errorObject(event2);
          reject(new Error(`Put request error while marking queue ${queueId} for cleanup`));
        };
      }

      if (typeof lastRequest !== 'undefined') {
        lastRequest.onsuccess = function () {
          resolve();
        };
      } else {
        resolve();
      }

      store.transaction.commit();
    };

    request.onerror = function (event) {
      logger.error(`Request error while marking queue ${queueId} for cleanup`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking queue ${queueId} for cleanup`));
    };
  });
  return jobs;
}
export async function markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, jobId) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(queueId));
  const jobs = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const length = event.target.result.length;
      let lastRequest;

      for (let i = 0; i < length; i += 1) {
        const value = Object.assign({}, event.target.result[i]);

        if (value.id <= jobId) {
          continue;
        }

        let shouldRemove = false;

        switch (value.status) {
          case JOB_ERROR_STATUS:
            value.status = JOB_CLEANUP_AND_REMOVE_STATUS;
            jobs.push(value);
            break;

          case JOB_COMPLETE_STATUS:
            value.status = JOB_CLEANUP_AND_REMOVE_STATUS;
            jobs.push(value);
            break;

          case JOB_PENDING_STATUS:
            shouldRemove = true;
            break;

          case JOB_CLEANUP_STATUS:
            value.status = JOB_CLEANUP_AND_REMOVE_STATUS;
            jobs.push(value);
            break;

          case JOB_CLEANUP_AND_REMOVE_STATUS:
            jobs.push(value);
            continue;

          case JOB_ABORTED_STATUS:
            shouldRemove = true;
            break;

          default:
            logger.warn(`Unhandled job status ${value.status} while marking queue ${queueId} for cleanup and removal`);
            continue;
        }

        const {
          id,
          type,
          status
        } = value;

        if (shouldRemove) {
          const deleteRequest = store.delete(id);
          localJobEmitter.emit('jobDelete', id, queueId);
          jobEmitter.emit('jobDelete', id, queueId);
          removeArgLookupsAndCleanupsForJobAsMicrotask(id);
          lastRequest = deleteRequest;

          deleteRequest.onerror = function (event2) {
            logger.error(`Delete request error while marking queue ${queueId} for cleanup and removal`);
            logger.errorObject(event2);
            reject(new Error(`Delete request error while marking queue ${queueId} for cleanup and removal`));
          };
        } else {
          const putRequest = store.put(value);
          localJobEmitter.emit('jobUpdate', id, queueId, type, status);
          jobEmitter.emit('jobUpdate', id, queueId, type, status);
          lastRequest = putRequest;

          putRequest.onerror = function (event2) {
            logger.error(`Put request error while marking queue ${queueId} for cleanup and removal`);
            logger.errorObject(event2);
            reject(new Error(`Put request error while marking queue ${queueId} for cleanup and removal`));
          };
        }
      }

      if (typeof lastRequest !== 'undefined') {
        lastRequest.onsuccess = function () {
          resolve();
        };
      } else {
        resolve();
      }

      store.transaction.commit();
    };

    request.onerror = function (event) {
      logger.error(`Request error while marking queue ${queueId} for cleanup and removal`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking queue ${queueId} for cleanup and removal`));
    };
  });
  return jobs;
}
export function markQueueForCleanupAndRemoveInDatabase(queueId) {
  return markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, -1);
}
export async function markQueueJobsGreaterThanIdPendingInDatabase(queueId, jobId) {
  const store = await getReadWriteJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(queueId));
  const jobs = [];
  await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const length = event.target.result.length;
      let lastRequest;

      for (let i = 0; i < length; i += 1) {
        const value = Object.assign({}, event.target.result[i]);

        if (value.id <= jobId) {
          continue;
        }

        switch (value.status) {
          case JOB_ERROR_STATUS:
            value.attempt = 0;
            jobs.push(value);
            break;

          case JOB_COMPLETE_STATUS:
            continue;

          case JOB_PENDING_STATUS:
            value.attempt = 0;
            jobs.push(value);
            break;

          case JOB_CLEANUP_STATUS:
            value.attempt = 0;
            jobs.push(value);
            break;

          case JOB_CLEANUP_AND_REMOVE_STATUS:
            jobs.push(value);
            continue;

          case JOB_ABORTED_STATUS:
            value.attempt = 0;
            value.status = JOB_PENDING_STATUS;
            jobs.push(value);
            break;

          default:
            logger.warn(`Unhandled job status ${value.status} while marking queue ${queueId} as pending`);
            continue;
        }

        const {
          id,
          type,
          status
        } = value;
        const putRequest = store.put(value);
        localJobEmitter.emit('jobUpdate', id, queueId, type, status);
        jobEmitter.emit('jobUpdate', id, queueId, type, status);
        lastRequest = putRequest;

        putRequest.onerror = function (event2) {
          logger.error(`Put request error while marking queue ${queueId} as pending`);
          logger.errorObject(event2);
          reject(new Error(`Put request error while marking queue ${queueId} as pending`));
        };
      }

      if (typeof lastRequest !== 'undefined') {
        lastRequest.onsuccess = function () {
          resolve();
        };
      } else {
        resolve();
      }

      store.transaction.commit();
    };

    request.onerror = function (event) {
      logger.error(`Request error while marking queue ${queueId} as pending`);
      logger.errorObject(event);
      reject(new Error(`Request error while marking queue ${queueId} as pending`));
    };
  });
  return jobs;
}
export function markQueuePendingInDatabase(queueId) {
  return markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);
}
export async function getGreatestJobIdFromQueueInDatabase(queueId) {
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.openCursor(IDBKeyRange.only(queueId), 'prev');
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        resolve(cursor.value.id || 0);
      } else {
        resolve(0);
      }
    };

    request.onerror = function (event) {
      logger.error(`Request error while getting the greatest job ID in queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting the greatest job ID in queue ${queueId}`));
    };

    store.transaction.commit();
  });
}
export async function incrementJobAttemptInDatabase(id) {
  await updateJobInDatabase(id, value => {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError(`Unable to increment attempts for job ${id} in database, job does not exist`);
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
export async function bulkEnqueueToDatabase(items) {
  // eslint-disable-line no-underscore-dangle
  if (!Array.isArray(items)) {
    throw new TypeError(`Unable to bulk enqueue in database, received invalid "items" argument type "${typeof items}"`);
  }

  for (const [queueId, type, args, options = {}] of items) {
    if (typeof queueId !== 'string') {
      throw new TypeError(`Unable to enqueue in database, received invalid "queueId" argument type "${typeof queueId}", should be string`);
    }

    if (typeof type !== 'string') {
      throw new TypeError(`Unable to enqueue in database, received invalid "type" argument type "${typeof type}", should be string`);
    }

    if (!Array.isArray(args)) {
      throw new TypeError(`Unable to enqueue in database, received invalid "args" argument type "${typeof args}", should be Array<any>`);
    }

    const delay = options.delay || 0;
    const prioritize = options.prioritize || false;

    if (typeof delay !== 'number') {
      throw new TypeError(`Unable to enqueue in database, received invalid "options.delay" argument type "${typeof delay}", should be number`);
    }

    if (typeof prioritize !== 'boolean') {
      throw new TypeError(`Unable to enqueue in database, received invalid "options.prioritize" argument type "${typeof prioritize}", should be boolean`);
    }
  }

  const ids = [];
  const store = await getReadWriteJobsObjectStore();
  await new Promise((resolve, reject) => {
    for (let i = 0; i < items.length; i += 1) {
      const [queueId, type, args, options = {}] = items[i];
      const delay = typeof options.delay === 'number' ? options.delay : 0;
      const prioritize = typeof options.prioritize === 'boolean' ? options.prioritize : false;
      const value = {
        queueId,
        type,
        args,
        attempt: 0,
        created: Date.now(),
        status: JOB_PENDING_STATUS,
        startAfter: Date.now() + delay,
        prioritize
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

    store.transaction.commit();
  });
  return ids;
}
export async function importJobsAndCleanups(jobs, cleanups) {
  // eslint-disable-line no-underscore-dangle
  if (!Array.isArray(jobs)) {
    throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "jobs" argument type "${typeof jobs}"`);
  }

  if (!Array.isArray(cleanups)) {
    throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "cleanups" argument type "${typeof cleanups}"`);
  }

  for (const {
    args,
    attempt,
    created,
    id,
    prioritize,
    queueId,
    startAfter,
    status,
    type
  } of jobs) {
    if (!Array.isArray(args)) {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "args" argument type "${typeof args}", should be Array<any>`);
    }

    if (typeof attempt !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "attempt" argument type "${typeof attempt}", should be number`);
    }

    if (typeof created !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "created" argument type "${typeof created}", should be number`);
    }

    if (typeof id !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "id" argument type "${typeof id}", should be number`);
    }

    if (typeof prioritize !== 'boolean') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "prioritize" argument type "${typeof prioritize}", should be boolean`);
    }

    if (typeof queueId !== 'string') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "queueId" argument type "${typeof queueId}", should be string`);
    }

    if (typeof startAfter !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "startAfter" argument type "${typeof startAfter}", should be number`);
    }

    if (typeof status !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "status" argument type "${typeof status}", should be number`);
    }

    if (typeof type !== 'string') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "type" argument type "${typeof type}", should be string`);
    }
  }

  for (const {
    attempt,
    data,
    id,
    queueId,
    startAfter
  } of cleanups) {
    if (typeof attempt !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "attempt" argument type "${typeof attempt}", should be number`);
    }

    if (typeof data !== 'object') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "data" argument type "${typeof data}", should be object`);
    }

    if (typeof id !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "id" argument type "${typeof id}", should be number`);
    }

    if (typeof queueId !== 'string') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "queueId" argument type "${typeof queueId}", should be string`);
    }

    if (typeof startAfter !== 'number') {
      throw new TypeError(`Unable to import jobs and cleanups into database, received invalid "startAfter" argument type "${typeof startAfter}", should be number`);
    }
  }

  const jobIdSet = new Set();

  for (const {
    id
  } of jobs) {
    jobIdSet.add(id);
  }

  const cleanupMap = new Map();

  for (const cleanup of cleanups) {
    if (jobIdSet.has(cleanup.id)) {
      cleanupMap.set(cleanup.id, cleanup);
    }
  }

  const [jobsObjectStore, cleanupsObjectStore] = await getReadWriteJobAndCleanupStores();
  const newJobs = [];
  await new Promise((resolve, reject) => {
    let didCommit = false;

    for (let i = 0; i < jobs.length; i += 1) {
      const {
        args,
        attempt,
        created,
        id,
        prioritize,
        queueId,
        startAfter,
        status,
        type
      } = jobs[i];
      const value = {
        args,
        attempt,
        created,
        prioritize,
        queueId,
        startAfter,
        status,
        type
      };
      const request = jobsObjectStore.put(value);

      request.onsuccess = function () {
        // eslint-disable-line no-loop-func
        const jobId = request.result;
        value.id = jobId;
        newJobs.push(value);
        const cleanupValue = cleanupMap.get(id);
        cleanupMap.delete(id);

        if (typeof cleanupValue === 'object') {
          const {
            attempt: cleanupAttempt,
            data: cleanupData,
            startAfter: cleanupStartAfter
          } = cleanupValue;
          const cleanupPutRequest = cleanupsObjectStore.put({
            id: jobId,
            queueId,
            attempt: cleanupAttempt,
            data: cleanupData,
            startAfter: cleanupStartAfter
          });

          cleanupPutRequest.onsuccess = function () {
            if (i === jobs.length - 1) {
              resolve();
            }
          };

          cleanupPutRequest.onerror = function (event) {
            logger.error(`Request error while importing ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`);
            logger.errorObject(event);
            reject(new Error(`Request error while importing ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`));
          };
        } else {
          localJobEmitter.emit('jobAdd', jobId, queueId, type);
          jobEmitter.emit('jobAdd', jobId, queueId, type);

          if (i === jobs.length - 1) {
            resolve();
          }
        }

        if (i === jobs.length - 1 && !didCommit) {
          didCommit = true;
          jobsObjectStore.transaction.commit();
        }
      };

      request.onerror = function (event) {
        logger.error(`Request error while importing ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`);
        logger.errorObject(event);
        reject(new Error(`Request error while importing ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} in queue ${queueId}`));
      };
    }

    if (cleanupMap.size === 0) {
      didCommit = true;
      jobsObjectStore.transaction.commit();
    }
  });
  return newJobs;
}
export async function enqueueToDatabase(queueId, type, args, options = {}) {
  // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to enqueue in database, received invalid "queueId" argument type "${typeof queueId}", should be string`);
  }

  if (typeof type !== 'string') {
    throw new TypeError(`Unable to enqueue in database, received invalid "type" argument type "${typeof type}", should be string`);
  }

  if (!Array.isArray(args)) {
    throw new TypeError(`Unable to enqueue in database, received invalid "args" argument type "${typeof args}", should be Array<any>`);
  }

  const delay = options.delay || 0;
  const prioritize = options.prioritize || false;

  if (typeof delay !== 'number') {
    throw new TypeError(`Unable to enqueue in database, received invalid "options.delay" argument type "${typeof delay}", should be number`);
  }

  if (typeof prioritize !== 'boolean') {
    throw new TypeError(`Unable to enqueue in database, received invalid "options.prioritize" argument type "${typeof prioritize}", should be boolean`);
  }

  const value = {
    queueId,
    type,
    args,
    attempt: 0,
    created: Date.now(),
    status: JOB_PENDING_STATUS,
    startAfter: Date.now() + delay,
    prioritize
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

    store.transaction.commit();
  });
  localJobEmitter.emit('jobAdd', id, queueId, type);
  jobEmitter.emit('jobAdd', id, queueId, type);
  return id;
}
export async function restoreJobToDatabaseForCleanupAndRemove(id, queueId, type, args, options = {}) {
  // eslint-disable-line no-underscore-dangle
  if (typeof id !== 'number') {
    throw new TypeError(`Unable to restore to database, received invalid "id" argument type "${typeof id}", should be number`);
  }

  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to restore to database, received invalid "queueId" argument type "${typeof queueId}", should be string`);
  }

  if (typeof type !== 'string') {
    throw new TypeError(`Unable to restore to database, received invalid "type" argument type "${typeof type}", should be string`);
  }

  if (!Array.isArray(args)) {
    throw new TypeError(`Unable to restore to database, received invalid "args" argument type "${typeof args}", should be Array<any>`);
  }

  const delay = options.delay || 0;
  const prioritize = options.prioritize || false;

  if (typeof delay !== 'number') {
    throw new TypeError(`Unable to enqueue in database, received invalid "options.delay" argument type "${typeof delay}", should be number`);
  }

  if (typeof prioritize !== 'boolean') {
    throw new TypeError(`Unable to enqueue in database, received invalid "options.prioritize" argument type "${typeof prioritize}", should be boolean`);
  }

  const value = {
    id,
    queueId,
    type,
    args,
    attempt: 1,
    created: Date.now(),
    status: JOB_CLEANUP_AND_REMOVE_STATUS,
    startAfter: Date.now() + delay,
    prioritize
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

    store.transaction.commit();
  });
  localJobEmitter.emit('jobAdd', id, queueId, type);
  jobEmitter.emit('jobAdd', id, queueId, type);
  return id;
}
export async function dequeueFromDatabase() {
  // eslint-disable-line no-underscore-dangle
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusIndex'); // $FlowFixMe

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

    store.transaction.commit();
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

    store.transaction.commit();
  };

  request.onerror = function (event) {
    logger.error('Request error while dequeing');
    logger.errorObject(event);
  };

  await promise;
  return jobs;
}
export async function getJobsWithTypeFromDatabase(type) {
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('typeIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(type));
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      logger.error(`Request error while getting jobs with type ${type} from jobs database`);
      logger.errorObject(event);
      reject(new Error(`Error while getting jobs with type ${type} from jobs database`));
    };

    store.transaction.commit();
  });
}
export async function getCleanupsInQueueFromDatabase(queueId) {
  // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to get cleanups in queue from database, received invalid "queueId" argument type "${typeof queueId}"`);
  }

  const store = await getReadOnlyCleanupsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(queueId));
  const jobs = await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      logger.error(`Request error while getting cleanups in queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error('Request error while getting cleanups in queue'));
    };

    store.transaction.commit();
  });
  return jobs;
}
export async function getJobsInQueueFromDatabase(queueId) {
  // eslint-disable-line no-underscore-dangle
  if (typeof queueId !== 'string') {
    throw new TypeError(`Unable to get jobs in queue from database, received invalid "queueId" argument type "${typeof queueId}"`);
  }

  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('queueIdIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(queueId));
  const jobs = await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      logger.error(`Request error while getting jobs in queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error('Request error while getting jobs in queue'));
    };

    store.transaction.commit();
  });
  return jobs;
}
export async function getJobsInDatabase(jobIds) {
  // eslint-disable-line no-underscore-dangle
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

  store.transaction.commit();
  await promise;
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

  const request = index.getAll(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS]));
  const jobs = await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      logger.error(`Request error while getting completed jobs for queue ${queueId}`);
      logger.errorObject(event);
      reject(new Error(`Request error while getting completed jobs for queue ${queueId}`));
    };

    store.transaction.commit();
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

    store.transaction.commit();
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

    store.transaction.commit();
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

    store.transaction.commit();
  });
}
export async function getQueueStatus(queueId) {
  const store = await getReadOnlyJobsObjectStore();
  const index = store.index('statusQueueIdIndex'); // $FlowFixMe

  const abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ABORTED_STATUS])); // $FlowFixMe

  const completeRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS])); // $FlowFixMe

  const pendingRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_PENDING_STATUS])); // $FlowFixMe

  const errorRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ERROR_STATUS])); // $FlowFixMe

  const cleanupRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_CLEANUP_STATUS])); // $FlowFixMe

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
  store.transaction.commit();
  const [abortedCount, completeCount, pendingCount, errorCount, cleanupCount, cleanupAndRemoveCount] = await Promise.all([abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise, cleanupAndRemoveCountPromise]);

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
export async function addArgLookup(jobId, key, jsonPath) {
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
    jsonPath
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

    store.transaction.commit();
  });
}
export async function getArgLookupJobPathMap(key) {
  if (typeof key !== 'string') {
    throw new TypeError(`Unable to lookup arguments, received invalid "key" argument type "${typeof key}"`);
  }

  const store = await getReadOnlyArgLookupObjectStore();
  const index = store.index('keyIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(key));
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const map = new Map(event.target.result.map(x => [x.jobId, x.jsonPath]));
      resolve(map);
    };

    request.onerror = function (event) {
      logger.error(`Request error looking up arguments for key ${key}`);
      logger.errorObject(event);
      reject(new Error(`Request error looking up arguments for key ${key}`));
    };

    store.transaction.commit();
  });
}
export async function markJobsWithArgLookupKeyCleanupAndRemoveInDatabase(key) {
  if (typeof key !== 'string') {
    throw new TypeError(`Unable to lookup arguments, received invalid "key" argument type "${typeof key}"`);
  }

  const store = await getReadOnlyArgLookupObjectStore();
  const index = store.index('keyIndex'); // $FlowFixMe

  const request = index.getAll(IDBKeyRange.only(key));
  const jobIds = await new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(uniq(event.target.result.map(x => x.jobId)));
    };

    request.onerror = function (event) {
      logger.error(`Request error looking up arguments for key ${key}`);
      logger.errorObject(event);
      reject(new Error(`Request error looking up arguments for key ${key}`));
    };

    store.transaction.commit();
  });
  await Promise.all(jobIds.map(markJobCleanupAndRemoveInDatabase));
}
export async function lookupArgs(key) {
  const database = await databasePromise;
  const transaction = database.transaction(['arg-lookup', 'jobs'], 'readonly', {
    durability: 'relaxed'
  });
  const argLookupObjectStore = transaction.objectStore('arg-lookup');

  transaction.onabort = event => {
    logger.error('Read-only lookupArgs transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-only lookupArgs transaction');
    logger.errorObject(event);
  };

  const argLookupIndex = argLookupObjectStore.index('keyIndex'); // $FlowFixMe

  const argLookupRequest = argLookupIndex.getAll(IDBKeyRange.only(key));
  const results = [];
  return new Promise((resolve, reject) => {
    argLookupRequest.onsuccess = function (argLookupEvent) {
      const argLookups = argLookupEvent.target.result;

      if (argLookups.length === 0) {
        resolve([]);
        transaction.commit();
        return;
      }

      const jobsObjectStore = transaction.objectStore('jobs');

      for (let i = 0; i < argLookups.length; i += 1) {
        const {
          jobId,
          jsonPath
        } = argLookups[i];
        const jobRequest = jobsObjectStore.get(jobId);

        jobRequest.onsuccess = function () {
          if (typeof jobRequest.result === 'undefined') {
            return;
          }

          const {
            args
          } = jobRequest.result;

          for (const result of JSONPath({
            path: jsonPath,
            json: args
          })) {
            results.push(result);
          }

          if (i === argLookups.length - 1) {
            resolve(results);
          }
        };

        jobRequest.onerror = function (event) {
          logger.error(`Request error while getting job ${jobId}`);
          logger.errorObject(event);
          reject(new Error(`Request error looking up jobs for key ${key}`));
        };
      }

      transaction.commit();
    };

    argLookupRequest.onerror = function (event) {
      logger.error(`Request error looking up arguments for key ${key}`);
      logger.errorObject(event);
      reject(new Error(`Request error looking up arguments for key ${key}`));
    };
  });
}
export async function lookupArg(key) {
  const results = await lookupArgs(key);
  return results[0];
}
const jobsArgLookupsAndCleanupsToRemove = [];

async function removeArgLookupsAndCleanupsForJob() {
  if (jobsArgLookupsAndCleanupsToRemove.length === 0) {
    return;
  }

  const jobIds = jobsArgLookupsAndCleanupsToRemove.slice();
  jobsArgLookupsAndCleanupsToRemove.length = 0;
  const database = await databasePromise;
  const transaction = database.transaction(['cleanups', 'arg-lookup'], 'readwrite', {
    durability: 'relaxed'
  });

  transaction.onabort = event => {
    logger.error('Read-write "cleanups", and "arg-lookup" transaction was aborted');
    logger.errorObject(event);
  };

  transaction.onerror = event => {
    logger.error('Error in read-write "cleanups" and "arg-lookup" transaction');
    logger.errorObject(event);
  };

  const cleanupsObjectStore = transaction.objectStore('cleanups');
  const argLookupObjectStore = transaction.objectStore('arg-lookup');
  const argLookupJobIdIndex = argLookupObjectStore.index('jobIdIndex');

  for (const jobId of jobIds) {
    const cleanupDeleteRequest = cleanupsObjectStore.delete(jobId);

    cleanupDeleteRequest.onerror = function (event) {
      logger.error(`Request error while removing cleanups for job ${jobId} from database`);
      logger.errorObject(event);
    }; // $FlowFixMe


    const argLookupJobRequest = argLookupJobIdIndex.getAllKeys(IDBKeyRange.only(jobId));

    argLookupJobRequest.onsuccess = function (event) {
      for (const id of event.target.result) {
        const argLookupDeleteRequest = argLookupObjectStore.delete(id);

        argLookupDeleteRequest.onerror = function (deleteEvent) {
          logger.error(`Delete request error while removing argument lookups for job ${jobId} from database`);
          logger.errorObject(deleteEvent);
        };
      }
    };

    argLookupJobRequest.onerror = function (event) {
      logger.error(`Request error while removing argument lookups for job ${jobId} from database`);
      logger.errorObject(event);
    };
  }
}

export function removeArgLookupsAndCleanupsForJobAsMicrotask(jobId) {
  jobsArgLookupsAndCleanupsToRemove.push(jobId);
  self.queueMicrotask(removeArgLookupsAndCleanupsForJob);
}
const UNLOAD_DATA_ID = '_UNLOAD_DATA';
export function updateUnloadDataInDatabase(transform) {
  return updateMetadataInDatabase(UNLOAD_DATA_ID, transform);
}
export function getUnloadDataFromDatabase() {
  return getMetadataFromDatabase(UNLOAD_DATA_ID);
}
export function clearUnloadDataInDatabase() {
  return clearMetadataInDatabase(UNLOAD_DATA_ID);
}
//# sourceMappingURL=database.js.map