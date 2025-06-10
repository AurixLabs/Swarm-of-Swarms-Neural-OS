
import { systemHealthMonitor, KernelHealthMetrics } from '../monitoring/SystemHealthMonitor';

export interface KernelMessage {
  id: string;
  fromKernel: string;
  toKernel: string;
  type: 'command' | 'event' | 'query' | 'response';
  payload: any;
  timestamp: number;
  priority: number; // 1-10, 10 being highest
}

export interface KernelCommandResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

export class KernelCommunicationHub {
  private messageQueue: KernelMessage[] = [];
  private kernelStates: Map<string, any> = new Map();
  private messageHandlers: Map<string, (message: KernelMessage) => Promise<any>> = new Map();
  private isProcessing = false;
  private processingInterval?: number;

  constructor() {
    console.log('🔥 KernelCommunicationHub: ROCK-SOLID communication initialized');
    this.initializeKernelHandlers();
    this.startMessageProcessing();
  }

  private initializeKernelHandlers(): void {
    // System Kernel handlers
    this.registerHandler('system', async (message) => {
      switch (message.type) {
        case 'command':
          return this.handleSystemCommand(message);
        case 'query':
          return this.handleSystemQuery(message);
        default:
          return { success: true, data: 'System kernel acknowledged' };
      }
    });

    // AI Kernel handlers
    this.registerHandler('ai', async (message) => {
      switch (message.type) {
        case 'command':
          return this.handleAICommand(message);
        case 'query':
          return this.handleAIQuery(message);
        default:
          return { success: true, data: 'AI kernel acknowledged' };
      }
    });

    // Add more kernel handlers...
    ['memory', 'security', 'network', 'ethics', 'neuromorphic'].forEach(kernelId => {
      this.registerHandler(kernelId, async (message) => {
        return { 
          success: true, 
          data: `${kernelId} kernel processed: ${message.type}`,
          processingTime: Math.random() * 50 + 10
        };
      });
    });
  }

  registerHandler(kernelId: string, handler: (message: KernelMessage) => Promise<any>): void {
    this.messageHandlers.set(kernelId, handler);
    console.log(`📡 KernelCommunicationHub: Handler registered for ${kernelId}`);
  }

  async sendMessage(message: Omit<KernelMessage, 'id' | 'timestamp'>): Promise<string> {
    const fullMessage: KernelMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
    };

    // Add to priority queue
    this.insertMessageByPriority(fullMessage);
    
    console.log(`📤 KernelCommunicationHub: Message queued from ${message.fromKernel} to ${message.toKernel}`);
    return fullMessage.id;
  }

  async executeKernelCommand(kernelId: string, command: string, params?: any): Promise<KernelCommandResult> {
    const startTime = performance.now();
    
    try {
      const messageId = await this.sendMessage({
        fromKernel: 'system',
        toKernel: kernelId,
        type: 'command',
        payload: { command, params },
        priority: 8, // High priority for direct commands
      });

      // Wait for command execution (simulated)
      await this.waitForMessageProcessing(messageId);
      
      const executionTime = performance.now() - startTime;
      
      // Update kernel health based on command execution
      this.updateKernelHealthAfterCommand(kernelId, executionTime);
      
      return {
        success: true,
        data: `Command '${command}' executed on ${kernelId}`,
        executionTime,
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error(`❌ KernelCommunicationHub: Command failed on ${kernelId}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  private insertMessageByPriority(message: KernelMessage): void {
    // Insert message in priority order (highest priority first)
    let inserted = false;
    for (let i = 0; i < this.messageQueue.length; i++) {
      if (this.messageQueue[i].priority < message.priority) {
        this.messageQueue.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      this.messageQueue.push(message);
    }
  }

  private startMessageProcessing(): void {
    if (this.processingInterval) return;
    
    this.processingInterval = window.setInterval(async () => {
      if (!this.isProcessing && this.messageQueue.length > 0) {
        await this.processNextMessage();
      }
    }, 100); // Process every 100ms
  }

  private async processNextMessage(): Promise<void> {
    if (this.messageQueue.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    const message = this.messageQueue.shift()!;
    
    try {
      const handler = this.messageHandlers.get(message.toKernel);
      if (handler) {
        const result = await handler(message);
        console.log(`✅ KernelCommunicationHub: Message processed - ${message.fromKernel} → ${message.toKernel}`);
      } else {
        console.warn(`⚠️ KernelCommunicationHub: No handler for kernel ${message.toKernel}`);
      }
    } catch (error) {
      console.error(`❌ KernelCommunicationHub: Error processing message:`, error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async waitForMessageProcessing(messageId: string): Promise<void> {
    // Simulate async processing time
    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 100 + 50);
    });
  }

  private updateKernelHealthAfterCommand(kernelId: string, executionTime: number): void {
    // Update kernel health based on command performance
    const health = systemHealthMonitor.getKernelHealth(kernelId);
    if (health) {
      // Good performance (< 50ms) improves health, poor performance degrades it
      const performanceImpact = executionTime < 50 ? 1 : -2;
      // This would update the kernel's health metrics
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Command handlers
  private async handleSystemCommand(message: KernelMessage): Promise<any> {
    const { command, params } = message.payload;
    
    switch (command) {
      case 'restart':
        return { success: true, data: 'System restart initiated' };
      case 'shutdown':
        return { success: true, data: 'System shutdown initiated' };
      case 'status':
        return { success: true, data: systemHealthMonitor.getCurrentMetrics() };
      default:
        return { success: false, error: `Unknown system command: ${command}` };
    }
  }

  private async handleSystemQuery(message: KernelMessage): Promise<any> {
    const { query } = message.payload;
    
    switch (query) {
      case 'health':
        return { success: true, data: systemHealthMonitor.getOverallSystemHealth() };
      case 'metrics':
        return { success: true, data: systemHealthMonitor.getCurrentMetrics() };
      default:
        return { success: false, error: `Unknown system query: ${query}` };
    }
  }

  private async handleAICommand(message: KernelMessage): Promise<any> {
    const { command, params } = message.payload;
    
    switch (command) {
      case 'analyze':
        return { 
          success: true, 
          data: `AI analysis complete: ${params?.input || 'no input'}` 
        };
      case 'learn':
        return { success: true, data: 'Learning process initiated' };
      default:
        return { success: false, error: `Unknown AI command: ${command}` };
    }
  }

  private async handleAIQuery(message: KernelMessage): Promise<any> {
    const { query } = message.payload;
    
    switch (query) {
      case 'capabilities':
        return { 
          success: true, 
          data: ['analysis', 'reasoning', 'learning', 'pattern_recognition'] 
        };
      case 'status':
        return { success: true, data: 'AI kernel operational' };
      default:
        return { success: false, error: `Unknown AI query: ${query}` };
    }
  }

  getQueueLength(): number {
    return this.messageQueue.length;
  }

  getKernelState(kernelId: string): any {
    return this.kernelStates.get(kernelId);
  }

  setKernelState(kernelId: string, state: any): void {
    this.kernelStates.set(kernelId, state);
  }

  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
  }
}

// Singleton instance
export const kernelCommunicationHub = new KernelCommunicationHub();
