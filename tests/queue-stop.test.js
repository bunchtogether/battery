// @flow

import { v4 as uuidv4 } from 'uuid';
import {
  enqueueToDatabase,
} from '../src/database';
import { asyncEmitMatchers } from './lib/emit';
import { queue } from './lib/queue';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


describe('Queue (Graceful Stop)', () => {
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

  it('Removes a job marked as "cleanup and remove" if the job encounters an error', async () => {
    const queueId = uuidv4();
    const type = uuidv4();
    let handlerCount = 0;
    const handler = async () => {
      queue.stop();
      handlerCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };
    queue.setHandler(type, handler);
    queue.disableStartOnJob();
    const idA = await enqueueToDatabase(queueId, type, [], 0, false);
    const idB = await enqueueToDatabase(queueId, type, [], 0, false);
    queue.dequeue();
    const dequeueAPromise = expectAsync(queue).toEmit('dequeue', { id: idA });
    const dequeueBPromise = expectAsync(queue).toEmit('dequeue', { id: idB });
    await dequeueAPromise;
    await dequeueBPromise;
    await expectAsync(queue).toEmit('stop');
    queue.removeHandler(type);

    expect(handlerCount).toEqual(1);
  });
});
