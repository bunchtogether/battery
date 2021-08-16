// @flow

import type EventEmitter from 'events';

export const asyncEmitMatchers = {
  toEmit: (matchersUtil:MatchersUtil) => ({
    compare: async (emitter: EventEmitter, name:string, ...args:Array<any>) => {
      let lastargs;
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          emitter.removeListener(name, handle);
          matchersUtil.equals(undefined, args);
          if (typeof lastargs !== 'undefined') {
            const diffBuilder = jasmine.DiffBuilder({ prettyPrinter: matchersUtil.pp });
            matchersUtil.equals(lastargs, args, diffBuilder);
            resolve({
              pass: false,
              message: `Most recent "${name}" event did not match arguments.\n\n${diffBuilder.getMessage()}`,
            });
          } else {
            resolve({
              pass: false,
              message: `Did not receive "${name}" event in 5000ms`,
            });
          }
        }, 5000);
        const handle = (...vs:Array<any>) => {
          lastargs = vs;
          if (!matchersUtil.equals(vs, args)) {
            return;
          }
          clearTimeout(timeout);
          emitter.removeListener(name, handle);
          resolve({
            pass: true,
          });
        };
        emitter.addListener(name, handle);
      });
    },
  }),
};

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
