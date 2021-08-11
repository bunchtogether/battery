// @flow

import EventEmitter from 'events';
import {
  FatalQueueError,
  FatalCleanupError,
  AbortError,
} from '../../src/errors';
import makeLogger from '../../src/logger';

const logger = makeLogger('Echo Handler');

export const TRIGGER_NO_ERROR = 0;
export const TRIGGER_ERROR = 1;
export const TRIGGER_FATAL_ERROR = 2;
export const TRIGGER_ERROR_IN_CLEANUP = 4;
export const TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP = 5;
export const TRIGGER_FATAL_ERROR_IN_CLEANUP = 6;

export const emitter = new EventEmitter();

export async function handler(args:Array<any>, abortSignal: AbortSignal, updateCleanupData: (Object) => Promise<void>) {
  const [errorType, value] = args;
  if (typeof errorType !== 'number') {
    throw new Error(`Invalid "errorType" argument of type ${typeof errorType}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
  }
  await updateCleanupData({ value });
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
  logger.info('Success');
  emitter.emit('echo', { value });
}

export async function cleanup(cleanupData: Object | void, args:Array<any>, removePathFromCleanupData: Array<string> => Promise<void>) {
  const [errorType, value] = args;
  if (typeof errorType !== 'number') {
    throw new Error(`Invalid "errorType" argument of type ${typeof errorType}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
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
  await removePathFromCleanupData(['value']);
  emitter.emit('echoCleanupComplete', { value, cleanupData });
  logger.info('Cleanup complete');
}
