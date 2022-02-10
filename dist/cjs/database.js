"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QUEUE_PENDING_STATUS = exports.QUEUE_ERROR_STATUS = exports.QUEUE_EMPTY_STATUS = exports.QUEUE_COMPLETE_STATUS = exports.JobDoesNotExistError = exports.JOB_PENDING_STATUS = exports.JOB_ERROR_STATUS = exports.JOB_COMPLETE_STATUS = exports.JOB_CLEANUP_STATUS = exports.JOB_CLEANUP_AND_REMOVE_STATUS = exports.JOB_ABORTED_STATUS = exports.CleanupDoesNotExistError = void 0;
exports.addArgLookup = addArgLookup;
exports.bulkEnqueueToDatabase = bulkEnqueueToDatabase;
exports.clearDatabase = clearDatabase;
exports.clearMetadataInDatabase = clearMetadataInDatabase;
exports.clearUnloadDataInDatabase = clearUnloadDataInDatabase;
exports.databasePromise = void 0;
exports.dequeueFromDatabase = dequeueFromDatabase;
exports.dequeueFromDatabaseNotIn = dequeueFromDatabaseNotIn;
exports.enqueueToDatabase = enqueueToDatabase;
exports.getArgLookupJobPathMap = getArgLookupJobPathMap;
exports.getAuthDataFromDatabase = getAuthDataFromDatabase;
exports.getCleanupFromDatabase = getCleanupFromDatabase;
exports.getCleanupsInQueueFromDatabase = getCleanupsInQueueFromDatabase;
exports.getCompletedJobsCountFromDatabase = getCompletedJobsCountFromDatabase;
exports.getCompletedJobsFromDatabase = getCompletedJobsFromDatabase;
exports.getContiguousIds = getContiguousIds;
exports.getGreatestJobIdFromQueueInDatabase = getGreatestJobIdFromQueueInDatabase;
exports.getJobFromDatabase = getJobFromDatabase;
exports.getJobsInDatabase = getJobsInDatabase;
exports.getJobsInQueueFromDatabase = getJobsInQueueFromDatabase;
exports.getJobsWithTypeFromDatabase = getJobsWithTypeFromDatabase;
exports.getMetadataFromDatabase = getMetadataFromDatabase;
exports.getQueueStatus = getQueueStatus;
exports.getUnloadDataFromDatabase = getUnloadDataFromDatabase;
exports.importJobsAndCleanups = importJobsAndCleanups;
exports.incrementCleanupAttemptInDatabase = incrementCleanupAttemptInDatabase;
exports.incrementJobAttemptInDatabase = incrementJobAttemptInDatabase;
exports.localJobEmitter = exports.jobEmitter = void 0;
exports.lookupArg = lookupArg;
exports.lookupArgs = lookupArgs;
exports.markCleanupStartAfterInDatabase = markCleanupStartAfterInDatabase;
exports.markJobAbortedInDatabase = markJobAbortedInDatabase;
exports.markJobAsAbortedOrRemoveFromDatabase = markJobAsAbortedOrRemoveFromDatabase;
exports.markJobCleanupAndRemoveInDatabase = markJobCleanupAndRemoveInDatabase;
exports.markJobCleanupInDatabase = markJobCleanupInDatabase;
exports.markJobCompleteInDatabase = markJobCompleteInDatabase;
exports.markJobCompleteThenRemoveFromDatabase = markJobCompleteThenRemoveFromDatabase;
exports.markJobErrorInDatabase = markJobErrorInDatabase;
exports.markJobPendingInDatabase = markJobPendingInDatabase;
exports.markJobStartAfterInDatabase = markJobStartAfterInDatabase;
exports.markJobStatusInDatabase = markJobStatusInDatabase;
exports.markJobsWithArgLookupKeyCleanupAndRemoveInDatabase = markJobsWithArgLookupKeyCleanupAndRemoveInDatabase;
exports.markQueueForCleanupAndRemoveInDatabase = markQueueForCleanupAndRemoveInDatabase;
exports.markQueueForCleanupInDatabase = markQueueForCleanupInDatabase;
exports.markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase = markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase;
exports.markQueueJobsGreaterThanIdPendingInDatabase = markQueueJobsGreaterThanIdPendingInDatabase;
exports.markQueuePendingInDatabase = markQueuePendingInDatabase;
exports.removeArgLookupsAndCleanupsForJobAsMicrotask = removeArgLookupsAndCleanupsForJobAsMicrotask;
exports.removeAuthDataFromDatabase = removeAuthDataFromDatabase;
exports.removeCleanupFromDatabase = removeCleanupFromDatabase;
exports.removeCompletedExpiredItemsFromDatabase = removeCompletedExpiredItemsFromDatabase;
exports.removeJobFromDatabase = removeJobFromDatabase;
exports.removeJobsWithQueueIdAndTypeFromDatabase = removeJobsWithQueueIdAndTypeFromDatabase;
exports.removePathFromCleanupDataInDatabase = removePathFromCleanupDataInDatabase;
exports.removeQueueFromDatabase = removeQueueFromDatabase;
exports.restoreJobToDatabaseForCleanupAndRemove = restoreJobToDatabaseForCleanupAndRemove;
exports.setMetadataInDatabase = setMetadataInDatabase;
exports.silentlyRemoveJobFromDatabase = silentlyRemoveJobFromDatabase;
exports.silentlyRemoveQueueFromDatabase = silentlyRemoveQueueFromDatabase;
exports.storeAuthDataInDatabase = storeAuthDataInDatabase;
exports.updateCleanupInDatabase = updateCleanupInDatabase;
exports.updateCleanupValuesInDatabase = updateCleanupValuesInDatabase;
exports.updateJobInDatabase = updateJobInDatabase;
exports.updateMetadataInDatabase = updateMetadataInDatabase;
exports.updateUnloadDataInDatabase = updateUnloadDataInDatabase;

var _jsonpathPlus = require("jsonpath-plus");

var _merge = _interopRequireDefault(require("lodash/merge"));

var _unset = _interopRequireDefault(require("lodash/unset"));

var _uniq = _interopRequireDefault(require("lodash/uniq"));

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

// Local job emitter is for this process only,
// jobEmitter is bridged when a MessagePort is open
var localJobEmitter = new _events.default();
exports.localJobEmitter = localJobEmitter;
var jobEmitter = new _events.default();
exports.jobEmitter = jobEmitter;
var logger = (0, _logger.default)('Jobs Database');

