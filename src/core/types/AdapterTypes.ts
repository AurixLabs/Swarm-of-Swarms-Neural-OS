
import { 
  UploadOptions, 
  UploadResult, 
  DownloadResult, 
  ListResult, 
  DeleteResult, 
  UrlOptions 
} from './DataProviderTypes';

/**
 * Interface for function adapter implementations
 */
export interface FunctionAdapter {
  id: string;
  execute(args?: any): Promise<any>;
  supports(functionId: string): boolean;
}

/**
 * Interface for storage adapter implementations
 */
export interface StorageAdapter {
  id: string;
  uploadFile(bucket: string, path: string, file: File | Blob, options?: UploadOptions): Promise<UploadResult>;
  downloadFile(bucket: string, path: string): Promise<DownloadResult>;
  getFileUrl(bucket: string, path: string, options?: UrlOptions): Promise<string>;
  deleteFile(bucket: string, path: string): Promise<DeleteResult>;
  listFiles(bucket: string, prefix?: string): Promise<ListResult>;
}

/**
 * Interface for database adapter implementations
 */
export interface DatabaseAdapter {
  id: string;
  query<T>(collection: string, options?: any): Promise<{ data: T[]; error: Error | null }>;
  insert<T>(collection: string, data: any): Promise<{ data: T[]; error: Error | null }>;
  update<T>(collection: string, id: string, data: any): Promise<{ data: T; error: Error | null }>;
  delete(collection: string, id: string): Promise<{ success: boolean; error: Error | null }>;
}
