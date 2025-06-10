
import { RegulatoryEventEmitter } from '../regulatory/RegulatoryEventEmitter';

export class RegulatorService {
  private events = new RegulatoryEventEmitter();
  private jurisdictionlessMode = false;

  enableJurisdictionlessMode(): void {
    this.jurisdictionlessMode = true;
    this.events.emitEvent({
      type: 'SOVEREIGNTY_MODE_CHANGED',
      payload: {
        jurisdictionlessMode: true,
        timestamp: Date.now()
      }
    });
  }

  disableJurisdictionlessMode(): void {
    this.jurisdictionlessMode = false;
    this.events.emitEvent({
      type: 'SOVEREIGNTY_MODE_CHANGED',
      payload: {
        jurisdictionlessMode: false,
        timestamp: Date.now()
      }
    });
  }

  isJurisdictionless(): boolean {
    return this.jurisdictionlessMode;
  }

  getEvents(): RegulatoryEventEmitter {
    return this.events;
  }
}

export const regulatorService = new RegulatorService();
