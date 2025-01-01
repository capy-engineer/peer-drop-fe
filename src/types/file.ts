export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  timestamp: number;
}

export interface FileMessage {
  type: 'metadata' | 'chunk';
  id: string;
  name?: string;
  // fileType?: string;
  size?: number;
  chunk?: ArrayBuffer;
  chunkIndex?: number;
  totalChunks?: number;
}