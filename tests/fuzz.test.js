// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
} from '../src/database';
import { queue } from './lib/queue';
import { oneOutOf } from './lib/fuzz';

const QUEUE_COUNT = 4;
const JOB_COUNT = 40;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('Fuzz', () => {
  beforeAll(() => {
    queue.enableStartOnJob();
  });

  afterAll(() => {
    queue.disableStartOnJob();
  });

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
      if (oneOutOf(2)) {
        enqueueToDatabase(queueId, 'fuzz', args);
      } else {
        await enqueueToDatabase(queueId, 'fuzz', args);
      }
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
      enqueueToDatabase(queueId, 'fuzz', args);
    }
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
      await enqueueToDatabase(queueId, 'fuzz', args);
    }
    await queue.onIdle();

    expect(true).toEqual(true);
  });
});
