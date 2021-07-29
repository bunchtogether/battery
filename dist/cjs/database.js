"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearDatabase = _clearDatabase2;
exports.removeJobsWithQueueIdAndTypeFromDatabase = _removeJobsWithQueueIdAndTypeFromDatabase2;
exports.removeQueueIdFromDatabase = _removeQueueIdFromDatabase2;
exports.removeCompletedExpiredItemsFromDatabase = _removeCompletedExpiredItemsFromDatabase2;
exports.getJobFromDatabase = _getJobFromDatabase2;
exports.removePathFromCleanupDataInDatabase = _removePathFromCleanupDataInDatabase2;
exports.updateCleanupInDatabase = _updateCleanupInDatabase2;
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
exports.markQueueForCleanupInDatabase = _markQueueForCleanupInDatabase2;
exports.incrementAttemptInDatabase = _incrementAttemptInDatabase2;
exports.bulkEnqueueToDatabase = _bulkEnqueueToDatabase2;
exports.enqueueToDatabase = _enqueueToDatabase2;
exports.dequeueFromDatabase = _dequeueFromDatabase2;
exports.getCompletedJobsCountFromDatabase = _getCompletedJobsCountFromDatabase2;
exports.getCompletedJobsFromDatabase = _getCompletedJobsFromDatabase2;
exports.storeAuthDataInDatabase = _storeAuthDataInDatabase2;
exports.getAuthDataFromDatabase = _getAuthDataFromDatabase2;
exports.removeAuthDataFromDatabase = _removeAuthDataFromDatabase2;
exports.databasePromise = exports.JOB_CLEANUP_STATUS = exports.JOB_ERROR_STATUS = exports.JOB_PENDING_STATUS = exports.JOB_COMPLETE_STATUS = exports.JOB_ABORTED_STATUS = void 0;

var _merge = _interopRequireDefault(require("lodash/merge"));

