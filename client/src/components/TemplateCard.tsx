import { Link } from 'react-router-dom';
import type { TemplateOption } from './invitation-editor/types';

interface TemplateCardProps {
  template: TemplateOption;
}

/**
 * Mini-preview shapes per template. Each shape is a 16:10 SVG that
 * sketches the template's section composition + color + font signature
 * without any photo assets. The gallery card is visually distinct per
 * template so visitors can compare layouts at a glance.
 */
function TemplateMiniPreview({ template }: { template: TemplateOption }) {
  const c = template.primaryColor;
  const f = template.fontFamily;
  // Each shape is keyed by template id; the catch-all falls back to
  // cinematic for any new template added without a shape.
  switch (template.id) {
    case 'cinematic':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* hero band */}
          <rect x="0" y="0" width="160" height="38" fill="#1a1a1a" />
          <text x="80" y="18" textAnchor="middle" fontSize="6" fill={c} fontFamily={f} fontStyle="italic">M & H</text>
          <text x="80" y="28" textAnchor="middle" fontSize="3.5" fill="#fff" fontFamily={f}>15 . 06 . 2026</text>
          {/* countdown chip */}
          <rect x="68" y="32" width="24" height="4" rx="1" fill={c} opacity="0.7" />
          {/* story split */}
          <rect x="0" y="38" width="80" height="22" fill="#f8f4ee" />
          <rect x="80" y="38" width="80" height="22" fill="#fff" stroke="#eee" />
          <rect x="6" y="42" width="20" height="14" fill={c} opacity="0.4" />
          <line x1="86" y1="44" x2="150" y2="44" stroke="#ccc" />
          <line x1="86" y1="50" x2="150" y2="50" stroke="#ccc" />
          <line x1="86" y1="56" x2="140" y2="56" stroke="#ccc" />
          {/* gallery 3-col */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={6 + i * 18} y="64" width="14" height="14" fill={c} opacity={0.3 + i * 0.2} />
          ))}
          <rect x="60" y="64" width="14" height="14" fill={c} opacity="0.5" />
          <rect x="78" y="64" width="14" height="14" fill={c} opacity="0.4" />
          <rect x="96" y="64" width="14" height="14" fill={c} opacity="0.6" />
          <rect x="114" y="64" width="14" height="14" fill={c} opacity="0.5" />
          <rect x="132" y="64" width="14" height="14" fill={c} opacity="0.45" />
          {/* rsvp */}
          <rect x="0" y="82" width="160" height="18" fill="#fafafa" />
          <rect x="56" y="86" width="48" height="10" rx="2" fill={c} />
          <text x="80" y="93" textAnchor="middle" fontSize="3.5" fill="#fff" fontFamily={f}>RSVP</text>
        </svg>
      );
    case 'elegant':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* full hero with framed image */}
          <rect x="0" y="0" width="160" height="48" fill="#f6f1e8" />
          <text x="80" y="20" textAnchor="middle" fontSize="7" fill={c} fontFamily={f} fontStyle="italic">Hoa &amp; Minh</text>
          <text x="80" y="30" textAnchor="middle" fontSize="3" fill="#666" letterSpacing="1">SAVE THE DATE</text>
          <text x="80" y="40" textAnchor="middle" fontSize="3.5" fill="#999" fontFamily={f}>15 . Tháng 6 . 2026</text>
          {/* full-bleed story */}
          <rect x="0" y="48" width="160" height="20" fill="#fff" />
          <line x1="20" y1="56" x2="140" y2="56" stroke={c} opacity="0.4" />
          <line x1="20" y1="61" x2="140" y2="61" stroke="#ddd" />
          <line x1="30" y1="64" x2="130" y2="64" stroke="#ddd" />
          {/* 2-col gallery (large) */}
          <rect x="6" y="72" width="36" height="22" fill={c} opacity="0.4" />
          <rect x="46" y="72" width="36" height="22" fill={c} opacity="0.3" />
          <rect x="86" y="72" width="36" height="22" fill={c} opacity="0.5" />
          <rect x="126" y="72" width="28" height="22" fill={c} opacity="0.35" />
          {/* gift footer */}
          <rect x="0" y="96" width="160" height="4" fill={c} opacity="0.4" />
        </svg>
      );
    case 'modern':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* compact hero, sans-serif, dark */}
          <rect x="0" y="0" width="160" height="34" fill="#fff" stroke="#eee" />
          <text x="80" y="14" textAnchor="middle" fontSize="6" fill={c} fontFamily={f} fontWeight="700">MINH &amp; HOA</text>
          <text x="80" y="22" textAnchor="middle" fontSize="3" fill="#888" fontFamily={f} letterSpacing="0.5">15 / 06 / 2026</text>
          <rect x="74" y="26" width="12" height="3" fill={c} />
          {/* event card */}
          <rect x="10" y="40" width="140" height="12" rx="1" fill="#fafafa" stroke="#eee" />
          <rect x="14" y="43" width="6" height="6" fill={c} />
          <line x1="24" y1="45" x2="120" y2="45" stroke="#999" />
          <line x1="24" y1="49" x2="100" y2="49" stroke="#ccc" />
          {/* 4-col gallery */}
          {[0, 1, 2, 3].flatMap((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={6 + col * 18}
                y={56 + row * 10}
                width="14"
                height="8"
                fill={c}
                opacity={0.25 + ((row + col) % 4) * 0.15}
              />
            ))
          )}
          {/* rsvp button */}
          <rect x="50" y="92" width="60" height="6" rx="3" fill={c} />
        </svg>
      );
    case 'minimal':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* white background, lots of whitespace, just essentials */}
          <rect x="0" y="0" width="160" height="100" fill="#fff" />
          <text x="80" y="30" textAnchor="middle" fontSize="8" fill={c} fontFamily={f} fontWeight="600">M &amp; H</text>
          <line x1="60" y1="36" x2="100" y2="36" stroke={c} strokeWidth="0.5" />
          <text x="80" y="46" textAnchor="middle" fontSize="3" fill="#888" fontFamily={f} letterSpacing="1">15 · 06 · 2026</text>
          {/* single event line */}
          <line x1="20" y1="62" x2="140" y2="62" stroke="#eee" />
          <line x1="40" y1="68" x2="120" y2="68" stroke="#eee" />
          <line x1="50" y1="74" x2="110" y2="74" stroke="#eee" />
          {/* rsvp only — minimal doesn't include gallery/gift */}
          <text x="80" y="88" textAnchor="middle" fontSize="3" fill={c} fontFamily={f} letterSpacing="2">RSVP</text>
        </svg>
      );
    case 'vintage':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* warm cream background, ornamental border */}
          <rect x="0" y="0" width="160" height="100" fill="#f5ebd9" />
          <rect x="3" y="3" width="154" height="94" fill="none" stroke={c} strokeWidth="0.4" />
          <text x="80" y="18" textAnchor="middle" fontSize="6" fill={c} fontFamily={f} fontStyle="italic">Trăm năm hạnh phúc</text>
          <text x="80" y="30" textAnchor="middle" fontSize="8" fill={c} fontFamily={f} fontWeight="700">Minh &amp; Hoa</text>
          <text x="80" y="38" textAnchor="middle" fontSize="3" fill={c} fontFamily={f} letterSpacing="1">15 . 06 . 2026</text>
          {/* timeline dots */}
          <circle cx="20" cy="56" r="2" fill={c} />
          <line x1="22" y1="56" x2="138" y2="56" stroke={c} strokeWidth="0.4" />
          <circle cx="60" cy="56" r="2" fill={c} />
          <circle cx="100" cy="56" r="2" fill={c} />
          <circle cx="140" cy="56" r="2" fill={c} />
          {/* story blocks */}
          <rect x="14" y="64" width="40" height="10" fill={c} opacity="0.2" />
          <rect x="60" y="64" width="40" height="10" fill={c} opacity="0.25" />
          <rect x="106" y="64" width="40" height="10" fill={c} opacity="0.2" />
          {/* bottom event */}
          <rect x="20" y="80" width="120" height="14" fill="none" stroke={c} strokeWidth="0.3" />
          <text x="80" y="89" textAnchor="middle" fontSize="3" fill={c} fontFamily={f}>LỄ CƯỚI · 9:00 SÁNG</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full">
          <rect width="160" height="100" fill={c} opacity="0.3" />
          <text x="80" y="55" textAnchor="middle" fontSize="6" fill={c} fontFamily={f}>
            {template.name}
          </text>
        </svg>
      );
  }
}

