// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
} from '../src/database';
import { asyncEmitMatchers } from './lib/emit';
import { queue } from './lib/queue';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


describe('Time Estimation', () => {
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

  it('Estimates duration remaining in a queue', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [Math.round(Math.random() * 100)];
    const argsB = [Math.round(Math.random() * 100)];
    const handler = async (args, abortSignal, updateCleanupData, updateDuration) => { // eslint-disable-line no-unused-vars
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 10) + 50));
      updateDuration(Date.now() - start + 50, 50);
      await new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 10) + 50));
    };
    let durationEstimateCount = 0;
    const durationEstimateHandler = (args) => {
      durationEstimateCount += 1;
      if (durationEstimateCount === 1) {
        expect(args).toEqual(argsA);
      } else if (durationEstimateCount === 2) {
        expect(args).toEqual(argsB);
      }
      return 100;
    };
    queue.setHandler(type, handler);
    queue.setDurationEstimateHandler(type, durationEstimateHandler);
    queue.disableStartOnJob();

    expect(queue.getDurationEstimate(queueId)).toEqual([0, 0]);
    await enqueueToDatabase(queueId, type, argsA, 0, false);
    await enqueueToDatabase(queueId, type, argsB, 0, false);

    const events = [];
    const handleQueueDuration = (...args) => {
      events.push(args);
    };
    queue.addListener('queueDuration', handleQueueDuration);
    await queue.dequeue();
    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeDurationEstimateHandler(type);

    const eventA1 = events.shift();

    expect(eventA1).toEqual([queueId, 100, 100]);

    const eventB1 = events.shift();

    expect(eventB1).toEqual([queueId, 200, 200]);

    const eventA2 = events.shift();

    expect(eventA2).toEqual([queueId, 200, 200]);

    const eventA3 = events.shift();

    expect(eventA3[1]).toBeGreaterThan(200);
    expect(eventA3[2]).toBeLessThan(200);

    const eventA4 = events.shift();

    expect(eventA4[1]).toBeGreaterThan(200);
    expect(eventA4[2]).toEqual(100);

    const eventB2 = events.shift();

    expect(eventB2[1]).toBeGreaterThan(200);
    expect(eventB2[2]).toEqual(100);

    const eventB3 = events.shift();

    expect(eventB3[1]).toBeGreaterThan(200);
    expect(eventB3[2]).toBeLessThan(100);

    const eventB4 = events.shift();

    expect(eventB4[1]).toBeGreaterThan(200);
    expect(eventB4[2]).toEqual(0);

    expect(durationEstimateCount).toEqual(4);

    queue.removeListener('queueDuration', handleQueueDuration);

    expect(durationEstimateCount).toEqual(4);
  });

  it('Estimates duration remaining in a queue after errors', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [Math.round(Math.random() * 100)];
    const argsB = [Math.round(Math.random() * 100)];
    let handlerCount = 0;
    const handler = async () => {
      handlerCount += 1;
      if (handlerCount === 1) {
        throw new Error('Test duration error');
      }
      await new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 10) + 100));
    };
    const cleanup = async () => {
      await new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 10) + 100));
    };
    const retryJobDelay = () => 0;
    let durationEstimateCount = 0;
    const durationEstimateHandler = () => {
      durationEstimateCount += 1;
      return 100;
    };
    const events = [];
    const handleQueueDuration = (...args) => {
      events.push(args);
    };

    queue.setHandler(type, handler);
    queue.setRetryJobDelay(type, retryJobDelay);
    queue.setCleanup(type, cleanup);
    queue.setDurationEstimateHandler(type, durationEstimateHandler);
    queue.disableStartOnJob();

    expect(queue.getDurationEstimate(queueId)).toEqual([0, 0]);
    queue.addListener('queueDuration', handleQueueDuration);
    await enqueueToDatabase(queueId, type, argsA, 0, false);
    await enqueueToDatabase(queueId, type, argsB, 0, false);

    await queue.dequeue();
    await queue.onIdle();

    queue.removeHandler(type);
    queue.removeRetryJobDelay(type);
    queue.removeCleanup(type);
    queue.removeDurationEstimateHandler(type);
    queue.removeListener('queueDuration', handleQueueDuration);

    const eventA1 = events.shift();

    expect(eventA1).toEqual([queueId, 100, 100]);

    const eventB1 = events.shift();

    expect(eventB1).toEqual([queueId, 200, 200]);

    const eventA2 = events.shift();

    expect(eventA2).toEqual([queueId, 200, 200]);

    const eventA3 = events.shift();

    expect(eventA3).toEqual([queueId, 200, 200]);

    const eventA4 = events.shift();

    expect(eventA4).toEqual([queueId, 200, 200]);

    const eventA5 = events.shift();

    expect(eventA5[1]).toBeGreaterThan(200);
    expect(eventA5[2]).toEqual(100);

    const eventB2 = events.shift();

    expect(eventB2[1]).toBeGreaterThan(200);
    expect(eventB2[2]).toEqual(100);

    const eventB3 = events.shift();

    expect(eventB3[1]).toBeGreaterThan(200);
    expect(eventB3[2]).toEqual(0);

    expect(durationEstimateCount).toEqual(6);
  });

  it('Updates duration remaining in a queue', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    const argsA = [Math.round(Math.random() * 100)];
    const argsB = [Math.round(Math.random() * 100)];
    const handler = async (args, abortSignal, updateCleanupData, updateDuration) => { // eslint-disable-line no-unused-vars
      queue.updateDurationEstimates();
      await new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 10) + 100));
    };
    const durationEstimateHandler = () => 100;
    queue.setHandler(type, handler);
    queue.setDurationEstimateHandler(type, durationEstimateHandler);
    queue.disableStartOnJob();

    expect(queue.getDurationEstimate(queueId)).toEqual([0, 0]);
    await enqueueToDatabase(queueId, type, argsA, 0, false);
    await enqueueToDatabase(queueId, type, argsB, 0, false);
    const events = [];
    const handleQueueDuration = (...args) => {
      events.push(args);
    };
    queue.addListener('queueDuration', handleQueueDuration);
    await queue.dequeue();
    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeDurationEstimateHandler(type);
    const eventA1 = events.shift();

    expect(eventA1).toEqual([queueId, 100, 100]);

    const eventB1 = events.shift();

    expect(eventB1).toEqual([queueId, 200, 200]);

    const eventA2 = events.shift();

    expect(eventA2).toEqual([queueId, 200, 200]);

    const eventB2 = events.shift();

    expect(eventB2).toEqual([queueId, 200, 200]);

    const eventA3 = events.shift();

    expect(eventA3[1]).toBeGreaterThan(200);
    expect(eventA3[2]).toBe(100);

    const eventB3 = events.shift();

    expect(eventB3[1]).toBeGreaterThan(200);
    expect(eventB3[2]).toBe(100);

    const eventB4 = events.shift();

    expect(eventB4[1]).toBeGreaterThan(200);
    expect(eventB4[2]).toBe(0);
  });
});
