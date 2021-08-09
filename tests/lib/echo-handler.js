// @flow

import EventEmitter from 'events';
import {
  FatalQueueError,
  FatalCleanupError,
  AbortError,
  DelayRetryError,
} from '../../src/errors';
import makeLogger from '../../src/logger';

const logger = makeLogger('Echo Handler');

export const TRIGGER_NO_ERROR = 0;
export const TRIGGER_ERROR = 1;
export const TRIGGER_FATAL_ERROR = 2;
export const TRIGGER_DELAY_RETRY_ERROR = 3;
export const TRIGGER_ERROR_IN_CLEANUP = 4;
export const TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP = 5;
export const TRIGGER_FATAL_ERROR_IN_CLEANUP = 6;
export const TRIGGER_DELAY_RETRY_ERROR_IN_CLEANUP = 7;

export const emitter = new EventEmitter();

export async function handler(args:Array<any>, abortSignal: AbortSignal, updateCleanupData: (Object, number) => Promise<void>) {
  const [errorType, value, cleanupAttempts] = args;
  if (typeof errorType !== 'number') {
    throw new Error(`Invalid "errorType" argument of type ${typeof errorType}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
  }
  if (typeof cleanupAttempts !== 'number') {
    throw new Error(`Invalid "cleanupAttempts" argument of type ${typeof cleanupAttempts}, should be number`);
  }
  await updateCleanupData({ value }, cleanupAttempts);
  if (abortSignal.aborted) {
    logger.info('Throwing abort error');
    throw new AbortError('Aborted');
  }
  if (errorType === TRIGGER_ERROR) {
    logger.info('Throwing non-fatal error');
    throw new Error('Echo error');
  }
  if (errorType === TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP) {
    logger.info('Throwing non-fatal error in handler before error in cleanup');
    throw new Error('Echo error in handler before error in cleanup');
  }
  if (errorType === TRIGGER_FATAL_ERROR) {
    logger.info('Throwing fatal error');
    throw new FatalQueueError('Fatal echo error');
  }
  if (errorType === TRIGGER_DELAY_RETRY_ERROR) {
    logger.info('Throwing delay retry error');
    throw new DelayRetryError('Delay retry echo error', 100);
  }
  logger.info('Success');
  emitter.emit('echo', { value });
}

export async function cleanup(cleanupData: Object | void, args:Array<any>, removePathFromCleanupData: Array<string> => Promise<void>) {
  const [errorType, value, cleanupAttempts] = args;
  if (typeof errorType !== 'number') {
    throw new Error(`Invalid "errorType" argument of type ${typeof errorType}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
  }
  if (typeof cleanupAttempts !== 'number') {
    throw new Error(`Invalid "cleanupAttempts" argument of type ${typeof cleanupAttempts}, should be number`);
  }
  logger.info('Cleaning up job');
  if (errorType === TRIGGER_ERROR_IN_CLEANUP) {
    logger.info('Throwing error in cleanup');
    throw new Error('Echo error in cleanup');
  }
  if (errorType === TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP) {
    logger.info('Throwing error in cleanup after error in handler');
    throw new Error('Echo error in cleanup after error in handle');
  }
  if (errorType === TRIGGER_FATAL_ERROR_IN_CLEANUP) {
    logger.info('Throwing fatal error in cleanup');
    throw new FatalCleanupError('Echo fatal error in cleanup');
  }
  if (errorType === TRIGGER_DELAY_RETRY_ERROR_IN_CLEANUP) {
    logger.info('Throwing delay retry error in cleanup');
    throw new DelayRetryError('Echo delay retry error in cleanup', 500);
  }
  await removePathFromCleanupData(['value']);
  emitter.emit('echoCleanupComplete', { value, cleanupData });
  logger.info('Cleanup complete');
}
