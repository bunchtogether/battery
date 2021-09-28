// @flow

import { v4 as uuidv4 } from 'uuid';
import { getServiceWorkerAndRegistration, serviceWorkerEmitter } from './lib/worker-interface';
import BatteryQueueServiceWorkerInterface from '../src/worker-interface';
import { asyncEmitMatchers } from './lib/emit';
import {
  updateUnloadDataInDatabase,
} from '../src/database';

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
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateUnloadDataInDatabase(() => data);
    const port = queueInterface.port;
    if (!(port instanceof MessagePort)) {
      throw new Error('Message port does not exist');
    }
    port.postMessage({ type: 'heartbeat', args: [250] });
    // $FlowFixMe
    const [registration] = await queueInterface.getRegistrationAndController();
    registration.sync.register('unload');
    await Promise.all([
      expectAsync(serviceWorkerEmitter).toEmit('unloadHandler', data),
      expectAsync(queueInterface).toEmit('unloadClient'),
    ]);
  });

  it('Queue should send an unload event if a unload event is requested by the service worker interface', async () => {
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateUnloadDataInDatabase(() => data);
    const port = queueInterface.port;
    if (!(port instanceof MessagePort)) {
      throw new Error('Message port does not exist');
    }
    port.postMessage({ type: 'heartbeat', args: [10000] });
    queueInterface.runUnloadHandlers(1000);
    await expectAsync(serviceWorkerEmitter).toEmit('unloadHandler', data);
  });

  it('Queue should send an unload event after heartbeat timeout', async () => {
    const data = {
      [uuidv4()]: uuidv4(),
    };
    await updateUnloadDataInDatabase(() => data);
    const port = queueInterface.port;
    if (!(port instanceof MessagePort)) {
      throw new Error('Message port does not exist');
    }
    port.postMessage({ type: 'heartbeat', args: [250] });
    await Promise.all([
      expectAsync(serviceWorkerEmitter).toEmit('unloadHandler', data),
      expectAsync(queueInterface).toEmit('unloadClient'),
    ]);
  });
});
