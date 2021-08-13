"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearDatabase = _clearDatabase2;
exports.removeJobsWithQueueIdAndTypeFromDatabase = _removeJobsWithQueueIdAndTypeFromDatabase2;
exports.removeQueueIdFromJobsDatabase = _removeQueueIdFromJobsDatabase2;
exports.removeQueueIdFromDatabase = _removeQueueIdFromDatabase2;
exports.removeCompletedExpiredItemsFromDatabase = _removeCompletedExpiredItemsFromDatabase2;
exports.updateJobInDatabase = _updateJobInDatabase2;
exports.getJobFromDatabase = _getJobFromDatabase2;
exports.updateCleanupInDatabase = _updateCleanupInDatabase2;
exports.removePathFromCleanupDataInDatabase = _removePathFromCleanupDataInDatabase2;
exports.updateCleanupValuesInDatabase = _updateCleanupValuesInDatabase2;
exports.removeCleanupFromDatabase = _removeCleanupFromDatabase2;
exports.getCleanupFromDatabase = _getCleanupFromDatabase2;
exports.getQueueDataFromDatabase = _getQueueDataFromDatabase2;
exports.updateQueueDataInDatabase = _updateQueueDataInDatabase2;
exports.markJobStatusInDatabase = _markJobStatusInDatabase2;
exports.markJobCompleteInDatabase = _markJobCompleteInDatabase;
exports.markJobPendingInDatabase = _markJobPendingInDatabase;
exports.markJobErrorInDatabase = _markJobErrorInDatabase;
exports.markJobCleanupInDatabase = _markJobCleanupInDatabase;
exports.markJobAbortedInDatabase = _markJobAbortedInDatabase;
exports.markJobStartAfterInDatabase = _markJobStartAfterInDatabase2;
exports.markCleanupStartAfterInDatabase = _markCleanupStartAfterInDatabase2;
exports.markQueueForCleanupInDatabase = _markQueueForCleanupInDatabase2;
exports.incrementJobAttemptInDatabase = _incrementJobAttemptInDatabase2;
exports.incrementCleanupAttemptInDatabase = _incrementCleanupAttemptInDatabase2;
exports.bulkEnqueueToDatabase = _bulkEnqueueToDatabase2;
exports.enqueueToDatabase = _enqueueToDatabase2;
exports.dequeueFromDatabase = _dequeueFromDatabase2;
exports.getContiguousIds = _getContiguousIds;
exports.dequeueFromDatabaseNotIn = _dequeueFromDatabaseNotIn2;
exports.getJobsFromDatabase = _getJobsFromDatabase2;
exports.getCompletedJobsCountFromDatabase = _getCompletedJobsCountFromDatabase2;
exports.getCompletedJobsFromDatabase = _getCompletedJobsFromDatabase2;
exports.storeAuthDataInDatabase = _storeAuthDataInDatabase2;
exports.getAuthDataFromDatabase = _getAuthDataFromDatabase2;
exports.removeAuthDataFromDatabase = _removeAuthDataFromDatabase2;
exports.getQueueStatus = _getQueueStatus2;
exports.databasePromise = exports.JOB_CLEANUP_STATUS = exports.JOB_ERROR_STATUS = exports.JOB_PENDING_STATUS = exports.JOB_COMPLETE_STATUS = exports.JOB_ABORTED_STATUS = exports.QUEUE_EMPTY_STATUS = exports.QUEUE_COMPLETE_STATUS = exports.QUEUE_PENDING_STATUS = exports.QUEUE_ERROR_STATUS = exports.jobEmitter = exports.localJobEmitter = void 0;

var _merge = _interopRequireDefault(require("lodash/merge"));

var _unset = _interopRequireDefault(require("lodash/unset"));

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

// Local job emitter is for this process only,
// jobEmitter is bridged when a MessagePort is open
var _localJobEmitter = new _events.default();

exports.localJobEmitter = _localJobEmitter;

var _jobEmitter = new _events.default();

exports.jobEmitter = _jobEmitter;
var logger = (0, _logger.default)('Jobs Database');
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

