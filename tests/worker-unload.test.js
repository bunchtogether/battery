// @flow

import { v4 as uuidv4 } from 'uuid';
import { getServiceWorkerAndRegistration } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import { asyncEmitMatchers } from './lib/emit';
import {
  jobEmitter,
  enqueueToDatabase,
  scheduleAbortQueueOnUnload,
  getAllAbortOnUnloadQueues,
  getJobsInQueueFromDatabase,
  JOB_ABORTED_STATUS,
  JOB_COMPLETE_STATUS,
} from '../src/database';
import {
  TRIGGER_NO_ERROR,
} from './lib/echo-handler';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const queueInterface = new BatteryQueueServiceWorkerInterface();

describe('Worker (Unload)', () => {
  beforeAll(async () => {
    jasmine.addAsyncMatchers(asyncEmitMatchers);
    await getServiceWorkerAndRegistration();
    await queueInterface.link();
    await queueInterface.enableStartOnJob();
  });

  afterAll(async () => {
    await queueInterface.disableStartOnJob();
    await queueInterface.unlink();
  });

  afterEach(async () => {
    await queueInterface.clear();
  });

  it('Queue should send an unload event after receiving a sync manager registration', async () => {
    const port = queueInterface.port;
    if (!(port instanceof MessagePort)) {
      throw new Error('Message port does not exist');
    }
    port.postMessage({ type: 'heartbeat', args: [250] });
    // $FlowFixMe
    const [registration] = await queueInterface.getRegistrationAndController();
    registration.sync.register('unload');
    await expectAsync(queueInterface).toEmit('unloadClient');
  });

  it('Queue should send an unload event after heartbeat timeout', async () => {
    const port = queueInterface.port;
    if (!(port instanceof MessagePort)) {
      throw new Error('Message port does not exist');
    }
    port.postMessage({ type: 'heartbeat', args: [250] });
    // $FlowFixMe
    await expectAsync(queueInterface).toEmit('unloadClient');
  });

  it('Should abort a queue on unload', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    await scheduleAbortQueueOnUnload(queueId, Date.now());
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    await queueInterface.onIdle(5000);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await expectAsync(getAllAbortOnUnloadQueues()).toBeResolvedTo([queueId]);
    const port = queueInterface.port;
    if (!(port instanceof MessagePort)) {
      throw new Error('Message port does not exist');
    }
    port.postMessage({ type: 'heartbeat', args: [250] });
    // $FlowFixMe
    const [registration] = await queueInterface.getRegistrationAndController();
    registration.sync.register('unload');
    await expectAsync(queueInterface).toEmit('unloadClient');
    await queueInterface.onIdle(5000);
    await expectAsync(getAllAbortOnUnloadQueues()).toBeResolvedTo([]);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }]);
  });


  it('Should abort scheduled queues on link', async () => {
    const queueId = uuidv4();
    const value = uuidv4();
    const args = [TRIGGER_NO_ERROR, value];
    // await scheduleAbortQueueOnUnload(queueId, Date.now());
    const id = await enqueueToDatabase(queueId, 'echo', args, 0);
    await expectAsync(jobEmitter).toEmit('jobUpdate', id, queueId, 'echo', JOB_COMPLETE_STATUS);
    await queueInterface.onIdle(5000);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_COMPLETE_STATUS,
      startAfter: jasmine.any(Number),
    }]);
    await scheduleAbortQueueOnUnload(queueId, Date.now());
    await expectAsync(getAllAbortOnUnloadQueues()).toBeResolvedTo([queueId]);
    await queueInterface.unlink();

    await queueInterface.link();
    await queueInterface.onIdle(5000);
    await expectAsync(getAllAbortOnUnloadQueues()).toBeResolvedTo([]);
    await expectAsync(getJobsInQueueFromDatabase(queueId)).toBeResolvedTo([{
      id,
      queueId,
      type: 'echo',
      args,
      attempt: 0,
      created: jasmine.any(Number),
      status: JOB_ABORTED_STATUS,
      startAfter: jasmine.any(Number),
    }]);
  });
});
