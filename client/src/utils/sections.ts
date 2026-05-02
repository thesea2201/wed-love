import type { SectionConfig, TemplatePreset } from '../types';

export const TEMPLATES: Record<string, TemplatePreset> = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    nameVi: 'Điện ảnh',
    description: 'Trải nghiệm điện ảnh với hiệu ứng parallax và chuyển động mượt mà',
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    sections: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: true, greetingStyle: 'formal' } },
      { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'split', imagePosition: 'left' } },
      { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Áo dài / Vest', showReception: true } },
      { id: 's4', type: 'gallery', order: 3, visible: true, config: { columns: 3, lightbox: true, allowGuestUpload: false } },
      { id: 's5', type: 'rsvp', order: 4, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Dị ứng đậu phộng', 'Dị ứng hải sản'], maxAttendees: 5 } },
      { id: 's6', type: 'map', order: 5, visible: true, config: {} },
      { id: 's7', type: 'gift', order: 6, visible: true, config: { methods: ['momo', 'bank_transfer'], showBankQR: true, customMessage: '' } },
    ],
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    nameVi: 'Sang trọng',
    description: 'Thiết kế sang trọng, tinh tế với typography thanh lịch',
    preview: 'https://images.unsplash.com/photo-1522673607200-1645062cd958?w=400',
    sections: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: false, greetingStyle: 'formal' } },
      { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'full', imagePosition: 'top' } },
      { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Trang phục trang trọng', showReception: true } },
      { id: 's4', type: 'rsvp', order: 3, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Ăn kiêng'], maxAttendees: 4 } },
      { id: 's5', type: 'gallery', order: 4, visible: true, config: { columns: 2, lightbox: true, allowGuestUpload: false } },
      { id: 's6', type: 'gift', order: 5, visible: true, config: { methods: ['bank_transfer'], showBankQR: true, customMessage: '' } },
      { id: 's7', type: 'map', order: 6, visible: true, config: {} },
    ],
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    nameVi: 'Hiện đại',
    description: 'Thiết kế tối giản, hiện đại với bố cục gọn gàng',
    preview: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    sections: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: false, greetingStyle: 'casual' } },
      { id: 's2', type: 'event', order: 1, visible: true, config: { showDressCode: false, showReception: true } },
      { id: 's3', type: 'rsvp', order: 2, visible: true, config: { showDietary: false, dietaryOptions: [], maxAttendees: 3 } },
      { id: 's4', type: 'gallery', order: 3, visible: true, config: { columns: 4, lightbox: true, allowGuestUpload: true } },
      { id: 's5', type: 'map', order: 4, visible: true, config: {} },
    ],
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    nameVi: 'Tối giản',
    description: 'Chỉ giữ lại những phần quan trọng nhất — ngắn gọn và ý nghĩa',
    preview: 'https://images.unsplash.com/photo-1606800052052-a08af7148774?w=400',
    sections: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: false, parallax: false, greetingStyle: 'casual' } },
      { id: 's2', type: 'event', order: 1, visible: true, config: { showDressCode: false, showReception: false } },
      { id: 's3', type: 'rsvp', order: 2, visible: true, config: { showDietary: false, dietaryOptions: [], maxAttendees: 2 } },
    ],
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    nameVi: 'Cổ điển',
    description: 'Phong cách hoài cổ với họa tiết truyền thống Việt Nam',
    preview: 'https://images.unsplash.com/photo-1465491157235-3e934b5b6b3a?w=400',
    sections: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: true, greetingStyle: 'formal' } },
      { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'timeline', imagePosition: 'left' } },
      { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Áo dài truyền thống', showReception: true } },
      { id: 's4', type: 'rsvp', order: 3, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Dị ứng'], maxAttendees: 5 } },
      { id: 's5', type: 'gallery', order: 4, visible: true, config: { columns: 3, lightbox: true, allowGuestUpload: false } },
      { id: 's6', type: 'map', order: 5, visible: true, config: {} },
      { id: 's7', type: 'gift', order: 6, visible: true, config: { methods: ['bank_transfer', 'momo'], showBankQR: true, customMessage: '' } },
    ],
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

export const SECTION_TYPE_LABELS: Record<string, { name: string; nameVi: string; icon: string }> = {
  hero:        { name: 'Hero',        nameVi: 'Trang đầu',       icon: '🏠' },
  story:       { name: 'Story',       nameVi: 'Câu chuyện',      icon: '📖' },
  event:       { name: 'Event',       nameVi: 'Sự kiện',         icon: '💍' },
  rsvp:        { name: 'RSVP',        nameVi: 'Xác nhận tham dự', icon: '✉️' },
  gallery:     { name: 'Gallery',     nameVi: 'Kho ảnh',          icon: '📸' },
  countdown:   { name: 'Countdown',   nameVi: 'Đếm ngược',       icon: '⏰' },
  map:         { name: 'Map',         nameVi: 'Bản đồ',          icon: '🗺️' },
  music:       { name: 'Music',       nameVi: 'Nhạc nền',        icon: '🎵' },
  gift:        { name: 'Gift',        nameVi: 'Mừng cưới',       icon: '🎁' },
  voice:       { name: 'Voice',       nameVi: 'Lời chúc',        icon: '🎤' },
  livestream:  { name: 'Livestream',  nameVi: 'Phát trực tiếp',  icon: '📺' },
  custom:      { name: 'Custom',      nameVi: 'Tùy chỉnh',       icon: '✏️' },
};

export function getSectionsForTemplate(templateId: string): SectionConfig[] {
  return TEMPLATES[templateId]?.sections || TEMPLATES.cinematic.sections;
}

export function reorderSections(sections: SectionConfig[], fromIndex: number, toIndex: number): SectionConfig[] {
  const result = [...sections];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result.map((s, i) => ({ ...s, order: i }));
}

export function addSection(sections: SectionConfig[], section: SectionConfig): SectionConfig[] {
  return [...sections, { ...section, order: sections.length }];
}

export function removeSection(sections: SectionConfig[], sectionId: string): SectionConfig[] {
  return sections
    .filter(s => s.id !== sectionId)
    .map((s, i) => ({ ...s, order: i }));
}

export function toggleSectionVisibility(sections: SectionConfig[], sectionId: string): SectionConfig[] {
  return sections.map(s =>
    s.id === sectionId ? { ...s, visible: !s.visible } : s
  );
}

export function updateSectionConfig(sections: SectionConfig[], sectionId: string, config: Record<string, any>): SectionConfig[] {
  return sections.map(s =>
    s.id === sectionId ? { ...s, config: { ...s.config, ...config } } : s
  );
}