var _databasePromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var request, db;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          request = self.indexedDB.open('battery-queue-02', 1);

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
              e.target.result.createObjectStore('queue-data', {
                keyPath: 'queueId'
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

function getReadWriteAuthObjectStore() {
  return _getReadWriteAuthObjectStore.apply(this, arguments);
}

function _getReadWriteAuthObjectStore() {
  _getReadWriteAuthObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _databasePromise;

          case 2:
            database = _context2.sent;
            transaction = database.transaction(['auth-data'], 'readwrite');
            objectStore = transaction.objectStore('auth-data');

            transaction.onabort = function (event) {
              logger.error('Read-write auth transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-write auth transaction');
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
  return _getReadWriteAuthObjectStore.apply(this, arguments);
}

function getReadOnlyAuthObjectStore() {
  return _getReadOnlyAuthObjectStore.apply(this, arguments);
}

function _getReadOnlyAuthObjectStore() {
  _getReadOnlyAuthObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _databasePromise;

          case 2:
            database = _context3.sent;
            transaction = database.transaction(['auth-data'], 'readonly');
            objectStore = transaction.objectStore('auth-data');

            transaction.onabort = function (event) {
              logger.error('Read-only auth transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-only auth transaction');
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
  return _getReadOnlyAuthObjectStore.apply(this, arguments);
}

function getReadWriteQueueDataObjectStore() {
  return _getReadWriteQueueDataObjectStore.apply(this, arguments);
}

function _getReadWriteQueueDataObjectStore() {
  _getReadWriteQueueDataObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _databasePromise;

          case 2:
            database = _context4.sent;
            transaction = database.transaction(['queue-data'], 'readwrite');
            objectStore = transaction.objectStore('queue-data');

            transaction.onabort = function (event) {
              logger.error('Read-write queue data transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-write queue data transaction');
              logger.errorObject(event);
            };

            return _context4.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getReadWriteQueueDataObjectStore.apply(this, arguments);
}

function getReadOnlyQueueDataObjectStore() {
  return _getReadOnlyQueueDataObjectStore.apply(this, arguments);
}

function _getReadOnlyQueueDataObjectStore() {
  _getReadOnlyQueueDataObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _databasePromise;

          case 2:
            database = _context5.sent;
            transaction = database.transaction(['queue-data'], 'readonly');
            objectStore = transaction.objectStore('queue-data');

            transaction.onabort = function (event) {
              logger.error('Read-only queue data transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-only queue data transaction');
              logger.errorObject(event);
            };

            return _context5.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _getReadOnlyQueueDataObjectStore.apply(this, arguments);
}

function getReadWriteJobsObjectStoreAndTransactionPromise() {
  return _getReadWriteJobsObjectStoreAndTransactionPromise.apply(this, arguments);
}

function _getReadWriteJobsObjectStoreAndTransactionPromise() {
  _getReadWriteJobsObjectStoreAndTransactionPromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var database, transaction, objectStore, promise;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _databasePromise;

          case 2:
            database = _context6.sent;
            transaction = database.transaction(['jobs'], 'readwrite');
            objectStore = transaction.objectStore('jobs');
            promise = new Promise(function (resolve, reject) {
              transaction.onabort = function (event) {
                logger.error('Read-write jobs transaction was aborted');
                logger.errorObject(event);
                reject(new Error('Read-write jobs transaction was aborted'));
              };

              transaction.onerror = function (event) {
                logger.error('Error in read-write jobs transaction');
                logger.errorObject(event);
                reject(new Error('Error in read-write jobs transaction'));
              };

              transaction.oncomplete = function () {
                resolve();
              };
            });
            return _context6.abrupt("return", [objectStore, promise]);

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _getReadWriteJobsObjectStoreAndTransactionPromise.apply(this, arguments);
}

function getReadOnlyJobsObjectStoreAndTransactionPromise() {
  return _getReadOnlyJobsObjectStoreAndTransactionPromise.apply(this, arguments);
}

function _getReadOnlyJobsObjectStoreAndTransactionPromise() {
  _getReadOnlyJobsObjectStoreAndTransactionPromise = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    var database, transaction, objectStore, promise;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return _databasePromise;

          case 2:
            database = _context7.sent;
            transaction = database.transaction(['jobs'], 'readonly');
            objectStore = transaction.objectStore('jobs');
            promise = new Promise(function (resolve, reject) {
              transaction.onabort = function (event) {
                logger.error('Read-only jobs transaction was aborted');
                logger.errorObject(event);
                reject(new Error('Read-only jobs transaction was aborted'));
              };

              transaction.onerror = function (event) {
                logger.error('Error in read-only jobs transaction');
                logger.errorObject(event);
                reject(new Error('Error in read-only jobs transaction'));
              };

              transaction.oncomplete = function () {
                resolve();
              };
            });
            return _context7.abrupt("return", [objectStore, promise]);

          case 7:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _getReadOnlyJobsObjectStoreAndTransactionPromise.apply(this, arguments);
}

function getReadWriteJobsObjectStore() {
  return _getReadWriteJobsObjectStore.apply(this, arguments);
}

function _getReadWriteJobsObjectStore() {
  _getReadWriteJobsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _databasePromise;

          case 2:
            database = _context8.sent;
            transaction = database.transaction(['jobs'], 'readwrite');
            objectStore = transaction.objectStore('jobs');

            transaction.onabort = function (event) {
              logger.error('Read-write jobs transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-write jobs transaction');
              logger.errorObject(event);
            };

            return _context8.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _getReadWriteJobsObjectStore.apply(this, arguments);
}

function getReadOnlyJobsObjectStore() {
  return _getReadOnlyJobsObjectStore.apply(this, arguments);
}

function _getReadOnlyJobsObjectStore() {
  _getReadOnlyJobsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return _databasePromise;

          case 2:
            database = _context9.sent;
            transaction = database.transaction(['jobs'], 'readonly');
            objectStore = transaction.objectStore('jobs');

            transaction.onabort = function (event) {
              logger.error('Read-only jobs transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-only jobs transaction');
              logger.errorObject(event);
            };

            return _context9.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _getReadOnlyJobsObjectStore.apply(this, arguments);
}

function getReadWriteCleanupsObjectStore() {
  return _getReadWriteCleanupsObjectStore.apply(this, arguments);
}

function _getReadWriteCleanupsObjectStore() {
  _getReadWriteCleanupsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return _databasePromise;

          case 2:
            database = _context10.sent;
            transaction = database.transaction(['cleanups'], 'readwrite');
            objectStore = transaction.objectStore('cleanups');

            transaction.onabort = function (event) {
              logger.error('Read-write cleanups transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-write cleanups transaction');
              logger.errorObject(event);
            };

            return _context10.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _getReadWriteCleanupsObjectStore.apply(this, arguments);
}

function getReadOnlyCleanupsObjectStore() {
  return _getReadOnlyCleanupsObjectStore.apply(this, arguments);
}

function _getReadOnlyCleanupsObjectStore() {
  _getReadOnlyCleanupsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return _databasePromise;

          case 2:
            database = _context11.sent;
            transaction = database.transaction(['cleanups'], 'readonly');
            objectStore = transaction.objectStore('cleanups');

            transaction.onabort = function (event) {
              logger.error('Read-only cleanups transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-only cleanups transaction');
              logger.errorObject(event);
            };

            return _context11.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _getReadOnlyCleanupsObjectStore.apply(this, arguments);
}

function clearQueueDataDatabase() {
  return _clearQueueDataDatabase.apply(this, arguments);
}

function _clearQueueDataDatabase() {
  _clearQueueDataDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return getReadWriteQueueDataObjectStore();

          case 2:
            store = _context12.sent;
            request = store.clear();
            _context12.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error('Error while clearing queue data database');
                logger.errorObject(event);
                reject(new Error('Error while clearing queue data database'));
              };
            });

          case 6:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _clearQueueDataDatabase.apply(this, arguments);
}

function clearJobsDatabase() {
  return _clearJobsDatabase.apply(this, arguments);
}

function _clearJobsDatabase() {
  _clearJobsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context13.sent;
            request = store.clear();
            _context13.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error('Error while clearing jobs database');
                logger.errorObject(event);
                reject(new Error('Error while clearing jobs database'));
              };
            });

          case 6:
            _localJobEmitter.emit('jobsClear');

            _jobEmitter.emit('jobsClear');

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _clearJobsDatabase.apply(this, arguments);
}

