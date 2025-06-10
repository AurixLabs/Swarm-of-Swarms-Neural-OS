
import { SystemEventBus } from '../events/SystemEventBus';
import { DistributedEthicalGuard } from '../ethics/DistributedEthicalGuard';

export class SystemState {
  private state: Map<string, any>;
  private events: SystemEventBus;

  constructor(events: SystemEventBus) {
    this.state = new Map();
    this.events = events;
  }

  public getState<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  public setState<T>(key: string, value: T): void {
    const isSensitiveState = key.includes('security:') || 
                            key.includes('auth:') || 
                            key.includes('privacy:') ||
                            key.includes('ethics:');
                            
    if (isSensitiveState) {
      const check = DistributedEthicalGuard.performBasicEthicalCheck(
        `Update state: ${key}`, 
        { oldValue: this.state.get(key), newValue: value }
      );
      
      if (!check.approved) {
        console.warn(`State change rejected by ethical check: ${check.reason}`);
        this.events.emitEvent({
          type: 'SECURITY_ALERT', 
          payload: {
            level: 'warning',
            message: `Ethically rejected state change: ${key}`,
            reason: check.reason
          }
        });
        return;
      }
    }
    
    this.state.set(key, value);
    this.events.emitEvent({
      type: 'DATA_UPDATED', 
      payload: { key, value }
    });
  }

  public isInSafeMode(): boolean {
    return this.getState<boolean>('system:safeMode') || false;
  }

  public enterSafeMode(): void {
    if (!this.isInSafeMode()) {
      console.log('System entering safe mode');
      this.state.set('system:safeMode', true);
      this.events.emitEvent({
        type: 'SECURITY_ALERT', 
        payload: {
          level: 'warning',
          message: 'System has entered safe mode due to security concerns'
        }
      });
    }
  }

  public exitSafeMode(): void {
    if (this.isInSafeMode()) {
      console.log('System exiting safe mode');
      this.setState('system:safeMode', false);
      this.events.emitEvent({
        type: 'UI_STATE_CHANGED', 
        payload: {
          safeMode: false,
          message: 'System has exited safe mode'
        }
      });
    }
  }
}
