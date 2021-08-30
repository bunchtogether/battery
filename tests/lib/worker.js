// @flow

import makeLogger from '../../src/logger';
import { queue } from './queue';
import { postMessage } from './worker-utils';

const logger = makeLogger('Worker');

queue.listenForServiceWorkerInterface();

queue.setUnload((data: void | Object) => {
  logger.info('Running unload handler');
  postMessage('unloadHandler', data);
});

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
