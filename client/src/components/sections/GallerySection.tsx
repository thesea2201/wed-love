import { motion } from 'framer-motion';
import { useState } from 'react';
import type { SectionProps } from '../../types';

function getThumbnailUrl(fullUrl: string): string {
  // Our upload system stores images as .../full.webp and .../thumb.webp
  if (fullUrl.includes('/full.')) {
    return fullUrl.replace('/full.', '/thumb.');
  }
  return fullUrl;
}

export default function GallerySection({ config, invitation }: SectionProps) {
  const columns = Number(config.columns) || 3;
  const lightbox = config.lightbox !== false;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  // Calculate remainder for alignment adjustment
  const remainder = images.length % columns;
  const hasIncompleteRow = remainder > 0 && remainder < columns;

  const colClass = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';
  const justifyClass = hasIncompleteRow ? 'place-content-center' : '';

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
              onClick={() => lightbox && setSelectedImage(src)}
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

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.replace('w=600', 'w=1200')}
            alt="Ảnh phóng to"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
