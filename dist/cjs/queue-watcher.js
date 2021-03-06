"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _database = require("./database");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var BatteryQueueWatcher = /*#__PURE__*/function (_EventEmitter) {
  _inherits(BatteryQueueWatcher, _EventEmitter);

  var _super = _createSuper(BatteryQueueWatcher);

  function BatteryQueueWatcher(queueId) {
    var _this;

    _classCallCheck(this, BatteryQueueWatcher);

    _this = _super.call(this);
    _this.queueId = queueId;
    _this.statusRequested = false;

    var handleJobAdd = function handleJobAdd(id, qId) {
      if (queueId !== qId) {
        return;
      }

      _this.emit('status', _database.QUEUE_PENDING_STATUS);
    };

    _this.handleJobAdd = handleJobAdd;

    _database.jobEmitter.addListener('jobAdd', handleJobAdd);

    var handleJobDelete = function handleJobDelete(id, qId) {
      if (queueId !== qId) {
        return;
      }

      _this.emitStatus();
    };

    _this.handleJobDelete = handleJobDelete;

    _database.jobEmitter.addListener('jobDelete', handleJobDelete);

    var handleJobUpdate = function handleJobUpdate(id, qId, type, status) {
      if (queueId !== qId) {
        return;
      }

      if (status === _database.JOB_ABORTED_STATUS || status === _database.JOB_CLEANUP_STATUS) {
        _this.emit('status', _database.QUEUE_ERROR_STATUS);
      } else if (status === _database.JOB_ERROR_STATUS || status === _database.JOB_PENDING_STATUS || status === _database.JOB_CLEANUP_AND_REMOVE_STATUS) {
        _this.emit('status', _database.QUEUE_PENDING_STATUS);
      } else if (status === _database.JOB_COMPLETE_STATUS || status === _database.JOB_PENDING_STATUS) {
        _this.emitStatus();
      }
    };

    _this.handleJobUpdate = handleJobUpdate;

    _database.jobEmitter.addListener('jobUpdate', handleJobUpdate);

    var handleJobsClear = function handleJobsClear() {
      _this.emit('status', _database.QUEUE_EMPTY_STATUS);
    };

    _this.handleJobsClear = handleJobsClear;

    _database.jobEmitter.addListener('jobsClear', handleJobsClear);

    _this.on('status', function (status) {
      _this.status = status;
    });

    return _this;
  }

  _createClass(BatteryQueueWatcher, [{
    key: "getStatus",
    value: function () {
      var _getStatus = _asyncToGenerator(function* () {
        var status = this.status;

        if (typeof status === 'number') {
          return status;
        }

        var newStatus = yield (0, _database.getQueueStatus)(this.queueId);
        this.status = newStatus;
        return newStatus;
      });

      function getStatus() {
        return _getStatus.apply(this, arguments);
      }

      return getStatus;
    }()
  }, {
    key: "emitStatus",
    value: function emitStatus() {
      var _this2 = this;

      if (this.statusRequested) {
        return;
      }

      delete this.status;
      this.statusRequested = true;
      var didEmitNewStatus = false;

      var handleStatus = function handleStatus() {
        didEmitNewStatus = true;
      };

      this.addListener('status', handleStatus);
      self.queueMicrotask( /*#__PURE__*/_asyncToGenerator(function* () {
        _this2.statusRequested = false;

        _this2.removeListener('status', handleStatus);

        if (didEmitNewStatus) {
          return;
        }

        var status = yield (0, _database.getQueueStatus)(_this2.queueId);

        _this2.emit('status', status);
      }));
    }
  }, {
    key: "close",
    value: function close() {
      _database.jobEmitter.removeListener('jobAdd', this.handleJobAdd);

      _database.jobEmitter.removeListener('jobDelete', this.handleJobDelete);

      _database.jobEmitter.removeListener('jobUpdate', this.handleJobUpdate);

      _database.jobEmitter.removeListener('jobsClear', this.handleJobsClear);
    }
  }]);

  return BatteryQueueWatcher;
}(_events.default);

exports.default = BatteryQueueWatcher;
//# sourceMappingURL=queue-watcher.js.map