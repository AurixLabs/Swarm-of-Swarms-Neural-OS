import { StorageAdapter } from '../adapters/StorageAdapter';
import { BrowserStorageAdapter, browserStorageAdapter } from '../adapters/browser/BrowserStorageAdapter';

/**
 * Service for managing sovereign data with encryption
 */
export class SovereignDataService {
  private storageAdapter: StorageAdapter;
  private encryptionEnabled: boolean = false;
  
  constructor(adapter: StorageAdapter = browserStorageAdapter) {
    this.storageAdapter = adapter;
  }
  
  /**
   * Store data in the sovereign storage
   */
  async storeData<T>(collection: string, id: string, data: T): Promise<boolean> {
    try {
      const key = `${collection}:${id}`;
      const storedData = this.encryptionEnabled ? this.encryptData(data) : data;
      return await this.storageAdapter.set(key, storedData);
    } catch (error) {
      console.error('Error storing sovereign data:', error);
      return false;
    }
  }
  
  /**
   * Retrieve data from sovereign storage
   */
  async retrieveData<T>(collection: string, id: string): Promise<T | null> {
    try {
      const key = `${collection}:${id}`;
      const data = await this.storageAdapter.get<T>(key);
      
      if (!data) {
        return null;
      }
      
      return this.encryptionEnabled ? this.decryptData(data) : data;
    } catch (error) {
      console.error('Error retrieving sovereign data:', error);
      return null;
    }
  }
  
  /**
   * List all items in a collection
   */
  async listCollection<T>(collection: string): Promise<T[]> {
    try {
      const allKeys = await this.storageAdapter.keys();
      const collectionKeys = allKeys.filter(key => key.startsWith(`${collection}:`));
      
      const results: T[] = [];
      
      for (const key of collectionKeys) {
        const data = await this.storageAdapter.get<T>(key);
        if (data) {
          results.push(this.encryptionEnabled ? this.decryptData(data) : data);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error listing collection:', error);
      return [];
    }
  }
  
  /**
   * Delete an item from sovereign storage
   */
  async deleteData(collection: string, id: string): Promise<boolean> {
    try {
      const key = `${collection}:${id}`;
      return await this.storageAdapter.remove(key);
    } catch (error) {
      console.error('Error deleting sovereign data:', error);
      return false;
    }
  }
  
  /**
   * Clear an entire collection
   */
  async clearCollection(collection: string): Promise<boolean> {
    try {
      const allKeys = await this.storageAdapter.keys();
      const collectionKeys = allKeys.filter(key => key.startsWith(`${collection}:`));
      
      for (const key of collectionKeys) {
        await this.storageAdapter.remove(key);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing collection:', error);
      return false;
    }
  }
  
  /**
   * Enable or disable encryption
   */
  setEncryption(enabled: boolean): void {
    this.encryptionEnabled = enabled;
  }
  
  /**
   * Encrypt data before storage (placeholder implementation)
   */
  private encryptData<T>(data: T): T {
    // In a real implementation, this would use a proper encryption library
    return data;
  }
  
  /**
   * Decrypt data after retrieval (placeholder implementation)
   */
  private decryptData<T>(data: T): T {
    // In a real implementation, this would use a proper decryption library
    return data;
  }

  /**
   * Export all data for device sync
   */
  async exportData(): Promise<string> {
    try {
      const collections = await this.listCollections();
      const exportData: Record<string, any[]> = {};
      
      for (const collection of collections) {
        const data = await this.listCollection(collection);
        if (data.length > 0) {
          exportData[collection] = data;
        }
      }
      
      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '{}';
    }
  }
  
  /**
   * Import data from device sync
   */
  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      for (const collection in data) {
        await this.clearCollection(collection);
        
        for (const item of data[collection]) {
          await this.storeData(collection, item.id, item);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * List all available collections
   */
  private async listCollections(): Promise<string[]> {
    try {
      const keys = await this.storageAdapter.keys();
      const collections = new Set<string>();
      
      for (const key of keys) {
        const collection = key.split(':')[0];
        if (collection) {
          collections.add(collection);
        }
      }
      
      return Array.from(collections);
    } catch (error) {
      console.error('Error listing collections:', error);
      return [];
    }
  }
}

export const sovereignDataService = new SovereignDataService();
