import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';
import { MapPin } from '../Icons';

export default function MapSection({ invitation }: SectionProps) {
  const venue = invitation.venue || '';
  const address = invitation.venueAddress || '';
  const mapUrl = invitation.mapUrl || '';
  const lat = invitation.latitude;
  const lng = invitation.longitude;

  const embedUrl = lat && lng
    ? `https://www.google.com/maps/embed/v1/place?key=&q=${lat},${lng}`
    : mapUrl
      ? mapUrl
      : `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(venue + ' ' + address)}`;

  return (
    <section className="py-24 px-4 bg-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl text-center mb-12"
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
              />
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