var JobDoesNotExistError = /*#__PURE__*/function (_Error) {
  _inherits(JobDoesNotExistError, _Error);

  var _super = _createSuper(JobDoesNotExistError);

  function JobDoesNotExistError(message) {
    var _this;

    _classCallCheck(this, JobDoesNotExistError);

    _this = _super.call(this, message);
    _this.name = 'JobDoesNotExistError';
    return _this;
  }

  return _createClass(JobDoesNotExistError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.JobDoesNotExistError = JobDoesNotExistError;

var CleanupDoesNotExistError = /*#__PURE__*/function (_Error2) {
  _inherits(CleanupDoesNotExistError, _Error2);

  var _super2 = _createSuper(CleanupDoesNotExistError);

  function CleanupDoesNotExistError(message) {
    var _this2;

    _classCallCheck(this, CleanupDoesNotExistError);

    _this2 = _super2.call(this, message);
    _this2.name = 'CleanupDoesNotExistError';
    return _this2;
  }

  return _createClass(CleanupDoesNotExistError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.CleanupDoesNotExistError = CleanupDoesNotExistError;
var QUEUE_ERROR_STATUS = 0;
exports.QUEUE_ERROR_STATUS = QUEUE_ERROR_STATUS;
var QUEUE_PENDING_STATUS = 1;
exports.QUEUE_PENDING_STATUS = QUEUE_PENDING_STATUS;
var QUEUE_COMPLETE_STATUS = 2;
exports.QUEUE_COMPLETE_STATUS = QUEUE_COMPLETE_STATUS;
var QUEUE_EMPTY_STATUS = 3;
exports.QUEUE_EMPTY_STATUS = QUEUE_EMPTY_STATUS;
var JOB_ABORTED_STATUS = 2;
exports.JOB_ABORTED_STATUS = JOB_ABORTED_STATUS;
var JOB_COMPLETE_STATUS = 1;
exports.JOB_COMPLETE_STATUS = JOB_COMPLETE_STATUS;
var JOB_PENDING_STATUS = 0;
exports.JOB_PENDING_STATUS = JOB_PENDING_STATUS;
var JOB_ERROR_STATUS = -1;
exports.JOB_ERROR_STATUS = JOB_ERROR_STATUS;
var JOB_CLEANUP_STATUS = -2;
exports.JOB_CLEANUP_STATUS = JOB_CLEANUP_STATUS;
var JOB_CLEANUP_AND_REMOVE_STATUS = -3;
exports.JOB_CLEANUP_AND_REMOVE_STATUS = JOB_CLEANUP_AND_REMOVE_STATUS;

var databasePromise = _asyncToGenerator(function* () {
  var request = self.indexedDB.open('battery-queue-08', 1);

  request.onupgradeneeded = function (e) {
    try {
      var store = e.target.result.createObjectStore('jobs', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('statusIndex', 'status', {
        unique: false
      });
      store.createIndex('queueIdIndex', 'queueId', {
        unique: false
      });
      store.createIndex('queueIdTypeIndex', ['queueId', 'type'], {
        unique: false
      });
      store.createIndex('typeIndex', 'type', {
        unique: false
      });
      store.createIndex('statusQueueIdIndex', ['queueId', 'status'], {
        unique: false
      });
      store.createIndex('statusCreatedIndex', ['status', 'created'], {
        unique: false
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      e.target.result.createObjectStore('metadata', {
        keyPath: 'id'
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      var _store = e.target.result.createObjectStore('cleanups', {
        keyPath: 'id'
      });

      _store.createIndex('queueIdIndex', 'queueId', {
        unique: false
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      e.target.result.createObjectStore('auth-data', {
        keyPath: 'id'
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }

    try {
      var _store2 = e.target.result.createObjectStore('arg-lookup', {
        keyPath: 'id',
        autoIncrement: true
      });

      _store2.createIndex('jobIdIndex', 'jobId', {
        unique: false
      });

      _store2.createIndex('keyIndex', 'key', {
        unique: false
      });
    } catch (error) {
      if (!(error.name === 'ConstraintError')) {
        throw error;
      }
    }
  };

  var db = yield new Promise(function (resolve, reject) {
    request.onerror = function () {
      reject(new Error('Unable to open database'));
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
  return db;
})();

exports.databasePromise = databasePromise;

function getReadWriteObjectStore(_x) {
  return _getReadWriteObjectStore.apply(this, arguments);
}

function _getReadWriteObjectStore() {
  _getReadWriteObjectStore = _asyncToGenerator(function* (name) {
    var database = yield databasePromise;
    var transaction = database.transaction([name], 'readwrite', {
      durability: 'relaxed'
    });
    var objectStore = transaction.objectStore(name);

    transaction.onabort = function (event) {
      logger.error("Read-write \"".concat(name, "\" transaction was aborted"));
      logger.errorObject(event);
    };

    transaction.onerror = function (event) {
      logger.error("Error in read-write \"".concat(name, "\" transaction"));
      logger.errorObject(event);
    };

    return objectStore;
  });
  return _getReadWriteObjectStore.apply(this, arguments);
}

function getReadOnlyObjectStore(_x2) {
  return _getReadOnlyObjectStore.apply(this, arguments);
}

function _getReadOnlyObjectStore() {
  _getReadOnlyObjectStore = _asyncToGenerator(function* (name) {
    var database = yield databasePromise;
    var transaction = database.transaction([name], 'readonly', {
      durability: 'relaxed'
    });
    var objectStore = transaction.objectStore(name);

    transaction.onabort = function (event) {
      logger.error("Read-only \"".concat(name, "\" transaction was aborted"));
      logger.errorObject(event);
    };

    transaction.onerror = function (event) {
      logger.error("Error in read-only \"".concat(name, "\" transaction"));
      logger.errorObject(event);
    };

    return objectStore;
  });
  return _getReadOnlyObjectStore.apply(this, arguments);
}

function getReadWriteArgLookupObjectStore() {
  return getReadWriteObjectStore('arg-lookup');
}

function getReadOnlyArgLookupObjectStore() {
  return getReadOnlyObjectStore('arg-lookup');
}

function getReadWriteAuthObjectStore() {
  return getReadWriteObjectStore('auth-data');
}

function getReadOnlyAuthObjectStore() {
  return getReadOnlyObjectStore('auth-data');
}

function getReadWriteMetadataObjectStore() {
  return getReadWriteObjectStore('metadata');
}

function getReadOnlyMetadataObjectStore() {
  return getReadOnlyObjectStore('metadata');
}

function getReadWriteJobsObjectStore() {
  return getReadWriteObjectStore('jobs');
}

function getReadOnlyJobsObjectStore() {
  return getReadOnlyObjectStore('jobs');
}

function getReadWriteCleanupsObjectStore() {
  return getReadWriteObjectStore('cleanups');
}

function getReadOnlyCleanupsObjectStore() {
  return getReadOnlyObjectStore('cleanups');
}

function getReadWriteJobCleanupAndArgLookupStores() {
  return _getReadWriteJobCleanupAndArgLookupStores.apply(this, arguments);
}

function _getReadWriteJobCleanupAndArgLookupStores() {
  _getReadWriteJobCleanupAndArgLookupStores = _asyncToGenerator(function* () {
    var database = yield databasePromise;
    var transaction = database.transaction(['jobs', 'cleanups', 'arg-lookup'], 'readwrite', {
      durability: 'relaxed'
    });

    transaction.onabort = function (event) {
      logger.error('Read-write \'jobs\', \'cleanups\', and \'arg-lookup\' transaction was aborted');
      logger.errorObject(event);
    };

    transaction.onerror = function (event) {
      logger.error('Error in read-write \'jobs\', \'cleanups\', and \'arg-lookup\' transaction');
      logger.errorObject(event);
    };

    return [transaction.objectStore('jobs'), transaction.objectStore('cleanups'), transaction.objectStore('arg-lookup')];
  });
  return _getReadWriteJobCleanupAndArgLookupStores.apply(this, arguments);
}

function getReadWriteJobAndCleanupStores() {
  return _getReadWriteJobAndCleanupStores.apply(this, arguments);
}

function _getReadWriteJobAndCleanupStores() {
  _getReadWriteJobAndCleanupStores = _asyncToGenerator(function* () {
    var database = yield databasePromise;
    var transaction = database.transaction(['jobs', 'cleanups'], 'readwrite', {
      durability: 'relaxed'
    });

    transaction.onabort = function (event) {
      logger.error('Read-write \'jobs\' and \'cleanups\' transaction was aborted');
      logger.errorObject(event);
    };

    transaction.onerror = function (event) {
      logger.error('Error in read-write \'jobs\' and \'cleanups\' transaction');
      logger.errorObject(event);
    };

    return [transaction.objectStore('jobs'), transaction.objectStore('cleanups')];
  });
  return _getReadWriteJobAndCleanupStores.apply(this, arguments);
}

function getReadOnlyObjectStoreAndTransactionPromise(_x3) {
  return _getReadOnlyObjectStoreAndTransactionPromise.apply(this, arguments);
}

function _getReadOnlyObjectStoreAndTransactionPromise() {
  _getReadOnlyObjectStoreAndTransactionPromise = _asyncToGenerator(function* (name) {
    var database = yield databasePromise;
    var transaction = database.transaction([name], 'readonly', {
      durability: 'relaxed'
    });
    var objectStore = transaction.objectStore(name);
    var promise = new Promise(function (resolve, reject) {
      transaction.onabort = function (event) {
        logger.error("Read-write \"".concat(name, "\" transaction was aborted"));
        logger.errorObject(event);
        reject(new Error("Read-write \"".concat(name, "\" transaction was aborted")));
      };

      transaction.onerror = function (event) {
        logger.error("Error in read-write \"".concat(name, "\" transaction"));
        logger.errorObject(event);
        reject(new Error("Error in read-write \"".concat(name, "\" transaction")));
      };

      transaction.oncomplete = function () {
        resolve();
      };
    });
    return [objectStore, promise];
  });
  return _getReadOnlyObjectStoreAndTransactionPromise.apply(this, arguments);
}

function getReadOnlyJobsObjectStoreAndTransactionPromise() {
  return getReadOnlyObjectStoreAndTransactionPromise('jobs');
}

function silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, onSuccess, onError) {
  var jobDeleteRequest = jobsObjectStore.delete(jobId);

  jobDeleteRequest.onerror = function (event) {
    logger.error("Request error while removing job ".concat(jobId, " in queue ").concat(queueId, " from database"));
    logger.errorObject(event);

    if (typeof onError === 'function') {
      onError(new Error("Request error while removing job ".concat(jobId, " in queue ").concat(queueId, " from database")));
    }
  };

  var cleanupDeleteRequest = cleanupsObjectStore.delete(jobId);

  cleanupDeleteRequest.onerror = function (event) {
    logger.error("Request error while removing cleanup for job ".concat(jobId, " in queue ").concat(queueId, " from database"));
    logger.errorObject(event);

    if (typeof onError === 'function') {
      onError(new Error("Request error while removing cleanup for job ".concat(jobId, " in queue ").concat(queueId, " from database")));
    }
  };

  var argLookupJobIdIndex = argLookupObjectStore.index('jobIdIndex'); // $FlowFixMe

  var argLookupJobRequest = argLookupJobIdIndex.getAllKeys(IDBKeyRange.only(jobId));

  argLookupJobRequest.onsuccess = function (event) {
    var _iterator = _createForOfIteratorHelper(event.target.result),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var id = _step.value;
        var argLookupDeleteRequest = argLookupObjectStore.delete(id);

        argLookupDeleteRequest.onerror = function (deleteEvent) {
          logger.error("Delete request error while removing argument lookups for job ".concat(jobId, " in queue ").concat(queueId, " from database"));
          logger.errorObject(deleteEvent);

          if (typeof onError === 'function') {
            onError(new Error("Delete request error while removing argument lookups for job ".concat(jobId, " in queue ").concat(queueId, " from database")));
          }
        };
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  argLookupJobRequest.onerror = function (event) {
    logger.error("Request error while removing argument lookups for job ".concat(jobId, " in queue ").concat(queueId, " from database"));
    logger.errorObject(event);

    if (typeof onError === 'function') {
      onError(new Error("Request error while removing argument lookups for job ".concat(jobId, " in queue ").concat(queueId, " from database")));
    }
  };
}

function removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, onSuccess, onError) {
  queueMicrotask(function () {
    localJobEmitter.emit('jobDelete', jobId, queueId);
    jobEmitter.emit('jobDelete', jobId, queueId);
  });
  return silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, onSuccess, onError);
}

function clearAllMetadataInDatabase() {
  return _clearAllMetadataInDatabase.apply(this, arguments);
}

function _clearAllMetadataInDatabase() {
  _clearAllMetadataInDatabase = _asyncToGenerator(function* () {
    var store = yield getReadWriteMetadataObjectStore();
    var request = store.clear();
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error('Error while clearing queue data database');
        logger.errorObject(event);
        reject(new Error('Error while clearing queue data database'));
      };

      store.transaction.commit();
    });
  });
  return _clearAllMetadataInDatabase.apply(this, arguments);
}

function clearJobsDatabase() {
  return _clearJobsDatabase.apply(this, arguments);
}

function _clearJobsDatabase() {
  _clearJobsDatabase = _asyncToGenerator(function* () {
    var store = yield getReadWriteJobsObjectStore();
    var request = store.clear();
    localJobEmitter.emit('jobsClear');
    jobEmitter.emit('jobsClear');
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error('Error while clearing jobs database');
        logger.errorObject(event);
        reject(new Error('Error while clearing jobs database'));
      };

      store.transaction.commit();
    });
  });
  return _clearJobsDatabase.apply(this, arguments);
}

function clearCleanupsDatabase() {
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearCleanupsDatabase() {
  _clearCleanupsDatabase = _asyncToGenerator(function* () {
    var store = yield getReadWriteCleanupsObjectStore();
    var request = store.clear();
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error('Error while clearing cleanups database');
        logger.errorObject(event);
        reject(new Error('Error while clearing cleanups database'));
      };

      store.transaction.commit();
    });
  });
  return _clearCleanupsDatabase.apply(this, arguments);
}

function clearDatabase() {
  return _clearDatabase.apply(this, arguments);
}

function _clearDatabase() {
  _clearDatabase = _asyncToGenerator(function* () {
    yield clearJobsDatabase();
    yield clearCleanupsDatabase();
    yield clearAllMetadataInDatabase();
  });
  return _clearDatabase.apply(this, arguments);
}

function removeJobsWithQueueIdAndTypeFromDatabase(_x4, _x5) {
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase() {
  _removeJobsWithQueueIdAndTypeFromDatabase = _asyncToGenerator(function* (queueId, type) {
    var _yield$getReadWriteJo = yield getReadWriteJobCleanupAndArgLookupStores(),
        _yield$getReadWriteJo2 = _slicedToArray(_yield$getReadWriteJo, 3),
        jobsObjectStore = _yield$getReadWriteJo2[0],
        cleanupsObjectStore = _yield$getReadWriteJo2[1],
        argLookupObjectStore = _yield$getReadWriteJo2[2];

    var index = jobsObjectStore.index('queueIdTypeIndex'); // $FlowFixMe

    var request = index.getAllKeys(IDBKeyRange.only([queueId, type]));
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var jobIds = event.target.result;

        for (var i = 0; i < jobIds.length; i += 1) {
          var jobId = jobIds[i];

          if (i === jobIds.length - 1) {
            removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, resolve, reject);
          } else {
            removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
          }
        }
      };

      request.onerror = function (event) {
        logger.error("Request error while removing jobs with queue ".concat(queueId, " and type ").concat(type, " from jobs database"));
        logger.errorObject(event);
      };
    });
  });
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function removeQueueFromDatabase(_x6) {
  return _removeQueueFromDatabase.apply(this, arguments);
}

function _removeQueueFromDatabase() {
  _removeQueueFromDatabase = _asyncToGenerator(function* (queueId) {
    var _yield$getReadWriteJo3 = yield getReadWriteJobCleanupAndArgLookupStores(),
        _yield$getReadWriteJo4 = _slicedToArray(_yield$getReadWriteJo3, 3),
        jobsObjectStore = _yield$getReadWriteJo4[0],
        cleanupsObjectStore = _yield$getReadWriteJo4[1],
        argLookupObjectStore = _yield$getReadWriteJo4[2];

    var index = jobsObjectStore.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAllKeys(IDBKeyRange.only(queueId));
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var jobIds = event.target.result;

        for (var i = 0; i < jobIds.length; i += 1) {
          var jobId = jobIds[i];

          if (i === jobIds.length - 1) {
            removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, function () {
              jobsObjectStore.transaction.commit();
              resolve();
            }, reject);
          } else {
            removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
          }
        }
      };

      request.onerror = function (event) {
        logger.error("Request error while removing queue ".concat(queueId, " from jobs database"));
        logger.errorObject(event);
        reject(new Error("Request error while removing queue ".concat(queueId, " from jobs database")));
      };
    });
  });
  return _removeQueueFromDatabase.apply(this, arguments);
}

