import { useRef, useState } from 'react';
import { uploadFile } from '../utils/upload';

interface Props {
  currentUrl?: string;
  onUpload: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ currentUrl, onUpload, label = 'Upload Image' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const { publicUrl } = await uploadFile(file);
      onUpload(publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
        ) : (
          <p className="text-gray-400 text-sm">Click to upload</p>
        )}
        {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
