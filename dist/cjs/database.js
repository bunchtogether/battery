"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearDatabase = _clearDatabase2;
exports.removeJobsWithQueueIdAndTypeFromDatabase = _removeJobsWithQueueIdAndTypeFromDatabase2;
exports.removeQueueFromDatabase = _removeQueueFromDatabase2;
exports.removeCompletedExpiredItemsFromDatabase = _removeCompletedExpiredItemsFromDatabase2;
exports.updateJobInDatabase = _updateJobInDatabase2;
exports.getJobFromDatabase = _getJobFromDatabase2;
exports.updateCleanupInDatabase = _updateCleanupInDatabase2;
exports.removePathFromCleanupDataInDatabase = _removePathFromCleanupDataInDatabase2;
exports.updateCleanupValuesInDatabase = _updateCleanupValuesInDatabase2;
exports.silentlyRemoveJobFromDatabase = _silentlyRemoveJobFromDatabase2;
exports.removeJobFromDatabase = _removeJobFromDatabase2;
exports.removeCleanupFromDatabase = _removeCleanupFromDatabase2;
exports.getCleanupFromDatabase = _getCleanupFromDatabase2;
exports.getMetadataFromDatabase = _getMetadataFromDatabase2;
exports.clearMetadataInDatabase = _clearMetadataInDatabase2;
exports.setMetadataInDatabase = _setMetadataInDatabase2;
exports.updateMetadataInDatabase = _updateMetadataInDatabase2;
exports.markJobStatusInDatabase = _markJobStatusInDatabase;
exports.markJobCompleteInDatabase = _markJobCompleteInDatabase;
exports.markJobPendingInDatabase = _markJobPendingInDatabase;
exports.markJobErrorInDatabase = _markJobErrorInDatabase;
exports.markJobCleanupInDatabase = _markJobCleanupInDatabase;
exports.markJobAbortedInDatabase = _markJobAbortedInDatabase;
exports.markJobCompleteThenRemoveFromDatabase = _markJobCompleteThenRemoveFromDatabase2;
exports.markJobCleanupAndRemoveInDatabase = _markJobCleanupAndRemoveInDatabase;
exports.markJobAsAbortedOrRemoveFromDatabase = _markJobAsAbortedOrRemoveFromDatabase;
exports.markJobStartAfterInDatabase = _markJobStartAfterInDatabase;
exports.markCleanupStartAfterInDatabase = _markCleanupStartAfterInDatabase;
exports.markQueueForCleanupInDatabase = _markQueueForCleanupInDatabase2;
exports.markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase = _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase2;
exports.markQueueForCleanupAndRemoveInDatabase = _markQueueForCleanupAndRemoveInDatabase;
exports.getGreatestJobIdFromQueueInDatabase = _getGreatestJobIdFromQueueInDatabase2;
exports.incrementJobAttemptInDatabase = _incrementJobAttemptInDatabase2;
exports.incrementCleanupAttemptInDatabase = _incrementCleanupAttemptInDatabase2;
exports.bulkEnqueueToDatabase = _bulkEnqueueToDatabase2;
exports.enqueueToDatabase = _enqueueToDatabase2;
exports.restoreJobToDatabaseForCleanupAndRemove = _restoreJobToDatabaseForCleanupAndRemove2;
exports.dequeueFromDatabase = _dequeueFromDatabase2;
exports.getContiguousIds = _getContiguousIds;
exports.dequeueFromDatabaseNotIn = _dequeueFromDatabaseNotIn2;
exports.getJobsWithTypeFromDatabase = _getJobsWithTypeFromDatabase2;
exports.getJobsInQueueFromDatabase = _getJobsInQueueFromDatabase2;
exports.getJobsInDatabase = _getJobsInDatabase2;
exports.getCompletedJobsCountFromDatabase = _getCompletedJobsCountFromDatabase2;
exports.getCompletedJobsFromDatabase = _getCompletedJobsFromDatabase2;
exports.storeAuthDataInDatabase = _storeAuthDataInDatabase2;
exports.getAuthDataFromDatabase = _getAuthDataFromDatabase2;
exports.removeAuthDataFromDatabase = _removeAuthDataFromDatabase2;
exports.getQueueStatus = _getQueueStatus2;
exports.addArgLookup = _addArgLookup2;
exports.getArgLookupJobPathMap = _getArgLookupJobPathMap2;
exports.markJobsWithArgLookupKeyCleanupAndRemoveInDatabase = _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase2;
exports.lookupArgs = _lookupArgs2;
exports.lookupArg = _lookupArg2;
exports.removeArgLookupsForJob = _removeArgLookupsForJob2;
exports.updateUnloadDataInDatabase = _updateUnloadDataInDatabase;
exports.getUnloadDataFromDatabase = _getUnloadDataFromDatabase;
exports.clearUnloadDataInDatabase = _clearUnloadDataInDatabase;
exports.databasePromise = exports.JOB_CLEANUP_AND_REMOVE_STATUS = exports.JOB_CLEANUP_STATUS = exports.JOB_ERROR_STATUS = exports.JOB_PENDING_STATUS = exports.JOB_COMPLETE_STATUS = exports.JOB_ABORTED_STATUS = exports.QUEUE_EMPTY_STATUS = exports.QUEUE_COMPLETE_STATUS = exports.QUEUE_PENDING_STATUS = exports.QUEUE_ERROR_STATUS = exports.CleanupDoesNotExistError = exports.JobDoesNotExistError = exports.jobEmitter = exports.localJobEmitter = void 0;

var _jsonpathPlus = require("jsonpath-plus");

var _merge = _interopRequireDefault(require("lodash/merge"));

var _unset = _interopRequireDefault(require("lodash/unset"));

var _uniq = _interopRequireDefault(require("lodash/uniq"));

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

// Local job emitter is for this process only,
// jobEmitter is bridged when a MessagePort is open
var _localJobEmitter = new _events.default();

exports.localJobEmitter = _localJobEmitter;

var _jobEmitter = new _events.default();

exports.jobEmitter = _jobEmitter;
var logger = (0, _logger.default)('Jobs Database');

