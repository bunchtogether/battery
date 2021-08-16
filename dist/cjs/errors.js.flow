// @flow

// $FlowFixMe
export class AbortError extends DOMException {
  constructor(message:string) {
    super(message, 'AbortError');
  }
}

// $FlowFixMe
export class TimeoutError extends DOMException {
  constructor(message:string) {
    super(message, 'TimeoutError');
  }
}

export class FatalQueueError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'FatalQueueError';
  }
}

export class FatalCleanupError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'FatalCleanupError';
  }
}
