import { motion } from 'framer-motion';
import { MapPin, Clock } from './Icons';

interface Props {
  weddingDate: string;
  venue: string;
  address: string;
  ceremonyTime?: string;
  receptionTime?: string;
}

export default function EventSection({ weddingDate, venue, address, ceremonyTime, receptionTime }: Props) {
  const date = new Date(weddingDate);

  return (
    <section className="py-24 px-4 bg-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl text-center mb-12"
        >
          The Celebration
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <h3 className="font-display text-2xl mb-4">Ceremony</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>{ceremonyTime || '3:00 PM - 4:00 PM'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{venue}</p>
                  <p className="text-sm">{address}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <h3 className="font-display text-2xl mb-4">Reception</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>{receptionTime || '6:00 PM - 10:00 PM'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{venue}</p>
                  <p className="text-sm">Same venue</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 mb-4">Dress code: Formal / Elegant</p>
          <button className="bg-dark text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            View on Map
          </button>
        </motion.div>
      </div>
    </section>
  );
}