/** Short Vietnamese tag-line per template for the card. */
const TEMPLATE_TAGLINES: Record<string, string> = {
  cinematic: 'Hiệu ứng điện ảnh, parallax mượt mà, đầy đủ tính năng',
  elegant: 'Sang trọng, tinh tế, phù hợp tiệc tối và nhà hàng',
  modern: 'Gọn gàng, tối giản, tập trung vào thông tin',
  minimal: 'Chỉ giữ phần cốt lõi — lời mời, sự kiện, xác nhận',
  vintage: 'Truyền thống Á Đông, họa tiết và typography hoài cổ',
};

/** Approximate count of sections in each preset (for the chip on the card). */
const TEMPLATE_SECTION_COUNT: Record<string, number> = {
  cinematic: 7,
  elegant: 7,
  modern: 5,
  minimal: 3,
  vintage: 7,
};

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      to={`/demo/${template.id}`}
      data-testid={`template-card-${template.id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all"
    >
      <div
        className="aspect-[16/10] overflow-hidden relative"
        style={{ backgroundColor: template.primaryColor }}
      >
        <TemplateMiniPreview template={template} />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-[11px] font-medium rounded-full text-gray-700">
          {TEMPLATE_SECTION_COUNT[template.id] ?? '?'} sections
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-3 h-3 rounded-full ring-2 ring-white shadow"
            style={{ backgroundColor: template.primaryColor }}
            aria-hidden
          />
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <span className="text-sm text-gray-500">· {template.nameVi}</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 min-h-[2.5rem]">
          {TEMPLATE_TAGLINES[template.id] ?? ''}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span
            className="text-gray-500"
            style={{ fontFamily: template.fontFamily }}
          >
            {template.fontFamily}
          </span>
          <span className="text-rose-500 group-hover:translate-x-1 transition-transform font-medium">
            Xem thử →
          </span>
        </div>
      </div>
    </Link>
  );
}

export { TemplateMiniPreview, TEMPLATE_TAGLINES, TEMPLATE_SECTION_COUNT };
