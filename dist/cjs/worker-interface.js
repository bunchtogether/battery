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

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var canUseSyncManager = 'serviceWorker' in navigator && 'SyncManager' in window;

var RedundantServiceWorkerError = /*#__PURE__*/function (_Error) {
  _inherits(RedundantServiceWorkerError, _Error);

  var _super = _createSuper(RedundantServiceWorkerError);

  function RedundantServiceWorkerError() {
    _classCallCheck(this, RedundantServiceWorkerError);

    return _super.apply(this, arguments);
  }

  return RedundantServiceWorkerError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var BatteryQueueServiceWorkerInterface = /*#__PURE__*/function (_EventEmitter) {
  _inherits(BatteryQueueServiceWorkerInterface, _EventEmitter);

  var _super2 = _createSuper(BatteryQueueServiceWorkerInterface);

  function BatteryQueueServiceWorkerInterface() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BatteryQueueServiceWorkerInterface);

    _this = _super2.call(this);
    _this.logger = options.logger || (0, _logger.default)('Battery Queue Worker Interface'); // This is a no-op to prevent errors from being thrown in the browser context.
    // Errors are logged in the worker.

    _this.on('error', function () {});

    _this.isSyncing = false;
    return _this;
  }

  _createClass(BatteryQueueServiceWorkerInterface, [{
    key: "getRegistrationAndController",
    value: function () {
      var _getRegistrationAndController = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        var serviceWorker, registration, controller, _loop, _ret;

        return regeneratorRuntime.wrap(function _callee$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                serviceWorker = navigator && navigator.serviceWorker;

                if (serviceWorker) {
                  _context2.next = 3;
                  break;
                }

                throw new Error('Service worker not available');

              case 3:
                _context2.next = 5;
                return serviceWorker.ready;

              case 5:
                registration = _context2.sent;
                controller = serviceWorker.controller;

                if (controller) {
                  _context2.next = 9;
                  break;
                }

                throw new Error('Service worker controller not available');

              case 9:
                _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                  var state, hadControllerChange;
                  return regeneratorRuntime.wrap(function _loop$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          state = controller.state;
                          hadControllerChange = false;

                          _this2.logger.info("Service worker in \"".concat(state, "\" state, waiting for state or controller change"));

                          _context.next = 5;
                          return new Promise(function (resolve) {
                            var timeout = setTimeout(function () {
                              controller.removeEventListener('statechange', handleStateChange);
                              serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                              throw new Error("Unable to get service worker controller, state did not change from \"".concat(state, "\" within 5000ms"));
                            }, 5000);

                            var handleStateChange = function handleStateChange() {
                              if (controller.state !== 'activated') {
                                return;
                              }

                              clearTimeout(timeout);
                              controller.removeEventListener('statechange', handleStateChange);
                              serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                              resolve();
                            };

                            var handleControllerChange = function handleControllerChange() {
                              hadControllerChange = true;
                              clearTimeout(timeout);
                              controller.removeEventListener('statechange', handleStateChange);
                              serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                              resolve();
                            };

                            serviceWorker.addEventListener('controllerchange', handleControllerChange);
                            controller.addEventListener('statechange', handleStateChange);
                          });

                        case 5:
                          if (!hadControllerChange) {
                            _context.next = 7;
                            break;
                          }

                          return _context.abrupt("return", {
                            v: _this2.getRegistrationAndController()
                          });

                        case 7:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _loop);
                });

              case 10:
                if (!(controller.state !== 'activated')) {
                  _context2.next = 17;
                  break;
                }

                return _context2.delegateYield(_loop(), "t0", 12);

              case 12:
                _ret = _context2.t0;

                if (!(_typeof(_ret) === "object")) {
                  _context2.next = 15;
                  break;
                }

                return _context2.abrupt("return", _ret.v);

              case 15:
                _context2.next = 10;
                break;

              case 17:
                return _context2.abrupt("return", [registration, controller]);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee);
      }));

      function getRegistrationAndController() {
        return _getRegistrationAndController.apply(this, arguments);
      }

      return getRegistrationAndController;
    }()
  }, {
    key: "unlink",
    value: function () {
      var _unlink = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this3 = this;

        var maxDuration,
            linkPromise,
            port,
            handlePortHeartbeat,
            handleBeforeUnload,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                maxDuration = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : 60000;
                linkPromise = this.linkPromise;

                if (!(typeof linkPromise !== 'undefined')) {
                  _context3.next = 12;
                  break;
                }

                _context3.prev = 3;
                _context3.next = 6;
                return linkPromise;

              case 6:
                _context3.next = 12;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](3);
                this.logger.error('Link promise error while waiting to unlink');
                this.logger.errorStack(_context3.t0);

              case 12:
                port = this.port;

                if (port instanceof MessagePort) {
                  _context3.next = 15;
                  break;
                }

                return _context3.abrupt("return");

              case 15:
                delete this.port;
                clearInterval(this.portHeartbeatInterval);
                delete this.portHeartbeatInterval;
                handlePortHeartbeat = this.handlePortHeartbeat;

                if (typeof handlePortHeartbeat === 'function') {
                  this.removeListener('heartbeat', this.handlePortHeartbeat);
                }

                handleBeforeUnload = this.handleBeforeUnload;

                if (typeof handlePortHeartbeat === 'function') {
                  window.removeEventListener('beforeunload', handleBeforeUnload, {
                    capture: true
                  });
                }

                _context3.next = 24;
                return new Promise(function (resolve) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this3.removeListener('unlinkComplete', handleUnlinkComplete);

                    _this3.removeListener('unlinkError', handleUnlinkError);

                    _this3.logger.error("Did not receive unlink response within ".concat(maxDuration, "ms"));

                    resolve();
                  }, maxDuration);

                  var handleUnlinkComplete = function handleUnlinkComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this3.removeListener('unlinkComplete', handleUnlinkComplete);

                    _this3.removeListener('unlinkError', handleUnlinkError);

                    resolve();
                  };

                  var handleUnlinkError = function handleUnlinkError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this3.removeListener('unlinkComplete', handleUnlinkComplete);

                    _this3.removeListener('unlinkError', handleUnlinkError);

                    _this3.logger.error('Received unlink error');

                    _this3.logger.errorStack(error);

                    resolve();
                  };

                  _this3.addListener('unlinkComplete', handleUnlinkComplete);

                  _this3.addListener('unlinkError', handleUnlinkError);

                  port.postMessage({
                    type: 'unlink',
                    args: [requestId]
                  });
                });

              case 24:
                try {
                  port.close();
                } catch (error) {
                  this.logger.error('Error while closing MessageChannel port with redundant service worker');
                  this.logger.errorStack(error);
                }

                port.onmessage = null;
                this.emit('unlink');
                this.logger.info('Unlinked');

              case 28:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee2, this, [[3, 8]]);
      }));

      function unlink() {
        return _unlink.apply(this, arguments);
      }

      return unlink;
    }()
  }, {
    key: "link",
    value: function () {
      var _link2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this4 = this;

        var linkPromise;
        return regeneratorRuntime.wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this.port instanceof MessagePort)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return", this.port);

              case 2:
                if (!this.linkPromise) {
                  _context4.next = 4;
                  break;
                }

                return _context4.abrupt("return", this.linkPromise);

              case 4:
                linkPromise = this._link().finally(function () {
                  // eslint-disable-line no-underscore-dangle
                  delete _this4.linkPromise;
                });
                this.linkPromise = linkPromise;
                return _context4.abrupt("return", linkPromise);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee3, this);
      }));

      function link() {
        return _link2.apply(this, arguments);
      }

      return link;
    }()
  }, {
    key: "_link",
    value: function () {
      var _link3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _this5 = this;

        var _yield$this$getRegist, _yield$this$getRegist2, registration, controller, messageChannel, port, handleUpdateFound, handleStateChange, handleJobAdd, handleJobDelete, handleJobUpdate, handleJobsClear, didLogHeartbeatTimeout, didReceiveHeartbeat, handlePortHeartbeat, sendHeartbeat, handleBeforeUnload;

        return regeneratorRuntime.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(this.port instanceof MessagePort)) {
                  _context7.next = 2;
                  break;
                }

                return _context7.abrupt("return", this.port);

              case 2:
                _context7.next = 4;
                return this.getRegistrationAndController();

              case 4:
                _yield$this$getRegist = _context7.sent;
                _yield$this$getRegist2 = _slicedToArray(_yield$this$getRegist, 2);
                registration = _yield$this$getRegist2[0];
                controller = _yield$this$getRegist2[1];
                messageChannel = new MessageChannel();
                port = messageChannel.port1;
                this.port = messageChannel.port1;

                handleUpdateFound = /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                    var installingWorker, activeWorker;
                    return regeneratorRuntime.wrap(function _callee4$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            installingWorker = registration.installing;
                            activeWorker = registration.active;

                            if (installingWorker) {
                              _context5.next = 4;
                              break;
                            }

                            return _context5.abrupt("return");

                          case 4:
                            if (activeWorker) {
                              _context5.next = 6;
                              break;
                            }

                            return _context5.abrupt("return");

                          case 6:
                            registration.removeEventListener('updatefound', handleUpdateFound);
                            controller.removeEventListener('statechange', handleStateChange);
                            _context5.prev = 8;
                            _context5.next = 11;
                            return _this5.unlink();

                          case 11:
                            _this5.logger.info('Unlinked service worker after detecting new service worker');

                            _context5.next = 18;
                            break;

                          case 14:
                            _context5.prev = 14;
                            _context5.t0 = _context5["catch"](8);

                            _this5.logger.error('Unable to unlink service worker after detecting new service worker');

                            _this5.logger.errorStack(_context5.t0);

                          case 18:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee4, null, [[8, 14]]);
                  }));

                  return function handleUpdateFound() {
                    return _ref.apply(this, arguments);
                  };
                }();

                handleStateChange = /*#__PURE__*/function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                    return regeneratorRuntime.wrap(function _callee5$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            _this5.logger.warn("Service worker state change to ".concat(controller.state));

                            if (!(controller.state !== 'redundant')) {
                              _context6.next = 3;
                              break;
                            }

                            return _context6.abrupt("return");

                          case 3:
                            registration.removeEventListener('updatefound', handleUpdateFound);
                            controller.removeEventListener('statechange', handleStateChange);
                            _context6.prev = 5;
                            _context6.next = 8;
                            return _this5.unlink();

                          case 8:
                            _this5.logger.info('Unlinked service worker after detecting redundant service worker');

                            _context6.next = 15;
                            break;

                          case 11:
                            _context6.prev = 11;
                            _context6.t0 = _context6["catch"](5);

                            _this5.logger.error('Unable to unlink service worker after detecting redundant service worker');

                            _this5.logger.errorStack(_context6.t0);

                          case 15:
                          case "end":
                            return _context6.stop();
                        }
                      }
                    }, _callee5, null, [[5, 11]]);
                  }));

                  return function handleStateChange() {
                    return _ref2.apply(this, arguments);
                  };
                }();

                registration.addEventListener('updatefound', handleUpdateFound);
                controller.addEventListener('statechange', handleStateChange);
                _context7.prev = 15;
                _context7.next = 18;
                return new Promise(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    messageChannel.port1.onmessage = null;
                    controller.removeEventListener('statechange', handleStateChangeBeforeLink);
                    reject(new Error('Unable to link to service worker'));
                  }, 1000);

                  var handleStateChangeBeforeLink = function handleStateChangeBeforeLink() {
                    if (controller.state !== 'redundant') {
                      return;
                    }

                    clearTimeout(timeout);
                    controller.removeEventListener('statechange', handleStateChangeBeforeLink);
                    reject(new RedundantServiceWorkerError('Service worker in redundant state'));
                  };

                  controller.addEventListener('statechange', handleStateChangeBeforeLink);

                  messageChannel.port1.onmessage = function (event) {
                    if (!(event instanceof MessageEvent)) {
                      return;
                    }

                    var data = event.data;

                    if (!data || _typeof(data) !== 'object') {
                      _this5.logger.warn('Unknown message type');

                      _this5.logger.warnObject(event);

                      return;
                    }

                    var type = data.type;

                    if (typeof type !== 'string') {
                      _this5.logger.warn('Unknown message type');

                      _this5.logger.warnObject(event);

                      return;
                    }

                    if (type === 'BATTERY_QUEUE_WORKER_CONFIRMATION') {
                      clearTimeout(timeout);
                      controller.removeEventListener('statechange', handleStateChangeBeforeLink);
                      resolve();
                    }
                  }; // $FlowFixMe


                  // $FlowFixMe
                  controller.postMessage({
                    type: 'BATTERY_QUEUE_WORKER_INITIALIZATION'
                  }, [messageChannel.port2]);
                });

              case 18:
                _context7.next = 27;
                break;

              case 20:
                _context7.prev = 20;
                _context7.t0 = _context7["catch"](15);
                registration.removeEventListener('updatefound', handleUpdateFound);
                controller.removeEventListener('statechange', handleStateChange);

                if (!(_context7.t0 instanceof RedundantServiceWorkerError)) {
                  _context7.next = 26;
                  break;
                }

                return _context7.abrupt("return", messageChannel.port1);

              case 26:
                throw _context7.t0;

              case 27:
                messageChannel.port1.onmessage = function (event) {
                  if (!(event instanceof MessageEvent)) {
                    return;
                  }

                  var data = event.data;

                  if (!data || _typeof(data) !== 'object') {
                    _this5.logger.warn('Invalid message data');

                    _this5.logger.warnObject(event);

                    return;
                  }

                  var type = data.type,
                      args = data.args;

                  if (typeof type !== 'string') {
                    _this5.logger.warn('Unknown message type');

                    _this5.logger.warnObject(event);

                    return;
                  }

                  if (!Array.isArray(args)) {
                    _this5.logger.warn('Unknown arguments type');

                    _this5.logger.warnObject(event);

                    return;
                  }

                  var queueIds = _this5.queueIds;

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
                            delete _this5.queueIds;
                          }
                        }
                      }

                      break;

                    default:
                      break;
                  }

                  _this5.emit.apply(_this5, [type].concat(_toConsumableArray(args)));
                };

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

                didLogHeartbeatTimeout = false;
                didReceiveHeartbeat = true;

                handlePortHeartbeat = function handlePortHeartbeat() {
                  didLogHeartbeatTimeout = false;
                  didReceiveHeartbeat = true;
                };

                this.addListener('heartbeat', handlePortHeartbeat);
                this.handlePortHeartbeat = handlePortHeartbeat;

                sendHeartbeat = function sendHeartbeat() {
                  if (!didReceiveHeartbeat) {
                    if (!didLogHeartbeatTimeout) {
                      _this5.logger.error('Did not receive port heartbeat');

                      didLogHeartbeatTimeout = true;
                    }
                  }

                  didReceiveHeartbeat = false;
                  port.postMessage({
                    type: 'heartbeat',
                    args: [10000]
                  });
                };

                this.portHeartbeatInterval = setInterval(sendHeartbeat, 10000);
                sendHeartbeat();

                handleBeforeUnload = function handleBeforeUnload() {
                  if (!canUseSyncManager) {
                    return;
                  } // $FlowFixMe


                  registration.sync.register('unload');
                };

                this.handleBeforeUnload = handleBeforeUnload;
                window.addEventListener('beforeunload', handleBeforeUnload, {
                  capture: true
                });
                this.logger.info('Linked to worker');
                this.emit('link');
                return _context7.abrupt("return", messageChannel.port1);

              case 50:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee6, this, [[15, 20]]);
      }));

      function _link() {
        return _link3.apply(this, arguments);
      }

      return _link;
    }()
  }, {
    key: "clear",
    value: function () {
      var _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _this6 = this;

        var maxDuration,
            port,
            _args8 = arguments;
        return regeneratorRuntime.wrap(function _callee7$(_context8) {
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
                    _this6.removeListener('clearComplete', handleClearComplete);

                    _this6.removeListener('clearError', handleClearError);

                    reject(new Error("Did not receive clear response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleClearComplete = function handleClearComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this6.removeListener('clearComplete', handleClearComplete);

                    _this6.removeListener('clearError', handleClearError);

                    resolve();
                  };

                  var handleClearError = function handleClearError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this6.removeListener('clearComplete', handleClearComplete);

                    _this6.removeListener('clearError', handleClearError);

                    reject(error);
                  };

                  _this6.addListener('clearComplete', handleClearComplete);

                  _this6.addListener('clearError', handleClearError);

                  port.postMessage({
                    type: 'clear',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee7, this);
      }));

      function clear() {
        return _clear.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "updateDurationEstimates",
    value: function () {
      var _updateDurationEstimates = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var _this7 = this;

        var maxDuration,
            port,
            _args9 = arguments;
        return regeneratorRuntime.wrap(function _callee8$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                maxDuration = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : 1000;
                _context9.next = 3;
                return this.link();

              case 3:
                port = _context9.sent;
                _context9.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this7.removeListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);

                    _this7.removeListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);

                    reject(new Error("Did not receive update duration estimates response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleUpdateDurationEstimatesComplete = function handleUpdateDurationEstimatesComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this7.removeListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);

                    _this7.removeListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);

                    resolve();
                  };

                  var handleUpdateDurationEstimatesError = function handleUpdateDurationEstimatesError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this7.removeListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);

                    _this7.removeListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);

                    reject(error);
                  };

                  _this7.addListener('updateDurationEstimatesComplete', handleUpdateDurationEstimatesComplete);

                  _this7.addListener('updateDurationEstimatesError', handleUpdateDurationEstimatesError);

                  port.postMessage({
                    type: 'updateDurationEstimates',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee8, this);
      }));

      function updateDurationEstimates() {
        return _updateDurationEstimates.apply(this, arguments);
      }

      return updateDurationEstimates;
    }()
  }, {
    key: "abortQueue",
    value: function () {
      var _abortQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(queueId) {
        var _this8 = this;

        var maxDuration,
            port,
            _args10 = arguments;
        return regeneratorRuntime.wrap(function _callee9$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                maxDuration = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : 1000;
                _context10.next = 3;
                return this.link();

              case 3:
                port = _context10.sent;
                _context10.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this8.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this8.removeListener('abortQueueError', handleAbortQueueError);

                    reject(new Error("Did not receive abort queue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleAbortQueueComplete = function handleAbortQueueComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this8.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this8.removeListener('abortQueueError', handleAbortQueueError);

                    resolve();
                  };

                  var handleAbortQueueError = function handleAbortQueueError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this8.removeListener('abortQueueComplete', handleAbortQueueComplete);

                    _this8.removeListener('abortQueueError', handleAbortQueueError);

                    reject(error);
                  };

                  _this8.addListener('abortQueueComplete', handleAbortQueueComplete);

                  _this8.addListener('abortQueueError', handleAbortQueueError);

                  port.postMessage({
                    type: 'abortQueue',
                    args: [requestId, queueId]
                  });
                });

              case 6:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee9, this);
      }));

      function abortQueue(_x) {
        return _abortQueue.apply(this, arguments);
      }

      return abortQueue;
    }()
  }, {
    key: "abortAndRemoveQueue",
    value: function () {
      var _abortAndRemoveQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(queueId) {
        var _this9 = this;

        var maxDuration,
            port,
            _args11 = arguments;
        return regeneratorRuntime.wrap(function _callee10$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                maxDuration = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : 1000;
                _context11.next = 3;
                return this.link();

              case 3:
                port = _context11.sent;
                _context11.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this9.removeListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);

                    _this9.removeListener('abortAndRemoveQueueError', handleAbortQueueError);

                    reject(new Error("Did not receive abort queue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleAbortQueueComplete = function handleAbortQueueComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this9.removeListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);

                    _this9.removeListener('abortAndRemoveQueueError', handleAbortQueueError);

                    resolve();
                  };

                  var handleAbortQueueError = function handleAbortQueueError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this9.removeListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);

                    _this9.removeListener('abortAndRemoveQueueError', handleAbortQueueError);

                    reject(error);
                  };

                  _this9.addListener('abortAndRemoveQueueComplete', handleAbortQueueComplete);

                  _this9.addListener('abortAndRemoveQueueError', handleAbortQueueError);

                  port.postMessage({
                    type: 'abortAndRemoveQueue',
                    args: [requestId, queueId]
                  });
                });

              case 6:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee10, this);
      }));

      function abortAndRemoveQueue(_x2) {
        return _abortAndRemoveQueue.apply(this, arguments);
      }

      return abortAndRemoveQueue;
    }()
  }, {
    key: "abortAndRemoveQueueJobsGreaterThanId",
    value: function () {
      var _abortAndRemoveQueueJobsGreaterThanId = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(queueId, id) {
        var _this10 = this;

        var maxDuration,
            port,
            _args12 = arguments;
        return regeneratorRuntime.wrap(function _callee11$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                maxDuration = _args12.length > 2 && _args12[2] !== undefined ? _args12[2] : 1000;
                _context12.next = 3;
                return this.link();

              case 3:
                port = _context12.sent;
                _context12.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this10.removeListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);

                    _this10.removeListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);

                    reject(new Error("Did not receive abort queue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleAbortAndRemoveQueueJobsGreaterThanIdComplete = function handleAbortAndRemoveQueueJobsGreaterThanIdComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this10.removeListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);

                    _this10.removeListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);

                    resolve();
                  };

                  var handleAbortAndRemoveQueueJobsGreaterThanIdError = function handleAbortAndRemoveQueueJobsGreaterThanIdError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this10.removeListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);

                    _this10.removeListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);

                    reject(error);
                  };

                  _this10.addListener('abortAndRemoveQueueJobsGreaterThanIdComplete', handleAbortAndRemoveQueueJobsGreaterThanIdComplete);

                  _this10.addListener('abortAndRemoveQueueJobsGreaterThanIdError', handleAbortAndRemoveQueueJobsGreaterThanIdError);

                  port.postMessage({
                    type: 'abortAndRemoveQueueJobsGreaterThanId',
                    args: [requestId, queueId, id]
                  });
                });

              case 6:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee11, this);
      }));

      function abortAndRemoveQueueJobsGreaterThanId(_x3, _x4) {
        return _abortAndRemoveQueueJobsGreaterThanId.apply(this, arguments);
      }

      return abortAndRemoveQueueJobsGreaterThanId;
    }()
  }, {
    key: "retryQueue",
    value: function () {
      var _retryQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(queueId) {
        var _this11 = this;

        var maxDuration,
            port,
            _args13 = arguments;
        return regeneratorRuntime.wrap(function _callee12$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                maxDuration = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : 1000;
                _context13.next = 3;
                return this.link();

              case 3:
                port = _context13.sent;
                _context13.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this11.removeListener('retryQueueComplete', handleRetryQueueComplete);

                    _this11.removeListener('retryQueueError', handleRetryQueueError);

                    reject(new Error("Did not receive retry queue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleRetryQueueComplete = function handleRetryQueueComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this11.removeListener('retryQueueComplete', handleRetryQueueComplete);

                    _this11.removeListener('retryQueueError', handleRetryQueueError);

                    resolve();
                  };

                  var handleRetryQueueError = function handleRetryQueueError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this11.removeListener('retryQueueComplete', handleRetryQueueComplete);

                    _this11.removeListener('retryQueueError', handleRetryQueueError);

                    reject(error);
                  };

                  _this11.addListener('retryQueueComplete', handleRetryQueueComplete);

                  _this11.addListener('retryQueueError', handleRetryQueueError);

                  port.postMessage({
                    type: 'retryQueue',
                    args: [requestId, queueId]
                  });
                });

              case 6:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee12, this);
      }));

      function retryQueue(_x5) {
        return _retryQueue.apply(this, arguments);
      }

      return retryQueue;
    }()
  }, {
    key: "dequeue",
    value: function () {
      var _dequeue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
        var _this12 = this;

        var maxDuration,
            port,
            _args14 = arguments;
        return regeneratorRuntime.wrap(function _callee13$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                maxDuration = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : 1000;
                _context14.next = 3;
                return this.link();

              case 3:
                port = _context14.sent;
                _context14.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this12.removeListener('dequeueComplete', handleDequeueComplete);

                    _this12.removeListener('dequeueError', handleDequeueError);

                    reject(new Error("Did not receive dequeue response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleDequeueComplete = function handleDequeueComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this12.removeListener('dequeueComplete', handleDequeueComplete);

                    _this12.removeListener('dequeueError', handleDequeueError);

                    resolve();
                  };

                  var handleDequeueError = function handleDequeueError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this12.removeListener('dequeueComplete', handleDequeueComplete);

                    _this12.removeListener('dequeueError', handleDequeueError);

                    reject(error);
                  };

                  _this12.addListener('dequeueComplete', handleDequeueComplete);

                  _this12.addListener('dequeueError', handleDequeueError);

                  port.postMessage({
                    type: 'dequeue',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee13, this);
      }));

      function dequeue() {
        return _dequeue.apply(this, arguments);
      }

      return dequeue;
    }()
  }, {
    key: "runUnloadHandlers",
    value: function () {
      var _runUnloadHandlers = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var _this13 = this;

        var maxDuration,
            port,
            _args15 = arguments;
        return regeneratorRuntime.wrap(function _callee14$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                maxDuration = _args15.length > 0 && _args15[0] !== undefined ? _args15[0] : 10000;
                _context15.next = 3;
                return this.link();

              case 3:
                port = _context15.sent;
                _context15.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this13.removeListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);

                    _this13.removeListener('runUnloadHandlersError', handleRunUnloadHandlersError);

                    reject(new Error("Did not receive run unload handlers response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleRunUnloadHandlersComplete = function handleRunUnloadHandlersComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this13.removeListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);

                    _this13.removeListener('runUnloadHandlersError', handleRunUnloadHandlersError);

                    resolve();
                  };

                  var handleRunUnloadHandlersError = function handleRunUnloadHandlersError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this13.removeListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);

                    _this13.removeListener('runUnloadHandlersError', handleRunUnloadHandlersError);

                    reject(error);
                  };

                  _this13.addListener('runUnloadHandlersComplete', handleRunUnloadHandlersComplete);

                  _this13.addListener('runUnloadHandlersError', handleRunUnloadHandlersError);

                  port.postMessage({
                    type: 'runUnloadHandlers',
                    args: [requestId]
                  });
                });

              case 6:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee14, this);
      }));

      function runUnloadHandlers() {
        return _runUnloadHandlers.apply(this, arguments);
      }

      return runUnloadHandlers;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
        var _this14 = this;

        var maxDuration,
            port,
            _args16 = arguments;
        return regeneratorRuntime.wrap(function _callee15$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                maxDuration = _args16.length > 0 && _args16[0] !== undefined ? _args16[0] : 1000;
                _context16.next = 3;
                return this.link();

              case 3:
                port = _context16.sent;
                _context16.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this14.removeListener('idleComplete', handleIdleComplete);

                    _this14.removeListener('idleError', handleIdleError);

                    reject(new Error("Did not receive idle response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleIdleComplete = function handleIdleComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this14.removeListener('idleComplete', handleIdleComplete);

                    _this14.removeListener('idleError', handleIdleError);

                    resolve();
                  };

                  var handleIdleError = function handleIdleError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this14.removeListener('idleComplete', handleIdleComplete);

                    _this14.removeListener('idleError', handleIdleError);

                    reject(error);
                  };

                  _this14.addListener('idleComplete', handleIdleComplete);

                  _this14.addListener('idleError', handleIdleError);

                  port.postMessage({
                    type: 'idle',
                    args: [requestId, maxDuration, Date.now()]
                  });
                });

              case 6:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee15, this);
      }));

      function onIdle() {
        return _onIdle.apply(this, arguments);
      }

      return onIdle;
    }()
  }, {
    key: "getQueueIds",
    value: function () {
      var _getQueueIds = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
        var _this15 = this;

        var maxDuration,
            port,
            queueIds,
            _args17 = arguments;
        return regeneratorRuntime.wrap(function _callee16$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                maxDuration = _args17.length > 0 && _args17[0] !== undefined ? _args17[0] : 1000;

                if (!(this.queueIds instanceof Set)) {
                  _context17.next = 3;
                  break;
                }

                return _context17.abrupt("return", this.queueIds);

              case 3:
                _context17.next = 5;
                return this.link();

              case 5:
                port = _context17.sent;
                _context17.next = 8;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this15.removeListener('getQueuesComplete', handleGetQueuesComplete);

                    _this15.removeListener('getQueuesError', handleGetQueuesError);

                    reject(new Error("Did not receive idle response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleGetQueuesComplete = function handleGetQueuesComplete(responseId, qIds) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this15.removeListener('getQueuesComplete', handleGetQueuesComplete);

                    _this15.removeListener('getQueuesError', handleGetQueuesError);

                    resolve(new Set(qIds));
                  };

                  var handleGetQueuesError = function handleGetQueuesError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this15.removeListener('getQueuesComplete', handleGetQueuesComplete);

                    _this15.removeListener('getQueuesError', handleGetQueuesError);

                    reject(error);
                  };

                  _this15.addListener('getQueuesComplete', handleGetQueuesComplete);

                  _this15.addListener('getQueuesError', handleGetQueuesError);

                  port.postMessage({
                    type: 'getQueueIds',
                    args: [requestId]
                  });
                });

              case 8:
                queueIds = _context17.sent;

                if (queueIds.size > 0) {
                  this.queueIds = queueIds;
                }

                return _context17.abrupt("return", queueIds);

              case 11:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee16, this);
      }));

      function getQueueIds() {
        return _getQueueIds.apply(this, arguments);
      }

      return getQueueIds;
    }()
  }, {
    key: "enableStartOnJob",
    value: function () {
      var _enableStartOnJob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
        var _this16 = this;

        var maxDuration,
            port,
            handleJobAdd,
            _args18 = arguments;
        return regeneratorRuntime.wrap(function _callee17$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                maxDuration = _args18.length > 0 && _args18[0] !== undefined ? _args18[0] : 1000;
                _context18.next = 3;
                return this.link();

              case 3:
                port = _context18.sent;
                _context18.next = 6;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this16.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);

                    _this16.removeListener('enableStartOnJobError', handleEnableStartOnJobError);

                    reject(new Error("Did not receive enableStartOnJob response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleEnableStartOnJobComplete = function handleEnableStartOnJobComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this16.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);

                    _this16.removeListener('enableStartOnJobError', handleEnableStartOnJobError);

                    resolve();
                  };

                  var handleEnableStartOnJobError = function handleEnableStartOnJobError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this16.removeListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);

                    _this16.removeListener('enableStartOnJobError', handleEnableStartOnJobError);

                    reject(error);
                  };

                  _this16.addListener('enableStartOnJobComplete', handleEnableStartOnJobComplete);

                  _this16.addListener('enableStartOnJobError', handleEnableStartOnJobError);

                  port.postMessage({
                    type: 'enableStartOnJob',
                    args: [requestId]
                  });
                });

              case 6:
                handleJobAdd = function handleJobAdd() {
                  _this16.sync();
                };

                _database.jobEmitter.addListener('jobAdd', handleJobAdd);

                this.handleJobAdd = handleJobAdd;

              case 9:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee17, this);
      }));

      function enableStartOnJob() {
        return _enableStartOnJob.apply(this, arguments);
      }

      return enableStartOnJob;
    }()
  }, {
    key: "disableStartOnJob",
    value: function () {
      var _disableStartOnJob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
        var _this17 = this;

        var maxDuration,
            handleJobAdd,
            port,
            _args19 = arguments;
        return regeneratorRuntime.wrap(function _callee18$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                maxDuration = _args19.length > 0 && _args19[0] !== undefined ? _args19[0] : 1000;
                handleJobAdd = this.handleJobAdd;

                if (typeof handleJobAdd === 'function') {
                  _database.jobEmitter.removeListener('jobAdd', handleJobAdd);
                }

                _context19.next = 5;
                return this.link();

              case 5:
                port = _context19.sent;
                _context19.next = 8;
                return new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this17.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                    _this17.removeListener('disableStartOnJobError', handledisableStartOnJobError);

                    reject(new Error("Did not receive disableStartOnJob response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handledisableStartOnJobComplete = function handledisableStartOnJobComplete(responseId) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this17.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                    _this17.removeListener('disableStartOnJobError', handledisableStartOnJobError);

                    resolve();
                  };

                  var handledisableStartOnJobError = function handledisableStartOnJobError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this17.removeListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                    _this17.removeListener('disableStartOnJobError', handledisableStartOnJobError);

                    reject(error);
                  };

                  _this17.addListener('disableStartOnJobComplete', handledisableStartOnJobComplete);

                  _this17.addListener('disableStartOnJobError', handledisableStartOnJobError);

                  port.postMessage({
                    type: 'disableStartOnJob',
                    args: [requestId]
                  });
                });

              case 8:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee18, this);
      }));

      function disableStartOnJob() {
        return _disableStartOnJob.apply(this, arguments);
      }

      return disableStartOnJob;
    }()
  }, {
    key: "getDurationEstimate",
    value: function () {
      var _getDurationEstimate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(queueId) {
        var _this18 = this;

        var maxDuration,
            port,
            _args20 = arguments;
        return regeneratorRuntime.wrap(function _callee19$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                maxDuration = _args20.length > 1 && _args20[1] !== undefined ? _args20[1] : 1000;
                _context20.next = 3;
                return this.link();

              case 3:
                port = _context20.sent;
                return _context20.abrupt("return", new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this18.removeListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);

                    _this18.removeListener('getDurationEstimateError', handleGetDurationEstimateError);

                    reject(new Error("Did not receive duration estimate response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleGetDurationEstimateComplete = function handleGetDurationEstimateComplete(responseId, values) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this18.removeListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);

                    _this18.removeListener('getDurationEstimateError', handleGetDurationEstimateError);

                    resolve(values);
                  };

                  var handleGetDurationEstimateError = function handleGetDurationEstimateError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this18.removeListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);

                    _this18.removeListener('getDurationEstimateError', handleGetDurationEstimateError);

                    reject(error);
                  };

                  _this18.addListener('getDurationEstimateComplete', handleGetDurationEstimateComplete);

                  _this18.addListener('getDurationEstimateError', handleGetDurationEstimateError);

                  port.postMessage({
                    type: 'getDurationEstimate',
                    args: [requestId, queueId]
                  });
                }));

              case 5:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee19, this);
      }));

      function getDurationEstimate(_x6) {
        return _getDurationEstimate.apply(this, arguments);
      }

      return getDurationEstimate;
    }()
  }, {
    key: "getCurrentJobType",
    value: function () {
      var _getCurrentJobType = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(queueId) {
        var _this19 = this;

        var maxDuration,
            port,
            _args21 = arguments;
        return regeneratorRuntime.wrap(function _callee20$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                maxDuration = _args21.length > 1 && _args21[1] !== undefined ? _args21[1] : 1000;
                _context21.next = 3;
                return this.link();

              case 3:
                port = _context21.sent;
                return _context21.abrupt("return", new Promise(function (resolve, reject) {
                  var requestId = Math.random();
                  var timeout = setTimeout(function () {
                    _this19.removeListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);

                    _this19.removeListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);

                    reject(new Error("Did not receive duration estimate response within ".concat(maxDuration, "ms")));
                  }, maxDuration);

                  var handleGetCurrentJobTypeComplete = function handleGetCurrentJobTypeComplete(responseId, type) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this19.removeListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);

                    _this19.removeListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);

                    resolve(type);
                  };

                  var handleGetCurrentJobTypeError = function handleGetCurrentJobTypeError(responseId, error) {
                    if (responseId !== requestId) {
                      return;
                    }

                    clearTimeout(timeout);

                    _this19.removeListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);

                    _this19.removeListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);

                    reject(error);
                  };

                  _this19.addListener('getCurrentJobTypeComplete', handleGetCurrentJobTypeComplete);

                  _this19.addListener('getCurrentJobTypeError', handleGetCurrentJobTypeError);

                  port.postMessage({
                    type: 'getCurrentJobType',
                    args: [requestId, queueId]
                  });
                }));

              case 5:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee20, this);
      }));

      function getCurrentJobType(_x7) {
        return _getCurrentJobType.apply(this, arguments);
      }

      return getCurrentJobType;
    }()
  }, {
    key: "sync",
    value: function () {
      var _sync = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
        var _this20 = this;

        var serviceWorker, _registration;

        return regeneratorRuntime.wrap(function _callee21$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                if (canUseSyncManager) {
                  _context22.next = 2;
                  break;
                }

                return _context22.abrupt("return");

              case 2:
                if (!this.isSyncing) {
                  _context22.next = 4;
                  break;
                }

                return _context22.abrupt("return");

              case 4:
                this.isSyncing = true;
                _context22.prev = 5;
                _context22.next = 8;
                return this.link();

              case 8:
                this.logger.info('Sending sync event');
                serviceWorker = navigator && navigator.serviceWorker;

                if (serviceWorker) {
                  _context22.next = 12;
                  break;
                }

                throw new Error('Service worker not available');

              case 12:
                _context22.next = 14;
                return serviceWorker.ready;

              case 14:
                _registration = _context22.sent;

                // $FlowFixMe
                _registration.sync.register('syncManagerOnIdle');

                _context22.next = 18;
                return new Promise(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    _this20.removeListener('syncManagerOnIdle', handleOnIdleSync);

                    reject(new Error('Unable to sync, did not receive syncManagerOnIdle acknowledgement'));
                  }, 5000);

                  var handleOnIdleSync = function handleOnIdleSync() {
                    clearTimeout(timeout);

                    _this20.removeListener('syncManagerOnIdle', handleOnIdleSync);

                    resolve();
                  };

                  _this20.addListener('syncManagerOnIdle', handleOnIdleSync);
                });

              case 18:
                _context22.next = 20;
                return new Promise(function (resolve) {
                  var handleIdle = function handleIdle() {
                    _this20.removeListener('idle', handleIdle);

                    _this20.removeListener('unlink', handleUnlink);

                    resolve();
                  };

                  var handleUnlink = function handleUnlink() {
                    _this20.removeListener('idle', handleIdle);

                    _this20.removeListener('unlink', handleUnlink);

                    resolve();
                  };

                  _this20.addListener('idle', handleIdle);

                  _this20.addListener('unlink', handleUnlink);
                });

              case 20:
                _context22.next = 27;
                break;

              case 22:
                _context22.prev = 22;
                _context22.t0 = _context22["catch"](5);
                this.logger.error('Unable to sync');
                this.emit('error', _context22.t0);
                this.logger.errorStack(_context22.t0);

              case 27:
                this.isSyncing = false;

              case 28:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee21, this, [[5, 22]]);
      }));

      function sync() {
        return _sync.apply(this, arguments);
      }

      return sync;
    }()
  }]);

  return BatteryQueueServiceWorkerInterface;
}(_events.default);

exports.default = BatteryQueueServiceWorkerInterface;
//# sourceMappingURL=worker-interface.js.map