"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

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

        var serviceWorker, messageChannel;
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
                this.logger.info('Linked to worker');

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

                  _this2.emit.apply(_this2, [type].concat(_toConsumableArray(args)));
                };

                this.port = messageChannel.port1;
                return _context.abrupt("return", messageChannel.port1);

              case 14:
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
                  var id = Math.random();
                  var timeout = setTimeout(function () {
                    _this3.removeListener('clearComplete', handleClearComplete);

                    _this3.removeListener('clearError', handleClearError);

                    reject(new Error("Did not receive clear response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleClearComplete = function handleClearComplete(_ref) {
                    var responseId = _ref.id;

                    if (id !== responseId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this3.removeListener('clearComplete', handleClearComplete);

                    _this3.removeListener('clearError', handleClearError);

                    resolve();
                  };

                  var handleClearError = function handleClearError(_ref2) {
                    var responseId = _ref2.id,
                        error = _ref2.error;

                    if (id !== responseId) {
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
                    value: {
                      id: id
                    }
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
                  var id = Math.random();
                  var timeout = setTimeout(function () {
                    _this4.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this4.removeListener('abortQueueError', handleAbortQueueError);

                    reject(new Error("Did not receive abort queue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleAbortQueueComplete = function handleAbortQueueComplete(_ref3) {
                    var responseId = _ref3.id;

                    if (id !== responseId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this4.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this4.removeListener('abortQueueError', handleAbortQueueError);

                    resolve();
                  };

                  var handleAbortQueueError = function handleAbortQueueError(_ref4) {
                    var responseId = _ref4.id,
                        error = _ref4.error;

                    if (id !== responseId) {
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
                    value: {
                      id: id,
                      queueId: queueId
                    }
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
                  var id = Math.random();
                  var timeout = setTimeout(function () {
                    _this5.removeListener('dequeueComplete', handleDequeueComplete);

                    _this5.removeListener('dequeueError', handleDequeueError);

                    reject(new Error("Did not receive dequeue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleDequeueComplete = function handleDequeueComplete(_ref5) {
                    var responseId = _ref5.id;

                    if (id !== responseId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this5.removeListener('dequeueComplete', handleDequeueComplete);

                    _this5.removeListener('dequeueError', handleDequeueError);

                    resolve();
                  };

                  var handleDequeueError = function handleDequeueError(_ref6) {
                    var responseId = _ref6.id,
                        error = _ref6.error;

                    if (id !== responseId) {
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
                    value: {
                      id: id
                    }
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
                  var id = Math.random();
                  var timeout = setTimeout(function () {
                    _this6.removeListener('idleComplete', handleIdleComplete);

                    _this6.removeListener('idleError', handleIdleError);

                    reject(new Error("Did not receive idle response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleIdleComplete = function handleIdleComplete(_ref7) {
                    var responseId = _ref7.id;

                    if (id !== responseId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this6.removeListener('idleComplete', handleIdleComplete);

                    _this6.removeListener('idleError', handleIdleError);

                    resolve();
                  };

                  var handleIdleError = function handleIdleError(_ref8) {
                    var responseId = _ref8.id,
                        error = _ref8.error;

                    if (id !== responseId) {
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
                    value: {
                      id: id,
                      maxDuration: maxDuration,
                      start: Date.now()
                    }
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
  }]);

  return BatteryQueueServiceWorkerInterface;
}(_events.default);

exports.default = BatteryQueueServiceWorkerInterface;
//# sourceMappingURL=worker-interface.js.map