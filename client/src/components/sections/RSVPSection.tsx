import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';
import { useGuestRSVP } from '../../hooks/use-guest';

interface RSVPSectionProps extends SectionProps {
  token?: string | null;
}

export default function RSVPSection({ config, invitation, guest, token }: RSVPSectionProps) {
  const { showDietary = true, dietaryOptions = [], maxAttendees = 5 } = config;
  const [status, setStatus] = useState(guest?.rsvp?.status || '');
  const [attendees, setAttendees] = useState(guest?.rsvp?.attendees || 1);
  const [dietary, setDietary] = useState('');
  const rsvpMutation = useGuestRSVP();
  const [submitted, setSubmitted] = useState(false);

  const primaryColor = invitation.primaryColor || '#c8956c';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await rsvpMutation.mutateAsync({
        token,
        data: {
          status,
          attendees,
          dietary: dietary ? [dietary] : [],
        },
      });
      setSubmitted(true);
    } catch (error) {
      console.error('RSVP thất bại:', error);
    }
  };

  if (submitted) {
    return (
      <section className="py-12 md:py-24 px-3 md:px-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full mx-auto text-center"
        >
          <div className="bg-green-50 rounded-2xl p-8">
            <h3 className="font-display text-2xl text-green-800 mb-2">Cảm ơn bạn!</h3>
            <p className="text-green-600">Phản hồi của bạn đã được ghi nhận.</p>
          </div>
        </motion.div>
      </section>
    );
  }

  const rsvpOptions = [
    { value: 'attending', label: 'Sẽ tham dự' },
    { value: 'maybe', label: 'Có thể' },
    { value: 'declined', label: 'Không thể' },
  ];

  return (
    <section className="py-12 md:py-24 px-3 md:px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mx-auto"
      >
        <h2 className="font-display text-2xl md:text-4xl text-center mb-6 md:mb-8">Xác Nhận Tham Dự</h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 w-full">
          {/* Status Selection - always stack on narrow, 3 cols on wider */}
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-3">
            {rsvpOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className="py-2.5 px-3 rounded-lg border-2 transition-all text-sm font-medium min-h-[44px] w-full"
                style={{
                  borderColor: status === option.value ? primaryColor : '#e5e7eb',
                  backgroundColor: status === option.value ? primaryColor : 'transparent',
                  color: status === option.value ? '#ffffff' : '#374151',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {status === 'attending' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-5"
            >
              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số khách tham dự
                </label>
                <select
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white min-h-[44px] text-sm"
                >
                  {Array.from({ length: maxAttendees }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} khách</option>
                  ))}
                </select>
              </div>

              {/* Dietary Options */}
              {showDietary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Yêu cầu ăn uống (tuỳ chọn)
                  </label>
                  {dietaryOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map((opt: string) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDietary(dietary === opt ? '' : opt)}
                          className="px-4 py-2 rounded-full border text-sm transition-all"
                          style={{
                            borderColor: dietary === opt ? primaryColor : '#e5e7eb',
                            backgroundColor: dietary === opt ? primaryColor : '#ffffff',
                            color: dietary === opt ? '#ffffff' : '#374151',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="VD: Ăn chay, Dị ứng đậu phộng"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg min-h-[44px] text-sm"
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!status || rsvpMutation.isPending || !token}
            className="w-full py-2.5 px-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px] text-sm md:text-base"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            {rsvpMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </span>
            ) : (
              'Gửi xác nhận'
            )}
          </button>

          {!token && (
            <p className="text-sm text-center text-amber-600">
              Vui lòng truy cập qua link cá nhân để xác nhận tham dự.
            </p>
          )}
        </form>
      </motion.div>
    </section>
  );
}
