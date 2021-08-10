// @flow

import { queue } from './queue';

queue.listenForServiceWorkerInterface();

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
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
