// $FlowFixMe
export class AbortError extends DOMException {
  constructor(message) {
    super(message, 'AbortError');
  }

}
export class FatalQueueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FatalQueueError';
  }

}
export class DelayRetryError extends Error {
  constructor(message, delay) {
    super(message);
    this.name = 'DelayRetryError';
    this.delay = delay;
  }

}
//# sourceMappingURL=errors.js.map