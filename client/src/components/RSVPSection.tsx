import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

interface Props {
  token: string | null;
  guest: { name: string; rsvp?: { status: string; attendees: number } } | null;
}

export default function RSVPSection({ token, guest }: Props) {
  const [status, setStatus] = useState(guest?.rsvp?.status || '');
  const [attendees, setAttendees] = useState(guest?.rsvp?.attendees || 1);
  const [dietary, setDietary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setSubmitting(true);
    try {
      await api.post(`/guests/${token}/rsvp`, {
        status,
        attendees,
        dietary: dietary ? [dietary] : [],
      });
      setSubmitted(true);
    } catch (error) {
      console.error('RSVP failed:', error);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <section className="py-24 px-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="bg-green-50 rounded-2xl p-8">
            <h3 className="font-display text-2xl text-green-800 mb-2">Thank You!</h3>
            <p className="text-green-600">Your response has been recorded.</p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto"
      >
        <h2 className="font-display text-4xl text-center mb-8">Will You Join Us?</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {(['attending', 'maybe', 'declined'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`py-3 rounded-lg border-2 capitalize transition-colors ${
                  status === option
                    ? 'border-dark bg-dark text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {status === 'attending' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <select
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Requirements (optional)
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="e.g., Vegetarian, Allergic to nuts"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!status || submitting || !token}
            className="w-full bg-dark text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
