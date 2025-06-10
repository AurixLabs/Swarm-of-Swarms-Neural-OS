import { BrowserEventEmitter, createSystemEvent } from '@/core/events';

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  priority: number;
  timestamp: number;
}

export class NetworkKernel extends BrowserEventEmitter {
  private requestQueue: NetworkRequest[] = [];
  private activeRequests: Map<string, Promise<any>> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    super();
    this.initializeNetworking();
  }

  private initializeNetworking(): void {
    // Basic initialization tasks
    console.log('🌐 Network Kernel initializing...');
    this.emit('network_status', { status: 'initializing', timestamp: Date.now() });

    // Set up default rate limiters (example)
    this.rateLimiters.set('default', { count: 100, resetTime: Date.now() + 60000 }); // 100 requests per minute

    this.emit('network_status', { status: 'ready', timestamp: Date.now() });
  }

  public queueRequest(request: NetworkRequest): void {
    this.requestQueue.push(request);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    // Sort queue by priority
    this.requestQueue.sort((a, b) => b.priority - a.priority);

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) continue;

      const limiter = this.rateLimiters.get('default');
      if (limiter && limiter.count <= 0 && limiter.resetTime > Date.now()) {
        console.warn(`⚠️ Rate limit exceeded, delaying request ${request.id}`);
        this.requestQueue.unshift(request); // Put back in queue
        setTimeout(() => this.processQueue(), limiter.resetTime - Date.now());
        return;
      }

      try {
        const response = await this.makeRequest(request);
        this.emit('network_response', { requestId: request.id, response, timestamp: Date.now() });
      } catch (error) {
        console.error(`🔥 Request ${request.id} failed:`, error);
        this.emit('network_error', { requestId: request.id, error, timestamp: Date.now() });
      } finally {
        if (limiter) limiter.count--;
      }
    }
  }

  private async makeRequest(request: NetworkRequest): Promise<any> {
    this.activeRequests.set(request.id, Promise.resolve()); // Mark as active

    try {
      const response = await fetch(request.url, {
        method: request.method,
        body: request.data ? JSON.stringify(request.data) : null,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } finally {
      this.activeRequests.delete(request.id); // Mark as complete
    }
  }

  public setRateLimit(limiterName: string, count: number, resetTime: number): void {
    this.rateLimiters.set(limiterName, { count, resetTime });
  }

  public getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }
}
