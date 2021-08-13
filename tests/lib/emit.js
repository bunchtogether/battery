// @flow

import type EventEmitter from 'events';
import isEqual from 'lodash/isEqual';

export async function expectEmit(emitter:EventEmitter, name:string, ...args:Array<any>) {
  let lastargs;
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      emitter.removeListener(name, handle);
      if (typeof lastargs !== 'undefined') {
        expect(lastargs).toEqual(args);
        fail(new Error(`Most recent "${name}" event did not match arguments ${JSON.stringify(args)}`));
        resolve();
      } else {
        fail(new Error(`Did not receive "${name}" event in 5000ms`));
        resolve();
      }
    }, 5000);
    const handle = (...vs:Array<any>) => {
      lastargs = vs;
      try {
        if (!isEqual(args, vs)) {
          return;
        }
        expect(args).toEqual(vs);
        clearTimeout(timeout);
        emitter.removeListener(name, handle);
        resolve();
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    };
    emitter.addListener(name, handle);
  });
}

export function getNextEmit(emitter:EventEmitter, name:string, duration?:number = 5000):Promise<any> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      emitter.removeListener(name, handle);
      fail(new Error(`Timeout waiting for emit of ${name}`));
      resolve([]);
    }, duration);
    const handle = (...args:Array<any>) => {
      clearTimeout(timeout);
      emitter.removeListener(name, handle);
      resolve(args);
    };
    emitter.addListener(name, handle);
  });
}
