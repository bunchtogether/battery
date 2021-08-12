// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
  getCompletedJobsCountFromDatabase,
  removeCompletedExpiredItemsFromDatabase,
  markCleanupStartAfterInDatabase,
} from '../src/database';
import {
  TRIGGER_NO_ERROR,
  TRIGGER_ERROR,
  TRIGGER_FATAL_ERROR,
  TRIGGER_ERROR_IN_CLEANUP,
  TRIGGER_FATAL_ERROR_IN_CLEANUP,
  emitter as echoEmitter,
} from './lib/echo-handler';
import { expectEmit } from './lib/emit';
import { queue } from './lib/queue';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


describe('Queue', () => {
  afterEach(async () => {
    await queue.clear();
  });

  it('Enqueues to the database and is handled', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    queue.dequeue();
    await expectEmit(queue, 'dequeue', { id });
    await expectEmit(echoEmitter, 'echo', { value });
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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
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
    queue.dequeue();
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });
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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    queue.dequeue();
    await expectEmit(queue, 'fatalError', { queueId });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });

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
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    await queue.dequeue();
    while (expectedCleanupValues.length > 0) {
      const value = expectedCleanupValues.pop();
      await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });
    }
  });

  it('Cleans up jobs in the reverse order that they were added following a fatal error', async () => {
    const queueId = uuidv4();
    const valueA = uuidv4();
    const valueB = uuidv4();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA], 0);
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_FATAL_ERROR, valueB], 0);
    queue.dequeue();
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
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
    queue.dequeue();
    await expectEmit(queue, 'retryDelay', { id, queueId, retryDelay: 100 });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });
    await expectEmit(queue, 'fatalError', { queueId });

    expect(retries).toEqual(1);
    queue.removeListener('retry', handleRetry);
    queue.removeRetryJobDelay('echo');
  });

  it('Removes completed items older than a certain age', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];

    await enqueueToDatabase(queueId, 'echo', args, 0);

    expect(await getCompletedJobsCountFromDatabase(queueId)).toEqual(0);
    await queue.dequeue();
    await queue.onIdle();

    expect(await getCompletedJobsCountFromDatabase(queueId)).toEqual(1);
    await removeCompletedExpiredItemsFromDatabase(60 * 1000);

    expect(await getCompletedJobsCountFromDatabase(queueId)).toEqual(1);
    await removeCompletedExpiredItemsFromDatabase(0);

    expect(await getCompletedJobsCountFromDatabase(queueId)).toEqual(0);
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
    await queue.dequeue();
    await queue.onIdle();
    echoEmitter.removeListener('echo', handleEcho);

    expect(echoReceivedTime).toBeGreaterThan(start + 250);
  });

  it('Enqueues to the database and is cleaned up after an error following a defined delay', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    queue.dequeue();
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

  it('Enqueues to the database and stops cleanup after FatalCleanupError', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_FATAL_ERROR_IN_CLEANUP, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    queue.dequeue();
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });
  });

  it('Enqueues to the database and stops cleanup after Error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_ERROR_IN_CLEANUP, value];
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    queue.dequeue();
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });
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
    await queue.dequeue();
    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
    await queue.onIdle();
    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
    await queue.onIdle();

    const handleCleanupStart = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('cleanupStart', handleCleanupStart);
    await queue.abortQueue(queueId);
    await expectEmit(queue, 'retryCleanupDelay', { id, queueId, retryCleanupDelay: 100 });
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });

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
    await queue.dequeue();
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
    await queue.dequeue();
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
    await queue.dequeue();
    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeCleanup(type);
    queue.removeRetryJobDelay(type);

    expect(handlerCount).toEqual(1);
    expect(cleanupCount).toEqual(1);
    expect(retryCount).toEqual(0);
  });
});