var _JobDoesNotExistError = /*#__PURE__*/function (_Error) {
  _inherits(JobDoesNotExistError, _Error);

  var _super = _createSuper(JobDoesNotExistError);

  function JobDoesNotExistError(message) {
    var _this;

    _classCallCheck(this, JobDoesNotExistError);

    _this = _super.call(this, message);
    _this.name = 'JobDoesNotExistError';
    return _this;
  }

  return JobDoesNotExistError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.JobDoesNotExistError = _JobDoesNotExistError;

var _CleanupDoesNotExistError = /*#__PURE__*/function (_Error2) {
  _inherits(CleanupDoesNotExistError, _Error2);

  var _super2 = _createSuper(CleanupDoesNotExistError);

  function CleanupDoesNotExistError(message) {
    var _this2;

    _classCallCheck(this, CleanupDoesNotExistError);

    _this2 = _super2.call(this, message);
    _this2.name = 'CleanupDoesNotExistError';
    return _this2;
  }

  return CleanupDoesNotExistError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.CleanupDoesNotExistError = _CleanupDoesNotExistError;
var _QUEUE_ERROR_STATUS = 0;
exports.QUEUE_ERROR_STATUS = _QUEUE_ERROR_STATUS;
var _QUEUE_PENDING_STATUS = 1;
exports.QUEUE_PENDING_STATUS = _QUEUE_PENDING_STATUS;
var _QUEUE_COMPLETE_STATUS = 2;
exports.QUEUE_COMPLETE_STATUS = _QUEUE_COMPLETE_STATUS;
var _QUEUE_EMPTY_STATUS = 3;
exports.QUEUE_EMPTY_STATUS = _QUEUE_EMPTY_STATUS;
var _JOB_ABORTED_STATUS = 2;
exports.JOB_ABORTED_STATUS = _JOB_ABORTED_STATUS;
var _JOB_COMPLETE_STATUS = 1;
exports.JOB_COMPLETE_STATUS = _JOB_COMPLETE_STATUS;
var _JOB_PENDING_STATUS = 0;
exports.JOB_PENDING_STATUS = _JOB_PENDING_STATUS;

var _JOB_ERROR_STATUS = -1;

exports.JOB_ERROR_STATUS = _JOB_ERROR_STATUS;

var _JOB_CLEANUP_STATUS = -2;

exports.JOB_CLEANUP_STATUS = _JOB_CLEANUP_STATUS;

var _JOB_CLEANUP_AND_REMOVE_STATUS = -3;

exports.JOB_CLEANUP_AND_REMOVE_STATUS = _JOB_CLEANUP_AND_REMOVE_STATUS;

var _databasePromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var request, db;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          request = self.indexedDB.open('battery-queue-07', 1);

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
              store.createIndex('createdIndex', 'created', {
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

          _context.next = 4;
          return new Promise(function (resolve, reject) {
            request.onerror = function () {
              reject(new Error('Unable to open database'));
            };

            request.onsuccess = function (event) {
              resolve(event.target.result);
            };
          });

        case 4:
          db = _context.sent;
          return _context.abrupt("return", db);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}))();

exports.databasePromise = _databasePromise;

function getReadWriteObjectStore(_x) {
  return _getReadWriteObjectStore.apply(this, arguments);
}

function _getReadWriteObjectStore() {
  _getReadWriteObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(name) {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _databasePromise;

          case 2:
            database = _context2.sent;
            transaction = database.transaction([name], 'readwrite', {
              durability: 'relaxed'
            });
            objectStore = transaction.objectStore(name);

            transaction.onabort = function (event) {
              logger.error("Read-write \"".concat(name, "\" transaction was aborted"));
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error("Error in read-write \"".concat(name, "\" transaction"));
              logger.errorObject(event);
            };

            return _context2.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getReadWriteObjectStore.apply(this, arguments);
}

function getReadOnlyObjectStore(_x2) {
  return _getReadOnlyObjectStore.apply(this, arguments);
}

function _getReadOnlyObjectStore() {
  _getReadOnlyObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(name) {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _databasePromise;

          case 2:
            database = _context3.sent;
            transaction = database.transaction([name], 'readonly', {
              durability: 'relaxed'
            });
            objectStore = transaction.objectStore(name);

            transaction.onabort = function (event) {
              logger.error("Read-only \"".concat(name, "\" transaction was aborted"));
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error("Error in read-only \"".concat(name, "\" transaction"));
              logger.errorObject(event);
            };

            return _context3.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
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

function getReadWriteObjectStoreAndTransactionPromise(_x3) {
  return _getReadWriteObjectStoreAndTransactionPromise.apply(this, arguments);
}

function _getReadWriteObjectStoreAndTransactionPromise() {
  _getReadWriteObjectStoreAndTransactionPromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(name) {
    var database, transaction, objectStore, promise;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _databasePromise;

          case 2:
            database = _context4.sent;
            transaction = database.transaction([name], 'readwrite', {
              durability: 'relaxed'
            });
            objectStore = transaction.objectStore(name);
            promise = new Promise(function (resolve, reject) {
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
            return _context4.abrupt("return", [objectStore, promise]);

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getReadWriteObjectStoreAndTransactionPromise.apply(this, arguments);
}

function getReadOnlyObjectStoreAndTransactionPromise(_x4) {
  return _getReadOnlyObjectStoreAndTransactionPromise.apply(this, arguments);
}

function _getReadOnlyObjectStoreAndTransactionPromise() {
  _getReadOnlyObjectStoreAndTransactionPromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(name) {
    var database, transaction, objectStore, promise;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _databasePromise;

          case 2:
            database = _context5.sent;
            transaction = database.transaction([name], 'readonly', {
              durability: 'relaxed'
            });
            objectStore = transaction.objectStore(name);
            promise = new Promise(function (resolve, reject) {
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
            return _context5.abrupt("return", [objectStore, promise]);

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _getReadOnlyObjectStoreAndTransactionPromise.apply(this, arguments);
}

function getReadWriteJobsObjectStoreAndTransactionPromise() {
  return getReadWriteObjectStoreAndTransactionPromise('jobs');
}

function getReadOnlyJobsObjectStoreAndTransactionPromise() {
  return getReadOnlyObjectStoreAndTransactionPromise('jobs');
}

function getReadWriteArgLookupObjectStoreAndTransactionPromise() {
  return getReadWriteObjectStoreAndTransactionPromise('arg-lookup');
}

function removeJobFromObjectStore(store, id, queueId) {
  var deleteRequest = store.delete(id);

  _localJobEmitter.emit('jobDelete', id, queueId);

  _jobEmitter.emit('jobDelete', id, queueId);

  deleteRequest.onsuccess = function () {
    removeArgLookupsForJobAsMicrotask(id);
  };

  deleteRequest.onerror = function (event) {
    logger.error("Request error while removing job ".concat(id, " in queue ").concat(queueId, " from database"));
    logger.errorObject(event);
  };
}

function clearAllMetadataInDatabase() {
  return _clearAllMetadataInDatabase.apply(this, arguments);
}

function _clearAllMetadataInDatabase() {
  _clearAllMetadataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return getReadWriteMetadataObjectStore();

          case 2:
            store = _context6.sent;
            request = store.clear();
            _context6.next = 6;
            return new Promise(function (resolve, reject) {
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

          case 6:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _clearAllMetadataInDatabase.apply(this, arguments);
}

function clearJobsDatabase() {
  return _clearJobsDatabase.apply(this, arguments);
}

function _clearJobsDatabase() {
  _clearJobsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context7.sent;
            request = store.clear();

            _localJobEmitter.emit('jobsClear');

            _jobEmitter.emit('jobsClear');

            _context7.next = 8;
            return new Promise(function (resolve, reject) {
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

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _clearJobsDatabase.apply(this, arguments);
}

function clearCleanupsDatabase() {
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearCleanupsDatabase() {
  _clearCleanupsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context8.sent;
            request = store.clear();
            _context8.next = 6;
            return new Promise(function (resolve, reject) {
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

          case 6:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearDatabase2() {
  return _clearDatabase.apply(this, arguments);
}

function _clearDatabase() {
  _clearDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return clearJobsDatabase();

          case 2:
            _context9.next = 4;
            return clearCleanupsDatabase();

          case 4:
            _context9.next = 6;
            return clearAllMetadataInDatabase();

          case 6:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _clearDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase2(_x5, _x6) {
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase() {
  _removeJobsWithQueueIdAndTypeFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(queueId, type) {
    var _yield$getReadWriteJo, _yield$getReadWriteJo2, store, promise, index, request;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return getReadWriteJobsObjectStoreAndTransactionPromise();

          case 2:
            _yield$getReadWriteJo = _context10.sent;
            _yield$getReadWriteJo2 = _slicedToArray(_yield$getReadWriteJo, 2);
            store = _yield$getReadWriteJo2[0];
            promise = _yield$getReadWriteJo2[1];
            index = store.index('queueIdTypeIndex'); // $FlowFixMe

            request = index.getAllKeys(IDBKeyRange.only([queueId, type]));

            request.onsuccess = function (event) {
              var _iterator = _createForOfIteratorHelper(event.target.result),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var id = _step.value;
                  removeJobFromObjectStore(store, id, queueId);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            };

            request.onerror = function (event) {
              logger.error("Request error while removing jobs with queue ".concat(queueId, " and type ").concat(type, " from jobs database"));
              logger.errorObject(event);
            };

            _context10.next = 12;
            return promise;

          case 12:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function _removeQueueFromDatabase2(_x7) {
  return _removeQueueFromDatabase.apply(this, arguments);
}

function _removeQueueFromDatabase() {
  _removeQueueFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(queueId) {
    var database, transaction, jobsObjectStore, cleanupsObjectStore, argLookupObjectStore, promise, queueIdIndex, argLookupJobIdIndex, request;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return _databasePromise;

          case 2:
            database = _context11.sent;
            transaction = database.transaction(['jobs', 'cleanups', 'arg-lookup'], 'readwrite', {
              durability: 'relaxed'
            });
            jobsObjectStore = transaction.objectStore('jobs');
            cleanupsObjectStore = transaction.objectStore('cleanups');
            argLookupObjectStore = transaction.objectStore('arg-lookup');
            promise = new Promise(function (resolve, reject) {
              transaction.onabort = function (event) {
                logger.error('Read-write remove queue transaction was aborted');
                logger.errorObject(event);
                reject(new Error('Read-write emove queue transaction was aborted'));
              };

              transaction.onerror = function (event) {
                logger.error('Error in read-write remove queue transaction');
                logger.errorObject(event);
                reject(new Error('Error in read-write remove queue transaction'));
              };

              transaction.oncomplete = function () {
                resolve();
              };
            });
            queueIdIndex = jobsObjectStore.index('queueIdIndex');
            argLookupJobIdIndex = argLookupObjectStore.index('jobIdIndex'); // $FlowFixMe

            request = queueIdIndex.getAllKeys(IDBKeyRange.only(queueId));

            request.onsuccess = function (_ref2) {
              var jobIds = _ref2.target.result;

              var _iterator2 = _createForOfIteratorHelper(jobIds),
                  _step2;

              try {
                var _loop = function _loop() {
                  var jobId = _step2.value;
                  var jobDeleteRequest = jobsObjectStore.delete(jobId);

                  _localJobEmitter.emit('jobDelete', jobId, queueId);

                  _jobEmitter.emit('jobDelete', jobId, queueId);

                  jobDeleteRequest.onerror = function (event) {
                    logger.error("Request error while removing job ".concat(jobId, " in queue ").concat(queueId, " from database"));
                    logger.errorObject(event);
                  };

                  var cleanupDeleteRequest = cleanupsObjectStore.delete(jobId);

                  cleanupDeleteRequest.onerror = function (event) {
                    logger.error("Request error while removing cleanup for job ".concat(jobId, " in queue ").concat(queueId, " from database"));
                    logger.errorObject(event);
                  }; // $FlowFixMe


                  var argLookupJobRequest = argLookupJobIdIndex.getAllKeys(IDBKeyRange.only(jobId));

                  argLookupJobRequest.onsuccess = function (event) {
                    var _iterator3 = _createForOfIteratorHelper(event.target.result),
                        _step3;

                    try {
                      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                        var id = _step3.value;
                        var argLookupDeleteRequest = argLookupObjectStore.delete(id);

                        argLookupDeleteRequest.onerror = function (deleteEvent) {
                          logger.error("Delete request error while removing argument lookups for job ".concat(jobId, " in queue ").concat(queueId, " from database"));
                          logger.errorObject(deleteEvent);
                        };
                      }
                    } catch (err) {
                      _iterator3.e(err);
                    } finally {
                      _iterator3.f();
                    }
                  };

                  argLookupJobRequest.onerror = function (event) {
                    logger.error("Request error while removing argument lookups for job ".concat(jobId, " in queue ").concat(queueId, " from database"));
                    logger.errorObject(event);
                  };
                };

                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  _loop();
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            };

            request.onerror = function (event) {
              logger.error("Request error while removing queue ".concat(queueId, " from jobs database"));
              logger.errorObject(event);
            };

            _context11.next = 15;
            return promise;

          case 15:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _removeQueueFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase2(_x8) {
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase() {
  _removeCompletedExpiredItemsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(maxAge) {
    var _yield$getReadWriteJo3, _yield$getReadWriteJo4, store, promise, index, request;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return getReadWriteJobsObjectStoreAndTransactionPromise();

          case 2:
            _yield$getReadWriteJo3 = _context12.sent;
            _yield$getReadWriteJo4 = _slicedToArray(_yield$getReadWriteJo3, 2);
            store = _yield$getReadWriteJo4[0];
            promise = _yield$getReadWriteJo4[1];
            index = store.index('createdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.bound(0, Date.now() - maxAge));

            request.onsuccess = function (event) {
              var _iterator4 = _createForOfIteratorHelper(event.target.result),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _step4$value = _step4.value,
                      id = _step4$value.id,
                      queueId = _step4$value.queueId,
                      status = _step4$value.status;

                  if (status !== _JOB_COMPLETE_STATUS) {
                    continue;
                  }

                  removeJobFromObjectStore(store, id, queueId);
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            };

            request.onerror = function (event) {
              logger.error('Request error while removing completed exired items from jobs database');
              logger.errorObject(event);
            };

            _context12.next = 12;
            return promise;

          case 12:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _updateJobInDatabase2(_x9, _x10) {
  return _updateJobInDatabase.apply(this, arguments);
}

function _updateJobInDatabase() {
  _updateJobInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(id, transform) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context13.sent;
            request = store.get(id);
            _context13.next = 6;
            return new Promise(function (resolve, reject) {
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

                    _localJobEmitter.emit('jobDelete', id, queueId);

                    _jobEmitter.emit('jobDelete', id, queueId);

                    deleteRequest.onsuccess = function () {
                      removeArgLookupsForJobAsMicrotask(id);
                      resolve();
                    };

                    deleteRequest.onerror = function (event) {
                      logger.error("Delete request error while updating job ".concat(id, " in queue ").concat(queueId, " and type ").concat(type, " in jobs database"));
                      logger.errorObject(event);
                      reject(new Error("Delete request error while updating job ".concat(id, " in queue ").concat(queueId, " and type ").concat(type, " from jobs database")));
                    };
                  }
                } else {
                  var _newValue = newValue,
                      _queueId = _newValue.queueId,
                      _type = _newValue.type,
                      status = _newValue.status;
                  var putRequest = store.put(newValue);

                  _localJobEmitter.emit('jobUpdate', id, _queueId, _type, status);

                  _jobEmitter.emit('jobUpdate', id, _queueId, _type, status);

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

          case 6:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _updateJobInDatabase.apply(this, arguments);
}

function _getJobFromDatabase2(_x11) {
  return _getJobFromDatabase.apply(this, arguments);
}

function _getJobFromDatabase() {
  _getJobFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context14.sent;
            request = store.get(id);
            return _context14.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while getting ".concat(id)));
              };

              store.transaction.commit();
            }));

          case 5:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _getJobFromDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase2(_x12, _x13) {
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase() {
  _updateCleanupInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(id, transform) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context15.sent;
            request = store.get(id);
            _context15.next = 6;
            return new Promise(function (resolve, reject) {
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

          case 6:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase2(_x14, _x15) {
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase() {
  _removePathFromCleanupDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(id, path) {
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return _updateCleanupInDatabase2(id, function (value) {
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

          case 2:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _updateCleanupValuesInDatabase2(_x16, _x17, _x18) {
  return _updateCleanupValuesInDatabase.apply(this, arguments);
}

function _updateCleanupValuesInDatabase() {
  _updateCleanupValuesInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(id, queueId, data) {
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            if (!(typeof id !== 'number')) {
              _context17.next = 2;
              break;
            }

            throw new TypeError("Unable to update cleanup in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            if (!(typeof queueId !== 'string')) {
              _context17.next = 4;
              break;
            }

            throw new TypeError("Unable to update cleanup in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 4:
            if (!(_typeof(data) !== 'object')) {
              _context17.next = 6;
              break;
            }

            throw new TypeError("Unable to update cleanup in database, received invalid \"data\" argument type \"".concat(_typeof(data), "\""));

          case 6:
            _context17.next = 8;
            return _updateCleanupInDatabase2(id, function (value) {
              var combinedData = typeof value === 'undefined' ? data : (0, _merge.default)({}, value.data, data);
              return {
                id: id,
                queueId: queueId,
                attempt: 0,
                startAfter: Date.now(),
                data: combinedData
              };
            });

          case 8:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));
  return _updateCleanupValuesInDatabase.apply(this, arguments);
}

function _silentlyRemoveJobFromDatabase2(_x19) {
  return _silentlyRemoveJobFromDatabase.apply(this, arguments);
}

function _silentlyRemoveJobFromDatabase() {
  _silentlyRemoveJobFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context18.sent;
            request = store.delete(id);
            _context18.next = 6;
            return new Promise(function (resolve, reject) {
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

          case 6:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18);
  }));
  return _silentlyRemoveJobFromDatabase.apply(this, arguments);
}

function _removeJobFromDatabase2(_x20) {
  return _removeJobFromDatabase.apply(this, arguments);
}

function _removeJobFromDatabase() {
  _removeJobFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            _context19.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context19.sent;
            request = store.get(id);
            _context19.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                var job = request.result;

                if (typeof job === 'undefined') {
                  resolve();
                  return;
                }

                var queueId = job.queueId,
                    type = job.type;
                var deleteRequest = store.delete(id);

                _localJobEmitter.emit('jobDelete', id, queueId);

                _jobEmitter.emit('jobDelete', id, queueId);

                deleteRequest.onsuccess = function () {
                  removeArgLookupsForJobAsMicrotask(id);
                  resolve();
                };

                deleteRequest.onerror = function (event) {
                  logger.error("Delete request error while removing job ".concat(id, " in queue ").concat(queueId, " with type ").concat(type, " from database"));
                  logger.errorObject(event);
                  reject(new Error("Delete request error while removing job ".concat(id, " in queue ").concat(queueId, " with type ").concat(type, " from database")));
                };

                store.transaction.commit();
              };

              request.onerror = function (event) {
                logger.error("Request error while getting ".concat(id, " before removing from database"));
                logger.errorObject(event);
                reject(new Error("Request error while getting ".concat(id, " before removing from database")));
              };
            });

          case 6:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19);
  }));
  return _removeJobFromDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase2(_x21) {
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase() {
  _removeCleanupFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            _context20.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context20.sent;
            request = store.delete(id);
            return _context20.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while removing cleanup data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Error while removing cleanup data for ".concat(id)));
              };

              store.transaction.commit();
            }));

          case 5:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20);
  }));
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase2(_x22) {
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase() {
  _getCleanupFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.next = 2;
            return getReadOnlyCleanupsObjectStore();

          case 2:
            store = _context21.sent;
            request = store.get(id);
            return _context21.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while getting ".concat(id)));
              };

              store.transaction.commit();
            }));

          case 5:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21);
  }));
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getMetadataFromDatabase2(_x23) {
  return _getMetadataFromDatabase.apply(this, arguments);
}

function _getMetadataFromDatabase() {
  _getMetadataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(id) {
    var store, request, response;
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            _context22.next = 2;
            return getReadOnlyMetadataObjectStore();

          case 2:
            store = _context22.sent;
            request = store.get(id);
            _context22.next = 6;
            return new Promise(function (resolve, reject) {
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

          case 6:
            response = _context22.sent;
            return _context22.abrupt("return", typeof response !== 'undefined' ? response.metadata : undefined);

          case 8:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22);
  }));
  return _getMetadataFromDatabase.apply(this, arguments);
}

function _clearMetadataInDatabase2(_x24) {
  return _clearMetadataInDatabase.apply(this, arguments);
}

function _clearMetadataInDatabase() {
  _clearMetadataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            _context23.next = 2;
            return getReadWriteMetadataObjectStore();

          case 2:
            store = _context23.sent;
            request = store.delete(id);
            return _context23.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while clearing ".concat(id, " metadata"));
                logger.errorObject(event);
                reject(new Error("Error while clearing ".concat(id, " metadata")));
              };

              store.transaction.commit();
            }));

          case 5:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23);
  }));
  return _clearMetadataInDatabase.apply(this, arguments);
}

function _setMetadataInDatabase2(_x25, _x26) {
  return _setMetadataInDatabase.apply(this, arguments);
}

function _setMetadataInDatabase() {
  _setMetadataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(id, metadata) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            _context24.next = 2;
            return getReadWriteMetadataObjectStore();

          case 2:
            store = _context24.sent;
            request = store.put({
              id: id,
              metadata: metadata
            });
            return _context24.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while setting ".concat(id, " metadata"));
                logger.errorObject(event);
                reject(new Error("Error while setting ".concat(id, " metadata")));
              };

              store.transaction.commit();
            }));

          case 5:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24);
  }));
  return _setMetadataInDatabase.apply(this, arguments);
}

