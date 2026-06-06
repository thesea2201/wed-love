import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';

const FADE_DURATION_MS = 2000;

export default function MusicSection({ config, invitation }: SectionProps) {
  const showControls = config.showControls !== false;
  const musicUrl = invitation.musicUrl;
  const autoplay = !!invitation.musicAutoplay;
  const fadeIn = !!invitation.musicFadeIn;

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const cancelFade = () => {
    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  };

  const fadeUp = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.volume = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / FADE_DURATION_MS);
      audio.volume = t;
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      } else {
        fadeRafRef.current = null;
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  };

  const tryPlay = async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.volume = fadeIn ? 0 : 1;
      await audioRef.current.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
      setUserInteracted(true);
      if (fadeIn) fadeUp();
    } catch {
      setAutoplayBlocked(true);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    cancelFade();
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else tryPlay();
  };

  // Try autoplay once on mount (browser may block until first user interaction)
  useEffect(() => {
    if (!musicUrl || !autoplay) return;
    tryPlay();
    return () => cancelFade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicUrl, autoplay]);

  // If autoplay was blocked, retry on first user interaction anywhere on the page
  useEffect(() => {
    if (!autoplayBlocked || userInteracted) return;
    const handler = () => {
      tryPlay();
    };
    window.addEventListener('click', handler, { once: true, passive: true });
    window.addEventListener('scroll', handler, { once: true, passive: true });
    window.addEventListener('keydown', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true, passive: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('scroll', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [autoplayBlocked, userInteracted]);

  if (!musicUrl) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={musicUrl}
        loop
        preload="auto"
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {showControls && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2"
        >
          {isPlaying && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="bg-white/90 backdrop-blur-sm text-gray-800 w-11 h-11 rounded-full shadow-lg hover:bg-white flex items-center justify-center transition-all"
              aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
              <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
            </button>
          )}
          <button
            onClick={togglePlay}
            data-testid="music-toggle"
            className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 h-11 rounded-full shadow-lg hover:bg-white inline-flex items-center gap-2 transition-all"
            aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
          >
            <span className="text-lg">{isPlaying ? '⏸' : '▶'}</span>
            <span className="text-sm font-medium hidden sm:inline">
              {isPlaying ? 'Tạm dừng' : (autoplayBlocked ? 'Bật nhạc' : 'Phát nhạc')}
            </span>
          </button>
        </motion.div>
      )}

      {autoplayBlocked && !showControls && (
        <div className="sr-only" role="status" aria-live="polite">
          Trình duyệt đã chặn tự động phát nhạc.
        </div>
      )}
    </>
  );
}
