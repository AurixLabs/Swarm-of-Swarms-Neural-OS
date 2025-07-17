
/**
 * Application Configuration
 * Centralized configuration for the GoodyMorgan application
 * 
 * SECURITY NOTE: No secrets or credentials should be hardcoded here.
 * All sensitive information must come from environment variables.
 */

// Environment variable helpers with strong typing
const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  // Try to get from environment variables first (Vite)
  const envValue = import.meta.env[key];
  if (envValue !== undefined) {
    return String(envValue);
  }
  
  // Then check if there's a saved value in localStorage
  try {
    const savedValue = localStorage.getItem(`config:${key}`);
    if (savedValue !== null) {
      return savedValue;
    }
  } catch (e) {
    console.warn(`Failed to read config value for ${key} from storage:`, e);
  }
  
  // Fall back to default value
  return defaultValue;
};

// Allow saving config values to localStorage
export const saveConfigValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(`config:${key}`, value);
  } catch (e) {
    console.error(`Failed to save config value for ${key}:`, e);
  }
};

// Project reference - can be overridden by env
const SUPABASE_PROJECT_REF = getEnvVariable('VITE_SUPABASE_PROJECT_REF', '');

// Base URLs constructed from the project reference
export const supabaseConfig = {
  projectRef: SUPABASE_PROJECT_REF,
  url: getEnvVariable('VITE_SUPABASE_URL', ''),
  functionsUrl: getEnvVariable('VITE_SUPABASE_FUNCTIONS_URL', ''),
  functionsUrlV1: getEnvVariable('VITE_SUPABASE_FUNCTIONS_URL_V1', ''),
  storageUrl: getEnvVariable('VITE_SUPABASE_STORAGE_URL', ''),
  anonKey: getEnvVariable('VITE_SUPABASE_ANON_KEY', '')
};

// Edge Functions configuration - stored in localStorage or default values
export const loadEdgeFunctions = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('cma-edge-functions');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load edge functions config:', e);
  }
  
  // Default values if none are stored
  return {
    qwenChat: 'qwen-chat',
    qwenAssistant: 'qwen-assistant',
    qwenIntentDetection: 'qwen-intent-detection',
    fileProcessor: 'file-processor',
    bucketSetup: 'bucket-setup'
  };
};

export const edgeFunctions = loadEdgeFunctions();

export const saveEdgeFunctions = (functions: Record<string, string>): void => {
  try {
    localStorage.setItem('cma-edge-functions', JSON.stringify(functions));
    Object.assign(edgeFunctions, functions);
  } catch (e) {
    console.error('Failed to save edge functions config:', e);
  }
};

// AI provider configuration - stored in localStorage or default values
export const loadAIProviders = () => {
  try {
    const saved = localStorage.getItem('cma-ai-providers');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load AI providers config:', e);
  }
  
  // Default values if none are stored
  return {
    // Qwen provider configuration
    qwen: {
      functionName: 'qwen-chat',
      assistantFunctionName: 'qwen-assistant', 
      intentDetectionFunctionName: 'qwen-intent-detection',
      setupRoute: '/agent?setup=qwen',
      models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
      defaultModel: 'qwen-plus',
      modelDescription: {
        'qwen-max': 'Best inference performance (32K tokens)',
        'qwen-plus': 'Balanced performance, speed and cost (131K tokens)',
        'qwen-turbo': 'Fast speed and low cost (1M tokens)'
      }
    }
  };
};

export const aiProviders = loadAIProviders();

export const saveAIProviders = (providers: any): void => {
  try {
    localStorage.setItem('cma-ai-providers', JSON.stringify(providers));
    Object.assign(aiProviders, providers);
  } catch (e) {
    console.error('Failed to save AI providers config:', e);
  }
};

// Project settings
export const projectSettings = {
  vercelProjectId: getEnvVariable('VITE_VERCEL_PROJECT_ID', ''),
  vercelOrgId: getEnvVariable('VITE_VERCEL_ORG_ID', ''),
};

// Storage bucket names - stored in localStorage or default values
export const loadStorageBuckets = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('cma-storage-buckets');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load storage buckets config:', e);
  }
  
  // Default values if none are stored
  return {
    sharedFiles: 'shared-files',
    userUploads: 'user-uploads',
    agentAssets: 'agent-assets',
    listingImages: 'listing-images',
  };
};

export const storageBuckets = loadStorageBuckets();

export const saveStorageBuckets = (buckets: Record<string, string>): void => {
  try {
    localStorage.setItem('cma-storage-buckets', JSON.stringify(buckets));
    Object.assign(storageBuckets, buckets);
  } catch (e) {
    console.error('Failed to save storage buckets config:', e);
  }
};

// App UI constants - stored in localStorage or default values
export const loadUIConstants = () => {
  try {
    const saved = localStorage.getItem('cma-ui-constants');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load UI constants:', e);
  }
  
  // Default values if none are stored
  return {
    // Toast durations
    toastDurations: {
      short: 3000,
      default: 5000,
      long: 8000,
    },
    // Modal sizes
    modalSizes: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
    }
  };
};

export const uiConstants = loadUIConstants();

export const saveUIConstants = (constants: any): void => {
  try {
    localStorage.setItem('cma-ui-constants', JSON.stringify(constants));
    Object.assign(uiConstants, constants);
  } catch (e) {
    console.error('Failed to save UI constants:', e);
  }
};

// Function to build a complete edge function URL
export const getEdgeFunctionUrl = (functionName: string): string => {
  if (!supabaseConfig.functionsUrlV1) {
    console.warn('Supabase functions URL not configured');
    return '';
  }
  return `${supabaseConfig.functionsUrlV1}/${functionName}`;
};

// Export a utility to determine if we're in development mode
export const isDevelopment = import.meta.env.DEV || false;

// Export mechanism to reset all configurations to defaults
export const resetAllConfigurations = (): void => {
  try {
    localStorage.removeItem('cma-edge-functions');
    localStorage.removeItem('cma-ai-providers');
    localStorage.removeItem('cma-storage-buckets');
    localStorage.removeItem('cma-ui-constants');
    
    // Force reload of configurations
    Object.assign(edgeFunctions, loadEdgeFunctions());
    Object.assign(aiProviders, loadAIProviders());
    Object.assign(storageBuckets, loadStorageBuckets());
    Object.assign(uiConstants, loadUIConstants());
  } catch (e) {
    console.error('Failed to reset configurations:', e);
  }
};

// Export default configuration
export default {
  supabase: supabaseConfig,
  edgeFunctions,
  aiProviders,
  projectSettings,
  storageBuckets,
  ui: uiConstants,
  isDevelopment,
  getEnvVariable,
  saveConfigValue,
  resetAllConfigurations
};