function _updateMetadataInDatabase2(_x27, _x28) {
  return _updateMetadataInDatabase.apply(this, arguments);
}

function _updateMetadataInDatabase() {
  _updateMetadataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(id, transform) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            _context25.next = 2;
            return getReadWriteMetadataObjectStore();

          case 2:
            store = _context25.sent;
            request = store.get(id);
            _context25.next = 6;
            return new Promise(function (resolve, reject) {
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

          case 6:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25);
  }));
  return _updateMetadataInDatabase.apply(this, arguments);
}

function _markJobStatusInDatabase(id, status) {
  return _updateJobInDatabase2(id, function (value) {
    if (typeof value === 'undefined') {
      throw new _JobDoesNotExistError("Unable to mark job ".concat(id, " as status ").concat(status, " in database, job does not exist"));
    }

    value.status = status; // eslint-disable-line no-param-reassign

    return value;
  });
}

function _markJobCompleteInDatabase(id) {
  return _markJobStatusInDatabase(id, _JOB_COMPLETE_STATUS);
}

function _markJobPendingInDatabase(id) {
  return _markJobStatusInDatabase(id, _JOB_PENDING_STATUS);
}

function _markJobErrorInDatabase(id) {
  return _markJobStatusInDatabase(id, _JOB_ERROR_STATUS);
}

