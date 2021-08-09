// @flow

import { stringify } from 'flatted';

const loggers = {};

const log = (color:string, name:string, value:string | number, ...args:Array<any>) => {
  const label = `%c${name}: %c${value}`;
  if (args.length === 0) {
    console.log(label, 'color:#333; font-weight: bold', `color:${color}`); // eslint-disable-line
    return;
  }
  console.group(label, 'color:#333; font-weight: bold', `color:${color}`); // eslint-disable-line
  for (const arg of args) {
    if (typeof arg === 'undefined') {
      continue;
    } else if (typeof arg === 'string') {
      console.log(`%c${arg}`, 'color:#666'); // eslint-disable-line no-console
    } else {
      if (arg && arg.err) {
        console.error(arg.err); // eslint-disable-line no-console
      } else if (arg && arg.error) {
        console.error(arg.error); // eslint-disable-line no-console
      }
      console.dir(arg); // eslint-disable-line no-console
    }
  }
  console.groupEnd(); // eslint-disable-line no-console
};

export type Logger = {
  debug: (string | number, ...Array<any>) => void,
  info: (string | number, ...Array<any>) => void,
  warn: (string | number, ...Array<any>) => void,
  error: (string | number, ...Array<any>) => void,
  debugObject: (Object) => void,
  infoObject: (Object) => void,
  warnObject: (Object) => void,
  errorObject: (Object) => void,
  errorStack: (Error | MediaError) => void
};

export default (name: string) => {
  if (loggers[name]) {
    return loggers[name];
  }

  const logger = {
    debug: (value:string | number, ...args:Array<any>) => {
      log('blue', name, value, ...args);
    },
    info: (value:string | number, ...args:Array<any>) => {
      log('green', name, value, ...args);
    },
    warn: (value:string | number, ...args:Array<any>) => {
      log('orange', name, value, ...args);
    },
    error: (value:string | number, ...args:Array<any>) => {
      log('red', name, value, ...args);
    },
    debugObject: (obj: Object = {}) => {
      console.log(obj); // eslint-disable-line no-console
    },
    infoObject: (obj: Object = {}) => {
      console.log(obj); // eslint-disable-line no-console
    },
    warnObject: (obj: Object = {}) => {
      console.log(obj); // eslint-disable-line no-console
    },
    errorObject: (obj: Object = {}) => {
      console.error(obj); // eslint-disable-line no-console
    },
    errorStack: (error:Error | MediaError) => {
      if (typeof error === 'string') {
        logger.error(error);
        return;
      }
      if (typeof error === 'undefined') {
        error = new Error('"undefined" passed to errorStack handler'); // eslint-disable-line no-param-reassign
      }
      const obj: { [string]: any } = {};
      Object.keys(error).forEach((key: string) => {
        if (key !== 'toString' && key !== 'message') {
          // $FlowFixMe
          obj[key] = error[key];
        }
      });
      const hasValues = obj && Object.keys(obj).length > 0;
      // $FlowFixMe
      const { stack } = error;
      if (typeof stack === 'string') {
        stack.split('\n').forEach((line) => log('red', name, `${line}`));
      } else if (error.message) {
        log('red', name, error.message);
      } else if (!hasValues) {
        log('red', name, 'Unknown error');
      }
      if (hasValues) {
        stringify(obj, null, 2).split('\n').forEach((line) => log('red', name, `${line}`));
      }
    },
  };

  loggers[name] = logger;
  return logger;
};
