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
export class FatalQueueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FatalQueueError';
  }

}
export class FatalCleanupError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FatalCleanupError';
  }

}
//# sourceMappingURL=errors.js.map