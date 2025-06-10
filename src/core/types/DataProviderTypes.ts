
/**
 * Options for file uploads
 */
export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  encryption?: {
    enabled: boolean;
    algorithm?: string;
    keyId?: string;
  };
}

/**
 * Result of a file upload operation
 */
export interface UploadResult {
  path: string;
  metadata?: Record<string, string>;
  error?: Error;
}

/**
 * Result of a file download operation
 */
export interface DownloadResult {
  data: Blob;
  metadata?: Record<string, string>;
  error?: Error;
}

/**
 * Options for generating URLs to files
 */
export interface UrlOptions {
  expiresInSeconds?: number;
  download?: boolean;
  contentDisposition?: string;
  responseType?: string;
}

/**
 * Result of a file listing operation
 */
export interface ListResult {
  files: string[];
  prefixes?: string[];
  error?: Error;
}

/**
 * Result of a file deletion operation
 */
export interface DeleteResult {
  success: boolean;
  error: Error | null;
}

/**
 * Query options for database operations
 */
export interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
  select?: string[];
  filter?: ((item: any) => boolean) | Record<string, any>;
  sort?: (a: any, b: any) => number;
}

/**
 * Result of a database query
 */
export interface QueryResult<T = any> {
  data: T[];
  error: Error | null;
  count?: number;
}

/**
 * Result of an insert operation
 */
export interface InsertResult<T = any> {
  data: T[];
  error: Error | null;
}

/**
 * Result of an update operation
 */
export interface UpdateResult<T = any> {
  data: T;
  error: Error | null;
}

/**
 * Schema for a database collection
 */
export interface CollectionSchema {
  name?: string;
  fields: Record<string, {
    type: string;
    required?: boolean;
    defaultValue?: any;
    validation?: any;
  }>;
  indexes?: string[];
}

/**
 * Transaction context for database operations
 */
export interface TransactionContext {
  id: string;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

/**
 * Database adapter interface
 */
export interface DatabaseAdapter {
  id: string;
  query<T>(collection: string, options?: QueryOptions): Promise<QueryResult<T>>;
  insert<T>(collection: string, data: any): Promise<InsertResult<T>>;
  update<T>(collection: string, id: string, data: any): Promise<UpdateResult<T>>;
  delete(collection: string, id: string): Promise<{ success: boolean; error: Error | null }>;
  transaction(): Promise<TransactionContext>;
  getCollections(): Promise<string[]>;
  getSchema(collection: string): Promise<CollectionSchema>;
}

/**
 * Storage adapter interface
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
 * Authentication adapter interface
 */
export interface AuthAdapter {
  id: string;
  signIn(credentials: {email: string; password: string}): Promise<{user: any; error: Error | null}>;
  signOut(): Promise<{error: Error | null}>;
  getUser(): Promise<{user: any; error: Error | null}>;
  resetPassword(email: string): Promise<{error: Error | null}>;
}

/**
 * Function adapter interface
 */
export interface FunctionAdapter {
  id: string;
  supports(functionId: string): boolean;
  execute(args?: any): Promise<any>;
}
