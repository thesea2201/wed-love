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

export async function uploadFiles(
  files: File[],
  onProgress?: (index: number, progress: number) => void
): Promise<UploadResult[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await api.post('/upload/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Distribute overall progress across files roughly
        files.forEach((_, i) => onProgress(i, Math.min(progress, 100)));
      }
    },
  });

  return res.data.results;
}
