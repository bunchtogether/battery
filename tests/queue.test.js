// @flow

import { v4 as uuidv4 } from 'uuid';
import { AbortError, FatalError } from '../src/errors';
import {
  jobEmitter,
  getJobsInQueueFromDatabase,
  silentlyRemoveJobFromDatabase,
  removeJobFromDatabase,
  enqueueToDatabase,
  getCompletedJobsCountFromDatabase,
  removeCompletedExpiredItemsFromDatabase,
  markCleanupStartAfterInDatabase,
  markJobCleanupAndRemoveInDatabase,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_STATUS,
  JOB_CLEANUP_AND_REMOVE_STATUS,
  JOB_COMPLETE_STATUS,
} from '../src/database';
import {
  TRIGGER_NO_ERROR,
  TRIGGER_ERROR,
  TRIGGER_FATAL_ERROR,
  TRIGGER_ERROR_IN_CLEANUP,
  TRIGGER_FATAL_ERROR_IN_CLEANUP,
  TRIGGER_100MS_DELAY,
  TRIGGER_ABORT_ERROR,
  emitter as echoEmitter,
} from './lib/echo-handler';
import { asyncEmitMatchers } from './lib/emit';
import { queue } from './lib/queue';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


describe('Queue', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(asyncEmitMatchers);
    queue.enableStartOnJob();
  });

  afterAll(() => {
    queue.disableStartOnJob();
  });

  afterEach(async () => {
    await queue.clear();
    queue.enableStartOnJob();
  });

  it('Enqueues to the database and is handled', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await expectAsync(queue).toEmit('dequeue', { id });
    await expectAsync(echoEmitter).toEmit('echo', { value });
  });

  it('Gets active queueIds', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    await enqueueToDatabase(queueId, 'echo', args, 0);

    await expectAsync(queue.getQueueIds()).toBeResolvedTo(new Set([queueId]));
    await queue.onIdle();
    await queue.clear();

    await expectAsync(queue.getQueueIds()).toBeResolvedTo(new Set([]));
  });

  it('Enqueues to the database and is cleaned up after an error without retrying', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
  });


  it('Cleans up completed items in the queue if the handler throws an AbortError', async () => {
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    const idB = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ABORT_ERROR, valueB], 0);
    await expectAsync(echoEmitter).toEmit('echo', { value: valueA });
    await expectAsync(queue).toEmit('fatalError', { queueId, id: idB, error: jasmine.any(AbortError) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
  });

  it('Emits fatalError if the queue is aborted before starting', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value], 100);
    await expectAsync(queue).toEmit('dequeue', { id });
    queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(AbortError) });
  });

  it('Emits fatalError if the queue is aborted while running', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_100MS_DELAY, value], 0);
    // Jobs are put into error status in case the process stops during execution
    // to trigger subsequent cleanup
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_ERROR_STATUS);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(AbortError) });
  });

  it('Aborts retry delay', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    queue.setRetryJobDelay('echo', (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      return 120000;
    });
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);

    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });
    await queue.abortQueue(queueId);
    await queue.onIdle();
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after an error without retrying if the retry delay function returns false', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    queue.setRetryJobDelay('echo', (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after an error without retrying if the retry delay function throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    queue.setRetryJobDelay('echo', (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      throw new Error('RetryJobDelay synchronous error');
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after an error without retrying if an asynchronous retry delay function throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    queue.setRetryJobDelay('echo', async (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error('RetryJobDelay asynchronous error');
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after an error, retrying once if the retry delay function returns 0', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    let didRequestRetry = false;
    queue.setRetryJobDelay('echo', (attempt, error) => {
      if (!didRequestRetry) {
        expect(attempt).toEqual(1);
        expect(error).toBeInstanceOf(Error);
        didRequestRetry = true;
        return 0;
      }

      expect(attempt).toEqual(2);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(1);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after an error without retrying if the asynchronous retry delay function returns false', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    queue.setRetryJobDelay('echo', async (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      await new Promise((resolve) => setTimeout(resolve, 10));
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after an error, retrying once if the asynchronous retry delay function returns 0', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    let didRequestRetry = false;
    queue.setRetryJobDelay('echo', async (attempt, error) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (!didRequestRetry) {
        expect(attempt).toEqual(1);
        expect(error).toBeInstanceOf(Error);
        didRequestRetry = true;
        return 0;
      }

      expect(attempt).toEqual(2);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(1);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Enqueues to the database and is cleaned up after a fatal error without retrying', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_FATAL_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
  });

  it('Cleans up jobs in the reverse order that they were added', async () => {
    const queueId = uuidv4();
    const expectedCleanupValues = [];
    for (let i = 0; i < 10; i += 1) {
      const value = uuidv4();
      await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value], 0);
      expectedCleanupValues.push(value);
    }
    await queue.onIdle();
    queue.abortQueue(queueId);
    while (expectedCleanupValues.length > 0) {
      const value = expectedCleanupValues.pop();
      await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });
    }
  });

  it('Cleans up jobs in the reverse order that they were added following a fatal error', async () => {
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_FATAL_ERROR, valueB], 0);

    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
  });

  it('Enqueues to the database and is cleaned up after an error, retrying once after a 100ms delay if the retry delay function returns 100', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let retries = 0;
    let didRequestRetry = false;
    queue.setRetryJobDelay('echo', (attempt, error) => {
      if (!didRequestRetry) {
        expect(attempt).toEqual(1);
        expect(error).toBeInstanceOf(Error);
        didRequestRetry = true;
        return 100;
      }

      expect(attempt).toEqual(2);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value], 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);

    await expectAsync(queue).toEmit('retryDelay', { id, queueId, retryDelay: 100 });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value, cleanupData: { value } });
    await expectAsync(queue).toEmit('fatalError', { queueId, id, error: jasmine.any(Error) });

    expect(retries).toEqual(1);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Removes completed items older than a certain age', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];

    await enqueueToDatabase(queueId, 'echo', args, 0);

    await expectAsync(getCompletedJobsCountFromDatabase(queueId)).toBeResolvedTo(0);

    await queue.onIdle();

    await expectAsync(getCompletedJobsCountFromDatabase(queueId)).toBeResolvedTo(1);
    await removeCompletedExpiredItemsFromDatabase(60 * 1000);

    await expectAsync(getCompletedJobsCountFromDatabase(queueId)).toBeResolvedTo(1);
    await removeCompletedExpiredItemsFromDatabase(0);

    await expectAsync(getCompletedJobsCountFromDatabase(queueId)).toBeResolvedTo(0);
  });


  it('Delays execution of items', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let echoReceivedTime = -1;
    const start = Date.now();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value], 250);
    const handleEcho = ({ value: echoValue }) => {
      if (echoValue === value) {
        echoReceivedTime = Date.now();
      }
    };
    echoEmitter.addListener('echo', handleEcho);

    await queue.onIdle();
    echoEmitter.removeListener('echo', handleEcho);

    expect(echoReceivedTime).toBeGreaterThan(start + 250);
  });

  it('Enqueues to the database and is cleaned up after an error following a defined delay', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);

    await queue.onIdle();
    const start = Date.now();
    await markCleanupStartAfterInDatabase(id, Date.now() + 250);
    let echoCleanupReceivedTime = -1;
    const handleEchoCleanup = ({ value: echoValue }) => {
      if (echoValue === value) {
        echoCleanupReceivedTime = Date.now();
      }
    };
    echoEmitter.addListener('echoCleanupComplete', handleEchoCleanup);
    await queue.abortQueue(queueId);
    await queue.onIdle();
    echoEmitter.removeListener('echoCleanupComplete', handleEchoCleanup);

    expect(echoCleanupReceivedTime).toBeGreaterThan(start + 250);
  });

  it('Enqueues to the database and stops cleanup after FatalError', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_FATAL_ERROR_IN_CLEANUP, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);

    await queue.onIdle();
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });
  });

  it('Enqueues to the database and stops cleanup after Error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_ERROR_IN_CLEANUP, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);

    await queue.onIdle();
    await queue.abortQueue(queueId);

    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });
  });

  it('Does not retry cleanup if a retry cleanup delay function returns false', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    queue.setRetryCleanupDelay('echo', (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(1);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Does not retry cleanup if a retry cleanup delay function throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    queue.setRetryCleanupDelay('echo', (attempt, error) => {
      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      throw new Error('RetryCleanupDelay error');
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(1);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Retries cleanup if a retry cleanup delay function returns 0', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    let didRequestRetry = false;
    queue.setRetryCleanupDelay('echo', (attempt, error) => {
      if (!didRequestRetry) {
        didRequestRetry = true;

        expect(attempt).toEqual(1);
        expect(error).toBeInstanceOf(Error);
        return 0;
      }

      expect(attempt).toEqual(2);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(2);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Does not retry cleanup if an asynchronous retry cleanup delay function returns false', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    queue.setRetryCleanupDelay('echo', async (attempt, error) => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(1);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Does not retry cleanup if an asynchronous retry cleanup delay function throws an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    queue.setRetryCleanupDelay('echo', async (attempt, error) => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(attempt).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      throw new Error('RetryCleanupDelay error');
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(1);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Retries cleanup if an asynchronous retry cleanup delay function returns 0', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    let didRequestRetry = false;
    queue.setRetryCleanupDelay('echo', async (attempt, error) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!didRequestRetry) {
        didRequestRetry = true;

        expect(attempt).toEqual(1);
        expect(error).toBeInstanceOf(Error);
        return 0;
      }

      expect(attempt).toEqual(2);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(2);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Retries cleanup after 100ms if an asynchronous retry cleanup delay function returns 100', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    let cleanupAttempts = 0;
    let didRequestRetry = false;
    queue.setRetryCleanupDelay('echo', async (attempt, error) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!didRequestRetry) {
        didRequestRetry = true;

        expect(attempt).toEqual(1);
        expect(error).toBeInstanceOf(Error);
        return 100;
      }

      expect(attempt).toEqual(2);
      expect(error).toBeInstanceOf(Error);
      return false;
    });
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR_IN_CLEANUP, value], 0);

    await queue.onIdle();

    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectAsync(queue).toEmit('retryCleanupDelay', { id, queueId, retryCleanupDelay: 100 });
    await expectAsync(queue).toEmit('fatalCleanupError', { id, queueId });

    expect(cleanupAttempts).toEqual(2);
    queue.removeListener('cleanupStart', handleCleanupStart);
    queue.removeRetryCleanupDelay('echo');
  });

  it('Runs cleanup on a long-running job if it was aborted', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    let didRunHandler = false;
    let didRunCleanup = false;
    let didRunRetryJobDelay = false;
    const handler = async () => {
      await queue.abortQueue(queueId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      didRunHandler = true;
    };
    const cleanup = async () => {
      didRunCleanup = true;
    };
    const retryJobDelay = () => {
      didRunRetryJobDelay = true;
      return 0;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    queue.setRetryJobDelay(type, retryJobDelay);
    await enqueueToDatabase(queueId, type, [], 0);

    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeCleanup(type);
    queue.removeRetryJobDelay(type);

    expect(didRunHandler).toEqual(true);
    expect(didRunCleanup).toEqual(true);
    expect(didRunRetryJobDelay).toEqual(false);
  });

  it('Runs cleanup on a long-running job that throws an error if it was aborted', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    let didRunHandler = false;
    let didRunCleanup = false;
    let didRunRetryJobDelay = false;
    const handler = async () => {
      await queue.abortQueue(queueId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      didRunHandler = true;
      throw new Error('Test error in aborted queue');
    };
    const cleanup = async () => {
      didRunCleanup = true;
    };
    const retryJobDelay = () => {
      didRunRetryJobDelay = true;
      return 0;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    queue.setRetryJobDelay(type, retryJobDelay);
    await enqueueToDatabase(queueId, type, [], 0);

    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeCleanup(type);
    queue.removeRetryJobDelay(type);

    expect(didRunHandler).toEqual(true);
    expect(didRunCleanup).toEqual(true);
    expect(didRunRetryJobDelay).toEqual(false);
  });

  it('Prevents running a scheduled job that was aborted', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    let handlerCount = 0;
    let cleanupCount = 0;
    let retryCount = 0;
    const handler = async (args:Array<any>) => {
      const [shouldAbortQueue] = args;
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (shouldAbortQueue) {
        await queue.abortQueue(queueId);
      }
      handlerCount += 1;
    };
    const cleanup = async () => {
      cleanupCount += 1;
    };
    const retryJobDelay = () => {
      retryCount += 1;
      return 0;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    queue.setRetryJobDelay(type, retryJobDelay);
    await enqueueToDatabase(queueId, type, [true], 0);
    await enqueueToDatabase(queueId, type, [false], 1000);

    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeCleanup(type);
    queue.removeRetryJobDelay(type);

    expect(handlerCount).toEqual(1);
    expect(cleanupCount).toEqual(1);
    expect(retryCount).toEqual(0);
  });

  it('Emits queueActive and queueInactive events when a queue becomes active or inactive', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value], 0);

    await expectAsync(queue).toEmit('queueActive', queueId);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    queue.clear();
    await expectAsync(queue).toEmit('queueInactive', queueId); // Triggers after 5s or on a 'clearing' event
  });

  it('Cleans up and removes a job from the queue if a job is marked with status "clean up and remove" after a job is complete', async () => {
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    const idA = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    const idB = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueB], 0);
    await expectAsync(echoEmitter).toEmit('echo', { value: valueA });
    await expectAsync(echoEmitter).toEmit('echo', { value: valueB });

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }, {
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await markJobCleanupAndRemoveInDatabase(idA);
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
    await queue.onIdle();

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
  });


  it('Cleans up and removes jobs from the queue if abortAndRemove is called', async () => {
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    const idA = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    const idB = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueB], 0);
    await expectAsync(echoEmitter).toEmit('echo', { value: valueA });
    await expectAsync(echoEmitter).toEmit('echo', { value: valueB });

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }, {
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await queue.abortAndRemoveQueue(queueId);
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
    await queue.onIdle();
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
  });

  it('Cleans up and removes jobs from the queue with job IDs larger than a specified number if abortAndRemoveQueueJobsGreaterThanId is called', async () => {
    await queue.disableStartOnJob();
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    const valueC = uuidv4();
    const idA = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    const idB = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueB], 0);
    const idC = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueC], 0);

    await queue.dequeue();

    await expectAsync(echoEmitter).toEmit('echo', { value: valueA });
    await expectAsync(echoEmitter).toEmit('echo', { value: valueB });
    await expectAsync(echoEmitter).toEmit('echo', { value: valueC });

    await queue.onIdle();

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }, {
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }, {
      id: idC,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueC],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);

    await queue.abortAndRemoveQueueJobsGreaterThanId(queueId, idA);

    queue.dequeue();

    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueC, cleanupData: { value: valueC } });
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });

    await queue.onIdle();
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
  });

  it('Cleans up and removes a job from the queue if a job is marked with status "clean up and remove" after a job is complete if jobEmitter is not active', async () => {
    queue.disableStartOnJob();
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    const idA = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    const idB = await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueB], 0);
    queue.dequeue();
    await expectAsync(echoEmitter).toEmit('echo', { value: valueA });
    await expectAsync(echoEmitter).toEmit('echo', { value: valueB });

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }, {
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await queue.onIdle();
    await markJobCleanupAndRemoveInDatabase(idA);

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueA],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: jasmine.any(Number),
    }, {
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    queue.dequeue();
    await expectAsync(echoEmitter).toEmit('echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
    await queue.onIdle();

    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idB,
      queueId,
      type: 'echo',
      args: [TRIGGER_NO_ERROR, valueB],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    queue.enableStartOnJob();
  });


  it('Cleans up and removes a job from the queue if a job is marked with status "clean up and remove" while a job is in progress', async () => {
    let id;
    let didRunCleanup = false;
    const handler = async () => {
      await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
        id,
        queueId,
        type,
        args: [],
        attempt: 0,
        created: jasmine.any(Number),
        status: JOB_ERROR_STATUS,
        startAfter: jasmine.any(Number),
      }]);
      if (typeof id === 'number') {
        await markJobCleanupAndRemoveInDatabase(id);
      }

      await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
        id,
        queueId,
        type,
        args: [],
        attempt: 0,
        created: jasmine.any(Number),
        status: JOB_CLEANUP_AND_REMOVE_STATUS,
        startAfter: jasmine.any(Number),
      }]);
    };
    const cleanup = async () => {
      didRunCleanup = true;
    };
    const type = uuidv4();
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    id = await enqueueToDatabase(queueId, type, [], 0);
    await queue.onIdle();

    expect(didRunCleanup).toEqual(true);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });

  it('Removes a job marked as "cleanup and remove" while the cleanup handler is running', async () => {
    let id;
    let didRunCleanup = false;
    const handler = async () => {
      throw new FatalError('Test fatal error');
    };
    const cleanup = async () => {
      await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
        id,
        queueId,
        type,
        args: [],
        attempt: 1,
        created: jasmine.any(Number),
        status: JOB_CLEANUP_STATUS,
        startAfter: jasmine.any(Number),
      }]);
      if (typeof id === 'number') {
        didRunCleanup = true;
        await markJobCleanupAndRemoveInDatabase(id);
      }

      await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
        id,
        queueId,
        type,
        args: [],
        attempt: 1,
        created: jasmine.any(Number),
        status: JOB_CLEANUP_AND_REMOVE_STATUS,
        startAfter: jasmine.any(Number),
      }]);
    };
    const type = uuidv4();
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    id = await enqueueToDatabase(queueId, type, [], 0);
    await queue.onIdle();

    expect(didRunCleanup).toEqual(true);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });

  it('Removes a job marked as "cleanup and remove" while the non-fatal error handler is running', async () => {
    let id;
    let handlerCount = 0;
    let didRunCleanup = false;
    const type = uuidv4();
    const retryJobDelay = (attempt, error) => {
      if (didRunCleanup) {
        return false;
      }

      expect(handlerCount).toEqual(1);
      expect(error).toBeInstanceOf(Error);
      return 0;
    };
    const handler = async () => {
      handlerCount += 1;
      throw new Error('Test non-fatal error');
    };
    const cleanup = async () => {
      await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
        id,
        queueId,
        type,
        args: [],
        attempt: 1,
        created: jasmine.any(Number),
        status: JOB_ERROR_STATUS,
        startAfter: jasmine.any(Number),
      }]);
      if (typeof id === 'number') {
        didRunCleanup = true;
        await markJobCleanupAndRemoveInDatabase(id);
      }

      await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
        id,
        queueId,
        type,
        args: [],
        attempt: 1,
        created: jasmine.any(Number),
        status: JOB_CLEANUP_AND_REMOVE_STATUS,
        startAfter: jasmine.any(Number),
      }]);
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    queue.setRetryJobDelay(type, retryJobDelay);
    const queueId = uuidv4();
    id = await enqueueToDatabase(queueId, type, [], 0);
    await queue.onIdle();

    expect(handlerCount).toEqual(1);
    expect(didRunCleanup).toEqual(true);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
    queue.removeRetryJobDelay(type);
  });

  it('Removes a job marked as "cleanup and remove" before the handler starts', async () => {
    let handlerCount = 0;
    let cleanupCount = 0;
    let idB;
    const type = uuidv4();
    const handler = async () => {
      if (handlerCount === 0) {
        while (typeof idB !== 'number') {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        await markJobCleanupAndRemoveInDatabase(idB);
      }
      handlerCount += 1;
    };
    const cleanup = async () => {
      cleanupCount += 1;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    const idA = await enqueueToDatabase(queueId, type, [], 0);
    idB = await enqueueToDatabase(queueId, type, [], 0);
    await queue.onIdle();

    expect(handlerCount).toEqual(1);
    expect(cleanupCount).toEqual(0);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id: idA,
      queueId,
      type,
      args: [],
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });

  it('Removes a job marked as "cleanup and remove" after the job is started but before the handler runs', async () => {
    let handlerCount = 0;
    let cleanupCount = 0;
    const type = uuidv4();
    const handler = async () => {
      handlerCount += 1;
    };
    const cleanup = async () => {
      cleanupCount += 1;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 0);
    await markJobCleanupAndRemoveInDatabase(id);
    await queue.onIdle();

    expect(handlerCount).toEqual(0);
    expect(cleanupCount).toEqual(0);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });

  it('Cleanly removes a job removed without emitting jobDelete events while the handler runs', async () => {
    let handlerCount = 0;
    let cleanupCount = 0;
    let id;
    const type = uuidv4();
    const handler = async () => {
      if (typeof id === 'number') {
        await silentlyRemoveJobFromDatabase(id);
      }
      handlerCount += 1;
    };
    const cleanup = async () => {
      cleanupCount += 1;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    id = await enqueueToDatabase(queueId, type, [], 0);
    await queue.onIdle();

    expect(handlerCount).toEqual(1);
    expect(cleanupCount).toEqual(1);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });

  it('Cleanly removes a job removed while the handler runs', async () => {
    let handlerCount = 0;
    let cleanupCount = 0;
    let id;
    const type = uuidv4();
    const handler = async () => {
      if (typeof id === 'number') {
        await removeJobFromDatabase(id);
      }
      handlerCount += 1;
    };
    const cleanup = async () => {
      cleanupCount += 1;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    id = await enqueueToDatabase(queueId, type, [], 0);
    await queue.onIdle();

    expect(handlerCount).toEqual(1);
    expect(cleanupCount).toEqual(1);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });

  it('Removes a job marked as "cleanup and remove" during a delayed start', async () => {
    let handlerCount = 0;
    let cleanupCount = 0;
    const type = uuidv4();
    const handler = async () => {
      handlerCount += 1;
    };
    const cleanup = async () => {
      cleanupCount += 1;
    };
    queue.setHandler(type, handler);
    queue.setCleanup(type, cleanup);
    const queueId = uuidv4();
    const id = await enqueueToDatabase(queueId, type, [], 1000);
    await expectAsync(queue).toEmit('dequeue', { id });
    await markJobCleanupAndRemoveInDatabase(id);
    await queue.onIdle();

    expect(handlerCount).toEqual(0);
    expect(cleanupCount).toEqual(0);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([]);
    queue.removeHandler(type);
    queue.removeCleanup(type);
  });
});
