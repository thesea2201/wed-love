import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';
import { MapPin } from '../Icons';

// Default embed URL for Chùa Đức Hòa (can be customized via invitation.mapUrl)
const DEFAULT_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d34484.50366702133!2d106.8060391!3d10.9049263!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d99a5a2b8393%3A0x72144181f4806542!2zQ2jDuWEgxJDhu6ljIEjDsmE!5e1!3m2!1sen!2s!4v1777858702423!5m2!1sen!2s';

export default function MapSection({ config, invitation }: SectionProps) {
  const venue = invitation.venue || '';
  const address = invitation.venueAddress || '';
  const embedUrl = config.embedUrl || invitation.mapUrl || DEFAULT_EMBED_URL;

  return (
    <section className="py-12 md:py-24 px-3 md:px-4 bg-secondary">
      <div className="w-full mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-4xl text-center mb-6 md:mb-12"
        >
          Bản Đồ & Chỉ Đường
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ địa điểm"
              ></iframe>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{venue}</p>
                  <p className="text-sm text-gray-500">{address}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
