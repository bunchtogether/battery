// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
} from '../src/database';
import { getNextEmit, asyncEmitMatchers } from './lib/emit';
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
    const handler = async () => {
      await new Promise((resolve) => setTimeout(resolve, Math.round(Math.random() * 10) + 100));
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

    expect(queue.getQueueDurationEstimate(queueId)).toEqual([0, 0]);
    await enqueueToDatabase(queueId, type, argsA, 0);
    await enqueueToDatabase(queueId, type, argsB, 0);
    const queueDurationPromiseA1 = expectAsync(queue).toEmit('queueDuration', queueId, 100, 100);
    const queueDurationPromiseB1 = expectAsync(queue).toEmit('queueDuration', queueId, 200, 200);
    await queue.dequeue();
    await queueDurationPromiseA1;
    await queueDurationPromiseB1;
    const queueDurationA2 = await getNextEmit(queue, 'queueDuration');

    expect(queueDurationA2[1]).toBeGreaterThan(200);
    expect(queueDurationA2[2]).toEqual(100);
    const queueDurationB2 = await getNextEmit(queue, 'queueDuration');

    expect(queueDurationB2[1]).toBeGreaterThan(200);
    expect(queueDurationB2[2]).toEqual(0);
    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeDurationEstimateHandler(type);

    expect(durationEstimateCount).toEqual(2);
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
    queue.setHandler(type, handler);
    queue.setRetryJobDelay(type, retryJobDelay);
    queue.setCleanup(type, cleanup);
    queue.setDurationEstimateHandler(type, durationEstimateHandler);
    queue.disableStartOnJob();

    expect(queue.getQueueDurationEstimate(queueId)).toEqual([0, 0]);
    await enqueueToDatabase(queueId, type, argsA, 0);
    await enqueueToDatabase(queueId, type, argsB, 0);
    const queueDurationPromiseA1 = expectAsync(queue).toEmit('queueDuration', queueId, 100, 100);
    const queueDurationPromiseB1 = expectAsync(queue).toEmit('queueDuration', queueId, 200, 200);
    await queue.dequeue();
    await queueDurationPromiseA1;
    await queueDurationPromiseB1;
    await expectAsync(queue).toEmit('queueDuration', queueId, 200, 200); // Repeat estimate after the error
    const queueDurationA2 = await getNextEmit(queue, 'queueDuration');

    expect(queueDurationA2[1]).toBeGreaterThan(200);
    expect(queueDurationA2[2]).toEqual(100);
    const queueDurationB2 = await getNextEmit(queue, 'queueDuration');

    expect(queueDurationB2[1]).toBeGreaterThan(200);
    expect(queueDurationB2[2]).toEqual(0);
    await queue.onIdle();
    queue.removeHandler(type);
    queue.removeRetryJobDelay(type);
    queue.removeCleanup(type);
    queue.removeDurationEstimateHandler(type);

    expect(durationEstimateCount).toEqual(3);
  });
});
