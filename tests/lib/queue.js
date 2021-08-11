// @flow

import BatteryQueue from '../../src/queue';
import {
  handler as echoHandler,
  cleanup as echoCleanup,
} from './echo-handler';
import {
  handler as fuzzHandler,
  cleanup as fuzzCleanup,
} from './fuzz-handler';

export const queue = new BatteryQueue();

queue.setHandler('echo', echoHandler);
queue.setCleanup('echo', echoCleanup);

queue.setHandler('fuzz', fuzzHandler);
queue.setCleanup('fuzz', fuzzCleanup);
