import { BrowserEventEmitter } from '../BrowserEventEmitter';

/**
 * Processing strategies for different types of tasks
 */
export enum ProcessingStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  DIVIDE_AND_CONQUER = 'divide_and_conquer',
  PIPELINE = 'pipeline',
  RECURSIVE = 'recursive',
  STREAM = 'stream'
}

/**
 * Task Types that can be processed
 */
export enum TaskType {
  DATA_TRANSFORMATION = 'data_transformation',
  COMPUTATION = 'computation',
  INFERENCE = 'inference',
  OPTIMIZATION = 'optimization',
  SEARCH = 'search',
  GENERATION = 'generation'
}

/**
 * Task interface for heterogeneous processing
 */
export interface ProcessingTask<T = any, R = any> {
  id: string;
  type: TaskType;
  input: T;
  process: (input: T) => Promise<R> | R;
  dependencies?: string[];
  preferredStrategy?: ProcessingStrategy;
  priority?: number;
  metadata?: Record<string, any>;
}

/**
 * Task result with performance metrics
 */
export interface TaskResult<R = any> {
  taskId: string;
  result: R;
  startTime: number;
  endTime: number;
  strategy: ProcessingStrategy;
  success: boolean;
  error?: Error;
}

/**
 * Pipeline stage for composite processing
 */
interface PipelineStage {
  id: string;
  strategy: ProcessingStrategy;
  tasks: string[];
  next?: string[];
}

/**
 * HeterogeneousProcessingPipeline - Distributes tasks across different processing strategies
 * 
 * This component intelligently routes computational tasks to the most appropriate
 * processing strategy based on the task type, dependencies, and system state.
 */
export class HeterogeneousProcessingPipeline {
  private static instance: HeterogeneousProcessingPipeline;
  private events = new BrowserEventEmitter();
  private tasks = new Map<string, ProcessingTask>();
  private results = new Map<string, TaskResult>();
  private stages = new Map<string, PipelineStage>();
  private activeWorkers = 0;
  private maxConcurrency = 4;
  private processing = false;
  
  // Strategy selectors determine which strategy to use for each task type
  private strategySelectors: Record<TaskType, (task: ProcessingTask) => ProcessingStrategy> = {
    [TaskType.DATA_TRANSFORMATION]: this.selectDataStrategy,
    [TaskType.COMPUTATION]: this.selectComputationStrategy,
    [TaskType.INFERENCE]: this.selectInferenceStrategy,
    [TaskType.OPTIMIZATION]: this.selectOptimizationStrategy,
    [TaskType.SEARCH]: this.selectSearchStrategy,
    [TaskType.GENERATION]: this.selectGenerationStrategy
  };
  
