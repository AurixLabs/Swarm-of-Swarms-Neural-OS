import { BrowserEventEmitter, createSystemEvent } from '@/core/events';

export interface UIAdaptation {
  trigger: string;
  condition: (context: any) => boolean;
  adaptation: (ui: any) => void;
  priority: number;
}

export class AdaptiveUIController extends BrowserEventEmitter {
  private adaptations: UIAdaptation[] = [];
  private currentContext: any = {};
  private isActive = true;

  constructor() {
    super();
    this.initializeDefaultAdaptations();
  }

  addAdaptation(adaptation: UIAdaptation): void {
    this.adaptations.push(adaptation);
    this.adaptations.sort((a, b) => b.priority - a.priority);
    this.evaluateAdaptations();
  }

  removeAdaptation(trigger: string): void {
    this.adaptations = this.adaptations.filter(a => a.trigger !== trigger);
  }

  updateContext(newContext: any): void {
    this.currentContext = { ...this.currentContext, ...newContext };
    this.evaluateAdaptations();
  }

  enable(): void {
    this.isActive = true;
    this.evaluateAdaptations();
  }

  disable(): void {
    this.isActive = false;
    // Optionally, revert all adaptations here
  }

  private evaluateAdaptations(): void {
    if (!this.isActive) return;

    this.adaptations.forEach(adaptation => {
      if (adaptation.condition(this.currentContext)) {
        adaptation.adaptation(this); // Pass 'this' to allow direct UI manipulation
        this.emit('ui_adapted', { trigger: adaptation.trigger, context: this.currentContext });
      }
    });
  }

  private initializeDefaultAdaptations(): void {
    // Example adaptation
    this.addAdaptation({
      trigger: 'low_battery',
      priority: 10,
      condition: (context) => context.batteryLevel < 20,
      adaptation: (ui) => {
        console.log('Adaptive UI: Low battery adaptation triggered!');
        // Implement UI changes here, e.g., show a warning message
      }
    });

    this.addAdaptation({
      trigger: 'new_message',
      priority: 5,
      condition: (context) => context.unreadMessages > 0,
      adaptation: (ui) => {
        console.log('Adaptive UI: New message adaptation triggered!');
        // Implement UI changes here, e.g., highlight the message icon
      }
    });
  }
}
