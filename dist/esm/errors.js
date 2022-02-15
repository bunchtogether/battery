// $FlowFixMe
export class AbortError extends DOMException {
  constructor(message) {
    super(message, 'AbortError');
  }

} // $FlowFixMe

export class TimeoutError extends DOMException {
  constructor(message) {
    super(message, 'TimeoutError');
  }

}
export class FatalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FatalError';
  }

}
export class ControllerNotAvailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ControllerNotAvailableError';
  }

}
//# sourceMappingURL=errors.js.map