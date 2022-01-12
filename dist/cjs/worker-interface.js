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

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

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

  return _createClass(RedundantServiceWorkerError);
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
      var _getRegistrationAndController = _asyncToGenerator(function* () {
        var _this2 = this;

        var serviceWorker = navigator && navigator.serviceWorker;

        if (!serviceWorker) {
          throw new Error('Service worker not available');
        }

        var registration = yield serviceWorker.ready;
        var controller = serviceWorker.controller;

        if (!controller) {
          throw new Error('Service worker controller not available');
        }

        var _loop = function* _loop() {
          var state = controller.state;
          var hadControllerChange = false;

          _this2.logger.info("Service worker in \"".concat(state, "\" state, waiting for state or controller change"));

          yield new Promise(function (resolve) {
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

          if (hadControllerChange) {
            return {
              v: _this2.getRegistrationAndController()
            };
          }
        };

        while (controller.state !== 'activated') {
          var _ret = yield* _loop();

          if (_typeof(_ret) === "object") return _ret.v;
        }

        return [registration, controller];
      });

      function getRegistrationAndController() {
        return _getRegistrationAndController.apply(this, arguments);
      }

      return getRegistrationAndController;
    }()
  }, {
    key: "cleanup",
    value: function () {
      var _cleanup = _asyncToGenerator(function* () {
        this.logger.info('Cleaning up');
        var linkPromise = this.linkPromise;

        if (typeof linkPromise !== 'undefined') {
          try {
            yield linkPromise;
          } catch (error) {
            this.logger.error('Link promise error while waiting to cleanup');
            this.logger.errorStack(error);
          }
        }

        var port = this.port;

        if (!(port instanceof MessagePort)) {
          return;
        }

        port.postMessage({
          type: 'unlink',
          args: [Math.random()]
        });
        delete this.port;
        clearInterval(this.portHeartbeatInterval);
        delete this.portHeartbeatInterval;
        var handlePortHeartbeat = this.handlePortHeartbeat;

        if (typeof handlePortHeartbeat === 'function') {
          this.removeListener('heartbeat', this.handlePortHeartbeat);
        }

        var handleBeforeUnload = this.handleBeforeUnload;

        if (typeof handlePortHeartbeat === 'function') {
          window.removeEventListener('beforeunload', handleBeforeUnload, {
            capture: true
          });
        }

        var handleJobAdd = this.portHandleJobAdd;

        if (typeof handleJobAdd === 'function') {
          _database.localJobEmitter.removeListener('jobAdd', handleJobAdd);
        }

        var handleJobDelete = this.portHandleJobDelete;

        if (typeof handleJobDelete === 'function') {
          _database.localJobEmitter.removeListener('jobDelete', handleJobDelete);
        }

        var handleJobUpdate = this.portHandleJobUpdate;

        if (typeof handleJobUpdate === 'function') {
          _database.localJobEmitter.removeListener('jobDelete', handleJobUpdate);
        }

        var handleJobsClear = this.portHandleJobsClear;

        if (typeof handleJobsClear === 'function') {
          _database.localJobEmitter.removeListener('jobsClear', handleJobsClear);
        }

        try {
          port.close();
        } catch (error) {
          this.logger.error('Error while closing MessageChannel port during cleanup');
          this.logger.errorStack(error);
        }

        port.onmessage = null;
        this.emit('unlink');
        this.logger.info('Unlinked after close');
      });

      function cleanup() {
        return _cleanup.apply(this, arguments);
      }

      return cleanup;
    }()
  }, {
    key: "unlink",
    value: function () {
      var _unlink = _asyncToGenerator(function* () {
        var _this3 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 60000;
        var linkPromise = this.linkPromise;

        if (typeof linkPromise !== 'undefined') {
          try {
            yield linkPromise;
          } catch (error) {
            this.logger.error('Link promise error while waiting to unlink');
            this.logger.errorStack(error);
          }
        }

        var port = this.port;

        if (!(port instanceof MessagePort)) {
          return;
        }

        delete this.port;
        clearInterval(this.portHeartbeatInterval);
        delete this.portHeartbeatInterval;
        var handlePortHeartbeat = this.handlePortHeartbeat;

        if (typeof handlePortHeartbeat === 'function') {
          this.removeListener('heartbeat', this.handlePortHeartbeat);
        }

        var handleBeforeUnload = this.handleBeforeUnload;

        if (typeof handlePortHeartbeat === 'function') {
          window.removeEventListener('beforeunload', handleBeforeUnload, {
            capture: true
          });
        }

        var handleJobAdd = this.portHandleJobAdd;

        if (typeof handleJobAdd === 'function') {
          _database.localJobEmitter.removeListener('jobAdd', handleJobAdd);
        }

        var handleJobDelete = this.portHandleJobDelete;

        if (typeof handleJobDelete === 'function') {
          _database.localJobEmitter.removeListener('jobDelete', handleJobDelete);
        }

        var handleJobUpdate = this.portHandleJobUpdate;

        if (typeof handleJobUpdate === 'function') {
          _database.localJobEmitter.removeListener('jobDelete', handleJobUpdate);
        }

        var handleJobsClear = this.portHandleJobsClear;

        if (typeof handleJobsClear === 'function') {
          _database.localJobEmitter.removeListener('jobsClear', handleJobsClear);
        }

        yield new Promise(function (resolve) {
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

        try {
          port.close();
        } catch (error) {
          this.logger.error('Error while closing MessageChannel port during unlink');
          this.logger.errorStack(error);
        }

        port.onmessage = null;
        this.emit('unlink');
        this.logger.info('Unlinked');
      });

      function unlink() {
        return _unlink.apply(this, arguments);
      }

      return unlink;
    }()
  }, {
    key: "link",
    value: function () {
      var _link2 = _asyncToGenerator(function* () {
        var _this4 = this;

        if (this.port instanceof MessagePort) {
          return this.port;
        }

        if (this.linkPromise) {
          return this.linkPromise;
        }

        var linkPromise = this._link().finally(function () {
          // eslint-disable-line no-underscore-dangle
          delete _this4.linkPromise;
        });

        this.linkPromise = linkPromise;
        return linkPromise;
      });

      function link() {
        return _link2.apply(this, arguments);
      }

      return link;
    }()
  }, {
    key: "_link",
    value: function () {
      var _link3 = _asyncToGenerator(function* () {
        var _this5 = this;

        if (this.port instanceof MessagePort) {
          return this.port;
        }

        var _yield$this$getRegist = yield this.getRegistrationAndController(),
            _yield$this$getRegist2 = _slicedToArray(_yield$this$getRegist, 2),
            registration = _yield$this$getRegist2[0],
            controller = _yield$this$getRegist2[1];

        var messageChannel = new MessageChannel();
        var port = messageChannel.port1;
        this.port = messageChannel.port1;

        var handleUpdateFound = /*#__PURE__*/function () {
          var _ref = _asyncToGenerator(function* () {
            var installingWorker = registration.installing;
            var activeWorker = registration.active;

            if (!installingWorker) {
              return;
            }

            if (!activeWorker) {
              return;
            }

            registration.removeEventListener('updatefound', handleUpdateFound);
            controller.removeEventListener('statechange', handleStateChange);

            try {
              yield _this5.unlink();

              _this5.logger.info('Unlinked service worker after detecting new service worker');
            } catch (error) {
              _this5.logger.error('Unable to unlink service worker after detecting new service worker');

              _this5.logger.errorStack(error);
            }
          });

          return function handleUpdateFound() {
            return _ref.apply(this, arguments);
          };
        }();

        var handleStateChange = /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator(function* () {
            _this5.logger.warn("Service worker state change to ".concat(controller.state));

            if (controller.state !== 'redundant') {
              return;
            }

            registration.removeEventListener('updatefound', handleUpdateFound);
            controller.removeEventListener('statechange', handleStateChange);

            try {
              yield _this5.unlink();

              _this5.logger.info('Unlinked service worker after detecting redundant service worker');
            } catch (error) {
              _this5.logger.error('Unable to unlink service worker after detecting redundant service worker');

              _this5.logger.errorStack(error);
            }
          });

          return function handleStateChange() {
            return _ref2.apply(this, arguments);
          };
        }();

        registration.addEventListener('updatefound', handleUpdateFound);
        controller.addEventListener('statechange', handleStateChange);

        try {
          yield new Promise(function (resolve, reject) {
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


            controller.postMessage({
              type: 'BATTERY_QUEUE_WORKER_INITIALIZATION'
            }, [messageChannel.port2]);
          });
        } catch (error) {
          registration.removeEventListener('updatefound', handleUpdateFound);
          controller.removeEventListener('statechange', handleStateChange);

          if (error instanceof RedundantServiceWorkerError) {
            return messageChannel.port1;
          }

          throw error;
        }

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

            case 'closed':
              _this5.logger.warn('Received unexpected "closed" event');

              _this5.cleanup();

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

        var handleJobAdd = function handleJobAdd() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          port.postMessage({
            type: 'jobAdd',
            args: args
          });
        };

        var handleJobDelete = function handleJobDelete() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          port.postMessage({
            type: 'jobDelete',
            args: args
          });
        };

        var handleJobUpdate = function handleJobUpdate() {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          port.postMessage({
            type: 'jobUpdate',
            args: args
          });
        };

        var handleJobsClear = function handleJobsClear() {
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

        this.portHandleJobAdd = handleJobAdd;
        this.portHandleJobDelete = handleJobDelete;
        this.portHandleJobUpdate = handleJobUpdate;
        this.portHandleJobsClear = handleJobsClear;
        var didReceiveHeartbeat = true;
        var missedHeartbeatCount = 0;

        var handlePortHeartbeat = function handlePortHeartbeat() {
          missedHeartbeatCount = 0;
          didReceiveHeartbeat = true;
        };

        this.addListener('heartbeat', handlePortHeartbeat);
        this.handlePortHeartbeat = handlePortHeartbeat;

        var sendHeartbeat = function sendHeartbeat() {
          if (!didReceiveHeartbeat) {
            missedHeartbeatCount += 1;

            _this5.logger.error("Did not receive ".concat(missedHeartbeatCount, " port ").concat(missedHeartbeatCount === 1 ? 'heartbeat' : 'heartbeats'));

            if (missedHeartbeatCount > 2) {
              _this5.cleanup();

              return;
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

        var handleBeforeUnload = function handleBeforeUnload() {
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
        return messageChannel.port1;
      });

      function _link() {
        return _link3.apply(this, arguments);
      }

      return _link;
    }()
  }, {
    key: "clear",
    value: function () {
      var _clear = _asyncToGenerator(function* () {
        var _this6 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function clear() {
        return _clear.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "updateDurationEstimates",
    value: function () {
      var _updateDurationEstimates = _asyncToGenerator(function* () {
        var _this7 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function updateDurationEstimates() {
        return _updateDurationEstimates.apply(this, arguments);
      }

      return updateDurationEstimates;
    }()
  }, {
    key: "abortQueue",
    value: function () {
      var _abortQueue = _asyncToGenerator(function* (queueId) {
        var _this8 = this;

        var maxDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function abortQueue(_x) {
        return _abortQueue.apply(this, arguments);
      }

      return abortQueue;
    }()
  }, {
    key: "abortAndRemoveQueue",
    value: function () {
      var _abortAndRemoveQueue = _asyncToGenerator(function* (queueId) {
        var _this9 = this;

        var maxDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function abortAndRemoveQueue(_x2) {
        return _abortAndRemoveQueue.apply(this, arguments);
      }

      return abortAndRemoveQueue;
    }()
  }, {
    key: "abortAndRemoveQueueJobsGreaterThanId",
    value: function () {
      var _abortAndRemoveQueueJobsGreaterThanId = _asyncToGenerator(function* (queueId, id) {
        var _this10 = this;

        var maxDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function abortAndRemoveQueueJobsGreaterThanId(_x3, _x4) {
        return _abortAndRemoveQueueJobsGreaterThanId.apply(this, arguments);
      }

      return abortAndRemoveQueueJobsGreaterThanId;
    }()
  }, {
    key: "retryQueue",
    value: function () {
      var _retryQueue = _asyncToGenerator(function* (queueId) {
        var _this11 = this;

        var maxDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function retryQueue(_x5) {
        return _retryQueue.apply(this, arguments);
      }

      return retryQueue;
    }()
  }, {
    key: "dequeue",
    value: function () {
      var _dequeue = _asyncToGenerator(function* () {
        var _this12 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function dequeue() {
        return _dequeue.apply(this, arguments);
      }

      return dequeue;
    }()
  }, {
    key: "runUnloadHandlers",
    value: function () {
      var _runUnloadHandlers = _asyncToGenerator(function* () {
        var _this13 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function runUnloadHandlers() {
        return _runUnloadHandlers.apply(this, arguments);
      }

      return runUnloadHandlers;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator(function* () {
        var _this14 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function onIdle() {
        return _onIdle.apply(this, arguments);
      }

      return onIdle;
    }()
  }, {
    key: "getQueueIds",
    value: function () {
      var _getQueueIds = _asyncToGenerator(function* () {
        var _this15 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

        if (this.queueIds instanceof Set) {
          return this.queueIds;
        }

        var port = yield this.link();
        var queueIds = yield new Promise(function (resolve, reject) {
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

        if (queueIds.size > 0) {
          this.queueIds = queueIds;
        }

        return queueIds;
      });

      function getQueueIds() {
        return _getQueueIds.apply(this, arguments);
      }

      return getQueueIds;
    }()
  }, {
    key: "enableStartOnJob",
    value: function () {
      var _enableStartOnJob = _asyncToGenerator(function* () {
        var _this16 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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

        var handleJobAdd = function handleJobAdd() {
          _this16.sync();
        };

        _database.jobEmitter.addListener('jobAdd', handleJobAdd);

        this.handleJobAdd = handleJobAdd;
      });

      function enableStartOnJob() {
        return _enableStartOnJob.apply(this, arguments);
      }

      return enableStartOnJob;
    }()
  }, {
    key: "disableStartOnJob",
    value: function () {
      var _disableStartOnJob = _asyncToGenerator(function* () {
        var _this17 = this;

        var maxDuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
        var handleJobAdd = this.handleJobAdd;

        if (typeof handleJobAdd === 'function') {
          _database.jobEmitter.removeListener('jobAdd', handleJobAdd);
        }

        var port = yield this.link();
        yield new Promise(function (resolve, reject) {
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
      });

      function disableStartOnJob() {
        return _disableStartOnJob.apply(this, arguments);
      }

      return disableStartOnJob;
    }()
  }, {
    key: "getDurationEstimate",
    value: function () {
      var _getDurationEstimate = _asyncToGenerator(function* (queueId) {
        var _this18 = this;

        var maxDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var port = yield this.link();
        return new Promise(function (resolve, reject) {
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
        });
      });

      function getDurationEstimate(_x6) {
        return _getDurationEstimate.apply(this, arguments);
      }

      return getDurationEstimate;
    }()
  }, {
    key: "getCurrentJobType",
    value: function () {
      var _getCurrentJobType = _asyncToGenerator(function* (queueId) {
        var _this19 = this;

        var maxDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var port = yield this.link();
        return new Promise(function (resolve, reject) {
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
        });
      });

      function getCurrentJobType(_x7) {
        return _getCurrentJobType.apply(this, arguments);
      }

      return getCurrentJobType;
    }()
  }, {
    key: "sync",
    value: function () {
      var _sync = _asyncToGenerator(function* () {
        var _this20 = this;

        if (!canUseSyncManager) {
          return;
        }

        if (this.isSyncing) {
          return;
        }

        this.isSyncing = true;

        try {
          yield this.link();
          this.logger.info('Sending sync event');
          var serviceWorker = navigator && navigator.serviceWorker;

          if (!serviceWorker) {
            throw new Error('Service worker not available');
          }

          var registration = yield serviceWorker.ready; // $FlowFixMe

          registration.sync.register('syncManagerOnIdle');
          yield new Promise(function (resolve, reject) {
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
          yield new Promise(function (resolve) {
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
        } catch (error) {
          this.logger.error('Unable to sync');
          this.emit('error', error);
          this.logger.errorStack(error);
        }

        this.isSyncing = false;
      });

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