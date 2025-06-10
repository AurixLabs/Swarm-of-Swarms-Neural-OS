
export type CMATier = 'essential' | 'business' | 'research' | 'full';

export const cmaTierConfiguration = {
  getCurrentTier: () => 'essential' as CMATier,
  configureTier: (tier: CMATier) => true,
  getTierFeatures: (tier: CMATier) => ['Feature 1', 'Feature 2'],
  getTierResourceRequirements: (tier: CMATier) => ({ memory: '4GB', cpu: '2 cores' }),
  getRequiredKernelsForTier: (tier: CMATier) => ['system', 'ai', 'memory'],
};
