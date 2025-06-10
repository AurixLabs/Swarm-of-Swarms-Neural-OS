
/**
 * LEGACY KERNEL - DEPRECATED
 * Use IndependentModule for all new modules
 */

console.warn('⚠️ Kernel.ts is deprecated. Use IndependentModule base class instead.');

// Re-export for backward compatibility
export { IndependentModule as Kernel } from './IndependentModule';
