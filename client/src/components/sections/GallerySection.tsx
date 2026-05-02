import { motion } from 'framer-motion';
import { useState } from 'react';
import type { SectionProps } from '../../types';

export default function GallerySection({ config, invitation }: SectionProps) {
  const { columns = 3, lightbox = true } = config;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = invitation.gallery.length > 0
    ? invitation.gallery
    : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        'https://images.unsplash.com/photo-1522673607200-1645062cd958?w=600',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
        'https://images.unsplash.com/photo-1465491157235-3e934b5b6b3a?w=600',
        'https://images.unsplash.com/photo-1606800052052-a08af7148774?w=600',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
      ];

  const colClass = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl text-center mb-12"
        >
          Kho Ảnh
        </motion.h2>

        <div className={`grid ${colClass} gap-3`}>
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
                src={src}
                alt={`Ảnh ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