function clearCleanupsDatabase() {
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearCleanupsDatabase() {
  _clearCleanupsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context14.sent;
            request = store.clear();
            _context14.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error('Error while clearing cleanups database');
                logger.errorObject(event);
                reject(new Error('Error while clearing cleanups database'));
              };
            });

          case 6:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearDatabase2() {
  return _clearDatabase.apply(this, arguments);
}

function _clearDatabase() {
  _clearDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return clearJobsDatabase();

          case 2:
            _context15.next = 4;
            return clearCleanupsDatabase();

          case 4:
            _context15.next = 6;
            return clearQueueDataDatabase();

          case 6:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _clearDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase2(_x, _x2) {
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase() {
  _removeJobsWithQueueIdAndTypeFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(queueId, type) {
    var _yield$getReadWriteJo, _yield$getReadWriteJo2, store, promise, index, request;

    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return getReadWriteJobsObjectStoreAndTransactionPromise();

          case 2:
            _yield$getReadWriteJo = _context16.sent;
            _yield$getReadWriteJo2 = _slicedToArray(_yield$getReadWriteJo, 2);
            store = _yield$getReadWriteJo2[0];
            promise = _yield$getReadWriteJo2[1];
            index = store.index('queueIdTypeIndex'); // $FlowFixMe

            request = index.getAllKeys(IDBKeyRange.only([queueId, type]));

            request.onsuccess = function (event) {
              var _iterator = _createForOfIteratorHelper(event.target.result),
                  _step;

              try {
                var _loop = function _loop() {
                  var id = _step.value;

                  _localJobEmitter.emit('jobDelete', id, queueId);

                  _jobEmitter.emit('jobDelete', id, queueId);

                  var deleteRequest = store.delete(id);

                  deleteRequest.onerror = function (deleteEvent) {
                    logger.error("Request error while removing job ".concat(id, " in queue ").concat(queueId, " and type ").concat(type, " from jobs database"));
                    logger.errorObject(deleteEvent);
                  };
                };

                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  _loop();
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

            _context16.next = 12;
            return promise;

          case 12:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function _removeQueueIdFromJobsDatabase2(_x3) {
  return _removeQueueIdFromJobsDatabase.apply(this, arguments);
}

function _removeQueueIdFromJobsDatabase() {
  _removeQueueIdFromJobsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(queueId) {
    var _yield$getReadWriteJo3, _yield$getReadWriteJo4, store, promise, index, request;

    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return getReadWriteJobsObjectStoreAndTransactionPromise();

          case 2:
            _yield$getReadWriteJo3 = _context17.sent;
            _yield$getReadWriteJo4 = _slicedToArray(_yield$getReadWriteJo3, 2);
            store = _yield$getReadWriteJo4[0];
            promise = _yield$getReadWriteJo4[1];
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.getAllKeys(IDBKeyRange.only(queueId));

            request.onsuccess = function (event) {
              var _iterator2 = _createForOfIteratorHelper(event.target.result),
                  _step2;

              try {
                var _loop2 = function _loop2() {
                  var id = _step2.value;

                  _localJobEmitter.emit('jobDelete', id, queueId);

                  _jobEmitter.emit('jobDelete', id, queueId);

                  var deleteRequest = store.delete(id);

                  deleteRequest.onerror = function (deleteEvent) {
                    logger.error("Request error while removing job ".concat(id, " in queue ").concat(queueId, " from jobs database"));
                    logger.errorObject(deleteEvent);
                  };
                };

                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  _loop2();
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

            _context17.next = 12;
            return promise;

          case 12:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));
  return _removeQueueIdFromJobsDatabase.apply(this, arguments);
}

function removeQueueIdFromCleanupsDatabase(_x4) {
  return _removeQueueIdFromCleanupsDatabase.apply(this, arguments);
}

function _removeQueueIdFromCleanupsDatabase() {
  _removeQueueIdFromCleanupsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(queueId) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context18.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only(queueId));
            _context18.next = 7;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                  store.delete(cursor.primaryKey);
                  cursor.continue();
                } else {
                  resolve();
                }
              };

              request.onerror = function (event) {
                logger.error("Request error while removing queue ".concat(queueId, " from jobs database"));
                logger.errorObject(event);
                reject(new Error("Request error while removing queue ".concat(queueId, " from jobs database")));
              };
            });

          case 7:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18);
  }));
  return _removeQueueIdFromCleanupsDatabase.apply(this, arguments);
}

function _removeQueueIdFromDatabase2(_x5) {
  return _removeQueueIdFromDatabase.apply(this, arguments);
}

