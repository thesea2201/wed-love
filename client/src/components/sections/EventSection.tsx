import { motion } from 'framer-motion';
import type { SectionProps, EventItem } from '../../types';
import { MapPin, Clock } from '../Icons';

// Default events for backward compatibility
const getDefaultEvents = (invitation: SectionProps['invitation']): EventItem[] => {
  const events: EventItem[] = [];

  // Ceremony event
  if (invitation.ceremonyTime || invitation.venue) {
    events.push({
      id: 'ceremony',
      name: 'Lễ Vu Quy',
      time: invitation.ceremonyTime || '09:00',
      venue: invitation.venue || 'Địa điểm sắp công bố',
      address: invitation.venueAddress || '',
      dressCode: 'Áo dài / Vest',
    });
  }

  // Reception event
  if (invitation.receptionTime) {
    events.push({
      id: 'reception',
      name: 'Tiệc Báo Hỷ',
      time: invitation.receptionTime || '18:00',
      venue: invitation.venue || 'Địa điểm sắp công bố',
      address: invitation.venueAddress || 'Cùng địa điểm',
      dressCode: 'Áo dài / Vest',
    });
  }

  return events.length > 0 ? events : [{
    id: 'default',
    name: 'Lễ Cưới',
    time: '09:00',
    venue: invitation.venue || 'Địa điểm sắp công bố',
    address: invitation.venueAddress || '',
    dressCode: 'Áo dài / Vest',
  }];
};

export default function EventSection({ config, invitation }: SectionProps) {
  const { events, showDressCode = true } = config;
  const primaryColor = invitation.primaryColor || '#c8956c';

  // Use configured events or fallback to defaults
  const displayEvents = events && events.length > 0 ? events : getDefaultEvents(invitation);

  return (
    <section className="py-16 md:py-24 px-4 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl text-center mb-8 md:mb-12"
        >
          Chương Trình
        </motion.h2>

        {/* Events Grid - Responsive */}
        <div className={`grid gap-4 md:gap-6 ${
          displayEvents.length === 1 ? 'max-w-xl mx-auto' :
          displayEvents.length === 2 ? 'md:grid-cols-2' :
          'md:grid-cols-3'
        }`}>
          {displayEvents.map((event: EventItem, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-sm h-full"
            >
              <h3 className="font-display text-xl md:text-2xl mb-4" style={{ color: primaryColor }}>
                {event.name}
              </h3>

              <div className="space-y-3 text-gray-600">
                {/* Time */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm md:text-base">{event.time}</span>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <MapPin className="w-4 h-4 mt-0.5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">{event.venue}</p>
                    {event.address && (
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5">{event.address}</p>
                    )}
                  </div>
                </div>

                {/* Map Link */}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm hover:underline mt-2"
                    style={{ color: primaryColor }}
                  >
                    <span>Chỉ đường</span>
                    <span>→</span>
                  </a>
                )}
              </div>

              {/* Dress Code per event */}
              {showDressCode && event.dressCode && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs md:text-sm text-gray-500">
                    Trang phục: <span className="font-medium text-gray-700">{event.dressCode}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Global dress code if no per-event dress code */}
        {showDressCode && displayEvents.every((e: EventItem) => !e.dressCode) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 md:mt-12 text-center"
          >
            <p className="text-sm md:text-base text-gray-500">
              Trang phục: <span className="font-medium">Áo dài / Vest</span>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
