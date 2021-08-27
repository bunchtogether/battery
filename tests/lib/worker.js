// @flow

import makeLogger from '../../src/logger';
import { queue } from './queue';

const logger = makeLogger('Worker');

queue.listenForServiceWorkerInterface();

self.addEventListener('install', (event) => {
  logger.info('Installing');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  logger.info('Activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event:ExtendableMessageEvent) => {
  if (!(event instanceof ExtendableMessageEvent)) {
    return;
  }
  const { data } = event;
  if (!data || typeof data !== 'object') {
    return;
  }
  const { type } = data;
  if (type === 'throw') {
    setTimeout(() => {
      throw new Error('Test error');
    }, 0);
  }
});
