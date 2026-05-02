export interface SectionConfig {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  config: Record<string, any>;
}

const VALID_SECTION_TYPES = [
  'hero', 'story', 'event', 'rsvp', 'gallery', 'countdown',
  'map', 'music', 'gift', 'voice', 'livestream', 'custom',
];

export function validateSections(sections: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(sections)) {
    return { valid: false, errors: ['Sections must be an array'] };
  }

  if (sections.length > 20) {
    errors.push('Maximum 20 sections allowed');
  }

  const ids = new Set<string>();
  const orders = new Set<number>();

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];

    if (!s.id || typeof s.id !== 'string') {
      errors.push(`Section at index ${i} missing or invalid id`);
    } else if (ids.has(s.id)) {
      errors.push(`Duplicate section id: ${s.id}`);
    } else {
      ids.add(s.id);
    }

    if (!VALID_SECTION_TYPES.includes(s.type)) {
      errors.push(`Invalid section type: ${s.type}`);
    }

    if (typeof s.order !== 'number') {
      errors.push(`Section ${s.id} missing or invalid order`);
    } else if (orders.has(s.order)) {
      errors.push(`Duplicate section order: ${s.order}`);
    } else {
      orders.add(s.order);
    }

    if (typeof s.visible !== 'boolean') {
      errors.push(`Section ${s.id} missing or invalid visible`);
    }

    if (!s.config || typeof s.config !== 'object') {
      errors.push(`Section ${s.id} missing or invalid config`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getTemplatePreset(template: string): SectionConfig[] {
  const presets: Record<string, SectionConfig[]> = {
    cinematic: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: true, greetingStyle: 'formal' } },
      { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'split', imagePosition: 'left' } },
      { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Áo dài / Vest', showReception: true } },
      { id: 's4', type: 'gallery', order: 3, visible: true, config: { columns: 3, lightbox: true, allowGuestUpload: false } },
      { id: 's5', type: 'rsvp', order: 4, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Dị ứng đậu phộng', 'Dị ứng hải sản'], maxAttendees: 5 } },
      { id: 's6', type: 'map', order: 5, visible: true, config: {} },
      { id: 's7', type: 'gift', order: 6, visible: true, config: { methods: ['momo', 'bank_transfer'], showBankQR: true, customMessage: '' } },
    ],
    elegant: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: false, greetingStyle: 'formal' } },
      { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'full', imagePosition: 'top' } },
      { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Trang phục trang trọng', showReception: true } },
      { id: 's4', type: 'rsvp', order: 3, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Ăn kiêng'], maxAttendees: 4 } },
      { id: 's5', type: 'gallery', order: 4, visible: true, config: { columns: 2, lightbox: true, allowGuestUpload: false } },
      { id: 's6', type: 'gift', order: 5, visible: true, config: { methods: ['bank_transfer'], showBankQR: true, customMessage: '' } },
      { id: 's7', type: 'map', order: 6, visible: true, config: {} },
    ],
    modern: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: false, greetingStyle: 'casual' } },
      { id: 's2', type: 'event', order: 1, visible: true, config: { showDressCode: false, showReception: true } },
      { id: 's3', type: 'rsvp', order: 2, visible: true, config: { showDietary: false, dietaryOptions: [], maxAttendees: 3 } },
      { id: 's4', type: 'gallery', order: 3, visible: true, config: { columns: 4, lightbox: true, allowGuestUpload: true } },
      { id: 's5', type: 'map', order: 4, visible: true, config: {} },
    ],
    minimal: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: false, parallax: false, greetingStyle: 'casual' } },
      { id: 's2', type: 'event', order: 1, visible: true, config: { showDressCode: false, showReception: false } },
      { id: 's3', type: 'rsvp', order: 2, visible: true, config: { showDietary: false, dietaryOptions: [], maxAttendees: 2 } },
    ],
    vintage: [
      { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: true, greetingStyle: 'formal' } },
      { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'timeline', imagePosition: 'left' } },
      { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Áo dài truyền thống', showReception: true } },
      { id: 's4', type: 'rsvp', order: 3, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Dị ứng'], maxAttendees: 5 } },
      { id: 's5', type: 'gallery', order: 4, visible: true, config: { columns: 3, lightbox: true, allowGuestUpload: false } },
      { id: 's6', type: 'map', order: 5, visible: true, config: {} },
      { id: 's7', type: 'gift', order: 6, visible: true, config: { methods: ['bank_transfer', 'momo'], showBankQR: true, customMessage: '' } },
    ],
  };

  return presets[template] || presets.cinematic;
}
