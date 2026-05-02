import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';

export default function HeroSection({ config, invitation, guest }: SectionProps) {
  const { showCountdown = true, parallax = true, greetingStyle = 'formal' } = config;
  const date = new Date(invitation.weddingDate);
  const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const greeting = greetingStyle === 'formal'
    ? `Kính mời ${guest?.name || ''}`
    : `Thân mến ${guest?.name || ''}`;

  // Use subtitle from invitation or default
  const subtitle = invitation.subtitle || 'Cùng hai bên gia đình';
  const primaryColor = invitation.primaryColor || '#c8956c';

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-white px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="text-center"
      >
        {/* Guest greeting */}
        {guest?.name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl mb-4 tracking-wider"
          >
            {greeting}
          </motion.p>
        )}

        {/* Subtitle from invitation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-sm md:text-base tracking-[0.2em] uppercase mb-4 text-white/90"
        >
          {subtitle}
        </motion.p>

        {/* Couple names */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-2 drop-shadow-lg">
          {invitation.groomName}
        </h1>
        <motion.p
          className="font-display text-2xl md:text-3xl italic mb-4"
          style={{ color: primaryColor }}
        >
          &
        </motion.p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-6 md:mb-8 drop-shadow-lg">
          {invitation.brideName}
        </h1>

        {/* Wedding date */}
        <div className="flex items-center justify-center gap-2 md:gap-4 text-sm md:text-base tracking-wider flex-wrap">
          <span>{date.getDate()}</span>
          <span className="w-8 md:w-12 h-px bg-white/60" />
          <span>Tháng {date.getMonth() + 1}</span>
          <span className="w-8 md:w-12 h-px bg-white/60" />
          <span>{date.getFullYear()}</span>
        </div>

        {/* Save the Date / Countdown */}
        {showCountdown && daysUntil > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 md:mt-12"
          >
            <p className="text-xs md:text-sm tracking-wider mb-2 uppercase">Save the Date</p>
            <div className="flex gap-3 md:gap-4 justify-center">
              <div
                className="rounded-lg px-4 py-2 md:px-6 md:py-3 backdrop-blur-sm"
                style={{ backgroundColor: `${primaryColor}30` }}
              >
                <span className="text-xl md:text-3xl font-bold">{daysUntil}</span>
                <span className="block text-xs text-white/80">ngày nữa</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Wedding day message */}
        {daysUntil === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 md:mt-12"
            style={{ color: primaryColor }}
          >
            <p className="text-lg md:text-xl font-medium">Hôm nay là ngày trọng đại!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
