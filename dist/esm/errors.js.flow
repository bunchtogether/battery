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

export class FatalError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'FatalError';
  }
}

export class ControllerNotAvailableError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'ControllerNotAvailableError';
  }
}
