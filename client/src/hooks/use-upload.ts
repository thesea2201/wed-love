import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';

export function usePresignedUrl() {
  return useMutation({
    mutationFn: async ({ fileName, contentType }: { fileName: string; contentType: string }) => {
      const res = await api.post('/upload/presigned-url', { fileName, contentType });
      return res.data;
    },
  });
}

export function useUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
}