var _unset = _interopRequireDefault(require("lodash/unset"));

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var logger = (0, _logger.default)('Jobs Database');
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
          request = self.indexedDB.open('battery-queue', 1);

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
              store.createIndex('statusCreatedIndex', ['status', 'created'], {
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
              e.target.result.createObjectStore('auth', {
                keyPath: 'teamId'
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
            transaction = database.transaction(['auth'], 'readwrite');
            objectStore = transaction.objectStore('auth');

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
            transaction = database.transaction(['auth'], 'readonly');
            objectStore = transaction.objectStore('auth');

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

function getReadWriteJobsObjectStore() {
  return _getReadWriteJobsObjectStore.apply(this, arguments);
}

function _getReadWriteJobsObjectStore() {
  _getReadWriteJobsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var database, transaction, objectStore;
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

            transaction.onabort = function (event) {
              logger.error('Read-write jobs transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-write jobs transaction');
              logger.errorObject(event);
            };

            return _context6.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _getReadWriteJobsObjectStore.apply(this, arguments);
}

function getReadOnlyJobsObjectStore() {
  return _getReadOnlyJobsObjectStore.apply(this, arguments);
}

function _getReadOnlyJobsObjectStore() {
  _getReadOnlyJobsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    var database, transaction, objectStore;
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

            transaction.onabort = function (event) {
              logger.error('Read-only jobs transaction was aborted');
              logger.errorObject(event);
            };

            transaction.onerror = function (event) {
              logger.error('Error in read-only jobs transaction');
              logger.errorObject(event);
            };

            return _context7.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _getReadOnlyJobsObjectStore.apply(this, arguments);
}

function getReadWriteCleanupsObjectStore() {
  return _getReadWriteCleanupsObjectStore.apply(this, arguments);
}

function _getReadWriteCleanupsObjectStore() {
  _getReadWriteCleanupsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _databasePromise;

          case 2:
            database = _context8.sent;
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

            return _context8.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _getReadWriteCleanupsObjectStore.apply(this, arguments);
}

function getReadOnlyCleanupsObjectStore() {
  return _getReadOnlyCleanupsObjectStore.apply(this, arguments);
}

function _getReadOnlyCleanupsObjectStore() {
  _getReadOnlyCleanupsObjectStore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var database, transaction, objectStore;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return _databasePromise;

          case 2:
            database = _context9.sent;
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

            return _context9.abrupt("return", objectStore);

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _getReadOnlyCleanupsObjectStore.apply(this, arguments);
}

function clearQueueDataDatabase() {
  return _clearQueueDataDatabase.apply(this, arguments);
}

function _clearQueueDataDatabase() {
  _clearQueueDataDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return getReadWriteQueueDataObjectStore();

          case 2:
            store = _context10.sent;
            request = store.clear();
            _context10.next = 6;
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
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _clearQueueDataDatabase.apply(this, arguments);
}

function clearJobsDatabase() {
  return _clearJobsDatabase.apply(this, arguments);
}

function _clearJobsDatabase() {
  _clearJobsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context11.sent;
            request = store.clear();
            _context11.next = 6;
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
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _clearJobsDatabase.apply(this, arguments);
}

function clearCleanupsDatabase() {
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearCleanupsDatabase() {
  _clearCleanupsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
    var store, request;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context12.sent;
            request = store.clear();
            _context12.next = 6;
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
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _clearCleanupsDatabase.apply(this, arguments);
}

function _clearDatabase2() {
  return _clearDatabase.apply(this, arguments);
}

function _clearDatabase() {
  _clearDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return clearJobsDatabase();

          case 2:
            _context13.next = 4;
            return clearCleanupsDatabase();

          case 4:
            _context13.next = 6;
            return clearQueueDataDatabase();

          case 6:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _clearDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase2(_x, _x2) {
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function _removeJobsWithQueueIdAndTypeFromDatabase() {
  _removeJobsWithQueueIdAndTypeFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(queueId, type) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context14.sent;
            index = store.index('queueIdTypeIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only([queueId, type]));
            _context14.next = 7;
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
                logger.error("Request error while removing jobs with queue ".concat(queueId, " and type ").concat(type, " from jobs database"));
                logger.errorObject(event);
                reject(new Error("Request error while removing jobs with queue ".concat(queueId, " and type ").concat(type, " from jobs database")));
              };
            });

          case 7:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _removeJobsWithQueueIdAndTypeFromDatabase.apply(this, arguments);
}

function removeQueueIdFromJobsDatabase(_x3) {
  return _removeQueueIdFromJobsDatabase.apply(this, arguments);
}

function _removeQueueIdFromJobsDatabase() {
  _removeQueueIdFromJobsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(queueId) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context15.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only(queueId));
            _context15.next = 7;
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
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _removeQueueIdFromJobsDatabase.apply(this, arguments);
}

function removeQueueIdFromCleanupsDatabase(_x4) {
  return _removeQueueIdFromCleanupsDatabase.apply(this, arguments);
}

function _removeQueueIdFromCleanupsDatabase() {
  _removeQueueIdFromCleanupsDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(queueId) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context16.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only(queueId));
            _context16.next = 7;
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
            return _context16.stop();
        }
      }
    }, _callee16);
  }));
  return _removeQueueIdFromCleanupsDatabase.apply(this, arguments);
}

function _removeQueueIdFromDatabase2(_x5) {
  return _removeQueueIdFromDatabase.apply(this, arguments);
}

function _removeQueueIdFromDatabase() {
  _removeQueueIdFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(queueId) {
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return removeQueueIdFromJobsDatabase(queueId);

          case 2:
            _context17.next = 4;
            return removeQueueIdFromCleanupsDatabase(queueId);

          case 4:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));
  return _removeQueueIdFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase2(_x6) {
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _removeCompletedExpiredItemsFromDatabase() {
  _removeCompletedExpiredItemsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(maxAge) {
    var store, index, request, queueIds, _iterator, _step, queueId;

    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context18.sent;
            index = store.index('statusCreatedIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.bound([_JOB_COMPLETE_STATUS, 0], [_JOB_COMPLETE_STATUS, Date.now() - maxAge]));
            queueIds = new Set();
            _context18.next = 8;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                  queueIds.add(cursor.value.queueId);
                  store.delete(cursor.primaryKey);
                  cursor.continue();
                } else {
                  resolve();
                }
              };

              request.onerror = function (event) {
                logger.error('Request error while removing completed exired items from jobs database');
                logger.errorObject(event);
                reject(new Error('Request error while removing completed exired items from jobs database'));
              };
            });

          case 8:
            _iterator = _createForOfIteratorHelper(queueIds);
            _context18.prev = 9;

            _iterator.s();

          case 11:
            if ((_step = _iterator.n()).done) {
              _context18.next = 17;
              break;
            }

            queueId = _step.value;
            _context18.next = 15;
            return _removeQueueIdFromDatabase2(queueId);

          case 15:
            _context18.next = 11;
            break;

          case 17:
            _context18.next = 22;
            break;

          case 19:
            _context18.prev = 19;
            _context18.t0 = _context18["catch"](9);

            _iterator.e(_context18.t0);

          case 22:
            _context18.prev = 22;

            _iterator.f();

            return _context18.finish(22);

          case 25:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[9, 19, 22, 25]]);
  }));
  return _removeCompletedExpiredItemsFromDatabase.apply(this, arguments);
}

