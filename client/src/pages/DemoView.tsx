import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { TEMPLATES, getSectionsForTemplate } from '../utils/sections';
import { TEMPLATE_OPTIONS } from '../components/invitation-editor/types';
import type { InvitationData } from '../types';
import ThemeProvider from '../components/ThemeProvider';
import SectionRenderer from '../components/sections/SectionRenderer';

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
  const option = TEMPLATE_OPTIONS.find((t) => t.id === templateId);
  const invitation = useMemo(() => buildSampleInvitation(templateId), [templateId]);

  return (
    <ThemeProvider invitation={invitation}>
      <div data-testid="demo-view" data-template={templateId}>
        <SectionRenderer
          sections={invitation.sections}
          invitation={invitation}
          guest={null}
        />
      </div>

      {/* Demo banner — overlaid so users know it's a sample and can return home */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900/95 text-white text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur"
        role="status"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" aria-hidden />
        <span>
          Đang xem thử: <strong>{option?.nameVi ?? templateId}</strong>
        </span>
        <span className="text-white/50">•</span>
        <Link
          to="/"
          className="hover:text-rose-300 underline-offset-4 hover:underline"
        >
          ← Về trang chủ
        </Link>
        <span className="text-white/50">•</span>
        <Link
          to="/login"
          className="hover:text-rose-300 underline-offset-4 hover:underline"
        >
          Tạo thiệp của bạn
        </Link>
      </div>
    </ThemeProvider>
  );
}
