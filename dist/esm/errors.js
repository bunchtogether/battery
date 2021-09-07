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
//# sourceMappingURL=errors.js.map