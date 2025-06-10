
import { DeviceAdapterModule } from '../ui/DeviceAdapterModule';
import { UIAdapterModule } from '../ui/UIAdapterModule';
import { uiKernel } from '../context/UIKernelContext';
import { UniversalKernel } from '../UniversalKernel';

/**
 * Interface for Module type
 */
export interface Module {
  id: string;
  name: string;
  version: string;
  initialize: (kernel: UniversalKernel) => boolean;
  destroy?: () => void;
}

/**
 * Interface for device adapter module capabilities
 */
interface DeviceAdapterModuleInterface extends Module {
  getDeviceInfo: () => any;
  getDeviceType: () => string;
  getDeviceCapabilities: () => Record<string, boolean>;
}

/**
 * Interface for UI adapter module capabilities
 */
interface UIAdapterModuleInterface extends Module {
  setTheme: (theme: any) => void;
  getTheme: () => string;
  enableCognitiveUI: () => void;
  disableCognitiveUI: () => void;
}

/**
 * Registers core modules with the UI Kernel
 */
export function registerCoreModules() {
  // Register device adapter
  const deviceAdapter = new DeviceAdapterModule(uiKernel);
  
  // Create a module object that implements the expected interface
  const deviceAdapterModule: DeviceAdapterModuleInterface = {
    id: 'device-adapter',
    name: 'Device Adapter',
    version: '1.0.0',
    initialize: (kernel: UniversalKernel) => {
      console.log('Device adapter initialized');
      return true;
    },
    getDeviceInfo: () => deviceAdapter.getDeviceInfo(),
    getDeviceType: () => deviceAdapter.getDeviceType(),
    getDeviceCapabilities: () => deviceAdapter.getDeviceCapabilities(),
  };
  
  uiKernel.registerModule('device-adapter', deviceAdapterModule);

  // Register UI adapter
  const uiAdapter = new UIAdapterModule(uiKernel);
  
  // Create a module object that implements the expected interface
  const uiAdapterModule: UIAdapterModuleInterface = {
    id: 'ui-adapter',
    name: 'UI Adapter',
    version: '1.0.0',
    initialize: (kernel: UniversalKernel) => {
      console.log('UI adapter initialized');
      return true;
    },
    setTheme: (theme) => uiAdapter.setTheme(theme),
    getTheme: () => uiAdapter.getTheme(),
    enableCognitiveUI: () => uiAdapter.enableCognitiveUI(),
    disableCognitiveUI: () => uiAdapter.disableCognitiveUI(),
  };
  
  uiKernel.registerModule('ui-adapter', uiAdapterModule);

  return {
    deviceAdapter,
    uiAdapter
  };
}

// Auto-initialize modules
export const coreModules = registerCoreModules();