function _removeQueueIdFromDatabase() {
  _removeQueueIdFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(queueId) {
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            _context19.next = 2;
            return _removeQueueIdFromJobsDatabase2(queueId);

          case 2:
            _context19.next = 4;
            return removeQueueIdFromCleanupsDatabase(queueId);

          case 4:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19);
  }));
  return _removeQueueIdFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase2(_x6) {
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase() {
  _removeCompletedExpiredItemsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(maxAge) {
    var _yield$getReadWriteJo5, _yield$getReadWriteJo6, store, promise, index, request;

    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            _context20.next = 2;
            return getReadWriteJobsObjectStoreAndTransactionPromise();

          case 2:
            _yield$getReadWriteJo5 = _context20.sent;
            _yield$getReadWriteJo6 = _slicedToArray(_yield$getReadWriteJo5, 2);
            store = _yield$getReadWriteJo6[0];
            promise = _yield$getReadWriteJo6[1];
            index = store.index('createdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.bound(0, Date.now() - maxAge));

            request.onsuccess = function (event) {
              var _iterator3 = _createForOfIteratorHelper(event.target.result),
                  _step3;

              try {
                var _loop3 = function _loop3() {
                  var _step3$value = _step3.value,
                      id = _step3$value.id,
                      queueId = _step3$value.queueId,
                      status = _step3$value.status;

                  if (status !== _JOB_COMPLETE_STATUS) {
                    return "continue";
                  }

                  var deleteRequest = store.delete(id);

                  deleteRequest.onsuccess = function () {
                    _localJobEmitter.emit('jobDelete', id, queueId);

                    _jobEmitter.emit('jobDelete', id, queueId);
                  };

                  deleteRequest.onerror = function (deleteEvent) {
                    logger.error("Request error while removing job ".concat(id, " in queue ").concat(queueId, " from completed exired items from jobs database"));
                    logger.errorObject(deleteEvent);
                  };
                };

                for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                  var _ret = _loop3();

                  if (_ret === "continue") continue;
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }
            };

            request.onerror = function (event) {
              logger.error('Request error while removing completed exired items from jobs database');
              logger.errorObject(event);
            };

            _context20.next = 12;
            return promise;

          case 12:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20);
  }));
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _updateJobInDatabase2(_x7, _x8) {
  return _updateJobInDatabase.apply(this, arguments);
}

function _updateJobInDatabase() {
  _updateJobInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(id, transform) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context21.sent;
            request = store.get(id);
            _context21.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                var newValue = transform(request.result);

                if (typeof newValue === 'undefined') {
                  resolve();
                } else {
                  var putRequest = store.put(newValue);

                  putRequest.onsuccess = function () {
                    _localJobEmitter.emit('jobUpdate', newValue.id, newValue.queueId, newValue.type, newValue.status);

                    _jobEmitter.emit('jobUpdate', newValue.id, newValue.queueId, newValue.type, newValue.status);

                    resolve();
                  };

                  putRequest.onerror = function (event) {
                    logger.error("Put request error while updating ".concat(id));
                    logger.errorObject(event);
                    reject(new Error("Put request error while updating ".concat(id)));
                  };
                }
              };

              request.onerror = function (event) {
                logger.error("Get request error while updating ".concat(id));
                logger.errorObject(event);
                reject(new Error("Get request error while updating ".concat(id)));
              };
            });

          case 6:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21);
  }));
  return _updateJobInDatabase.apply(this, arguments);
}

function _getJobFromDatabase2(_x9) {
  return _getJobFromDatabase.apply(this, arguments);
}

function _getJobFromDatabase() {
  _getJobFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            _context22.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context22.sent;
            request = store.get(id);
            return _context22.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while getting ".concat(id)));
              };
            }));

          case 5:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22);
  }));
  return _getJobFromDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase2(_x10, _x11) {
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase() {
  _updateCleanupInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(id, transform) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            _context23.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context23.sent;
            request = store.get(id);
            _context23.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                var newValue = transform(request.result);

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
              };

              request.onerror = function (event) {
                logger.error("Get request error while updating ".concat(id, " cleanup"));
                logger.errorObject(event);
                reject(new Error("Get request error while updating ".concat(id, " cleanup")));
              };
            });

          case 6:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23);
  }));
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase2(_x12, _x13) {
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase() {
  _removePathFromCleanupDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(id, path) {
    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            _context24.next = 2;
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
            return _context24.stop();
        }
      }
    }, _callee24);
  }));
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _updateCleanupValuesInDatabase2(_x14, _x15, _x16) {
  return _updateCleanupValuesInDatabase.apply(this, arguments);
}

function _updateCleanupValuesInDatabase() {
  _updateCleanupValuesInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(id, queueId, data) {
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            if (!(typeof id !== 'number')) {
              _context25.next = 2;
              break;
            }

            throw new TypeError("Unable to update cleanup in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            if (!(typeof queueId !== 'string')) {
              _context25.next = 4;
              break;
            }

            throw new TypeError("Unable to update cleanup in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 4:
            if (!(_typeof(data) !== 'object')) {
              _context25.next = 6;
              break;
            }

            throw new TypeError("Unable to update cleanup in database, received invalid \"data\" argument type \"".concat(_typeof(data), "\""));

          case 6:
            _context25.next = 8;
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
            return _context25.stop();
        }
      }
    }, _callee25);
  }));
  return _updateCleanupValuesInDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase2(_x17) {
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase() {
  _removeCleanupFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            _context26.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context26.sent;
            request = store.delete(id);
            return _context26.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while removing cleanup data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Error while removing cleanup data for ".concat(id)));
              };
            }));

          case 5:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26);
  }));
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase2(_x18) {
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase() {
  _getCleanupFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            _context27.next = 2;
            return getReadOnlyCleanupsObjectStore();

          case 2:
            store = _context27.sent;
            request = store.get(id);
            return _context27.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while getting ".concat(id)));
              };
            }));

          case 5:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27);
  }));
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getQueueDataFromDatabase2(_x19) {
  return _getQueueDataFromDatabase.apply(this, arguments);
}

function _getQueueDataFromDatabase() {
  _getQueueDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(queueId) {
    var store, request, queueData;
    return regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            _context28.next = 2;
            return getReadOnlyQueueDataObjectStore();

          case 2:
            store = _context28.sent;
            request = store.get(queueId);
            _context28.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting queue ".concat(queueId, " data"));
                logger.errorObject(event);
                reject(new Error("Request error while getting queue ".concat(queueId, " data")));
              };
            });

          case 6:
            queueData = _context28.sent;
            return _context28.abrupt("return", typeof queueData !== 'undefined' ? queueData.data : undefined);

          case 8:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28);
  }));
  return _getQueueDataFromDatabase.apply(this, arguments);
}

