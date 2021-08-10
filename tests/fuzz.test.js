// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
} from '../src/database';
import { queue } from './lib/queue';
import { oneOutOf } from './lib/fuzz';

const QUEUE_COUNT = 2;
const JOB_COUNT = 10;

describe('Fuzz', () => {
  afterEach(async () => {
    await queue.clear();
  });

  it('Should fuzz items', async () => {
    const queueIds = [];
    for (let i = 0; i < QUEUE_COUNT; i += 1) {
      queueIds.push(uuidv4());
    }
    for (let i = 0; i < JOB_COUNT; i += 1) {
      const queueId = queueIds[Math.floor(Math.random() * queueIds.length)];
      const args = [];
      const maxAttempts = 1;
      if (oneOutOf(2)) {
        enqueueToDatabase(queueId, 'fuzz', args, maxAttempts, 0);
      } else {
        await enqueueToDatabase(queueId, 'fuzz', args, maxAttempts, 0);
      }
      if (oneOutOf(JOB_COUNT / 3)) {
        if (oneOutOf(2)) {
          queue.dequeue();
        } else {
          await queue.dequeue();
        }
      }
    }
    if (oneOutOf(2)) {
      queue.dequeue();
    } else {
      await queue.dequeue();
    }
    await queue.onIdle();

    expect(true).toEqual(true);
  });

  it('Should fuzz items added synchronously', async () => {
    const queueIds = [];
    for (let i = 0; i < QUEUE_COUNT; i += 1) {
      queueIds.push(uuidv4());
    }
    for (let i = 0; i < JOB_COUNT; i += 1) {
      const queueId = queueIds[Math.floor(Math.random() * queueIds.length)];
      const args = [];
      const maxAttempts = 1;
      enqueueToDatabase(queueId, 'fuzz', args, maxAttempts, 0);
      if (oneOutOf(JOB_COUNT / 3)) {
        queue.dequeue();
      }
    }
    queue.dequeue();
    await queue.onIdle();

    expect(true).toEqual(true);
  });

  it('Should fuzz items added asynchronously', async () => {
    const queueIds = [];
    for (let i = 0; i < QUEUE_COUNT; i += 1) {
      queueIds.push(uuidv4());
    }
    for (let i = 0; i < JOB_COUNT; i += 1) {
      const queueId = queueIds[Math.floor(Math.random() * queueIds.length)];
      const args = [];
      const maxAttempts = 1;
      await enqueueToDatabase(queueId, 'fuzz', args, maxAttempts, 0);
      if (oneOutOf(JOB_COUNT / 3)) {
        await queue.dequeue();
      }
    }
    await queue.dequeue();
    await queue.onIdle();

    expect(true).toEqual(true);
  });
});