function _markJobCleanupInDatabase(id) {
  return _markJobStatusInDatabase(id, _JOB_CLEANUP_STATUS);
}

function _markJobAbortedInDatabase(id) {
  return _markJobStatusInDatabase(id, _JOB_ABORTED_STATUS);
}

function _markJobCompleteThenRemoveFromDatabase2(_x29) {
  return _markJobCompleteThenRemoveFromDatabase.apply(this, arguments);
}

function _markJobCompleteThenRemoveFromDatabase() {
  _markJobCompleteThenRemoveFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            _context26.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context26.sent;
            request = store.get(id);
            _context26.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                var value = request.result;

                if (typeof value !== 'undefined') {
                  var queueId = value.queueId,
                      type = value.type;

                  _localJobEmitter.emit('jobUpdate', id, queueId, type, _JOB_COMPLETE_STATUS);

                  _jobEmitter.emit('jobUpdate', id, queueId, type, _JOB_COMPLETE_STATUS);

                  var deleteRequest = store.delete(id);

                  deleteRequest.onsuccess = function () {
                    _localJobEmitter.emit('jobDelete', id, queueId);

                    _jobEmitter.emit('jobDelete', id, queueId);

                    removeArgLookupsForJobAsMicrotask(id);
                    resolve();
                  };

                  deleteRequest.onerror = function (event) {
                    logger.error("Delete request error while marking job ".concat(id, " in queue ").concat(queueId, " with type ").concat(type, " complete then removing from jobs database"));
                    logger.errorObject(event);
                    reject(new Error("Delete request error while marking job ".concat(id, " in queue ").concat(queueId, " with type ").concat(type, " complete then removing from jobs database")));
                  };
                }

                store.transaction.commit();
              };

              request.onerror = function (event) {
                logger.error("Get request error while marking job ".concat(id, " complete then removing from jobs database"));
                logger.errorObject(event);
                reject(new Error("Get request error while marking job ".concat(id, " complete then removing from jobs database")));
              };
            });

          case 6:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26);
  }));
  return _markJobCompleteThenRemoveFromDatabase.apply(this, arguments);
}

function _markJobCleanupAndRemoveInDatabase(id) {
  return _updateJobInDatabase2(id, function (value) {
    if (typeof value === 'undefined') {
      throw new _JobDoesNotExistError("Unable to mark job ".concat(id, " as status ").concat(_JOB_CLEANUP_AND_REMOVE_STATUS, " in database, job does not exist"));
    }

    if (value.status === _JOB_PENDING_STATUS) {
      return false;
    }

    if (value.status === _JOB_ABORTED_STATUS) {
      return false;
    }

    value.status = _JOB_CLEANUP_AND_REMOVE_STATUS; // eslint-disable-line no-param-reassign

    return value;
  });
}

function _markJobAsAbortedOrRemoveFromDatabase(id) {
  return _updateJobInDatabase2(id, function (value) {
    if (typeof value === 'undefined') {
      return;
    }

    if (value.status === _JOB_ERROR_STATUS) {
      value.status = _JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign

      return value; // eslint-disable-line consistent-return
    }

    if (value.status === _JOB_CLEANUP_STATUS) {
      value.status = _JOB_ABORTED_STATUS; // eslint-disable-line no-param-reassign

      return value; // eslint-disable-line consistent-return
    }

    if (value.status === _JOB_CLEANUP_AND_REMOVE_STATUS) {
      return false; // eslint-disable-line consistent-return
    }

    throw new Error("Unable to mark job ".concat(id, " as aborted or remove after cleanup, unable to handle status ").concat(value.status));
  });
}

function _markJobStartAfterInDatabase(id, startAfter) {
  return _updateJobInDatabase2(id, function (value) {
    if (typeof value === 'undefined') {
      throw new _JobDoesNotExistError("Unable to mark job ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, job does not exist"));
    }

    if (startAfter < value.startAfter) {
      return;
    }

    value.startAfter = startAfter; // eslint-disable-line no-param-reassign

    return value; // eslint-disable-line consistent-return
  });
}

function _markCleanupStartAfterInDatabase(id, startAfter) {
  return _updateCleanupInDatabase2(id, function (value) {
    if (typeof value === 'undefined') {
      throw new _CleanupDoesNotExistError("Unable to mark cleanup ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, cleanup does not exist"));
    }

    if (startAfter < value.startAfter) {
      return;
    }

    value.startAfter = startAfter; // eslint-disable-line  no-param-reassign

    return value; // eslint-disable-line consistent-return
  });
}

function _markQueueForCleanupInDatabase2(_x30) {
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _markQueueForCleanupInDatabase() {
  _markQueueForCleanupInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            _context27.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context27.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(queueId));
            jobs = [];
            _context27.next = 8;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                var length = event.target.result.length;
                var lastRequest;

                for (var i = 0; i < length; i += 1) {
                  var value = Object.assign({}, event.target.result[i]);

                  switch (value.status) {
                    case _JOB_ERROR_STATUS:
                      value.status = _JOB_CLEANUP_STATUS;
                      jobs.push(value);
                      break;

                    case _JOB_COMPLETE_STATUS:
                      value.status = _JOB_CLEANUP_STATUS;
                      jobs.push(value);
                      break;

                    case _JOB_PENDING_STATUS:
                      value.status = _JOB_ABORTED_STATUS;
                      break;

                    case _JOB_CLEANUP_STATUS:
                      jobs.push(value);
                      continue;

                    case _JOB_CLEANUP_AND_REMOVE_STATUS:
                      jobs.push(value);
                      continue;

                    case _JOB_ABORTED_STATUS:
                      continue;

                    default:
                      logger.warn("Unhandled job status ".concat(value.status, " while marking queue ").concat(queueId, " for cleanup"));
                      continue;
                  }

                  var putRequest = store.put(value);

                  _localJobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);

                  _jobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);

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

          case 8:
            return _context27.abrupt("return", jobs);

          case 9:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27);
  }));
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase2(_x31, _x32) {
  return _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase.apply(this, arguments);
}

function _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase() {
  _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(queueId, jobId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            _context28.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context28.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(queueId));
            jobs = [];
            _context28.next = 8;
            return new Promise(function (resolve, reject) {
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
                    case _JOB_ERROR_STATUS:
                      value.status = _JOB_CLEANUP_AND_REMOVE_STATUS;
                      jobs.push(value);
                      break;

                    case _JOB_COMPLETE_STATUS:
                      value.status = _JOB_CLEANUP_AND_REMOVE_STATUS;
                      jobs.push(value);
                      break;

                    case _JOB_PENDING_STATUS:
                      shouldRemove = true;
                      break;

                    case _JOB_CLEANUP_STATUS:
                      value.status = _JOB_CLEANUP_AND_REMOVE_STATUS;
                      jobs.push(value);
                      break;

                    case _JOB_CLEANUP_AND_REMOVE_STATUS:
                      jobs.push(value);
                      continue;

                    case _JOB_ABORTED_STATUS:
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

                    _localJobEmitter.emit('jobDelete', id, queueId);

                    _jobEmitter.emit('jobDelete', id, queueId);

                    lastRequest = deleteRequest;

                    deleteRequest.onerror = function (event2) {
                      logger.error("Delete request error while marking queue ".concat(queueId, " for cleanup and removal"));
                      logger.errorObject(event2);
                      reject(new Error("Delete request error while marking queue ".concat(queueId, " for cleanup and removal")));
                    };
                  } else {
                    var putRequest = store.put(value);

                    _localJobEmitter.emit('jobUpdate', id, queueId, type, status);

                    _jobEmitter.emit('jobUpdate', id, queueId, type, status);

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

          case 8:
            return _context28.abrupt("return", jobs);

          case 9:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28);
  }));
  return _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase.apply(this, arguments);
}

