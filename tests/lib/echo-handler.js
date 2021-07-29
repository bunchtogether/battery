// @flow

import EventEmitter from 'events';
import { FatalQueueError, AbortError, DelayRetryError } from '../../src/errors';
import makeLogger from '../../src/logger';

const logger = makeLogger('Echo Handler');

export const TRIGGER_NO_ERROR = 0;
export const TRIGGER_ERROR = 1;
export const TRIGGER_FATAL_ERROR = 2;
export const TRIGGER_DELAY_RETRY_ERROR = 3;

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
  const [errorType, value] = args;
  if (typeof errorType !== 'number') {
    throw new Error(`Invalid "errorType" argument of type ${typeof errorType}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
  }
  await removePathFromCleanupData(['value']);
  emitter.emit('echoCleanupComplete', { value, cleanupData });
}
