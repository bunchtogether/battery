"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _flatted = require("flatted");

var loggers = {};

var log = function log(color, name, value) {
  var label = "%c".concat(name, ": %c").concat(value);

  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  if (args.length === 0) {
    console.log(label, 'color:#333; font-weight: bold', "color:".concat(color)); // eslint-disable-line

    return;
  }

  console.group(label, 'color:#333; font-weight: bold', "color:".concat(color)); // eslint-disable-line

  for (var _i = 0, _args = args; _i < _args.length; _i++) {
    var arg = _args[_i];

    if (typeof arg === 'undefined') {
      continue;
    } else if (typeof arg === 'string') {
      console.log("%c".concat(arg), 'color:#666'); // eslint-disable-line no-console
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

var _default = function _default(name) {
  if (loggers[name]) {
    return loggers[name];
  }

  var logger = {
    debug: function debug(value) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      log.apply(void 0, ['blue', name, value].concat(args));
    },
    info: function info(value) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      log.apply(void 0, ['green', name, value].concat(args));
    },
    warn: function warn(value) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      log.apply(void 0, ['orange', name, value].concat(args));
    },
    error: function error(value) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      log.apply(void 0, ['red', name, value].concat(args));
    },
    debugObject: function debugObject() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log(obj); // eslint-disable-line no-console
    },
    infoObject: function infoObject() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log(obj); // eslint-disable-line no-console
    },
    warnObject: function warnObject() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log(obj); // eslint-disable-line no-console
    },
    errorObject: function errorObject() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.error(obj); // eslint-disable-line no-console
    },
    errorStack: function errorStack(error) {
      if (typeof error === 'string') {
        logger.error(error);
        return;
      }

      if (typeof error === 'undefined') {
        error = new Error('"undefined" passed to errorStack handler'); // eslint-disable-line no-param-reassign
      }

      var obj = {};
      Object.keys(error).forEach(function (key) {
        if (key !== 'toString' && key !== 'message') {
          // $FlowFixMe
          obj[key] = error[key];
        }
      });
      var hasValues = obj && Object.keys(obj).length > 0; // $FlowFixMe

      var _error = error,
          stack = _error.stack;

      if (typeof stack === 'string') {
        stack.split('\n').forEach(function (line) {
          return log('red', name, "".concat(line));
        });
      } else if (error.message) {
        log('red', name, error.message);
      } else if (!hasValues) {
        log('red', name, 'Unknown error');
      }

      if (hasValues) {
        (0, _flatted.stringify)(obj, null, 2).split('\n').forEach(function (line) {
          return log('red', name, "".concat(line));
        });
      }
    }
  };
  loggers[name] = logger;
  return logger;
};

exports.default = _default;
//# sourceMappingURL=logger.js.map