function _markQueueForCleanupAndRemoveInDatabase(queueId) {
  return _markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase2(queueId, -1);
}

function _getGreatestJobIdFromQueueInDatabase2(_x33) {
  return _getGreatestJobIdFromQueueInDatabase.apply(this, arguments);
}

function _getGreatestJobIdFromQueueInDatabase() {
  _getGreatestJobIdFromQueueInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(queueId) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            _context29.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context29.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only(queueId), 'prev');
            return _context29.abrupt("return", new Promise(function (resolve, reject) {
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
            }));

          case 6:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29);
  }));
  return _getGreatestJobIdFromQueueInDatabase.apply(this, arguments);
}

function _incrementJobAttemptInDatabase2(_x34) {
  return _incrementJobAttemptInDatabase.apply(this, arguments);
}

function _incrementJobAttemptInDatabase() {
  _incrementJobAttemptInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(id) {
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            _context30.next = 2;
            return _updateJobInDatabase2(id, function (value) {
              if (typeof value === 'undefined') {
                throw new _JobDoesNotExistError("Unable to increment attempts for job ".concat(id, " in database, job does not exist"));
              }

              value.attempt += 1; // eslint-disable-line no-param-reassign

              // eslint-disable-line no-param-reassign
              return value;
            });

          case 2:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30);
  }));
  return _incrementJobAttemptInDatabase.apply(this, arguments);
}

function _incrementCleanupAttemptInDatabase2(_x35, _x36) {
  return _incrementCleanupAttemptInDatabase.apply(this, arguments);
}

function _incrementCleanupAttemptInDatabase() {
  _incrementCleanupAttemptInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(id, queueId) {
    var attempt;
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            attempt = 1;
            _context31.next = 3;
            return _updateCleanupInDatabase2(id, function (value) {
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

              // eslint-disable-line no-param-reassign
              return value;
            });

          case 3:
            return _context31.abrupt("return", attempt);

          case 4:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31);
  }));
  return _incrementCleanupAttemptInDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase2(_x37, _x38, _x39) {
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase() {
  _bulkEnqueueToDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(queueId, items, delay) {
    var i, _items$i, type, args, ids, store;

    return regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context32.next = 2;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            if (Array.isArray(items)) {
              _context32.next = 4;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid \"items\" argument type \"".concat(_typeof(items), "\""));

          case 4:
            i = 0;

          case 5:
            if (!(i < items.length)) {
              _context32.next = 14;
              break;
            }

            _items$i = _slicedToArray(items[i], 2), type = _items$i[0], args = _items$i[1];

            if (!(typeof type !== 'string')) {
              _context32.next = 9;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid items[".concat(i, "] \"type\" argument type \"").concat(_typeof(type), "\""));

          case 9:
            if (Array.isArray(args)) {
              _context32.next = 11;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid items[".concat(i, "] \"args\" argument type \"").concat(_typeof(args), "\""));

          case 11:
            i += 1;
            _context32.next = 5;
            break;

          case 14:
            if (!(typeof delay !== 'number')) {
              _context32.next = 16;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid \"delay\" argument type \"".concat(_typeof(delay), "\""));

          case 16:
            ids = [];
            _context32.next = 19;
            return getReadWriteJobsObjectStore();

          case 19:
            store = _context32.sent;
            _context32.next = 22;
            return new Promise(function (resolve, reject) {
              var _loop2 = function _loop2(_i2) {
                var _items$_i = _slicedToArray(items[_i2], 2),
                    type = _items$_i[0],
                    args = _items$_i[1];

                var value = {
                  queueId: queueId,
                  type: type,
                  args: args,
                  attempt: 0,
                  created: Date.now(),
                  status: _JOB_PENDING_STATUS,
                  startAfter: Date.now() + delay
                };
                var request = store.put(value);

                request.onsuccess = function () {
                  var id = request.result;
                  ids.push(request.result);

                  _localJobEmitter.emit('jobAdd', id, queueId, type);

                  _jobEmitter.emit('jobAdd', id, queueId, type);

                  resolve(request.result);
                };

                request.onerror = function (event) {
                  logger.error("Request error while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId));
                  logger.errorObject(event);
                  reject(new Error("Request error while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
                };
              };

              for (var _i2 = 0; _i2 < items.length; _i2 += 1) {
                _loop2(_i2);
              }

              store.transaction.commit();
            });

          case 22:
            return _context32.abrupt("return", ids);

          case 23:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32);
  }));
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase2(_x40, _x41, _x42, _x43) {
  return _enqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase() {
  _enqueueToDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(queueId, type, args, delay) {
    var value, store, request, id;
    return regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context33.next = 2;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            if (!(typeof type !== 'string')) {
              _context33.next = 4;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"type\" argument type \"".concat(_typeof(type), "\""));

          case 4:
            if (Array.isArray(args)) {
              _context33.next = 6;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"args\" argument type \"".concat(_typeof(args), "\""));

          case 6:
            if (!(typeof delay !== 'number')) {
              _context33.next = 8;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"delay\" argument type \"".concat(_typeof(delay), "\""));

          case 8:
            value = {
              queueId: queueId,
              type: type,
              args: args,
              attempt: 0,
              created: Date.now(),
              status: _JOB_PENDING_STATUS,
              startAfter: Date.now() + delay
            };
            _context33.next = 11;
            return getReadWriteJobsObjectStore();

          case 11:
            store = _context33.sent;
            request = store.put(value);
            _context33.next = 15;
            return new Promise(function (resolve, reject) {
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

          case 15:
            id = _context33.sent;

            _localJobEmitter.emit('jobAdd', id, queueId, type);

            _jobEmitter.emit('jobAdd', id, queueId, type);

            return _context33.abrupt("return", id);

          case 19:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33);
  }));
  return _enqueueToDatabase.apply(this, arguments);
}

function _restoreJobToDatabaseForCleanupAndRemove2(_x44, _x45, _x46, _x47) {
  return _restoreJobToDatabaseForCleanupAndRemove.apply(this, arguments);
}

function _restoreJobToDatabaseForCleanupAndRemove() {
  _restoreJobToDatabaseForCleanupAndRemove = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(id, queueId, type, args) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            if (!(typeof id !== 'number')) {
              _context34.next = 2;
              break;
            }

            throw new TypeError("Unable to restore to database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            if (!(typeof queueId !== 'string')) {
              _context34.next = 4;
              break;
            }

            throw new TypeError("Unable to restore to database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 4:
            if (!(typeof type !== 'string')) {
              _context34.next = 6;
              break;
            }

            throw new TypeError("Unable to restore to database, received invalid \"type\" argument type \"".concat(_typeof(type), "\""));

          case 6:
            if (Array.isArray(args)) {
              _context34.next = 8;
              break;
            }

            throw new TypeError("Unable to restore to database, received invalid \"args\" argument type \"".concat(_typeof(args), "\""));

          case 8:
            value = {
              id: id,
              queueId: queueId,
              type: type,
              args: args,
              attempt: 1,
              created: Date.now(),
              status: _JOB_CLEANUP_AND_REMOVE_STATUS,
              startAfter: Date.now()
            };
            _context34.next = 11;
            return getReadWriteJobsObjectStore();

          case 11:
            store = _context34.sent;
            request = store.put(value);
            _context34.next = 15;
            return new Promise(function (resolve, reject) {
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

          case 15:
            _localJobEmitter.emit('jobAdd', id, queueId, type);

            _jobEmitter.emit('jobAdd', id, queueId, type);

            return _context34.abrupt("return", id);

          case 18:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34);
  }));
  return _restoreJobToDatabaseForCleanupAndRemove.apply(this, arguments);
}

function _dequeueFromDatabase2() {
  return _dequeueFromDatabase.apply(this, arguments);
}

function _dequeueFromDatabase() {
  _dequeueFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35() {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            _context35.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context35.sent;
            index = store.index('statusIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.bound(_JOB_CLEANUP_AND_REMOVE_STATUS, _JOB_PENDING_STATUS));
            _context35.next = 7;
            return new Promise(function (resolve, reject) {
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

          case 7:
            jobs = _context35.sent;
            return _context35.abrupt("return", jobs);

          case 9:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35);
  }));
  return _dequeueFromDatabase.apply(this, arguments);
}

function _getContiguousIds(ids) {
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

function _dequeueFromDatabaseNotIn2(_x48) {
  return _dequeueFromDatabaseNotIn.apply(this, arguments);
}

function _dequeueFromDatabaseNotIn() {
  _dequeueFromDatabaseNotIn = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(ids) {
    var _yield$getReadOnlyJob, _yield$getReadOnlyJob2, store, promise, index, jobs, request;

    return regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            if (!(ids.length === 0)) {
              _context36.next = 2;
              break;
            }

            return _context36.abrupt("return", _dequeueFromDatabase2());

          case 2:
            _context36.next = 4;
            return getReadOnlyJobsObjectStoreAndTransactionPromise();

          case 4:
            _yield$getReadOnlyJob = _context36.sent;
            _yield$getReadOnlyJob2 = _slicedToArray(_yield$getReadOnlyJob, 2);
            store = _yield$getReadOnlyJob2[0];
            promise = _yield$getReadOnlyJob2[1];
            index = store.index('statusIndex');
            jobs = []; // $FlowFixMe

            request = index.getAllKeys(IDBKeyRange.bound(_JOB_CLEANUP_AND_REMOVE_STATUS, _JOB_PENDING_STATUS));

            request.onsuccess = function (event) {
              var _iterator5 = _createForOfIteratorHelper(event.target.result),
                  _step5;

              try {
                var _loop3 = function _loop3() {
                  var id = _step5.value;

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

                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  var _ret = _loop3();

                  if (_ret === "continue") continue;
                }
              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
              }

              store.transaction.commit();
            };

            request.onerror = function (event) {
              logger.error('Request error while dequeing');
              logger.errorObject(event);
            };

            _context36.next = 15;
            return promise;

          case 15:
            return _context36.abrupt("return", jobs);

          case 16:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36);
  }));
  return _dequeueFromDatabaseNotIn.apply(this, arguments);
}