function _updateQueueDataInDatabase2(_x20, _x21) {
  return _updateQueueDataInDatabase.apply(this, arguments);
}

function _updateQueueDataInDatabase() {
  _updateQueueDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(queueId, data) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            _context29.next = 2;
            return _getQueueDataFromDatabase2(queueId);

          case 2:
            value = _context29.sent;
            _context29.next = 5;
            return getReadWriteQueueDataObjectStore();

          case 5:
            store = _context29.sent;
            request = store.put({
              queueId: queueId,
              data: (0, _merge.default)({}, value, data)
            });
            return _context29.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while updating queue ".concat(queueId, " data"));
                logger.errorObject(event);
                reject(new Error("Error while updating queue ".concat(queueId, " data")));
              };
            }));

          case 8:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29);
  }));
  return _updateQueueDataInDatabase.apply(this, arguments);
}

function _markJobStatusInDatabase2(_x22, _x23) {
  return _markJobStatusInDatabase.apply(this, arguments);
}

function _markJobStatusInDatabase() {
  _markJobStatusInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(id, status) {
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            return _context30.abrupt("return", _updateJobInDatabase2(id, function (value) {
              if (typeof value === 'undefined') {
                throw new Error("Unable to mark job ".concat(id, " as status ").concat(status, " in database, job does not exist"));
              }

              value.status = status; // eslint-disable-line no-param-reassign

              // eslint-disable-line no-param-reassign
              return value;
            }));

          case 1:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30);
  }));
  return _markJobStatusInDatabase.apply(this, arguments);
}

function _markJobCompleteInDatabase(id) {
  return _markJobStatusInDatabase2(id, _JOB_COMPLETE_STATUS);
}

function _markJobPendingInDatabase(id) {
  return _markJobStatusInDatabase2(id, _JOB_PENDING_STATUS);
}

function _markJobErrorInDatabase(id) {
  return _markJobStatusInDatabase2(id, _JOB_ERROR_STATUS);
}

function _markJobCleanupInDatabase(id) {
  return _markJobStatusInDatabase2(id, _JOB_CLEANUP_STATUS);
}

function _markJobAbortedInDatabase(id) {
  return _markJobStatusInDatabase2(id, _JOB_ABORTED_STATUS);
}

function _markJobStartAfterInDatabase2(_x24, _x25) {
  return _markJobStartAfterInDatabase.apply(this, arguments);
}

function _markJobStartAfterInDatabase() {
  _markJobStartAfterInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(id, startAfter) {
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            return _context31.abrupt("return", _updateJobInDatabase2(id, function (value) {
              if (typeof value === 'undefined') {
                throw new Error("Unable to mark job ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, job does not exist"));
              }

              if (startAfter < value.startAfter) {
                return;
              }

              value.startAfter = startAfter; // eslint-disable-line no-param-reassign

              // eslint-disable-line no-param-reassign
              return value; // eslint-disable-line consistent-return
            }));

          case 1:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31);
  }));
  return _markJobStartAfterInDatabase.apply(this, arguments);
}

function _markCleanupStartAfterInDatabase2(_x26, _x27) {
  return _markCleanupStartAfterInDatabase.apply(this, arguments);
}

function _markCleanupStartAfterInDatabase() {
  _markCleanupStartAfterInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(id, startAfter) {
    return regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            _context32.next = 2;
            return _updateCleanupInDatabase2(id, function (value) {
              if (typeof value === 'undefined') {
                throw new Error("Unable to mark cleanup ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, cleanup does not exist"));
              }

              if (startAfter < value.startAfter) {
                return;
              }

              value.startAfter = startAfter; // eslint-disable-line  no-param-reassign

              // eslint-disable-line  no-param-reassign
              return value; // eslint-disable-line consistent-return
            });

          case 2:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32);
  }));
  return _markCleanupStartAfterInDatabase.apply(this, arguments);
}

function _markQueueForCleanupInDatabase2(_x28) {
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _markQueueForCleanupInDatabase() {
  _markQueueForCleanupInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            _context33.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context33.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only(queueId));
            jobs = [];
            _context33.next = 8;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                  var value = Object.assign({}, cursor.value);

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
                      cursor.continue();
                      return;

                    case _JOB_ABORTED_STATUS:
                      cursor.continue();
                      return;

                    default:
                      logger.warn("Unhandled job status ".concat(value.status));
                      cursor.continue();
                      return;
                  }

                  var updateRequest = cursor.update(value);

                  updateRequest.onsuccess = function () {
                    _localJobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);

                    _jobEmitter.emit('jobUpdate', value.id, value.queueId, value.type, value.status);

                    cursor.continue();
                  };

                  updateRequest.onerror = function (event2) {
                    logger.error("Update request error while marking queue ".concat(queueId, " error"));
                    logger.errorObject(event2);
                    cursor.continue();
                  };
                } else {
                  resolve();
                }
              };

              request.onerror = function (event) {
                logger.error("Request error while marking queue ".concat(queueId, " error"));
                logger.errorObject(event);
                reject(new Error("Request error while marking queue ".concat(queueId, " error")));
              };
            });

          case 8:
            return _context33.abrupt("return", jobs);

          case 9:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33);
  }));
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _incrementJobAttemptInDatabase2(_x29) {
  return _incrementJobAttemptInDatabase.apply(this, arguments);
}

