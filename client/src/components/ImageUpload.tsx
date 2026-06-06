import { useRef, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../utils/upload';
import MediaLibraryModal from './MediaLibraryModal';

interface Props {
  currentUrl?: string;
  gallery?: string[];
  onUpload: (url: string) => void;
  onAddToGallery?: (urls: string[]) => void;
  label?: string;
}

export default function ImageUpload({ currentUrl, gallery = [], onUpload, onAddToGallery, label = 'Upload Image' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setProgress(0);

    try {
      const { publicUrl } = await uploadFile(file, (p) => setProgress(p));
      setPreview(publicUrl);
      onUpload(publicUrl);
      if (onAddToGallery) onAddToGallery([publicUrl]);
    } catch (err: any) {
      // Show error to user - you might want to integrate with a toast/notification system
      alert(`Upload failed: ${err.message}`);
      console.error('Upload failed:', err);
    }

    setUploading(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) handleFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSelectFromGallery = (url: string) => {
    setPreview(url);
    onUpload(url);
    setShowModal(false);
  };

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      <div
        {...getRootProps()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
        ) : (
          <p className="text-gray-400 text-sm">Kéo thả hoặc click để tải ảnh</p>
        )}
        {uploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        {...getInputProps()}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <button
        onClick={() => setShowModal(true)}
        className="mt-2 text-sm text-primary hover:underline"
      >
        {gallery.length > 0 ? 'Hoặc chọn từ thư viện' : 'Mở thư viện ảnh'}
      </button>

      {showModal && (
        <MediaLibraryModal
          gallery={gallery}
          onSelect={handleSelectFromGallery}
          onClose={() => setShowModal(false)}
          onUploadComplete={onAddToGallery}
        />
      )}
    </div>
  );
}