function _getJobsWithTypeFromDatabase2(_x49) {
  return _getJobsWithTypeFromDatabase.apply(this, arguments);
}

function _getJobsWithTypeFromDatabase() {
  _getJobsWithTypeFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(type) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            _context37.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context37.sent;
            index = store.index('typeIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(type));
            return _context37.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                resolve(event.target.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting jobs with type ".concat(type, " from jobs database"));
                logger.errorObject(event);
                reject(new Error("Error while getting jobs with type ".concat(type, " from jobs database")));
              };

              store.transaction.commit();
            }));

          case 6:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37);
  }));
  return _getJobsWithTypeFromDatabase.apply(this, arguments);
}

function _getJobsInQueueFromDatabase2(_x50) {
  return _getJobsInQueueFromDatabase.apply(this, arguments);
}

function _getJobsInQueueFromDatabase() {
  _getJobsInQueueFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context38.next = 2;
              break;
            }

            throw new TypeError("Unable to get jobs in queue from database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            _context38.next = 4;
            return getReadOnlyJobsObjectStore();

          case 4:
            store = _context38.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(queueId));
            _context38.next = 9;
            return new Promise(function (resolve, reject) {
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

          case 9:
            jobs = _context38.sent;
            return _context38.abrupt("return", jobs);

          case 11:
          case "end":
            return _context38.stop();
        }
      }
    }, _callee38);
  }));
  return _getJobsInQueueFromDatabase.apply(this, arguments);
}

function _getJobsInDatabase2(_x51) {
  return _getJobsInDatabase.apply(this, arguments);
}

function _getJobsInDatabase() {
  _getJobsInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(jobIds) {
    var _yield$getReadOnlyJob3, _yield$getReadOnlyJob4, store, promise, jobs, _iterator6, _step6, _loop4;

    return regeneratorRuntime.wrap(function _callee39$(_context39) {
      while (1) {
        switch (_context39.prev = _context39.next) {
          case 0:
            if (Array.isArray(jobIds)) {
              _context39.next = 2;
              break;
            }

            throw new TypeError("Unable to get jobs from database, received invalid \"jobIds\" argument type \"".concat(_typeof(jobIds), "\""));

          case 2:
            _context39.next = 4;
            return getReadOnlyJobsObjectStoreAndTransactionPromise();

          case 4:
            _yield$getReadOnlyJob3 = _context39.sent;
            _yield$getReadOnlyJob4 = _slicedToArray(_yield$getReadOnlyJob3, 2);
            store = _yield$getReadOnlyJob4[0];
            promise = _yield$getReadOnlyJob4[1];
            jobs = [];
            _iterator6 = _createForOfIteratorHelper(jobIds);

            try {
              _loop4 = function _loop4() {
                var jobId = _step6.value;
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

              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                _loop4();
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }

            store.transaction.commit();
            _context39.next = 14;
            return promise;

          case 14:
            return _context39.abrupt("return", jobs);

          case 15:
          case "end":
            return _context39.stop();
        }
      }
    }, _callee39);
  }));
  return _getJobsInDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase2(_x52) {
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase() {
  _getCompletedJobsCountFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40(queueId) {
    var jobs;
    return regeneratorRuntime.wrap(function _callee40$(_context40) {
      while (1) {
        switch (_context40.prev = _context40.next) {
          case 0:
            _context40.next = 2;
            return _getCompletedJobsFromDatabase2(queueId);

          case 2:
            jobs = _context40.sent;
            return _context40.abrupt("return", jobs.length);

          case 4:
          case "end":
            return _context40.stop();
        }
      }
    }, _callee40);
  }));
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase2(_x53) {
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase() {
  _getCompletedJobsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee41$(_context41) {
      while (1) {
        switch (_context41.prev = _context41.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context41.next = 2;
              break;
            }

            throw new TypeError("Unable to get completed jobs database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            _context41.next = 4;
            return getReadOnlyJobsObjectStore();

          case 4:
            store = _context41.sent;
            index = store.index('statusQueueIdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only([queueId, _JOB_COMPLETE_STATUS]));
            _context41.next = 9;
            return new Promise(function (resolve, reject) {
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

          case 9:
            jobs = _context41.sent;
            return _context41.abrupt("return", jobs);

          case 11:
          case "end":
            return _context41.stop();
        }
      }
    }, _callee41);
  }));
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase2(_x54, _x55) {
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase() {
  _storeAuthDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(id, data) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee42$(_context42) {
      while (1) {
        switch (_context42.prev = _context42.next) {
          case 0:
            if (!(typeof id !== 'string')) {
              _context42.next = 2;
              break;
            }

            throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            if (!(_typeof(data) !== 'object')) {
              _context42.next = 4;
              break;
            }

            throw new TypeError("Unable to store auth data in database, received invalid \"data\" argument type \"".concat(_typeof(data), "\""));

          case 4:
            _context42.next = 6;
            return getReadWriteAuthObjectStore();

          case 6:
            store = _context42.sent;
            request = store.put({
              id: id,
              data: data
            });
            _context42.next = 10;
            return new Promise(function (resolve, reject) {
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

          case 10:
          case "end":
            return _context42.stop();
        }
      }
    }, _callee42);
  }));
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase2(_x56) {
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase() {
  _getAuthDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(id) {
    var store, request, authData;
    return regeneratorRuntime.wrap(function _callee43$(_context43) {
      while (1) {
        switch (_context43.prev = _context43.next) {
          case 0:
            if (!(typeof id !== 'string')) {
              _context43.next = 2;
              break;
            }

            throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            _context43.next = 4;
            return getReadOnlyAuthObjectStore();

          case 4:
            store = _context43.sent;
            request = store.get(id);
            _context43.next = 8;
            return new Promise(function (resolve, reject) {
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

          case 8:
            authData = _context43.sent;
            return _context43.abrupt("return", typeof authData !== 'undefined' ? authData.data : undefined);

          case 10:
          case "end":
            return _context43.stop();
        }
      }
    }, _callee43);
  }));
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase2(_x57) {
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase() {
  _removeAuthDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee44$(_context44) {
      while (1) {
        switch (_context44.prev = _context44.next) {
          case 0:
            if (!(typeof id !== 'string')) {
              _context44.next = 2;
              break;
            }

            throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            _context44.next = 4;
            return getReadWriteAuthObjectStore();

          case 4:
            store = _context44.sent;
            request = store.delete(id);
            return _context44.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while removing auth data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Error while removing auth data for ".concat(id)));
              };

              store.transaction.commit();
            }));

          case 7:
          case "end":
            return _context44.stop();
        }
      }
    }, _callee44);
  }));
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function _getQueueStatus2(_x58) {
  return _getQueueStatus.apply(this, arguments);
}