function removeCompletedExpiredItemsFromDatabase(_x7) {
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase() {
  _removeCompletedExpiredItemsFromDatabase = _asyncToGenerator(function* (maxAge) {
    var _yield$getReadWriteJo5 = yield getReadWriteJobCleanupAndArgLookupStores(),
        _yield$getReadWriteJo6 = _slicedToArray(_yield$getReadWriteJo5, 3),
        jobsObjectStore = _yield$getReadWriteJo6[0],
        cleanupsObjectStore = _yield$getReadWriteJo6[1],
        argLookupObjectStore = _yield$getReadWriteJo6[2];

    var index = jobsObjectStore.index('statusCreatedIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.bound([JOB_COMPLETE_STATUS, 0], [JOB_COMPLETE_STATUS, Date.now() - maxAge]));
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var jobs = event.target.result;

        for (var i = 0; i < jobs.length; i += 1) {
          var _jobs$i = jobs[i],
              jobId = _jobs$i.id,
              queueId = _jobs$i.queueId;

          if (i === jobs.length - 1) {
            removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, function () {
              jobsObjectStore.transaction.commit();
              resolve();
            }, reject);
          } else {
            removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
          }
        }

        if (jobs.length === 0) {
          resolve();
        }
      };

      request.onerror = function (event) {
        logger.error("Request error while removing completed jobs with age > ".concat(maxAge, "ms"));
        logger.errorObject(event);
        reject(new Error("Request error while removing completed jobs with age > ".concat(maxAge, "ms")));
      };
    });
  });
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function updateJobInDatabase(_x8, _x9) {
  return _updateJobInDatabase.apply(this, arguments);
}

function _updateJobInDatabase() {
  _updateJobInDatabase = _asyncToGenerator(function* (id, transform) {
    var store = yield getReadWriteJobsObjectStore();
    var request = store.get(id);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        var newValue;
        var value = request.result;

        try {
          newValue = transform(value);
        } catch (error) {
          reject(error);
          return;
        }

        if (typeof newValue === 'undefined') {
          resolve();
        } else if (newValue === false) {
          if (typeof value !== 'undefined') {
            var queueId = value.queueId,
                type = value.type;
            var deleteRequest = store.delete(id);
            localJobEmitter.emit('jobDelete', id, queueId);
            jobEmitter.emit('jobDelete', id, queueId);

            deleteRequest.onsuccess = function () {
              removeArgLookupsAndCleanupsForJobAsMicrotask(id);
              resolve();
            };

            deleteRequest.onerror = function (event) {
              logger.error("Delete request error while updating job ".concat(id, " in queue ").concat(queueId, " and type ").concat(type, " in jobs database"));
              logger.errorObject(event);
              reject(new Error("Delete request error while updating job ".concat(id, " in queue ").concat(queueId, " and type ").concat(type, " from jobs database")));
            };
          } else {
            resolve();
          }
        } else {
          var _newValue = newValue,
              _queueId = _newValue.queueId,
              _type = _newValue.type,
              status = _newValue.status;
          var putRequest = store.put(newValue);
          localJobEmitter.emit('jobUpdate', id, _queueId, _type, status);
          jobEmitter.emit('jobUpdate', id, _queueId, _type, status);

          putRequest.onsuccess = function () {
            resolve();
          };

          putRequest.onerror = function (event) {
            logger.error("Put request error while updating job ".concat(id, " in queue ").concat(_queueId, " and type ").concat(_type, " in jobs database"));
            logger.errorObject(event);
            reject(new Error("Put request error while updating job ".concat(id, " in queue ").concat(_queueId, " and type ").concat(_type, " from jobs database")));
          };
        }

        store.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Get request error while updating ".concat(id));
        logger.errorObject(event);
        reject(new Error("Get request error while updating ".concat(id)));
      };
    });
  });
  return _updateJobInDatabase.apply(this, arguments);
}

function getJobFromDatabase(_x10) {
  return _getJobFromDatabase.apply(this, arguments);
}

function _getJobFromDatabase() {
  _getJobFromDatabase = _asyncToGenerator(function* (id) {
    var store = yield getReadOnlyJobsObjectStore();
    var request = store.get(id);
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting ".concat(id));
        logger.errorObject(event);
        reject(new Error("Request error while getting ".concat(id)));
      };

      store.transaction.commit();
    });
  });
  return _getJobFromDatabase.apply(this, arguments);
}

function updateCleanupInDatabase(_x11, _x12) {
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase() {
  _updateCleanupInDatabase = _asyncToGenerator(function* (id, transform) {
    var store = yield getReadWriteCleanupsObjectStore();
    var request = store.get(id);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        var newValue;

        try {
          newValue = transform(request.result);
        } catch (error) {
          reject(error);
          return;
        }

        if (typeof newValue === 'undefined') {
          resolve();
        } else {
          var putRequest = store.put(newValue);

          putRequest.onsuccess = function () {
            resolve();
          };

          putRequest.onerror = function (event) {
            logger.error("Put request error while updating ".concat(id, " cleanup"));
            logger.errorObject(event);
            reject(new Error("Put request error while updating ".concat(id, " cleanup")));
          };
        }

        store.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Get request error while updating ".concat(id, " cleanup"));
        logger.errorObject(event);
        reject(new Error("Get request error while updating ".concat(id, " cleanup")));
      };
    });
  });
  return _updateCleanupInDatabase.apply(this, arguments);
}

function removePathFromCleanupDataInDatabase(_x13, _x14) {
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase() {
  _removePathFromCleanupDataInDatabase = _asyncToGenerator(function* (id, path) {
    yield updateCleanupInDatabase(id, function (value) {
      if (typeof value === 'undefined') {
        return;
      }

      var queueId = value.queueId,
          attempt = value.attempt,
          startAfter = value.startAfter;
      var data = Object.assign({}, value.data);
      (0, _unset.default)(data, path);
      return {
        // eslint-disable-line consistent-return
        id: id,
        queueId: queueId,
        attempt: attempt,
        startAfter: startAfter,
        data: data
      };
    });
  });
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function updateCleanupValuesInDatabase(_x15, _x16, _x17) {
  return _updateCleanupValuesInDatabase.apply(this, arguments);
}

function _updateCleanupValuesInDatabase() {
  _updateCleanupValuesInDatabase = _asyncToGenerator(function* (id, queueId, data) {
    if (typeof id !== 'number') {
      throw new TypeError("Unable to update cleanup in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));
    }

    if (typeof queueId !== 'string') {
      throw new TypeError("Unable to update cleanup in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));
    }

    if (_typeof(data) !== 'object') {
      throw new TypeError("Unable to update cleanup in database, received invalid \"data\" argument type \"".concat(_typeof(data), "\""));
    }

    yield updateCleanupInDatabase(id, function (value) {
      var combinedData = typeof value === 'undefined' ? data : (0, _merge.default)({}, value.data, data);
      return {
        id: id,
        queueId: queueId,
        attempt: 0,
        startAfter: Date.now(),
        data: combinedData
      };
    });
  });
  return _updateCleanupValuesInDatabase.apply(this, arguments);
}

function silentlyRemoveQueueFromDatabase(_x18) {
  return _silentlyRemoveQueueFromDatabase.apply(this, arguments);
}

function _silentlyRemoveQueueFromDatabase() {
  _silentlyRemoveQueueFromDatabase = _asyncToGenerator(function* (queueId) {
    var _yield$getReadWriteJo7 = yield getReadWriteJobCleanupAndArgLookupStores(),
        _yield$getReadWriteJo8 = _slicedToArray(_yield$getReadWriteJo7, 3),
        jobsObjectStore = _yield$getReadWriteJo8[0],
        cleanupsObjectStore = _yield$getReadWriteJo8[1],
        argLookupObjectStore = _yield$getReadWriteJo8[2];

    var index = jobsObjectStore.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAllKeys(IDBKeyRange.only(queueId));
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var jobIds = event.target.result;

        for (var i = 0; i < jobIds.length; i += 1) {
          var jobId = jobIds[i];

          if (i === jobIds.length - 1) {
            silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId, function () {
              jobsObjectStore.transaction.commit();
              resolve();
            }, reject);
          } else {
            silentlyRemoveJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, jobId, queueId);
          }
        }
      };

      request.onerror = function (event) {
        logger.error("Request error while removing queue ".concat(queueId, " from jobs database"));
        logger.errorObject(event);
        reject(new Error("Request error while removing queue ".concat(queueId, " from jobs database")));
      };
    });
  });
  return _silentlyRemoveQueueFromDatabase.apply(this, arguments);
}

function silentlyRemoveJobFromDatabase(_x19) {
  return _silentlyRemoveJobFromDatabase.apply(this, arguments);
}

function _silentlyRemoveJobFromDatabase() {
  _silentlyRemoveJobFromDatabase = _asyncToGenerator(function* (id) {
    var store = yield getReadWriteJobsObjectStore();
    var request = store.delete(id);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Delete request error while removing job ".concat(id, " from database"));
        logger.errorObject(event);
        reject(new Error("Delete request error while removing job ".concat(id, " from database")));
      };

      store.transaction.commit();
    });
  });
  return _silentlyRemoveJobFromDatabase.apply(this, arguments);
}

function removeJobFromDatabase(_x20) {
  return _removeJobFromDatabase.apply(this, arguments);
}

function _removeJobFromDatabase() {
  _removeJobFromDatabase = _asyncToGenerator(function* (jobId) {
    var _yield$getReadWriteJo9 = yield getReadWriteJobCleanupAndArgLookupStores(),
        _yield$getReadWriteJo10 = _slicedToArray(_yield$getReadWriteJo9, 3),
        jobsObjectStore = _yield$getReadWriteJo10[0],
        cleanupsObjectStore = _yield$getReadWriteJo10[1],
        argLookupObjectStore = _yield$getReadWriteJo10[2];

    var request = jobsObjectStore.get(jobId);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        var job = request.result;

        if (typeof job === 'undefined') {
          resolve();
          jobsObjectStore.transaction.commit();
          return;
        }

        removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, job.id, job.queueId, function () {
          resolve();
        }, reject);
        jobsObjectStore.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Request error while getting job ".concat(jobId, " before removing from database"));
        logger.errorObject(event);
        reject(new Error("Request error while getting job ".concat(jobId, " before removing from database")));
      };
    });
  });
  return _removeJobFromDatabase.apply(this, arguments);
}

function removeCleanupFromDatabase(_x21) {
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase() {
  _removeCleanupFromDatabase = _asyncToGenerator(function* (id) {
    var store = yield getReadWriteCleanupsObjectStore();
    var request = store.delete(id);
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Error while removing cleanup data for ".concat(id));
        logger.errorObject(event);
        reject(new Error("Error while removing cleanup data for ".concat(id)));
      };

      store.transaction.commit();
    });
  });
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function getCleanupFromDatabase(_x22) {
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase() {
  _getCleanupFromDatabase = _asyncToGenerator(function* (id) {
    var store = yield getReadOnlyCleanupsObjectStore();
    var request = store.get(id);
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting ".concat(id));
        logger.errorObject(event);
        reject(new Error("Request error while getting ".concat(id)));
      };

      store.transaction.commit();
    });
  });
  return _getCleanupFromDatabase.apply(this, arguments);
}

