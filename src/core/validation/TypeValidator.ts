
/**
 * TypeValidator
 * 
 * Runtime type validation system for ensuring data integrity
 * across system boundaries, such as:
 * - Events
 * - API responses
 * - Cross-kernel messages
 * - User input
 */

// Type definitions for the validation system
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type ValidationError = {
  path: string;
  message: string;
  expected?: string;
  received?: string;
};

// Schema types
export type Schema<T = any> = {
  validate: (value: any) => ValidationResult;
  type: string;
};

// Basic type validators
export const string: Schema<string> = {
  type: 'string',
  validate: (value: any) => {
    if (typeof value === 'string') {
      return { valid: true, errors: [] };
    }
    return {
      valid: false,
      errors: [{
        path: '',
        message: 'Expected string',
        expected: 'string',
        received: typeof value
      }]
    };
  }
};

export const number: Schema<number> = {
  type: 'number',
  validate: (value: any) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return { valid: true, errors: [] };
    }
    return {
      valid: false,
      errors: [{
        path: '',
        message: 'Expected number',
        expected: 'number',
        received: typeof value
      }]
    };
  }
};

export const boolean: Schema<boolean> = {
  type: 'boolean',
  validate: (value: any) => {
    if (typeof value === 'boolean') {
      return { valid: true, errors: [] };
    }
    return {
      valid: false,
      errors: [{
        path: '',
        message: 'Expected boolean',
        expected: 'boolean',
        received: typeof value
      }]
    };
  }
};

export const any: Schema<any> = {
  type: 'any',
  validate: () => ({ valid: true, errors: [] })
};

// Complex type validators
export function array<T>(itemSchema: Schema<T>): Schema<T[]> {
  return {
    type: `array<${itemSchema.type}>`,
    validate: (value: any) => {
      if (!Array.isArray(value)) {
        return {
          valid: false,
          errors: [{
            path: '',
            message: 'Expected array',
            expected: 'array',
            received: typeof value
          }]
        };
      }
      
      const errors: ValidationError[] = [];
      
      for (let i = 0; i < value.length; i++) {
        const result = itemSchema.validate(value[i]);
        if (!result.valid) {
          errors.push(
            ...result.errors.map(error => ({
              ...error,
              path: `[${i}]${error.path ? '.' + error.path : ''}`
            }))
          );
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}

export function object<T extends Record<string, Schema>>(shape: T): Schema<{ [K in keyof T]: any }> {
  const shapeEntries = Object.entries(shape);
  
  return {
    type: 'object',
    validate: (value: any) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {
          valid: false,
          errors: [{
            path: '',
            message: 'Expected object',
            expected: 'object',
            received: Array.isArray(value) ? 'array' : typeof value
          }]
        };
      }
      
      const errors: ValidationError[] = [];
      
      for (const [key, schema] of shapeEntries) {
        const propertyValue = value[key];
        
        // If property is undefined but required
        if (propertyValue === undefined) {
          errors.push({
            path: key,
            message: `Required property ${key} is missing`
          });
          continue;
        }
        
        const result = schema.validate(propertyValue);
        if (!result.valid) {
          errors.push(
            ...result.errors.map(error => ({
              ...error,
              path: `${key}${error.path ? '.' + error.path : ''}`
            }))
          );
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}

export function optional<T>(schema: Schema<T>): Schema<T | undefined> {
  return {
    type: `optional<${schema.type}>`,
    validate: (value: any) => {
      if (value === undefined) {
        return { valid: true, errors: [] };
      }
      return schema.validate(value);
    }
  };
}

export function union<T extends Schema[]>(schemas: T): Schema<any> {
  const types = schemas.map(s => s.type).join('|');
  
  return {
    type: `union<${types}>`,
    validate: (value: any) => {
      for (const schema of schemas) {
        const result = schema.validate(value);
        if (result.valid) {
          return result;
        }
      }
      
      return {
        valid: false,
        errors: [{
          path: '',
          message: `Value did not match any schema in union: ${types}`,
          expected: types,
          received: typeof value
        }]
      };
    }
  };
}

export function literal<T extends string | number | boolean>(expectedValue: T): Schema<T> {
  return {
    type: `literal<${expectedValue}>`,
    validate: (value: any) => {
      if (value === expectedValue) {
        return { valid: true, errors: [] };
      }
      return {
        valid: false,
        errors: [{
          path: '',
          message: `Expected literal value ${expectedValue}`,
          expected: String(expectedValue),
          received: String(value)
        }]
      };
    }
  };
}

export function record<V>(valueSchema: Schema<V>): Schema<Record<string, V>> {
  return {
    type: `record<${valueSchema.type}>`,
    validate: (value: any) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {
          valid: false,
          errors: [{
            path: '',
            message: 'Expected object record',
            expected: 'object',
            received: Array.isArray(value) ? 'array' : typeof value
          }]
        };
      }
      
      const errors: ValidationError[] = [];
      
      for (const key of Object.keys(value)) {
        const result = valueSchema.validate(value[key]);
        if (!result.valid) {
          errors.push(
            ...result.errors.map(error => ({
              ...error,
              path: `${key}${error.path ? '.' + error.path : ''}`
            }))
          );
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}

// Main validator utility functions
export function validate<T>(value: any, schema: Schema<T>): ValidationResult {
  return schema.validate(value);
}

export function assert<T>(value: any, schema: Schema<T>, errorPrefix = ''): T {
  const result = schema.validate(value);
  if (!result.valid) {
    const message = result.errors
      .map(e => `${e.path ? `${e.path}: ` : ''}${e.message}`)
      .join('\n');
    
    throw new Error(`${errorPrefix ? `${errorPrefix}: ` : ''}Validation failed:\n${message}`);
  }
  return value as T;
}

// Create a typed validator for specific use cases
export function createValidator<T>(schema: Schema<T>, errorPrefix = '') {
  return {
    validate: (value: any): ValidationResult => schema.validate(value),
    assert: (value: any): T => assert(value, schema, errorPrefix)
  };
}
