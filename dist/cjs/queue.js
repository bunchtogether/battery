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

    _this.addListener('error', function (error) {
      _this.logger.errorStack(error);
    });

    _this.addListener('heartbeat', function (interval) {
      clearTimeout(_this.heartbeatExpiresTimeout);
      _this.heartbeatExpiresTimestamp = Date.now() + Math.round(interval * 2.5);
      _this.heartbeatExpiresTimeout = setTimeout(function () {
        if (typeof _this.heartbeatExpiresTimestamp !== 'number') {
          return;
        }

        _this.logger.warn("Heartbeat timeout after ".concat(Math.round(interval * 2.1), "ms"));

        _this.unloadClient();
      }, Math.round(interval * 2.1));
    });

    return _this;
  }

  _createClass(BatteryQueue, [{
    key: "enableStartOnJob",
    value: function enableStartOnJob() {
      var _this2 = this;

      this.disableStartOnJob(); // Prevent handlers from being added multiple times

      var didRequestJobAddDequeue = false;

      var handleJobAdd = function handleJobAdd() {
        if (didRequestJobAddDequeue) {
          return;
        }

        didRequestJobAddDequeue = true;
        self.queueMicrotask(function () {
          didRequestJobAddDequeue = false;

          _this2.dequeue();
        });
      };

      _database.jobEmitter.addListener('jobAdd', handleJobAdd);

      this.handleJobAdd = handleJobAdd;

      var handleJobDelete = function handleJobDelete(id, queueId) {
        if (_this2.jobIds.has(id)) {
          var queueAbortControllerMap = _this2.abortControllerMap.get(queueId);

          if (typeof queueAbortControllerMap !== 'undefined') {
            var abortController = queueAbortControllerMap.get(id);

            if (typeof abortController !== 'undefined') {
              abortController.abort();
            }
          }
        }
      };

      _database.jobEmitter.addListener('jobDelete', handleJobDelete);

      this.handleJobDelete = handleJobDelete;

      var handleJobUpdate = function handleJobUpdate(id, queueId, type, status) {
        if (status !== _database.JOB_CLEANUP_AND_REMOVE_STATUS) {
          return;
        }

        if (_this2.jobIds.has(id)) {
          var queueAbortControllerMap = _this2.abortControllerMap.get(queueId);

          if (typeof queueAbortControllerMap !== 'undefined') {
            var abortController = queueAbortControllerMap.get(id);

            if (typeof abortController !== 'undefined') {
              abortController.abort();
            }
          }

          return;
        }

        (0, _database.getJobFromDatabase)(id).then(function (job) {
          if (typeof job === 'undefined') {
            _this2.logger.error("Unable to cleanup and remove ".concat(type, " job #").concat(id, " in queue ").concat(queueId, ", job does not exist"));

            return;
          }

          if (_this2.jobIds.has(id)) {
            return;
          }

          var args = job.args;

          _this2.startCleanup(id, queueId, args, type);
        }).catch(function (error) {
          _this2.logger.error("Error while cleaning up and removing ".concat(type, " job #").concat(id, " in queue ").concat(queueId));

          _this2.logger.errorStack(error);
        });
      };

      _database.jobEmitter.addListener('jobUpdate', handleJobUpdate);

      this.handleJobUpdate = handleJobUpdate;
    }
  }, {
    key: "disableStartOnJob",
    value: function disableStartOnJob() {
      var handleJobAdd = this.handleJobAdd;

      if (typeof handleJobAdd === 'function') {
        _database.jobEmitter.removeListener('jobAdd', handleJobAdd);

        delete this.handleJobAdd;
      }

      var handleJobUpdate = this.handleJobUpdate;

      if (typeof handleJobUpdate === 'function') {
        _database.jobEmitter.removeListener('jobUpdate', handleJobUpdate);

        delete this.handleJobUpdate;
      }

      var handleJobDelete = this.handleJobDelete;

      if (typeof handleJobDelete === 'function') {
        _database.jobEmitter.removeListener('jobDelete', handleJobDelete);

        delete this.handleJobDelete;
      }
    }
  }, {
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
    key: "setUnload",
    value: function setUnload(handleUnload) {
      if (typeof this.handleUnload === 'function') {
        throw new Error('Unload handler already exists');
      }

      this.handleUnload = handleUnload;
    }
  }, {
    key: "removeUnload",
    value: function removeUnload() {
      if (typeof this.handleUnload !== 'function') {
        throw new Error('Unload handler does not exist');
      }

      delete this.handleUnload;
    }
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
      var _this3 = this;

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
                if (_this3.isClearing) {
                  _context5.next = 3;
                  break;
                }

                _context5.next = 3;
                return new Promise(function (resolve) {
                  var timeout = setTimeout(function () {
                    _this3.removeListener('clearing', handleClearing);

                    newQueue.removeListener('active', handleActive);
                    resolve();
                  }, 5000);

                  var handleClearing = function handleClearing() {
                    clearTimeout(timeout);

                    _this3.removeListener('clearing', handleClearing);

                    newQueue.removeListener('active', handleActive);
                    resolve();
                  };

                  var handleActive = function handleActive() {
                    clearTimeout(timeout);

                    _this3.removeListener('clearing', handleClearing);

                    newQueue.removeListener('active', handleActive);
                    resolve();
                  };

                  _this3.addListener('clearing', handleClearing);

                  newQueue.addListener('active', handleActive);
                });

              case 3:
                if (!(newQueue.pending > 0 || newQueue.size > 0)) {
                  _context5.next = 5;
                  break;
                }

                return _context5.abrupt("return");

              case 5:
                _this3.queueMap.delete(queueId);

                _this3.emit('queueInactive', queueId);

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
    key: "abortAndRemoveQueue",
    value: function () {
      var _abortAndRemoveQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(queueId) {
        var queueAbortControllerMap, _iterator3, _step3, abortController, jobs;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this.logger.info("Aborting and removing queue ".concat(queueId)); // Abort active jobs

                queueAbortControllerMap = this.abortControllerMap.get(queueId);

                if (typeof queueAbortControllerMap !== 'undefined') {
                  _iterator3 = _createForOfIteratorHelper(queueAbortControllerMap.values());

                  try {
                    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                      abortController = _step3.value;
                      abortController.abort();
                    }
                  } catch (err) {
                    _iterator3.e(err);
                  } finally {
                    _iterator3.f();
                  }
                } // Changes:
                // * JOB_ERROR_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_PENDING_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * Removes other statuses


                _context7.next = 5;
                return (0, _database.markQueueForCleanupAndRemoveInDatabase)(queueId);

              case 5:
                jobs = _context7.sent;
                _context7.next = 8;
                return this.startJobs(jobs);

              case 8:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function abortAndRemoveQueue(_x8) {
        return _abortAndRemoveQueue.apply(this, arguments);
      }

      return abortAndRemoveQueue;
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
      var _startJobs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(newJobs) {
        var jobs, queueIds, _iterator4, _step4, _step4$value, id, queueId, args, type, status, attempt, startAfter, queue, _iterator5, _step5, _queueId, _queue;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!Array.isArray(newJobs)) {
                  _context8.next = 4;
                  break;
                }

                _context8.t0 = newJobs;
                _context8.next = 7;
                break;

              case 4:
                _context8.next = 6;
                return (0, _database.dequeueFromDatabaseNotIn)(_toConsumableArray(this.jobIds.keys()));

              case 6:
                _context8.t0 = _context8.sent;

              case 7:
                jobs = _context8.t0;
                queueIds = new Set();
                _iterator4 = _createForOfIteratorHelper(jobs);
                _context8.prev = 10;

                _iterator4.s();

              case 12:
                if ((_step4 = _iterator4.n()).done) {
                  _context8.next = 36;
                  break;
                }

                _step4$value = _step4.value, id = _step4$value.id, queueId = _step4$value.queueId, args = _step4$value.args, type = _step4$value.type, status = _step4$value.status, attempt = _step4$value.attempt, startAfter = _step4$value.startAfter;

                if (!this.jobIds.has(id)) {
                  _context8.next = 16;
                  break;
                }

                return _context8.abrupt("continue", 34);

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
                  _context8.next = 21;
                  break;
                }

                this.startJob(id, queueId, args, type, attempt + 1, startAfter);
                _context8.next = 34;
                break;

              case 21:
                if (!(status === _database.JOB_ERROR_STATUS)) {
                  _context8.next = 25;
                  break;
                }

                this.startErrorHandler(id, queueId, args, type, attempt, startAfter);
                _context8.next = 34;
                break;

              case 25:
                if (!(status === _database.JOB_CLEANUP_STATUS)) {
                  _context8.next = 29;
                  break;
                }

                this.startCleanup(id, queueId, args, type);
                _context8.next = 34;
                break;

              case 29:
                if (!(status === _database.JOB_CLEANUP_AND_REMOVE_STATUS)) {
                  _context8.next = 33;
                  break;
                }

                this.startCleanup(id, queueId, args, type);
                _context8.next = 34;
                break;

              case 33:
                throw new Error("Unknown job status ".concat(status, " in job ").concat(id, " of queue ").concat(queueId));

              case 34:
                _context8.next = 12;
                break;

              case 36:
                _context8.next = 41;
                break;

              case 38:
                _context8.prev = 38;
                _context8.t1 = _context8["catch"](10);

                _iterator4.e(_context8.t1);

              case 41:
                _context8.prev = 41;

                _iterator4.f();

                return _context8.finish(41);

              case 44:
                _iterator5 = _createForOfIteratorHelper(queueIds);

                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    _queueId = _step5.value;
                    _queue = this.queueMap.get(_queueId);

                    if (typeof _queue !== 'undefined') {
                      _queue.start();
                    } else {
                      this.logger.error("Unable to start queue ".concat(_queueId, " after dequeue; queue does not exist"));
                    }
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }

              case 46:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[10, 38, 41, 44]]);
      }));

      function startJobs(_x9) {
        return _startJobs.apply(this, arguments);
      }

      return startJobs;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(maxDuration) {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee10$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                if (typeof this.onIdlePromise === 'undefined') {
                  this.onIdlePromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                    var timeout, start, _iterator6, _step6, _loop, jobsInterval, jobs, interval;

                    return regeneratorRuntime.wrap(function _callee9$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            timeout = typeof maxDuration === 'number' ? Date.now() + maxDuration : -1;
                            start = Date.now();

                          case 2:
                            if (!true) {
                              _context10.next = 38;
                              break;
                            }

                            if (!(timeout !== -1 && Date.now() > timeout)) {
                              _context10.next = 6;
                              break;
                            }

                            _this4.logger.warn("Idle timeout after ".concat(Date.now() - start, "ms"));

                            return _context10.abrupt("break", 38);

                          case 6:
                            _context10.next = 8;
                            return _this4.dequeueQueue.onIdle();

                          case 8:
                            _iterator6 = _createForOfIteratorHelper(_this4.queueMap);
                            _context10.prev = 9;
                            _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                              var _step6$value, queueId, queue, interval;

                              return regeneratorRuntime.wrap(function _loop$(_context9) {
                                while (1) {
                                  switch (_context9.prev = _context9.next) {
                                    case 0:
                                      _step6$value = _slicedToArray(_step6.value, 2), queueId = _step6$value[0], queue = _step6$value[1];
                                      interval = setInterval(function () {
                                        _this4.logger.info("Waiting on queue ".concat(queueId));
                                      }, 250);
                                      _context9.next = 4;
                                      return queue.onIdle();

                                    case 4:
                                      clearInterval(interval);

                                    case 5:
                                    case "end":
                                      return _context9.stop();
                                  }
                                }
                              }, _loop);
                            });

                            _iterator6.s();

                          case 12:
                            if ((_step6 = _iterator6.n()).done) {
                              _context10.next = 16;
                              break;
                            }

                            return _context10.delegateYield(_loop(), "t0", 14);

                          case 14:
                            _context10.next = 12;
                            break;

                          case 16:
                            _context10.next = 21;
                            break;

                          case 18:
                            _context10.prev = 18;
                            _context10.t1 = _context10["catch"](9);

                            _iterator6.e(_context10.t1);

                          case 21:
                            _context10.prev = 21;

                            _iterator6.f();

                            return _context10.finish(21);

                          case 24:
                            jobsInterval = setInterval(function () {
                              _this4.logger.info('Waiting on jobs');
                            }, 250);
                            _context10.next = 27;
                            return (0, _database.dequeueFromDatabase)();

                          case 27:
                            jobs = _context10.sent;
                            clearInterval(jobsInterval);

                            if (!(jobs.length > 0)) {
                              _context10.next = 35;
                              break;
                            }

                            interval = setInterval(function () {
                              _this4.logger.info('Waiting on dequeue');
                            }, 250);
                            _context10.next = 33;
                            return _this4.dequeue();

                          case 33:
                            clearInterval(interval);
                            return _context10.abrupt("continue", 2);

                          case 35:
                            return _context10.abrupt("break", 38);

                          case 38:
                            delete _this4.onIdlePromise;

                            _this4.emit('idle');

                          case 40:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee9, null, [[9, 18, 21, 24]]);
                  }))();
                }

                _context11.next = 3;
                return this.onIdlePromise;

              case 3:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee10, this);
      }));

      function onIdle(_x10) {
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
      var _runCleanup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(id, queueId, args, type) {
        var cleanup, cleanupJob, _ref3, data, startAfter, delay, attempt, retryCleanupDelay, newStartAfter;

        return regeneratorRuntime.wrap(function _callee11$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                this.emit('cleanupStart', {
                  id: id
                });
                cleanup = this.cleanupMap.get(type);

                if (!(typeof cleanup !== 'function')) {
                  _context12.next = 8;
                  break;
                }

                this.logger.warn("No cleanup for job type ".concat(type));
                _context12.next = 6;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 6:
                this.emit('cleanup', {
                  id: id
                });
                return _context12.abrupt("return");

              case 8:
                _context12.next = 10;
                return (0, _database.getCleanupFromDatabase)(id);

              case 10:
                cleanupJob = _context12.sent;
                _ref3 = typeof cleanupJob === 'undefined' ? {
                  data: undefined,
                  startAfter: 0
                } : cleanupJob, data = _ref3.data, startAfter = _ref3.startAfter;
                delay = startAfter - Date.now();

                if (!(delay > 0)) {
                  _context12.next = 17;
                  break;
                }

                this.logger.info("Delaying retry of ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " by ").concat(delay, "ms to ").concat(new Date(startAfter).toLocaleString()));
                _context12.next = 17;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, delay);
                });

              case 17:
                _context12.prev = 17;
                _context12.next = 20;
                return cleanup(data, args, function (path) {
                  return (0, _database.removePathFromCleanupDataInDatabase)(id, path);
                });

              case 20:
                _context12.next = 54;
                break;

              case 22:
                _context12.prev = 22;
                _context12.t0 = _context12["catch"](17);
                _context12.next = 26;
                return (0, _database.incrementCleanupAttemptInDatabase)(id, queueId);

              case 26:
                attempt = _context12.sent;

                if (!(_context12.t0.name === 'FatalError')) {
                  _context12.next = 34;
                  break;
                }

                this.logger.error("Fatal error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt));
                this.emit('error', _context12.t0);
                _context12.next = 32;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 32:
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context12.abrupt("return");

              case 34:
                _context12.next = 36;
                return this.getRetryCleanupDelay(type, attempt, _context12.t0);

              case 36:
                retryCleanupDelay = _context12.sent;

                if (!(retryCleanupDelay === false)) {
                  _context12.next = 44;
                  break;
                }

                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));
                this.emit('error', _context12.t0);
                _context12.next = 42;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 42:
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context12.abrupt("return");

              case 44:
                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryCleanupDelay > 0 ? "in ".concat(retryCleanupDelay, "ms'}") : 'immediately'));
                this.emit('error', _context12.t0);

                if (!(retryCleanupDelay > 0)) {
                  _context12.next = 51;
                  break;
                }

                this.emit('retryCleanupDelay', {
                  id: id,
                  queueId: queueId,
                  retryCleanupDelay: retryCleanupDelay
                });
                newStartAfter = Date.now() + retryCleanupDelay;
                _context12.next = 51;
                return (0, _database.markCleanupStartAfterInDatabase)(id, newStartAfter);

              case 51:
                _context12.next = 53;
                return this.runCleanup(id, queueId, args, type);

              case 53:
                return _context12.abrupt("return");

              case 54:
                _context12.next = 56;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 56:
                this.emit('cleanup', {
                  id: id
                });

              case 57:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee11, this, [[17, 22]]);
      }));

      function runCleanup(_x11, _x12, _x13, _x14) {
        return _runCleanup.apply(this, arguments);
      }

      return runCleanup;
    }()
  }, {
    key: "startCleanup",
    value: function startCleanup(id, queueId, args, type) {
      var _this5 = this;

      this.logger.info("Adding ".concat(type, " cleanup job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET + id;

      var run = /*#__PURE__*/function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
          return regeneratorRuntime.wrap(function _callee12$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _this5.logger.info("Starting ".concat(type, " cleanup #").concat(id, " in queue ").concat(queueId));

                  _context13.next = 3;
                  return _this5.runCleanup(id, queueId, args, type);

                case 3:
                  _context13.next = 5;
                  return (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                case 5:
                  _this5.jobIds.delete(id);

                case 6:
                case "end":
                  return _context13.stop();
              }
            }
          }, _callee12);
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
      var _this6 = this;

      this.logger.info("Adding ".concat(type, " error handler job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET + id;
      var abortController = this.getAbortController(id, queueId);

      var run = /*#__PURE__*/function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
          return regeneratorRuntime.wrap(function _callee13$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _this6.logger.info("Starting ".concat(type, " error handler #").concat(id, " in queue ").concat(queueId));

                  _context14.next = 3;
                  return _this6.runCleanup(id, queueId, args, type);

                case 3:
                  if (!abortController.signal.aborted) {
                    _context14.next = 10;
                    break;
                  }

                  _context14.next = 6;
                  return (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                case 6:
                  _this6.removeAbortController(id, queueId);

                  _this6.jobIds.delete(id);

                  _context14.next = 15;
                  break;

                case 10:
                  _context14.next = 12;
                  return (0, _database.markJobPendingInDatabase)(id);

                case 12:
                  _this6.logger.info("Retrying ".concat(type, " job #").concat(id, " in queue ").concat(queueId));

                  _this6.emit('retry', {
                    id: id
                  });

                  _this6.startJob(id, queueId, args, type, attempt + 1, startAfter);

                case 15:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee13);
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
      var _delayJobStart = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(id, queueId, type, signal, startAfter) {
        var duration;
        return regeneratorRuntime.wrap(function _callee14$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                if (!signal.aborted) {
                  _context15.next = 2;
                  break;
                }

                throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));

              case 2:
                duration = startAfter - Date.now();

                if (!(duration > 0)) {
                  _context15.next = 7;
                  break;
                }

                this.logger.info("Delaying start of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(duration, "ms"));
                _context15.next = 7;
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
                return _context15.stop();
            }
          }
        }, _callee14, this);
      }));

      function delayJobStart(_x15, _x16, _x17, _x18, _x19) {
        return _delayJobStart.apply(this, arguments);
      }

      return delayJobStart;
    }()
  }, {
    key: "startJob",
    value: function startJob(id, queueId, args, type, attempt, startAfter) {
      var _this7 = this;

      this.logger.info("Adding ".concat(type, " job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = PRIORITY_OFFSET - id;

      var updateCleanupData = function updateCleanupData(data) {
        return (0, _database.updateCleanupValuesInDatabase)(id, queueId, data);
      };

      var abortController = this.getAbortController(id, queueId);

      var run = /*#__PURE__*/function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
          var handler, handlerDidRun, retryDelay, newStartAfter;
          return regeneratorRuntime.wrap(function _callee15$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  if (!abortController.signal.aborted) {
                    _context16.next = 5;
                    break;
                  }

                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: new _errors.AbortError("Queue ".concat(queueId, " was aborted"))
                  });

                  _this7.removeAbortController(id, queueId);

                  _this7.jobIds.delete(id);

                  return _context16.abrupt("return");

                case 5:
                  _this7.logger.info("Starting ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  handler = _this7.handlerMap.get(type);

                  if (!(typeof handler !== 'function')) {
                    _context16.next = 14;
                    break;
                  }

                  _this7.logger.warn("No handler for job type ".concat(type));

                  _context16.next = 11;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 11:
                  _this7.removeAbortController(id, queueId);

                  _this7.jobIds.delete(id);

                  return _context16.abrupt("return");

                case 14:
                  handlerDidRun = false;
                  _context16.prev = 15;
                  _context16.next = 18;
                  return (0, _database.markJobErrorInDatabase)(id);

                case 18:
                  _context16.next = 20;
                  return _this7.delayJobStart(id, queueId, type, abortController.signal, startAfter);

                case 20:
                  handlerDidRun = true;
                  _context16.next = 23;
                  return handler(args, abortController.signal, updateCleanupData);

                case 23:
                  if (!abortController.signal.aborted) {
                    _context16.next = 25;
                    break;
                  }

                  throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));

                case 25:
                  _context16.next = 27;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 27:
                  _this7.removeAbortController(id, queueId);

                  _this7.jobIds.delete(id);

                  return _context16.abrupt("return");

                case 32:
                  _context16.prev = 32;
                  _context16.t0 = _context16["catch"](15);

                  if (!(_context16.t0.name === 'JobDoesNotExistError')) {
                    _context16.next = 49;
                    break;
                  }

                  _this7.logger.error("Job does not exist error for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  if (!handlerDidRun) {
                    _context16.next = 45;
                    break;
                  }

                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context16.t0
                  });

                  _context16.next = 40;
                  return (0, _database.restoreJobToDatabaseForCleanupAndRemove)(id, queueId, type, args);

                case 40:
                  _this7.jobIds.delete(id);

                  _this7.removeAbortController(id, queueId);

                  _this7.startCleanup(id, queueId, args, type);

                  _context16.next = 48;
                  break;

                case 45:
                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context16.t0
                  });

                  _this7.jobIds.delete(id);

                  _this7.removeAbortController(id, queueId);

                case 48:
                  return _context16.abrupt("return");

                case 49:
                  if (!abortController.signal.aborted) {
                    _context16.next = 64;
                    break;
                  }

                  if (_context16.t0.name !== 'AbortError') {
                    _this7.logger.error("Abort signal following error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                    _this7.emit('error', _context16.t0);
                  } else {
                    _this7.logger.warn("Received abort signal for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));
                  }

                  if (!handlerDidRun) {
                    _context16.next = 58;
                    break;
                  }

                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context16.t0
                  });

                  _this7.jobIds.delete(id);

                  _this7.removeAbortController(id, queueId);

                  _this7.startCleanup(id, queueId, args, type);

                  _context16.next = 63;
                  break;

                case 58:
                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context16.t0
                  });

                  _context16.next = 61;
                  return (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                case 61:
                  _this7.jobIds.delete(id);

                  _this7.removeAbortController(id, queueId);

                case 63:
                  return _context16.abrupt("return");

                case 64:
                  _context16.next = 66;
                  return (0, _database.incrementJobAttemptInDatabase)(id);

                case 66:
                  if (!(_context16.t0.name === 'FatalError')) {
                    _context16.next = 75;
                    break;
                  }

                  _this7.logger.error("Fatal error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  _this7.emit('error', _context16.t0);

                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context16.t0
                  });

                  _this7.jobIds.delete(id);

                  _this7.removeAbortController(id, queueId);

                  _context16.next = 74;
                  return _this7.abortQueue(queueId);

                case 74:
                  return _context16.abrupt("return");

                case 75:
                  _context16.next = 77;
                  return _this7.getRetryJobDelay(type, attempt, _context16.t0);

                case 77:
                  retryDelay = _context16.sent;

                  if (!(retryDelay === false)) {
                    _context16.next = 87;
                    break;
                  }

                  _this7.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));

                  _this7.emit('error', _context16.t0);

                  _this7.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context16.t0
                  });

                  _this7.jobIds.delete(id);

                  _this7.removeAbortController(id, queueId);

                  _context16.next = 86;
                  return _this7.abortQueue(queueId);

                case 86:
                  return _context16.abrupt("return");

                case 87:
                  _this7.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryDelay > 0 ? "in ".concat(retryDelay, "ms'}") : 'immediately'));

                  _this7.emit('error', _context16.t0);

                  if (!(retryDelay > 0)) {
                    _context16.next = 98;
                    break;
                  }

                  _this7.emit('retryDelay', {
                    id: id,
                    queueId: queueId,
                    retryDelay: retryDelay
                  });

                  newStartAfter = Date.now() + retryDelay;
                  _context16.next = 94;
                  return (0, _database.markJobStartAfterInDatabase)(id, newStartAfter);

                case 94:
                  _this7.jobIds.delete(id);

                  _this7.startErrorHandler(id, queueId, args, type, attempt, newStartAfter);

                  _context16.next = 100;
                  break;

                case 98:
                  _this7.jobIds.delete(id);

                  _this7.startErrorHandler(id, queueId, args, type, attempt, startAfter);

                case 100:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee15, null, [[15, 32]]);
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
      var _handlePortMessage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(event) {
        var data, type, args, port, _args17, requestId, requestArgs, _requestArgs, queueId, _requestArgs2, _queueId2, queueIds, _requestArgs3, maxDuration, start;

        return regeneratorRuntime.wrap(function _callee16$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                if (event instanceof MessageEvent) {
                  _context17.next = 2;
                  break;
                }

                return _context17.abrupt("return");

              case 2:
                data = event.data;

                if (!(!data || _typeof(data) !== 'object')) {
                  _context17.next = 7;
                  break;
                }

                this.logger.warn('Invalid message data');
                this.logger.warnObject(event);
                return _context17.abrupt("return");

              case 7:
                type = data.type, args = data.args;

                if (!(typeof type !== 'string')) {
                  _context17.next = 12;
                  break;
                }

                this.logger.warn('Unknown message type');
                this.logger.warnObject(event);
                return _context17.abrupt("return");

              case 12:
                if (Array.isArray(args)) {
                  _context17.next = 16;
                  break;
                }

                this.logger.warn('Unknown arguments type');
                this.logger.warnObject(event);
                return _context17.abrupt("return");

              case 16:
                port = this.port;
                _context17.t0 = type;
                _context17.next = _context17.t0 === 'unlink' ? 20 : _context17.t0 === 'heartbeat' ? 23 : _context17.t0 === 'jobAdd' ? 25 : _context17.t0 === 'jobDelete' ? 27 : _context17.t0 === 'jobUpdate' ? 29 : _context17.t0 === 'jobsClear' ? 31 : 33;
                break;

              case 20:
                this.logger.warn('Unlinking worker interface');

                if (port instanceof MessagePort) {
                  port.onmessage = null;
                  delete this.port;
                }

                return _context17.abrupt("return");

              case 23:
                this.emit.apply(this, ['heartbeat'].concat(_toConsumableArray(args)));
                return _context17.abrupt("return");

              case 25:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobAdd'].concat(_toConsumableArray(args)));

                return _context17.abrupt("return");

              case 27:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobDelete'].concat(_toConsumableArray(args)));

                return _context17.abrupt("return");

              case 29:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobUpdate'].concat(_toConsumableArray(args)));

                return _context17.abrupt("return");

              case 31:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobsClear'].concat(_toConsumableArray(args)));

                return _context17.abrupt("return");

              case 33:
                return _context17.abrupt("break", 34);

              case 34:
                _args17 = _toArray(args), requestId = _args17[0], requestArgs = _args17.slice(1);

                if (!(typeof requestId !== 'number')) {
                  _context17.next = 37;
                  break;
                }

                throw new Error('Request arguments should start with a requestId number');

              case 37:
                _context17.t1 = type;
                _context17.next = _context17.t1 === 'clear' ? 40 : _context17.t1 === 'abortAndRemoveQueue' ? 52 : _context17.t1 === 'abortQueue' ? 67 : _context17.t1 === 'dequeue' ? 82 : _context17.t1 === 'enableStartOnJob' ? 94 : _context17.t1 === 'disableStartOnJob' ? 96 : _context17.t1 === 'getQueueIds' ? 98 : _context17.t1 === 'idle' ? 111 : 128;
                break;

              case 40:
                _context17.prev = 40;
                _context17.next = 43;
                return this.clear();

              case 43:
                this.emit('clearComplete', requestId);
                _context17.next = 51;
                break;

              case 46:
                _context17.prev = 46;
                _context17.t2 = _context17["catch"](40);
                this.emit('clearError', requestId, _context17.t2);
                this.logger.error('Unable to handle clear message');
                this.emit('error', _context17.t2);

              case 51:
                return _context17.abrupt("break", 129);

              case 52:
                _context17.prev = 52;
                _requestArgs = _slicedToArray(requestArgs, 1), queueId = _requestArgs[0];

                if (!(typeof queueId !== 'string')) {
                  _context17.next = 56;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(queueId), ", should be type string"));

              case 56:
                _context17.next = 58;
                return this.abortAndRemoveQueue(queueId);

              case 58:
                this.emit('abortAndRemoveQueueComplete', requestId);
                _context17.next = 66;
                break;

              case 61:
                _context17.prev = 61;
                _context17.t3 = _context17["catch"](52);
                this.emit('abortAndRemoveQueueError', requestId, _context17.t3);
                this.logger.error('Unable to handle abort and remove queue message');
                this.emit('error', _context17.t3);

              case 66:
                return _context17.abrupt("break", 129);

              case 67:
                _context17.prev = 67;
                _requestArgs2 = _slicedToArray(requestArgs, 1), _queueId2 = _requestArgs2[0];

                if (!(typeof _queueId2 !== 'string')) {
                  _context17.next = 71;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId2), ", should be type string"));

              case 71:
                _context17.next = 73;
                return this.abortQueue(_queueId2);

              case 73:
                this.emit('abortQueueComplete', requestId);
                _context17.next = 81;
                break;

              case 76:
                _context17.prev = 76;
                _context17.t4 = _context17["catch"](67);
                this.emit('abortQueueError', requestId, _context17.t4);
                this.logger.error('Unable to handle abort queue message');
                this.emit('error', _context17.t4);

              case 81:
                return _context17.abrupt("break", 129);

              case 82:
                _context17.prev = 82;
                _context17.next = 85;
                return this.dequeue();

              case 85:
                this.emit('dequeueComplete', requestId);
                _context17.next = 93;
                break;

              case 88:
                _context17.prev = 88;
                _context17.t5 = _context17["catch"](82);
                this.emit('dequeueError', requestId, _context17.t5);
                this.logger.error('Unable to handle dequeue message');
                this.emit('error', _context17.t5);

              case 93:
                return _context17.abrupt("break", 129);

              case 94:
                try {
                  this.enableStartOnJob();
                  this.emit('enableStartOnJobComplete', requestId);
                } catch (error) {
                  this.emit('enableStartOnJobError', requestId, error);
                  this.logger.error('Unable to handle enableStartOnJob message');
                  this.emit('error', error);
                }

                return _context17.abrupt("break", 129);

              case 96:
                try {
                  this.disableStartOnJob();
                  this.emit('disableStartOnJobComplete', requestId);
                } catch (error) {
                  this.emit('disableStartOnJobError', requestId, error);
                  this.logger.error('Unable to handle disableStartOnJob message');
                  this.emit('error', error);
                }

                return _context17.abrupt("break", 129);

              case 98:
                _context17.prev = 98;
                _context17.next = 101;
                return this.getQueueIds();

              case 101:
                queueIds = _context17.sent;
                this.emit('getQueuesComplete', requestId, _toConsumableArray(queueIds));
                _context17.next = 110;
                break;

              case 105:
                _context17.prev = 105;
                _context17.t6 = _context17["catch"](98);
                this.emit('getQueuesError', requestId, _context17.t6);
                this.logger.error('Unable to handle getQueueIds message');
                this.emit('error', _context17.t6);

              case 110:
                return _context17.abrupt("break", 129);

              case 111:
                _context17.prev = 111;
                _requestArgs3 = _slicedToArray(requestArgs, 2), maxDuration = _requestArgs3[0], start = _requestArgs3[1];

                if (!(typeof maxDuration !== 'number')) {
                  _context17.next = 115;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(maxDuration), ", should be type number"));

              case 115:
                if (!(typeof start !== 'number')) {
                  _context17.next = 117;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(start), ", should be type number"));

              case 117:
                _context17.next = 119;
                return this.onIdle(maxDuration - (Date.now() - start));

              case 119:
                this.emit('idleComplete', requestId);
                _context17.next = 127;
                break;

              case 122:
                _context17.prev = 122;
                _context17.t7 = _context17["catch"](111);
                this.emit('idleError', requestId, _context17.t7);
                this.logger.error('Unable to handle idle message');
                this.emit('error', _context17.t7);

              case 127:
                return _context17.abrupt("break", 129);

              case 128:
                this.logger.warn("Unknown worker interface message type ".concat(type));

              case 129:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee16, this, [[40, 46], [52, 61], [67, 76], [82, 88], [98, 105], [111, 122]]);
      }));

      function handlePortMessage(_x20) {
        return _handlePortMessage.apply(this, arguments);
      }

      return handlePortMessage;
    }()
  }, {
    key: "unloadClient",
    value: function () {
      var _unloadClient = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
        var _this8 = this;

        var heartbeatExpiresTimestamp, delay, handleUnload, unloadData;
        return regeneratorRuntime.wrap(function _callee17$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                this.logger.info('Detected client unload');
                heartbeatExpiresTimestamp = this.heartbeatExpiresTimestamp;

                if (!(typeof heartbeatExpiresTimestamp !== 'number')) {
                  _context18.next = 4;
                  break;
                }

                return _context18.abrupt("return");

              case 4:
                clearTimeout(this.heartbeatExpiresTimeout);
                delete this.heartbeatExpiresTimestamp;
                delay = heartbeatExpiresTimestamp - Date.now();

                if (!(delay > 0)) {
                  _context18.next = 10;
                  break;
                }

                _context18.next = 10;
                return new Promise(function (resolve) {
                  var timeout = setTimeout(function () {
                    clearTimeout(timeout);

                    _this8.removeListener('heartbeat', handleHeartbeat);

                    resolve();
                  }, delay);

                  var handleHeartbeat = function handleHeartbeat() {
                    clearTimeout(timeout);

                    _this8.removeListener('heartbeat', handleHeartbeat);

                    resolve();
                  };

                  _this8.addListener('heartbeat', handleHeartbeat);
                });

              case 10:
                if (!(typeof this.heartbeatExpiresTimestamp === 'number')) {
                  _context18.next = 13;
                  break;
                }

                this.logger.info('Cancelling client unload, heartbeat detected');
                return _context18.abrupt("return");

              case 13:
                this.logger.info('Unloading');
                handleUnload = this.handleUnload;

                if (!(typeof handleUnload === 'function')) {
                  _context18.next = 30;
                  break;
                }

                _context18.prev = 16;
                _context18.next = 19;
                return (0, _database.getUnloadDataFromDatabase)();

              case 19:
                unloadData = _context18.sent;
                _context18.next = 22;
                return handleUnload(unloadData);

              case 22:
                _context18.next = 24;
                return (0, _database.clearUnloadDataInDatabase)();

              case 24:
                _context18.next = 30;
                break;

              case 26:
                _context18.prev = 26;
                _context18.t0 = _context18["catch"](16);
                this.logger.error('Error in unload handler');
                this.logger.errorStack(_context18.t0);

              case 30:
                this.emit('unloadClient');
                _context18.next = 33;
                return this.onIdle();

              case 33:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee17, this, [[16, 26]]);
      }));

      function unloadClient() {
        return _unloadClient.apply(this, arguments);
      }

      return unloadClient;
    }()
  }, {
    key: "listenForServiceWorkerInterface",
    value: function listenForServiceWorkerInterface() {
      var _this9 = this;

      var activeEmitCallback;
      var handleJobAdd;
      var handleJobDelete;
      var handleJobUpdate;
      var handleJobsClear;
      self.addEventListener('sync', function (event) {
        _this9.logger.info("SyncManager event ".concat(event.tag).concat(event.lastChance ? ', last chance' : ''));

        if (event.tag === 'syncManagerOnIdle') {
          _this9.logger.info('Starting SyncManager idle handler');

          _this9.emit('syncManagerOnIdle');

          event.waitUntil(_this9.onIdle().catch(function (error) {
            _this9.logger.error("SyncManager event handler failed".concat(event.lastChance ? ' on last chance' : ''));

            _this9.logger.errorStack(error);
          }));
        } else if (event.tag === 'unload') {
          _this9.logger.info('Starting SyncManager unload client handler');

          event.waitUntil(_this9.unloadClient().catch(function (error) {
            _this9.logger.error("SyncManager event handler failed".concat(event.lastChance ? ' on last chance' : ''));

            _this9.logger.errorStack(error);
          }));
        } else {
          _this9.logger.warn("Received unknown SyncManager event tag ".concat(event.tag));
        }
      });
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

        _this9.emitCallbacks = _this9.emitCallbacks.filter(function (x) {
          return x !== activeEmitCallback;
        });
        var previousPort = _this9.port;

        if (previousPort instanceof MessagePort) {
          _this9.logger.info('Closing previous worker interface');

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

        port.onmessage = _this9.handlePortMessage.bind(_this9);

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

        _this9.emitCallbacks.push(emitCallback);

        _this9.port = port;
        port.postMessage({
          type: 'BATTERY_QUEUE_WORKER_CONFIRMATION'
        });

        _this9.logger.info('Linked to worker interface');
      });
      self.addEventListener('messageerror', function (event) {
        _this9.logger.error('Service worker interface message error');

        _this9.logger.errorObject(event);
      });
    }
  }]);

  return BatteryQueue;
}(_events.default);

exports.default = BatteryQueue;
//# sourceMappingURL=queue.js.map