import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { uploadFiles, type UploadResult } from '../utils/upload';

interface Props {
  gallery: string[];
  onSelect: (url: string) => void;
  onClose: () => void;
  onUploadComplete?: (newUrls: string[]) => void;
  multiple?: boolean;
  selectedUrls?: string[];
  onSelectMultiple?: (urls: string[]) => void;
}

export default function MediaLibraryModal({ gallery, onSelect, onClose, onUploadComplete, multiple, selectedUrls = [], onSelectMultiple }: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>(gallery.length > 0 ? 'library' : 'upload');
  const [selected, setSelected] = useState<string[]>(selectedUrls);
  const [uploads, setUploads] = useState<{ file: File; progress: number; result?: UploadResult; error?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map((file) => ({ file, progress: 0 }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const handleUploadAll = async () => {
    const pending = uploads.filter((u) => !u.result && !u.error);
    if (pending.length === 0) return;

    setIsUploading(true);
    const files = pending.map((u) => u.file);

    try {
      const results = await uploadFiles(files, (index, progress) => {
        setUploads((prev) => {
          const updated = [...prev];
          const pendingIndex = prev.findIndex((u) => u.file === files[index]);
          if (pendingIndex !== -1) {
            updated[pendingIndex] = { ...updated[pendingIndex], progress };
          }
          return updated;
        });
      });

      const newUrls = results.map((r) => r.publicUrl);
      if (onUploadComplete) {
        onUploadComplete(newUrls);
      }

      setUploads((prev) =>
        prev.map((u) => {
          if (pending.find((p) => p.file === u.file)) {
            const idx = pending.findIndex((p) => p.file === u.file);
            return { ...u, progress: 100, result: results[idx] };
          }
          return u;
        })
      );
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Upload failed';
      setUploads((prev) =>
        prev.map((u) => {
          if (pending.find((p) => p.file === u.file)) {
            return { ...u, error: message };
          }
          return u;
        })
      );
    }

    setIsUploading(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-[768px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Thư viện ảnh</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-500'
            }`}
          >
            Tải ảnh mới
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-gray-500'
            }`}
          >
            Thư viện ({gallery.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-4xl mb-2">📁</div>
                <p className="text-sm text-gray-600">
                  {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo thả ảnh vào đây, hoặc click để chọn'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Tối đa 2MB mỗi ảnh</p>
              </div>

              {/* Upload list */}
              {uploads.length > 0 && (
                <div className="space-y-3">
                  {uploads.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img
                          src={URL.createObjectURL(u.file)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{u.file.name}</p>
                        {u.error ? (
                          <p className="text-xs text-red-500">{u.error}</p>
                        ) : u.result ? (
                          <p className="text-xs text-green-600">✓ Hoàn thành</p>
                        ) : (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${u.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {u.result && (
                        <button
                          onClick={() => onSelect(u.result!.publicUrl)}
                          className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg"
                        >
                          Chọn
                        </button>
                      )}
                    </div>
                  ))}

                  {uploads.some((u) => !u.result && !u.error) && (
                    <button
                      onClick={handleUploadAll}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isUploading ? 'Đang tải lên...' : `Tải lên ${uploads.filter((u) => !u.result && !u.error).length} ảnh`}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.length === 0 ? (
                  <p className="col-span-full text-center text-gray-400 py-8">Chưa có ảnh nào</p>
                ) : (
                  gallery.map((url, i) => {
                    const isSelected = multiple ? selected.includes(url) : false;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (multiple) {
                            setSelected((prev) =>
                              prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
                            );
                          } else {
                            onSelect(url);
                          }
                        }}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors relative ${
                          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary'
                        }`}
                      >
                        <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              {multiple && selected.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đã chọn {selected.length} ảnh</span>
                  <button
                    onClick={() => {
                      if (onSelectMultiple) onSelectMultiple(selected);
                      onClose();
                    }}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
                  >
                    Xác nhận
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
