import api from './api';

export async function uploadFile(file: File): Promise<{ key: string; publicUrl: string }> {
  const res = await api.post('/upload/presigned-url', {
    fileName: file.name,
    contentType: file.type,
  });

  const { uploadUrl, key, publicUrl } = res.data;

  // Upload the file to the returned URL
  if (uploadUrl.startsWith('/api/')) {
    // Local mode: upload to our server
    const uploadRes = await api.post('/upload/file', file, {
      headers: { 'Content-Type': file.type },
    });
    return { key: uploadRes.data.key, publicUrl: uploadRes.data.publicUrl };
  }

  // S3 mode: upload directly to presigned URL
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return { key, publicUrl };
}
