import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TEMPLATES, getSectionsForTemplate } from '../utils/sections';
import { TEMPLATE_OPTIONS } from '../components/invitation-editor/types';
import type { InvitationData } from '../types';
import ThemeProvider from '../components/ThemeProvider';
import SectionRenderer from '../components/sections/SectionRenderer';

const HINT_DISMISSED_KEY = 'wedlove-demo-hint-dismissed';

function buildSampleInvitation(templateId: string): InvitationData {
  const preset = TEMPLATES[templateId] || TEMPLATES.cinematic;
  const option = TEMPLATE_OPTIONS.find((t) => t.id === templateId) || TEMPLATE_OPTIONS[0];

  // Wedding date 30 days in the future — always shows an interesting countdown
  // for the demo without going stale.
  const future = new Date();
  future.setDate(future.getDate() + 30);

  return {
    id: `demo-${templateId}`,
    slug: `demo-${templateId}`,
    template: templateId,
    title: `${preset.name} — Demo`,
    subtitle: 'Trải nghiệm giao diện thiệp cưới mẫu',
    primaryColor: option.primaryColor,
    secondaryColor: null,
    fontFamily: option.fontFamily,
    groomName: 'Minh',
    brideName: 'Hoa',
    weddingDate: future.toISOString(),
    venue: 'White Palace',
    venueAddress: '194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
    ceremonyTime: '9:00 sáng',
    receptionTime: '6:00 chiều',
    story:
      'Câu chuyện tình yêu của tụi mình bắt đầu từ một buổi chiều mưa. ' +
      'Ly cà phê đổ nhẹ đã nối hai con người xa lạ thành một đường tình kéo dài đến hôm nay.',
    coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
    gallery: [
      'https://images.unsplash.com/photo-1522673607200-1645062cd958?w=800',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
    ],
    sections: getSectionsForTemplate(templateId),
    musicUrl: null,
    musicAutoplay: false,
    musicFadeIn: false,
    mapUrl: null,
    latitude: null,
    longitude: null,
    status: 'published',
    isPublished: true,
    publishedAt: new Date().toISOString(),
  };
}

export default function DemoView() {
  const { templateId = 'cinematic' } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const option = TEMPLATE_OPTIONS.find((t) => t.id === templateId);
  const validOption = option ?? TEMPLATE_OPTIONS[0];
  const invitation = useMemo(() => buildSampleInvitation(templateId), [templateId]);

  // Hint overlay: visible on first visit, dismissable
  const [showHint, setShowHint] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(HINT_DISMISSED_KEY);
  });

  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_DISMISSED_KEY, '1');
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  };

  // Template navigation: prev/next in the TEMPLATE_OPTIONS list
  const currentIndex = TEMPLATE_OPTIONS.findIndex((t) => t.id === validOption.id);
  const prevOption = currentIndex > 0 ? TEMPLATE_OPTIONS[currentIndex - 1] : null;
  const nextOption =
    currentIndex >= 0 && currentIndex < TEMPLATE_OPTIONS.length - 1
      ? TEMPLATE_OPTIONS[currentIndex + 1]
      : null;

  return (
    <ThemeProvider invitation={invitation}>
      <Helmet>
        <title>{validOption.nameVi} — Demo thiệp cưới | WedLove</title>
        <meta
          name="description"
          content={`Xem thử thiệp cưới mẫu theo phong cách ${validOption.nameVi} của WedLove.`}
        />
      </Helmet>

      <div data-testid="demo-view" data-template={templateId}>
        <SectionRenderer
          sections={invitation.sections}
          invitation={invitation}
          guest={null}
        />
      </div>

      {/* Top sticky bar: back, template name, prev/next, CTA — replaces the old bottom banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm"
        role="region"
        aria-label="Thanh điều hướng demo"
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
              aria-label="Về trang chủ"
            >
              ← Trang chủ
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 leading-tight hidden sm:block">Đang xem thử</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {validOption.nameVi} <span className="text-gray-400 font-normal">({validOption.name})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {prevOption && (
              <button
                onClick={() => navigate(`/demo/${prevOption.id}`)}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title={`Template trước: ${prevOption.nameVi}`}
                data-testid="prev-template"
              >
                ← <span className="hidden sm:inline">{prevOption.nameVi}</span>
              </button>
            )}
            {nextOption && (
              <button
                onClick={() => navigate(`/demo/${nextOption.id}`)}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title={`Template tiếp: ${nextOption.nameVi}`}
                data-testid="next-template"
              >
                <span className="hidden sm:inline">{nextOption.nameVi}</span> →
              </button>
            )}
            <Link
              to={`/login?template=${validOption.id}`}
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 whitespace-nowrap"
              data-testid="use-template-cta"
            >
              Dùng template này
            </Link>
          </div>
        </div>
      </div>

      {/* First-visit hint overlay */}
      {showHint && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
          data-testid="demo-hint"
          role="status"
        >
          <div className="bg-gray-900/95 text-white text-sm px-4 py-3 rounded-xl shadow-2xl backdrop-blur flex items-start gap-3">
            <span className="text-lg" aria-hidden>
              👆
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium mb-0.5">Mẹo nhỏ</p>
              <p className="text-white/80 text-xs">
                Cuộn xuống để xem đầy đủ các phần: hero, câu chuyện, sự kiện, album ảnh, đếm ngược.
              </p>
            </div>
            <button
              onClick={dismissHint}
              className="text-white/70 hover:text-white text-lg leading-none"
              aria-label="Đóng mẹo"
              data-testid="dismiss-hint"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Spacer so the sticky top bar doesn't cover the first section */}
      <div className="h-14" aria-hidden />
    </ThemeProvider>
  );
}
