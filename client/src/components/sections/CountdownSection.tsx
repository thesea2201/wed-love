import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';

export default function CountdownSection({ config, invitation }: SectionProps) {
  const { showSeconds = true, showLabels = true, style = 'boxed' } = config;
  const weddingDate = new Date(invitation.weddingDate);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(weddingDate));
  const primaryColor = invitation.primaryColor || '#c8956c';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(weddingDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  function getTimeLeft(date: Date) {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  const units = [
    { value: timeLeft.days, label: 'Ngày', single: 'Ngày' },
    { value: timeLeft.hours, label: 'Giờ', single: 'Giờ' },
    { value: timeLeft.minutes, label: 'Phút', single: 'Phút' },
    ...(showSeconds ? [{ value: timeLeft.seconds, label: 'Giây', single: 'Giây' }] : []),
  ];

  // Check if wedding day has arrived
  const isWeddingDay = timeLeft.days === 0 && timeLeft.hours === 0 &&
                       timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isWeddingDay) {
    return (
      <section className="py-16 md:py-24 px-4" style={{ backgroundColor: primaryColor }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center text-white"
        >
          <h2 className="font-display text-3xl md:text-4xl mb-4">Hôm nay là ngày vui!</h2>
          <p className="text-lg md:text-xl opacity-90">Chúc mừng đám cưới {invitation.groomName} & {invitation.brideName}</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-24 px-3 md:px-4 bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mx-auto text-center"
      >
        <h2 className="font-display text-2xl md:text-4xl mb-6 md:mb-12">Đếm Ngược Ngày Vui</h2>

        {/* Responsive: flex-wrap for narrow, grid for wider */}
        <div className="flex flex-wrap justify-center gap-2 md:grid md:grid-cols-4 md:gap-4">
          {units.map((unit) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl p-3 md:p-6 flex-1 min-w-[70px] max-w-[120px] md:max-w-none flex flex-col justify-center items-center"
              style={{
                backgroundColor: style === 'boxed' ? `${primaryColor}20` : 'rgba(255,255,255,0.1)',
                border: style === 'boxed' ? `1px solid ${primaryColor}40` : 'none',
              }}
            >
              <div className="text-xl md:text-4xl lg:text-5xl font-bold font-display leading-none">
                {String(unit.value).padStart(2, '0')}
              </div>
              {showLabels && (
                <div className="text-[10px] md:text-sm text-white/70 font-medium mt-1">
                  {unit.label}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-4 md:mt-8 text-xs md:text-base text-white/60 px-2">
          đến ngày trọng đại của {invitation.groomName} & {invitation.brideName}
        </p>
      </motion.div>
    </section>
  );
}
