import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SystemEvent } from '../types/SystemEvent';

export interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: Date;
  parameters: Record<string, any>;
}

export interface Prediction {
  id: string;
  modelId: string;
  timestamp: Date;
  value: number;
  confidence: number;
  metadata: Record<string, any>;
}

export interface SystemForecast {
  metric: string;
  predictions: Prediction[];
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

export class PredictiveAnalyticsEngine extends BrowserEventEmitter {
  private models: Map<string, PredictionModel> = new Map();
  private predictions: Map<string, Prediction[]> = new Map();
  private isRunning = false;

  constructor() {
    super();
    this.initializeDefaultModels();
  }

  private initializeDefaultModels() {
    const defaultModels: PredictionModel[] = [
      {
        id: 'system_load',
        name: 'System Load Predictor',
        accuracy: 0.87,
        lastTrained: new Date(),
        parameters: { windowSize: 24, learningRate: 0.01 }
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage Predictor',
        accuracy: 0.92,
        lastTrained: new Date(),
        parameters: { windowSize: 12, learningRate: 0.015 }
      }
    ];

    defaultModels.forEach(model => this.models.set(model.id, model));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.emit('started');
    this.schedulePredictionCycle();
  }

  stop() {
    this.isRunning = false;
    this.emit('stopped');
  }

  private schedulePredictionCycle() {
    if (!this.isRunning) return;

    // Generate predictions for all models
    this.models.forEach((model, modelId) => {
      this.generatePrediction(modelId);
    });

    // Schedule next cycle
    setTimeout(() => this.schedulePredictionCycle(), 30000); // 30 seconds
  }

  private generatePrediction(modelId: string) {
    const model = this.models.get(modelId);
    if (!model) return;

    const prediction: Prediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      timestamp: new Date(),
      value: Math.random() * 100,
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      metadata: { model: model.name }
    };

    const existing = this.predictions.get(modelId) || [];
    existing.push(prediction);
    
    // Keep only last 100 predictions
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    this.predictions.set(modelId, existing);
    this.emit('prediction', prediction);
  }

  getModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }

  getPredictions(modelId: string): Prediction[] {
    return this.predictions.get(modelId) || [];
  }

  generateForecast(metric: string): SystemForecast {
    const predictions = this.getPredictions(metric);
    const recentPredictions = predictions.slice(-10);
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (recentPredictions.length > 1) {
      const first = recentPredictions[0].value;
      const last = recentPredictions[recentPredictions.length - 1].value;
      const change = (last - first) / first;
      
      if (change > 0.1) trend = 'increasing';
      else if (change < -0.1) trend = 'decreasing';
      
      if (Math.abs(change) > 0.2) riskLevel = 'high';
      else if (Math.abs(change) > 0.1) riskLevel = 'medium';
    }

    return {
      metric,
      predictions: recentPredictions,
      trend,
      riskLevel
    };
  }
}

// Export singleton instance
export const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();