function _getQueueStatus() {
  _getQueueStatus = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45(queueId) {
    var store, index, abortedRequest, completeRequest, pendingRequest, errorRequest, cleanupRequest, cleanupAndRemoveRequest, abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise, cleanupAndRemoveCountPromise, _yield$Promise$all, _yield$Promise$all2, abortedCount, completeCount, pendingCount, errorCount, cleanupCount, cleanupAndRemoveCount;

    return regeneratorRuntime.wrap(function _callee45$(_context45) {
      while (1) {
        switch (_context45.prev = _context45.next) {
          case 0:
            _context45.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context45.sent;
            index = store.index('statusQueueIdIndex'); // $FlowFixMe

            abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_ABORTED_STATUS])); // $FlowFixMe

            completeRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_COMPLETE_STATUS])); // $FlowFixMe

            pendingRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_PENDING_STATUS])); // $FlowFixMe

            errorRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_ERROR_STATUS])); // $FlowFixMe

            cleanupRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_CLEANUP_STATUS])); // $FlowFixMe

            cleanupAndRemoveRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_CLEANUP_AND_REMOVE_STATUS]));
            abortedCountPromise = new Promise(function (resolve, reject) {
              abortedRequest.onsuccess = function (event) {
                resolve(event.target.result.length);
              };

              abortedRequest.onerror = function (event) {
                logger.error("Request error while getting status of queue ".concat(queueId));
                logger.errorObject(event);
                reject(new Error("Request error while getting status of queue ".concat(queueId)));
              };
            });
            completeCountPromise = new Promise(function (resolve, reject) {
              completeRequest.onsuccess = function (event) {
                resolve(event.target.result.length);
              };

              completeRequest.onerror = function (event) {
                logger.error("Request error while getting status of queue ".concat(queueId));
                logger.errorObject(event);
                reject(new Error("Request error while getting status of queue ".concat(queueId)));
              };
            });
            pendingCountPromise = new Promise(function (resolve, reject) {
              pendingRequest.onsuccess = function (event) {
                resolve(event.target.result.length);
              };

              pendingRequest.onerror = function (event) {
                logger.error("Request error while getting status of queue ".concat(queueId));
                logger.errorObject(event);
                reject(new Error("Request error while getting status of queue ".concat(queueId)));
              };
            });
            errorCountPromise = new Promise(function (resolve, reject) {
              errorRequest.onsuccess = function (event) {
                resolve(event.target.result.length);
              };

              errorRequest.onerror = function (event) {
                logger.error("Request error while getting status of queue ".concat(queueId));
                logger.errorObject(event);
                reject(new Error("Request error while getting status of queue ".concat(queueId)));
              };
            });
            cleanupCountPromise = new Promise(function (resolve, reject) {
              cleanupRequest.onsuccess = function (event) {
                resolve(event.target.result.length);
              };

              cleanupRequest.onerror = function (event) {
                logger.error("Request error while getting status of queue ".concat(queueId));
                logger.errorObject(event);
                reject(new Error("Request error while getting status of queue ".concat(queueId)));
              };
            });
            cleanupAndRemoveCountPromise = new Promise(function (resolve, reject) {
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
            _context45.next = 19;
            return Promise.all([abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise, cleanupAndRemoveCountPromise]);

          case 19:
            _yield$Promise$all = _context45.sent;
            _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 6);
            abortedCount = _yield$Promise$all2[0];
            completeCount = _yield$Promise$all2[1];
            pendingCount = _yield$Promise$all2[2];
            errorCount = _yield$Promise$all2[3];
            cleanupCount = _yield$Promise$all2[4];
            cleanupAndRemoveCount = _yield$Promise$all2[5];

            if (!(abortedCount > 0 || cleanupCount > 0)) {
              _context45.next = 29;
              break;
            }

            return _context45.abrupt("return", _QUEUE_ERROR_STATUS);

          case 29:
            if (!(errorCount > 0 || pendingCount > 0 || cleanupAndRemoveCount > 0)) {
              _context45.next = 31;
              break;
            }

            return _context45.abrupt("return", _QUEUE_PENDING_STATUS);

          case 31:
            if (!(completeCount > 0)) {
              _context45.next = 33;
              break;
            }

            return _context45.abrupt("return", _QUEUE_COMPLETE_STATUS);

          case 33:
            return _context45.abrupt("return", _QUEUE_EMPTY_STATUS);

          case 34:
          case "end":
            return _context45.stop();
        }
      }
    }, _callee45);
  }));
  return _getQueueStatus.apply(this, arguments);
}

function _addArgLookup2(_x59, _x60, _x61) {
  return _addArgLookup.apply(this, arguments);
}

function _addArgLookup() {
  _addArgLookup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46(jobId, key, jsonPath) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee46$(_context46) {
      while (1) {
        switch (_context46.prev = _context46.next) {
          case 0:
            if (!(typeof jobId !== 'number')) {
              _context46.next = 2;
              break;
            }

            throw new TypeError("Unable add argument lookup, received invalid \"jobId\" argument type \"".concat(_typeof(jobId), "\""));

          case 2:
            if (!(typeof key !== 'string')) {
              _context46.next = 4;
              break;
            }

            throw new TypeError("Unable add argument lookup, received invalid \"key\" argument type \"".concat(_typeof(key), "\""));

          case 4:
            if (!(typeof jsonPath !== 'string')) {
              _context46.next = 6;
              break;
            }

            throw new TypeError("Unable add argument lookup, received invalid \"jsonPath\" argument type \"".concat(_typeof(jsonPath), "\""));

          case 6:
            _context46.next = 8;
            return getReadWriteArgLookupObjectStore();

          case 8:
            store = _context46.sent;
            request = store.put({
              jobId: jobId,
              key: key,
              jsonPath: jsonPath
            });
            return _context46.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while adding argument lookup for job ".concat(jobId, " with key \"").concat(key, "\" and JSON path \"").concat(jsonPath, "\""));
                logger.errorObject(event);
                reject(new Error("Error while adding argument lookup for job ".concat(jobId, " with key \"").concat(key, "\" and JSON path \"").concat(jsonPath, "\"")));
              };

              store.transaction.commit();
            }));

          case 11:
          case "end":
            return _context46.stop();
        }
      }
    }, _callee46);
  }));
  return _addArgLookup.apply(this, arguments);
}

function _getArgLookupJobPathMap2(_x62) {
  return _getArgLookupJobPathMap.apply(this, arguments);
}

function _getArgLookupJobPathMap() {
  _getArgLookupJobPathMap = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47(key) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee47$(_context47) {
      while (1) {
        switch (_context47.prev = _context47.next) {
          case 0:
            if (!(typeof key !== 'string')) {
              _context47.next = 2;
              break;
            }

            throw new TypeError("Unable to lookup arguments, received invalid \"key\" argument type \"".concat(_typeof(key), "\""));

          case 2:
            _context47.next = 4;
            return getReadOnlyArgLookupObjectStore();

          case 4:
            store = _context47.sent;
            index = store.index('keyIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(key));
            return _context47.abrupt("return", new Promise(function (resolve, reject) {
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
            }));

          case 8:
          case "end":
            return _context47.stop();
        }
      }
    }, _callee47);
  }));
  return _getArgLookupJobPathMap.apply(this, arguments);
}

function _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase2(_x63) {
  return _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase.apply(this, arguments);
}

function _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase() {
  _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48(key) {
    var store, index, request, jobIds;
    return regeneratorRuntime.wrap(function _callee48$(_context48) {
      while (1) {
        switch (_context48.prev = _context48.next) {
          case 0:
            if (!(typeof key !== 'string')) {
              _context48.next = 2;
              break;
            }

            throw new TypeError("Unable to lookup arguments, received invalid \"key\" argument type \"".concat(_typeof(key), "\""));

          case 2:
            _context48.next = 4;
            return getReadOnlyArgLookupObjectStore();

          case 4:
            store = _context48.sent;
            index = store.index('keyIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(key));
            _context48.next = 9;
            return new Promise(function (resolve, reject) {
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

          case 9:
            jobIds = _context48.sent;
            _context48.next = 12;
            return Promise.all(jobIds.map(_markJobCleanupAndRemoveInDatabase));

          case 12:
          case "end":
            return _context48.stop();
        }
      }
    }, _callee48);
  }));
  return _markJobsWithArgLookupKeyCleanupAndRemoveInDatabase.apply(this, arguments);
}

function _lookupArgs2(_x64) {
  return _lookupArgs.apply(this, arguments);
}

function _lookupArgs() {
  _lookupArgs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49(key) {
    var database, transaction, argLookupObjectStore, argLookupIndex, argLookupRequest, results;
    return regeneratorRuntime.wrap(function _callee49$(_context49) {
      while (1) {
        switch (_context49.prev = _context49.next) {
          case 0:
            _context49.next = 2;
            return _databasePromise;

          case 2:
            database = _context49.sent;
            transaction = database.transaction(['arg-lookup', 'jobs'], 'readonly', {
              durability: 'relaxed'
            });
            argLookupObjectStore = transaction.objectStore('arg-lookup');

            transaction.onabort = function (event) {
              logger.error('Read-only lookupArgs transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-only lookupArgs transaction');
              logger.errorObject(event);
            };

            argLookupIndex = argLookupObjectStore.index('keyIndex'); // $FlowFixMe

            argLookupRequest = argLookupIndex.getAll(IDBKeyRange.only(key));
            results = [];
            return _context49.abrupt("return", new Promise(function (resolve, reject) {
              argLookupRequest.onsuccess = function (argLookupEvent) {
                var argLookups = argLookupEvent.target.result;

                if (argLookups.length === 0) {
                  resolve([]);
                  transaction.commit();
                  return;
                }

                var jobsObjectStore = transaction.objectStore('jobs');

                var _loop5 = function _loop5(i) {
                  var _argLookups$i = argLookups[i],
                      jobId = _argLookups$i.jobId,
                      jsonPath = _argLookups$i.jsonPath;
                  var jobRequest = jobsObjectStore.get(jobId);

                  jobRequest.onsuccess = function () {
                    if (typeof jobRequest.result === 'undefined') {
                      return;
                    }

                    var args = jobRequest.result.args;

                    var _iterator7 = _createForOfIteratorHelper((0, _jsonpathPlus.JSONPath)({
                      path: jsonPath,
                      json: args
                    })),
                        _step7;

                    try {
                      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                        var result = _step7.value;
                        results.push(result);
                      }
                    } catch (err) {
                      _iterator7.e(err);
                    } finally {
                      _iterator7.f();
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
                  _loop5(i);
                }

                transaction.commit();
              };

              argLookupRequest.onerror = function (event) {
                logger.error("Request error looking up arguments for key ".concat(key));
                logger.errorObject(event);
                reject(new Error("Request error looking up arguments for key ".concat(key)));
              };
            }));

          case 11:
          case "end":
            return _context49.stop();
        }
      }
    }, _callee49);
  }));
  return _lookupArgs.apply(this, arguments);
}

function _lookupArg2(_x65) {
  return _lookupArg.apply(this, arguments);
}

