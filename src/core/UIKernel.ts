import { BrowserEventEmitter, createSystemEvent } from '@/core/events';
import { SystemKernel } from './SystemKernel';

export class UIKernel {
  private events: BrowserEventEmitter;
  private systemKernel: SystemKernel;

  constructor(systemKernel: SystemKernel) {
    this.systemKernel = systemKernel
    this.events = new BrowserEventEmitter();
    this.initializeUI();
  }

  private initializeUI(): void {
    // Initialize UI components and event listeners
    console.log('UI Kernel initializing...');
    this.events.emit('ui_initialized', { message: 'UI Kernel initialized' });

    // Example: Listen for a system event and react
    this.systemKernel.events.on('system_booted', () => {
      console.log('UI Kernel: System booted, updating UI...');
      this.events.emit('ui_update', { message: 'System booted' });
    });
  }

  public displayMessage(message: string): void {
    // Display a message in the UI
    console.log(`UI Message: ${message}`);
    this.events.emit('display_message', { message });
  }

  public updateStatus(status: string): void {
    // Update the UI status
    console.log(`UI Status Update: ${status}`);
    this.events.emit('status_update', { status });
  }

  // Example method to simulate a UI event triggering a system action
  public simulateUserAction(action: string): void {
    console.log(`UI Kernel: Simulating user action - ${action}`);
    this.events.emit('user_action', { action });

    // Emit a system event indicating the user action
    this.systemKernel.events.emitEvent(createSystemEvent('user_action', { action }));
  }

  // Method to handle UI-related events
  public handleUIEvent(event: string, data: any): void {
    console.log(`UI Kernel: Handling UI event - ${event}`, data);
    this.events.emit(event, data);
  }
}