function getMetadataFromDatabase(_x23) {
  return _getMetadataFromDatabase.apply(this, arguments);
}

function _getMetadataFromDatabase() {
  _getMetadataFromDatabase = _asyncToGenerator(function* (id) {
    var store = yield getReadOnlyMetadataObjectStore();
    var request = store.get(id);
    var response = yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting ".concat(id, " metadata"));
        logger.errorObject(event);
        reject(new Error("Request error while getting ".concat(id, " metadata")));
      };

      store.transaction.commit();
    });
    return typeof response !== 'undefined' ? response.metadata : undefined;
  });
  return _getMetadataFromDatabase.apply(this, arguments);
}

function clearMetadataInDatabase(_x24) {
  return _clearMetadataInDatabase.apply(this, arguments);
}

function _clearMetadataInDatabase() {
  _clearMetadataInDatabase = _asyncToGenerator(function* (id) {
    var store = yield getReadWriteMetadataObjectStore();
    var request = store.delete(id);
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Error while clearing ".concat(id, " metadata"));
        logger.errorObject(event);
        reject(new Error("Error while clearing ".concat(id, " metadata")));
      };

      store.transaction.commit();
    });
  });
  return _clearMetadataInDatabase.apply(this, arguments);
}

function setMetadataInDatabase(_x25, _x26) {
  return _setMetadataInDatabase.apply(this, arguments);
}

function _setMetadataInDatabase() {
  _setMetadataInDatabase = _asyncToGenerator(function* (id, metadata) {
    var store = yield getReadWriteMetadataObjectStore();
    var request = store.put({
      id: id,
      metadata: metadata
    });
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Error while setting ".concat(id, " metadata"));
        logger.errorObject(event);
        reject(new Error("Error while setting ".concat(id, " metadata")));
      };

      store.transaction.commit();
    });
  });
  return _setMetadataInDatabase.apply(this, arguments);
}

function updateMetadataInDatabase(_x27, _x28) {
  return _updateMetadataInDatabase.apply(this, arguments);
}

function _updateMetadataInDatabase() {
  _updateMetadataInDatabase = _asyncToGenerator(function* (id, transform) {
    var store = yield getReadWriteMetadataObjectStore();
    var request = store.get(id);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        var newValue;
        var response = request.result;
        var value = typeof response !== 'undefined' ? response.metadata : undefined;

        try {
          newValue = transform(value);
        } catch (error) {
          reject(error);
          return;
        }

        if (typeof newValue === 'undefined') {
          resolve();
        } else if (newValue === false) {
          if (typeof value !== 'undefined') {
            var deleteRequest = store.delete(id);

            deleteRequest.onsuccess = function () {
              resolve();
            };

            deleteRequest.onerror = function (event) {
              logger.error("Delete request error while updating ".concat(id, " in metadata database"));
              logger.errorObject(event);
              reject(new Error("Delete request error while updating ".concat(id, " in metadata database")));
            };
          }
        } else {
          var putRequest = store.put({
            id: id,
            metadata: newValue
          });

          putRequest.onsuccess = function () {
            resolve();
          };

          putRequest.onerror = function (event) {
            logger.error("Put request error while updating ".concat(id, " in metadata database"));
            logger.errorObject(event);
            reject(new Error("Put request error while updating ".concat(id, " in metadata database")));
          };
        }

        store.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Get request error while updating ".concat(id, " in metadata database"));
        logger.errorObject(event);
        reject(new Error("Get request error while updating ".concat(id, " in metadata database")));
      };
    });
  });
  return _updateMetadataInDatabase.apply(this, arguments);
}

function markJobStatusInDatabase(id, status) {
  return updateJobInDatabase(id, function (value) {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError("Unable to mark job ".concat(id, " as status ").concat(status, " in database, job does not exist"));
    }

    value.status = status; // eslint-disable-line no-param-reassign

    return value;
  });
}

function markJobCompleteInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_COMPLETE_STATUS);
}

function markJobPendingInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_PENDING_STATUS);
}

function markJobErrorInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_ERROR_STATUS);
}

function markJobCleanupInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_CLEANUP_STATUS);
}

function markJobAbortedInDatabase(id) {
  return markJobStatusInDatabase(id, JOB_ABORTED_STATUS);
}

function markJobCompleteThenRemoveFromDatabase(_x29) {
  return _markJobCompleteThenRemoveFromDatabase.apply(this, arguments);
}

function _markJobCompleteThenRemoveFromDatabase() {
  _markJobCompleteThenRemoveFromDatabase = _asyncToGenerator(function* (id) {
    var _yield$getReadWriteJo11 = yield getReadWriteJobCleanupAndArgLookupStores(),
        _yield$getReadWriteJo12 = _slicedToArray(_yield$getReadWriteJo11, 3),
        jobsObjectStore = _yield$getReadWriteJo12[0],
        cleanupsObjectStore = _yield$getReadWriteJo12[1],
        argLookupObjectStore = _yield$getReadWriteJo12[2];

    var request = jobsObjectStore.get(id);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        var value = request.result;

        if (typeof value !== 'undefined') {
          var queueId = value.queueId,
              type = value.type;
          localJobEmitter.emit('jobUpdate', id, queueId, type, JOB_COMPLETE_STATUS);
          jobEmitter.emit('jobUpdate', id, queueId, type, JOB_COMPLETE_STATUS);
          removeJobCleanupAndArgLookup(jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, id, queueId, function () {
            jobsObjectStore.transaction.commit();
            resolve();
          });
        }
      };

      request.onerror = function (event) {
        logger.error("Get request error while marking job ".concat(id, " complete then removing from jobs database"));
        logger.errorObject(event);
        reject(new Error("Get request error while marking job ".concat(id, " complete then removing from jobs database")));
      };
    });
  });
  return _markJobCompleteThenRemoveFromDatabase.apply(this, arguments);
}

function markJobCleanupAndRemoveInDatabase(id) {
  return updateJobInDatabase(id, function (value) {
    if (typeof value === 'undefined') {
      return false;
    }

    if (value.status === JOB_PENDING_STATUS) {
      return false;
    }

    if (value.status === JOB_ABORTED_STATUS) {
      return false;
    }

    value.status = JOB_CLEANUP_AND_REMOVE_STATUS; // eslint-disable-line no-param-reassign

    return value;
  });
}

function markJobAsAbortedOrRemoveFromDatabase(id) {
  return updateJobInDatabase(id, function (value) {
    if (typeof value === 'undefined') {
      return;
    }

    if (value.status === JOB_ERROR_STATUS) {
      value.status = JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign

      return value; // eslint-disable-line consistent-return
    }

    if (value.status === JOB_CLEANUP_STATUS) {
      value.status = JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign

      return value; // eslint-disable-line consistent-return
    }

    if (value.status === JOB_CLEANUP_AND_REMOVE_STATUS) {
      return false; // eslint-disable-line consistent-return
    }

    throw new Error("Unable to mark job ".concat(id, " as aborted or remove after cleanup, unable to handle status ").concat(value.status));
  });
}

function markJobStartAfterInDatabase(id, startAfter) {
  return updateJobInDatabase(id, function (value) {
    if (typeof value === 'undefined') {
      throw new JobDoesNotExistError("Unable to mark job ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, job does not exist"));
    }

    if (startAfter < value.startAfter) {
      return;
    }

    value.startAfter = startAfter; // eslint-disable-line no-param-reassign

    return value; // eslint-disable-line consistent-return
  });
}

function markCleanupStartAfterInDatabase(id, startAfter) {
  return updateCleanupInDatabase(id, function (value) {
    if (typeof value === 'undefined') {
      throw new CleanupDoesNotExistError("Unable to mark cleanup ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, cleanup does not exist"));
    }

    if (startAfter < value.startAfter) {
      return;
    }

    value.startAfter = startAfter; // eslint-disable-line  no-param-reassign

    return value; // eslint-disable-line consistent-return
  });
}

function markQueueForCleanupInDatabase(_x30) {
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _markQueueForCleanupInDatabase() {
  _markQueueForCleanupInDatabase = _asyncToGenerator(function* (queueId) {
    var store = yield getReadWriteJobsObjectStore();
    var index = store.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(queueId));
    var jobs = [];
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var length = event.target.result.length;
        var lastRequest;

        for (var i = 0; i < length; i += 1) {
          var value = Object.assign({}, event.target.result[i]);

          switch (value.status) {
            case JOB_ERROR_STATUS:
              value.status = JOB_CLEANUP_STATUS;
              jobs.push(value);
              break;

            case JOB_COMPLETE_STATUS:
              value.status = JOB_CLEANUP_STATUS;
              jobs.push(value);
              break;

            case JOB_PENDING_STATUS:
              value.status = JOB_ABORTED_STATUS;
              break;

            case JOB_CLEANUP_STATUS:
              jobs.push(value);
              continue;

            case JOB_CLEANUP_AND_REMOVE_STATUS:
              jobs.push(value);
              continue;

            case JOB_ABORTED_STATUS:
              continue;

            default:
              logger.warn("Unhandled job status ".concat(value.status, " while marking queue ").concat(queueId, " for cleanup"));
              continue;
          }

          var putRequest = store.put(value);
          localJobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);
          jobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);
          lastRequest = putRequest;

          putRequest.onerror = function (event2) {
            logger.error("Put request error while marking queue ".concat(queueId, " for cleanup"));
            logger.errorObject(event2);
            reject(new Error("Put request error while marking queue ".concat(queueId, " for cleanup")));
          };
        }

        if (typeof lastRequest !== 'undefined') {
          lastRequest.onsuccess = function () {
            resolve();
          };
        } else {
          resolve();
        }

        store.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Request error while marking queue ".concat(queueId, " for cleanup"));
        logger.errorObject(event);
        reject(new Error("Request error while marking queue ".concat(queueId, " for cleanup")));
      };
    });
    return jobs;
  });
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(_x31, _x32) {
  return _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase.apply(this, arguments);
}