function _lookupArg() {
  _lookupArg = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50(key) {
    var results;
    return regeneratorRuntime.wrap(function _callee50$(_context50) {
      while (1) {
        switch (_context50.prev = _context50.next) {
          case 0:
            _context50.next = 2;
            return _lookupArgs2(key);

          case 2:
            results = _context50.sent;
            return _context50.abrupt("return", results[0]);

          case 4:
          case "end":
            return _context50.stop();
        }
      }
    }, _callee50);
  }));
  return _lookupArg.apply(this, arguments);
}

function removeArgLookupsForJobAsMicrotask(jobId) {
  self.queueMicrotask(function () {
    return _removeArgLookupsForJob2(jobId).catch(function (error) {
      logger.error("Unable to remove argument lookups for job ".concat(jobId, " in microtask"));
      logger.errorStack(error);
    });
  });
}

function _removeArgLookupsForJob2(_x66) {
  return _removeArgLookupsForJob.apply(this, arguments);
}

function _removeArgLookupsForJob() {
  _removeArgLookupsForJob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51(jobId) {
    var _yield$getReadWriteAr, _yield$getReadWriteAr2, store, promise, index, request;

    return regeneratorRuntime.wrap(function _callee51$(_context51) {
      while (1) {
        switch (_context51.prev = _context51.next) {
          case 0:
            _context51.next = 2;
            return getReadWriteArgLookupObjectStoreAndTransactionPromise();

          case 2:
            _yield$getReadWriteAr = _context51.sent;
            _yield$getReadWriteAr2 = _slicedToArray(_yield$getReadWriteAr, 2);
            store = _yield$getReadWriteAr2[0];
            promise = _yield$getReadWriteAr2[1];
            index = store.index('jobIdIndex'); // $FlowFixMe

            request = index.getAllKeys(IDBKeyRange.only(jobId));

            request.onsuccess = function (event) {
              var _iterator8 = _createForOfIteratorHelper(event.target.result),
                  _step8;

              try {
                for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                  var id = _step8.value;
                  var deleteRequest = store.delete(id);

                  deleteRequest.onerror = function (deleteEvent) {
                    logger.error("Delete request error while removing argument lookups for job ".concat(jobId));
                    logger.errorObject(deleteEvent);
                  };
                }
              } catch (err) {
                _iterator8.e(err);
              } finally {
                _iterator8.f();
              }

              store.transaction.commit();
            };

            request.onerror = function (event) {
              logger.error("Request error while removing argument lookups for job ".concat(jobId));
              logger.errorObject(event);
            };

            _context51.next = 12;
            return promise;

          case 12:
          case "end":
            return _context51.stop();
        }
      }
    }, _callee51);
  }));
  return _removeArgLookupsForJob.apply(this, arguments);
}

var UNLOAD_DATA_ID = '_UNLOAD_DATA';

function _updateUnloadDataInDatabase(transform) {
  return _updateMetadataInDatabase2(UNLOAD_DATA_ID, transform);
}

function _getUnloadDataFromDatabase() {
  return _getMetadataFromDatabase2(UNLOAD_DATA_ID);
}

function _clearUnloadDataInDatabase() {
  return _clearMetadataInDatabase2(UNLOAD_DATA_ID);
}

export var localJobEmitter = exports.localJobEmitter;
export var jobEmitter = exports.jobEmitter;
export var JobDoesNotExistError = exports.JobDoesNotExistError;
export var CleanupDoesNotExistError = exports.CleanupDoesNotExistError;
export var QUEUE_ERROR_STATUS = exports.QUEUE_ERROR_STATUS;
export var QUEUE_PENDING_STATUS = exports.QUEUE_PENDING_STATUS;
export var QUEUE_COMPLETE_STATUS = exports.QUEUE_COMPLETE_STATUS;
export var QUEUE_EMPTY_STATUS = exports.QUEUE_EMPTY_STATUS;
export var JOB_ABORTED_STATUS = exports.JOB_ABORTED_STATUS;
export var JOB_COMPLETE_STATUS = exports.JOB_COMPLETE_STATUS;
export var JOB_PENDING_STATUS = exports.JOB_PENDING_STATUS;
export var JOB_ERROR_STATUS = exports.JOB_ERROR_STATUS;
export var JOB_CLEANUP_STATUS = exports.JOB_CLEANUP_STATUS;
export var JOB_CLEANUP_AND_REMOVE_STATUS = exports.JOB_CLEANUP_AND_REMOVE_STATUS;
export var databasePromise = exports.databasePromise;
export var clearDatabase = exports.clearDatabase;
export var removeJobsWithQueueIdAndTypeFromDatabase = exports.removeJobsWithQueueIdAndTypeFromDatabase;
export var removeQueueFromDatabase = exports.removeQueueFromDatabase;
export var removeCompletedExpiredItemsFromDatabase = exports.removeCompletedExpiredItemsFromDatabase;
export var updateJobInDatabase = exports.updateJobInDatabase;
export var getJobFromDatabase = exports.getJobFromDatabase;
export var updateCleanupInDatabase = exports.updateCleanupInDatabase;
export var removePathFromCleanupDataInDatabase = exports.removePathFromCleanupDataInDatabase;
export var updateCleanupValuesInDatabase = exports.updateCleanupValuesInDatabase;
export var silentlyRemoveJobFromDatabase = exports.silentlyRemoveJobFromDatabase;
export var removeJobFromDatabase = exports.removeJobFromDatabase;
export var removeCleanupFromDatabase = exports.removeCleanupFromDatabase;
export var getCleanupFromDatabase = exports.getCleanupFromDatabase;
export var getMetadataFromDatabase = exports.getMetadataFromDatabase;
export var clearMetadataInDatabase = exports.clearMetadataInDatabase;
export var setMetadataInDatabase = exports.setMetadataInDatabase;
export var updateMetadataInDatabase = exports.updateMetadataInDatabase;
export var markJobStatusInDatabase = exports.markJobStatusInDatabase;
export var markJobCompleteInDatabase = exports.markJobCompleteInDatabase;
export var markJobPendingInDatabase = exports.markJobPendingInDatabase;
export var markJobErrorInDatabase = exports.markJobErrorInDatabase;
export var markJobCleanupInDatabase = exports.markJobCleanupInDatabase;
export var markJobAbortedInDatabase = exports.markJobAbortedInDatabase;
export var markJobCompleteThenRemoveFromDatabase = exports.markJobCompleteThenRemoveFromDatabase;
export var markJobCleanupAndRemoveInDatabase = exports.markJobCleanupAndRemoveInDatabase;
export var markJobAsAbortedOrRemoveFromDatabase = exports.markJobAsAbortedOrRemoveFromDatabase;
export var markJobStartAfterInDatabase = exports.markJobStartAfterInDatabase;
export var markCleanupStartAfterInDatabase = exports.markCleanupStartAfterInDatabase;
export var markQueueForCleanupInDatabase = exports.markQueueForCleanupInDatabase;
export var markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase = exports.markQueueJobsGreaterThanIdCleanupAndRemoveInDatabase;
export var markQueueForCleanupAndRemoveInDatabase = exports.markQueueForCleanupAndRemoveInDatabase;
export var getGreatestJobIdFromQueueInDatabase = exports.getGreatestJobIdFromQueueInDatabase;
export var incrementJobAttemptInDatabase = exports.incrementJobAttemptInDatabase;
export var incrementCleanupAttemptInDatabase = exports.incrementCleanupAttemptInDatabase;
export var bulkEnqueueToDatabase = exports.bulkEnqueueToDatabase;
export var enqueueToDatabase = exports.enqueueToDatabase;
export var restoreJobToDatabaseForCleanupAndRemove = exports.restoreJobToDatabaseForCleanupAndRemove;
export var dequeueFromDatabase = exports.dequeueFromDatabase;
export var getContiguousIds = exports.getContiguousIds;
export var dequeueFromDatabaseNotIn = exports.dequeueFromDatabaseNotIn;
export var getJobsWithTypeFromDatabase = exports.getJobsWithTypeFromDatabase;
export var getJobsInQueueFromDatabase = exports.getJobsInQueueFromDatabase;
export var getJobsInDatabase = exports.getJobsInDatabase;
export var getCompletedJobsCountFromDatabase = exports.getCompletedJobsCountFromDatabase;
export var getCompletedJobsFromDatabase = exports.getCompletedJobsFromDatabase;
export var storeAuthDataInDatabase = exports.storeAuthDataInDatabase;
export var getAuthDataFromDatabase = exports.getAuthDataFromDatabase;
export var removeAuthDataFromDatabase = exports.removeAuthDataFromDatabase;
export var getQueueStatus = exports.getQueueStatus;
export var addArgLookup = exports.addArgLookup;
export var getArgLookupJobPathMap = exports.getArgLookupJobPathMap;
export var markJobsWithArgLookupKeyCleanupAndRemoveInDatabase = exports.markJobsWithArgLookupKeyCleanupAndRemoveInDatabase;
export var lookupArgs = exports.lookupArgs;
export var lookupArg = exports.lookupArg;
export var removeArgLookupsForJob = exports.removeArgLookupsForJob;
export var updateUnloadDataInDatabase = exports.updateUnloadDataInDatabase;
export var getUnloadDataFromDatabase = exports.getUnloadDataFromDatabase;
export var clearUnloadDataInDatabase = exports.clearUnloadDataInDatabase;
//# sourceMappingURL=database.js.map