// @flow

import EventEmitter from 'events';
import {
  FatalError,
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
export const TRIGGER_100MS_DELAY = 7;
export const TRIGGER_ABORT_ERROR = 8;
export const TRIGGER_HANDLER_RETURN_FALSE = 9;

export const emitter = new EventEmitter();

export function durationEstimateHandler(args:Array<any>) {
  const [instruction] = args;
  if (typeof instruction !== 'number') {
    return 5;
  }
  if (instruction === TRIGGER_100MS_DELAY) {
    return 100;
  }
  return 5;
}

export async function handler(args:Array<any>, abortSignal: AbortSignal, updateCleanupData: (Object) => Promise<void>) { // eslint-disable-line consistent-return
  const [instruction, value] = args;
  if (typeof instruction !== 'number') {
    throw new Error(`Invalid "instruction" argument of type ${typeof instruction}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
  }
  if (instruction === TRIGGER_100MS_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await updateCleanupData({ value });
  if (abortSignal.aborted) {
    logger.info('Throwing abort error (abortSignal.aborted is true)');
    throw new AbortError('AbortSignal abort');
  }
  if (instruction === TRIGGER_ERROR) {
    logger.info('Throwing non-fatal error');
    throw new Error('Echo error');
  }
  if (instruction === TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP) {
    logger.info('Throwing non-fatal error in handler before error in cleanup');
    throw new Error('Echo error in handler before error in cleanup');
  }
  if (instruction === TRIGGER_ABORT_ERROR) {
    logger.info('Throwing abort error (TRIGGER_ABORT_ERROR)');
    throw new AbortError('Internal abort');
  }
  if (instruction === TRIGGER_FATAL_ERROR) {
    logger.info('Throwing fatal error');
    throw new FatalError('Fatal echo error');
  }
  logger.info('Success');
  emitter.emit('echo', { value });
  if (instruction === TRIGGER_HANDLER_RETURN_FALSE) {
    return false;
  }
}

export async function cleanup(cleanupData: Object | void, args:Array<any>, removePathFromCleanupData: Array<string> => Promise<void>) {
  const [instruction, value] = args;
  if (typeof instruction !== 'number') {
    throw new Error(`Invalid "instruction" argument of type ${typeof instruction}, should be number`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid "value" argument of type ${typeof value}, should be string`);
  }
  logger.info('Cleaning up job');
  if (instruction === TRIGGER_ERROR_IN_CLEANUP) {
    logger.info('Throwing error in cleanup');
    throw new Error('Echo error in cleanup');
  }
  if (instruction === TRIGGER_ERROR_IN_HANDLER_AND_IN_CLEANUP) {
    logger.info('Throwing error in cleanup after error in handler');
    throw new Error('Echo error in cleanup after error in handle');
  }
  if (instruction === TRIGGER_FATAL_ERROR_IN_CLEANUP) {
    logger.info('Throwing fatal error in cleanup');
    throw new FatalError('Echo fatal error in cleanup');
  }
  await removePathFromCleanupData(['value']);
  emitter.emit('echoCleanupComplete', { value, cleanupData });
  logger.info('Cleanup complete');
}
