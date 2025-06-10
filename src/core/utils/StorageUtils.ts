
/**
 * Get data center location based on country code
 * @param countryCode ISO 2-letter country code
 */
export function getDataCenterForCountry(countryCode: string): string {
  const regions: Record<string, string> = {
    'US': 'us-east-1',
    'CA': 'ca-central-1',
    'GB': 'eu-west-2',
    'DE': 'eu-central-1',
    'FR': 'eu-west-3',
    'JP': 'ap-northeast-1',
    'AU': 'ap-southeast-2',
    'SG': 'ap-southeast-1',
    'BR': 'sa-east-1',
    'IN': 'ap-south-1',
  };
  
  return regions[countryCode] || 'us-east-1'; // Default to US East
}

/**
 * Format storage size for display
 * @param bytes Size in bytes
 */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

/**
 * Parse storage size string to bytes
 * @param sizeStr Size string like "10 MB"
 */
export function parseStorageSize(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
  if (!match) return 0;
  
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1048576,
    'GB': 1073741824,
    'TB': 1099511627776
  };
  
  return num * (multipliers[unit] || 1);
}

/**
 * Class to manage storage in multiple regions
 */
export class MultiRegionClientManager {
  /**
   * Get data center for specific country
   */
  getDataCenterForCountry(countryCode: string): string {
    return getDataCenterForCountry(countryCode);
  }
}
