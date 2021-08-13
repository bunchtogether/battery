"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pQueue = _interopRequireDefault(require("p-queue"));

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

var _database = require("./database");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
    _this.retryJobDelayMap = new Map();
    _this.retryCleanupDelayMap = new Map();
    _this.queueMap = new Map();
    _this.jobIds = new Set();
    _this.abortControllerMap = new Map();
    _this.isClearing = false;
    _this.emitCallbacks = [];
    _this.logger = options.logger || (0, _logger.default)('Battery Queue');

    _this.on('error', function (error) {
      _this.logger.errorStack(error);
    });

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
    key: "getQueueIds",
    value: function () {
      var _getQueueIds = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var queueIds;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.dequeue();

              case 2:
                queueIds = new Set(this.queueMap.keys());
                return _context.abrupt("return", queueIds);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getQueueIds() {
        return _getQueueIds.apply(this, arguments);
      }

      return getQueueIds;
    }()
  }, {
    key: "setRetryJobDelay",
    value: function setRetryJobDelay(type, retryJobDelayFunction) {
      if (this.retryJobDelayMap.has(type)) {
        throw new Error("Retry job delay handler for type \"".concat(type, "\" already exists"));
      }

      this.retryJobDelayMap.set(type, retryJobDelayFunction);
    }
  }, {
    key: "removeRetryJobDelay",
    value: function removeRetryJobDelay(type) {
      if (!this.retryJobDelayMap.has(type)) {
        throw new Error("Retry job delay handler for type \"".concat(type, "\" does not exist"));
      }

      this.retryJobDelayMap.delete(type);
    }
  }, {
    key: "getRetryJobDelay",
    value: function () {
      var _getRetryJobDelay = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(type, attempt, error) {
        var retryJobDelayFunction, result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                retryJobDelayFunction = this.retryJobDelayMap.get(type);

                if (!(typeof retryJobDelayFunction !== 'function')) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return", false);

              case 3:
                result = false;
                _context2.prev = 4;
                _context2.next = 7;
                return retryJobDelayFunction(attempt, error);

              case 7:
                result = _context2.sent;
                _context2.next = 15;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](4);
                this.logger.error("Error in retry job delay handler for type \"".concat(type, "\" on attempt ").concat(attempt));
                this.emit('error', _context2.t0);
                return _context2.abrupt("return", false);

              case 15:
                if (!(typeof result !== 'number' && result !== false)) {
                  _context2.next = 17;
                  break;
                }

                throw new Error("Retry job delay function for type \"".concat(type, "\" returned invalid response, should be a number (milliseconds) or false"));

              case 17:
                return _context2.abrupt("return", result);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 10]]);
      }));

      function getRetryJobDelay(_x, _x2, _x3) {
        return _getRetryJobDelay.apply(this, arguments);
      }

      return getRetryJobDelay;
    }()
  }, {
    key: "setRetryCleanupDelay",
    value: function setRetryCleanupDelay(type, retryCleanupDelayFunction) {
      if (this.retryCleanupDelayMap.has(type)) {
        throw new Error("Retry cleanup delay handler for type \"".concat(type, "\" already exists"));
      }

      this.retryCleanupDelayMap.set(type, retryCleanupDelayFunction);
    }
  }, {
    key: "removeRetryCleanupDelay",
    value: function removeRetryCleanupDelay(type) {
      if (!this.retryCleanupDelayMap.has(type)) {
        throw new Error("Retry cleanup delay handler for type \"".concat(type, "\" does not exist"));
      }

      this.retryCleanupDelayMap.delete(type);
    }
  }, {
    key: "getRetryCleanupDelay",
    value: function () {
      var _getRetryCleanupDelay = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(type, attempt, error) {
        var retryCleanupDelayFunction, result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                retryCleanupDelayFunction = this.retryCleanupDelayMap.get(type);

                if (!(typeof retryCleanupDelayFunction !== 'function')) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return", false);

              case 3:
                result = false;
                _context3.prev = 4;
                _context3.next = 7;
                return retryCleanupDelayFunction(attempt, error);

              case 7:
                result = _context3.sent;
                _context3.next = 15;
                break;

              case 10:
                _context3.prev = 10;
                _context3.t0 = _context3["catch"](4);
                this.logger.error("Error in retry cleanup delay handler for type \"".concat(type, "\" on attempt ").concat(attempt));
                this.emit('error', _context3.t0);
                return _context3.abrupt("return", false);

              case 15:
                if (!(typeof result !== 'number' && result !== false)) {
                  _context3.next = 17;
                  break;
                }

                throw new Error("Retry cleanup delay function for type \"".concat(type, "\" returned invalid response, should be a number (milliseconds) or false"));

              case 17:
                return _context3.abrupt("return", result);

              case 18:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[4, 10]]);
      }));

      function getRetryCleanupDelay(_x4, _x5, _x6) {
        return _getRetryCleanupDelay.apply(this, arguments);
      }

      return getRetryCleanupDelay;
    }()
  }, {
    key: "setHandler",
    value: function setHandler(type, handler) {
      if (this.handlerMap.has(type)) {
        throw new Error("Handler for type \"".concat(type, "\" already exists"));
      }

      this.handlerMap.set(type, handler);
    }
  }, {
    key: "removeHandler",
    value: function removeHandler(type) {
      if (!this.handlerMap.has(type)) {
        throw new Error("Handler for type \"".concat(type, "\" does not exist"));
      }

      this.handlerMap.delete(type);
    }
  }, {
    key: "setCleanup",
    value: function setCleanup(type, cleanup) {
      if (this.cleanupMap.has(type)) {
        throw new Error("Cleanup for type \"".concat(type, "\" already exists"));
      }

      this.cleanupMap.set(type, cleanup);
    }
  }, {
    key: "removeCleanup",
    value: function removeCleanup(type) {
      if (!this.cleanupMap.has(type)) {
        throw new Error("Cleanup for type \"".concat(type, "\" does not exist"));
      }

      this.cleanupMap.delete(type);
    }
  }, {
    key: "clear",
    value: function () {
      var _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.isClearing = true;
                _context4.next = 3;
                return this.onIdle();

              case 3:
                this.emit('clearing');
                _context4.next = 6;
                return (0, _database.clearDatabase)();

              case 6:
                this.dequeueQueue.start();
                this.isClearing = false;

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
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
      newQueue.on('idle', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (_this2.isClearing) {
                  _context5.next = 3;
                  break;
                }

                _context5.next = 3;
                return new Promise(function (resolve) {
                  var timeout = setTimeout(function () {
                    _this2.removeListener('clearing', handleClearing);

                    newQueue.removeListener('active', handleActive);
                    resolve();
                  }, 5000);

                  var handleClearing = function handleClearing() {
                    clearTimeout(timeout);

                    _this2.removeListener('clearing', handleClearing);

                    newQueue.removeListener('active', handleActive);
                    resolve();
                  };

                  var handleActive = function handleActive() {
                    clearTimeout(timeout);

                    _this2.removeListener('clearing', handleClearing);

                    newQueue.removeListener('active', handleActive);
                    resolve();
                  };

                  _this2.addListener('clearing', handleClearing);

                  newQueue.addListener('active', handleActive);
                });

              case 3:
                if (!(newQueue.pending > 0 || newQueue.size > 0)) {
                  _context5.next = 5;
                  break;
                }

                return _context5.abrupt("return");

              case 5:
                _this2.queueMap.delete(queueId);

                _this2.emit('queueInactive', queueId);

              case 7:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      })));
      this.emit('queueActive', queueId);
    }
  }, {
    key: "abortQueue",
    value: function () {
      var _abortQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(queueId) {
        var queueAbortControllerMap, _iterator2, _step2, abortController, jobs;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.logger.info("Aborting queue ".concat(queueId)); // Abort active jobs

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
                } // Changes:
                // * JOB_ERROR_STATUS -> JOB_CLEANUP_STATUS
                // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_STATUS
                // * JOB_PENDING_STATUS -> JOB_ABORTED_STATUS


                _context6.next = 5;
                return (0, _database.markQueueForCleanupInDatabase)(queueId);

              case 5:
                jobs = _context6.sent;
                _context6.next = 8;
                return this.startJobs(jobs);

              case 8:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function abortQueue(_x7) {
        return _abortQueue.apply(this, arguments);
      }

      return abortQueue;
    }()
  }, {
    key: "dequeue",
    value: function dequeue() {
      if (this.dequeueQueue.size === 0) {
        // Add a subsequent dequeue
        this.dequeueQueue.add(this.startJobs.bind(this));
      }

      return this.dequeueQueue.onIdle();
    }
  }, {
    key: "startJobs",
    value: function () {
      var _startJobs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(newJobs) {
        var jobs, queueIds, _iterator3, _step3, _step3$value, id, queueId, args, type, status, attempt, startAfter, queue, _iterator4, _step4, _queueId, _queue;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!Array.isArray(newJobs)) {
                  _context7.next = 4;
                  break;
                }

                _context7.t0 = newJobs;
                _context7.next = 7;
                break;

              case 4:
                _context7.next = 6;
                return (0, _database.dequeueFromDatabaseNotIn)(_toConsumableArray(this.jobIds.keys()));

              case 6:
                _context7.t0 = _context7.sent;

              case 7:
                jobs = _context7.t0;
                queueIds = new Set();
                _iterator3 = _createForOfIteratorHelper(jobs);
                _context7.prev = 10;

                _iterator3.s();

              case 12:
                if ((_step3 = _iterator3.n()).done) {
                  _context7.next = 32;
                  break;
                }

                _step3$value = _step3.value, id = _step3$value.id, queueId = _step3$value.queueId, args = _step3$value.args, type = _step3$value.type, status = _step3$value.status, attempt = _step3$value.attempt, startAfter = _step3$value.startAfter;

                if (!this.jobIds.has(id)) {
                  _context7.next = 16;
                  break;
                }

                return _context7.abrupt("continue", 30);

              case 16:
                // Pause queues before adding items into them to avoid starting things out of priority
                if (!queueIds.has(queueId)) {
                  queue = this.queueMap.get(queueId);

                  if (typeof queue !== 'undefined') {
                    queue.pause();
                  }

                  queueIds.add(queueId);
                }

                if (!(status === _database.JOB_PENDING_STATUS)) {
                  _context7.next = 21;
                  break;
                }

                this.startJob(id, queueId, args, type, attempt + 1, startAfter);
                _context7.next = 30;
                break;

              case 21:
                if (!(status === _database.JOB_ERROR_STATUS)) {
                  _context7.next = 25;
                  break;
                }

                this.startErrorHandler(id, queueId, args, type, attempt, startAfter);
                _context7.next = 30;
                break;

              case 25:
                if (!(status === _database.JOB_CLEANUP_STATUS)) {
                  _context7.next = 29;
                  break;
                }

                this.startCleanup(id, queueId, args, type);
                _context7.next = 30;
                break;

              case 29:
                throw new Error("Unknown job status ".concat(status, " in job ").concat(id, " of queue ").concat(queueId));

              case 30:
                _context7.next = 12;
                break;

              case 32:
                _context7.next = 37;
                break;

              case 34:
                _context7.prev = 34;
                _context7.t1 = _context7["catch"](10);

                _iterator3.e(_context7.t1);

              case 37:
                _context7.prev = 37;

                _iterator3.f();

                return _context7.finish(37);

              case 40:
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

              case 42:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[10, 34, 37, 40]]);
      }));

      function startJobs(_x8) {
        return _startJobs.apply(this, arguments);
      }

      return startJobs;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var _this3 = this;

        var maxDuration,
            _args10 = arguments;
        return regeneratorRuntime.wrap(function _callee9$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                maxDuration = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : 5000;

                if (typeof this.onIdlePromise === 'undefined') {
                  this.onIdlePromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                    var timeout, _iterator5, _step5, _loop, jobsInterval, jobs, interval;

                    return regeneratorRuntime.wrap(function _callee8$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            timeout = Date.now() + maxDuration;

                          case 1:
                            if (!true) {
                              _context9.next = 37;
                              break;
                            }

                            if (!(Date.now() > timeout)) {
                              _context9.next = 5;
                              break;
                            }

                            _this3.logger.warn("Idle timeout after ".concat(maxDuration, "ms"));

                            return _context9.abrupt("break", 37);

                          case 5:
                            _context9.next = 7;
                            return _this3.dequeueQueue.onIdle();

                          case 7:
                            _iterator5 = _createForOfIteratorHelper(_this3.queueMap);
                            _context9.prev = 8;
                            _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                              var _step5$value, queueId, queue, interval;

                              return regeneratorRuntime.wrap(function _loop$(_context8) {
                                while (1) {
                                  switch (_context8.prev = _context8.next) {
                                    case 0:
                                      _step5$value = _slicedToArray(_step5.value, 2), queueId = _step5$value[0], queue = _step5$value[1];
                                      interval = setInterval(function () {
                                        _this3.logger.info("Waiting on queue ".concat(queueId));
                                      }, 250);
                                      _context8.next = 4;
                                      return queue.onIdle();

                                    case 4:
                                      clearInterval(interval);

                                    case 5:
                                    case "end":
                                      return _context8.stop();
                                  }
                                }
                              }, _loop);
                            });

                            _iterator5.s();

                          case 11:
                            if ((_step5 = _iterator5.n()).done) {
                              _context9.next = 15;
                              break;
                            }

                            return _context9.delegateYield(_loop(), "t0", 13);

                          case 13:
                            _context9.next = 11;
                            break;

                          case 15:
                            _context9.next = 20;
                            break;

                          case 17:
                            _context9.prev = 17;
                            _context9.t1 = _context9["catch"](8);

                            _iterator5.e(_context9.t1);

                          case 20:
                            _context9.prev = 20;

                            _iterator5.f();

                            return _context9.finish(20);

                          case 23:
                            jobsInterval = setInterval(function () {
                              _this3.logger.info('Waiting on jobs');
                            }, 250);
                            _context9.next = 26;
                            return (0, _database.dequeueFromDatabase)();

                          case 26:
                            jobs = _context9.sent;
                            clearInterval(jobsInterval);

                            if (!(jobs.length > 0)) {
                              _context9.next = 34;
                              break;
                            }

                            interval = setInterval(function () {
                              _this3.logger.info('Waiting on dequeue');
                            }, 250);
                            _context9.next = 32;
                            return _this3.dequeue();

                          case 32:
                            clearInterval(interval);
                            return _context9.abrupt("continue", 1);

                          case 34:
                            return _context9.abrupt("break", 37);

                          case 37:
                            delete _this3.onIdlePromise;

                            _this3.emit('idle');

                          case 39:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee8, null, [[8, 17, 20, 23]]);
                  }))();
                }

                _context10.next = 4;
                return this.onIdlePromise;

              case 4:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee9, this);
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

      if (queueAbortControllerMap.size === 0) {
        this.abortControllerMap.delete(queueId);
      }
    }
  }, {
    key: "runCleanup",
    value: function () {
      var _runCleanup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(id, queueId, args, type) {
        var cleanup, cleanupJob, _ref3, data, startAfter, delay, attempt, retryCleanupDelay, newStartAfter;

        return regeneratorRuntime.wrap(function _callee10$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                this.emit('cleanupStart', {
                  id: id
                });
                cleanup = this.cleanupMap.get(type);

                if (!(typeof cleanup !== 'function')) {
                  _context11.next = 9;
                  break;
                }

                this.logger.warn("No cleanup for job type ".concat(type));
                _context11.next = 6;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 6:
                this.jobIds.delete(id);
                this.emit('cleanup', {
                  id: id
                });
                return _context11.abrupt("return");

              case 9:
                _context11.next = 11;
                return (0, _database.getCleanupFromDatabase)(id);

              case 11:
                cleanupJob = _context11.sent;
                _ref3 = typeof cleanupJob === 'undefined' ? {
                  data: undefined,
                  startAfter: 0
                } : cleanupJob, data = _ref3.data, startAfter = _ref3.startAfter;
                delay = startAfter - Date.now();

                if (!(delay > 0)) {
                  _context11.next = 18;
                  break;
                }

                this.logger.info("Delaying retry of ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " by ").concat(delay, "ms to ").concat(new Date(startAfter).toLocaleString()));
                _context11.next = 18;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, delay);
                });

              case 18:
                _context11.prev = 18;
                _context11.next = 21;
                return cleanup(data, args, function (path) {
                  return (0, _database.removePathFromCleanupDataInDatabase)(id, path);
                });

              case 21:
                _context11.next = 57;
                break;

              case 23:
                _context11.prev = 23;
                _context11.t0 = _context11["catch"](18);
                _context11.next = 27;
                return (0, _database.incrementCleanupAttemptInDatabase)(id, queueId);

              case 27:
                attempt = _context11.sent;

                if (!(_context11.t0.name === 'FatalCleanupError')) {
                  _context11.next = 36;
                  break;
                }

                this.logger.error("Fatal error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt));
                this.emit('error', _context11.t0);
                _context11.next = 33;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 33:
                this.jobIds.delete(id);
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context11.abrupt("return");

              case 36:
                _context11.next = 38;
                return this.getRetryCleanupDelay(type, attempt, _context11.t0);

              case 38:
                retryCleanupDelay = _context11.sent;

                if (!(retryCleanupDelay === false)) {
                  _context11.next = 47;
                  break;
                }

                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));
                this.emit('error', _context11.t0);
                _context11.next = 44;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 44:
                this.jobIds.delete(id);
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context11.abrupt("return");

              case 47:
                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryCleanupDelay > 0 ? "in ".concat(retryCleanupDelay, "ms'}") : 'immediately'));
                this.emit('error', _context11.t0);

                if (!(retryCleanupDelay > 0)) {
                  _context11.next = 54;
                  break;
                }

                this.emit('retryCleanupDelay', {
                  id: id,
                  queueId: queueId,
                  retryCleanupDelay: retryCleanupDelay
                });
                newStartAfter = Date.now() + retryCleanupDelay;
                _context11.next = 54;
                return (0, _database.markCleanupStartAfterInDatabase)(id, newStartAfter);

              case 54:
                _context11.next = 56;
                return this.runCleanup(id, queueId, args, type);

              case 56:
                return _context11.abrupt("return");

              case 57:
                _context11.next = 59;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 59:
                this.emit('cleanup', {
                  id: id
                });

              case 60:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee10, this, [[18, 23]]);
      }));

      function runCleanup(_x9, _x10, _x11, _x12) {
        return _runCleanup.apply(this, arguments);
      }

      return runCleanup;
    }()
  }, {
    key: "startCleanup",
    value: function startCleanup(id, queueId, args, type) {
      var _this4 = this;

      this.logger.info("Adding ".concat(type, " cleanup job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET + id;

      var run = /*#__PURE__*/function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
          return regeneratorRuntime.wrap(function _callee11$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _this4.logger.info("Starting ".concat(type, " cleanup #").concat(id, " in queue ").concat(queueId));

                  _context12.next = 3;
                  return _this4.runCleanup(id, queueId, args, type);

                case 3:
                  _context12.next = 5;
                  return (0, _database.markJobAbortedInDatabase)(id);

                case 5:
                  _this4.jobIds.delete(id);

                case 6:
                case "end":
                  return _context12.stop();
              }
            }
          }, _callee11);
        }));

        return function run() {
          return _ref4.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, run);
    }
  }, {
    key: "startErrorHandler",
    value: function startErrorHandler(id, queueId, args, type, attempt, startAfter) {
      var _this5 = this;

      this.logger.info("Adding ".concat(type, " error handler job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET + id;
      var abortController = this.getAbortController(id, queueId);

      var run = /*#__PURE__*/function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
          return regeneratorRuntime.wrap(function _callee12$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _this5.logger.info("Starting ".concat(type, " error handler #").concat(id, " in queue ").concat(queueId));

                  _context13.next = 3;
                  return _this5.runCleanup(id, queueId, args, type);

                case 3:
                  if (!abortController.signal.aborted) {
                    _context13.next = 10;
                    break;
                  }

                  _context13.next = 6;
                  return (0, _database.markJobAbortedInDatabase)(id);

                case 6:
                  _this5.removeAbortController(id, queueId);

                  _this5.jobIds.delete(id);

                  _context13.next = 15;
                  break;

                case 10:
                  _context13.next = 12;
                  return (0, _database.markJobPendingInDatabase)(id);

                case 12:
                  _this5.logger.info("Retrying ".concat(type, " job #").concat(id, " in queue ").concat(queueId));

                  _this5.emit('retry', {
                    id: id
                  });

                  _this5.startJob(id, queueId, args, type, attempt + 1, startAfter);

                case 15:
                case "end":
                  return _context13.stop();
              }
            }
          }, _callee12);
        }));

        return function run() {
          return _ref5.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, run);
    }
  }, {
    key: "delayJobStart",
    value: function () {
      var _delayJobStart = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(id, queueId, type, signal, startAfter) {
        var duration;
        return regeneratorRuntime.wrap(function _callee13$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                if (!signal.aborted) {
                  _context14.next = 2;
                  break;
                }

                throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));

              case 2:
                duration = startAfter - Date.now();

                if (!(duration > 0)) {
                  _context14.next = 7;
                  break;
                }

                this.logger.info("Delaying start of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(duration, "ms"));
                _context14.next = 7;
                return new Promise(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    signal.removeEventListener('abort', handleAbort);
                    resolve();
                  }, duration);

                  var handleAbort = function handleAbort() {
                    clearTimeout(timeout);
                    signal.removeEventListener('abort', handleAbort);
                    reject(new _errors.AbortError("Queue ".concat(queueId, " was aborted")));
                  };

                  signal.addEventListener('abort', handleAbort);
                });

              case 7:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee13, this);
      }));

      function delayJobStart(_x13, _x14, _x15, _x16, _x17) {
        return _delayJobStart.apply(this, arguments);
      }

      return delayJobStart;
    }()
  }, {
    key: "startJob",
    value: function startJob(id, queueId, args, type, attempt, startAfter) {
      var _this6 = this;

      this.logger.info("Adding ".concat(type, " job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET - id;

      var updateCleanupData = function updateCleanupData(data) {
        return (0, _database.updateCleanupValuesInDatabase)(id, queueId, data);
      };

      var abortController = this.getAbortController(id, queueId);

      var run = /*#__PURE__*/function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
          var handler, retryDelay, newStartAfter;
          return regeneratorRuntime.wrap(function _callee14$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  if (!abortController.signal.aborted) {
                    _context15.next = 3;
                    break;
                  }

                  _this6.removeAbortController(id, queueId);

                  return _context15.abrupt("return");

                case 3:
                  _this6.logger.info("Starting ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  handler = _this6.handlerMap.get(type);

                  if (!(typeof handler !== 'function')) {
                    _context15.next = 12;
                    break;
                  }

                  _this6.logger.warn("No handler for job type ".concat(type));

                  _context15.next = 9;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 9:
                  _this6.removeAbortController(id, queueId);

                  _this6.jobIds.delete(id);

                  return _context15.abrupt("return");

                case 12:
                  _context15.next = 14;
                  return (0, _database.markJobErrorInDatabase)(id);

                case 14:
                  _context15.prev = 14;
                  _context15.next = 17;
                  return _this6.delayJobStart(id, queueId, type, abortController.signal, startAfter);

                case 17:
                  _context15.next = 19;
                  return handler(args, abortController.signal, updateCleanupData);

                case 19:
                  if (!abortController.signal.aborted) {
                    _context15.next = 21;
                    break;
                  }

                  throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));

                case 21:
                  _context15.next = 23;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 23:
                  _this6.removeAbortController(id, queueId);

                  _this6.jobIds.delete(id);

                  return _context15.abrupt("return");

                case 28:
                  _context15.prev = 28;
                  _context15.t0 = _context15["catch"](14);
                  _context15.next = 32;
                  return (0, _database.incrementJobAttemptInDatabase)(id);

                case 32:
                  if (!(_context15.t0.name === 'AbortError')) {
                    _context15.next = 41;
                    break;
                  }

                  _this6.logger.error("Abort error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  _this6.emit('error', _context15.t0);

                  _context15.next = 37;
                  return (0, _database.markJobCleanupInDatabase)(id);

                case 37:
                  _this6.removeAbortController(id, queueId);

                  _this6.jobIds.delete(id);

                  _this6.startCleanup(id, queueId, args, type);

                  return _context15.abrupt("return");

                case 41:
                  if (!abortController.signal.aborted) {
                    _context15.next = 50;
                    break;
                  }

                  _this6.logger.error("Abort signal following error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  _this6.emit('error', _context15.t0);

                  _context15.next = 46;
                  return (0, _database.markJobCleanupInDatabase)(id);

                case 46:
                  _this6.removeAbortController(id, queueId);

                  _this6.jobIds.delete(id);

                  _this6.startCleanup(id, queueId, args, type);

                  return _context15.abrupt("return");

                case 50:
                  if (!(_context15.t0.name === 'FatalError')) {
                    _context15.next = 59;
                    break;
                  }

                  _this6.logger.error("Fatal error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  _this6.emit('error', _context15.t0);

                  _this6.emit('fatalError', {
                    queueId: queueId
                  });

                  _this6.jobIds.delete(id);

                  _this6.removeAbortController(id, queueId);

                  _context15.next = 58;
                  return _this6.abortQueue(queueId);

                case 58:
                  return _context15.abrupt("return");

                case 59:
                  _context15.next = 61;
                  return _this6.getRetryJobDelay(type, attempt, _context15.t0);

                case 61:
                  retryDelay = _context15.sent;

                  if (!(retryDelay === false)) {
                    _context15.next = 71;
                    break;
                  }

                  _this6.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));

                  _this6.emit('error', _context15.t0);

                  _this6.emit('fatalError', {
                    queueId: queueId
                  });

                  _this6.jobIds.delete(id);

                  _this6.removeAbortController(id, queueId);

                  _context15.next = 70;
                  return _this6.abortQueue(queueId);

                case 70:
                  return _context15.abrupt("return");

                case 71:
                  _this6.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryDelay > 0 ? "in ".concat(retryDelay, "ms'}") : 'immediately'));

                  _this6.emit('error', _context15.t0);

                  if (!(retryDelay > 0)) {
                    _context15.next = 82;
                    break;
                  }

                  _this6.emit('retryDelay', {
                    id: id,
                    queueId: queueId,
                    retryDelay: retryDelay
                  });

                  newStartAfter = Date.now() + retryDelay;
                  _context15.next = 78;
                  return (0, _database.markJobStartAfterInDatabase)(id, newStartAfter);

                case 78:
                  _this6.jobIds.delete(id);

                  _this6.startErrorHandler(id, queueId, args, type, attempt, newStartAfter);

                  _context15.next = 84;
                  break;

                case 82:
                  _this6.jobIds.delete(id);

                  _this6.startErrorHandler(id, queueId, args, type, attempt, startAfter);

                case 84:
                case "end":
                  return _context15.stop();
              }
            }
          }, _callee14, null, [[14, 28]]);
        }));

        return function run() {
          return _ref6.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, run);
      this.emit('dequeue', {
        id: id
      });
    }
  }, {
    key: "handlePortMessage",
    value: function () {
      var _handlePortMessage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(event) {
        var data, type, args, _args16, requestId, requestArgs, _requestArgs, queueId, queueIds, _requestArgs2, maxDuration, start;

        return regeneratorRuntime.wrap(function _callee15$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                if (event instanceof MessageEvent) {
                  _context16.next = 2;
                  break;
                }

                return _context16.abrupt("return");

              case 2:
                data = event.data;

                if (!(!data || _typeof(data) !== 'object')) {
                  _context16.next = 7;
                  break;
                }

                this.logger.warn('Invalid message data');
                this.logger.warnObject(event);
                return _context16.abrupt("return");

              case 7:
                type = data.type, args = data.args;

                if (!(typeof type !== 'string')) {
                  _context16.next = 12;
                  break;
                }

                this.logger.warn('Unknown message type');
                this.logger.warnObject(event);
                return _context16.abrupt("return");

              case 12:
                if (Array.isArray(args)) {
                  _context16.next = 16;
                  break;
                }

                this.logger.warn('Unknown arguments type');
                this.logger.warnObject(event);
                return _context16.abrupt("return");

              case 16:
                _context16.t0 = type;
                _context16.next = _context16.t0 === 'jobAdd' ? 19 : _context16.t0 === 'jobDelete' ? 21 : _context16.t0 === 'jobUpdate' ? 23 : _context16.t0 === 'jobsClear' ? 25 : 27;
                break;

              case 19:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobAdd'].concat(_toConsumableArray(args)));

                return _context16.abrupt("return");

              case 21:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobDelete'].concat(_toConsumableArray(args)));

                return _context16.abrupt("return");

              case 23:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobUpdate'].concat(_toConsumableArray(args)));

                return _context16.abrupt("return");

              case 25:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobsClear'].concat(_toConsumableArray(args)));

                return _context16.abrupt("return");

              case 27:
                return _context16.abrupt("break", 28);

              case 28:
                _args16 = _toArray(args), requestId = _args16[0], requestArgs = _args16.slice(1);

                if (!(typeof requestId !== 'number')) {
                  _context16.next = 31;
                  break;
                }

                throw new Error('Request arguments should start with a requestId number');

              case 31:
                _context16.t1 = type;
                _context16.next = _context16.t1 === 'clear' ? 34 : _context16.t1 === 'abortQueue' ? 46 : _context16.t1 === 'dequeue' ? 61 : _context16.t1 === 'getQueueIds' ? 73 : _context16.t1 === 'idle' ? 86 : 103;
                break;

              case 34:
                _context16.prev = 34;
                _context16.next = 37;
                return this.clear();

              case 37:
                this.emit('clearComplete', requestId);
                _context16.next = 45;
                break;

              case 40:
                _context16.prev = 40;
                _context16.t2 = _context16["catch"](34);
                this.emit('clearError', requestId, _context16.t2);
                this.logger.error('Unable to handle clear message');
                this.emit('error', _context16.t2);

              case 45:
                return _context16.abrupt("break", 104);

              case 46:
                _context16.prev = 46;
                _requestArgs = _slicedToArray(requestArgs, 1), queueId = _requestArgs[0];

                if (!(typeof queueId !== 'string')) {
                  _context16.next = 50;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(queueId), ", should be type string"));

              case 50:
                _context16.next = 52;
                return this.abortQueue(queueId);

              case 52:
                this.emit('abortQueueComplete', requestId);
                _context16.next = 60;
                break;

              case 55:
                _context16.prev = 55;
                _context16.t3 = _context16["catch"](46);
                this.emit('abortQueueError', requestId, _context16.t3);
                this.logger.error('Unable to handle abort queue message');
                this.emit('error', _context16.t3);

              case 60:
                return _context16.abrupt("break", 104);

              case 61:
                _context16.prev = 61;
                _context16.next = 64;
                return this.dequeue();

              case 64:
                this.emit('dequeueComplete', requestId);
                _context16.next = 72;
                break;

              case 67:
                _context16.prev = 67;
                _context16.t4 = _context16["catch"](61);
                this.emit('dequeueError', requestId, _context16.t4);
                this.logger.error('Unable to handle dequeue message');
                this.emit('error', _context16.t4);

              case 72:
                return _context16.abrupt("break", 104);

              case 73:
                _context16.prev = 73;
                _context16.next = 76;
                return this.getQueueIds();

              case 76:
                queueIds = _context16.sent;
                this.emit('getQueuesComplete', requestId, _toConsumableArray(queueIds));
                _context16.next = 85;
                break;

              case 80:
                _context16.prev = 80;
                _context16.t5 = _context16["catch"](73);
                this.emit('getQueuesError', requestId, _context16.t5);
                this.logger.error('Unable to handle getQueueIds message');
                this.emit('error', _context16.t5);

              case 85:
                return _context16.abrupt("break", 104);

              case 86:
                _context16.prev = 86;
                _requestArgs2 = _slicedToArray(requestArgs, 2), maxDuration = _requestArgs2[0], start = _requestArgs2[1];

                if (!(typeof maxDuration !== 'number')) {
                  _context16.next = 90;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(maxDuration), ", should be type number"));

              case 90:
                if (!(typeof start !== 'number')) {
                  _context16.next = 92;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(start), ", should be type number"));

              case 92:
                _context16.next = 94;
                return this.onIdle(maxDuration - (Date.now() - start));

              case 94:
                this.emit('idleComplete', requestId);
                _context16.next = 102;
                break;

              case 97:
                _context16.prev = 97;
                _context16.t6 = _context16["catch"](86);
                this.emit('idleError', requestId, _context16.t6);
                this.logger.error('Unable to handle idle message');
                this.emit('error', _context16.t6);

              case 102:
                return _context16.abrupt("break", 104);

              case 103:
                this.logger.warn("Unknown worker interface message type ".concat(type));

              case 104:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee15, this, [[34, 40], [46, 55], [61, 67], [73, 80], [86, 97]]);
      }));

      function handlePortMessage(_x18) {
        return _handlePortMessage.apply(this, arguments);
      }

      return handlePortMessage;
    }()
  }, {
    key: "listenForServiceWorkerInterface",
    value: function listenForServiceWorkerInterface() {
      var _this7 = this;

      var activeEmitCallback;
      var handleJobAdd;
      var handleJobDelete;
      var handleJobUpdate;
      var handleJobsClear;
      self.addEventListener('message', function (event) {
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

        _this7.emitCallbacks = _this7.emitCallbacks.filter(function (x) {
          return x !== activeEmitCallback;
        });
        var previousPort = _this7.port;

        if (previousPort instanceof MessagePort) {
          _this7.logger.info('Closing previous worker interface');

          previousPort.close();
        }

        if (typeof handleJobAdd === 'function') {
          _database.localJobEmitter.removeListener('jobAdd', handleJobAdd);
        }

        if (typeof handleJobDelete === 'function') {
          _database.localJobEmitter.removeListener('jobDelete', handleJobDelete);
        }

        if (typeof handleJobUpdate === 'function') {
          _database.localJobEmitter.removeListener('jobUpdate', handleJobUpdate);
        }

        if (typeof handleJobsClear === 'function') {
          _database.localJobEmitter.removeListener('jobsClear', handleJobsClear);
        }

        port.postMessage({
          type: 'BATTERY_QUEUE_WORKER_CONFIRMATION'
        });

        _this7.logger.info('Linked to worker interface');

        port.onmessage = _this7.handlePortMessage.bind(_this7);

        handleJobAdd = function handleJobAdd() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          port.postMessage({
            type: 'jobAdd',
            args: args
          });
        };

        handleJobDelete = function handleJobDelete() {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          port.postMessage({
            type: 'jobDelete',
            args: args
          });
        };

        handleJobUpdate = function handleJobUpdate() {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          port.postMessage({
            type: 'jobUpdate',
            args: args
          });
        };

        handleJobsClear = function handleJobsClear() {
          for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
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

        var emitCallback = function emitCallback(t, args) {
          port.postMessage({
            type: t,
            args: args
          });
        };

        activeEmitCallback = emitCallback;

        _this7.emitCallbacks.push(emitCallback);

        _this7.port = port;
      });
      self.addEventListener('messageerror', function (event) {
        _this7.logger.error('Service worker interface message error');

        _this7.logger.errorObject(event);
      });
    }
  }]);

  return BatteryQueue;
}(_events.default);

exports.default = BatteryQueue;
//# sourceMappingURL=queue.js.map