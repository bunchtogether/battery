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

queue.addHandler('echo', echoHandler);
queue.addCleanup('echo', echoCleanup);

queue.addHandler('fuzz', fuzzHandler);
queue.addCleanup('fuzz', fuzzCleanup);
