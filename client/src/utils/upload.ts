import api from './api';

export interface UploadResult {
  key: string;
  publicUrl: string;
  thumbnailUrl: string;
  size: number;
}

export async function uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return res.data;
}

/**
 * Multi-file upload with REAL per-file progress. Each file is uploaded in
 * parallel to /upload/file (single-file endpoint) so its progress callback
 * reflects only that file's bytes. Results are returned in the same order
 * as `files`. The first rejection rejects the whole promise (same as the
 * single-file API): callers that want partial success should wrap each
 * upload in try/catch themselves.
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (index: number, progress: number) => void
): Promise<UploadResult[]> {
  return Promise.all(
    files.map((file, index) =>
      uploadFile(file, (progress) => {
        onProgress?.(index, progress);
      })
    )
  );
}

