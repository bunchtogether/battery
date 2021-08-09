// @flow

// $FlowFixMe
export class AbortError extends DOMException {
  constructor(message:string) {
    super(message, 'AbortError');
  }
}

export class FatalQueueError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'FatalQueueError';
  }
}

export class DelayRetryError extends Error {
  declare delay: number;
  constructor(message:string, delay:number) {
    super(message);
    this.name = 'DelayRetryError';
    this.delay = delay;
  }
}

export class FatalCleanupError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'FatalCleanupError';
  }
}
