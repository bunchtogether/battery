"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pQueue = _interopRequireDefault(require("p-queue"));

var _serializeError = _interopRequireDefault(require("serialize-error"));

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

var _database = require("./database");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var PRIORITY_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER / 2);

var BatteryQueue = /*#__PURE__*/function (_EventEmitter) {
  _inherits(BatteryQueue, _EventEmitter);

  var _super = _createSuper(BatteryQueue);

  function BatteryQueue() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BatteryQueue);

    _this = _super.call(this);
    _this.dequeueQueue = new _pQueue.default({
      concurrency: 1
    });
    _this.handlerMap = new Map();
    _this.cleanupMap = new Map();
    _this.retryDelayMap = new Map();
    _this.queueMap = new Map();
    _this.jobIds = new Set();
    _this.abortControllerMap = new Map();
    _this.isClearing = false;
    _this.emitCallbacks = [];
    _this.logger = options.logger || (0, _logger.default)('Battery Queue');
    return _this;
  }

  _createClass(BatteryQueue, [{
    key: "emit",
    value: function emit(type) {
      var _get2;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _iterator = _createForOfIteratorHelper(this.emitCallbacks),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var emitCallback = _step.value;
          emitCallback(type, args);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return (_get2 = _get(_getPrototypeOf(BatteryQueue.prototype), "emit", this)).call.apply(_get2, [this, type].concat(args));
    }
  }, {
    key: "setRetryDelay",
    value: function setRetryDelay(type, delayOrFunction) {
      if (typeof delayOrFunction === 'number') {
        this.retryDelayMap.set(type, function () {
          return delayOrFunction;
        });
      } else if (typeof delayOrFunction === 'function') {
        this.retryDelayMap.set(type, delayOrFunction);
      } else {
        this.logger.error("Unable to set retry delay for ".concat(type, ", unknown handler type ").concat(_typeof(delayOrFunction)));
      }
    }
  }, {
    key: "removeRetryDelay",
    value: function removeRetryDelay(type) {
      this.retryDelayMap.delete(type);
    }
  }, {
    key: "addHandler",
    value: function addHandler(type, handler) {
      var handlers = this.handlerMap.get(type) || [];
      handlers.push(handler);
      this.handlerMap.set(type, handlers);
    }
  }, {
    key: "removeHandler",
    value: function removeHandler(type, handler) {
      var handlers = (this.handlerMap.get(type) || []).filter(function (f) {
        return f !== handler;
      });

      if (handlers.length > 0) {
        this.handlerMap.set(type, handlers);
      } else {
        this.handlerMap.delete(type);
      }
    }
  }, {
    key: "addCleanup",
    value: function addCleanup(type, cleanup) {
      var cleanups = this.cleanupMap.get(type) || [];
      cleanups.push(cleanup);
      this.cleanupMap.set(type, cleanups);
    }
  }, {
    key: "removeCleanup",
    value: function removeCleanup(type, cleanup) {
      var cleanups = (this.cleanupMap.get(type) || []).filter(function (f) {
        return f !== cleanup;
      });

      if (cleanups.length > 0) {
        this.cleanupMap.set(type, cleanups);
      } else {
        this.cleanupMap.delete(type);
      }
    }
  }, {
    key: "clear",
    value: function () {
      var _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.isClearing = true;
                _context.next = 3;
                return this.onIdle();

              case 3:
                this.emit('clearing');
                _context.next = 6;
                return (0, _database.clearDatabase)();

              case 6:
                this.dequeueQueue.start();
                this.isClearing = false;

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function clear() {
        return _clear.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "addToQueue",
    value: function addToQueue(queueId, priority, func) {
      var _this2 = this;

      var queue = this.queueMap.get(queueId);

      if (typeof queue !== 'undefined') {
        queue.add(func, {
          priority: priority
        });
        return;
      }

      var newQueue = new _pQueue.default({
        concurrency: 1,
        autoStart: false
      });
      this.queueMap.set(queueId, newQueue);
      newQueue.add(func, {
        priority: priority
      });
      newQueue.on('idle', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (_this2.isClearing) {
                  _context2.next = 3;
                  break;
                }

                _context2.next = 3;
                return new Promise(function (resolve) {
                  var timeout = setTimeout(function () {
                    _this2.removeListener('clearing', handleClearing);

                    resolve();
                  }, 5000);

                  var handleClearing = function handleClearing() {
                    clearTimeout(timeout);

                    _this2.removeListener('clearing', handleClearing);

                    resolve();
                  };

                  _this2.addListener('clearing', handleClearing);
                });

              case 3:
                if (!(newQueue.pending > 0 || newQueue.size > 0)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return");

              case 5:
                _this2.queueMap.delete(queueId);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      })));
    }
  }, {
    key: "abortQueue",
    value: function () {
      var _abortQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(queueId) {
        var queueAbortControllerMap, _iterator2, _step2, abortController;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.logger.info("Aborting queue ".concat(queueId)); // Changes:
                // * JOB_ERROR_STATUS -> JOB_CLEANUP_STATUS
                // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_STATUS
                // * JOB_PENDING_STATUS -> JOB_ABORTED_STATUS

                _context3.next = 3;
                return (0, _database.markQueueForCleanupInDatabase)(queueId);

              case 3:
                // Abort active jobs
                queueAbortControllerMap = this.abortControllerMap.get(queueId);

                if (typeof queueAbortControllerMap !== 'undefined') {
                  _iterator2 = _createForOfIteratorHelper(queueAbortControllerMap.values());

                  try {
                    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                      abortController = _step2.value;
                      abortController.abort();
                    }
                  } catch (err) {
                    _iterator2.e(err);
                  } finally {
                    _iterator2.f();
                  }
                }

                this.abortControllerMap.delete(queueId);

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
    value: function dequeue() {
      if (this.dequeueQueue.size === 0) {
        // Add a subsequent dequeue
        this.dequeueQueue.add(this._dequeue.bind(this)); // eslint-disable-line no-underscore-dangle
      }

      return this.dequeueQueue.onIdle();
    }
  }, {
    key: "_dequeue",
    value: function () {
      var _dequeue2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var jobs, queueIds, _iterator3, _step3, _step3$value, id, queueId, args, type, status, attempt, maxAttempts, startAfter, queue, _iterator4, _step4, _queueId, _queue;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _database.dequeueFromDatabase)();

              case 2:
                jobs = _context4.sent;
                queueIds = new Set();
                _iterator3 = _createForOfIteratorHelper(jobs);
                _context4.prev = 5;

                _iterator3.s();

              case 7:
                if ((_step3 = _iterator3.n()).done) {
                  _context4.next = 27;
                  break;
                }

                _step3$value = _step3.value, id = _step3$value.id, queueId = _step3$value.queueId, args = _step3$value.args, type = _step3$value.type, status = _step3$value.status, attempt = _step3$value.attempt, maxAttempts = _step3$value.maxAttempts, startAfter = _step3$value.startAfter;

                if (!this.jobIds.has(id)) {
                  _context4.next = 11;
                  break;
                }

                return _context4.abrupt("continue", 25);

              case 11:
                // Pause queues before adding items into them to avoid starting things out of priority
                if (!queueIds.has(queueId)) {
                  queue = this.queueMap.get(queueId);

                  if (typeof queue !== 'undefined') {
                    queue.pause();
                  }

                  queueIds.add(queueId);
                }

                if (!(status === _database.JOB_PENDING_STATUS)) {
                  _context4.next = 16;
                  break;
                }

                this.startJob(id, queueId, args, type, attempt, maxAttempts, startAfter);
                _context4.next = 25;
                break;

              case 16:
                if (!(status === _database.JOB_ERROR_STATUS)) {
                  _context4.next = 20;
                  break;
                }

                this.startErrorHandler(id, queueId, args, type);
                _context4.next = 25;
                break;

              case 20:
                if (!(status === _database.JOB_CLEANUP_STATUS)) {
                  _context4.next = 24;
                  break;
                }

                this.startCleanup(id, queueId, args, type);
                _context4.next = 25;
                break;

              case 24:
                throw new Error("Unknown job status ".concat(status, " in job ").concat(id, " of queue ").concat(queueId));

              case 25:
                _context4.next = 7;
                break;

              case 27:
                _context4.next = 32;
                break;

              case 29:
                _context4.prev = 29;
                _context4.t0 = _context4["catch"](5);

                _iterator3.e(_context4.t0);

              case 32:
                _context4.prev = 32;

                _iterator3.f();

                return _context4.finish(32);

              case 35:
                _iterator4 = _createForOfIteratorHelper(queueIds);

                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    _queueId = _step4.value;
                    _queue = this.queueMap.get(_queueId);

                    if (typeof _queue !== 'undefined') {
                      _queue.start();
                    } else {
                      this.logger.error("Unable to start queue ".concat(_queueId, " after dequeue; queue does not exist"));
                    }
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }

              case 37:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[5, 29, 32, 35]]);
      }));

      function _dequeue() {
        return _dequeue2.apply(this, arguments);
      }

      return _dequeue;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _this3 = this;

        var maxDuration,
            _args7 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                maxDuration = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : 5000;

                if (typeof this.onIdlePromise === 'undefined') {
                  this.onIdlePromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                    var timeout, _iterator5, _step5, _loop, jobsInterval, jobs, interval;

                    return regeneratorRuntime.wrap(function _callee5$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            timeout = Date.now() + maxDuration;

                          case 1:
                            if (!true) {
                              _context6.next = 37;
                              break;
                            }

                            if (!(Date.now() > timeout)) {
                              _context6.next = 5;
                              break;
                            }

                            _this3.logger.warn("Idle timeout after ".concat(maxDuration, "ms"));

                            return _context6.abrupt("break", 37);

                          case 5:
                            _context6.next = 7;
                            return _this3.dequeueQueue.onIdle();

                          case 7:
                            _iterator5 = _createForOfIteratorHelper(_this3.queueMap);
                            _context6.prev = 8;
                            _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                              var _step5$value, queueId, queue, interval;

                              return regeneratorRuntime.wrap(function _loop$(_context5) {
                                while (1) {
                                  switch (_context5.prev = _context5.next) {
                                    case 0:
                                      _step5$value = _slicedToArray(_step5.value, 2), queueId = _step5$value[0], queue = _step5$value[1];
                                      interval = setInterval(function () {
                                        _this3.logger.info("Waiting on queue ".concat(queueId));
                                      }, 250);
                                      _context5.next = 4;
                                      return queue.onIdle();

                                    case 4:
                                      clearInterval(interval);

                                    case 5:
                                    case "end":
                                      return _context5.stop();
                                  }
                                }
                              }, _loop);
                            });

                            _iterator5.s();

                          case 11:
                            if ((_step5 = _iterator5.n()).done) {
                              _context6.next = 15;
                              break;
                            }

                            return _context6.delegateYield(_loop(), "t0", 13);

                          case 13:
                            _context6.next = 11;
                            break;

                          case 15:
                            _context6.next = 20;
                            break;

                          case 17:
                            _context6.prev = 17;
                            _context6.t1 = _context6["catch"](8);

                            _iterator5.e(_context6.t1);

                          case 20:
                            _context6.prev = 20;

                            _iterator5.f();

                            return _context6.finish(20);

                          case 23:
                            jobsInterval = setInterval(function () {
                              _this3.logger.info('Waiting on jobs');
                            }, 250);
                            _context6.next = 26;
                            return (0, _database.dequeueFromDatabase)();

                          case 26:
                            jobs = _context6.sent;
                            clearInterval(jobsInterval);

                            if (!(jobs.length > 0)) {
                              _context6.next = 34;
                              break;
                            }

                            interval = setInterval(function () {
                              _this3.logger.info('Waiting on dequeue');
                            }, 250);
                            _context6.next = 32;
                            return _this3.dequeue();

                          case 32:
                            clearInterval(interval);
                            return _context6.abrupt("continue", 1);

                          case 34:
                            return _context6.abrupt("break", 37);

                          case 37:
                            delete _this3.onIdlePromise;

                            _this3.emit('idle');

                          case 39:
                          case "end":
                            return _context6.stop();
                        }
                      }
                    }, _callee5, null, [[8, 17, 20, 23]]);
                  }))();
                }

                _context7.next = 4;
                return this.onIdlePromise;

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee6, this);
      }));

      function onIdle() {
        return _onIdle.apply(this, arguments);
      }

      return onIdle;
    }()
  }, {
    key: "getAbortController",
    value: function getAbortController(id, queueId) {
      var queueAbortControllerMap = this.abortControllerMap.get(queueId);

      if (typeof queueAbortControllerMap === 'undefined') {
        queueAbortControllerMap = new Map();
        this.abortControllerMap.set(queueId, queueAbortControllerMap);
      }

      var abortController = queueAbortControllerMap.get(id);

      if (typeof abortController !== 'undefined') {
        return abortController;
      }

      var newAbortController = new AbortController();
      queueAbortControllerMap.set(id, newAbortController);
      return newAbortController;
    }
  }, {
    key: "removeAbortController",
    value: function removeAbortController(id, queueId) {
      var queueAbortControllerMap = this.abortControllerMap.get(queueId);

      if (typeof queueAbortControllerMap === 'undefined') {
        this.logger.warn("Abort controller map for ".concat(id, " in queue ").concat(queueId, " does not exist"));
        return;
      }

      var abortController = queueAbortControllerMap.get(id);

      if (typeof abortController === 'undefined') {
        this.logger.warn("Abort controller for ".concat(id, " in queue ").concat(queueId, " does not exist"));
        return;
      }

      queueAbortControllerMap.delete(id);
    }
  }, {
    key: "runCleanups",
    value: function () {
      var _runCleanups = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(id, queueId, args, type) {
        var removePathFromCleanupData, cleanups, hasFatalError, hasError, delayRetryErrorMs, cleanupJob, _iterator6, _step6, cleanup, data, startAfter, delay, _iterator7, _step7, _cleanup, _yield$incrementClean, _yield$incrementClean2, attempt, maxAttempts, newStartAfter;

        return regeneratorRuntime.wrap(function _callee7$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                removePathFromCleanupData = function removePathFromCleanupData(path) {
                  return (0, _database.removePathFromCleanupDataInDatabase)(id, path);
                };

                cleanups = this.cleanupMap.get(type);
                hasFatalError = false;
                hasError = false;
                delayRetryErrorMs = 0;

                if (!Array.isArray(cleanups)) {
                  _context8.next = 77;
                  break;
                }

                _context8.next = 8;
                return (0, _database.getCleanupFromDatabase)(id);

              case 8:
                cleanupJob = _context8.sent;

                if (!(typeof cleanupJob === 'undefined')) {
                  _context8.next = 38;
                  break;
                }

                _iterator6 = _createForOfIteratorHelper(cleanups);
                _context8.prev = 11;

                _iterator6.s();

              case 13:
                if ((_step6 = _iterator6.n()).done) {
                  _context8.next = 28;
                  break;
                }

                cleanup = _step6.value;
                _context8.prev = 15;
                _context8.next = 18;
                return cleanup({}, args, removePathFromCleanupData);

              case 18:
                _context8.next = 26;
                break;

              case 20:
                _context8.prev = 20;
                _context8.t0 = _context8["catch"](15);
                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt 1 with 0 attempts remaining, no cleanup data found"));
                this.logger.errorStack(_context8.t0);
                hasFatalError = true;
                hasError = true;

              case 26:
                _context8.next = 13;
                break;

              case 28:
                _context8.next = 33;
                break;

              case 30:
                _context8.prev = 30;
                _context8.t1 = _context8["catch"](11);

                _iterator6.e(_context8.t1);

              case 33:
                _context8.prev = 33;

                _iterator6.f();

                return _context8.finish(33);

              case 36:
                _context8.next = 75;
                break;

              case 38:
                data = cleanupJob.data, startAfter = cleanupJob.startAfter;
                delay = startAfter - Date.now();

                if (!(delay > 0)) {
                  _context8.next = 45;
                  break;
                }

                this.logger.warn("Delaying retry of ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " by ").concat(delay, "ms to ").concat(new Date(startAfter).toLocaleString()));
                this.emit('delayCleanupRetry', {
                  id: id,
                  queueId: queueId,
                  delay: delay
                });
                _context8.next = 45;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, delay);
                });

              case 45:
                _iterator7 = _createForOfIteratorHelper(cleanups);
                _context8.prev = 46;

                _iterator7.s();

              case 48:
                if ((_step7 = _iterator7.n()).done) {
                  _context8.next = 67;
                  break;
                }

                _cleanup = _step7.value;
                _context8.prev = 50;
                _context8.next = 53;
                return _cleanup(data, args, removePathFromCleanupData);

              case 53:
                _context8.next = 65;
                break;

              case 55:
                _context8.prev = 55;
                _context8.t2 = _context8["catch"](50);
                _context8.next = 59;
                return (0, _database.incrementCleanupAttemptInDatabase)(id);

              case 59:
                _yield$incrementClean = _context8.sent;
                _yield$incrementClean2 = _slicedToArray(_yield$incrementClean, 2);
                attempt = _yield$incrementClean2[0];
                maxAttempts = _yield$incrementClean2[1];
                hasError = true;

                if (_context8.t2.name === 'FatalCleanupError') {
                  hasFatalError = true;
                  this.logger.error("Fatal error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt));
                  this.logger.errorStack(_context8.t2);
                } else if (attempt >= maxAttempts) {
                  hasFatalError = true;
                  this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, " with no attempts remaining"));
                  this.logger.errorStack(_context8.t2);
                } else {
                  this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, " with ").concat(maxAttempts - attempt, " ").concat(maxAttempts - attempt === 1 ? 'attempt' : 'attempts', " remaining"));
                  this.logger.errorStack(_context8.t2);

                  if (_context8.t2.name === 'DelayRetryError') {
                    delayRetryErrorMs = _context8.t2.delay || 0;
                  }
                }

              case 65:
                _context8.next = 48;
                break;

              case 67:
                _context8.next = 72;
                break;

              case 69:
                _context8.prev = 69;
                _context8.t3 = _context8["catch"](46);

                _iterator7.e(_context8.t3);

              case 72:
                _context8.prev = 72;

                _iterator7.f();

                return _context8.finish(72);

              case 75:
                _context8.next = 78;
                break;

              case 77:
                this.logger.warn("No cleanup for job type ".concat(type));

              case 78:
                if (!hasFatalError) {
                  _context8.next = 86;
                  break;
                }

                _context8.next = 81;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 81:
                this.jobIds.delete(id);
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context8.abrupt("return");

              case 86:
                if (!hasError) {
                  _context8.next = 95;
                  break;
                }

                if (!(delayRetryErrorMs > 0)) {
                  _context8.next = 91;
                  break;
                }

                newStartAfter = Date.now() + delayRetryErrorMs;
                _context8.next = 91;
                return (0, _database.markCleanupStartAfterInDatabase)(id, newStartAfter);

              case 91:
                this.emit('dequeueCleanup', {
                  id: id
                });
                _context8.next = 94;
                return this.runCleanups(id, queueId, args, type);

              case 94:
                return _context8.abrupt("return");

              case 95:
                _context8.next = 97;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 97:
                this.jobIds.delete(id);
                this.emit('cleanup', {
                  id: id
                });

              case 99:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee7, this, [[11, 30, 33, 36], [15, 20], [46, 69, 72, 75], [50, 55]]);
      }));

      function runCleanups(_x2, _x3, _x4, _x5) {
        return _runCleanups.apply(this, arguments);
      }

      return runCleanups;
    }()
  }, {
    key: "startCleanup",
    value: function startCleanup(id, queueId, args, type) {
      var _this4 = this;

      this.logger.info("Adding ".concat(type, " cleanup job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET + id;

      var run = /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
          return regeneratorRuntime.wrap(function _callee8$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  _this4.logger.info("Starting ".concat(type, " cleanup job #").concat(id, " in queue ").concat(queueId));

                  _context9.next = 3;
                  return _this4.runCleanups(id, queueId, args, type);

                case 3:
                  _context9.next = 5;
                  return (0, _database.markJobAbortedInDatabase)(id);

                case 5:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee8);
        }));

        return function run() {
          return _ref3.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, run);
      this.emit('dequeueCleanup', {
        id: id
      });
    }
  }, {
    key: "startErrorHandler",
    value: function startErrorHandler(id, queueId, args, type) {
      var _this5 = this;

      this.logger.info("Adding ".concat(type, " error handler job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET + id;

      var run = /*#__PURE__*/function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
          var _yield$incrementJobAt, _yield$incrementJobAt2, attempt, maxAttempts;

          return regeneratorRuntime.wrap(function _callee9$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  _this5.logger.info("Starting ".concat(type, " error handler job #").concat(id, " in queue ").concat(queueId));

                  _context10.next = 3;
                  return _this5.runCleanups(id, queueId, args, type);

                case 3:
                  _context10.next = 5;
                  return (0, _database.incrementJobAttemptInDatabase)(id);

                case 5:
                  _yield$incrementJobAt = _context10.sent;
                  _yield$incrementJobAt2 = _slicedToArray(_yield$incrementJobAt, 2);
                  attempt = _yield$incrementJobAt2[0];
                  maxAttempts = _yield$incrementJobAt2[1];

                  if (!(attempt >= maxAttempts)) {
                    _context10.next = 18;
                    break;
                  }

                  _this5.logger.warn("Not retrying ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " after ").concat(maxAttempts, " failed ").concat(maxAttempts === 1 ? 'attempt' : 'attempts', ", cleaning up queue"));

                  _context10.next = 13;
                  return (0, _database.markJobAbortedInDatabase)(id);

                case 13:
                  _this5.emit('fatalError', {
                    queueId: queueId
                  });

                  _context10.next = 16;
                  return _this5.abortQueue(queueId);

                case 16:
                  _context10.next = 22;
                  break;

                case 18:
                  _context10.next = 20;
                  return (0, _database.markJobPendingInDatabase)(id);

                case 20:
                  _this5.logger.info("Retrying ".concat(type, " job #").concat(id, " in queue ").concat(queueId, ", ").concat(maxAttempts - attempt, " ").concat(maxAttempts - attempt === 1 ? 'attempt' : 'attempts', " remaining"));

                  _this5.emit('retry', {
                    id: id
                  });

                case 22:
                  _context10.next = 24;
                  return _this5.dequeue();

                case 24:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee9);
        }));

        return function run() {
          return _ref4.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, run);
      this.emit('dequeueCleanup', {
        id: id
      });
    }
  }, {
    key: "delayJobStart",
    value: function () {
      var _delayJobStart = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(id, queueId, type, signal, startAfter) {
        var duration;
        return regeneratorRuntime.wrap(function _callee10$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                duration = startAfter - Date.now();

                if (!(duration > 0)) {
                  _context11.next = 5;
                  break;
                }

                this.logger.info("Delaying start of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(duration, "ms"));
                _context11.next = 5;
                return new Promise(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    signal.removeEventListener('abort', handleAbort);
                    resolve();
                  }, duration);

                  var handleAbort = function handleAbort() {
                    clearTimeout(timeout);
                    signal.removeEventListener('abort', handleAbort);
                    reject(new _errors.AbortError('Aborted'));
                  };

                  signal.addEventListener('abort', handleAbort);
                });

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee10, this);
      }));

      function delayJobStart(_x6, _x7, _x8, _x9, _x10) {
        return _delayJobStart.apply(this, arguments);
      }

      return delayJobStart;
    }()
  }, {
    key: "startJob",
    value: function startJob(id, queueId, args, type, attempt, maxAttempts, startAfter) {
      var _this6 = this;

      this.logger.info("Adding ".concat(type, " job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET - id;
      var abortController = this.getAbortController(id, queueId);

      var updateCleanupData = function updateCleanupData(data, maxCleanupAttempts) {
        return (0, _database.updateCleanupInDatabase)(id, queueId, data, maxCleanupAttempts);
      };

      var run = /*#__PURE__*/function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
          var attemptsRemaining, handlers, hasError, hasFatalError, delayRetryErrorMs, _iterator8, _step8, handler, job, newStartAfter, retryDelayFunction, delayRetryMs, _newStartAfter;

          return regeneratorRuntime.wrap(function _callee11$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return _this6.delayJobStart(id, queueId, type, abortController.signal, startAfter);

                case 2:
                  attemptsRemaining = maxAttempts - attempt - 1;

                  if (attemptsRemaining > 0) {
                    _this6.logger.info("Starting ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt + 1, " with ").concat(attemptsRemaining, " ").concat(attemptsRemaining === 1 ? 'attempt' : 'attempts', " remaining"));
                  } else {
                    _this6.logger.info("Starting ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt + 1, " with no attempts remaining"));
                  }

                  handlers = _this6.handlerMap.get(type);
                  hasError = false;
                  hasFatalError = false;
                  delayRetryErrorMs = 0;

                  if (!Array.isArray(handlers)) {
                    _context12.next = 41;
                    break;
                  }

                  _iterator8 = _createForOfIteratorHelper(handlers);
                  _context12.prev = 10;

                  _iterator8.s();

                case 12:
                  if ((_step8 = _iterator8.n()).done) {
                    _context12.next = 31;
                    break;
                  }

                  handler = _step8.value;
                  _context12.prev = 14;
                  _context12.next = 17;
                  return handler(args, abortController.signal, updateCleanupData);

                case 17:
                  if (!abortController.signal.aborted) {
                    _context12.next = 19;
                    break;
                  }

                  throw new _errors.AbortError('Aborted');

                case 19:
                  _context12.next = 29;
                  break;

                case 21:
                  _context12.prev = 21;
                  _context12.t0 = _context12["catch"](14);

                  if (attemptsRemaining > 0) {
                    _this6.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt + 1, " with ").concat(attemptsRemaining, " ").concat(attemptsRemaining === 1 ? 'attempt' : 'attempts', " remaining"));
                  } else {
                    _this6.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt + 1, " with no attempts remaining"));
                  }

                  _this6.logger.errorStack(_context12.t0);

                  hasError = true;

                  if (_context12.t0.name === 'FatalQueueError') {
                    hasFatalError = true;
                  }

                  if (_context12.t0.name === 'DelayRetryError') {
                    delayRetryErrorMs = _context12.t0.delay || 0;
                  }

                  return _context12.abrupt("break", 31);

                case 29:
                  _context12.next = 12;
                  break;

                case 31:
                  _context12.next = 36;
                  break;

                case 33:
                  _context12.prev = 33;
                  _context12.t1 = _context12["catch"](10);

                  _iterator8.e(_context12.t1);

                case 36:
                  _context12.prev = 36;

                  _iterator8.f();

                  return _context12.finish(36);

                case 39:
                  _context12.next = 42;
                  break;

                case 41:
                  _this6.logger.warn("No handler for job type ".concat(type));

                case 42:
                  _this6.removeAbortController(id, queueId);

                  _this6.jobIds.delete(id);

                  if (hasError) {
                    _context12.next = 49;
                    break;
                  }

                  _context12.next = 47;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 47:
                  _this6.emit('complete', {
                    id: id
                  });

                  return _context12.abrupt("return");

                case 49:
                  _context12.next = 51;
                  return (0, _database.getJobFromDatabase)(id);

                case 51:
                  job = _context12.sent;

                  if (!(typeof job === 'undefined')) {
                    _context12.next = 55;
                    break;
                  }

                  _this6.logger.error("Unable to get ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " following error"));

                  return _context12.abrupt("return");

                case 55:
                  if (!(job.status === _database.JOB_CLEANUP_STATUS)) {
                    _context12.next = 57;
                    break;
                  }

                  throw new Error("Found cleanup status for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " following error, this should not happen"));

                case 57:
                  if (!(job.status === _database.JOB_COMPLETE_STATUS)) {
                    _context12.next = 59;
                    break;
                  }

                  throw new Error("Found complete status for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " following error, this should not happen"));

                case 59:
                  if (!(job.status === _database.JOB_ERROR_STATUS)) {
                    _context12.next = 61;
                    break;
                  }

                  throw new Error("Found error status for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " following error, this should not happen"));

                case 61:
                  if (!(job.status === _database.JOB_ABORTED_STATUS)) {
                    _context12.next = 67;
                    break;
                  }

                  // Job was aborted while running
                  _this6.logger.error("Found aborted status for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " following error, starting cleanup"));

                  _context12.next = 65;
                  return (0, _database.markJobErrorInDatabase)(id);

                case 65:
                  _context12.next = 96;
                  break;

                case 67:
                  if (!hasFatalError) {
                    _context12.next = 75;
                    break;
                  }

                  _context12.next = 70;
                  return (0, _database.markJobCleanupInDatabase)(id);

                case 70:
                  _this6.emit('fatalError', {
                    queueId: queueId
                  });

                  _context12.next = 73;
                  return _this6.abortQueue(queueId);

                case 73:
                  _context12.next = 96;
                  break;

                case 75:
                  if (!(delayRetryErrorMs > 0)) {
                    _context12.next = 85;
                    break;
                  }

                  newStartAfter = Date.now() + delayRetryErrorMs;

                  _this6.logger.warn("Delaying retry of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(delayRetryErrorMs, "ms to ").concat(new Date(newStartAfter).toLocaleString(), " following DelayRetryError"));

                  _this6.emit('delayRetry', {
                    id: id,
                    queueId: queueId,
                    delay: delayRetryErrorMs
                  });

                  _context12.next = 81;
                  return (0, _database.markJobStartAfterInDatabase)(id, newStartAfter);

                case 81:
                  _context12.next = 83;
                  return (0, _database.markJobErrorInDatabase)(id);

                case 83:
                  _context12.next = 96;
                  break;

                case 85:
                  retryDelayFunction = _this6.retryDelayMap.get(type);

                  if (!(typeof retryDelayFunction === 'function')) {
                    _context12.next = 94;
                    break;
                  }

                  delayRetryMs = retryDelayFunction(attempt + 1);

                  if (!(delayRetryMs > 0)) {
                    _context12.next = 94;
                    break;
                  }

                  _newStartAfter = Date.now() + delayRetryMs;

                  _this6.logger.warn("Delaying retry of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(delayRetryMs, "ms to ").concat(new Date(_newStartAfter).toLocaleString()));

                  _this6.emit('delayRetry', {
                    id: id,
                    queueId: queueId,
                    delay: delayRetryMs
                  });

                  _context12.next = 94;
                  return (0, _database.markJobStartAfterInDatabase)(id, _newStartAfter);

                case 94:
                  _context12.next = 96;
                  return (0, _database.markJobErrorInDatabase)(id);

                case 96:
                  _context12.next = 98;
                  return _this6.dequeue();

                case 98:
                case "end":
                  return _context12.stop();
              }
            }
          }, _callee11, null, [[10, 33, 36, 39], [14, 21]]);
        }));

        return function run() {
          return _ref5.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, run);
      this.emit('dequeue', {
        id: id
      });
    }
  }, {
    key: "handleInitializationMessage",
    value: function handleInitializationMessage(event) {
      if (!(event instanceof ExtendableMessageEvent)) {
        return;
      }

      var data = event.data;

      if (!data || _typeof(data) !== 'object') {
        return;
      }

      var type = data.type;

      if (type !== 'BATTERY_QUEUE_WORKER_INITIALIZATION') {
        return;
      }

      if (!Array.isArray(event.ports)) {
        return;
      }

      var port = event.ports[0];

      if (!(port instanceof MessagePort)) {
        return;
      }

      port.postMessage({
        type: 'BATTERY_QUEUE_WORKER_CONFIRMATION'
      });
      this.logger.info('Linked to interface');
      port.onmessage = this.handlePortMessage.bind(this);
      this.emitCallbacks.push(function (t, args) {
        port.postMessage({
          type: t,
          args: args
        });
      });
    }
  }, {
    key: "handlePortMessage",
    value: function () {
      var _handlePortMessage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(event) {
        var data, type, value, id, queueId, maxDuration, start;
        return regeneratorRuntime.wrap(function _callee12$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                if (event instanceof MessageEvent) {
                  _context13.next = 2;
                  break;
                }

                return _context13.abrupt("return");

              case 2:
                data = event.data;

                if (!(!data || _typeof(data) !== 'object')) {
                  _context13.next = 7;
                  break;
                }

                this.logger.warn('Invalid message data');
                this.logger.warnObject(event);
                return _context13.abrupt("return");

              case 7:
                type = data.type, value = data.value;

                if (!(typeof type !== 'string')) {
                  _context13.next = 12;
                  break;
                }

                this.logger.warn('Unknown message type');
                this.logger.warnObject(event);
                return _context13.abrupt("return");

              case 12:
                if (!(value === null || _typeof(value) !== 'object')) {
                  _context13.next = 14;
                  break;
                }

                throw new Error('Message payload should be an object');

              case 14:
                id = value.id;

                if (!(typeof id !== 'number')) {
                  _context13.next = 17;
                  break;
                }

                throw new Error('Message payload should include property id with type number');

              case 17:
                _context13.t0 = type;
                _context13.next = _context13.t0 === 'clear' ? 20 : _context13.t0 === 'abortQueue' ? 32 : _context13.t0 === 'dequeue' ? 47 : _context13.t0 === 'idle' ? 59 : 76;
                break;

              case 20:
                _context13.prev = 20;
                _context13.next = 23;
                return this.clear();

              case 23:
                this.emit('clearComplete', {
                  id: id
                });
                _context13.next = 31;
                break;

              case 26:
                _context13.prev = 26;
                _context13.t1 = _context13["catch"](20);
                this.emit('clearError', {
                  errorObject: _serializeError.default.serializeError(_context13.t1),
                  id: id
                });
                this.logger.error('Unable to handle clear message');
                this.logger.errorStack(_context13.t1);

              case 31:
                return _context13.abrupt("break", 77);

              case 32:
                _context13.prev = 32;
                queueId = value.queueId;

                if (!(typeof queueId !== 'string')) {
                  _context13.next = 36;
                  break;
                }

                throw new Error('Message abort queue payload should include property queueId with type string');

              case 36:
                _context13.next = 38;
                return this.abortQueue(queueId);

              case 38:
                this.emit('abortQueueComplete', {
                  id: id
                });
                _context13.next = 46;
                break;

              case 41:
                _context13.prev = 41;
                _context13.t2 = _context13["catch"](32);
                this.emit('abortQueueError', {
                  errorObject: _serializeError.default.serializeError(_context13.t2),
                  id: id
                });
                this.logger.error('Unable to handle abort queue message');
                this.logger.errorStack(_context13.t2);

              case 46:
                return _context13.abrupt("break", 77);

              case 47:
                _context13.prev = 47;
                _context13.next = 50;
                return this.dequeue();

              case 50:
                this.emit('dequeueComplete', {
                  id: id
                });
                _context13.next = 58;
                break;

              case 53:
                _context13.prev = 53;
                _context13.t3 = _context13["catch"](47);
                this.emit('dequeueError', {
                  errorObject: _serializeError.default.serializeError(_context13.t3),
                  id: id
                });
                this.logger.error('Unable to handle dequeue message');
                this.logger.errorStack(_context13.t3);

              case 58:
                return _context13.abrupt("break", 77);

              case 59:
                _context13.prev = 59;
                maxDuration = value.maxDuration, start = value.start;

                if (!(typeof maxDuration !== 'number')) {
                  _context13.next = 63;
                  break;
                }

                throw new Error('Message idle payload should include property maxDuration with type number');

              case 63:
                if (!(typeof start !== 'number')) {
                  _context13.next = 65;
                  break;
                }

                throw new Error('Message idle payload should include property start with type number');

              case 65:
                _context13.next = 67;
                return this.onIdle(maxDuration - (Date.now() - start));

              case 67:
                this.emit('idleComplete', {
                  id: id
                });
                _context13.next = 75;
                break;

              case 70:
                _context13.prev = 70;
                _context13.t4 = _context13["catch"](59);
                this.emit('idleError', {
                  errorObject: _serializeError.default.serializeError(_context13.t4),
                  id: id
                });
                this.logger.error('Unable to handle idle message');
                this.logger.errorStack(_context13.t4);

              case 75:
                return _context13.abrupt("break", 77);

              case 76:
                this.logger.warn("Unknown worker interface message type ".concat(type));

              case 77:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee12, this, [[20, 26], [32, 41], [47, 53], [59, 70]]);
      }));

      function handlePortMessage(_x11) {
        return _handlePortMessage.apply(this, arguments);
      }

      return handlePortMessage;
    }()
  }, {
    key: "listenForServiceWorkerInterface",
    value: function listenForServiceWorkerInterface() {
      self.addEventListener('message', this.handleInitializationMessage.bind(this));
    }
  }]);

  return BatteryQueue;
}(_events.default);

exports.default = BatteryQueue;
//# sourceMappingURL=queue.js.map