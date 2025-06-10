
/**
 * Parallel Task Processor
 * 
 * Inspired by supercomputing architectures, this processor manages
 * task queues and executes them in parallel based on available resources.
 */

export interface TaskOptions {
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  retries?: number;
}

export class ParallelTaskProcessor {
  private maxConcurrency: number;
  private activeTasks: number = 0;
  private taskQueue: Array<{
    task: () => Promise<any>,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    options: TaskOptions,
    retryCount: number
  }> = [];
  
  constructor(maxConcurrency: number = navigator.hardwareConcurrency || 4) {
    this.maxConcurrency = maxConcurrency;
    console.log(`Parallel Task Processor initialized with ${maxConcurrency} workers`);
  }
  
  /**
   * Schedule a task for execution
   */
  enqueue<T>(task: () => Promise<T>, options: TaskOptions = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.taskQueue.push({
        task,
        resolve,
        reject,
        options: {
          priority: options.priority || 'normal',
          timeout: options.timeout,
          retries: options.retries || 0
        },
        retryCount: 0
      });
      
      this.processQueue();
    });
  }
  
  /**
   * Process tasks in the queue
   */
  private processQueue(): void {
    if (this.activeTasks >= this.maxConcurrency || this.taskQueue.length === 0) {
      return;
    }
    
    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const priorityMap = { high: 0, normal: 1, low: 2 };
      return priorityMap[a.options.priority || 'normal'] - priorityMap[b.options.priority || 'normal'];
    });
    
    // Get next task
    const nextTask = this.taskQueue.shift();
    if (!nextTask) return;
    
    // Execute task
    this.activeTasks++;
    
    // Create timeout promise if needed
    let timeoutId: any;
    const timeoutPromise = nextTask.options.timeout 
      ? new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Task timed out after ${nextTask.options.timeout}ms`));
          }, nextTask.options.timeout);
        })
      : null;
    
    // Execute with timeout if specified
    const executePromise = Promise.race([
      nextTask.task(),
      ...(timeoutPromise ? [timeoutPromise] : [])
    ]);
    
    executePromise
      .then(result => {
        if (timeoutId) clearTimeout(timeoutId);
        nextTask.resolve(result);
      })
      .catch(error => {
        if (timeoutId) clearTimeout(timeoutId);
        
        // Retry logic
        if (nextTask.retryCount < (nextTask.options.retries || 0)) {
          console.log(`Retrying task (${nextTask.retryCount + 1}/${nextTask.options.retries})`);
          this.taskQueue.push({
            ...nextTask,
            retryCount: nextTask.retryCount + 1
          });
        } else {
          nextTask.reject(error);
        }
      })
      .finally(() => {
        this.activeTasks--;
        this.processQueue();
      });
    
    // Process more tasks if available
    if (this.activeTasks < this.maxConcurrency) {
      this.processQueue();
    }
  }
  
  /**
   * Execute tasks in parallel with coordinated results
   */
  static async executeAll<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(tasks.map(task => task()));
  }
  
  /**
   * Get current processor status
   */
  getStatus() {
    return {
      maxConcurrency: this.maxConcurrency,
      activeTasks: this.activeTasks,
      queuedTasks: this.taskQueue.length,
      utilization: this.activeTasks / this.maxConcurrency
    };
  }
}

export const globalTaskProcessor = new ParallelTaskProcessor();
