"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CLEANUP_JOB_TYPE = void 0;

var _pQueue = _interopRequireDefault(require("p-queue"));

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

var _database = require("./database");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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

var _CLEANUP_JOB_TYPE = 'CLEANUP_JOB_TYPE';
exports.CLEANUP_JOB_TYPE = _CLEANUP_JOB_TYPE;
var BASE_PRIORITY = Math.floor(Number.MAX_SAFE_INTEGER / 2);
var HIGH_PRIORITY_OFFSET = Math.floor(Number.MAX_SAFE_INTEGER / 8);

var BatteryQueue = /*#__PURE__*/function (_EventEmitter) {
  _inherits(BatteryQueue, _EventEmitter);

  var _super = _createSuper(BatteryQueue);

  function BatteryQueue() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BatteryQueue);

    _this = _super.call(this);
    _this.stopped = false;
    _this.dequeueQueue = new _pQueue.default({
      concurrency: 1
    });
    _this.unloadQueue = new _pQueue.default({
      concurrency: 1
    });
    _this.handlerMap = new Map();
    _this.cleanupMap = new Map();
    _this.durationEstimateHandlerMap = new Map();
    _this.durationEstimateMap = new Map();
    _this.durationEstimateUpdaterMap = new Map();
    _this.retryJobDelayMap = new Map();
    _this.retryCleanupDelayMap = new Map();
    _this.queueCurrentJobTypeMap = new Map();
    _this.queueMap = new Map();
    _this.jobIds = new Set();
    _this.durationEstimateUpdaterMap = new Map();
    _this.abortControllerMap = new Map();
    _this.isClearing = false;
    _this.isUnloading = false;
    _this.ports = new Map();
    _this.logger = options.logger || (0, _logger.default)('Battery Queue');

    _this.addListener('error', function (error) {
      _this.logger.errorStack(error);
    });

    return _this;
  }

  _createClass(BatteryQueue, [{
    key: "abortJob",
    value: function abortJob(queueId, jobId) {
      var queueAbortControllerMap = this.abortControllerMap.get(queueId);

      if (typeof queueAbortControllerMap !== 'undefined') {
        var abortController = queueAbortControllerMap.get(jobId);

        if (typeof abortController !== 'undefined') {
          abortController.abort();
          return true;
        }
      }

      return false;
    }
  }, {
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
        _this2.abortJob(queueId, id);
      };

      _database.jobEmitter.addListener('jobDelete', handleJobDelete);

      this.handleJobDelete = handleJobDelete;

      var handleJobUpdate = function handleJobUpdate(id, queueId, type, status) {
        if (status !== _database.JOB_CLEANUP_AND_REMOVE_STATUS && status !== _database.JOB_CLEANUP_STATUS) {
          return;
        }

        var didAbort = _this2.abortJob(queueId, id);

        if (didAbort) {
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

          var args = job.args,
              prioritize = job.prioritize;

          _this2.startCleanup(id, queueId, args, type, true, prioritize);
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

      var _iterator = _createForOfIteratorHelper(this.ports.keys()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var port = _step.value;
          port.postMessage({
            type: type,
            args: args
          });
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
    key: "setDurationEstimateHandler",
    value: function setDurationEstimateHandler(type, timeEstimationHandler) {
      if (this.durationEstimateHandlerMap.has(type)) {
        throw new Error("Time estimation handler for type \"".concat(type, "\" already exists"));
      }

      this.durationEstimateHandlerMap.set(type, timeEstimationHandler);
    }
  }, {
    key: "removeDurationEstimateHandler",
    value: function removeDurationEstimateHandler(type) {
      if (!this.durationEstimateHandlerMap.has(type)) {
        throw new Error("Time estimation handler for type \"".concat(type, "\" does not exist"));
      }

      this.durationEstimateHandlerMap.delete(type);
    }
  }, {
    key: "addDurationEstimate",
    value: function addDurationEstimate(queueId, jobId, duration, pending) {
      var queueDurationEstimateMap = this.durationEstimateMap.get(queueId);

      if (typeof queueDurationEstimateMap === 'undefined') {
        this.durationEstimateMap.set(queueId, new Map([[jobId, [duration, pending]]]));
        this.emitDurationEstimate(queueId);
        return;
      }

      queueDurationEstimateMap.set(jobId, [duration, pending]);
      this.emitDurationEstimate(queueId);
    }
  }, {
    key: "removeDurationEstimate",
    value: function removeDurationEstimate(queueId, jobId) {
      if (typeof jobId !== 'number') {
        this.durationEstimateMap.delete(queueId);
        this.emitDurationEstimate(queueId);
        return;
      }

      var queueDurationEstimateMap = this.durationEstimateMap.get(queueId);

      if (typeof queueDurationEstimateMap === 'undefined') {
        this.emitDurationEstimate(queueId);
        return;
      }

      queueDurationEstimateMap.delete(jobId);
      this.emitDurationEstimate(queueId);
    }
  }, {
    key: "updateDurationEstimates",
    value: function updateDurationEstimates() {
      var _iterator2 = _createForOfIteratorHelper(this.durationEstimateUpdaterMap.values()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var updateDurationEstimate = _step2.value;
          updateDurationEstimate();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "getDurationEstimate",
    value: function getDurationEstimate(queueId) {
      var queueDurationEstimateMap = this.durationEstimateMap.get(queueId);
      var totalDuration = 0;
      var totalPending = 0;

      if (typeof queueDurationEstimateMap === 'undefined') {
        return [totalDuration, totalPending];
      }

      var _iterator3 = _createForOfIteratorHelper(queueDurationEstimateMap.values()),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              duration = _step3$value[0],
              pending = _step3$value[1];

          totalDuration += duration;
          totalPending += pending;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return [totalDuration, totalPending];
    }
  }, {
    key: "emitDurationEstimate",
    value: function emitDurationEstimate(queueId) {
      var _this$getDurationEsti = this.getDurationEstimate(queueId),
          _this$getDurationEsti2 = _slicedToArray(_this$getDurationEsti, 2),
          totalDuration = _this$getDurationEsti2[0],
          totalPending = _this$getDurationEsti2[1];

      this.emit('queueDuration', queueId, totalDuration, totalPending);
    }
  }, {
    key: "setCurrentJobType",
    value: function setCurrentJobType(queueId, type) {
      if (typeof type === 'string') {
        this.queueCurrentJobTypeMap.set(queueId, type);
      } else {
        this.queueCurrentJobTypeMap.delete(queueId);
      }

      this.emit('queueJobType', queueId, type);
    }
  }, {
    key: "getCurrentJobType",
    value: function getCurrentJobType(queueId) {
      return this.queueCurrentJobTypeMap.get(queueId);
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
    value: function addToQueue(queueId, priority, autoStart, func) {
      var _this3 = this;

      if (this.stopped) {
        return;
      }

      var queue = this.queueMap.get(queueId);

      if (typeof queue !== 'undefined') {
        queue.add(func, {
          priority: priority
        });
        return;
      }

      var newQueue = new _pQueue.default({
        concurrency: 1,
        autoStart: autoStart
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
                _this3.setCurrentJobType(queueId, undefined);

                if (_this3.isClearing) {
                  _context5.next = 4;
                  break;
                }

                _context5.next = 4;
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

              case 4:
                if (!(newQueue.pending > 0 || newQueue.size > 0)) {
                  _context5.next = 6;
                  break;
                }

                return _context5.abrupt("return");

              case 6:
                _this3.queueMap.delete(queueId);

                _this3.emit('queueInactive', queueId);

              case 8:
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
        var queueAbortControllerMap, _iterator4, _step4, abortController, jobs;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.logger.info("Aborting queue ".concat(queueId));
                this.removeDurationEstimate(queueId); // Abort active jobs

                queueAbortControllerMap = this.abortControllerMap.get(queueId);

                if (typeof queueAbortControllerMap !== 'undefined') {
                  _iterator4 = _createForOfIteratorHelper(queueAbortControllerMap.values());

                  try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                      abortController = _step4.value;
                      abortController.abort();
                    }
                  } catch (err) {
                    _iterator4.e(err);
                  } finally {
                    _iterator4.f();
                  }
                } // Changes:
                // * JOB_ERROR_STATUS -> JOB_CLEANUP_STATUS
                // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_STATUS
                // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_PENDING_STATUS -> JOB_ABORTED_STATUS


                _context6.next = 6;
                return (0, _database.markQueueForCleanupInDatabase)(queueId);

              case 6:
                jobs = _context6.sent;
                _context6.next = 9;
                return this.startJobs(jobs);

              case 9:
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
    key: "retryQueue",
    value: function () {
      var _retryQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(queueId) {
        var _this4 = this;

        var lastJobId, priority;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                this.logger.info("Retrying queue ".concat(queueId));
                _context8.next = 3;
                return (0, _database.getGreatestJobIdFromQueueInDatabase)(queueId);

              case 3:
                lastJobId = _context8.sent;
                priority = BASE_PRIORITY - lastJobId - 0.5;
                this.addToQueue(queueId, priority, true, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                  var jobs;
                  return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                      switch (_context7.prev = _context7.next) {
                        case 0:
                          _context7.next = 2;
                          return (0, _database.markQueuePendingInDatabase)(queueId);

                        case 2:
                          jobs = _context7.sent;
                          _context7.next = 5;
                          return _this4.startJobs(jobs);

                        case 5:
                        case "end":
                          return _context7.stop();
                      }
                    }
                  }, _callee7);
                })));

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function retryQueue(_x8) {
        return _retryQueue.apply(this, arguments);
      }

      return retryQueue;
    }()
  }, {
    key: "abortAndRemoveQueue",
    value: function () {
      var _abortAndRemoveQueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(queueId) {
        var queueAbortControllerMap, _iterator5, _step5, abortController, jobs;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                this.logger.info("Aborting and removing queue ".concat(queueId));
                this.removeDurationEstimate(queueId); // Abort active jobs

                queueAbortControllerMap = this.abortControllerMap.get(queueId);

                if (typeof queueAbortControllerMap !== 'undefined') {
                  _iterator5 = _createForOfIteratorHelper(queueAbortControllerMap.values());

                  try {
                    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                      abortController = _step5.value;
                      abortController.abort();
                    }
                  } catch (err) {
                    _iterator5.e(err);
                  } finally {
                    _iterator5.f();
                  }
                } // Changes:
                // * JOB_ERROR_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_CLEANUP_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * Removes other statuses


                _context9.next = 6;
                return (0, _database.markQueueForCleanupAndRemoveInDatabase)(queueId);

              case 6:
                jobs = _context9.sent;
                _context9.next = 9;
                return this.startJobs(jobs);

              case 9:
                this.emit('abortAndRemoveQueue', queueId);

              case 10:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function abortAndRemoveQueue(_x9) {
        return _abortAndRemoveQueue.apply(this, arguments);
      }

      return abortAndRemoveQueue;
    }()
  }, {
    key: "abortAndRemoveQueueJobsGreaterThanId",
    value: function () {
      var _abortAndRemoveQueueJobsGreaterThanId = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(queueId, id) {
        var queueAbortControllerMap, _iterator6, _step6, _step6$value, jobId, abortController, jobs;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                this.logger.info("Aborting and removing jobs with ID greater than ".concat(id, " in queue ").concat(queueId)); // Abort active jobs

                queueAbortControllerMap = this.abortControllerMap.get(queueId);

                if (typeof queueAbortControllerMap !== 'undefined') {
                  _iterator6 = _createForOfIteratorHelper(queueAbortControllerMap);

                  try {
                    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                      _step6$value = _slicedToArray(_step6.value, 2), jobId = _step6$value[0], abortController = _step6$value[1];

                      if (jobId > id) {
                        this.removeDurationEstimate(queueId, jobId);
                        abortController.abort();
                      }
                    }
                  } catch (err) {
                    _iterator6.e(err);
                  } finally {
                    _iterator6.f();
                  }
                } // Changes:
                // * JOB_ERROR_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_COMPLETE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_CLEANUP_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
                // * Removes other statuses


                _context10.next = 5;
                return (0, _database.markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase)(queueId, id);

              case 5:
                jobs = _context10.sent;
                _context10.next = 8;
                return this.startJobs(jobs);

              case 8:
                this.emit('abortAndRemoveQueueJobs', queueId, id);

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function abortAndRemoveQueueJobsGreaterThanId(_x10, _x11) {
        return _abortAndRemoveQueueJobsGreaterThanId.apply(this, arguments);
      }

      return abortAndRemoveQueueJobsGreaterThanId;
    }()
  }, {
    key: "dequeue",
    value: function () {
      var _dequeue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                if (!this.stopped) {
                  _context11.next = 2;
                  break;
                }

                return _context11.abrupt("return");

              case 2:
                if (this.dequeueQueue.size === 0) {
                  // Add a subsequent dequeue
                  this.dequeueQueue.add(this.startJobs.bind(this));
                }

                _context11.next = 5;
                return this.dequeueQueue.onIdle();

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function dequeue() {
        return _dequeue.apply(this, arguments);
      }

      return dequeue;
    }()
  }, {
    key: "startJobs",
    value: function () {
      var _startJobs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(newJobs) {
        var jobs, queueIds, _iterator7, _step7, _step7$value, id, queueId, args, type, status, attempt, startAfter, prioritize, queue, _iterator8, _step8, _queueId, _queue;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!Array.isArray(newJobs)) {
                  _context12.next = 4;
                  break;
                }

                _context12.t0 = newJobs;
                _context12.next = 7;
                break;

              case 4:
                _context12.next = 6;
                return (0, _database.dequeueFromDatabaseNotIn)(_toConsumableArray(this.jobIds.keys()));

              case 6:
                _context12.t0 = _context12.sent;

              case 7:
                jobs = _context12.t0;
                queueIds = new Set();
                _iterator7 = _createForOfIteratorHelper(jobs);
                _context12.prev = 10;

                _iterator7.s();

              case 12:
                if ((_step7 = _iterator7.n()).done) {
                  _context12.next = 36;
                  break;
                }

                _step7$value = _step7.value, id = _step7$value.id, queueId = _step7$value.queueId, args = _step7$value.args, type = _step7$value.type, status = _step7$value.status, attempt = _step7$value.attempt, startAfter = _step7$value.startAfter, prioritize = _step7$value.prioritize;

                if (!this.jobIds.has(id)) {
                  _context12.next = 16;
                  break;
                }

                return _context12.abrupt("continue", 34);

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
                  _context12.next = 21;
                  break;
                }

                this.startJob(id, queueId, args, type, attempt + 1, startAfter, false, prioritize);
                _context12.next = 34;
                break;

              case 21:
                if (!(status === _database.JOB_ERROR_STATUS)) {
                  _context12.next = 25;
                  break;
                }

                this.startErrorHandler(id, queueId, args, type, attempt, startAfter, false, prioritize);
                _context12.next = 34;
                break;

              case 25:
                if (!(status === _database.JOB_CLEANUP_STATUS)) {
                  _context12.next = 29;
                  break;
                }

                this.startCleanup(id, queueId, args, type, false, prioritize);
                _context12.next = 34;
                break;

              case 29:
                if (!(status === _database.JOB_CLEANUP_AND_REMOVE_STATUS)) {
                  _context12.next = 33;
                  break;
                }

                this.startCleanup(id, queueId, args, type, false, prioritize);
                _context12.next = 34;
                break;

              case 33:
                throw new Error("Unknown job status ".concat(status, " in job ").concat(id, " of queue ").concat(queueId));

              case 34:
                _context12.next = 12;
                break;

              case 36:
                _context12.next = 41;
                break;

              case 38:
                _context12.prev = 38;
                _context12.t1 = _context12["catch"](10);

                _iterator7.e(_context12.t1);

              case 41:
                _context12.prev = 41;

                _iterator7.f();

                return _context12.finish(41);

              case 44:
                _iterator8 = _createForOfIteratorHelper(queueIds);

                try {
                  for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                    _queueId = _step8.value;
                    _queue = this.queueMap.get(_queueId);

                    if (typeof _queue !== 'undefined') {
                      _queue.start();
                    } else {
                      this.logger.error("Unable to start queue ".concat(_queueId, " after dequeue; queue does not exist"));
                    }
                  }
                } catch (err) {
                  _iterator8.e(err);
                } finally {
                  _iterator8.f();
                }

              case 46:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[10, 38, 41, 44]]);
      }));

      function startJobs(_x12) {
        return _startJobs.apply(this, arguments);
      }

      return startJobs;
    }()
  }, {
    key: "stop",
    value: function () {
      var _stop = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var _this5 = this;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                if (typeof this.stopPromise === 'undefined') {
                  this.stopped = true;
                  this.stopPromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
                    var idlePromises, _iterator9, _step9, _loop;

                    return regeneratorRuntime.wrap(function _callee13$(_context13) {
                      while (1) {
                        switch (_context13.prev = _context13.next) {
                          case 0:
                            _context13.next = 2;
                            return _this5.dequeueQueue.onIdle();

                          case 2:
                            idlePromises = [];
                            _iterator9 = _createForOfIteratorHelper(_this5.queueMap);

                            try {
                              _loop = function _loop() {
                                var _step9$value = _slicedToArray(_step9.value, 2),
                                    queueId = _step9$value[0],
                                    queue = _step9$value[1];

                                var interval = setInterval(function () {
                                  _this5.logger.info("Waiting on queue ".concat(queueId, " stop() request. Queue ").concat(queue.isPaused ? 'is paused' : 'is not paused', ", with ").concat(queue.pending, " ").concat(queue.pending === 1 ? 'job' : 'jobs', " pending and ").concat(queue.size, " ").concat(queue.size === 1 ? 'job' : 'jobs', " remaining."));
                                }, 250);
                                queue.clear();
                                idlePromises.push(queue.onIdle().finally(function () {
                                  clearInterval(interval);
                                }));
                              };

                              for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                                _loop();
                              }
                            } catch (err) {
                              _iterator9.e(err);
                            } finally {
                              _iterator9.f();
                            }

                            _context13.next = 7;
                            return Promise.all(idlePromises);

                          case 7:
                            _this5.jobIds.clear();

                            _this5.abortControllerMap.clear();

                            delete _this5.stopPromise;

                            _this5.emit('stop');

                            _this5.stopped = false;

                          case 12:
                          case "end":
                            return _context13.stop();
                        }
                      }
                    }, _callee13);
                  }))();
                }

                _context14.next = 3;
                return this.stopPromise;

              case 3:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function stop() {
        return _stop.apply(this, arguments);
      }

      return stop;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(maxDuration) {
        var _this6 = this;

        return regeneratorRuntime.wrap(function _callee16$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                if (typeof this.onIdlePromise === 'undefined') {
                  this.onIdlePromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                    var timeout, start, _iterator10, _step10, _loop2, jobsInterval, jobs, interval;

                    return regeneratorRuntime.wrap(function _callee15$(_context16) {
                      while (1) {
                        switch (_context16.prev = _context16.next) {
                          case 0:
                            timeout = typeof maxDuration === 'number' ? Date.now() + maxDuration : -1;
                            start = Date.now();

                          case 2:
                            if (!true) {
                              _context16.next = 38;
                              break;
                            }

                            if (!(timeout !== -1 && Date.now() > timeout)) {
                              _context16.next = 6;
                              break;
                            }

                            _this6.logger.warn("Idle timeout after ".concat(Date.now() - start, "ms"));

                            return _context16.abrupt("break", 38);

                          case 6:
                            _context16.next = 8;
                            return _this6.dequeueQueue.onIdle();

                          case 8:
                            _iterator10 = _createForOfIteratorHelper(_this6.queueMap);
                            _context16.prev = 9;
                            _loop2 = /*#__PURE__*/regeneratorRuntime.mark(function _loop2() {
                              var _step10$value, queueId, queue, interval;

                              return regeneratorRuntime.wrap(function _loop2$(_context15) {
                                while (1) {
                                  switch (_context15.prev = _context15.next) {
                                    case 0:
                                      _step10$value = _slicedToArray(_step10.value, 2), queueId = _step10$value[0], queue = _step10$value[1];
                                      interval = setInterval(function () {
                                        _this6.logger.info("Waiting on queue ".concat(queueId, " onIdle() request. Queue ").concat(queue.isPaused ? 'is paused' : 'is not paused', ", with ").concat(queue.pending, " ").concat(queue.pending === 1 ? 'job' : 'jobs', " pending and ").concat(queue.size, " ").concat(queue.size === 1 ? 'job' : 'jobs', " remaining."));
                                      }, 250);
                                      _context15.next = 4;
                                      return queue.onIdle();

                                    case 4:
                                      clearInterval(interval);

                                    case 5:
                                    case "end":
                                      return _context15.stop();
                                  }
                                }
                              }, _loop2);
                            });

                            _iterator10.s();

                          case 12:
                            if ((_step10 = _iterator10.n()).done) {
                              _context16.next = 16;
                              break;
                            }

                            return _context16.delegateYield(_loop2(), "t0", 14);

                          case 14:
                            _context16.next = 12;
                            break;

                          case 16:
                            _context16.next = 21;
                            break;

                          case 18:
                            _context16.prev = 18;
                            _context16.t1 = _context16["catch"](9);

                            _iterator10.e(_context16.t1);

                          case 21:
                            _context16.prev = 21;

                            _iterator10.f();

                            return _context16.finish(21);

                          case 24:
                            jobsInterval = setInterval(function () {
                              _this6.logger.info('Waiting on jobs');
                            }, 250);
                            _context16.next = 27;
                            return (0, _database.dequeueFromDatabase)();

                          case 27:
                            jobs = _context16.sent;
                            clearInterval(jobsInterval);

                            if (!(jobs.length > 0)) {
                              _context16.next = 35;
                              break;
                            }

                            interval = setInterval(function () {
                              _this6.logger.info('Waiting on dequeue');
                            }, 250);
                            _context16.next = 33;
                            return _this6.dequeue();

                          case 33:
                            clearInterval(interval);
                            return _context16.abrupt("continue", 2);

                          case 35:
                            return _context16.abrupt("break", 38);

                          case 38:
                            delete _this6.onIdlePromise;

                            _this6.emit('idle');

                          case 40:
                          case "end":
                            return _context16.stop();
                        }
                      }
                    }, _callee15, null, [[9, 18, 21, 24]]);
                  }))();
                }

                _context17.next = 3;
                return this.onIdlePromise;

              case 3:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee16, this);
      }));

      function onIdle(_x13) {
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
      var _runCleanup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(id, queueId, args, type) {
        var cleanup, cleanupJob, _ref5, data, startAfter, delay, attempt, retryCleanupDelay, newStartAfter;

        return regeneratorRuntime.wrap(function _callee17$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                this.emit('cleanupStart', {
                  id: id
                });
                cleanup = this.cleanupMap.get(type);

                if (!(typeof cleanup !== 'function')) {
                  _context18.next = 8;
                  break;
                }

                this.logger.warn("No cleanup for job type ".concat(type));
                _context18.next = 6;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 6:
                this.emit('cleanup', {
                  id: id
                });
                return _context18.abrupt("return");

              case 8:
                _context18.next = 10;
                return (0, _database.getCleanupFromDatabase)(id);

              case 10:
                cleanupJob = _context18.sent;
                _ref5 = typeof cleanupJob === 'undefined' ? {
                  data: undefined,
                  startAfter: 0
                } : cleanupJob, data = _ref5.data, startAfter = _ref5.startAfter;
                delay = startAfter - Date.now();

                if (!(delay > 0)) {
                  _context18.next = 17;
                  break;
                }

                this.logger.info("Delaying retry of ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " by ").concat(delay, "ms to ").concat(new Date(startAfter).toLocaleString()));
                _context18.next = 17;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, delay);
                });

              case 17:
                _context18.prev = 17;
                _context18.next = 20;
                return cleanup(data, args, function (path) {
                  return (0, _database.removePathFromCleanupDataInDatabase)(id, path);
                });

              case 20:
                _context18.next = 54;
                break;

              case 22:
                _context18.prev = 22;
                _context18.t0 = _context18["catch"](17);
                _context18.next = 26;
                return (0, _database.incrementCleanupAttemptInDatabase)(id, queueId);

              case 26:
                attempt = _context18.sent;

                if (!(_context18.t0.name === 'FatalError')) {
                  _context18.next = 34;
                  break;
                }

                this.logger.error("Fatal error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt));
                this.emit('error', _context18.t0);
                _context18.next = 32;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 32:
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context18.abrupt("return");

              case 34:
                _context18.next = 36;
                return this.getRetryCleanupDelay(type, attempt, _context18.t0);

              case 36:
                retryCleanupDelay = _context18.sent;

                if (!(retryCleanupDelay === false)) {
                  _context18.next = 44;
                  break;
                }

                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));
                this.emit('error', _context18.t0);
                _context18.next = 42;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 42:
                this.emit('fatalCleanupError', {
                  id: id,
                  queueId: queueId
                });
                return _context18.abrupt("return");

              case 44:
                this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryCleanupDelay > 0 ? "in ".concat(retryCleanupDelay, "ms") : 'immediately'));
                this.emit('error', _context18.t0);

                if (!(retryCleanupDelay > 0)) {
                  _context18.next = 51;
                  break;
                }

                this.emit('retryCleanupDelay', {
                  id: id,
                  queueId: queueId,
                  retryCleanupDelay: retryCleanupDelay
                });
                newStartAfter = Date.now() + retryCleanupDelay;
                _context18.next = 51;
                return (0, _database.markCleanupStartAfterInDatabase)(id, newStartAfter);

              case 51:
                _context18.next = 53;
                return this.runCleanup(id, queueId, args, type);

              case 53:
                return _context18.abrupt("return");

              case 54:
                _context18.next = 56;
                return (0, _database.removeCleanupFromDatabase)(id);

              case 56:
                this.emit('cleanup', {
                  id: id
                });

              case 57:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee17, this, [[17, 22]]);
      }));

      function runCleanup(_x14, _x15, _x16, _x17) {
        return _runCleanup.apply(this, arguments);
      }

      return runCleanup;
    }()
  }, {
    key: "startCleanup",
    value: function startCleanup(id, queueId, args, type, autoStart, prioritize) {
      var _this7 = this;

      this.logger.info("Adding ".concat(type, " cleanup job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      this.removeDurationEstimate(queueId, id);
      var priority = BASE_PRIORITY + id - (prioritize ? HIGH_PRIORITY_OFFSET : 0);

      var run = /*#__PURE__*/function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
          return regeneratorRuntime.wrap(function _callee18$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  _this7.setCurrentJobType(queueId, _CLEANUP_JOB_TYPE);

                  _this7.logger.info("Starting ".concat(type, " cleanup #").concat(id, " in queue ").concat(queueId));

                  _context19.next = 4;
                  return _this7.runCleanup(id, queueId, args, type);

                case 4:
                  _context19.next = 6;
                  return (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                case 6:
                  _this7.jobIds.delete(id);

                  _this7.logger.info("Completed ".concat(type, " cleanup #").concat(id, " in queue ").concat(queueId));

                case 8:
                case "end":
                  return _context19.stop();
              }
            }
          }, _callee18);
        }));

        return function run() {
          return _ref6.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, autoStart, run);
    }
  }, {
    key: "startErrorHandler",
    value: function startErrorHandler(id, queueId, args, type, attempt, startAfter, autoStart, prioritize) {
      var _this8 = this;

      this.logger.info("Adding ".concat(type, " error handler job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = BASE_PRIORITY + id - (prioritize ? HIGH_PRIORITY_OFFSET : 0);
      var abortController = this.getAbortController(id, queueId);

      var run = /*#__PURE__*/function () {
        var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
          return regeneratorRuntime.wrap(function _callee19$(_context20) {
            while (1) {
              switch (_context20.prev = _context20.next) {
                case 0:
                  _this8.setCurrentJobType(queueId, _CLEANUP_JOB_TYPE);

                  _this8.logger.info("Starting ".concat(type, " error handler #").concat(id, " in queue ").concat(queueId));

                  _context20.next = 4;
                  return _this8.runCleanup(id, queueId, args, type);

                case 4:
                  if (!abortController.signal.aborted) {
                    _context20.next = 11;
                    break;
                  }

                  _context20.next = 7;
                  return (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                case 7:
                  _this8.removeAbortController(id, queueId);

                  _this8.jobIds.delete(id);

                  _context20.next = 16;
                  break;

                case 11:
                  _context20.next = 13;
                  return (0, _database.markJobPendingInDatabase)(id);

                case 13:
                  _this8.logger.info("Retrying ".concat(type, " job #").concat(id, " in queue ").concat(queueId));

                  _this8.emit('retry', {
                    id: id
                  });

                  _this8.startJob(id, queueId, args, type, attempt + 1, startAfter, true, prioritize);

                case 16:
                  _this8.logger.info("Completed ".concat(type, " error handler #").concat(id, " in queue ").concat(queueId));

                case 17:
                case "end":
                  return _context20.stop();
              }
            }
          }, _callee19);
        }));

        return function run() {
          return _ref7.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, autoStart, run);
    }
  }, {
    key: "delayJobStart",
    value: function () {
      var _delayJobStart = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(id, queueId, type, signal, startAfter) {
        var duration;
        return regeneratorRuntime.wrap(function _callee20$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                if (!signal.aborted) {
                  _context21.next = 2;
                  break;
                }

                throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));

              case 2:
                duration = startAfter - Date.now();

                if (!(duration > 0)) {
                  _context21.next = 7;
                  break;
                }

                this.logger.info("Delaying start of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(duration, "ms"));
                _context21.next = 7;
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
                return _context21.stop();
            }
          }
        }, _callee20, this);
      }));

      function delayJobStart(_x18, _x19, _x20, _x21, _x22) {
        return _delayJobStart.apply(this, arguments);
      }

      return delayJobStart;
    }()
  }, {
    key: "startJob",
    value: function startJob(id, queueId, args, type, attempt, startAfter, autoStart, prioritize) {
      var _this9 = this;

      this.logger.info("Adding ".concat(type, " job #").concat(id, " to queue ").concat(queueId));
      this.jobIds.add(id);
      var priority = BASE_PRIORITY - id + (prioritize ? HIGH_PRIORITY_OFFSET : 0);

      var updateCleanupData = function updateCleanupData(data) {
        return (0, _database.updateCleanupValuesInDatabase)(id, queueId, data);
      };

      var updateDuration = function updateDuration(duration, pending) {
        _this9.addDurationEstimate(queueId, id, duration, pending);
      };

      var updateDurationEstimate = function updateDurationEstimate() {
        var durationEstimateHandler = _this9.durationEstimateHandlerMap.get(type);

        if (typeof durationEstimateHandler === 'function') {
          try {
            var durationEstimate = durationEstimateHandler(args);

            _this9.addDurationEstimate(queueId, id, durationEstimate, durationEstimate);

            return durationEstimate;
          } catch (error) {
            _this9.logger.error("Unable to estimate duration of ".concat(type, " job #").concat(id, " in queue ").concat(queueId));

            _this9.logger.errorStack(error);
          }
        }

        return 0;
      };

      updateDurationEstimate();
      this.durationEstimateUpdaterMap.set(id, updateDurationEstimate);
      var abortController = this.getAbortController(id, queueId);

      var run = /*#__PURE__*/function () {
        var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
          var start, durationEstimate, handler, handlerDidRun, shouldKeepJobInDatabase, duration, estimatedToActualRatio, retryDelay, newStartAfter;
          return regeneratorRuntime.wrap(function _callee21$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  start = Date.now();
                  durationEstimate = updateDurationEstimate();

                  _this9.durationEstimateUpdaterMap.delete(id);

                  if (!abortController.signal.aborted) {
                    _context22.next = 9;
                    break;
                  }

                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: new _errors.AbortError("Queue ".concat(queueId, " was aborted"))
                  });

                  _this9.removeAbortController(id, queueId);

                  _this9.jobIds.delete(id);

                  _this9.removeDurationEstimate(queueId, id);

                  return _context22.abrupt("return");

                case 9:
                  handler = _this9.handlerMap.get(type);

                  if (!(typeof handler !== 'function')) {
                    _context22.next = 18;
                    break;
                  }

                  _this9.logger.warn("No handler for job type ".concat(type));

                  _context22.next = 14;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 14:
                  _this9.removeAbortController(id, queueId);

                  _this9.jobIds.delete(id);

                  _this9.addDurationEstimate(queueId, id, Date.now() - start, 0);

                  return _context22.abrupt("return");

                case 18:
                  _this9.setCurrentJobType(queueId, type);

                  handlerDidRun = false;
                  _context22.prev = 20;
                  _context22.next = 23;
                  return (0, _database.markJobErrorInDatabase)(id);

                case 23:
                  _context22.next = 25;
                  return _this9.delayJobStart(id, queueId, type, abortController.signal, startAfter);

                case 25:
                  _this9.logger.info("Starting ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  handlerDidRun = true;
                  _context22.next = 29;
                  return handler(args, abortController.signal, updateCleanupData, updateDuration);

                case 29:
                  shouldKeepJobInDatabase = _context22.sent;

                  if (!abortController.signal.aborted) {
                    _context22.next = 32;
                    break;
                  }

                  throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));

                case 32:
                  if (!(shouldKeepJobInDatabase === false)) {
                    _context22.next = 37;
                    break;
                  }

                  _context22.next = 35;
                  return (0, _database.markJobCompleteThenRemoveFromDatabase)(id);

                case 35:
                  _context22.next = 39;
                  break;

                case 37:
                  _context22.next = 39;
                  return (0, _database.markJobCompleteInDatabase)(id);

                case 39:
                  _this9.removeAbortController(id, queueId);

                  _this9.jobIds.delete(id);

                  duration = Date.now() - start;

                  if (typeof durationEstimate === 'number') {
                    estimatedToActualRatio = durationEstimate / duration;

                    if (duration > 250 && (estimatedToActualRatio < 0.8 || estimatedToActualRatio > 1.25)) {
                      _this9.logger.warn("Duration estimate of ".concat(type, " job #").concat(id, " (").concat(durationEstimate, "ms) was ").concat(Math.round(100 * estimatedToActualRatio), "% of actual value (").concat(duration, "ms)"));
                    }
                  }

                  _this9.addDurationEstimate(queueId, id, duration, 0);

                  _this9.logger.info("Completed ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, " in ").concat(duration, "ms"));

                  return _context22.abrupt("return");

                case 48:
                  _context22.prev = 48;
                  _context22.t0 = _context22["catch"](20);

                  if (!(_context22.t0.name === 'JobDoesNotExistError')) {
                    _context22.next = 66;
                    break;
                  }

                  _this9.logger.error("Job does not exist error for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  if (!handlerDidRun) {
                    _context22.next = 61;
                    break;
                  }

                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context22.t0
                  });

                  _context22.next = 56;
                  return (0, _database.restoreJobToDatabaseForCleanupAndRemove)(id, queueId, type, args, {
                    prioritize: prioritize
                  });

                case 56:
                  _this9.jobIds.delete(id);

                  _this9.removeAbortController(id, queueId);

                  _this9.startCleanup(id, queueId, args, type, true, prioritize);

                  _context22.next = 65;
                  break;

                case 61:
                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context22.t0
                  });

                  _this9.jobIds.delete(id);

                  _this9.removeAbortController(id, queueId);

                  _this9.removeDurationEstimate(queueId, id);

                case 65:
                  return _context22.abrupt("return");

                case 66:
                  if (!abortController.signal.aborted) {
                    _context22.next = 82;
                    break;
                  }

                  if (_context22.t0.name !== 'AbortError') {
                    _this9.logger.error("Abort signal following error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                    _this9.emit('error', _context22.t0);
                  } else {
                    _this9.logger.warn("Received abort signal for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));
                  }

                  if (!handlerDidRun) {
                    _context22.next = 75;
                    break;
                  }

                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context22.t0
                  });

                  _this9.jobIds.delete(id);

                  _this9.removeAbortController(id, queueId);

                  _this9.startCleanup(id, queueId, args, type, true, prioritize);

                  _context22.next = 81;
                  break;

                case 75:
                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context22.t0
                  });

                  _context22.next = 78;
                  return (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                case 78:
                  _this9.jobIds.delete(id);

                  _this9.removeAbortController(id, queueId);

                  _this9.removeDurationEstimate(queueId, id);

                case 81:
                  return _context22.abrupt("return");

                case 82:
                  _context22.next = 84;
                  return (0, _database.incrementJobAttemptInDatabase)(id);

                case 84:
                  if (!(_context22.t0.name === 'FatalError')) {
                    _context22.next = 93;
                    break;
                  }

                  _this9.logger.error("Fatal error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                  _this9.emit('error', _context22.t0);

                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context22.t0
                  });

                  _this9.jobIds.delete(id);

                  _this9.removeAbortController(id, queueId);

                  _context22.next = 92;
                  return _this9.abortQueue(queueId);

                case 92:
                  return _context22.abrupt("return");

                case 93:
                  _context22.next = 95;
                  return _this9.getRetryJobDelay(type, attempt, _context22.t0);

                case 95:
                  retryDelay = _context22.sent;

                  if (!(retryDelay === false)) {
                    _context22.next = 105;
                    break;
                  }

                  _this9.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));

                  _this9.emit('error', _context22.t0);

                  _this9.emit('fatalError', {
                    id: id,
                    queueId: queueId,
                    error: _context22.t0
                  });

                  _this9.jobIds.delete(id);

                  _this9.removeAbortController(id, queueId);

                  _context22.next = 104;
                  return _this9.abortQueue(queueId);

                case 104:
                  return _context22.abrupt("return");

                case 105:
                  _this9.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryDelay > 0 ? "in ".concat(retryDelay, "ms") : 'immediately'));

                  _this9.emit('error', _context22.t0);

                  if (!(retryDelay > 0)) {
                    _context22.next = 116;
                    break;
                  }

                  _this9.emit('retryDelay', {
                    id: id,
                    queueId: queueId,
                    retryDelay: retryDelay
                  });

                  newStartAfter = Date.now() + retryDelay;
                  _context22.next = 112;
                  return (0, _database.markJobStartAfterInDatabase)(id, newStartAfter);

                case 112:
                  _this9.jobIds.delete(id);

                  _this9.startErrorHandler(id, queueId, args, type, attempt, newStartAfter, true, prioritize);

                  _context22.next = 118;
                  break;

                case 116:
                  _this9.jobIds.delete(id);

                  _this9.startErrorHandler(id, queueId, args, type, attempt, startAfter, true, prioritize);

                case 118:
                case "end":
                  return _context22.stop();
              }
            }
          }, _callee21, null, [[20, 48]]);
        }));

        return function run() {
          return _ref8.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, autoStart, run);
      this.emit('dequeue', {
        id: id
      });
    }
  }, {
    key: "handlePortMessage",
    value: function () {
      var _handlePortMessage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(port, event) {
        var _this10 = this;

        var portHandlers, data, type, args, emit, _get3, _args23, interval, _args25, requestId, requestArgs, _requestArgs, queueId, id, _requestArgs2, _queueId2, _requestArgs3, _queueId3, _requestArgs4, _queueId4, queueIds, _requestArgs5, _queueId5, values, _requestArgs6, _queueId6, currentJobType, _requestArgs7, maxDuration, start;

        return regeneratorRuntime.wrap(function _callee23$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                if (event instanceof MessageEvent) {
                  _context24.next = 2;
                  break;
                }

                return _context24.abrupt("return");

              case 2:
                portHandlers = this.ports.get(port);

                if (!(_typeof(portHandlers) !== 'object')) {
                  _context24.next = 7;
                  break;
                }

                this.logger.warn('Port handlers do not exist');
                this.logger.warnObject(event);
                return _context24.abrupt("return");

              case 7:
                data = event.data;

                if (!(!data || _typeof(data) !== 'object')) {
                  _context24.next = 12;
                  break;
                }

                this.logger.warn('Invalid message data');
                this.logger.warnObject(event);
                return _context24.abrupt("return");

              case 12:
                type = data.type, args = data.args;

                if (!(typeof type !== 'string')) {
                  _context24.next = 17;
                  break;
                }

                this.logger.warn('Unknown message type');
                this.logger.warnObject(event);
                return _context24.abrupt("return");

              case 17:
                if (Array.isArray(args)) {
                  _context24.next = 21;
                  break;
                }

                this.logger.warn('Unknown arguments type');
                this.logger.warnObject(event);
                return _context24.abrupt("return");

              case 21:
                emit = function emit(t) {
                  for (var _len2 = arguments.length, messageArgs = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    messageArgs[_key2 - 1] = arguments[_key2];
                  }

                  port.postMessage({
                    type: t,
                    args: messageArgs
                  });
                };

                _context24.t0 = type;
                _context24.next = _context24.t0 === 'heartbeat' ? 25 : _context24.t0 === 'jobAdd' ? 41 : _context24.t0 === 'jobDelete' ? 43 : _context24.t0 === 'jobUpdate' ? 45 : _context24.t0 === 'jobsClear' ? 47 : 49;
                break;

              case 25:
                _context24.prev = 25;
                _args23 = _slicedToArray(args, 1), interval = _args23[0];

                if (!(typeof interval !== 'number')) {
                  _context24.next = 29;
                  break;
                }

                throw new Error("Invalid \"interval\" argument with type ".concat(_typeof(interval), ", should be type number"));

              case 29:
                clearTimeout(portHandlers.heartbeatExpiresTimeout);
                this.heartbeatExpiresTimestamp = Date.now() + Math.round(interval * 2.5);
                portHandlers.heartbeatExpiresTimeout = setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
                  return regeneratorRuntime.wrap(function _callee22$(_context23) {
                    while (1) {
                      switch (_context23.prev = _context23.next) {
                        case 0:
                          _this10.logger.warn("Heartbeat timeout after ".concat(Math.round(interval * 2.1), "ms"));

                          _context23.next = 3;
                          return _this10.unloadClient();

                        case 3:
                          _this10.removePort(port);

                        case 4:
                        case "end":
                          return _context23.stop();
                      }
                    }
                  }, _callee22);
                })), Math.round(interval * 2.1));
                emit.apply(void 0, ['heartbeat'].concat(_toConsumableArray(args)));

                (_get3 = _get(_getPrototypeOf(BatteryQueue.prototype), "emit", this)).call.apply(_get3, [this, 'heartbeat'].concat(_toConsumableArray(args)));

                _context24.next = 40;
                break;

              case 36:
                _context24.prev = 36;
                _context24.t1 = _context24["catch"](25);
                this.logger.error('Heartbeat error');
                this.logger.errorStack(_context24.t1);

              case 40:
                return _context24.abrupt("return");

              case 41:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobAdd'].concat(_toConsumableArray(args)));

                return _context24.abrupt("return");

              case 43:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobDelete'].concat(_toConsumableArray(args)));

                return _context24.abrupt("return");

              case 45:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobUpdate'].concat(_toConsumableArray(args)));

                return _context24.abrupt("return");

              case 47:
                _database.jobEmitter.emit.apply(_database.jobEmitter, ['jobsClear'].concat(_toConsumableArray(args)));

                return _context24.abrupt("return");

              case 49:
                return _context24.abrupt("break", 50);

              case 50:
                _args25 = _toArray(args), requestId = _args25[0], requestArgs = _args25.slice(1);

                if (!(typeof requestId !== 'number')) {
                  _context24.next = 53;
                  break;
                }

                throw new Error('Request arguments should start with a requestId number');

              case 53:
                _context24.t2 = type;
                _context24.next = _context24.t2 === 'unlink' ? 56 : _context24.t2 === 'clear' ? 71 : _context24.t2 === 'abortAndRemoveQueueJobsGreaterThanId' ? 83 : _context24.t2 === 'abortAndRemoveQueue' ? 100 : _context24.t2 === 'updateDurationEstimates' ? 115 : _context24.t2 === 'abortQueue' ? 127 : _context24.t2 === 'retryQueue' ? 142 : _context24.t2 === 'dequeue' ? 157 : _context24.t2 === 'enableStartOnJob' ? 169 : _context24.t2 === 'disableStartOnJob' ? 171 : _context24.t2 === 'getQueueIds' ? 173 : _context24.t2 === 'getDurationEstimate' ? 186 : _context24.t2 === 'getCurrentJobType' ? 202 : _context24.t2 === 'runUnloadHandlers' ? 216 : _context24.t2 === 'idle' ? 228 : 245;
                break;

              case 56:
                this.logger.warn('Unlinking worker interface');
                _context24.prev = 57;

                if (!(this.ports.size === 1)) {
                  _context24.next = 61;
                  break;
                }

                _context24.next = 61;
                return this.stop();

              case 61:
                emit('unlinkComplete', requestId);
                this.removePort(port);
                _context24.next = 70;
                break;

              case 65:
                _context24.prev = 65;
                _context24.t3 = _context24["catch"](57);
                emit('unlinkError', requestId, _context24.t3);
                this.logger.error('Unable to handle unlink message');
                this.emit('error', _context24.t3);

              case 70:
                return _context24.abrupt("break", 246);

              case 71:
                _context24.prev = 71;
                _context24.next = 74;
                return this.clear();

              case 74:
                emit('clearComplete', requestId);
                _context24.next = 82;
                break;

              case 77:
                _context24.prev = 77;
                _context24.t4 = _context24["catch"](71);
                emit('clearError', requestId, _context24.t4);
                this.logger.error('Unable to handle clear message');
                this.emit('error', _context24.t4);

              case 82:
                return _context24.abrupt("break", 246);

              case 83:
                _context24.prev = 83;
                _requestArgs = _slicedToArray(requestArgs, 2), queueId = _requestArgs[0], id = _requestArgs[1];

                if (!(typeof queueId !== 'string')) {
                  _context24.next = 87;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(queueId), ", should be type string"));

              case 87:
                if (!(typeof id !== 'number')) {
                  _context24.next = 89;
                  break;
                }

                throw new Error("Invalid \"id\" argument with type ".concat(_typeof(id), ", should be type number"));

              case 89:
                _context24.next = 91;
                return this.abortAndRemoveQueueJobsGreaterThanId(queueId, id);

              case 91:
                emit('abortAndRemoveQueueJobsGreaterThanIdComplete', requestId);
                _context24.next = 99;
                break;

              case 94:
                _context24.prev = 94;
                _context24.t5 = _context24["catch"](83);
                emit('abortAndRemoveQueueJobsGreaterThanIdError', requestId, _context24.t5);
                this.logger.error('Unable to handle abort and remove queue jobs greater than ID message');
                this.emit('error', _context24.t5);

              case 99:
                return _context24.abrupt("break", 246);

              case 100:
                _context24.prev = 100;
                _requestArgs2 = _slicedToArray(requestArgs, 1), _queueId2 = _requestArgs2[0];

                if (!(typeof _queueId2 !== 'string')) {
                  _context24.next = 104;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId2), ", should be type string"));

              case 104:
                _context24.next = 106;
                return this.abortAndRemoveQueue(_queueId2);

              case 106:
                emit('abortAndRemoveQueueComplete', requestId);
                _context24.next = 114;
                break;

              case 109:
                _context24.prev = 109;
                _context24.t6 = _context24["catch"](100);
                emit('abortAndRemoveQueueError', requestId, _context24.t6);
                this.logger.error('Unable to handle abort and remove queue message');
                this.emit('error', _context24.t6);

              case 114:
                return _context24.abrupt("break", 246);

              case 115:
                _context24.prev = 115;
                _context24.next = 118;
                return this.updateDurationEstimates();

              case 118:
                emit('updateDurationEstimatesComplete', requestId);
                _context24.next = 126;
                break;

              case 121:
                _context24.prev = 121;
                _context24.t7 = _context24["catch"](115);
                emit('updateDurationEstimatesError', requestId, _context24.t7);
                this.logger.error('Unable to handle update duration estimates message');
                this.emit('error', _context24.t7);

              case 126:
                return _context24.abrupt("break", 246);

              case 127:
                _context24.prev = 127;
                _requestArgs3 = _slicedToArray(requestArgs, 1), _queueId3 = _requestArgs3[0];

                if (!(typeof _queueId3 !== 'string')) {
                  _context24.next = 131;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId3), ", should be type string"));

              case 131:
                _context24.next = 133;
                return this.abortQueue(_queueId3);

              case 133:
                emit('abortQueueComplete', requestId);
                _context24.next = 141;
                break;

              case 136:
                _context24.prev = 136;
                _context24.t8 = _context24["catch"](127);
                emit('abortQueueError', requestId, _context24.t8);
                this.logger.error('Unable to handle abort queue message');
                this.emit('error', _context24.t8);

              case 141:
                return _context24.abrupt("break", 246);

              case 142:
                _context24.prev = 142;
                _requestArgs4 = _slicedToArray(requestArgs, 1), _queueId4 = _requestArgs4[0];

                if (!(typeof _queueId4 !== 'string')) {
                  _context24.next = 146;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId4), ", should be type string"));

              case 146:
                _context24.next = 148;
                return this.retryQueue(_queueId4);

              case 148:
                emit('retryQueueComplete', requestId);
                _context24.next = 156;
                break;

              case 151:
                _context24.prev = 151;
                _context24.t9 = _context24["catch"](142);
                emit('retryQueueError', requestId, _context24.t9);
                this.logger.error('Unable to handle retry queue message');
                this.emit('error', _context24.t9);

              case 156:
                return _context24.abrupt("break", 246);

              case 157:
                _context24.prev = 157;
                _context24.next = 160;
                return this.dequeue();

              case 160:
                emit('dequeueComplete', requestId);
                _context24.next = 168;
                break;

              case 163:
                _context24.prev = 163;
                _context24.t10 = _context24["catch"](157);
                emit('dequeueError', requestId, _context24.t10);
                this.logger.error('Unable to handle dequeue message');
                this.emit('error', _context24.t10);

              case 168:
                return _context24.abrupt("break", 246);

              case 169:
                try {
                  this.enableStartOnJob();
                  emit('enableStartOnJobComplete', requestId);
                } catch (error) {
                  emit('enableStartOnJobError', requestId, error);
                  this.logger.error('Unable to handle enableStartOnJob message');
                  this.emit('error', error);
                }

                return _context24.abrupt("break", 246);

              case 171:
                try {
                  this.disableStartOnJob();
                  emit('disableStartOnJobComplete', requestId);
                } catch (error) {
                  emit('disableStartOnJobError', requestId, error);
                  this.logger.error('Unable to handle disableStartOnJob message');
                  this.emit('error', error);
                }

                return _context24.abrupt("break", 246);

              case 173:
                _context24.prev = 173;
                _context24.next = 176;
                return this.getQueueIds();

              case 176:
                queueIds = _context24.sent;
                emit('getQueuesComplete', requestId, _toConsumableArray(queueIds));
                _context24.next = 185;
                break;

              case 180:
                _context24.prev = 180;
                _context24.t11 = _context24["catch"](173);
                emit('getQueuesError', requestId, _context24.t11);
                this.logger.error('Unable to handle getQueueIds message');
                this.emit('error', _context24.t11);

              case 185:
                return _context24.abrupt("break", 246);

              case 186:
                _context24.prev = 186;
                _requestArgs5 = _slicedToArray(requestArgs, 1), _queueId5 = _requestArgs5[0];

                if (!(typeof _queueId5 !== 'string')) {
                  _context24.next = 190;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId5), ", should be type string"));

              case 190:
                _context24.next = 192;
                return this.getDurationEstimate(_queueId5);

              case 192:
                values = _context24.sent;
                emit('getDurationEstimateComplete', requestId, values);
                _context24.next = 201;
                break;

              case 196:
                _context24.prev = 196;
                _context24.t12 = _context24["catch"](186);
                emit('getDurationEstimateError', requestId, _context24.t12);
                this.logger.error('Unable to handle get duration estimate message');
                this.emit('error', _context24.t12);

              case 201:
                return _context24.abrupt("break", 246);

              case 202:
                _context24.prev = 202;
                _requestArgs6 = _slicedToArray(requestArgs, 1), _queueId6 = _requestArgs6[0];

                if (!(typeof _queueId6 !== 'string')) {
                  _context24.next = 206;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId6), ", should be type string"));

              case 206:
                currentJobType = this.getCurrentJobType(_queueId6);
                emit('getCurrentJobTypeComplete', requestId, currentJobType);
                _context24.next = 215;
                break;

              case 210:
                _context24.prev = 210;
                _context24.t13 = _context24["catch"](202);
                emit('getCurrentJobTypeError', requestId, _context24.t13);
                this.logger.error('Unable to handle get current job type message');
                this.emit('error', _context24.t13);

              case 215:
                return _context24.abrupt("break", 246);

              case 216:
                _context24.prev = 216;
                _context24.next = 219;
                return this.runUnloadHandlers();

              case 219:
                emit('runUnloadHandlersComplete', requestId);
                _context24.next = 227;
                break;

              case 222:
                _context24.prev = 222;
                _context24.t14 = _context24["catch"](216);
                emit('runUnloadHandlersError', requestId, _context24.t14);
                this.logger.error('Unable to run unload handlers message');
                this.emit('error', _context24.t14);

              case 227:
                return _context24.abrupt("break", 246);

              case 228:
                _context24.prev = 228;
                _requestArgs7 = _slicedToArray(requestArgs, 2), maxDuration = _requestArgs7[0], start = _requestArgs7[1];

                if (!(typeof maxDuration !== 'number')) {
                  _context24.next = 232;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(maxDuration), ", should be type number"));

              case 232:
                if (!(typeof start !== 'number')) {
                  _context24.next = 234;
                  break;
                }

                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(start), ", should be type number"));

              case 234:
                _context24.next = 236;
                return this.onIdle(maxDuration - (Date.now() - start));

              case 236:
                emit('idleComplete', requestId);
                _context24.next = 244;
                break;

              case 239:
                _context24.prev = 239;
                _context24.t15 = _context24["catch"](228);
                emit('idleError', requestId, _context24.t15);
                this.logger.error('Unable to handle idle message');
                this.emit('error', _context24.t15);

              case 244:
                return _context24.abrupt("break", 246);

              case 245:
                this.logger.warn("Unknown worker interface message type ".concat(type));

              case 246:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee23, this, [[25, 36], [57, 65], [71, 77], [83, 94], [100, 109], [115, 121], [127, 136], [142, 151], [157, 163], [173, 180], [186, 196], [202, 210], [216, 222], [228, 239]]);
      }));

      function handlePortMessage(_x23, _x24) {
        return _handlePortMessage.apply(this, arguments);
      }

      return handlePortMessage;
    }()
  }, {
    key: "unloadClient",
    value: function () {
      var _unloadClient = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
        var _this11 = this;

        var _iterator11, _step11, heartbeatExpiresTimeout, heartbeatExpiresTimestamp, delay, _iterator12, _step12, port;

        return regeneratorRuntime.wrap(function _callee24$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                this.logger.info('Detected client unload');

                if (!this.isUnloading) {
                  _context25.next = 4;
                  break;
                }

                this.logger.warn('Unload already in progress');
                return _context25.abrupt("return");

              case 4:
                _context25.prev = 4;
                _iterator11 = _createForOfIteratorHelper(this.ports.values());

                try {
                  for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                    heartbeatExpiresTimeout = _step11.value.heartbeatExpiresTimeout;
                    clearTimeout(heartbeatExpiresTimeout);
                  }
                } catch (err) {
                  _iterator11.e(err);
                } finally {
                  _iterator11.f();
                }

                heartbeatExpiresTimestamp = this.heartbeatExpiresTimestamp;

                if (!(typeof heartbeatExpiresTimestamp !== 'number')) {
                  _context25.next = 11;
                  break;
                }

                this.logger.warn('Heartbeat expires timestamp does not exist');
                return _context25.abrupt("return");

              case 11:
                this.isUnloading = true;
                delete this.heartbeatExpiresTimestamp;
                delay = heartbeatExpiresTimestamp - Date.now();

                if (!(delay > 0)) {
                  _context25.next = 17;
                  break;
                }

                _context25.next = 17;
                return new Promise(function (resolve) {
                  var timeout = setTimeout(function () {
                    clearTimeout(timeout);

                    _this11.removeListener('heartbeat', handleHeartbeat);

                    resolve();
                  }, delay);

                  var handleHeartbeat = function handleHeartbeat() {
                    clearTimeout(timeout);

                    _this11.removeListener('heartbeat', handleHeartbeat);

                    resolve();
                  };

                  _this11.addListener('heartbeat', handleHeartbeat);
                });

              case 17:
                if (!(typeof this.heartbeatExpiresTimestamp === 'number')) {
                  _context25.next = 20;
                  break;
                }

                this.logger.info('Cancelling client unload, heartbeat detected');
                return _context25.abrupt("return");

              case 20:
                this.logger.info('Unloading');
                _context25.next = 23;
                return this.runUnloadHandlers();

              case 23:
                _iterator12 = _createForOfIteratorHelper(this.ports.keys());

                try {
                  for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                    port = _step12.value;
                    port.postMessage({
                      type: 'unloadClient',
                      args: []
                    });
                  }
                } catch (err) {
                  _iterator12.e(err);
                } finally {
                  _iterator12.f();
                }

                _context25.next = 27;
                return this.onIdle();

              case 27:
                _context25.prev = 27;
                this.isUnloading = false;
                return _context25.finish(27);

              case 30:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee24, this, [[4,, 27, 30]]);
      }));

      function unloadClient() {
        return _unloadClient.apply(this, arguments);
      }

      return unloadClient;
    }()
  }, {
    key: "runUnloadHandlers",
    value: function runUnloadHandlers() {
      var _this12 = this;

      return this.unloadQueue.add( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
        var handleUnload, unloadData;
        return regeneratorRuntime.wrap(function _callee25$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                handleUnload = _this12.handleUnload;

                if (!(typeof handleUnload === 'function')) {
                  _context26.next = 16;
                  break;
                }

                _context26.prev = 2;
                _context26.next = 5;
                return (0, _database.getUnloadDataFromDatabase)();

              case 5:
                unloadData = _context26.sent;
                _context26.next = 8;
                return handleUnload(unloadData);

              case 8:
                _context26.next = 10;
                return (0, _database.clearUnloadDataInDatabase)();

              case 10:
                _context26.next = 16;
                break;

              case 12:
                _context26.prev = 12;
                _context26.t0 = _context26["catch"](2);

                _this12.logger.error('Error in unload handler');

                _this12.logger.errorStack(_context26.t0);

              case 16:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee25, null, [[2, 12]]);
      })));
    }
  }, {
    key: "removePort",
    value: function removePort(port) {
      var portHandlers = this.ports.get(port);

      if (typeof portHandlers === 'undefined') {
        this.logger.info('Unable to remove port, port handler map does not exist');
        return;
      }

      var handleJobAdd = portHandlers.handleJobAdd,
          handleJobDelete = portHandlers.handleJobDelete,
          handleJobUpdate = portHandlers.handleJobUpdate,
          handleJobsClear = portHandlers.handleJobsClear,
          heartbeatExpiresTimeout = portHandlers.heartbeatExpiresTimeout;

      _database.localJobEmitter.removeListener('jobAdd', handleJobAdd);

      _database.localJobEmitter.removeListener('jobDelete', handleJobDelete);

      _database.localJobEmitter.removeListener('jobUpdate', handleJobUpdate);

      _database.localJobEmitter.removeListener('jobsClear', handleJobsClear);

      clearTimeout(heartbeatExpiresTimeout);
      port.postMessage({
        type: 'closed',
        args: []
      });
      port.onmessage = null; // eslint-disable-line no-param-reassign

      port.onmessageerror = null; // eslint-disable-line no-param-reassign

      port.close();
      this.ports.delete(port);
    }
  }, {
    key: "listenForServiceWorkerInterface",
    value: function listenForServiceWorkerInterface() {
      var _this13 = this;

      self.addEventListener('sync', function (event) {
        _this13.logger.info("SyncManager event ".concat(event.tag).concat(event.lastChance ? ', last chance' : ''));

        if (event.tag === 'syncManagerOnIdle') {
          _this13.logger.info('Starting SyncManager idle handler');

          _this13.emit('syncManagerOnIdle');

          event.waitUntil(_this13.onIdle().catch(function (error) {
            _this13.logger.error("SyncManager event handler failed".concat(event.lastChance ? ' on last chance' : ''));

            _this13.logger.errorStack(error);
          }));
        } else if (event.tag === 'unload') {
          _this13.logger.info('Starting SyncManager unload client handler');

          event.waitUntil(_this13.unloadClient().catch(function (error) {
            _this13.logger.error("SyncManager event handler failed".concat(event.lastChance ? ' on last chance' : ''));

            _this13.logger.errorStack(error);
          }));
        } else {
          _this13.logger.warn("Received unknown SyncManager event tag ".concat(event.tag));
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

        if (_this13.ports.has(port)) {
          return;
        }

        port.onmessage = function (_event) {
          return _this13.handlePortMessage(port, _event);
        }; // eslint-disable-line no-param-reassign


        port.onmessageerror = function (_event) {
          _this13.logger.error('MessagePort unable to deserialize message');

          _this13.logger.errorObject(_event);
        };

        var handleJobAdd = function handleJobAdd() {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          port.postMessage({
            type: 'jobAdd',
            args: args
          });
        };

        var handleJobDelete = function handleJobDelete() {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          port.postMessage({
            type: 'jobDelete',
            args: args
          });
        };

        var handleJobUpdate = function handleJobUpdate() {
          for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }

          port.postMessage({
            type: 'jobUpdate',
            args: args
          });
        };

        var handleJobsClear = function handleJobsClear() {
          for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
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

        var portHandlers = {
          handleJobAdd: handleJobAdd,
          handleJobDelete: handleJobDelete,
          handleJobUpdate: handleJobUpdate,
          handleJobsClear: handleJobsClear
        };

        _this13.ports.set(port, portHandlers);

        port.postMessage({
          type: 'BATTERY_QUEUE_WORKER_CONFIRMATION'
        });

        _this13.logger.info('Linked to worker interface');
      });
      self.addEventListener('messageerror', function (event) {
        _this13.logger.error('Service worker interface message error');

        _this13.logger.errorObject(event);
      });
    }
  }]);

  return BatteryQueue;
}(_events.default);

exports.default = BatteryQueue;
export var CLEANUP_JOB_TYPE = exports.CLEANUP_JOB_TYPE;
//# sourceMappingURL=queue.js.map