function _getJobFromDatabase2(_x7) {
  return _getJobFromDatabase.apply(this, arguments);
}

function _getJobFromDatabase() {
  _getJobFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            _context19.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context19.sent;
            request = store.get(id);
            return _context19.abrupt("return", new Promise(function (resolve, reject) {
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
            return _context19.stop();
        }
      }
    }, _callee19);
  }));
  return _getJobFromDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase2(_x8, _x9, _x10) {
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _removePathFromCleanupDataInDatabase() {
  _removePathFromCleanupDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(id, queueId, path) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            _context20.next = 2;
            return _getCleanupFromDatabase2(id);

          case 2:
            value = _context20.sent;
            _context20.next = 5;
            return getReadWriteCleanupsObjectStore();

          case 5:
            store = _context20.sent;
            request = store.put({
              id: id,
              queueId: queueId,
              data: (0, _unset.default)(value || {}, path)
            });
            return _context20.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while removing path ".concat(Array.isArray(path) ? path.join('.') : path, " from cleanup data for ").concat(id, " in queue ").concat(queueId));
                logger.errorObject(event);
                reject(new Error("Error while removing path ".concat(Array.isArray(path) ? path.join('.') : path, " from cleanup data for ").concat(id, " in queue ").concat(queueId)));
              };
            }));

          case 8:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20);
  }));
  return _removePathFromCleanupDataInDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase2(_x11, _x12, _x13) {
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _updateCleanupInDatabase() {
  _updateCleanupInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(id, queueId, data) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.next = 2;
            return _getCleanupFromDatabase2(id);

          case 2:
            value = _context21.sent;
            _context21.next = 5;
            return getReadWriteCleanupsObjectStore();

          case 5:
            store = _context21.sent;
            request = store.put({
              id: id,
              queueId: queueId,
              data: (0, _merge.default)({}, value, data)
            });
            return _context21.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while updating cleanup data for ".concat(id));
                logger.errorObject(event);
                reject(new Error("Error while updating cleanup data for ".concat(id)));
              };
            }));

          case 8:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21);
  }));
  return _updateCleanupInDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase2(_x14) {
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _removeCleanupFromDatabase() {
  _removeCleanupFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(id) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            _context22.next = 2;
            return getReadWriteCleanupsObjectStore();

          case 2:
            store = _context22.sent;
            request = store.delete(id);
            return _context22.abrupt("return", new Promise(function (resolve, reject) {
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
            return _context22.stop();
        }
      }
    }, _callee22);
  }));
  return _removeCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase2(_x15) {
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getCleanupFromDatabase() {
  _getCleanupFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(id) {
    var store, request, cleanupData;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            _context23.next = 2;
            return getReadOnlyCleanupsObjectStore();

          case 2:
            store = _context23.sent;
            request = store.get(id);
            _context23.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting ".concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while getting ".concat(id)));
              };
            });

          case 6:
            cleanupData = _context23.sent;
            return _context23.abrupt("return", typeof cleanupData !== 'undefined' ? cleanupData.data : undefined);

          case 8:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23);
  }));
  return _getCleanupFromDatabase.apply(this, arguments);
}

function _getQueueDataFromDatabase2(_x16) {
  return _getQueueDataFromDatabase.apply(this, arguments);
}

