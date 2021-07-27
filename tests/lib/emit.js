// @flow

import type EventEmitter from 'events';
import isEqual from 'lodash/isEqual';

export async function expectEmit(emitter:EventEmitter, name:string, ...values:Array<any>) {
  let lastValues;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      emitter.removeListener(name, handle);
      try {
        expect(lastValues).toEqual(values);
      } catch (error) {
        reject(error);
        return;
      }
      reject(new Error(`Timeout waiting for ${name} with values ${JSON.stringify(values)}`));
    }, 5000);
    const handle = (...vs:Array<any>) => {
      lastValues = vs;
      try {
        if (!isEqual(values, vs)) {
          return;
        }
        expect(values).toEqual(vs);
        clearTimeout(timeout);
        emitter.removeListener(name, handle);
        resolve();
      } catch (error) {
        console.error(error);
      }
    };
    emitter.addListener(name, handle);
  });
}
