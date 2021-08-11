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
export class FatalCleanupError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FatalCleanupError';
  }

}
//# sourceMappingURL=errors.js.map