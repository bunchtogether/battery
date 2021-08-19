// @flow

import EventEmitter from 'events';
import {
  getQueueStatus,
  jobEmitter,
  JOB_ABORTED_STATUS,
  JOB_COMPLETE_STATUS,
  JOB_PENDING_STATUS,
  JOB_ERROR_STATUS,
  JOB_CLEANUP_STATUS,
  JOB_CLEANUP_AND_REMOVE_STATUS,
  QUEUE_ERROR_STATUS,
  QUEUE_PENDING_STATUS,
  QUEUE_EMPTY_STATUS,
} from './database';


export default class BatteryQueueWatcher extends EventEmitter {
  declare queueId: string;
  declare statusRequested: boolean;
  declare handleJobAdd: (number, string) => void;
  declare handleJobDelete: (number, string) => void;
  declare handleJobUpdate: (number, string, string, number) => void;
  declare handleJobsClear: () => void;
  declare status: void | number;

  constructor(queueId: string) {
    super();
    this.queueId = queueId;
    this.statusRequested = false;
    const handleJobAdd = (id:number, qId:string) => {
      if (queueId !== qId) {
        return;
      }
      this.emit('status', QUEUE_PENDING_STATUS);
    };
    this.handleJobAdd = handleJobAdd;
    jobEmitter.addListener('jobAdd', handleJobAdd);
    const handleJobDelete = (id:number, qId:string) => {
      if (queueId !== qId) {
        return;
      }
      this.emitStatus();
    };
    this.handleJobDelete = handleJobDelete;
    jobEmitter.addListener('jobDelete', handleJobDelete);
    const handleJobUpdate = (id:number, qId:string, type:string, status:number) => {
      if (queueId !== qId) {
        return;
      }
      if (status === JOB_ABORTED_STATUS || status === JOB_CLEANUP_STATUS) {
        this.emit('status', QUEUE_ERROR_STATUS);
      } else if (status === JOB_ERROR_STATUS || status === JOB_PENDING_STATUS || status === JOB_CLEANUP_AND_REMOVE_STATUS) {
        this.emit('status', QUEUE_PENDING_STATUS);
      } else if (status === JOB_COMPLETE_STATUS || status === JOB_PENDING_STATUS) {
        this.emitStatus();
      }
    };
    this.handleJobUpdate = handleJobUpdate;
    jobEmitter.addListener('jobUpdate', handleJobUpdate);
    const handleJobsClear = () => {
      this.emit('status', QUEUE_EMPTY_STATUS);
    };
    this.handleJobsClear = handleJobsClear;
    jobEmitter.addListener('jobsClear', handleJobsClear);
    this.on('status', (status:number) => {
      this.status = status;
    });
  }

  async getStatus() {
    const { status } = this;
    if (typeof status === 'number') {
      return status;
    }
    const newStatus = await getQueueStatus(this.queueId);
    this.status = newStatus;
    return newStatus;
  }

  emitStatus() {
    if (this.statusRequested) {
      return;
    }
    delete this.status;
    this.statusRequested = true;
    let didEmitNewStatus = false;
    const handleStatus = () => {
      didEmitNewStatus = true;
    };
    this.addListener('status', handleStatus);
    self.queueMicrotask(async () => {
      this.statusRequested = false;
      this.removeListener('status', handleStatus);
      if (didEmitNewStatus) {
        return;
      }
      const status = await getQueueStatus(this.queueId);
      this.emit('status', status);
    });
  }

  close() {
    jobEmitter.removeListener('jobAdd', this.handleJobAdd);
    jobEmitter.removeListener('jobDelete', this.handleJobDelete);
    jobEmitter.removeListener('jobUpdate', this.handleJobUpdate);
    jobEmitter.removeListener('jobsClear', this.handleJobsClear);
  }
}
