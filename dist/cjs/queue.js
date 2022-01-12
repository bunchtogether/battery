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

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var CLEANUP_JOB_TYPE = 'CLEANUP_JOB_TYPE';
exports.CLEANUP_JOB_TYPE = CLEANUP_JOB_TYPE;
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
      var _getQueueIds = _asyncToGenerator(function* () {
        yield this.dequeue();
        var queueIds = new Set(this.queueMap.keys());
        return queueIds;
      });

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
      var _getRetryJobDelay = _asyncToGenerator(function* (type, attempt, error) {
        var retryJobDelayFunction = this.retryJobDelayMap.get(type);

        if (typeof retryJobDelayFunction !== 'function') {
          return false;
        }

        var result = false;

        try {
          result = yield retryJobDelayFunction(attempt, error);
        } catch (retryDelayError) {
          this.logger.error("Error in retry job delay handler for type \"".concat(type, "\" on attempt ").concat(attempt));
          this.emit('error', retryDelayError);
          return false;
        }

        if (typeof result !== 'number' && result !== false) {
          throw new Error("Retry job delay function for type \"".concat(type, "\" returned invalid response, should be a number (milliseconds) or false"));
        }

        return result;
      });

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
      var _getRetryCleanupDelay = _asyncToGenerator(function* (type, attempt, error) {
        var retryCleanupDelayFunction = this.retryCleanupDelayMap.get(type);

        if (typeof retryCleanupDelayFunction !== 'function') {
          return false;
        }

        var result = false;

        try {
          result = yield retryCleanupDelayFunction(attempt, error);
        } catch (retryDelayError) {
          this.logger.error("Error in retry cleanup delay handler for type \"".concat(type, "\" on attempt ").concat(attempt));
          this.emit('error', retryDelayError);
          return false;
        }

        if (typeof result !== 'number' && result !== false) {
          throw new Error("Retry cleanup delay function for type \"".concat(type, "\" returned invalid response, should be a number (milliseconds) or false"));
        }

        return result;
      });

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
      var _clear = _asyncToGenerator(function* () {
        this.isClearing = true;
        yield this.onIdle();
        this.emit('clearing');
        yield (0, _database.clearDatabase)();
        this.dequeueQueue.start();
        this.isClearing = false;
      });

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
      newQueue.on('idle', /*#__PURE__*/_asyncToGenerator(function* () {
        _this3.setCurrentJobType(queueId, undefined);

        if (!_this3.isClearing) {
          yield new Promise(function (resolve) {
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
        }

        if (newQueue.pending > 0 || newQueue.size > 0) {
          return;
        }

        _this3.queueMap.delete(queueId);

        _this3.emit('queueInactive', queueId);
      }));
      this.emit('queueActive', queueId);
    }
  }, {
    key: "abortQueue",
    value: function () {
      var _abortQueue = _asyncToGenerator(function* (queueId) {
        this.logger.info("Aborting queue ".concat(queueId));
        this.removeDurationEstimate(queueId); // Abort active jobs

        var queueAbortControllerMap = this.abortControllerMap.get(queueId);

        if (typeof queueAbortControllerMap !== 'undefined') {
          var _iterator4 = _createForOfIteratorHelper(queueAbortControllerMap.values()),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var abortController = _step4.value;
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


        var jobs = yield (0, _database.markQueueForCleanupInDatabase)(queueId);
        yield this.startJobs(jobs);
      });

      function abortQueue(_x7) {
        return _abortQueue.apply(this, arguments);
      }

      return abortQueue;
    }()
  }, {
    key: "retryQueue",
    value: function () {
      var _retryQueue = _asyncToGenerator(function* (queueId) {
        var _this4 = this;

        this.logger.info("Retrying queue ".concat(queueId));
        var lastJobId = yield (0, _database.getGreatestJobIdFromQueueInDatabase)(queueId);
        var priority = BASE_PRIORITY - lastJobId - 0.5;
        this.addToQueue(queueId, priority, true, /*#__PURE__*/_asyncToGenerator(function* () {
          // Resets job attempts. Changes:
          // * JOB_ABORTED_STATUS -> JOB_PENDING_STATUS
          // * JOB_ERROR_STATUS -> JOB_ERROR_STATUS
          // * JOB_CLEANUP_STATUS -> JOB_CLEANUP_STATUS
          // * JOB_COMPLETE_STATUS -> JOB_COMPLETE_STATUS
          // * JOB_CLEANUP_AND_REMOVE_STATUS -> JOB_CLEANUP_AND_REMOVE_STATUS
          var jobs = yield (0, _database.markQueuePendingInDatabase)(queueId);
          yield _this4.startJobs(jobs);
        }));
      });

      function retryQueue(_x8) {
        return _retryQueue.apply(this, arguments);
      }

      return retryQueue;
    }()
  }, {
    key: "abortAndRemoveQueue",
    value: function () {
      var _abortAndRemoveQueue = _asyncToGenerator(function* (queueId) {
        this.logger.info("Aborting and removing queue ".concat(queueId));
        this.removeDurationEstimate(queueId); // Abort active jobs

        var queueAbortControllerMap = this.abortControllerMap.get(queueId);

        if (typeof queueAbortControllerMap !== 'undefined') {
          var _iterator5 = _createForOfIteratorHelper(queueAbortControllerMap.values()),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var abortController = _step5.value;
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


        var jobs = yield (0, _database.markQueueForCleanupAndRemoveInDatabase)(queueId);
        yield this.startJobs(jobs);
        this.emit('abortAndRemoveQueue', queueId);
      });

      function abortAndRemoveQueue(_x9) {
        return _abortAndRemoveQueue.apply(this, arguments);
      }

      return abortAndRemoveQueue;
    }()
  }, {
    key: "abortAndRemoveQueueJobsGreaterThanId",
    value: function () {
      var _abortAndRemoveQueueJobsGreaterThanId = _asyncToGenerator(function* (queueId, id) {
        this.logger.info("Aborting and removing jobs with ID greater than ".concat(id, " in queue ").concat(queueId)); // Abort active jobs

        var queueAbortControllerMap = this.abortControllerMap.get(queueId);

        if (typeof queueAbortControllerMap !== 'undefined') {
          var _iterator6 = _createForOfIteratorHelper(queueAbortControllerMap),
              _step6;

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var _step6$value = _slicedToArray(_step6.value, 2),
                  jobId = _step6$value[0],
                  abortController = _step6$value[1];

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


        var jobs = yield (0, _database.markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase)(queueId, id);
        yield this.startJobs(jobs);
        this.emit('abortAndRemoveQueueJobs', queueId, id);
      });

      function abortAndRemoveQueueJobsGreaterThanId(_x10, _x11) {
        return _abortAndRemoveQueueJobsGreaterThanId.apply(this, arguments);
      }

      return abortAndRemoveQueueJobsGreaterThanId;
    }()
  }, {
    key: "dequeue",
    value: function () {
      var _dequeue = _asyncToGenerator(function* () {
        if (this.stopped) {
          return;
        }

        if (this.dequeueQueue.size === 0) {
          // Add a subsequent dequeue
          this.dequeueQueue.add(this.startJobs.bind(this));
        }

        yield this.dequeueQueue.onIdle();
      });

      function dequeue() {
        return _dequeue.apply(this, arguments);
      }

      return dequeue;
    }()
  }, {
    key: "startJobs",
    value: function () {
      var _startJobs = _asyncToGenerator(function* (newJobs) {
        // eslint-disable-line consistent-return
        var jobs = Array.isArray(newJobs) ? newJobs : yield (0, _database.dequeueFromDatabaseNotIn)(_toConsumableArray(this.jobIds.keys()));
        var queueIds = new Set();

        var _iterator7 = _createForOfIteratorHelper(jobs),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var _step7$value = _step7.value,
                id = _step7$value.id,
                queueId = _step7$value.queueId,
                args = _step7$value.args,
                type = _step7$value.type,
                status = _step7$value.status,
                attempt = _step7$value.attempt,
                startAfter = _step7$value.startAfter,
                prioritize = _step7$value.prioritize;

            if (this.jobIds.has(id)) {
              continue;
            } // Pause queues before adding items into them to avoid starting things out of priority


            if (!queueIds.has(queueId)) {
              var queue = this.queueMap.get(queueId);

              if (typeof queue !== 'undefined') {
                queue.pause();
              }

              queueIds.add(queueId);
            }

            if (status === _database.JOB_PENDING_STATUS) {
              this.startJob(id, queueId, args, type, attempt + 1, startAfter, false, prioritize);
            } else if (status === _database.JOB_ERROR_STATUS) {
              this.startErrorHandler(id, queueId, args, type, attempt, startAfter, false, prioritize);
            } else if (status === _database.JOB_CLEANUP_STATUS) {
              this.startCleanup(id, queueId, args, type, false, prioritize);
            } else if (status === _database.JOB_CLEANUP_AND_REMOVE_STATUS) {
              this.startCleanup(id, queueId, args, type, false, prioritize);
            } else {
              throw new Error("Unknown job status ".concat(status, " in job ").concat(id, " of queue ").concat(queueId));
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }

        var _iterator8 = _createForOfIteratorHelper(queueIds),
            _step8;

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _queueId = _step8.value;

            var _queue = this.queueMap.get(_queueId);

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
      });

      function startJobs(_x12) {
        return _startJobs.apply(this, arguments);
      }

      return startJobs;
    }()
  }, {
    key: "stop",
    value: function () {
      var _stop = _asyncToGenerator(function* () {
        var _this5 = this;

        if (typeof this.stopPromise === 'undefined') {
          this.stopped = true;
          this.stopPromise = _asyncToGenerator(function* () {
            yield _this5.dequeueQueue.onIdle();
            var idlePromises = [];

            var _iterator9 = _createForOfIteratorHelper(_this5.queueMap),
                _step9;

            try {
              var _loop = function _loop() {
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

            yield Promise.all(idlePromises);

            _this5.jobIds.clear();

            _this5.abortControllerMap.clear();

            delete _this5.stopPromise;

            _this5.emit('stop');

            _this5.stopped = false;
          })();
        }

        yield this.stopPromise;
      });

      function stop() {
        return _stop.apply(this, arguments);
      }

      return stop;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator(function* (maxDuration) {
        var _this6 = this;

        if (typeof this.onIdlePromise === 'undefined') {
          this.onIdlePromise = _asyncToGenerator(function* () {
            var timeout = typeof maxDuration === 'number' ? Date.now() + maxDuration : -1;
            var start = Date.now();

            while (true) {
              // eslint-disable-line no-constant-condition
              if (timeout !== -1 && Date.now() > timeout) {
                _this6.logger.warn("Idle timeout after ".concat(Date.now() - start, "ms"));

                break;
              }

              yield _this6.dequeueQueue.onIdle();

              var _iterator10 = _createForOfIteratorHelper(_this6.queueMap),
                  _step10;

              try {
                var _loop2 = function* _loop2() {
                  var _step10$value = _slicedToArray(_step10.value, 2),
                      queueId = _step10$value[0],
                      queue = _step10$value[1];

                  var interval = setInterval(function () {
                    _this6.logger.info("Waiting on queue ".concat(queueId, " onIdle() request. Queue ").concat(queue.isPaused ? 'is paused' : 'is not paused', ", with ").concat(queue.pending, " ").concat(queue.pending === 1 ? 'job' : 'jobs', " pending and ").concat(queue.size, " ").concat(queue.size === 1 ? 'job' : 'jobs', " remaining."));
                  }, 250);
                  yield queue.onIdle();
                  clearInterval(interval);
                };

                for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                  yield* _loop2();
                }
              } catch (err) {
                _iterator10.e(err);
              } finally {
                _iterator10.f();
              }

              var jobsInterval = setInterval(function () {
                _this6.logger.info('Waiting on jobs');
              }, 250);
              var jobs = yield (0, _database.dequeueFromDatabase)();
              clearInterval(jobsInterval);

              if (jobs.length > 0) {
                var interval = setInterval(function () {
                  _this6.logger.info('Waiting on dequeue');
                }, 250);
                yield _this6.dequeue();
                clearInterval(interval);
                continue;
              }

              break;
            }

            delete _this6.onIdlePromise;

            _this6.emit('idle');
          })();
        }

        yield this.onIdlePromise;
      });

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
      var _runCleanup = _asyncToGenerator(function* (id, queueId, args, type) {
        this.emit('cleanupStart', {
          id: id
        });
        var cleanup = this.cleanupMap.get(type);

        if (typeof cleanup !== 'function') {
          this.logger.warn("No cleanup for job type ".concat(type));
          yield (0, _database.removeCleanupFromDatabase)(id);
          this.emit('cleanup', {
            id: id
          });
          return;
        }

        var cleanupJob = yield (0, _database.getCleanupFromDatabase)(id);

        var _ref5 = typeof cleanupJob === 'undefined' ? {
          data: undefined,
          startAfter: 0
        } : cleanupJob,
            data = _ref5.data,
            startAfter = _ref5.startAfter;

        var delay = startAfter - Date.now();

        if (delay > 0) {
          this.logger.info("Delaying retry of ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " by ").concat(delay, "ms to ").concat(new Date(startAfter).toLocaleString()));
          yield new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          });
        }

        try {
          yield cleanup(data, args, function (path) {
            return (0, _database.removePathFromCleanupDataInDatabase)(id, path);
          });
        } catch (error) {
          var attempt = yield (0, _database.incrementCleanupAttemptInDatabase)(id, queueId);

          if (error.name === 'FatalError') {
            this.logger.error("Fatal error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt));
            this.emit('error', error);
            yield (0, _database.removeCleanupFromDatabase)(id);
            this.emit('fatalCleanupError', {
              id: id,
              queueId: queueId
            });
            return;
          }

          var retryCleanupDelay = yield this.getRetryCleanupDelay(type, attempt, error);

          if (retryCleanupDelay === false) {
            this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));
            this.emit('error', error);
            yield (0, _database.removeCleanupFromDatabase)(id);
            this.emit('fatalCleanupError', {
              id: id,
              queueId: queueId
            });
            return;
          }

          this.logger.error("Error in ".concat(type, " job #").concat(id, " cleanup in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryCleanupDelay > 0 ? "in ".concat(retryCleanupDelay, "ms") : 'immediately'));
          this.emit('error', error);

          if (retryCleanupDelay > 0) {
            this.emit('retryCleanupDelay', {
              id: id,
              queueId: queueId,
              retryCleanupDelay: retryCleanupDelay
            });
            var newStartAfter = Date.now() + retryCleanupDelay;
            yield (0, _database.markCleanupStartAfterInDatabase)(id, newStartAfter);
          }

          yield this.runCleanup(id, queueId, args, type);
          return;
        }

        yield (0, _database.removeCleanupFromDatabase)(id);
        this.emit('cleanup', {
          id: id
        });
      });

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
        var _ref6 = _asyncToGenerator(function* () {
          _this7.setCurrentJobType(queueId, CLEANUP_JOB_TYPE);

          _this7.logger.info("Starting ".concat(type, " cleanup #").concat(id, " in queue ").concat(queueId));

          yield _this7.runCleanup(id, queueId, args, type); // Job could be marked for removal while cleanup is running

          yield (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

          _this7.jobIds.delete(id);

          _this7.logger.info("Completed ".concat(type, " cleanup #").concat(id, " in queue ").concat(queueId));
        });

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
        var _ref7 = _asyncToGenerator(function* () {
          _this8.setCurrentJobType(queueId, CLEANUP_JOB_TYPE);

          _this8.logger.info("Starting ".concat(type, " error handler #").concat(id, " in queue ").concat(queueId));

          yield _this8.runCleanup(id, queueId, args, type);

          if (abortController.signal.aborted) {
            // Job could be marked for removal while error handler is running
            yield (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

            _this8.removeAbortController(id, queueId);

            _this8.jobIds.delete(id);
          } else {
            yield (0, _database.markJobPendingInDatabase)(id);

            _this8.logger.info("Retrying ".concat(type, " job #").concat(id, " in queue ").concat(queueId));

            _this8.emit('retry', {
              id: id
            });

            _this8.startJob(id, queueId, args, type, attempt + 1, startAfter, true, prioritize);
          }

          _this8.logger.info("Completed ".concat(type, " error handler #").concat(id, " in queue ").concat(queueId));
        });

        return function run() {
          return _ref7.apply(this, arguments);
        };
      }();

      this.addToQueue(queueId, priority, autoStart, run);
    }
  }, {
    key: "delayJobStart",
    value: function () {
      var _delayJobStart = _asyncToGenerator(function* (id, queueId, type, signal, startAfter) {
        if (signal.aborted) {
          throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));
        }

        var duration = startAfter - Date.now();

        if (duration > 0) {
          this.logger.info("Delaying start of ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " by ").concat(duration, "ms"));
          yield new Promise(function (resolve, reject) {
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
        }
      });

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
        var _ref8 = _asyncToGenerator(function* () {
          var start = Date.now();
          var durationEstimate = updateDurationEstimate();

          _this9.durationEstimateUpdaterMap.delete(id);

          if (abortController.signal.aborted) {
            _this9.emit('fatalError', {
              id: id,
              queueId: queueId,
              error: new _errors.AbortError("Queue ".concat(queueId, " was aborted"))
            });

            _this9.removeAbortController(id, queueId);

            _this9.jobIds.delete(id);

            _this9.removeDurationEstimate(queueId, id);

            return;
          }

          var handler = _this9.handlerMap.get(type);

          if (typeof handler !== 'function') {
            _this9.logger.warn("No handler for job type ".concat(type));

            yield (0, _database.markJobCompleteInDatabase)(id);

            _this9.removeAbortController(id, queueId);

            _this9.jobIds.delete(id);

            _this9.addDurationEstimate(queueId, id, Date.now() - start, 0);

            return;
          }

          _this9.setCurrentJobType(queueId, type);

          var handlerDidRun = false;

          try {
            // Mark as error in database so the job is cleaned up and retried if execution
            // stops before job completion or error.
            yield (0, _database.markJobErrorInDatabase)(id);
            yield _this9.delayJobStart(id, queueId, type, abortController.signal, startAfter);

            _this9.logger.info("Starting ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

            handlerDidRun = true;
            var shouldKeepJobInDatabase = yield handler(args, abortController.signal, updateCleanupData, updateDuration);

            if (abortController.signal.aborted) {
              throw new _errors.AbortError("Queue ".concat(queueId, " was aborted"));
            }

            if (shouldKeepJobInDatabase === false) {
              yield (0, _database.markJobCompleteThenRemoveFromDatabase)(id);
            } else {
              yield (0, _database.markJobCompleteInDatabase)(id);
            }

            _this9.removeAbortController(id, queueId);

            _this9.jobIds.delete(id);

            var duration = Date.now() - start;

            if (typeof durationEstimate === 'number') {
              var estimatedToActualRatio = durationEstimate / duration;

              if (duration > 250 && (estimatedToActualRatio < 0.8 || estimatedToActualRatio > 1.25)) {
                _this9.logger.warn("Duration estimate of ".concat(type, " job #").concat(id, " (").concat(durationEstimate, "ms) was ").concat(Math.round(100 * estimatedToActualRatio), "% of actual value (").concat(duration, "ms)"));
              }
            }

            _this9.addDurationEstimate(queueId, id, duration, 0);

            _this9.logger.info("Completed ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, " in ").concat(duration, "ms"));

            return;
          } catch (error) {
            if (error.name === 'JobDoesNotExistError') {
              _this9.logger.error("Job does not exist error for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

              if (handlerDidRun) {
                _this9.emit('fatalError', {
                  id: id,
                  queueId: queueId,
                  error: error
                });

                yield (0, _database.restoreJobToDatabaseForCleanupAndRemove)(id, queueId, type, args, {
                  prioritize: prioritize
                });

                _this9.jobIds.delete(id);

                _this9.removeAbortController(id, queueId);

                _this9.startCleanup(id, queueId, args, type, true, prioritize);
              } else {
                _this9.emit('fatalError', {
                  id: id,
                  queueId: queueId,
                  error: error
                });

                _this9.jobIds.delete(id);

                _this9.removeAbortController(id, queueId);

                _this9.removeDurationEstimate(queueId, id);
              }

              return;
            }

            if (abortController.signal.aborted) {
              if (error.name !== 'AbortError') {
                _this9.logger.error("Abort signal following error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

                _this9.emit('error', error);
              } else {
                _this9.logger.warn("Received abort signal for ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));
              }

              if (handlerDidRun) {
                _this9.emit('fatalError', {
                  id: id,
                  queueId: queueId,
                  error: error
                });

                _this9.jobIds.delete(id);

                _this9.removeAbortController(id, queueId);

                _this9.startCleanup(id, queueId, args, type, true, prioritize);
              } else {
                _this9.emit('fatalError', {
                  id: id,
                  queueId: queueId,
                  error: error
                });

                yield (0, _database.markJobAsAbortedOrRemoveFromDatabase)(id);

                _this9.jobIds.delete(id);

                _this9.removeAbortController(id, queueId);

                _this9.removeDurationEstimate(queueId, id);
              }

              return;
            }

            yield (0, _database.incrementJobAttemptInDatabase)(id);

            if (error.name === 'FatalError') {
              _this9.logger.error("Fatal error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt));

              _this9.emit('error', error);

              _this9.emit('fatalError', {
                id: id,
                queueId: queueId,
                error: error
              });

              _this9.jobIds.delete(id);

              _this9.removeAbortController(id, queueId);

              yield _this9.abortQueue(queueId);
              return;
            }

            var retryDelay = yield _this9.getRetryJobDelay(type, attempt, error);

            if (retryDelay === false) {
              _this9.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, " with no additional attempts requested"));

              _this9.emit('error', error);

              _this9.emit('fatalError', {
                id: id,
                queueId: queueId,
                error: error
              });

              _this9.jobIds.delete(id);

              _this9.removeAbortController(id, queueId);

              yield _this9.abortQueue(queueId);
              return;
            }

            _this9.logger.error("Error in ".concat(type, " job #").concat(id, " in queue ").concat(queueId, " attempt ").concat(attempt, ", retrying ").concat(retryDelay > 0 ? "in ".concat(retryDelay, "ms") : 'immediately'));

            _this9.emit('error', error);

            if (retryDelay > 0) {
              _this9.emit('retryDelay', {
                id: id,
                queueId: queueId,
                retryDelay: retryDelay
              });

              var newStartAfter = Date.now() + retryDelay;
              yield (0, _database.markJobStartAfterInDatabase)(id, newStartAfter);

              _this9.jobIds.delete(id);

              _this9.startErrorHandler(id, queueId, args, type, attempt, newStartAfter, true, prioritize);
            } else {
              _this9.jobIds.delete(id);

              _this9.startErrorHandler(id, queueId, args, type, attempt, startAfter, true, prioritize);
            }
          }
        });

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
      var _handlePortMessage = _asyncToGenerator(function* (port, event) {
        var _this10 = this;

        if (!(event instanceof MessageEvent)) {
          return;
        }

        var portHandlers = this.ports.get(port);

        if (_typeof(portHandlers) !== 'object') {
          this.logger.warn('Port handlers do not exist');
          this.logger.warnObject(event);
          return;
        }

        var data = event.data;

        if (!data || _typeof(data) !== 'object') {
          this.logger.warn('Invalid message data');
          this.logger.warnObject(event);
          return;
        }

        var type = data.type,
            args = data.args;

        if (typeof type !== 'string') {
          this.logger.warn('Unknown message type');
          this.logger.warnObject(event);
          return;
        }

        if (!Array.isArray(args)) {
          this.logger.warn('Unknown arguments type');
          this.logger.warnObject(event);
          return;
        }

        var emit = function emit(t) {
          for (var _len2 = arguments.length, messageArgs = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            messageArgs[_key2 - 1] = arguments[_key2];
          }

          port.postMessage({
            type: t,
            args: messageArgs
          });
        };

        switch (type) {
          case 'heartbeat':
            try {
              var _get3;

              var _args = _slicedToArray(args, 1),
                  interval = _args[0];

              if (typeof interval !== 'number') {
                throw new Error("Invalid \"interval\" argument with type ".concat(_typeof(interval), ", should be type number"));
              }

              clearTimeout(portHandlers.heartbeatExpiresTimeout);
              this.heartbeatExpiresTimestamp = Date.now() + Math.round(interval * 2.5);
              portHandlers.heartbeatExpiresTimeout = setTimeout( /*#__PURE__*/_asyncToGenerator(function* () {
                _this10.logger.warn("Heartbeat timeout after ".concat(Math.round(interval * 2.1), "ms"));

                yield _this10.unloadClient();

                _this10.removePort(port);
              }), Math.round(interval * 2.1));
              emit.apply(void 0, ['heartbeat'].concat(_toConsumableArray(args)));

              (_get3 = _get(_getPrototypeOf(BatteryQueue.prototype), "emit", this)).call.apply(_get3, [this, 'heartbeat'].concat(_toConsumableArray(args)));
            } catch (error) {
              this.logger.error('Heartbeat error');
              this.logger.errorStack(error);
            }

            return;

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

          default:
            break;
        }

        var _args2 = _toArray(args),
            requestId = _args2[0],
            requestArgs = _args2.slice(1);

        if (typeof requestId !== 'number') {
          throw new Error('Request arguments should start with a requestId number');
        }

        switch (type) {
          case 'unlink':
            this.logger.warn('Unlinking worker interface');

            try {
              if (this.ports.size === 1) {
                yield this.stop();
              }

              emit('unlinkComplete', requestId);
              this.removePort(port);
            } catch (error) {
              emit('unlinkError', requestId, error);
              this.logger.error('Unable to handle unlink message');
              this.emit('error', error);
            }

            break;

          case 'clear':
            try {
              yield this.clear();
              emit('clearComplete', requestId);
            } catch (error) {
              emit('clearError', requestId, error);
              this.logger.error('Unable to handle clear message');
              this.emit('error', error);
            }

            break;

          case 'abortAndRemoveQueueJobsGreaterThanId':
            try {
              var _requestArgs = _slicedToArray(requestArgs, 2),
                  queueId = _requestArgs[0],
                  id = _requestArgs[1];

              if (typeof queueId !== 'string') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(queueId), ", should be type string"));
              }

              if (typeof id !== 'number') {
                throw new Error("Invalid \"id\" argument with type ".concat(_typeof(id), ", should be type number"));
              }

              yield this.abortAndRemoveQueueJobsGreaterThanId(queueId, id);
              emit('abortAndRemoveQueueJobsGreaterThanIdComplete', requestId);
            } catch (error) {
              emit('abortAndRemoveQueueJobsGreaterThanIdError', requestId, error);
              this.logger.error('Unable to handle abort and remove queue jobs greater than ID message');
              this.emit('error', error);
            }

            break;

          case 'abortAndRemoveQueue':
            try {
              var _requestArgs2 = _slicedToArray(requestArgs, 1),
                  _queueId2 = _requestArgs2[0];

              if (typeof _queueId2 !== 'string') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId2), ", should be type string"));
              }

              yield this.abortAndRemoveQueue(_queueId2);
              emit('abortAndRemoveQueueComplete', requestId);
            } catch (error) {
              emit('abortAndRemoveQueueError', requestId, error);
              this.logger.error('Unable to handle abort and remove queue message');
              this.emit('error', error);
            }

            break;

          case 'updateDurationEstimates':
            try {
              yield this.updateDurationEstimates();
              emit('updateDurationEstimatesComplete', requestId);
            } catch (error) {
              emit('updateDurationEstimatesError', requestId, error);
              this.logger.error('Unable to handle update duration estimates message');
              this.emit('error', error);
            }

            break;

          case 'abortQueue':
            try {
              var _requestArgs3 = _slicedToArray(requestArgs, 1),
                  _queueId3 = _requestArgs3[0];

              if (typeof _queueId3 !== 'string') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId3), ", should be type string"));
              }

              yield this.abortQueue(_queueId3);
              emit('abortQueueComplete', requestId);
            } catch (error) {
              emit('abortQueueError', requestId, error);
              this.logger.error('Unable to handle abort queue message');
              this.emit('error', error);
            }

            break;

          case 'retryQueue':
            try {
              var _requestArgs4 = _slicedToArray(requestArgs, 1),
                  _queueId4 = _requestArgs4[0];

              if (typeof _queueId4 !== 'string') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId4), ", should be type string"));
              }

              yield this.retryQueue(_queueId4);
              emit('retryQueueComplete', requestId);
            } catch (error) {
              emit('retryQueueError', requestId, error);
              this.logger.error('Unable to handle retry queue message');
              this.emit('error', error);
            }

            break;

          case 'dequeue':
            try {
              yield this.dequeue();
              emit('dequeueComplete', requestId);
            } catch (error) {
              emit('dequeueError', requestId, error);
              this.logger.error('Unable to handle dequeue message');
              this.emit('error', error);
            }

            break;

          case 'enableStartOnJob':
            try {
              this.enableStartOnJob();
              emit('enableStartOnJobComplete', requestId);
            } catch (error) {
              emit('enableStartOnJobError', requestId, error);
              this.logger.error('Unable to handle enableStartOnJob message');
              this.emit('error', error);
            }

            break;

          case 'disableStartOnJob':
            try {
              this.disableStartOnJob();
              emit('disableStartOnJobComplete', requestId);
            } catch (error) {
              emit('disableStartOnJobError', requestId, error);
              this.logger.error('Unable to handle disableStartOnJob message');
              this.emit('error', error);
            }

            break;

          case 'getQueueIds':
            try {
              var queueIds = yield this.getQueueIds();
              emit('getQueuesComplete', requestId, _toConsumableArray(queueIds));
            } catch (error) {
              emit('getQueuesError', requestId, error);
              this.logger.error('Unable to handle getQueueIds message');
              this.emit('error', error);
            }

            break;

          case 'getDurationEstimate':
            try {
              var _requestArgs5 = _slicedToArray(requestArgs, 1),
                  _queueId5 = _requestArgs5[0];

              if (typeof _queueId5 !== 'string') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId5), ", should be type string"));
              }

              var values = yield this.getDurationEstimate(_queueId5);
              emit('getDurationEstimateComplete', requestId, values);
            } catch (error) {
              emit('getDurationEstimateError', requestId, error);
              this.logger.error('Unable to handle get duration estimate message');
              this.emit('error', error);
            }

            break;

          case 'getCurrentJobType':
            try {
              var _requestArgs6 = _slicedToArray(requestArgs, 1),
                  _queueId6 = _requestArgs6[0];

              if (typeof _queueId6 !== 'string') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(_queueId6), ", should be type string"));
              }

              var currentJobType = this.getCurrentJobType(_queueId6);
              emit('getCurrentJobTypeComplete', requestId, currentJobType);
            } catch (error) {
              emit('getCurrentJobTypeError', requestId, error);
              this.logger.error('Unable to handle get current job type message');
              this.emit('error', error);
            }

            break;

          case 'runUnloadHandlers':
            try {
              yield this.runUnloadHandlers();
              emit('runUnloadHandlersComplete', requestId);
            } catch (error) {
              emit('runUnloadHandlersError', requestId, error);
              this.logger.error('Unable to run unload handlers message');
              this.emit('error', error);
            }

            break;

          case 'idle':
            try {
              var _requestArgs7 = _slicedToArray(requestArgs, 2),
                  maxDuration = _requestArgs7[0],
                  start = _requestArgs7[1];

              if (typeof maxDuration !== 'number') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(maxDuration), ", should be type number"));
              }

              if (typeof start !== 'number') {
                throw new Error("Invalid \"queueId\" argument with type ".concat(_typeof(start), ", should be type number"));
              }

              yield this.onIdle(maxDuration - (Date.now() - start));
              emit('idleComplete', requestId);
            } catch (error) {
              emit('idleError', requestId, error);
              this.logger.error('Unable to handle idle message');
              this.emit('error', error);
            }

            break;

          default:
            this.logger.warn("Unknown worker interface message type ".concat(type));
        }
      });

      function handlePortMessage(_x23, _x24) {
        return _handlePortMessage.apply(this, arguments);
      }

      return handlePortMessage;
    }()
  }, {
    key: "unloadClient",
    value: function () {
      var _unloadClient = _asyncToGenerator(function* () {
        var _this11 = this;

        this.logger.info('Detected client unload');

        if (this.isUnloading) {
          this.logger.warn('Unload already in progress');
          return;
        }

        try {
          var _iterator11 = _createForOfIteratorHelper(this.ports.values()),
              _step11;

          try {
            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
              var heartbeatExpiresTimeout = _step11.value.heartbeatExpiresTimeout;
              clearTimeout(heartbeatExpiresTimeout);
            }
          } catch (err) {
            _iterator11.e(err);
          } finally {
            _iterator11.f();
          }

          var heartbeatExpiresTimestamp = this.heartbeatExpiresTimestamp;

          if (typeof heartbeatExpiresTimestamp !== 'number') {
            this.logger.warn('Heartbeat expires timestamp does not exist');
            return;
          }

          this.isUnloading = true;
          delete this.heartbeatExpiresTimestamp;
          var delay = heartbeatExpiresTimestamp - Date.now();

          if (delay > 0) {
            yield new Promise(function (resolve) {
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
          }

          if (typeof this.heartbeatExpiresTimestamp === 'number') {
            this.logger.info('Cancelling client unload, heartbeat detected');
            return;
          }

          this.logger.info('Unloading');
          yield this.runUnloadHandlers();

          var _iterator12 = _createForOfIteratorHelper(this.ports.keys()),
              _step12;

          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var port = _step12.value;
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

          yield this.onIdle();
        } finally {
          this.isUnloading = false;
        }
      });

      function unloadClient() {
        return _unloadClient.apply(this, arguments);
      }

      return unloadClient;
    }()
  }, {
    key: "runUnloadHandlers",
    value: function runUnloadHandlers() {
      var _this12 = this;

      return this.unloadQueue.add( /*#__PURE__*/_asyncToGenerator(function* () {
        var handleUnload = _this12.handleUnload;

        if (typeof handleUnload === 'function') {
          try {
            var unloadData = yield (0, _database.getUnloadDataFromDatabase)();
            yield handleUnload(unloadData);
            yield (0, _database.clearUnloadDataInDatabase)();
          } catch (error) {
            _this12.logger.error('Error in unload handler');

            _this12.logger.errorStack(error);
          }
        }
      }));
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
//# sourceMappingURL=queue.js.map