function _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase() {
  _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase = _asyncToGenerator(function* (queueId, jobId) {
    var store = yield getReadWriteJobsObjectStore();
    var index = store.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(queueId));
    var jobs = [];
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var length = event.target.result.length;
        var lastRequest;

        for (var i = 0; i < length; i += 1) {
          var value = Object.assign({}, event.target.result[i]);

          if (value.id <= jobId) {
            continue;
          }

          var shouldRemove = false;

          switch (value.status) {
            case JOB_ERROR_STATUS:
              value.status = JOB_CLEANUP_AND_REMOVE_STATUS;
              jobs.push(value);
              break;

            case JOB_COMPLETE_STATUS:
              value.status = JOB_CLEANUP_AND_REMOVE_STATUS;
              jobs.push(value);
              break;

            case JOB_PENDING_STATUS:
              shouldRemove = true;
              break;

            case JOB_CLEANUP_STATUS:
              value.status = JOB_CLEANUP_AND_REMOVE_STATUS;
              jobs.push(value);
              break;

            case JOB_CLEANUP_AND_REMOVE_STATUS:
              jobs.push(value);
              continue;

            case JOB_ABORTED_STATUS:
              shouldRemove = true;
              break;

            default:
              logger.warn("Unhandled job status ".concat(value.status, " while marking queue ").concat(queueId, " for cleanup and removal"));
              continue;
          }

          var id = value.id,
              type = value.type,
              status = value.status;

          if (shouldRemove) {
            var deleteRequest = store.delete(id);
            localJobEmitter.emit('jobDelete', id, queueId);
            jobEmitter.emit('jobDelete', id, queueId);
            removeArgLookupsAndCleanupsForJobAsMicrotask(id);
            lastRequest = deleteRequest;

            deleteRequest.onerror = function (event2) {
              logger.error("Delete request error while marking queue ".concat(queueId, " for cleanup and removal"));
              logger.errorObject(event2);
              reject(new Error("Delete request error while marking queue ".concat(queueId, " for cleanup and removal")));
            };
          } else {
            var putRequest = store.put(value);
            localJobEmitter.emit('jobUpdate', id, queueId, type, status);
            jobEmitter.emit('jobUpdate', id, queueId, type, status);
            lastRequest = putRequest;

            putRequest.onerror = function (event2) {
              logger.error("Put request error while marking queue ".concat(queueId, " for cleanup and removal"));
              logger.errorObject(event2);
              reject(new Error("Put request error while marking queue ".concat(queueId, " for cleanup and removal")));
            };
          }
        }

        if (typeof lastRequest !== 'undefined') {
          lastRequest.onsuccess = function () {
            resolve();
          };
        } else {
          resolve();
        }

        store.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Request error while marking queue ".concat(queueId, " for cleanup and removal"));
        logger.errorObject(event);
        reject(new Error("Request error while marking queue ".concat(queueId, " for cleanup and removal")));
      };
    });
    return jobs;
  });
  return _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase.apply(this, arguments);
}

function markQueueForCleanupAndRemoveInDatabase(queueId) {
  return markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase(queueId, -1);
}

function markQueueJobsGreaterThanIdPendingInDatabase(_x33, _x34) {
  return _markQueueJobsGreaterThanIdPendingInDatabase.apply(this, arguments);
}

function _markQueueJobsGreaterThanIdPendingInDatabase() {
  _markQueueJobsGreaterThanIdPendingInDatabase = _asyncToGenerator(function* (queueId, jobId) {
    var store = yield getReadWriteJobsObjectStore();
    var index = store.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(queueId));
    var jobs = [];
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var length = event.target.result.length;
        var lastRequest;

        for (var i = 0; i < length; i += 1) {
          var value = Object.assign({}, event.target.result[i]);

          if (value.id <= jobId) {
            continue;
          }

          switch (value.status) {
            case JOB_ERROR_STATUS:
              value.attempt = 0;
              jobs.push(value);
              break;

            case JOB_COMPLETE_STATUS:
              continue;

            case JOB_PENDING_STATUS:
              value.attempt = 0;
              jobs.push(value);
              break;

            case JOB_CLEANUP_STATUS:
              value.attempt = 0;
              jobs.push(value);
              break;

            case JOB_CLEANUP_AND_REMOVE_STATUS:
              jobs.push(value);
              continue;

            case JOB_ABORTED_STATUS:
              value.attempt = 0;
              value.status = JOB_PENDING_STATUS;
              jobs.push(value);
              break;

            default:
              logger.warn("Unhandled job status ".concat(value.status, " while marking queue ").concat(queueId, " as pending"));
              continue;
          }

          var id = value.id,
              type = value.type,
              status = value.status;
          var putRequest = store.put(value);
          localJobEmitter.emit('jobUpdate', id, queueId, type, status);
          jobEmitter.emit('jobUpdate', id, queueId, type, status);
          lastRequest = putRequest;

          putRequest.onerror = function (event2) {
            logger.error("Put request error while marking queue ".concat(queueId, " as pending"));
            logger.errorObject(event2);
            reject(new Error("Put request error while marking queue ".concat(queueId, " as pending")));
          };
        }

        if (typeof lastRequest !== 'undefined') {
          lastRequest.onsuccess = function () {
            resolve();
          };
        } else {
          resolve();
        }

        store.transaction.commit();
      };

      request.onerror = function (event) {
        logger.error("Request error while marking queue ".concat(queueId, " as pending"));
        logger.errorObject(event);
        reject(new Error("Request error while marking queue ".concat(queueId, " as pending")));
      };
    });
    return jobs;
  });
  return _markQueueJobsGreaterThanIdPendingInDatabase.apply(this, arguments);
}

function markQueuePendingInDatabase(queueId) {
  return markQueueJobsGreaterThanIdPendingInDatabase(queueId, -1);
}

function getGreatestJobIdFromQueueInDatabase(_x35) {
  return _getGreatestJobIdFromQueueInDatabase.apply(this, arguments);
}

function _getGreatestJobIdFromQueueInDatabase() {
  _getGreatestJobIdFromQueueInDatabase = _asyncToGenerator(function* (queueId) {
    var store = yield getReadOnlyJobsObjectStore();
    var index = store.index('queueIdIndex'); // $FlowFixMe

    var request = index.openCursor(IDBKeyRange.only(queueId), 'prev');
    return new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
          resolve(cursor.value.id || 0);
        } else {
          resolve(0);
        }
      };

      request.onerror = function (event) {
        logger.error("Request error while getting the greatest job ID in queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting the greatest job ID in queue ".concat(queueId)));
      };

      store.transaction.commit();
    });
  });
  return _getGreatestJobIdFromQueueInDatabase.apply(this, arguments);
}

function incrementJobAttemptInDatabase(_x36) {
  return _incrementJobAttemptInDatabase.apply(this, arguments);
}

function _incrementJobAttemptInDatabase() {
  _incrementJobAttemptInDatabase = _asyncToGenerator(function* (id) {
    yield updateJobInDatabase(id, function (value) {
      if (typeof value === 'undefined') {
        throw new JobDoesNotExistError("Unable to increment attempts for job ".concat(id, " in database, job does not exist"));
      }

      value.attempt += 1; // eslint-disable-line no-param-reassign

      return value;
    });
  });
  return _incrementJobAttemptInDatabase.apply(this, arguments);
}

function incrementCleanupAttemptInDatabase(_x37, _x38) {
  return _incrementCleanupAttemptInDatabase.apply(this, arguments);
}

function _incrementCleanupAttemptInDatabase() {
  _incrementCleanupAttemptInDatabase = _asyncToGenerator(function* (id, queueId) {
    var attempt = 1;
    yield updateCleanupInDatabase(id, function (value) {
      if (typeof value === 'undefined') {
        return {
          id: id,
          queueId: queueId,
          attempt: 1,
          startAfter: Date.now(),
          data: {}
        };
      }

      attempt = value.attempt + 1;
      value.attempt = attempt; // eslint-disable-line no-param-reassign

      return value;
    });
    return attempt;
  });
  return _incrementCleanupAttemptInDatabase.apply(this, arguments);
}

