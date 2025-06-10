
export interface RouteStatus {
  path: string;
  component: string;
  status: 'working' | 'missing' | 'error';
  issues?: string[];
}

export interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'error';
  dependencies: string[];
  loadTime?: number;
}

export interface WasmModuleStatus {
  id: string;
  name: string;
  wasmFile: string;
  jsFile: string;
  status: 'loading' | 'loaded' | 'failed' | 'missing';
  error?: string;
}

export interface SystemError {
  component: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface SystemHealthData {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  routes: RouteStatus[];
  components: ComponentStatus[];
  wasmModules: WasmModuleStatus[];
  errors: SystemError[];
}
