import { useMutation } from '@tanstack/react-query';
import { uploadFile, uploadFiles, type UploadResult } from '../utils/upload';

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => {
      return uploadFile(file, onProgress);
    },
  });
}

export function useUploadFiles() {
  return useMutation({
    mutationFn: async ({ files, onProgress }: { files: File[]; onProgress?: (index: number, progress: number) => void }) => {
      return uploadFiles(files, onProgress);
    },
  });
}