function _getQueueDataFromDatabase() {
  _getQueueDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(queueId) {
    var store, request, queueData;
    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            _context24.next = 2;
            return getReadOnlyQueueDataObjectStore();

          case 2:
            store = _context24.sent;
            request = store.get(queueId);
            _context24.next = 6;
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
            queueData = _context24.sent;
            return _context24.abrupt("return", typeof queueData !== 'undefined' ? queueData.data : undefined);

          case 8:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24);
  }));
  return _getQueueDataFromDatabase.apply(this, arguments);
}

function _updateQueueDataInDatabase2(_x17, _x18) {
  return _updateQueueDataInDatabase.apply(this, arguments);
}

function _updateQueueDataInDatabase() {
  _updateQueueDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(queueId, data) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            _context25.next = 2;
            return _getQueueDataFromDatabase2(queueId);

          case 2:
            value = _context25.sent;
            _context25.next = 5;
            return getReadWriteQueueDataObjectStore();

          case 5:
            store = _context25.sent;
            request = store.put({
              queueId: queueId,
              data: (0, _merge.default)({}, value, data)
            });
            return _context25.abrupt("return", new Promise(function (resolve, reject) {
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
            return _context25.stop();
        }
      }
    }, _callee25);
  }));
  return _updateQueueDataInDatabase.apply(this, arguments);
}

function _markJobStatusInDatabase2(_x19, _x20) {
  return _markJobStatusInDatabase.apply(this, arguments);
}

function _markJobStatusInDatabase() {
  _markJobStatusInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(id, status) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            _context26.next = 2;
            return _getJobFromDatabase2(id);

          case 2:
            value = _context26.sent;

            if (!(typeof value === 'undefined')) {
              _context26.next = 5;
              break;
            }

            throw new Error("Unable to mark job ".concat(id, " as status ").concat(status, " in database, job does not exist"));

          case 5:
            value.status = status;
            _context26.next = 8;
            return getReadWriteJobsObjectStore();

          case 8:
            store = _context26.sent;
            request = store.put(value);
            return _context26.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Request error while marking job ".concat(id, " as status ").concat(status));
                logger.errorObject(event);
                reject(new Error("Request error while marking job ".concat(id, " as status ").concat(status)));
              };
            }));

          case 11:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26);
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

function _markJobStartAfterInDatabase2(_x21, _x22) {
  return _markJobStartAfterInDatabase.apply(this, arguments);
}

function _markJobStartAfterInDatabase() {
  _markJobStartAfterInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(id, startAfter) {
    var value, store, request;
    return regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            _context27.next = 2;
            return _getJobFromDatabase2(id);

          case 2:
            value = _context27.sent;

            if (!(typeof value === 'undefined')) {
              _context27.next = 5;
              break;
            }

            throw new Error("Unable to mark job ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString(), " in database, job does not exist"));

          case 5:
            value.startAfter = startAfter;
            _context27.next = 8;
            return getReadWriteJobsObjectStore();

          case 8:
            store = _context27.sent;
            request = store.put(value);
            return _context27.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Request error while marking job ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString()));
                logger.errorObject(event);
                reject(new Error("Request error while marking job ".concat(id, " start-after time to ").concat(new Date(startAfter).toLocaleString())));
              };
            }));

          case 11:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27);
  }));
  return _markJobStartAfterInDatabase.apply(this, arguments);
}

function _markQueueForCleanupInDatabase2(_x23) {
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _markQueueForCleanupInDatabase() {
  _markQueueForCleanupInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(queueId) {
    var store, index, request;
    return regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            _context28.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context28.sent;
            index = store.index('queueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only(queueId));
            _context28.next = 7;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                  var value = Object.assign({}, cursor.value);

                  switch (value.status) {
                    case _JOB_ERROR_STATUS:
                      value.status = _JOB_CLEANUP_STATUS;
                      break;

                    case _JOB_COMPLETE_STATUS:
                      value.status = _JOB_CLEANUP_STATUS;
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

          case 7:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28);
  }));
  return _markQueueForCleanupInDatabase.apply(this, arguments);
}

function _incrementAttemptInDatabase2(_x24) {
  return _incrementAttemptInDatabase.apply(this, arguments);
}

