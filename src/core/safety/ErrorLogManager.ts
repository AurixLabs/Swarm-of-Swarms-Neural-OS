import { ErrorRecord } from './types';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

export class ErrorLogManager {
  private errorLog: ErrorRecord[] = [];
  private maxErrorLogSize: number;
  private eventEmitter: BrowserEventEmitter;

  constructor(maxSize: number = 100, eventEmitter: BrowserEventEmitter) {
    this.maxErrorLogSize = maxSize;
    this.eventEmitter = eventEmitter;
  }

  addError(error: ErrorRecord): void {
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxErrorLogSize);
    }
    this.eventEmitter.emit('error:captured', error);
  }

  getLog(): ErrorRecord[] {
    return [...this.errorLog];
  }

  clear(): void {
    this.errorLog = [];
    this.eventEmitter.emit('error:log-cleared');
  }

  markErrorAsHandled(error: ErrorRecord): void {
    error.handled = true;
  }
}
