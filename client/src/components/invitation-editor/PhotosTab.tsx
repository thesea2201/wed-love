import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { uploadFiles, type UploadResult } from '../../utils/upload';
import type { SectionConfig } from '../../types';

interface Props {
  gallery: string[];
  onChange: (gallery: string[]) => void;
  coverPhoto?: string | null;
  sections?: SectionConfig[];
}

function getImageUsage(url: string, coverPhoto?: string | null, sections?: SectionConfig[]): string[] {
  const usage: string[] = [];
  if (coverPhoto === url) usage.push('hero');
  if (sections) {
    for (const s of sections) {
      if (s.type === 'story' && s.config?.imageUrl === url) usage.push('story');
      if (s.type === 'gallery' && Array.isArray(s.config?.images) && s.config.images.includes(url)) usage.push('gallery');
    }
  }
  return usage;
}

const USAGE_ICONS: Record<string, string> = {
  hero: '\u{1F3E0}',
  story: '\u{1F4D6}',
  gallery: '\u{1F5BC}',
};

function SortableImage({ url, index, onRemove, usage }: { url: string; index: number; onRemove: (i: number) => void; usage: string[] }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square rounded-xl overflow-hidden">
      <img src={url} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
      >
        ✕
      </button>
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-2 right-2 w-7 h-7 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        ⋮⋮
      </div>
      {usage.length > 0 && (
        <div className="absolute bottom-2 left-2 flex gap-0.5">
          {usage.map((u) => (
            <span key={u} className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-[10px]" title={u}>
              {USAGE_ICONS[u] || u}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotosTab({ gallery, onChange, coverPhoto, sections }: Props) {
  const [uploads, setUploads] = useState<{ file: File; progress: number; result?: UploadResult; error?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map((file) => ({ file, progress: 0 }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    noClick: true,
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
          const idx = updated.findIndex((u) => u.file === files[index] && !u.result && !u.error);
          if (idx !== -1) updated[idx] = { ...updated[idx], progress };
          return updated;
        });
      });

      // Add new URLs to gallery
      const newUrls = results.map((r) => r.publicUrl);
      onChange([...gallery, ...newUrls]);

      // Mark as done
      setUploads((prev) =>
        prev.map((u) => {
          const idx = pending.findIndex((p) => p.file === u.file);
          if (idx !== -1) return { ...u, progress: 100, result: results[idx] };
          return u;
        })
      );
    } catch (err) {
      setUploads((prev) =>
        prev.map((u) => {
          if (pending.find((p) => p.file === u.file)) return { ...u, error: 'Upload failed' };
          return u;
        })
      );
    }

    setIsUploading(false);
  };

  const handleRemove = (index: number) => {
    const url = gallery[index];
    const usage = getImageUsage(url, coverPhoto, sections);
    if (usage.length > 0) {
      const names = usage.map((u) => u === 'hero' ? 'Hero' : u === 'story' ? 'Story' : 'Gallery').join(', ');
      if (!window.confirm(`\u1ea2nh n\u00e0y \u0111ang \u0111\u01b0\u1ee3c d\u00f9ng \u1edf: ${names}. X\u00f3a s\u1ebd b\u1ecf \u1ea3nh kh\u1ecfi c\u00e1c section \u0111\u00f3. Ti\u1ebfp t\u1ee5c?`)) return;
    }
    const updated = [...gallery];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = gallery.indexOf(active.id as string);
      const newIndex = gallery.indexOf(over.id as string);
      onChange(arrayMove(gallery, oldIndex, newIndex));
    }
  };

  const pendingCount = uploads.filter((u) => !u.result && !u.error).length;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Tải ảnh lên</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo thả ảnh vào đây'}
          </p>
          <button
            onClick={open}
            className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
          >
            Hoặc chọn từ máy tính
          </button>
          <p className="text-xs text-gray-400 mt-2">Tối đa 2MB mỗi ảnh</p>
        </div>

        {/* Pending uploads */}
        {uploads.length > 0 && (
          <div className="mt-4 space-y-3">
            {uploads.map((u, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                  <img src={URL.createObjectURL(u.file)} alt="" className="w-full h-full object-cover" />
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
              </div>
            ))}

            {pendingCount > 0 && (
              <button
                onClick={handleUploadAll}
                disabled={isUploading}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isUploading ? 'Đang tải lên...' : `Tải lên ${pendingCount} ảnh`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Thư viện ảnh ({gallery.length})</h3>
          {gallery.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {gallery.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Chưa có ảnh nào trong thư viện</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={gallery} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((url, i) => (
                  <SortableImage key={url} url={url} index={i} onRemove={handleRemove} usage={getImageUsage(url, coverPhoto, sections)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
