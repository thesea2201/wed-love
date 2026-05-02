import { useParams, useSearchParams } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { useInvitation } from '../hooks/use-invitation';
import SectionRenderer from '../components/sections/SectionRenderer';
import ThemeProvider from '../components/ThemeProvider';
import SEOHead from '../components/SEOHead';
import type { InvitationData, GuestData } from '../types';

export default function InvitationView() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isPreview = searchParams.get('preview') === 'true';
  const containerRef = useRef<HTMLDivElement>(null);
  const [livePreviewData, setLivePreviewData] = useState<InvitationData | null>(null);

  // Parse draft data from URL hash for preview mode (initial load)
  const draftData = useMemo(() => {
    if (!isPreview) return null;
    try {
      const hash = window.location.hash;
      const match = hash.match(/draft=([^&]+)/);
      if (match) {
        const decoded = decodeURIComponent(match[1]);
        return JSON.parse(decoded) as InvitationData;
      }
    } catch (e) {
      console.error('Failed to parse draft data:', e);
    }
    return null;
  }, [isPreview]);

  // Listen for postMessage updates from editor (real-time preview)
  useEffect(() => {
    if (!isPreview) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'WEDLOVE_PREVIEW_UPDATE' && event.data?.data) {
        setLivePreviewData(event.data.data as InvitationData);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPreview]);

  const { data, isLoading, error } = useInvitation(
    slug!,
    token || undefined,
    !isPreview // Disable API fetch in preview mode
  );

  const { scrollYProgress } = useScroll({ container: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  // Priority: live preview > initial draft > API data
  const invitation: InvitationData | null = livePreviewData || draftData || data?.invitation || null;
  const guest: GuestData | null = data?.guest || null;

  if (isLoading && !isPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-white">
        <div className="text-center">
          <h1 className="text-4xl font-display mb-4">Không Tìm Thấy Thiệp</h1>
          <p className="text-gray-400">
            {isPreview
              ? 'Không thể tải dữ liệu preview.'
              : (error as any)?.response?.data?.error || 'Thiệp cưới này không tồn tại.'}
          </p>
        </div>
      </div>
    );
  }
  const coverImage = invitation.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920';

  return (
    <HelmetProvider>
      <SEOHead invitation={invitation} guestName={guest?.name} />
      <ThemeProvider invitation={invitation}>
        <div ref={containerRef} className="relative overflow-y-auto h-screen">
          <div className="fixed inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10">
            {guest?.personalization?.customMessage && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-20 px-4"
              >
                <div className="max-w-2xl mx-auto bg-white/90 rounded-2xl p-8 text-center">
                  {guest.personalization.sharedPhoto && (
                    <motion.img
                      src={guest.personalization.sharedPhoto}
                      alt="Kỷ niệm"
                      className="w-48 h-48 object-cover rounded-full mx-auto mb-6 shadow-lg"
                      initial={{ scale: 1.05, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                    />
                  )}
                  <p className="text-lg italic text-gray-700">{guest.personalization.customMessage}</p>
                </div>
              </motion.section>
            )}

            <SectionRenderer
              sections={invitation.sections || []}
              invitation={invitation}
              guest={guest}
              guestToken={token}
            />
          </div>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}
