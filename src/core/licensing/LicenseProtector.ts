
import { systemKernel } from '../SystemKernel';
import { licenseVerifier } from './LicenseVerifier';

export class LicenseProtector {
  private static instance: LicenseProtector;
  private commercialFeatures: string[] = [
    'cloud:deploy', 
    'service:scale', 
    'multi-tenant:hosting',
    'enterprise:integration',
    'kernel:advanced-routing'
  ];
  
  private constructor() {}
  
  public static getInstance(): LicenseProtector {
    if (!LicenseProtector.instance) {
      LicenseProtector.instance = new LicenseProtector();
    }
    return LicenseProtector.instance;
  }

  public initialize(): void {
    systemKernel.setState('system:licenseProtection', true);
    this.setupComprehensiveProtection();
  }

  private setupComprehensiveProtection(): void {
    systemKernel.subscribe('kernel:operation', (event) => {
      if (this.isCommercialOperation(event)) {
        this.validateCommercialLicense(event);
      }
    });
  }

  private isCommercialOperation(event: any): boolean {
    return this.commercialFeatures.some(feature => 
      event.type?.toLowerCase().includes(feature)
    );
  }

  private validateCommercialLicense(event: any): void {
    try {
      const licenseStatus = licenseVerifier.verifyLicense(
        systemKernel.getState('system:licenseKey')
      );

      if (!licenseStatus.commercialUse) {
        console.warn(`Commercial feature blocked: ${event.type}`);
        this.logComplianceViolation(event);
        throw new Error('Commercial License Required');
      }
    } catch (error) {
      // Potential future: Add more sophisticated blocking mechanisms
      console.error('License Validation Failed', error);
    }
  }

  private logComplianceViolation(event: any): void {
    // Use events.emitEvent instead of emit
    systemKernel.events.emitEvent({
      type: 'compliance:violation',
      payload: {
        timestamp: new Date(),
        eventType: event.type,
        details: 'Attempted use of commercial feature without valid license'
      }
    });
  }

  public enforceCommercialRestrictions(): void {
    licenseVerifier.enforceCommercialLicense();
  }
}

export const licenseProtector = LicenseProtector.getInstance();
licenseProtector.initialize();