function _incrementAttemptInDatabase() {
  _incrementAttemptInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(id) {
    var value, attempt, store, request;
    return regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            _context29.next = 2;
            return _getJobFromDatabase2(id);

          case 2:
            value = _context29.sent;

            if (!(typeof value === 'undefined')) {
              _context29.next = 5;
              break;
            }

            throw new Error("Unable to decrement attempts remaining for job ".concat(id, " in database, job does not exist"));

          case 5:
            attempt = value.attempt + 1;
            value.attempt = attempt;
            _context29.next = 9;
            return getReadWriteJobsObjectStore();

          case 9:
            store = _context29.sent;
            request = store.put(value);
            _context29.next = 13;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Request error while incrementing attempt to ".concat(attempt, " for ").concat(id));
                logger.errorObject(event);
                reject(new Error("Request error while incrementing attempt to ".concat(attempt, " for ").concat(id)));
              };
            });

          case 13:
            return _context29.abrupt("return", [attempt, value.maxAttempts]);

          case 14:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29);
  }));
  return _incrementAttemptInDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase2(_x25, _x26, _x27) {
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _bulkEnqueueToDatabase() {
  _bulkEnqueueToDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(queueId, items, delay) {
    var store;
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            _context30.next = 2;
            return getReadWriteJobsObjectStore();

          case 2:
            store = _context30.sent;
            _context30.next = 5;
            return new Promise(function (resolve, reject) {
              var _loop = function _loop(i) {
                var _items$i = _slicedToArray(items[i], 3),
                    type = _items$i[0],
                    args = _items$i[1],
                    maxAttempts = _items$i[2];

                var value = {
                  queueId: queueId,
                  type: type,
                  args: args,
                  attempt: 0,
                  maxAttempts: maxAttempts,
                  created: Date.now(),
                  status: _JOB_PENDING_STATUS,
                  startAfter: Date.now() + delay
                };
                var request = store.put(value);

                if (i === items.length - 1) {
                  request.onsuccess = function () {
                    resolve(request.result);
                  };

                  request.onerror = function (event) {
                    logger.error("Request error while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId));
                    logger.errorObject(event);
                    reject(new Error("Request error while bulk enqueueing ".concat(items.length, " ").concat(items.length === 1 ? 'job' : 'jobs', " in queue ").concat(queueId)));
                  };
                }
              };

              for (var i = 0; i < items.length; i += 1) {
                _loop(i);
              }
            });

          case 5:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30);
  }));
  return _bulkEnqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase2(_x28, _x29, _x30, _x31, _x32) {
  return _enqueueToDatabase.apply(this, arguments);
}

function _enqueueToDatabase() {
  _enqueueToDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(queueId, type, args, maxAttempts, delay) {
    var value, store, request, id;
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            // eslint-disable-line no-underscore-dangle
            value = {
              queueId: queueId,
              type: type,
              args: args,
              attempt: 0,
              maxAttempts: maxAttempts,
              created: Date.now(),
              status: _JOB_PENDING_STATUS,
              startAfter: Date.now() + delay
            };
            _context31.next = 3;
            return getReadWriteJobsObjectStore();

          case 3:
            store = _context31.sent;
            request = store.put(value);
            _context31.next = 7;
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

          case 7:
            id = _context31.sent;
            return _context31.abrupt("return", id);

          case 9:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31);
  }));
  return _enqueueToDatabase.apply(this, arguments);
}

function _dequeueFromDatabase2() {
  return _dequeueFromDatabase.apply(this, arguments);
}

