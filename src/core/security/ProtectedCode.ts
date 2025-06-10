
import { encryptedModuleProtection } from './EncryptedModuleProtection';
import { securityKernel } from '../SecurityKernel';

/**
 * Protected Code Module
 * 
 * A utility that provides an easy way to create protected code modules that
 * are encrypted at rest and only decrypted when executed. This makes reverse
 * engineering significantly more difficult.
 */
export class ProtectedCode {
  /**
   * Create a protected function that is encrypted at rest
   * 
   * @param moduleId A unique identifier for this protected function
   * @param func The function to protect
   * @returns A wrapper function that decrypts and executes the protected function
   */
  public static createProtectedFunction<T extends (...args: any[]) => any>(
    moduleId: string,
    func: T
  ): T {
    // Register the function in the encrypted module system
    encryptedModuleProtection.registerModule(moduleId, func);
    
    // Return a wrapper function that will decrypt and execute when called
    return ((...args: Parameters<T>): ReturnType<T> => {
      try {
        // Execute the encrypted module with the provided arguments
        return encryptedModuleProtection.executeModule(moduleId, ...args);
      } catch (error) {
        // Report security violation
        securityKernel.reportViolation('potential_reverse_engineering', {
          moduleId,
          message: 'Protected function execution failed',
          error: String(error)
        });
        
        // Rethrow with a generic message to avoid leaking details
        throw new Error('Protected function execution failed');
      }
    }) as T;
  }
  
  /**
   * Create a protected class that is encrypted at rest
   * 
   * @param moduleId A unique identifier for this protected class
   * @param classDefinition The class to protect
   * @returns A wrapper class that decrypts and instantiates the protected class
   */
  public static createProtectedClass<T extends new (...args: any[]) => any>(
    moduleId: string,
    classDefinition: T
  ): T {
    // Register the class in the encrypted module system
    encryptedModuleProtection.registerModule(moduleId, classDefinition);
    
    // Create a wrapper class constructor
    const ProtectedClassWrapper = function(...args: any[]) {
      try {
        // Get the original class constructor
        const OriginalClass = encryptedModuleProtection.executeModule(moduleId);
        
        // Create an instance of the original class
        return new OriginalClass(...args);
      } catch (error) {
        // Report security violation
        securityKernel.reportViolation('potential_reverse_engineering', {
          moduleId,
          message: 'Protected class instantiation failed',
          error: String(error)
        });
        
        // Rethrow with a generic message to avoid leaking details
        throw new Error('Protected class instantiation failed');
      }
    };
    
    // Copy static members from the original class
    try {
      Object.getOwnPropertyNames(classDefinition).forEach(prop => {
        if (prop !== 'prototype' && prop !== 'constructor' && prop !== 'length' && prop !== 'name') {
          try {
            (ProtectedClassWrapper as any)[prop] = (classDefinition as any)[prop];
          } catch (e) {
            // Some properties may not be copiable
          }
        }
      });
    } catch (error) {
      // If static property copying fails, continue anyway
      console.warn('Failed to copy static properties for protected class:', error);
    }
    
    return ProtectedClassWrapper as unknown as T;
  }
  
  /**
   * Create a protected value that is encrypted at rest
   * 
   * @param moduleId A unique identifier for this protected value
   * @param value The value to protect
   * @returns A function that returns the decrypted value when called
   */
  public static createProtectedValue<T>(
    moduleId: string,
    value: T
  ): () => T {
    // Wrap the value in a function that returns it
    const valueFunction = () => value;
    
    // Register the value function in the encrypted module system
    encryptedModuleProtection.registerModule(moduleId, valueFunction);
    
    // Return a wrapper function that will decrypt and return the value
    return () => {
      try {
        // Execute the encrypted module to get the value
        return encryptedModuleProtection.executeModule(moduleId);
      } catch (error) {
        // Report security violation
        securityKernel.reportViolation('potential_reverse_engineering', {
          moduleId,
          message: 'Protected value access failed',
          error: String(error)
        });
        
        // Rethrow with a generic message to avoid leaking details
        throw new Error('Protected value access failed');
      }
    };
  }
  
  /**
   * Create a protected method for a class
   * 
   * @param moduleId A unique identifier for this protected method
   * @param method The method to protect
   * @returns A wrapper method that decrypts and executes the protected method
   */
  public static createProtectedMethod<T extends (this: any, ...args: any[]) => any>(
    moduleId: string,
    method: T
  ): T {
    // Register the method in the encrypted module system
    encryptedModuleProtection.registerModule(moduleId, method);
    
    // Return a wrapper method that will decrypt and execute when called
    return (function(this: any, ...args: Parameters<T>): ReturnType<T> {
      try {
        // Get the context (this) for method execution
        const context = this;
        
        // Get the original method
        const originalMethod = encryptedModuleProtection.executeModule(moduleId);
        
        // Execute the method with the proper context
        return originalMethod.apply(context, args);
      } catch (error) {
        // Report security violation
        securityKernel.reportViolation('potential_reverse_engineering', {
          moduleId,
          message: 'Protected method execution failed',
          error: String(error)
        });
        
        // Rethrow with a generic message to avoid leaking details
        throw new Error('Protected method execution failed');
      }
    }) as unknown as T;
  }
}
