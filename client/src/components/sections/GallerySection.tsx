import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { SectionProps } from '../../types';

function getThumbnailUrl(fullUrl: string): string {
  if (fullUrl.includes('/full.')) {
    return fullUrl.replace('/full.', '/thumb.');
  }
  return fullUrl;
}

function getFullUrl(thumbUrl: string): string {
  if (thumbUrl.includes('/thumb.')) {
    return thumbUrl.replace('/thumb.', '/full.');
  }
  // unsplash: bump width for lightbox
  return thumbUrl.replace(/([?&])w=\d+/, '$1w=1600');
}

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goPrev = useCallback(() => onPrev(), [onPrev]);
  const goNext = useCallback(() => onNext(), [onNext]);
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, goPrev, goNext]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Preload adjacent
  useEffect(() => {
    const adj = [images[(index - 1 + images.length) % images.length], images[(index + 1) % images.length]];
    adj.forEach((src) => {
      const img = new Image();
      img.src = getFullUrl(src);
    });
  }, [index, images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const current = getFullUrl(images[index]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={close}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh ${index + 1} trên ${images.length}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); close(); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white text-2xl w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Đóng"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            data-testid="lightbox-prev"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white text-2xl w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Ảnh trước"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            data-testid="lightbox-next"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white text-2xl w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Ảnh tiếp theo"
          >
            ›
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={current}
          alt={`Ảnh ${index + 1}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="max-w-full max-h-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
          {index + 1} / {images.length}
        </div>
      )}
    </motion.div>
  );
}

export default function GallerySection({ config, invitation }: SectionProps) {
  const columns = Number(config.columns) || 3;
  const lightbox = config.lightbox !== false;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const configImages = Array.isArray(config.images) && config.images.length > 0 ? config.images : null;
  const images = configImages
    || (invitation.gallery.length > 0 ? invitation.gallery : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600',
        'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600',
        'https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=600',
      ]);

  const remainder = images.length % columns;
  const hasIncompleteRow = remainder > 0 && remainder < columns;

  const colClass = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';
  const justifyClass = hasIncompleteRow ? 'place-content-center' : '';

  const close = useCallback(() => setSelectedIndex(null), []);
  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  return (
    <section className="py-12 md:py-24 px-3 md:px-4 bg-white">
      <div className="w-full mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-4xl text-center mb-6 md:mb-12"
        >
          Kho Ảnh
        </motion.h2>

        <div className={`grid ${colClass} gap-3 ${justifyClass}`}>
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer"
              onClick={() => lightbox && setSelectedIndex(i)}
              data-testid={`gallery-thumb-${i}`}
            >
              <img
                src={getThumbnailUrl(src)}
                alt={`Ảnh ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            images={images}
            index={selectedIndex}
            onClose={close}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