function _dequeueFromDatabase() {
  _dequeueFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32() {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            _context32.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context32.sent;
            index = store.index('statusIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.bound(_JOB_CLEANUP_STATUS, _JOB_PENDING_STATUS));
            jobs = [];
            _context32.next = 8;
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
                logger.error('Request error while dequeing');
                logger.errorObject(event);
                reject(new Error('Request error while dequeing'));
              };
            });

          case 8:
            return _context32.abrupt("return", jobs);

          case 9:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32);
  }));
  return _dequeueFromDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase2(_x33) {
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsCountFromDatabase() {
  _getCompletedJobsCountFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(queueId) {
    var jobs;
    return regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            _context33.next = 2;
            return _getCompletedJobsFromDatabase2(queueId);

          case 2:
            jobs = _context33.sent;
            return _context33.abrupt("return", jobs.length);

          case 4:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33);
  }));
  return _getCompletedJobsCountFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase2(_x34) {
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _getCompletedJobsFromDatabase() {
  _getCompletedJobsFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(queueId) {
    var store, index, request, jobs;
    return regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            _context34.next = 2;
            return getReadOnlyJobsObjectStore();

          case 2:
            store = _context34.sent;
            index = store.index('statusQueueIdIndex'); // $FlowFixMe

            request = index.openCursor(IDBKeyRange.only([queueId, _JOB_COMPLETE_STATUS]));
            jobs = [];
            _context34.next = 8;
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

          case 8:
            return _context34.abrupt("return", jobs);

          case 9:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34);
  }));
  return _getCompletedJobsFromDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase2(_x35) {
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _storeAuthDataInDatabase() {
  _storeAuthDataInDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(value) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            _context35.next = 2;
            return getReadWriteAuthObjectStore();

          case 2:
            store = _context35.sent;
            request = store.put(value);
            _context35.next = 6;
            return new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error('Request error while storing auth data');
                logger.errorObject(event);
                reject(new Error('Request error while storing auth data'));
              };
            });

          case 6:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35);
  }));
  return _storeAuthDataInDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase2(_x36) {
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _getAuthDataFromDatabase() {
  _getAuthDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(teamId) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            _context36.next = 2;
            return getReadOnlyAuthObjectStore();

          case 2:
            store = _context36.sent;
            request = store.get(teamId);
            return _context36.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve(request.result);
              };

              request.onerror = function (event) {
                logger.error("Request error while getting auth data for team ".concat(teamId));
                logger.errorObject(event);
                reject(new Error("Request error while getting auth data for team ".concat(teamId)));
              };
            }));

          case 5:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36);
  }));
  return _getAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase2(_x37) {
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

function _removeAuthDataFromDatabase() {
  _removeAuthDataFromDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(teamId) {
    var store, request;
    return regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            _context37.next = 2;
            return getReadWriteAuthObjectStore();

          case 2:
            store = _context37.sent;
            request = store.delete(teamId);
            return _context37.abrupt("return", new Promise(function (resolve, reject) {
              request.onsuccess = function () {
                resolve();
              };

              request.onerror = function (event) {
                logger.error("Error while removing auth data for ".concat(teamId));
                logger.errorObject(event);
                reject(new Error("Error while removing auth data for ".concat(teamId)));
              };
            }));

          case 5:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37);
  }));
  return _removeAuthDataFromDatabase.apply(this, arguments);
}

export var JOB_ABORTED_STATUS = exports.JOB_ABORTED_STATUS;
export var JOB_COMPLETE_STATUS = exports.JOB_COMPLETE_STATUS;
export var JOB_PENDING_STATUS = exports.JOB_PENDING_STATUS;
export var JOB_ERROR_STATUS = exports.JOB_ERROR_STATUS;
export var JOB_CLEANUP_STATUS = exports.JOB_CLEANUP_STATUS;
export var databasePromise = exports.databasePromise;
export var clearDatabase = exports.clearDatabase;
export var removeJobsWithQueueIdAndTypeFromDatabase = exports.removeJobsWithQueueIdAndTypeFromDatabase;
export var removeQueueIdFromDatabase = exports.removeQueueIdFromDatabase;
export var removeCompletedExpiredItemsFromDatabase = exports.removeCompletedExpiredItemsFromDatabase;
export var getJobFromDatabase = exports.getJobFromDatabase;
export var removePathFromCleanupDataInDatabase = exports.removePathFromCleanupDataInDatabase;
export var updateCleanupInDatabase = exports.updateCleanupInDatabase;
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
export var markQueueForCleanupInDatabase = exports.markQueueForCleanupInDatabase;
export var incrementAttemptInDatabase = exports.incrementAttemptInDatabase;
export var bulkEnqueueToDatabase = exports.bulkEnqueueToDatabase;
export var enqueueToDatabase = exports.enqueueToDatabase;
export var dequeueFromDatabase = exports.dequeueFromDatabase;
export var getCompletedJobsCountFromDatabase = exports.getCompletedJobsCountFromDatabase;
export var getCompletedJobsFromDatabase = exports.getCompletedJobsFromDatabase;
export var storeAuthDataInDatabase = exports.storeAuthDataInDatabase;
export var getAuthDataFromDatabase = exports.getAuthDataFromDatabase;
export var removeAuthDataFromDatabase = exports.removeAuthDataFromDatabase;
//# sourceMappingURL=database.js.map