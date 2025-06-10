
import { ModuleBase, ModuleStatus, ModuleHealth } from './ModuleBase';
import { eventBus } from './EventBus';

export interface UIState {
  currentRoute: string;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: any[];
  activeModals: string[];
  renderTime: number;
}

export class UIKernelModule extends ModuleBase {
  private uiState: UIState;
  private renderMetrics: { total: number; average: number; last: number };

  constructor() {
    super('ui-kernel', 'UI Kernel Module', 1.0);
    
    this.uiState = {
      currentRoute: '/',
      theme: 'light',
      sidebarOpen: false,
      notifications: [],
      activeModals: [],
      renderTime: 0
    };

    this.renderMetrics = {
      total: 0,
      average: 0,
      last: 0
    };
  }

  async initialize(): Promise<void> {
    this.updateStatus('initializing');
    
    try {
      console.log('🔧 Initializing UIKernelModule...');
      
      // Setup UI event listeners
      this.setupUIEventListeners();
      
      // Monitor render performance
      this.setupRenderMonitoring();
      
      this.updateStatus('running');
      this.updateHealth('healthy');
      
      eventBus.emit('ui:initialized', { moduleId: this.id, state: this.uiState });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.updateStatus('stopping');
    
    // Clean up UI state
    this.uiState.notifications = [];
    this.uiState.activeModals = [];
    
    this.updateStatus('stopped');
    eventBus.emit('ui:shutdown', { moduleId: this.id });
  }

  async restart(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }

  private setupUIEventListeners(): void {
    // Listen for route changes
    eventBus.on('route:changed', (data: any) => {
      this.uiState.currentRoute = data.route;
      eventBus.emit('ui:route:updated', { route: data.route });
    });

    // Listen for theme changes
    eventBus.on('theme:changed', (data: any) => {
      this.uiState.theme = data.theme;
      eventBus.emit('ui:theme:updated', { theme: data.theme });
    });

    // Listen for notifications
    eventBus.on('notification:add', (data: any) => {
      this.addNotification(data);
    });

    // Listen for modal events
    eventBus.on('modal:open', (data: any) => {
      this.openModal(data.modalId);
    });

    eventBus.on('modal:close', (data: any) => {
      this.closeModal(data.modalId);
    });
  }

  private setupRenderMonitoring(): void {
    // Monitor render performance using PerformanceObserver if available
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.updateRenderMetrics(entry.duration);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        console.warn('Performance monitoring not available');
      }
    }
  }

  private updateRenderMetrics(duration: number): void {
    this.renderMetrics.last = duration;
    this.renderMetrics.total += duration;
    this.renderMetrics.average = this.renderMetrics.total / (this.renderMetrics.total > 0 ? 1 : 1);
    
    this.uiState.renderTime = duration;
    
    eventBus.emit('ui:render:metrics', {
      moduleId: this.id,
      duration,
      average: this.renderMetrics.average
    });
  }

  // UI State Management Methods
  addNotification(notification: any): void {
    this.uiState.notifications.push({
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: Date.now()
    });
    
    eventBus.emit('ui:notification:added', { notification });
  }

  removeNotification(notificationId: string): void {
    this.uiState.notifications = this.uiState.notifications.filter(n => n.id !== notificationId);
    eventBus.emit('ui:notification:removed', { notificationId });
  }

  openModal(modalId: string): void {
    if (!this.uiState.activeModals.includes(modalId)) {
      this.uiState.activeModals.push(modalId);
      eventBus.emit('ui:modal:opened', { modalId });
    }
  }

  closeModal(modalId: string): void {
    this.uiState.activeModals = this.uiState.activeModals.filter(id => id !== modalId);
    eventBus.emit('ui:modal:closed', { modalId });
  }

  toggleSidebar(): void {
    this.uiState.sidebarOpen = !this.uiState.sidebarOpen;
    eventBus.emit('ui:sidebar:toggled', { open: this.uiState.sidebarOpen });
  }

  getUIState(): UIState {
    return { ...this.uiState };
  }

  getModuleHealth(): ModuleHealth {
    const { renderTime } = this.uiState;
    const avgRender = this.renderMetrics.average;

    if (renderTime > 100 || avgRender > 50) {
      return 'degraded';
    } else if (renderTime > 200 || avgRender > 100) {
      return 'critical';
    } else {
      return 'healthy';
    }
  }
}

export const uiKernelModule = new UIKernelModule();
