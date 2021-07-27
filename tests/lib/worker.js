// @flow

import { BatteryQueue } from '../../src/queue';
import {
  handler as echoHandler,
  cleanup as echoCleanup,
} from './echo-handler';

const queue = new BatteryQueue();

queue.addHandler('echo', echoHandler);
queue.addCleanup('echo', echoCleanup);

queue.listenForServiceWorkerInterface();

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