function bulkEnqueueToDatabase(_x39) {
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase() {
  _bulkEnqueueToDatabase = _asyncToGenerator(function* (items) {
    // eslint-disable-line no-underscore-dangle
    if (!Array.isArray(items)) {
      throw new TypeError("Unable to bulk enqueue in database, received invalid \"items\" argument type \"".concat(_typeof(items), "\""));
    }

    var _iterator2 = _createForOfIteratorHelper(items),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _step2$value = _slicedToArray(_step2.value, 4),
            queueId = _step2$value[0],
            type = _step2$value[1],
            args = _step2$value[2],
            _step2$value$ = _step2$value[3],
            options = _step2$value$ === void 0 ? {} : _step2$value$;

        if (typeof queueId !== 'string') {
          throw new TypeError("Unable to enqueue in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\", should be string"));
        }

        if (typeof type !== 'string') {
          throw new TypeError("Unable to enqueue in database, received invalid \"type\" argument type \"".concat(_typeof(type), "\", should be string"));
        }

        if (!Array.isArray(args)) {
          throw new TypeError("Unable to enqueue in database, received invalid \"args\" argument type \"".concat(_typeof(args), "\", should be Array<any>"));
        }

        var delay = options.delay || 0;
        var prioritize = options.prioritize || false;

        if (typeof delay !== 'number') {
          throw new TypeError("Unable to enqueue in database, received invalid \"options.delay\" argument type \"".concat(_typeof(delay), "\", should be number"));
        }

        if (typeof prioritize !== 'boolean') {
          throw new TypeError("Unable to enqueue in database, received invalid \"options.prioritize\" argument type \"".concat(_typeof(prioritize), "\", should be boolean"));
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    var ids = [];
    var store = yield getReadWriteJobsObjectStore();
    var index = store.index('statusQueueIdIndex');
    var abortedQueueCheckPromiseMap = new Map();

    var _iterator3 = _createForOfIteratorHelper(items),
        _step3;

    try {
      var _loop2 = function _loop2() {
        var _step3$value = _slicedToArray(_step3.value, 1),
            queueId = _step3$value[0];

        if (abortedQueueCheckPromiseMap.has(queueId)) {
          return "continue";
        } // $FlowFixMe


        var abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ABORTED_STATUS]));
        var promise = new Promise(function (resolve, reject) {
          abortedRequest.onsuccess = function (e) {
            resolve(e.target.result.length > 0);
          };

          abortedRequest.onerror = function (event) {
            logger.error("Request error while checking for aborted jobs while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId));
            logger.errorObject(event);
            reject(new Error("Request error while checking for aborted jobs while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
          };
        });
        abortedQueueCheckPromiseMap.set(queueId, promise);
      };

      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var _ret2 = _loop2();

        if (_ret2 === "continue") continue;
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    yield new Promise(function (resolve, reject) {
      var _loop = function _loop(i) {
        var _items$i = _slicedToArray(items[i], 4),
            queueId = _items$i[0],
            type = _items$i[1],
            args = _items$i[2],
            _items$i$ = _items$i[3],
            options = _items$i$ === void 0 ? {} : _items$i$;

        var delay = typeof options.delay === 'number' ? options.delay : 0;
        var prioritize = typeof options.prioritize === 'boolean' ? options.prioritize : false;
        var value = {
          queueId: queueId,
          type: type,
          args: args,
          attempt: 0,
          created: Date.now(),
          status: JOB_PENDING_STATUS,
          startAfter: Date.now() + delay,
          prioritize: prioritize
        };
        var promise = abortedQueueCheckPromiseMap.get(queueId);

        if (!promise) {
          reject(new Error("Aborted queue check does not exist while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
          return {
            v: void 0
          };
        }

        promise.then(function (hasAbortedJobs) {
          console.log({
            hasAbortedJobs: hasAbortedJobs
          });

          if (hasAbortedJobs) {
            value.status = JOB_ABORTED_STATUS;
          }

          var request = store.put(value);

          request.onsuccess = function () {
            var id = request.result;
            ids.push(request.result);

            if (!hasAbortedJobs) {
              localJobEmitter.emit('jobAdd', id, queueId, type);
              jobEmitter.emit('jobAdd', id, queueId, type);
            }

            if (i === items.length - 1) {
              resolve();
            }
          };

          request.onerror = function (event) {
            logger.error("Request error while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId));
            logger.errorObject(event);
            reject(new Error("Request error while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
          };
        }).catch(reject);
      };

      for (var i = 0; i < items.length; i += 1) {
        var _ret = _loop(i);

        if (_typeof(_ret) === "object") return _ret.v;
      }
    });
    return ids;
  });
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function importJobsAndCleanups(_x40, _x41) {
  return _importJobsAndCleanups.apply(this, arguments);
}

function _importJobsAndCleanups() {
  _importJobsAndCleanups = _asyncToGenerator(function* (jobs, cleanups) {
    // eslint-disable-line no-underscore-dangle
    if (!Array.isArray(jobs)) {
      throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"jobs\" argument type \"".concat(_typeof(jobs), "\""));
    }

    if (!Array.isArray(cleanups)) {
      throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"cleanups\" argument type \"".concat(_typeof(cleanups), "\""));
    }

    var _iterator4 = _createForOfIteratorHelper(jobs),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var _step4$value = _step4.value,
            args = _step4$value.args,
            attempt = _step4$value.attempt,
            created = _step4$value.created,
            id = _step4$value.id,
            prioritize = _step4$value.prioritize,
            queueId = _step4$value.queueId,
            startAfter = _step4$value.startAfter,
            status = _step4$value.status,
            type = _step4$value.type;

        if (!Array.isArray(args)) {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"args\" argument type \"".concat(_typeof(args), "\", should be Array<any>"));
        }

        if (typeof attempt !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"attempt\" argument type \"".concat(_typeof(attempt), "\", should be number"));
        }

        if (typeof created !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"created\" argument type \"".concat(_typeof(created), "\", should be number"));
        }

        if (typeof id !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"id\" argument type \"".concat(_typeof(id), "\", should be number"));
        }

        if (typeof prioritize !== 'boolean') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"prioritize\" argument type \"".concat(_typeof(prioritize), "\", should be boolean"));
        }

        if (typeof queueId !== 'string') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\", should be string"));
        }

        if (typeof startAfter !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"startAfter\" argument type \"".concat(_typeof(startAfter), "\", should be number"));
        }

        if (typeof status !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"status\" argument type \"".concat(_typeof(status), "\", should be number"));
        }

        if (typeof type !== 'string') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"type\" argument type \"".concat(_typeof(type), "\", should be string"));
        }
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }

    var _iterator5 = _createForOfIteratorHelper(cleanups),
        _step5;

    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var _step5$value = _step5.value,
            _attempt = _step5$value.attempt,
            data = _step5$value.data,
            _id = _step5$value.id,
            _queueId2 = _step5$value.queueId,
            _startAfter = _step5$value.startAfter;

        if (typeof _attempt !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"attempt\" argument type \"".concat(_typeof(_attempt), "\", should be number"));
        }

        if (_typeof(data) !== 'object') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"data\" argument type \"".concat(_typeof(data), "\", should be object"));
        }

        if (typeof _id !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"id\" argument type \"".concat(_typeof(_id), "\", should be number"));
        }

        if (typeof _queueId2 !== 'string') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"queueId\" argument type \"".concat(_typeof(_queueId2), "\", should be string"));
        }

        if (typeof _startAfter !== 'number') {
          throw new TypeError("Unable to import jobs and cleanups into database, received invalid \"startAfter\" argument type \"".concat(_typeof(_startAfter), "\", should be number"));
        }
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }

    var jobIdSet = new Set();

    var _iterator6 = _createForOfIteratorHelper(jobs),
        _step6;

    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var _id2 = _step6.value.id;
        jobIdSet.add(_id2);
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }

    var cleanupMap = new Map();

    var _iterator7 = _createForOfIteratorHelper(cleanups),
        _step7;

    try {
      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
        var cleanup = _step7.value;

        if (jobIdSet.has(cleanup.id)) {
          cleanupMap.set(cleanup.id, cleanup);
        }
      }
    } catch (err) {
      _iterator7.e(err);
    } finally {
      _iterator7.f();
    }

    var _yield$getReadWriteJo13 = yield getReadWriteJobAndCleanupStores(),
        _yield$getReadWriteJo14 = _slicedToArray(_yield$getReadWriteJo13, 2),
        jobsObjectStore = _yield$getReadWriteJo14[0],
        cleanupsObjectStore = _yield$getReadWriteJo14[1];

    var newJobs = [];
    yield new Promise(function (resolve, reject) {
      var didCommit = false;

      var _loop3 = function _loop3(i) {
        var _jobs$i2 = jobs[i],
            args = _jobs$i2.args,
            attempt = _jobs$i2.attempt,
            created = _jobs$i2.created,
            id = _jobs$i2.id,
            prioritize = _jobs$i2.prioritize,
            queueId = _jobs$i2.queueId,
            startAfter = _jobs$i2.startAfter,
            status = _jobs$i2.status,
            type = _jobs$i2.type;
        var value = {
          args: args,
          attempt: attempt,
          created: created,
          prioritize: prioritize,
          queueId: queueId,
          startAfter: startAfter,
          status: status,
          type: type
        };
        var request = jobsObjectStore.put(value);

        request.onsuccess = function () {
          // eslint-disable-line no-loop-func
          var jobId = request.result;
          value.id = jobId;
          newJobs.push(value);
          var cleanupValue = cleanupMap.get(id);
          cleanupMap.delete(id);

          if (_typeof(cleanupValue) === 'object') {
            var cleanupAttempt = cleanupValue.attempt,
                cleanupData = cleanupValue.data,
                cleanupStartAfter = cleanupValue.startAfter;
            var cleanupPutRequest = cleanupsObjectStore.put({
              id: jobId,
              queueId: queueId,
              attempt: cleanupAttempt,
              data: cleanupData,
              startAfter: cleanupStartAfter
            });

            cleanupPutRequest.onsuccess = function () {
              if (i === jobs.length - 1) {
                resolve();
              }
            };

            cleanupPutRequest.onerror = function (event) {
              logger.error("Request error while importing ".concat(jobs.length, " ").concat(jobs.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId));
              logger.errorObject(event);
              reject(new Error("Request error while importing ".concat(jobs.length, " ").concat(jobs.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
            };
          } else {
            localJobEmitter.emit('jobAdd', jobId, queueId, type);
            jobEmitter.emit('jobAdd', jobId, queueId, type);

            if (i === jobs.length - 1) {
              resolve();
            }
          }

          if (i === jobs.length - 1 && !didCommit) {
            didCommit = true;
            jobsObjectStore.transaction.commit();
          }
        };

        request.onerror = function (event) {
          logger.error("Request error while importing ".concat(jobs.length, " ").concat(jobs.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId));
          logger.errorObject(event);
          reject(new Error("Request error while importing ".concat(jobs.length, " ").concat(jobs.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
        };
      };

      for (var i = 0; i < jobs.length; i += 1) {
        _loop3(i);
      }

      if (cleanupMap.size === 0) {
        didCommit = true;
        jobsObjectStore.transaction.commit();
      }
    });
    return newJobs;
  });
  return _importJobsAndCleanups.apply(this, arguments);
}

function enqueueToDatabase(_x42, _x43, _x44) {
  return _enqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase() {
  _enqueueToDatabase = _asyncToGenerator(function* (queueId, type, args) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    // eslint-disable-line no-underscore-dangle
    if (typeof queueId !== 'string') {
      throw new TypeError("Unable to enqueue in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\", should be string"));
    }

    if (typeof type !== 'string') {
      throw new TypeError("Unable to enqueue in database, received invalid \"type\" argument type \"".concat(_typeof(type), "\", should be string"));
    }

    if (!Array.isArray(args)) {
      throw new TypeError("Unable to enqueue in database, received invalid \"args\" argument type \"".concat(_typeof(args), "\", should be Array<any>"));
    }

    var delay = options.delay || 0;
    var prioritize = options.prioritize || false;

    if (typeof delay !== 'number') {
      throw new TypeError("Unable to enqueue in database, received invalid \"options.delay\" argument type \"".concat(_typeof(delay), "\", should be number"));
    }

    if (typeof prioritize !== 'boolean') {
      throw new TypeError("Unable to enqueue in database, received invalid \"options.prioritize\" argument type \"".concat(_typeof(prioritize), "\", should be boolean"));
    }

    var value = {
      queueId: queueId,
      type: type,
      args: args,
      attempt: 0,
      created: Date.now(),
      status: JOB_PENDING_STATUS,
      startAfter: Date.now() + delay,
      prioritize: prioritize
    };
    var store = yield getReadWriteJobsObjectStore();
    var index = store.index('statusQueueIdIndex'); // $FlowFixMe

    var abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ABORTED_STATUS]));
    return new Promise(function (resolve, reject) {
      abortedRequest.onsuccess = function (e) {
        var hasAbortedJobs = e.target.result.length > 0;

        if (hasAbortedJobs) {
          value.status = JOB_ABORTED_STATUS;
        }

        var request = store.put(value);

        request.onsuccess = function () {
          var id = request.result;

          if (!hasAbortedJobs) {
            localJobEmitter.emit('jobAdd', id, queueId, type);
            jobEmitter.emit('jobAdd', id, queueId, type);
          }

          resolve(id);
        };

        request.onerror = function (event) {
          logger.error("Request error while enqueueing ".concat(type, " job"));
          logger.errorObject(event);
          reject(new Error("Request error while enqueueing ".concat(type, " job")));
        };

        store.transaction.commit();
      };

      abortedRequest.onerror = function (event) {
        logger.error("Request error while checking for aborted jobs in queue ".concat(queueId, " while enqueueing ").concat(type, " job"));
        logger.errorObject(event);
        reject(new Error("Request error while checking for aborted jobs in queue ".concat(queueId, " while enqueueing ").concat(type, " job")));
      };
    });
  });
  return _enqueueToDatabase.apply(this, arguments);
}

function restoreJobToDatabaseForCleanupAndRemove(_x45, _x46, _x47, _x48) {
  return _restoreJobToDatabaseForCleanupAndRemove.apply(this, arguments);
}

function _restoreJobToDatabaseForCleanupAndRemove() {
  _restoreJobToDatabaseForCleanupAndRemove = _asyncToGenerator(function* (id, queueId, type, args) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

    // eslint-disable-line no-underscore-dangle
    if (typeof id !== 'number') {
      throw new TypeError("Unable to restore to database, received invalid \"id\" argument type \"".concat(_typeof(id), "\", should be number"));
    }

    if (typeof queueId !== 'string') {
      throw new TypeError("Unable to restore to database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\", should be string"));
    }

    if (typeof type !== 'string') {
      throw new TypeError("Unable to restore to database, received invalid \"type\" argument type \"".concat(_typeof(type), "\", should be string"));
    }

    if (!Array.isArray(args)) {
      throw new TypeError("Unable to restore to database, received invalid \"args\" argument type \"".concat(_typeof(args), "\", should be Array<any>"));
    }

    var delay = options.delay || 0;
    var prioritize = options.prioritize || false;

    if (typeof delay !== 'number') {
      throw new TypeError("Unable to enqueue in database, received invalid \"options.delay\" argument type \"".concat(_typeof(delay), "\", should be number"));
    }

    if (typeof prioritize !== 'boolean') {
      throw new TypeError("Unable to enqueue in database, received invalid \"options.prioritize\" argument type \"".concat(_typeof(prioritize), "\", should be boolean"));
    }

    var value = {
      id: id,
      queueId: queueId,
      type: type,
      args: args,
      attempt: 1,
      created: Date.now(),
      status: JOB_CLEANUP_AND_REMOVE_STATUS,
      startAfter: Date.now() + delay,
      prioritize: prioritize
    };
    var store = yield getReadWriteJobsObjectStore();
    var request = store.put(value);
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while enqueueing ".concat(type, " job"));
        logger.errorObject(event);
        reject(new Error("Request error while enqueueing ".concat(type, " job")));
      };

      store.transaction.commit();
    });
    localJobEmitter.emit('jobAdd', id, queueId, type);
    jobEmitter.emit('jobAdd', id, queueId, type);
    return id;
  });
  return _restoreJobToDatabaseForCleanupAndRemove.apply(this, arguments);
}

