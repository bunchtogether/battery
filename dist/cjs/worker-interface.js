"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

var _database = require("./database");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// export const canUseSyncManager = 'serviceWorker' in navigator && 'SyncManager' in window;
var BatteryQueueServiceWorkerInterface = /*#__PURE__*/function (_EventEmitter) {
  _inherits(BatteryQueueServiceWorkerInterface, _EventEmitter);

  var _super = _createSuper(BatteryQueueServiceWorkerInterface);

  function BatteryQueueServiceWorkerInterface() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BatteryQueueServiceWorkerInterface);

    _this = _super.call(this);
    _this.logger = options.logger || (0, _logger.default)('Battery Queue Worker Interface'); // This is a no-op to prevent errors from being thrown in the browser context.
    // Errors are logged in the worker.

    _this.on('error', function () {});

    return _this;
  }

  _createClass(BatteryQueueServiceWorkerInterface, [{
    key: "getController",
    value: function getController() {
      var controller = navigator && navigator.serviceWorker && navigator.serviceWorker.controller;

      if (controller instanceof ServiceWorker) {
        return controller;
      }

      throw new Error('Service worker controller does not exist');
    }
  }, {
    key: "link",
    value: function () {
      var _link = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        var serviceWorker, messageChannel, port, handleJobAdd, handleJobDelete, handleJobUpdate, handleJobsClear;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.port instanceof MessagePort)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this.port);

              case 2:
                serviceWorker = navigator && navigator.serviceWorker;

                if (serviceWorker) {
                  _context.next = 5;
                  break;
                }

                throw new Error('Service worker not available');

              case 5:
                _context.next = 7;
                return serviceWorker.ready;

              case 7:
                messageChannel = new MessageChannel();
                _context.next = 10;
                return new Promise(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    messageChannel.port1.onmessage = null;
                    reject(new Error('Unable to link to service worker'));
                  }, 1000);

                  messageChannel.port1.onmessage = function (event) {
                    if (!(event instanceof MessageEvent)) {
                      return;
                    }

                    var data = event.data;

                    if (!data || _typeof(data) !== 'object') {
                      _this2.logger.warn('Unknown message type');

                      _this2.logger.warnObject(event);

                      return;
                    }

                    var type = data.type;

                    if (typeof type !== 'string') {
                      _this2.logger.warn('Unknown message type');

                      _this2.logger.warnObject(event);

                      return;
                    }

                    if (type === 'BATTERY_QUEUE_WORKER_CONFIRMATION') {
                      clearTimeout(timeout);
                      resolve();
                    }
                  };

                  var controller = _this2.getController(); // $FlowFixMe


                  // $FlowFixMe
                  controller.postMessage({
                    type: 'BATTERY_QUEUE_WORKER_INITIALIZATION'
                  }, [messageChannel.port2]);
                });

              case 10:
                messageChannel.port1.onmessage = function (event) {
                  if (!(event instanceof MessageEvent)) {
                    return;
                  }

                  var data = event.data;

                  if (!data || _typeof(data) !== 'object') {
                    _this2.logger.warn('Invalid message data');

                    _this2.logger.warnObject(event);

                    return;
                  }

                  var type = data.type,
                      args = data.args;

                  if (typeof type !== 'string') {
                    _this2.logger.warn('Unknown message type');

                    _this2.logger.warnObject(event);

                    return;
                  }

                  if (!Array.isArray(args)) {
                    _this2.logger.warn('Unknown arguments type');

                    _this2.logger.warnObject(event);

                    return;
                  }

                  var queueIds = _this2.queueIds;

                  switch (type) {
                    case 'jobAdd':
                      _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobAdd'].concat(_toConsumableArray(args)));

                      return;

                    case 'jobDelete':
                      _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobDelete'].concat(_toConsumableArray(args)));

                      return;

                    case 'jobUpdate':
                      _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobUpdate'].concat(_toConsumableArray(args)));

                      return;

                    case 'jobsClear':
                      _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobsClear'].concat(_toConsumableArray(args)));

                      return;

                    case 'queueActive':
                      if (queueIds instanceof Set) {
                        var queueId = args[0];

                        if (typeof queueId === 'string') {
                          queueIds.add(queueId);
                        }
                      }

                      break;

                    case 'queueInactive':
                      if (queueIds instanceof Set) {
                        var _queueId = args[0];

                        if (typeof _queueId === 'string') {
                          queueIds.delete(_queueId);

                          if (queueIds.size === 0) {
                            delete _this2.queueIds;
                          }
                        }
                      }

                      break;

                    default:
                      break;
                  }

                  _this2.emit.apply(_this2, [type].concat(_toConsumableArray(args)));
                };

                port = messageChannel.port1;

                handleJobAdd = function handleJobAdd() {
                  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                  }

                  port.postMessage({
                    type: 'jobAdd',
                    args: args
                  });
                };

                handleJobDelete = function handleJobDelete() {
                  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                  }

                  port.postMessage({
                    type: 'jobDelete',
                    args: args
                  });
                };

                handleJobUpdate = function handleJobUpdate() {
                  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                  }

                  port.postMessage({
                    type: 'jobUpdate',
                    args: args
                  });
                };

                handleJobsClear = function handleJobsClear() {
                  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                  }

                  port.postMessage({
                    type: 'jobsClear',
                    args: args
                  });
                };

                _database.localJobEmitter.addListener('jobAdd', handleJobAdd);

                _database.localJobEmitter.addListener('jobDelete', handleJobDelete);

                _database.localJobEmitter.addListener('jobUpdate', handleJobUpdate);

                _database.localJobEmitter.addListener('jobsClear', handleJobsClear);

                this.port = messageChannel.port1;
                this.logger.info('Linked to worker');
                return _context.abrupt("return", messageChannel.port1);

              case 23:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function link() {
        return _link.apply(this, arguments);
      }

      return link;
    }()
  }, {
    key: "clear",
    value: function () {
      var _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this3 = this;

        var maxDuration,
            port,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                maxDuration = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 1000;
                _context2.next = 3;
                return this.link();

              case 3:
                port = _context2.sent;
                _context2.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this3.removeListener('clearComplete', handleClearComplete);

                    _this3.removeListener('clearError', handleClearError);

                    reject(new Error("Did not receive clear response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleClearComplete = function handleClearComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this3.removeListener('clearComplete', handleClearComplete);

                    _this3.removeListener('clearError', handleClearError);

                    resolve();
                  };

                  var handleClearError = function handleClearError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this3.removeListener('clearComplete', handleClearComplete);

                    _this3.removeListener('clearError', handleClearError);

                    reject(error);
                  };

                  _this3.addListener('clearComplete', handleClearComplete);

                  _this3.addListener('clearError', handleClearError);

                  port.postMessage({
                    type: 'clear',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function clear() {
        return _clear.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "abortQueue",
    value: function () {
      var _abortQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(queueId) {
        var _this4 = this;

        var maxDuration,
            port,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                maxDuration = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 1000;
                _context3.next = 3;
                return this.link();

              case 3:
                port = _context3.sent;
                _context3.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this4.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this4.removeListener('abortQueueError', handleAbortQueueError);

                    reject(new Error("Did not receive abort queue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleAbortQueueComplete = function handleAbortQueueComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this4.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this4.removeListener('abortQueueError', handleAbortQueueError);

                    resolve();
                  };

                  var handleAbortQueueError = function handleAbortQueueError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this4.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this4.removeListener('abortQueueError', handleAbortQueueError);

                    reject(error);
                  };

                  _this4.addListener('abortQueueComplete', handleAbortQueueComplete);

                  _this4.addListener('abortQueueError', handleAbortQueueError);

                  port.postMessage({
                    type: 'abortQueue',
                    args: [requestId, queueId]
                  });
                });

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function abortQueue(_x) {
        return _abortQueue.apply(this, arguments);
      }

      return abortQueue;
    }()
  }, {
    key: "dequeue",
    value: function () {
      var _dequeue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _this5 = this;

        var maxDuration,
            port,
            _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                maxDuration = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : 1000;
                _context4.next = 3;
                return this.link();

              case 3:
                port = _context4.sent;
                _context4.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this5.removeListener('dequeueComplete', handleDequeueComplete);

                    _this5.removeListener('dequeueError', handleDequeueError);

                    reject(new Error("Did not receive dequeue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleDequeueComplete = function handleDequeueComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this5.removeListener('dequeueComplete', handleDequeueComplete);

                    _this5.removeListener('dequeueError', handleDequeueError);

                    resolve();
                  };

                  var handleDequeueError = function handleDequeueError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this5.removeListener('dequeueComplete', handleDequeueComplete);

                    _this5.removeListener('dequeueError', handleDequeueError);

                    reject(error);
                  };

                  _this5.addListener('dequeueComplete', handleDequeueComplete);

                  _this5.addListener('dequeueError', handleDequeueError);

                  port.postMessage({
                    type: 'dequeue',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function dequeue() {
        return _dequeue.apply(this, arguments);
      }

      return dequeue;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _this6 = this;

        var maxDuration,
            port,
            _args5 = arguments;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                maxDuration = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : 1000;
                _context5.next = 3;
                return this.link();

              case 3:
                port = _context5.sent;
                _context5.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this6.removeListener('idleComplete', handleIdleComplete);

                    _this6.removeListener('idleError', handleIdleError);

                    reject(new Error("Did not receive idle response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleIdleComplete = function handleIdleComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this6.removeListener('idleComplete', handleIdleComplete);

                    _this6.removeListener('idleError', handleIdleError);

                    resolve();
                  };

                  var handleIdleError = function handleIdleError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this6.removeListener('idleComplete', handleIdleComplete);

                    _this6.removeListener('idleError', handleIdleError);

                    reject(error);
                  };

                  _this6.addListener('idleComplete', handleIdleComplete);

                  _this6.addListener('idleError', handleIdleError);

                  port.postMessage({
                    type: 'idle',
                    args: [requestId, maxDuration, Date.now()]
                  });
                });

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function onIdle() {
        return _onIdle.apply(this, arguments);
      }

      return onIdle;
    }()
  }, {
    key: "getQueueIds",
    value: function () {
      var _getQueueIds = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _this7 = this;

        var maxDuration,
            port,
            queueIds,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                maxDuration = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : 1000;

                if (!(this.queueIds instanceof Set)) {
                  _context6.next = 3;
                  break;
                }

                return _context6.abrupt("return", this.queueIds);

              case 3:
                _context6.next = 5;
                return this.link();

              case 5:
                port = _context6.sent;
                _context6.next = 8;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this7.removeListener('getQueuesComplete', handleGetQueuesComplete);

                    _this7.removeListener('getQueuesError', handleGetQueuesError);

                    reject(new Error("Did not receive idle response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleGetQueuesComplete = function handleGetQueuesComplete(responseId, qIds) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this7.removeListener('getQueuesComplete', handleGetQueuesComplete);

                    _this7.removeListener('getQueuesError', handleGetQueuesError);

                    resolve(new Set(qIds));
                  };

                  var handleGetQueuesError = function handleGetQueuesError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this7.removeListener('getQueuesComplete', handleGetQueuesComplete);

                    _this7.removeListener('getQueuesError', handleGetQueuesError);

                    reject(error);
                  };

                  _this7.addListener('getQueuesComplete', handleGetQueuesComplete);

                  _this7.addListener('getQueuesError', handleGetQueuesError);

                  port.postMessage({
                    type: 'getQueueIds',
                    args: [requestId]
                  });
                });

              case 8:
                queueIds = _context6.sent;

                if (queueIds.size > 0) {
                  this.queueIds = queueIds;
                }

                return _context6.abrupt("return", queueIds);

              case 11:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getQueueIds() {
        return _getQueueIds.apply(this, arguments);
      }

      return getQueueIds;
    }()
  }, {
    key: "enableStartOnJob",
    value: function () {
      var _enableStartOnJob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _this8 = this;

        var maxDuration,
            port,
            _args7 = arguments;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                maxDuration = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : 1000;
                _context7.next = 3;
                return this.link();

              case 3:
                port = _context7.sent;
                _context7.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this8.removeListener('enableStartOnJobComplete', handleenableStartOnJobComplete);

                    _this8.removeListener('enableStartOnJobError', handleenableStartOnJobError);

                    reject(new Error("Did not receive enableStartOnJob response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleenableStartOnJobComplete = function handleenableStartOnJobComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this8.removeListener('enableStartOnJobComplete', handleenableStartOnJobComplete);

                    _this8.removeListener('enableStartOnJobError', handleenableStartOnJobError);

                    resolve();
                  };

                  var handleenableStartOnJobError = function handleenableStartOnJobError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this8.removeListener('enableStartOnJobComplete', handleenableStartOnJobComplete);

                    _this8.removeListener('enableStartOnJobError', handleenableStartOnJobError);

                    reject(error);
                  };

                  _this8.addListener('enableStartOnJobComplete', handleenableStartOnJobComplete);

                  _this8.addListener('enableStartOnJobError', handleenableStartOnJobError);

                  port.postMessage({
                    type: 'enableStartOnJob',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function enableStartOnJob() {
        return _enableStartOnJob.apply(this, arguments);
      }

      return enableStartOnJob;
    }()
  }, {
    key: "disableStartOnJob",
    value: function () {
      var _disableStartOnJob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var _this9 = this;

        var maxDuration,
            port,
            _args8 = arguments;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                maxDuration = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : 1000;
                _context8.next = 3;
                return this.link();

              case 3:
                port = _context8.sent;
                _context8.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this9.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                    _this9.removeListener('disableStartOnJobError', handledisableStartOnJobError);

                    reject(new Error("Did not receive disableStartOnJob response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handledisableStartOnJobComplete = function handledisableStartOnJobComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this9.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                    _this9.removeListener('disableStartOnJobError', handledisableStartOnJobError);

                    resolve();
                  };

                  var handledisableStartOnJobError = function handledisableStartOnJobError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this9.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                    _this9.removeListener('disableStartOnJobError', handledisableStartOnJobError);

                    reject(error);
                  };

                  _this9.addListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                  _this9.addListener('disableStartOnJobError', handledisableStartOnJobError);

                  port.postMessage({
                    type: 'disableStartOnJob',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function disableStartOnJob() {
        return _disableStartOnJob.apply(this, arguments);
      }

      return disableStartOnJob;
    }()
  }]);

  return BatteryQueueServiceWorkerInterface;
}(_events.default);

exports.default = BatteryQueueServiceWorkerInterface;
//# sourceMappingURL=worker-interface.js.map