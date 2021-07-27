import { stringify } from 'flatted';
const loggers = {};

const log = (color, name, value, ...args) => {
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
      console.log(`%c${arg}`, 'color:#666'); // eslint-disable-line
    } else {
      if (arg && arg.err) {
        console.error(arg.err); // eslint-disable-line
      } else if (arg && arg.error) {
        console.error(arg.error); // eslint-disable-line
      }

      console.dir(arg); // eslint-disable-line
    }
  }

  console.groupEnd(); // eslint-disable-line
};

export default (name => {
  if (loggers[name]) {
    return loggers[name];
  }

  const logger = {
    debug: (value, ...args) => {
      log('blue', name, value, ...args);
    },
    info: (value, ...args) => {
      log('green', name, value, ...args);
    },
    warn: (value, ...args) => {
      log('orange', name, value, ...args);
    },
    error: (value, ...args) => {
      log('red', name, value, ...args);
    },
    debugObject: (obj = {}) => {
      console.log(obj);
    },
    infoObject: (obj = {}) => {
      console.log(obj);
    },
    warnObject: (obj = {}) => {
      console.log(obj);
    },
    errorObject: (obj = {}) => {
      console.error(obj);
    },
    errorStack: error => {
      if (typeof error === 'string') {
        logger.error(error);
        return;
      }

      if (typeof error === 'undefined') {
        error = new Error('"undefined" passed to errorStack handler'); // eslint-disable-line no-param-reassign
      }

      const obj = {};
      Object.keys(error).forEach(key => {
        if (key !== 'toString' && key !== 'message') {
          // $FlowFixMe
          obj[key] = error[key];
        }
      });
      const hasValues = obj && Object.keys(obj).length > 0; // $FlowFixMe

      const {
        stack
      } = error;

      if (typeof stack === 'string') {
        if (error.message) {
          log('red', name, error.message);
        }

        stack.split('\n').forEach(line => log('red', name, `\t${line}`));
      } else if (error.message) {
        log('red', name, error.message);
      } else if (!hasValues) {
        log('red', name, 'Unknown error');
      }

      if (hasValues) {
        stringify(obj, null, 2).split('\n').forEach(line => log('red', name, `\t${line}`));
      }
    }
  };
  loggers[name] = logger;
  return logger;
});
//# sourceMappingURL=logger.js.map