
import { ErrorRecord, RecoveryStrategy } from './types';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

// Handles registration and invocation of error recovery strategies.
export class RecoveryManager {
  private strategies: RecoveryStrategy[] = [];
  private isRecovering = false;
  private eventEmitter: BrowserEventEmitter;

  constructor(eventEmitter: BrowserEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  registerStrategy(strategy: RecoveryStrategy): void {
    const existingIndex = this.strategies.findIndex(s => s.id === strategy.id);
    if (existingIndex >= 0) {
      this.strategies[existingIndex] = strategy;
    } else {
      this.strategies.push(strategy);
    }
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  unregisterStrategy(id: string): boolean {
    const initialLength = this.strategies.length;
    this.strategies = this.strategies.filter(s => s.id !== id);
    return this.strategies.length !== initialLength;
  }

  async attemptRecovery(error: ErrorRecord): Promise<boolean> {
    if (this.isRecovering) return false;
    this.isRecovering = true;
    let recoverySuccessful = false;
    try {
      const applicableStrategies = this.strategies.filter(
        strategy => strategy.condition(error)
      );
      for (const strategy of applicableStrategies) {
        try {
          const success = await strategy.action(error);
          if (success) {
            recoverySuccessful = true;
            this.eventEmitter.emit('error:recovered', {
              error,
              strategyId: strategy.id
            });
            break;
          }
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategy.id} failed:`, recoveryError);
        }
      }
      if (!recoverySuccessful) {
        this.eventEmitter.emit('error:unrecoverable', error);
      }
      return recoverySuccessful;
    } finally {
      this.isRecovering = false;
    }
  }
}
