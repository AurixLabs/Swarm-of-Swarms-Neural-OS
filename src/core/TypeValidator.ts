
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class TypeValidator {
  private typeSchemas: Record<string, any> = {
    SystemMessage: {
      type: 'string',
      payload: 'any',
      timestamp: 'number',
      source: 'string'
    }
  };
  
  public registerSchema(name: string, schema: Record<string, string>): void {
    this.typeSchemas[name] = schema;
  }
  
  public validate<T>(schemaName: string, data: any): ValidationResult<T> {
    const schema = this.typeSchemas[schemaName];
    if (!schema) {
      return {
        success: false,
        error: `Schema '${schemaName}' not found`
      };
    }
    
    try {
      this.validateObject(data, schema);
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private validateObject(data: any, schema: Record<string, string>): void {
    if (typeof data !== 'object' || data === null) {
      throw new Error(`Expected object, got ${typeof data}`);
    }
    
    for (const [key, expectedType] of Object.entries(schema)) {
      if (expectedType !== 'any' && !(key in data)) {
        throw new Error(`Missing required property: ${key}`);
      }
      
      if (expectedType === 'any') {
        continue;
      }
      
      const value = data[key];
      const actualType = typeof value;
      
      if (expectedType === 'array') {
        if (!Array.isArray(value)) {
          throw new Error(`Property '${key}' should be an array`);
        }
      } else if (actualType !== expectedType) {
        throw new Error(`Property '${key}' should be ${expectedType}, got ${actualType}`);
      }
    }
  }
}

export const typeValidator = new TypeValidator();
export default typeValidator;
