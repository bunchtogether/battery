// @flow

import makeLogger from '../../src/logger';

const logger = makeLogger('Alternative worker');

self.addEventListener('install', (event) => {
  logger.info('Installing');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  logger.info('Activating');
  event.waitUntil(self.clients.claim());
});
