/* eslint-disable */

import { oneOutOf, generateRandomValue } from './fuzz';

export async function handler(args:Array<any>, abortSignal: AbortSignal, updateCleanupData: (Object) => Promise<void>) {
  
  if (oneOutOf(6)) {
    args = generateRandomValue(1);
  }
  
  if (oneOutOf(8)) {
    abortSignal.aborted = true;
  }
  
  if (oneOutOf(4)) {
    throw new Error('Fuzz error before async');
  }

  if (oneOutOf(4)) {
    await updateCleanupData(generateRandomValue(3));
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  if (oneOutOf(5)) {
    throw new Error('Fuzz error after async');
  }

}

export async function cleanup(cleanupData: Object | void, args:Array<any>, removePathFromCleanupData: Array<string> => Promise<void>) {
  
  if (oneOutOf(5)) {
    throw new Error('Fuzz cleanup error before async');
  } 

  if (oneOutOf(4)) {
    await removePathFromCleanupData(generateRandomValue(3));
  } 

  await new Promise((resolve) => setTimeout(resolve, 0));

  if (oneOutOf(5)) {
    throw new Error('Fuzz cleanup error after async');
  } 
}

export async function retryJobDelay(attempt: number, Error: error) {
  if (oneOutOf(5)) {
    throw new Error('Fuzz retryJobDelay error before async');
  }
  if (oneOutOf(2)) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (oneOutOf(5)) {
    throw new Error('Fuzz retryJobDelay error after async');
  } 
  if (oneOutOf(5)) {
    return Math.round(Math.random() * 10);
  }
  return false;
}

export async function retryCleanupDelay(attempt: number, Error: error) {
  if (oneOutOf(5)) {
    throw new Error('Fuzz retryCleanupDelay error before async');
  }
  if (oneOutOf(2)) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (oneOutOf(5)) {
    throw new Error('Fuzz retryCleanupDelay error after async');
  } 
  if (oneOutOf(5)) {
    return Math.round(Math.random() * 10);
  }
  return false;
}

