
import { RegulatoryKernel } from './RegulatoryKernel';

/**
 * Interface for regulatory modules
 */
export interface RegulatingModule {
  /**
   * Initialize the module with a regulatory kernel
   */
  initialize(kernel: RegulatoryKernel): void;
}