function _incrementJobAttemptInDatabase() {
  _incrementJobAttemptInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(id) {
    return regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            _context34.next = 2;
            return _updateJobInDatabase2(id, function (value) {
              if (typeof value === 'undefined') {
                throw new Error("Unable to increment attempts for job ".concat(id, " in database, job does not exist"));
              }

              value.attempt += 1; // eslint-disable-line no-param-reassign

              // eslint-disable-line no-param-reassign
              return value;
            });

          case 2:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34);
  }));
  return _incrementJobAttemptInDatabase.apply(this, arguments);
}

function _incrementCleanupAttemptInDatabase2(_x30, _x31) {
  return _incrementCleanupAttemptInDatabase.apply(this, arguments);
}

function _incrementCleanupAttemptInDatabase() {
  _incrementCleanupAttemptInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(id, queueId) {
    var attempt;
    return regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            attempt = 1;
            _context35.next = 3;
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
            return _context35.abrupt("return", attempt);

          case 4:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35);
  }));
  return _incrementCleanupAttemptInDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase2(_x32, _x33, _x34) {
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase() {
  _bulkEnqueueToDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(queueId, items, delay) {
    var i, _items$i, type, args, ids, store;

    return regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context36.next = 2;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            if (Array.isArray(items)) {
              _context36.next = 4;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid \"items\" argument type \"".concat(_typeof(items), "\""));

          case 4:
            i = 0;

          case 5:
            if (!(i < items.length)) {
              _context36.next = 14;
              break;
            }

            _items$i = _slicedToArray(items[i], 2), type = _items$i[0], args = _items$i[1];

            if (!(typeof type !== 'string')) {
              _context36.next = 9;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid items[".concat(i, "] \"type\" argument type \"").concat(_typeof(type), "\""));

          case 9:
            if (Array.isArray(args)) {
              _context36.next = 11;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid items[".concat(i, "] \"args\" argument type \"").concat(_typeof(args), "\""));

          case 11:
            i += 1;
            _context36.next = 5;
            break;

          case 14:
            if (!(typeof delay !== 'number')) {
              _context36.next = 16;
              break;
            }

            throw new TypeError("Unable to bulk enqueue in database, received invalid \"delay\" argument type \"".concat(_typeof(delay), "\""));

          case 16:
            ids = [];
            _context36.next = 19;
            return getReadWriteJobsObjectStore();

          case 19:
            store = _context36.sent;
            _context36.next = 22;
            return new Promise(function (resolve, reject) {
              var _loop4 = function _loop4(_i2) {
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
                _loop4(_i2);
              }
            });

          case 22:
            return _context36.abrupt("return", ids);

          case 23:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36);
  }));
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase2(_x35, _x36, _x37, _x38) {
  return _enqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase() {
  _enqueueToDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(queueId, type, args, delay) {
    var value, store, request, id;
    return regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context37.next = 2;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            if (!(typeof type !== 'string')) {
              _context37.next = 4;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"type\" argument type \"".concat(_typeof(type), "\""));

          case 4:
            if (Array.isArray(args)) {
              _context37.next = 6;
              break;
            }

            throw new TypeError("Unable to enqueue in database, received invalid \"args\" argument type \"".concat(_typeof(args), "\""));

          case 6:
            if (!(typeof delay !== 'number')) {
              _context37.next = 8;
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
            _context37.next = 11;
            return getReadWriteJobsObjectStore();

          case 11:
            store = _context37.sent;
            request = store.put(value);
            _context37.next = 15;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while enqueueing ".concat(type, " job"));
                logger.errorObject(event);
                reject(new Error("Request error while enqueueing ".concat(type, " job")));
              };
            });

          case 15:
            id = _context37.sent;

            _localJobEmitter.emit('jobAdd', id, queueId, type);

            _jobEmitter.emit('jobAdd', id, queueId, type);

            return _context37.abrupt("return", id);

          case 19:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37);
  }));
  return _enqueueToDatabase.apply(this, arguments);
}

function _dequeueFromDatabase2() {
  return _dequeueFromDatabase.apply(this, arguments);
}

function _dequeueFromDatabase() {
  _dequeueFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            _context38.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context38.sent;
            index = store.index('statusIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.bound(_JOB_CLEANUP_STATUS, _JOB_PENDING_STATUS));
            _context38.next = 7;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                resolve(event.target.result);
              };

              request.onerror = function (event) {
                logger.error('Request error while dequeing');
                logger.errorObject(event);
                reject(new Error('Request error while dequeing'));
              };
            });

          case 7:
            jobs = _context38.sent;
            return _context38.abrupt("return", jobs);

          case 9:
          case "end":
            return _context38.stop();
        }
      }
    }, _callee38);
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

function _dequeueFromDatabaseNotIn2(_x39) {
  return _dequeueFromDatabaseNotIn.apply(this, arguments);
}

function _dequeueFromDatabaseNotIn() {
  _dequeueFromDatabaseNotIn = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(ids) {
    var _yield$getReadOnlyJob, _yield$getReadOnlyJob2, store, promise, index, jobs, request;

    return regeneratorRuntime.wrap(function _callee39$(_context39) {
      while (1) {
        switch (_context39.prev = _context39.next) {
          case 0:
            if (!(ids.length === 0)) {
              _context39.next = 2;
              break;
            }

            return _context39.abrupt("return", _dequeueFromDatabase2());

          case 2:
            _context39.next = 4;
            return getReadOnlyJobsObjectStoreAndTransactionPromise();

          case 4:
            _yield$getReadOnlyJob = _context39.sent;
            _yield$getReadOnlyJob2 = _slicedToArray(_yield$getReadOnlyJob, 2);
            store = _yield$getReadOnlyJob2[0];
            promise = _yield$getReadOnlyJob2[1];
            index = store.index('statusIndex');
            jobs = []; // $FlowFixMe

            request = index.getAllKeys(IDBKeyRange.bound(_JOB_CLEANUP_STATUS, _JOB_PENDING_STATUS));

            request.onsuccess = function (event) {
              var _iterator4 = _createForOfIteratorHelper(event.target.result),
                  _step4;

              try {
                var _loop5 = function _loop5() {
                  var id = _step4.value;

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

                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _ret2 = _loop5();

                  if (_ret2 === "continue") continue;
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            };

            request.onerror = function (event) {
              logger.error('Request error while dequeing');
              logger.errorObject(event);
            };

            _context39.next = 15;
            return promise;

          case 15:
            return _context39.abrupt("return", jobs);

          case 16:
          case "end":
            return _context39.stop();
        }
      }
    }, _callee39);
  }));
  return _dequeueFromDatabaseNotIn.apply(this, arguments);
}