  // Private constructor to enforce singleton
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): HeterogeneousProcessingPipeline {
    if (!HeterogeneousProcessingPipeline.instance) {
      HeterogeneousProcessingPipeline.instance = new HeterogeneousProcessingPipeline();
    }
    return HeterogeneousProcessingPipeline.instance;
  }
  
  /**
   * Add a task to the pipeline
   */
  public addTask<T, R>(task: ProcessingTask<T, R>): string {
    this.tasks.set(task.id, task);
    this.events.emit('task:added', { taskId: task.id, type: task.type });
    return task.id;
  }
  
  /**
   * Create a pipeline stage with multiple tasks
   */
  public createStage(
    stageId: string, 
    strategy: ProcessingStrategy, 
    taskIds: string[],
    nextStageIds?: string[]
  ): string {
    // Validate that all tasks exist
    for (const taskId of taskIds) {
      if (!this.tasks.has(taskId)) {
        throw new Error(`Cannot create stage with non-existent task: ${taskId}`);
      }
    }
    
    // Create and store the stage
    const stage: PipelineStage = {
      id: stageId,
      strategy,
      tasks: taskIds,
      next: nextStageIds
    };
    
    this.stages.set(stageId, stage);
    this.events.emit('stage:created', { stageId, taskCount: taskIds.length });
    
    return stageId;
  }
  
  /**
   * Process all tasks in the pipeline
   */
  public async process(): Promise<Map<string, TaskResult>> {
    if (this.processing) {
      throw new Error('Pipeline is already processing');
    }
    
    this.processing = true;
    this.events.emit('pipeline:started', { taskCount: this.tasks.size });
    
    try {
      // If stages are defined, process in stages
      if (this.stages.size > 0) {
        await this.processStages();
      } else {
        // Otherwise process all tasks with appropriate strategies
        await this.processAllTasks();
      }
      
      this.events.emit('pipeline:completed', { 
        taskCount: this.tasks.size,
        resultCount: this.results.size,
        successCount: Array.from(this.results.values()).filter(r => r.success).length
      });
      
      return this.results;
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Process all tasks without stages
   */
  private async processAllTasks(): Promise<void> {
    // Group tasks by dependencies to process them in order
    const independentTasks: ProcessingTask[] = [];
    const dependentTasks: ProcessingTask[] = [];
    
    for (const task of this.tasks.values()) {
      if (!task.dependencies || task.dependencies.length === 0) {
        independentTasks.push(task);
      } else {
        dependentTasks.push(task);
      }
    }
    
    // Process independent tasks first
    await this.processTasks(independentTasks);
    
    // Process dependent tasks in batches until all are processed
    let remainingTasks = [...dependentTasks];
    let lastRemainingCount = remainingTasks.length;
    
    while (remainingTasks.length > 0) {
      const readyTasks = remainingTasks.filter(task => 
        task.dependencies!.every(depId => this.results.has(depId))
      );
      
      if (readyTasks.length === 0) {
        // Circular dependency or missing dependency
        throw new Error('Cannot process remaining tasks due to unsatisfied dependencies');
      }
      
      await this.processTasks(readyTasks);
      
      // Update remaining tasks
      remainingTasks = remainingTasks.filter(task => !readyTasks.includes(task));
      
      // Detect lack of progress (safety check)
      if (remainingTasks.length === lastRemainingCount) {
        throw new Error('Pipeline stalled - unable to make progress on dependent tasks');
      }
      
      lastRemainingCount = remainingTasks.length;
    }
  }
  
  /**
   * Process tasks in defined stages
   */
  private async processStages(): Promise<void> {
    // Find root stages (those not referenced as 'next' by any other stage)
    const allNextStages = new Set<string>();
    for (const stage of this.stages.values()) {
      if (stage.next) {
        stage.next.forEach(next => allNextStages.add(next));
      }
    }
    
    const rootStages = Array.from(this.stages.keys())
      .filter(stageId => !allNextStages.has(stageId));
    
    // Process stages starting from roots
    await this.processStagesByIds(rootStages);
  }
  
  /**
   * Process specific stages and their downstream stages
   */
  private async processStagesByIds(stageIds: string[]): Promise<void> {
    if (stageIds.length === 0) return;
    
    // Process current stages
    for (const stageId of stageIds) {
      const stage = this.stages.get(stageId);
      if (!stage) continue;
      
      this.events.emit('stage:started', { stageId });
      
      const stageTasks = stage.tasks
        .map(taskId => this.tasks.get(taskId))
        .filter(Boolean) as ProcessingTask[];
      
      if (stage.strategy === ProcessingStrategy.SEQUENTIAL) {
        // Process tasks one by one
        for (const task of stageTasks) {
          await this.processTask(task, stage.strategy);
        }
      } else {
        // Process with the stage's strategy
        await this.processTasks(stageTasks, stage.strategy);
      }
      
      this.events.emit('stage:completed', { stageId });
    }
    
    // Collect next stages
    const nextStages = new Set<string>();
    for (const stageId of stageIds) {
      const stage = this.stages.get(stageId);
      if (stage?.next) {
        stage.next.forEach(next => nextStages.add(next));
      }
    }
    
    // Process next stages
    if (nextStages.size > 0) {
      await this.processStagesByIds(Array.from(nextStages));
    }
  }
  
  /**
   * Process a batch of tasks with the specified strategy
   */
  private async processTasks(
    tasks: ProcessingTask[], 
    forcedStrategy?: ProcessingStrategy
  ): Promise<void> {
    if (tasks.length === 0) return;
    
    if (forcedStrategy) {
      // Use forced strategy for all tasks
      switch (forcedStrategy) {
        case ProcessingStrategy.SEQUENTIAL:
          for (const task of tasks) {
            await this.processTask(task, forcedStrategy);
          }
          break;
          
        case ProcessingStrategy.PARALLEL:
          await Promise.all(tasks.map(task => this.processTask(task, forcedStrategy)));
          break;
          
        case ProcessingStrategy.DIVIDE_AND_CONQUER:
          await this.processDivideAndConquer(tasks);
          break;
          
        case ProcessingStrategy.PIPELINE:
          await this.processPipelined(tasks);
          break;
          
        case ProcessingStrategy.RECURSIVE:
          await this.processRecursive(tasks);
          break;
          
        case ProcessingStrategy.STREAM:
          await this.processStreaming(tasks);
          break;
      }
    } else {
      // Group tasks by their preferred or selected strategy
      const tasksByStrategy = new Map<ProcessingStrategy, ProcessingTask[]>();
      
      for (const task of tasks) {
        const strategy = task.preferredStrategy || this.selectStrategy(task);
        if (!tasksByStrategy.has(strategy)) {
          tasksByStrategy.set(strategy, []);
        }
        tasksByStrategy.get(strategy)!.push(task);
      }
      
      // Process each strategy group
      for (const [strategy, strategyTasks] of tasksByStrategy.entries()) {
        await this.processTasks(strategyTasks, strategy);
      }
    }
  }
  
  /**
   * Process a single task and store the result
   */
  private async processTask(task: ProcessingTask, strategy: ProcessingStrategy): Promise<TaskResult> {
    const startTime = performance.now();
    
    this.events.emit('task:started', { 
      taskId: task.id, 
      strategy
    });
    
    let result: any;
    let success = false;
    let error: Error | undefined;
    
    try {
      // Check if dependencies are satisfied
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          if (!this.results.has(depId)) {
            throw new Error(`Dependency not satisfied: ${depId}`);
          }
        }
      }
      
      // Process the task
      result = await task.process(task.input);
      success = true;
    } catch (err) {
      error = err as Error;
      console.error(`Error processing task ${task.id}:`, err);
    }
    
    const endTime = performance.now();
    
    // Create result record
    const taskResult: TaskResult = {
      taskId: task.id,
      result,
      startTime,
      endTime,
      strategy,
      success,
      error
    };
    
    // Store the result
    this.results.set(task.id, taskResult);
    
    this.events.emit('task:completed', { 
      taskId: task.id, 
      success,
      duration: endTime - startTime,
      strategy
    });
    
    return taskResult;
  }
  
  /**
   * Process tasks using divide and conquer strategy
   */
  private async processDivideAndConquer(tasks: ProcessingTask[]): Promise<void> {
    if (tasks.length <= 1) {
      if (tasks.length === 1) {
        await this.processTask(tasks[0], ProcessingStrategy.DIVIDE_AND_CONQUER);
      }
      return;
    }
    
    const mid = Math.floor(tasks.length / 2);
    const left = tasks.slice(0, mid);
    const right = tasks.slice(mid);
    
    // Process the two halves in parallel
    await Promise.all([
      this.processDivideAndConquer(left),
      this.processDivideAndConquer(right)
    ]);
  }
  
  /**
   * Process tasks in a pipeline fashion
   */
  private async processPipelined(tasks: ProcessingTask[]): Promise<void> {
    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );
    
    // Using a sliding window approach for controlled parallelism
    const window = this.maxConcurrency;
    for (let i = 0; i < sortedTasks.length; i += window) {
      const batch = sortedTasks.slice(i, i + window);
      await Promise.all(batch.map(task => 
        this.processTask(task, ProcessingStrategy.PIPELINE)
      ));
    }
  }
  
  /**
   * Process tasks recursively based on dependencies
   */
  private async processRecursive(tasks: ProcessingTask[]): Promise<void> {
    const processed = new Set<string>();
    
    const processDependencies = async (task: ProcessingTask): Promise<void> => {
      if (processed.has(task.id)) return;
      
      // Process dependencies first
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          const depTask = this.tasks.get(depId);
          if (depTask && !processed.has(depId)) {
            await processDependencies(depTask);
          }
        }
      }
      
      // Then process the task itself
      await this.processTask(task, ProcessingStrategy.RECURSIVE);
      processed.add(task.id);
    };
    
    // Start processing from each task
    for (const task of tasks) {
      await processDependencies(task);
    }
  }
  
  /**
   * Process tasks in a streaming fashion (as worker slots become available)
   */
  private async processStreaming(tasks: ProcessingTask[]): Promise<void> {
    return new Promise((resolve) => {
      const taskQueue = [...tasks];
      const inProgress = new Set<string>();
      
      const processNext = () => {
        // Process as many tasks as possible up to maxConcurrency
        while (inProgress.size < this.maxConcurrency && taskQueue.length > 0) {
          const task = taskQueue.shift()!;
          inProgress.add(task.id);
          
          this.processTask(task, ProcessingStrategy.STREAM)
            .finally(() => {
              inProgress.delete(task.id);
              
              // Check if we're done or can process more
              if (inProgress.size === 0 && taskQueue.length === 0) {
                resolve();
              } else {
                processNext();
              }
            });
        }
      };
      
      // Start processing
      processNext();
      
      // Handle empty tasks case
      if (taskQueue.length === 0) {
        resolve();
      }
    });
  }
  
  /**
   * Select the most appropriate strategy for a task
   */
  private selectStrategy(task: ProcessingTask): ProcessingStrategy {
    const selector = this.strategySelectors[task.type];
    if (selector) {
      return selector.call(this, task);
    }
    
    // Default to sequential
    return ProcessingStrategy.SEQUENTIAL;
  }
  
  // Strategy selectors for different task types
  
  private selectDataStrategy(task: ProcessingTask): ProcessingStrategy {
    // For large data sets, use streaming
    if (task.metadata?.dataSize && task.metadata.dataSize > 10000) {
      return ProcessingStrategy.STREAM;
    }
    
    // If data can be partitioned, use parallel
    if (task.metadata?.canPartition) {
      return ProcessingStrategy.PARALLEL;
    }
    
    return ProcessingStrategy.SEQUENTIAL;
  }
  
  private selectComputationStrategy(task: ProcessingTask): ProcessingStrategy {
    // For complex computations, use divide and conquer
    if (task.metadata?.complexity === 'high') {
      return ProcessingStrategy.DIVIDE_AND_CONQUER;
    }
    
    // For highly parallel tasks, use parallel
    if (task.metadata?.parallelizable) {
      return ProcessingStrategy.PARALLEL;
    }
    
    return ProcessingStrategy.SEQUENTIAL;
  }
  
  private selectInferenceStrategy(task: ProcessingTask): ProcessingStrategy {
    // Inference often works best in parallel
    return ProcessingStrategy.PARALLEL;
  }
  
  private selectOptimizationStrategy(task: ProcessingTask): ProcessingStrategy {
    // For searching large spaces, divide and conquer
    if (task.metadata?.searchSpace === 'large') {
      return ProcessingStrategy.DIVIDE_AND_CONQUER;
    }
    
    // For iterative optimization, pipeline is often best
    return ProcessingStrategy.PIPELINE;
  }
  
  private selectSearchStrategy(task: ProcessingTask): ProcessingStrategy {
    // Parallel search for most cases
    return ProcessingStrategy.PARALLEL;
  }
  
  private selectGenerationStrategy(task: ProcessingTask): ProcessingStrategy {
    // Generation tasks often benefit from pipeline approach
    return ProcessingStrategy.PIPELINE;
  }
  
  /**
   * Get all results so far
   */
  public getResults(): Map<string, TaskResult> {
    return new Map(this.results);
  }
  
  /**
   * Get a specific result
   */
  public getResult(taskId: string): TaskResult | undefined {
    return this.results.get(taskId);
  }
  
  /**
   * Clear all tasks and results
   */
  public clear(): void {
    this.tasks.clear();
    this.results.clear();
    this.stages.clear();
    this.events.emit('pipeline:cleared', { timestamp: Date.now() });
  }
  
  /**
   * Set maximum concurrency
   */
  public setMaxConcurrency(max: number): void {
    this.maxConcurrency = Math.max(1, Math.min(16, max));
  }
  
  /**
   * Subscribe to pipeline events
   */
  public on(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}

export const heterogeneousProcessingPipeline = HeterogeneousProcessingPipeline.getInstance();
export default heterogeneousProcessingPipeline;
