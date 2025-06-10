
import { adapterRegistry } from '../adapters/AdapterRegistry';
import {
  QueryOptions,
  QueryResult,
  InsertResult,
  UpdateResult,
  DeleteResult
} from '../types/DataProviderTypes';

/**
 * Universal data service that uses the registered adapters
 * This provides a consistent API regardless of the underlying technology
 */
class DataServiceImpl {
  /**
   * Query data from the active database provider
   */
  async query<T>(collection: string, options?: QueryOptions): Promise<QueryResult<T>> {
    const adapter = adapterRegistry.getDatabase();
    if (!adapter) {
      return {
        data: [],
        error: new Error('No database adapter registered')
      };
    }
    
    return adapter.query<T>(collection, options);
  }
  
  /**
   * Insert data using the active database provider
   */
  async insert<T>(collection: string, data: Record<string, any> | Array<Record<string, any>>): Promise<InsertResult<T>> {
    const adapter = adapterRegistry.getDatabase();
    if (!adapter) {
      return {
        data: [],
        error: new Error('No database adapter registered')
      };
    }
    
    return adapter.insert<T>(collection, data);
  }
  
  /**
   * Update data using the active database provider
   */
  async update<T>(collection: string, id: string, data: Record<string, any>): Promise<UpdateResult<T>> {
    const adapter = adapterRegistry.getDatabase();
    if (!adapter) {
      return {
        data: {} as T,
        error: new Error('No database adapter registered')
      };
    }
    
    return adapter.update<T>(collection, id, data);
  }
  
  /**
   * Delete data using the active database provider
   */
  async delete(collection: string, id: string): Promise<DeleteResult> {
    const adapter = adapterRegistry.getDatabase();
    if (!adapter) {
      return {
        success: false,
        error: new Error('No database adapter registered')
      };
    }
    
    return adapter.delete(collection, id);
  }
  
  /**
   * Get all available collections
   */
  async getCollections(): Promise<string[]> {
    const adapter = adapterRegistry.getDatabase();
    if (!adapter) {
      return [];
    }
    
    return adapter.getCollections();
  }
  
  /**
   * Change the active database provider
   */
  setDatabaseProvider(providerId: string): boolean {
    return adapterRegistry.setActiveDatabase(providerId);
  }
  
  /**
   * Get the currently active database provider ID
   */
  getCurrentDatabaseProvider(): string | null {
    const adapter = adapterRegistry.getDatabase();
    return adapter?.id || null;
  }
  
  /**
   * Get all available database providers
   */
  getAvailableDatabaseProviders(): string[] {
    return adapterRegistry.getAllDatabaseAdapters().map(adapter => adapter.id);
  }
}

// Create singleton instance
export const dataService = new DataServiceImpl();
export default dataService;
