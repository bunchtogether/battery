// @flow

import type EventEmitter from 'events';

export const asyncEmitMatchers = {
  toEmit: (matchersUtil:MatchersUtil) => ({
    compare: async (emitter: EventEmitter, ...args:Array<any>) => {
      const [timeoutDuration, name, argsToMatch] = typeof args[0] === 'number' ? [args[0], args[1], args.slice(2)] : [5000, args[0], args.slice(1)];
      let lastArgs;
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          emitter.removeListener(name, handle);
          matchersUtil.equals(undefined, argsToMatch);
          if (typeof lastArgs !== 'undefined') {
            const diffBuilder = jasmine.DiffBuilder({ prettyPrinter: matchersUtil.pp });
            matchersUtil.equals(lastArgs, argsToMatch, diffBuilder);
            resolve({
              pass: false,
              message: `Most recent "${name}" event did not match arguments.\n\n${diffBuilder.getMessage()}`,
            });
          } else {
            resolve({
              pass: false,
              message: `Did not receive "${name}" event in ${timeoutDuration}ms`,
            });
          }
        }, timeoutDuration);
        const handle = (...vs:Array<any>) => {
          lastArgs = vs;
          if (!matchersUtil.equals(vs, argsToMatch)) {
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
