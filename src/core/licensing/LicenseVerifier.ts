
import { systemKernel } from '../SystemKernel';
import { LicenseType } from './LicenseTypes';

export interface LicenseStatus {
  isValid: boolean;
  type: LicenseType;
  expiresAt?: Date;
  features: string[];
  commercialUse: boolean;
  errors: string[];
}

export class LicenseVerifier {
  private static instance: LicenseVerifier;
  
  private constructor() {}
  
  public static getInstance(): LicenseVerifier {
    if (!LicenseVerifier.instance) {
      LicenseVerifier.instance = new LicenseVerifier();
    }
    return LicenseVerifier.instance;
  }

  public verifyLicense(licenseKey?: string): LicenseStatus {
    // For development/non-commercial use
    if (!licenseKey) {
      return {
        isValid: true,
        type: 'MIT',
        features: ['development', 'non-commercial'],
        commercialUse: false,
        errors: []
      };
    }

    try {
      // Here you would implement actual license verification
      // For now we'll just validate the format
      if (this.isValidLicenseFormat(licenseKey)) {
        return {
          isValid: true,
          type: 'Custom',
          features: ['development', 'commercial-use', 'cloud-deployment'],
          commercialUse: true,
          errors: []
        };
      }

      return {
        isValid: false,
        type: 'Invalid',
        features: [],
        commercialUse: false,
        errors: ['Invalid license key format']
      };
    } catch (error) {
      return {
        isValid: false,
        type: 'Invalid',
        features: [],
        commercialUse: false,
        errors: ['License verification failed']
      };
    }
  }

  private isValidLicenseFormat(key: string): boolean {
    // Implement actual license key validation
    return /^CMA-\d{4}-\d{4}-\d{4}$/.test(key);
  }

  public checkCommercialUsage(): boolean {
    const status = this.verifyLicense(
      systemKernel.getState<string>('system:licenseKey')
    );
    return status.commercialUse;
  }

  public enforceCommercialLicense(): void {
    const status = this.verifyLicense(
      systemKernel.getState<string>('system:licenseKey')
    );
    
    if (!status.commercialUse) {
      console.warn(
        'Commercial license required for this feature. ' +
        'Please obtain a valid commercial license to continue.'
      );
      throw new Error('Commercial license required');
    }
  }
}

export const licenseVerifier = LicenseVerifier.getInstance();
