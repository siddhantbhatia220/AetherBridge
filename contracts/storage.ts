export interface IStorageAdapter {
  uploadFile(file: Buffer | Blob, path: string): Promise<{ url: string; key: string }>;
  getFileUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