function dequeueFromDatabase() {
  return _dequeueFromDatabase.apply(this, arguments);
}

function _dequeueFromDatabase() {
  _dequeueFromDatabase = _asyncToGenerator(function* () {
    // eslint-disable-line no-underscore-dangle
    var store = yield getReadOnlyJobsObjectStore();
    var index = store.index('statusIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.bound(JOB_CLEANUP_AND_REMOVE_STATUS, JOB_PENDING_STATUS));
    var jobs = yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        logger.error('Request error while dequeing');
        logger.errorObject(event);
        reject(new Error('Request error while dequeing'));
      };

      store.transaction.commit();
    });
    return jobs;
  });
  return _dequeueFromDatabase.apply(this, arguments);
}

function getContiguousIds(ids) {
  ids.sort(function (a, b) {
    return a - b;
  });
  var points = [[0, ids[0] - 1]];

  for (var i = 0; i < ids.length; i += 1) {
    if (ids[i] + 1 !== ids[i + 1]) {
      if (i + 1 >= ids.length) {
        points.push([ids[i] + 1, Infinity]);
      } else {
        points.push([ids[i] + 1, ids[i + 1] - 1]);
      }
    }
  }

  return points;
}

function dequeueFromDatabaseNotIn(_x49) {
  return _dequeueFromDatabaseNotIn.apply(this, arguments);
}

function _dequeueFromDatabaseNotIn() {
  _dequeueFromDatabaseNotIn = _asyncToGenerator(function* (ids) {
    // eslint-disable-line no-underscore-dangle
    if (ids.length === 0) {
      return dequeueFromDatabase();
    }

    var _yield$getReadOnlyJob = yield getReadOnlyJobsObjectStoreAndTransactionPromise(),
        _yield$getReadOnlyJob2 = _slicedToArray(_yield$getReadOnlyJob, 2),
        store = _yield$getReadOnlyJob2[0],
        promise = _yield$getReadOnlyJob2[1];

    var index = store.index('statusIndex');
    var jobs = []; // $FlowFixMe

    var request = index.getAllKeys(IDBKeyRange.bound(JOB_CLEANUP_AND_REMOVE_STATUS, JOB_PENDING_STATUS));

    request.onsuccess = function (event) {
      var _iterator8 = _createForOfIteratorHelper(event.target.result),
          _step8;

      try {
        var _loop4 = function _loop4() {
          var id = _step8.value;

          if (ids.includes(id)) {
            return "continue";
          }

          var getRequest = store.get(id);

          getRequest.onsuccess = function () {
            jobs.push(getRequest.result);
          };

          getRequest.onerror = function (event2) {
            logger.error("Request error while getting job ".concat(id));
            logger.errorObject(event2);
          };
        };

        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _ret3 = _loop4();

          if (_ret3 === "continue") continue;
        } // Do not commit the transaction here, will cause transaction promise to return before
        // getRequest onsuccess completes

      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    };

    request.onerror = function (event) {
      logger.error('Request error while dequeing');
      logger.errorObject(event);
    };

    yield promise;
    return jobs;
  });
  return _dequeueFromDatabaseNotIn.apply(this, arguments);
}

function getJobsWithTypeFromDatabase(_x50) {
  return _getJobsWithTypeFromDatabase.apply(this, arguments);
}

function _getJobsWithTypeFromDatabase() {
  _getJobsWithTypeFromDatabase = _asyncToGenerator(function* (type) {
    var store = yield getReadOnlyJobsObjectStore();
    var index = store.index('typeIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(type));
    return new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting jobs with type ".concat(type, " from jobs database"));
        logger.errorObject(event);
        reject(new Error("Error while getting jobs with type ".concat(type, " from jobs database")));
      };

      store.transaction.commit();
    });
  });
  return _getJobsWithTypeFromDatabase.apply(this, arguments);
}

function getCleanupsInQueueFromDatabase(_x51) {
  return _getCleanupsInQueueFromDatabase.apply(this, arguments);
}

function _getCleanupsInQueueFromDatabase() {
  _getCleanupsInQueueFromDatabase = _asyncToGenerator(function* (queueId) {
    // eslint-disable-line no-underscore-dangle
    if (typeof queueId !== 'string') {
      throw new TypeError("Unable to get cleanups in queue from database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));
    }

    var store = yield getReadOnlyCleanupsObjectStore();
    var index = store.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(queueId));
    var jobs = yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting cleanups in queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error('Request error while getting cleanups in queue'));
      };

      store.transaction.commit();
    });
    return jobs;
  });
  return _getCleanupsInQueueFromDatabase.apply(this, arguments);
}

function getJobsInQueueFromDatabase(_x52) {
  return _getJobsInQueueFromDatabase.apply(this, arguments);
}

function _getJobsInQueueFromDatabase() {
  _getJobsInQueueFromDatabase = _asyncToGenerator(function* (queueId) {
    // eslint-disable-line no-underscore-dangle
    if (typeof queueId !== 'string') {
      throw new TypeError("Unable to get jobs in queue from database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));
    }

    var store = yield getReadOnlyJobsObjectStore();
    var index = store.index('queueIdIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(queueId));
    var jobs = yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting jobs in queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error('Request error while getting jobs in queue'));
      };

      store.transaction.commit();
    });
    return jobs;
  });
  return _getJobsInQueueFromDatabase.apply(this, arguments);
}

function getJobsInDatabase(_x53) {
  return _getJobsInDatabase.apply(this, arguments);
}

function _getJobsInDatabase() {
  _getJobsInDatabase = _asyncToGenerator(function* (jobIds) {
    // eslint-disable-line no-underscore-dangle
    if (!Array.isArray(jobIds)) {
      throw new TypeError("Unable to get jobs from database, received invalid \"jobIds\" argument type \"".concat(_typeof(jobIds), "\""));
    }

    var _yield$getReadOnlyJob3 = yield getReadOnlyJobsObjectStoreAndTransactionPromise(),
        _yield$getReadOnlyJob4 = _slicedToArray(_yield$getReadOnlyJob3, 2),
        store = _yield$getReadOnlyJob4[0],
        promise = _yield$getReadOnlyJob4[1];

    var jobs = [];

    var _iterator9 = _createForOfIteratorHelper(jobIds),
        _step9;

    try {
      var _loop5 = function _loop5() {
        var jobId = _step9.value;
        var request = store.get(jobId);

        request.onsuccess = function () {
          if (typeof request.result !== 'undefined') {
            jobs.push(request.result);
          }
        };

        request.onerror = function (event) {
          logger.error("Request error while getting job ".concat(jobId));
          logger.errorObject(event);
        };
      };

      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
        _loop5();
      } // Do not commit the transaction here, will cause transaction promise to return before
      // getRequest onsuccess completes

    } catch (err) {
      _iterator9.e(err);
    } finally {
      _iterator9.f();
    }

    yield promise;
    return jobs;
  });
  return _getJobsInDatabase.apply(this, arguments);
}

function getCompletedJobsCountFromDatabase(_x54) {
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase() {
  _getCompletedJobsCountFromDatabase = _asyncToGenerator(function* (queueId) {
    // eslint-disable-line no-underscore-dangle
    var jobs = yield getCompletedJobsFromDatabase(queueId);
    return jobs.length;
  });
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function getCompletedJobsFromDatabase(_x55) {
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase() {
  _getCompletedJobsFromDatabase = _asyncToGenerator(function* (queueId) {
    // eslint-disable-line no-underscore-dangle
    if (typeof queueId !== 'string') {
      throw new TypeError("Unable to get completed jobs database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));
    }

    var store = yield getReadOnlyJobsObjectStore();
    var index = store.index('statusQueueIdIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS]));
    var jobs = yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting completed jobs for queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting completed jobs for queue ".concat(queueId)));
      };

      store.transaction.commit();
    });
    return jobs;
  });
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function storeAuthDataInDatabase(_x56, _x57) {
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase() {
  _storeAuthDataInDatabase = _asyncToGenerator(function* (id, data) {
    // eslint-disable-line no-underscore-dangle
    if (typeof id !== 'string') {
      throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));
    }

    if (_typeof(data) !== 'object') {
      throw new TypeError("Unable to store auth data in database, received invalid \"data\" argument type \"".concat(_typeof(data), "\""));
    }

    var store = yield getReadWriteAuthObjectStore();
    var request = store.put({
      id: id,
      data: data
    });
    yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Request error while storing auth data for ".concat(id));
        logger.errorObject(event);
        reject(new Error("Request error while storing auth data for ".concat(id)));
      };

      store.transaction.commit();
    });
  });
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function getAuthDataFromDatabase(_x58) {
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase() {
  _getAuthDataFromDatabase = _asyncToGenerator(function* (id) {
    if (typeof id !== 'string') {
      throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));
    }

    var store = yield getReadOnlyAuthObjectStore();
    var request = store.get(id);
    var authData = yield new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        logger.error("Request error while getting auth data for ".concat(id));
        logger.errorObject(event);
        reject(new Error("Request error while getting auth data for ".concat(id)));
      };

      store.transaction.commit();
    });
    return typeof authData !== 'undefined' ? authData.data : undefined;
  });
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function removeAuthDataFromDatabase(_x59) {
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase() {
  _removeAuthDataFromDatabase = _asyncToGenerator(function* (id) {
    if (typeof id !== 'string') {
      throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));
    }

    var store = yield getReadWriteAuthObjectStore();
    var request = store.delete(id);
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Error while removing auth data for ".concat(id));
        logger.errorObject(event);
        reject(new Error("Error while removing auth data for ".concat(id)));
      };

      store.transaction.commit();
    });
  });
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function getQueueStatus(_x60) {
  return _getQueueStatus.apply(this, arguments);
}

function _getQueueStatus() {
  _getQueueStatus = _asyncToGenerator(function* (queueId) {
    var store = yield getReadOnlyJobsObjectStore();
    var index = store.index('statusQueueIdIndex'); // $FlowFixMe

    var abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ABORTED_STATUS])); // $FlowFixMe

    var completeRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_COMPLETE_STATUS])); // $FlowFixMe

    var pendingRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_PENDING_STATUS])); // $FlowFixMe

    var errorRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_ERROR_STATUS])); // $FlowFixMe

    var cleanupRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_CLEANUP_STATUS])); // $FlowFixMe

    var cleanupAndRemoveRequest = index.getAllKeys(IDBKeyRange.only([queueId, JOB_CLEANUP_AND_REMOVE_STATUS]));
    var abortedCountPromise = new Promise(function (resolve, reject) {
      abortedRequest.onsuccess = function (event) {
        resolve(event.target.result.length);
      };

      abortedRequest.onerror = function (event) {
        logger.error("Request error while getting status of queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting status of queue ".concat(queueId)));
      };
    });
    var completeCountPromise = new Promise(function (resolve, reject) {
      completeRequest.onsuccess = function (event) {
        resolve(event.target.result.length);
      };

      completeRequest.onerror = function (event) {
        logger.error("Request error while getting status of queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting status of queue ".concat(queueId)));
      };
    });
    var pendingCountPromise = new Promise(function (resolve, reject) {
      pendingRequest.onsuccess = function (event) {
        resolve(event.target.result.length);
      };

      pendingRequest.onerror = function (event) {
        logger.error("Request error while getting status of queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting status of queue ".concat(queueId)));
      };
    });
    var errorCountPromise = new Promise(function (resolve, reject) {
      errorRequest.onsuccess = function (event) {
        resolve(event.target.result.length);
      };

      errorRequest.onerror = function (event) {
        logger.error("Request error while getting status of queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting status of queue ".concat(queueId)));
      };
    });
    var cleanupCountPromise = new Promise(function (resolve, reject) {
      cleanupRequest.onsuccess = function (event) {
        resolve(event.target.result.length);
      };

      cleanupRequest.onerror = function (event) {
        logger.error("Request error while getting status of queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting status of queue ".concat(queueId)));
      };
    });
    var cleanupAndRemoveCountPromise = new Promise(function (resolve, reject) {
      cleanupAndRemoveRequest.onsuccess = function (event) {
        resolve(event.target.result.length);
      };

      cleanupAndRemoveRequest.onerror = function (event) {
        logger.error("Request error while getting status of queue ".concat(queueId));
        logger.errorObject(event);
        reject(new Error("Request error while getting status of queue ".concat(queueId)));
      };
    });
    store.transaction.commit();

    var _yield$Promise$all = yield Promise.all([abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise, cleanupAndRemoveCountPromise]),
        _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 6),
        abortedCount = _yield$Promise$all2[0],
        completeCount = _yield$Promise$all2[1],
        pendingCount = _yield$Promise$all2[2],
        errorCount = _yield$Promise$all2[3],
        cleanupCount = _yield$Promise$all2[4],
        cleanupAndRemoveCount = _yield$Promise$all2[5];

    if (abortedCount > 0 || cleanupCount > 0) {
      return QUEUE_ERROR_STATUS;
    }

    if (errorCount > 0 || pendingCount > 0 || cleanupAndRemoveCount > 0) {
      return QUEUE_PENDING_STATUS;
    }

    if (completeCount > 0) {
      return QUEUE_COMPLETE_STATUS;
    }

    return QUEUE_EMPTY_STATUS;
  });
  return _getQueueStatus.apply(this, arguments);
}