function _getJobsFromDatabase2(_x40) {
  return _getJobsFromDatabase.apply(this, arguments);
}

function _getJobsFromDatabase() {
  _getJobsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee40$(_context40) {
      while (1) {
        switch (_context40.prev = _context40.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context40.next = 2;
              break;
            }

            throw new TypeError("Unable to get completed jobs database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            _context40.next = 4;
            return getReadOnlyJobsObjectStore();

          case 4:
            store = _context40.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.getAll(IDBKeyRange.only(queueId));
            _context40.next = 9;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                resolve(event.target.result);
              };

              request.onerror = function (event) {
                logger.error('Request error while dequeing');
                logger.errorObject(event);
                reject(new Error('Request error while dequeing'));
              };
            });

          case 9:
            jobs = _context40.sent;
            return _context40.abrupt("return", jobs);

          case 11:
          case "end":
            return _context40.stop();
        }
      }
    }, _callee40);
  }));
  return _getJobsFromDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase2(_x41) {
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase() {
  _getCompletedJobsCountFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(queueId) {
    var jobs;
    return regeneratorRuntime.wrap(function _callee41$(_context41) {
      while (1) {
        switch (_context41.prev = _context41.next) {
          case 0:
            _context41.next = 2;
            return _getCompletedJobsFromDatabase2(queueId);

          case 2:
            jobs = _context41.sent;
            return _context41.abrupt("return", jobs.length);

          case 4:
          case "end":
            return _context41.stop();
        }
      }
    }, _callee41);
  }));
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase2(_x42) {
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase() {
  _getCompletedJobsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee42$(_context42) {
      while (1) {
        switch (_context42.prev = _context42.next) {
          case 0:
            if (!(typeof queueId !== 'string')) {
              _context42.next = 2;
              break;
            }

            throw new TypeError("Unable to get completed jobs database, received invalid \"queueId\" argument type \"".concat(_typeof(queueId), "\""));

          case 2:
            _context42.next = 4;
            return getReadOnlyJobsObjectStore();

          case 4:
            store = _context42.sent;
            index = store.index('statusQueueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only([queueId, _JOB_COMPLETE_STATUS]));
            jobs = [];
            _context42.next = 10;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                  jobs.push(cursor.value);
                  cursor.continue();
                } else {
                  resolve();
                }
              };

              request.onerror = function (event) {
                logger.error("Request error while getting completed jobs for queue ".concat(queueId));
                logger.errorObject(event);
                reject(new Error("Request error while getting completed jobs for queue ".concat(queueId)));
              };
            });

          case 10:
            return _context42.abrupt("return", jobs);

          case 11:
          case "end":
            return _context42.stop();
        }
      }
    }, _callee42);
  }));
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase2(_x43, _x44) {
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase() {
  _storeAuthDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(id, data) {
    var store, request;
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
            if (!(_typeof(data) !== 'object')) {
              _context43.next = 4;
              break;
            }

            throw new TypeError("Unable to store auth data in database, received invalid \"data\" argument type \"".concat(_typeof(data), "\""));

          case 4:
            _context43.next = 6;
            return getReadWriteAuthObjectStore();

          case 6:
            store = _context43.sent;
            request = store.put({
              id: id,
              data: data
            });
            _context43.next = 10;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Request error while storing auth data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while storing auth data for ".concat(id)));
              };
            });

          case 10:
          case "end":
            return _context43.stop();
        }
      }
    }, _callee43);
  }));
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase2(_x45) {
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase() {
  _getAuthDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(id) {
    var store, request, authData;
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
            return getReadOnlyAuthObjectStore();

          case 4:
            store = _context44.sent;
            request = store.get(id);
            _context44.next = 8;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting auth data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while getting auth data for ".concat(id)));
              };
            });

          case 8:
            authData = _context44.sent;
            return _context44.abrupt("return", typeof authData !== 'undefined' ? authData.data : undefined);

          case 10:
          case "end":
            return _context44.stop();
        }
      }
    }, _callee44);
  }));
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase2(_x46) {
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase() {
  _removeAuthDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee45$(_context45) {
      while (1) {
        switch (_context45.prev = _context45.next) {
          case 0:
            if (!(typeof id !== 'string')) {
              _context45.next = 2;
              break;
            }

            throw new TypeError("Unable to store auth data in database, received invalid \"id\" argument type \"".concat(_typeof(id), "\""));

          case 2:
            _context45.next = 4;
            return getReadWriteAuthObjectStore();

          case 4:
            store = _context45.sent;
            request = store.delete(id);
            return _context45.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while removing auth data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Error while removing auth data for ".concat(id)));
              };
            }));

          case 7:
          case "end":
            return _context45.stop();
        }
      }
    }, _callee45);
  }));
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function _getQueueStatus2(_x47) {
  return _getQueueStatus.apply(this, arguments);
}

