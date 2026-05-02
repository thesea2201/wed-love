import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';

export default function MusicSection({ config, invitation }: SectionProps) {
  const { fadeIn = true, showControls = true } = config;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const musicUrl = invitation.musicUrl;

  useEffect(() => {
    if (audioRef.current && config.autoplay) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked by browser — user must interact first
      });
    }
  }, [config.autoplay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!musicUrl) return null;

  return (
    <section className="py-12 px-4 bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto text-center"
      >
        <h3 className="font-display text-2xl mb-4">Nhạc Nền</h3>

        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {showControls && (
          <button
            onClick={togglePlay}
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <span className="text-lg">⏸</span>
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <span className="text-lg">▶</span>
                <span>Phát nhạc</span>
              </>
            )}
          </button>
        )}
      </motion.div>
    </section>
  );
}