function addArgLookup(_x61, _x62, _x63) {
  return _addArgLookup.apply(this, arguments);
}

function _addArgLookup() {
  _addArgLookup = _asyncToGenerator(function* (jobId, key, jsonPath) {
    if (typeof jobId !== 'number') {
      throw new TypeError("Unable add argument lookup, received invalid \"jobId\" argument type \"".concat(_typeof(jobId), "\""));
    }

    if (typeof key !== 'string') {
      throw new TypeError("Unable add argument lookup, received invalid \"key\" argument type \"".concat(_typeof(key), "\""));
    }

    if (typeof jsonPath !== 'string') {
      throw new TypeError("Unable add argument lookup, received invalid \"jsonPath\" argument type \"".concat(_typeof(jsonPath), "\""));
    }

    var store = yield getReadWriteArgLookupObjectStore();
    var request = store.put({
      jobId: jobId,
      key: key,
      jsonPath: jsonPath
    });
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        logger.error("Error while adding argument lookup for job ".concat(jobId, " with key \"").concat(key, "\" and JSON path \"").concat(jsonPath, "\""));
        logger.errorObject(event);
        reject(new Error("Error while adding argument lookup for job ".concat(jobId, " with key \"").concat(key, "\" and JSON path \"").concat(jsonPath, "\"")));
      };

      store.transaction.commit();
    });
  });
  return _addArgLookup.apply(this, arguments);
}

function getArgLookupJobPathMap(_x64) {
  return _getArgLookupJobPathMap.apply(this, arguments);
}

function _getArgLookupJobPathMap() {
  _getArgLookupJobPathMap = _asyncToGenerator(function* (key) {
    if (typeof key !== 'string') {
      throw new TypeError("Unable to lookup arguments, received invalid \"key\" argument type \"".concat(_typeof(key), "\""));
    }

    var store = yield getReadOnlyArgLookupObjectStore();
    var index = store.index('keyIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(key));
    return new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        var map = new Map(event.target.result.map(function (x) {
          return [x.jobId, x.jsonPath];
        }));
        resolve(map);
      };

      request.onerror = function (event) {
        logger.error("Request error looking up arguments for key ".concat(key));
        logger.errorObject(event);
        reject(new Error("Request error looking up arguments for key ".concat(key)));
      };

      store.transaction.commit();
    });
  });
  return _getArgLookupJobPathMap.apply(this, arguments);
}

function markJobsWithArgLookupKeyCleanupAndRemoveInDatabase(_x65) {
  return _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase.apply(this, arguments);
}

function _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase() {
  _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase = _asyncToGenerator(function* (key) {
    if (typeof key !== 'string') {
      throw new TypeError("Unable to lookup arguments, received invalid \"key\" argument type \"".concat(_typeof(key), "\""));
    }

    var store = yield getReadOnlyArgLookupObjectStore();
    var index = store.index('keyIndex'); // $FlowFixMe

    var request = index.getAll(IDBKeyRange.only(key));
    var jobIds = yield new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve((0, _uniq.default)(event.target.result.map(function (x) {
          return x.jobId;
        })));
      };

      request.onerror = function (event) {
        logger.error("Request error looking up arguments for key ".concat(key));
        logger.errorObject(event);
        reject(new Error("Request error looking up arguments for key ".concat(key)));
      };

      store.transaction.commit();
    });
    yield Promise.all(jobIds.map(markJobCleanupAndRemoveInDatabase));
  });
  return _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase.apply(this, arguments);
}

function lookupArgs(_x66) {
  return _lookupArgs.apply(this, arguments);
}

function _lookupArgs() {
  _lookupArgs = _asyncToGenerator(function* (key) {
    var database = yield databasePromise;
    var transaction = database.transaction(['arg-lookup', 'jobs'], 'readonly', {
      durability: 'relaxed'
    });
    var argLookupObjectStore = transaction.objectStore('arg-lookup');

    transaction.onabort = function (event) {
      logger.error('Read-only lookupArgs transaction was aborted');
      logger.errorObject(event);
    };

    transaction.onerror = function (event) {
      logger.error('Error in read-only lookupArgs transaction');
      logger.errorObject(event);
    };

    var argLookupIndex = argLookupObjectStore.index('keyIndex'); // $FlowFixMe

    var argLookupRequest = argLookupIndex.getAll(IDBKeyRange.only(key));
    var results = [];
    return new Promise(function (resolve, reject) {
      argLookupRequest.onsuccess = function (argLookupEvent) {
        var argLookups = argLookupEvent.target.result;

        if (argLookups.length === 0) {
          resolve([]);
          transaction.commit();
          return;
        }

        var jobsObjectStore = transaction.objectStore('jobs');

        var _loop6 = function _loop6(i) {
          var _argLookups$i = argLookups[i],
              jobId = _argLookups$i.jobId,
              jsonPath = _argLookups$i.jsonPath;
          var jobRequest = jobsObjectStore.get(jobId);

          jobRequest.onsuccess = function () {
            if (typeof jobRequest.result === 'undefined') {
              return;
            }

            var args = jobRequest.result.args;

            var _iterator10 = _createForOfIteratorHelper((0, _jsonpathPlus.JSONPath)({
              path: jsonPath,
              json: args
            })),
                _step10;

            try {
              for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                var result = _step10.value;
                results.push(result);
              }
            } catch (err) {
              _iterator10.e(err);
            } finally {
              _iterator10.f();
            }

            if (i === argLookups.length - 1) {
              resolve(results);
            }
          };

          jobRequest.onerror = function (event) {
            logger.error("Request error while getting job ".concat(jobId));
            logger.errorObject(event);
            reject(new Error("Request error looking up jobs for key ".concat(key)));
          };
        };

        for (var i = 0; i < argLookups.length; i += 1) {
          _loop6(i);
        }

        transaction.commit();
      };

      argLookupRequest.onerror = function (event) {
        logger.error("Request error looking up arguments for key ".concat(key));
        logger.errorObject(event);
        reject(new Error("Request error looking up arguments for key ".concat(key)));
      };
    });
  });
  return _lookupArgs.apply(this, arguments);
}

function lookupArg(_x67) {
  return _lookupArg.apply(this, arguments);
}

function _lookupArg() {
  _lookupArg = _asyncToGenerator(function* (key) {
    var results = yield lookupArgs(key);
    return results[0];
  });
  return _lookupArg.apply(this, arguments);
}

var jobsArgLookupsAndCleanupsToRemove = [];

function removeArgLookupsAndCleanupsForJob() {
  return _removeArgLookupsAndCleanupsForJob.apply(this, arguments);
}

function _removeArgLookupsAndCleanupsForJob() {
  _removeArgLookupsAndCleanupsForJob = _asyncToGenerator(function* () {
    if (jobsArgLookupsAndCleanupsToRemove.length === 0) {
      return;
    }

    var jobIds = jobsArgLookupsAndCleanupsToRemove.slice();
    jobsArgLookupsAndCleanupsToRemove.length = 0;
    var database = yield databasePromise;
    var transaction = database.transaction(['cleanups', 'arg-lookup'], 'readwrite', {
      durability: 'relaxed'
    });

    transaction.onabort = function (event) {
      logger.error('Read-write "cleanups", and "arg-lookup" transaction was aborted');
      logger.errorObject(event);
    };

    transaction.onerror = function (event) {
      logger.error('Error in read-write "cleanups" and "arg-lookup" transaction');
      logger.errorObject(event);
    };

    var cleanupsObjectStore = transaction.objectStore('cleanups');
    var argLookupObjectStore = transaction.objectStore('arg-lookup');
    var argLookupJobIdIndex = argLookupObjectStore.index('jobIdIndex');

    var _iterator11 = _createForOfIteratorHelper(jobIds),
        _step11;

    try {
      var _loop7 = function _loop7() {
        var jobId = _step11.value;
        var cleanupDeleteRequest = cleanupsObjectStore.delete(jobId);

        cleanupDeleteRequest.onerror = function (event) {
          logger.error("Request error while removing cleanups for job ".concat(jobId, " from database"));
          logger.errorObject(event);
        }; // $FlowFixMe


        var argLookupJobRequest = argLookupJobIdIndex.getAllKeys(IDBKeyRange.only(jobId));

        argLookupJobRequest.onsuccess = function (event) {
          var _iterator12 = _createForOfIteratorHelper(event.target.result),
              _step12;

          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var id = _step12.value;
              var argLookupDeleteRequest = argLookupObjectStore.delete(id);

              argLookupDeleteRequest.onerror = function (deleteEvent) {
                logger.error("Delete request error while removing argument lookups for job ".concat(jobId, " from database"));
                logger.errorObject(deleteEvent);
              };
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }
        };

        argLookupJobRequest.onerror = function (event) {
          logger.error("Request error while removing argument lookups for job ".concat(jobId, " from database"));
          logger.errorObject(event);
        };
      };

      for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
        _loop7();
      }
    } catch (err) {
      _iterator11.e(err);
    } finally {
      _iterator11.f();
    }
  });
  return _removeArgLookupsAndCleanupsForJob.apply(this, arguments);
}

function removeArgLookupsAndCleanupsForJobAsMicrotask(jobId) {
  jobsArgLookupsAndCleanupsToRemove.push(jobId);
  self.queueMicrotask(removeArgLookupsAndCleanupsForJob);
}

var UNLOAD_DATA_ID = '_UNLOAD_DATA';

function updateUnloadDataInDatabase(transform) {
  return updateMetadataInDatabase(UNLOAD_DATA_ID, transform);
}

function getUnloadDataFromDatabase() {
  return getMetadataFromDatabase(UNLOAD_DATA_ID);
}

function clearUnloadDataInDatabase() {
  return clearMetadataInDatabase(UNLOAD_DATA_ID);
}
//# sourceMappingURL=database.js.map