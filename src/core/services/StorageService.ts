import { adapterRegistry } from '../adapters/AdapterRegistry';
import {
  UploadOptions,
  UploadResult,
  DownloadResult,
  ListResult,
  DeleteResult,
  UrlOptions
} from '../types/DataProviderTypes';

/**
 * Universal storage service that uses the registered adapters
 */
class StorageServiceImpl {
  /**
   * Upload a file using the active storage provider
   */
  async uploadFile(bucket: string, path: string, file: File | Blob, options?: UploadOptions): Promise<UploadResult> {
    const adapter = adapterRegistry.getStorage();
    if (!adapter) {
      return {
        path: '',
        error: new Error('No storage adapter registered')
      };
    }
    
    return adapter.uploadFile(bucket, path, file, options);
  }
  
  /**
   * Download a file using the active storage provider
   */
  async downloadFile(bucket: string, path: string): Promise<DownloadResult> {
    const adapter = adapterRegistry.getStorage();
    if (!adapter) {
      return {
        data: new Blob(),
        error: new Error('No storage adapter registered')
      };
    }
    
    return adapter.downloadFile(bucket, path);
  }
  
  /**
   * Get a file URL using the active storage provider
   */
  async getFileUrl(bucket: string, path: string, options?: UrlOptions): Promise<string> {
    const adapter = adapterRegistry.getStorage();
    if (!adapter) {
      throw new Error('No storage adapter registered');
    }
    
    return adapter.getFileUrl(bucket, path, options);
  }
  
  /**
   * Delete a file using the active storage provider
   */
  async deleteFile(bucket: string, path: string): Promise<DeleteResult> {
    const adapter = adapterRegistry.getStorage();
    if (!adapter) {
      return {
        success: false,
        error: new Error('No storage adapter registered')
      };
    }
    
    return adapter.deleteFile(bucket, path);
  }
  
  /**
   * List files using the active storage provider
   */
  async listFiles(bucket: string, prefix?: string): Promise<ListResult> {
    const adapter = adapterRegistry.getStorage();
    if (!adapter) {
      return {
        files: [],
        error: new Error('No storage adapter registered')
      };
    }
    
    return adapter.listFiles(bucket, prefix);
  }
  
  /**
   * Change the active storage provider
   */
  setStorageProvider(providerId: string): boolean {
    return adapterRegistry.setActiveStorage(providerId);
  }
  
  /**
   * Get the currently active storage provider ID
   */
  getCurrentStorageProvider(): string | null {
    const adapter = adapterRegistry.getStorage();
    return adapter?.id || null;
  }
  
  /**
   * Get all available storage providers
   */
  getAvailableStorageProviders(): string[] {
    return adapterRegistry.getAllStorageAdapters().map(adapter => adapter.id);
  }
}

// Create singleton instance
export const storageService = new StorageServiceImpl();
export default storageService;
