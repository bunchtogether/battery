// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
  getCompletedJobsCountFromDatabase,
  removeCompletedExpiredItemsFromDatabase,
  markCleanupStartAfterInDatabase,
} from '../src/database';
import BatteryQueue from '../src/queue';
import {
  TRIGGER_NO_ERROR,
  TRIGGER_ERROR,
  TRIGGER_FATAL_ERROR,
  TRIGGER_DELAY_RETRY_ERROR,
  TRIGGER_ERROR_IN_CLEANUP,
  TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP,
  TRIGGER_FATAL_ERROR_IN_CLEANUP,
  TRIGGER_DELAY_RETRY_ERROR_IN_CLEANUP,
  handler as echoHandler,
  cleanup as echoCleanup,
  emitter as echoEmitter,
} from './lib/echo-handler';
import { expectEmit, getNextEmit } from './lib/emit';

const queue = new BatteryQueue();

queue.addHandler('echo', echoHandler);
queue.addCleanup('echo', echoCleanup);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


describe('Queue', () => {
  afterEach(async () => {
    await queue.clear();
  });

  it('Enqueues to the database and is handled', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const args = [TRIGGER_NO_ERROR, value, maxCleanupAttempts];
    const maxAttempts = Math.round(2 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    const dequeuePromise = expectEmit(queue, 'dequeue', { id });
    const echoPromise = expectEmit(echoEmitter, 'echo', { value });
    queue.dequeue();
    await dequeuePromise;
    await echoPromise;
  });

  it('Enqueues to the database and is cleaned up after an error', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const maxAttempts = Math.round(2 + Math.random() * 10);
    let retries = 0;
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, value, maxCleanupAttempts], maxAttempts, 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);
    const echoCleanupErrorPromise = expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });
    const fatalErrorPromise = expectEmit(queue, 'fatalError', { queueId });
    queue.dequeue();
    await echoCleanupErrorPromise;
    await fatalErrorPromise;

    expect(retries).toBeGreaterThan(1);
    queue.removeListener('retry', handleRetry);
  });

  it('Enqueues to the database and is cleaned up after a fatal error without retrying', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const maxAttempts = Math.round(2 + Math.random() * 10);
    let retries = 0;
    const id = await enqueueToDatabase(queueId, 'echo', [TRIGGER_FATAL_ERROR, value, maxCleanupAttempts], maxAttempts, 0);
    const handleRetry = ({ id: retryId }) => {
      if (retryId === id) {
        retries += 1;
      }
    };
    queue.addListener('retry', handleRetry);
    const echoCleanupErrorPromise = expectEmit(echoEmitter, 'echoCleanupComplete', { value, cleanupData: { value } });
    const fatalErrorPromise = expectEmit(queue, 'fatalError', { queueId });
    queue.dequeue();
    await echoCleanupErrorPromise;
    await fatalErrorPromise;

    expect(retries).toEqual(0);
    queue.removeListener('retry', handleRetry);
  });

  it('Cleans up jobs in the reverse order that they were added', async () => {
    const queueId = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const expectedCleanupValues = [];
    for (let i = 0; i < 10; i += 1) {
      const value = uuidv4();
      await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value, maxCleanupAttempts], 0, 0);
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
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const valueA = uuidv4();
    const valueB = uuidv4();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA, maxCleanupAttempts], 0, 0);
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_FATAL_ERROR, valueB, maxCleanupAttempts], 0, 0);
    queue.dequeue();
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
  });

  it('Cleans up jobs in the reverse order that they were added following a maximum number of retries', async () => {
    const queueId = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const valueA = uuidv4();
    const valueB = uuidv4();
    const maxAttempts = Math.round(2 + Math.random() * 10);
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, valueA, maxCleanupAttempts], maxAttempts, 0);
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_ERROR, valueB, maxCleanupAttempts], maxAttempts, 0);
    queue.dequeue();
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value: valueB, cleanupData: { value: valueB } });
    await expectEmit(echoEmitter, 'echoCleanupComplete', { value: valueA, cleanupData: { value: valueA } });
  });

  it('Retries jobs after specified delay if a DelayRetryError error is thrown', async () => {
    const queueId = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const value = uuidv4();
    const args = [TRIGGER_DELAY_RETRY_ERROR, value, maxCleanupAttempts];
    const maxAttempts = 1;
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    queue.dequeue();
    await expectEmit(queue, 'delayRetry', { id, queueId, delay: 100 });
  });

  it('Retries jobs with a fixed retry delay handler', async () => {
    try {
      const queueId = uuidv4();
      const maxCleanupAttempts = Math.ceil(Math.random() * 10);
      const value = uuidv4();
      const args = [TRIGGER_ERROR, value, maxCleanupAttempts];
      const maxAttempts = 1;
      const retryDelay = Math.round(Math.random() * 1000);
      queue.setRetryDelay('echo', retryDelay);
      const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
      queue.dequeue();
      await expectEmit(queue, 'delayRetry', { id, queueId, delay: retryDelay });
    } catch (error) {
      throw error;
    } finally {
      queue.removeRetryDelay('echo');
    }
  });

  it('Retries jobs with a dynamic retry delay handler based on attempt', async () => {
    try {
      const queueId = uuidv4();
      const maxCleanupAttempts = Math.ceil(Math.random() * 10);
      const value = uuidv4();
      const args = [TRIGGER_ERROR, value, maxCleanupAttempts];
      const maxAttempts = 2;
      const retryFactor = Math.round(Math.random() * 100);
      queue.setRetryDelay('echo', (attempt:number) => attempt * retryFactor);
      const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
      queue.dequeue();
      await expectEmit(queue, 'delayRetry', { id, queueId, delay: retryFactor });
      await expectEmit(queue, 'delayRetry', { id, queueId, delay: retryFactor * 2 });
    } catch (error) {
      throw error;
    } finally {
      queue.removeRetryDelay('echo');
    }
  });

  it('Removes completed items older than a certain age', async () => {
    const queueId = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value, maxCleanupAttempts];
    const maxAttempts = 1;
    await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);

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
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const value = uuidv4();
    const maxAttempts = 1;
    let echoReceivedTime = -1;
    const start = Date.now();
    await enqueueToDatabase(queueId, 'echo', [TRIGGER_NO_ERROR, value, maxCleanupAttempts], maxAttempts, 250);
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
    const maxCleanupAttempts = Math.ceil(Math.random() * 10);
    const args = [TRIGGER_NO_ERROR, value, maxCleanupAttempts];
    const maxAttempts = Math.round(2 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    const start = Date.now();
    await markCleanupStartAfterInDatabase(id, Date.now() + 250);
    let echoCleanupReceivedTime = -1;
    const handleEchoCleanup = ({ value: echoValue }) => {
      if (echoValue === value) {
        echoCleanupReceivedTime = Date.now();
      }
    };
    echoEmitter.addListener('echoCleanupComplete', handleEchoCleanup);
    await queue.dequeue();
    await queue.onIdle();
    echoEmitter.removeListener('echoCleanupComplete', handleEchoCleanup);

    expect(echoCleanupReceivedTime).toBeGreaterThan(start + 250);
  });

  it('Enqueues to the database and is cleaned up after a DelayRetryError', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = 2;
    const args = [TRIGGER_DELAY_RETRY_ERROR_IN_CLEANUP, value, maxCleanupAttempts];
    const maxAttempts = Math.round(2 + Math.random() * 10);
    await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    queue.dequeue();
    const delayCleanupRetry = await getNextEmit(queue, 'delayCleanupRetry');

    expect(delayCleanupRetry.delay).toBeGreaterThan(250);
  });

  it('Enqueues to the database and is stops cleanup after FatalCleanupError', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = 1;
    const args = [TRIGGER_FATAL_ERROR_IN_CLEANUP, value, maxCleanupAttempts];
    const maxAttempts = Math.round(2 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    queue.dequeue();
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });
  });

  it('Enqueues to the database and stops cleanup after FatalCleanupError', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = 2;
    const args = [TRIGGER_ERROR_IN_CLEANUP, value, maxCleanupAttempts];
    const maxAttempts = Math.round(2 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    queue.dequeue();
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });
  });

  it('Enqueues to the database and stops cleanup after reaching max cleanup attempts', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 5);
    const args = [TRIGGER_ERROR_IN_CLEANUP, value, maxCleanupAttempts];
    const maxAttempts = Math.round(2 + Math.random() * 10);
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    await queue.dequeue();
    await queue.onIdle();
    await queue.abortQueue(queueId);
    let cleanupAttempts = 0;
    const handleDequeueCleanup = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('dequeueCleanup', handleDequeueCleanup);
    queue.dequeue();
    await expectEmit(queue, 'fatalCleanupError', { id, queueId });
    echoEmitter.removeListener('dequeueCleanup', handleDequeueCleanup);

    expect(cleanupAttempts).toEqual(maxCleanupAttempts);
  });


  it('Handles errors thrown in cleanup methods', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const maxCleanupAttempts = Math.ceil(Math.random() * 3);
    const args = [TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP, value, maxCleanupAttempts];
    const maxAttempts = Math.ceil(Math.random() * 3);
    const id = await enqueueToDatabase(queueId, 'echo', args, maxAttempts, 0);
    let jobAttempts = 0;
    const handleDequeue = ({ id: jobId }) => {
      if (jobId === id) {
        jobAttempts += 1;
      }
    };
    queue.addListener('dequeue', handleDequeue);
    let cleanupAttempts = 0;
    const handleDequeueCleanup = ({ id: cleanupId }) => {
      if (cleanupId === id) {
        cleanupAttempts += 1;
      }
    };
    queue.addListener('dequeueCleanup', handleDequeueCleanup);
    queue.dequeue();
    await queue.onIdle();
    echoEmitter.removeListener('dequeueCleanup', handleDequeue);
    echoEmitter.removeListener('dequeueCleanup', handleDequeueCleanup);

    expect(jobAttempts).toEqual(maxAttempts);
    expect(cleanupAttempts).toEqual(maxAttempts * maxCleanupAttempts);
  });
});