function _getQueueStatus() {
  _getQueueStatus = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46(queueId) {
    var store, index, abortedRequest, completeRequest, pendingRequest, errorRequest, cleanupRequest, abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise, _yield$Promise$all, _yield$Promise$all2, abortedCount, completeCount, pendingCount, errorCount, cleanupCount;

    return regeneratorRuntime.wrap(function _callee46$(_context46) {
      while (1) {
        switch (_context46.prev = _context46.next) {
          case 0:
            _context46.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context46.sent;
            index = store.index('statusQueueIdIndex'); // $FlowFixMe

            abortedRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_ABORTED_STATUS])); // $FlowFixMe

            completeRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_COMPLETE_STATUS])); // $FlowFixMe

            pendingRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_PENDING_STATUS])); // $FlowFixMe

            errorRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_ERROR_STATUS])); // $FlowFixMe

            cleanupRequest = index.getAllKeys(IDBKeyRange.only([queueId, _JOB_CLEANUP_STATUS]));
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
            _context46.next = 16;
            return Promise.all([abortedCountPromise, completeCountPromise, pendingCountPromise, errorCountPromise, cleanupCountPromise]);

          case 16:
            _yield$Promise$all = _context46.sent;
            _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 5);
            abortedCount = _yield$Promise$all2[0];
            completeCount = _yield$Promise$all2[1];
            pendingCount = _yield$Promise$all2[2];
            errorCount = _yield$Promise$all2[3];
            cleanupCount = _yield$Promise$all2[4];

            if (!(abortedCount > 0 || cleanupCount > 0)) {
              _context46.next = 25;
              break;
            }

            return _context46.abrupt("return", _QUEUE_ERROR_STATUS);

          case 25:
            if (!(errorCount > 0 || pendingCount > 0)) {
              _context46.next = 27;
              break;
            }

            return _context46.abrupt("return", _QUEUE_PENDING_STATUS);

          case 27:
            if (!(completeCount > 0)) {
              _context46.next = 29;
              break;
            }

            return _context46.abrupt("return", _QUEUE_COMPLETE_STATUS);

          case 29:
            return _context46.abrupt("return", _QUEUE_EMPTY_STATUS);

          case 30:
          case "end":
            return _context46.stop();
        }
      }
    }, _callee46);
  }));
  return _getQueueStatus.apply(this, arguments);
}

export var localJobEmitter = exports.localJobEmitter;
export var jobEmitter = exports.jobEmitter;
export var QUEUE_ERROR_STATUS = exports.QUEUE_ERROR_STATUS;
export var QUEUE_PENDING_STATUS = exports.QUEUE_PENDING_STATUS;
export var QUEUE_COMPLETE_STATUS = exports.QUEUE_COMPLETE_STATUS;
export var QUEUE_EMPTY_STATUS = exports.QUEUE_EMPTY_STATUS;
export var JOB_ABORTED_STATUS = exports.JOB_ABORTED_STATUS;
export var JOB_COMPLETE_STATUS = exports.JOB_COMPLETE_STATUS;
export var JOB_PENDING_STATUS = exports.JOB_PENDING_STATUS;
export var JOB_ERROR_STATUS = exports.JOB_ERROR_STATUS;
export var JOB_CLEANUP_STATUS = exports.JOB_CLEANUP_STATUS;
export var databasePromise = exports.databasePromise;
export var clearDatabase = exports.clearDatabase;
export var removeJobsWithQueueIdAndTypeFromDatabase = exports.removeJobsWithQueueIdAndTypeFromDatabase;
export var removeQueueIdFromJobsDatabase = exports.removeQueueIdFromJobsDatabase;
export var removeQueueIdFromDatabase = exports.removeQueueIdFromDatabase;
export var removeCompletedExpiredItemsFromDatabase = exports.removeCompletedExpiredItemsFromDatabase;
export var updateJobInDatabase = exports.updateJobInDatabase;
export var getJobFromDatabase = exports.getJobFromDatabase;
export var updateCleanupInDatabase = exports.updateCleanupInDatabase;
export var removePathFromCleanupDataInDatabase = exports.removePathFromCleanupDataInDatabase;
export var updateCleanupValuesInDatabase = exports.updateCleanupValuesInDatabase;
export var removeCleanupFromDatabase = exports.removeCleanupFromDatabase;
export var getCleanupFromDatabase = exports.getCleanupFromDatabase;
export var getQueueDataFromDatabase = exports.getQueueDataFromDatabase;
export var updateQueueDataInDatabase = exports.updateQueueDataInDatabase;
export var markJobStatusInDatabase = exports.markJobStatusInDatabase;
export var markJobCompleteInDatabase = exports.markJobCompleteInDatabase;
export var markJobPendingInDatabase = exports.markJobPendingInDatabase;
export var markJobErrorInDatabase = exports.markJobErrorInDatabase;
export var markJobCleanupInDatabase = exports.markJobCleanupInDatabase;
export var markJobAbortedInDatabase = exports.markJobAbortedInDatabase;
export var markJobStartAfterInDatabase = exports.markJobStartAfterInDatabase;
export var markCleanupStartAfterInDatabase = exports.markCleanupStartAfterInDatabase;
export var markQueueForCleanupInDatabase = exports.markQueueForCleanupInDatabase;
export var incrementJobAttemptInDatabase = exports.incrementJobAttemptInDatabase;
export var incrementCleanupAttemptInDatabase = exports.incrementCleanupAttemptInDatabase;
export var bulkEnqueueToDatabase = exports.bulkEnqueueToDatabase;
export var enqueueToDatabase = exports.enqueueToDatabase;
export var dequeueFromDatabase = exports.dequeueFromDatabase;
export var getContiguousIds = exports.getContiguousIds;
export var dequeueFromDatabaseNotIn = exports.dequeueFromDatabaseNotIn;
export var getJobsFromDatabase = exports.getJobsFromDatabase;
export var getCompletedJobsCountFromDatabase = exports.getCompletedJobsCountFromDatabase;
export var getCompletedJobsFromDatabase = exports.getCompletedJobsFromDatabase;
export var storeAuthDataInDatabase = exports.storeAuthDataInDatabase;
export var getAuthDataFromDatabase = exports.getAuthDataFromDatabase;
export var removeAuthDataFromDatabase = exports.removeAuthDataFromDatabase;
export var getQueueStatus = exports.getQueueStatus;
//# sourceMappingURL=database.js.map