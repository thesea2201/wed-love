import type { InvitationData, SectionConfig } from '../../types';

export type EditorTab = 'content' | 'design' | 'sections';

export interface EditorState {
  original: InvitationData | null;
  draft: InvitationData | null;
  activeTab: EditorTab;
  isSaving: boolean;
  isPublishing: boolean;
  saveError: string | null;
}

export interface ContentTabProps {
  draft: InvitationData;
  onChange: (updates: Partial<InvitationData>) => void;
}

export interface DesignTabProps {
  draft: InvitationData;
  onChange: (updates: Partial<InvitationData>) => void;
}

export interface SectionsTabProps {
  sections: SectionConfig[];
  onChange: (sections: SectionConfig[]) => void;
}

export interface PreviewPaneProps {
  draft: InvitationData | null;
  originalSlug: string | null;
}

export interface TemplateOption {
  id: string;
  name: string;
  nameVi: string;
  preview: string;
  primaryColor: string;
  fontFamily: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    nameVi: 'Điện ảnh',
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    primaryColor: '#c8956c',
    fontFamily: 'Playfair Display',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    nameVi: 'Thanh lịch',
    preview: 'https://images.unsplash.com/photo-1522673607200-1645062cd958?w=400',
    primaryColor: '#c9a96e',
    fontFamily: 'Cormorant Garamond',
  },
  {
    id: 'modern',
    name: 'Modern',
    nameVi: 'Hiện đại',
    preview: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    primaryColor: '#1a1a1a',
    fontFamily: 'Inter',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameVi: 'Tối giản',
    preview: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
    primaryColor: '#000000',
    fontFamily: 'Inter',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameVi: 'Cổ điển',
    preview: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
    primaryColor: '#8b7355',
    fontFamily: 'Great Vibes',
  },
];

export const FONT_OPTIONS = [
  'Playfair Display',
  'Inter',
  'Great Vibes',
  'Cormorant Garamond',
  'Be Vietnam Pro',
];

export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Tiêu đề',
  story: 'Câu chuyện',
  event: 'Sự kiện',
  rsvp: 'Xác nhận tham dự',
  gallery: 'Thư viện ảnh',
  countdown: 'Đếm ngược',
  map: 'Bản đồ',
  music: 'Âm nhạc',
  gift: 'Mừng cưới',
};

export const SECTION_TYPE_DESCRIPTIONS: Record<string, string> = {
  hero: 'Hiển thị tên cô dâu chú rể và ngày cưới',
  story: 'Chia sẻ câu chuyện tình yêu của hai bạn',
  event: 'Thông tin chi tiết về địa điểm và thời gian',
  rsvp: 'Khách mời xác nhận tham dự',
  gallery: 'Album ảnh cưới và kỷ niệm',
  countdown: 'Đếm ngược đến ngày cưới',
  map: 'Bản đồ chỉ dẫn đến địa điểm',
  music: 'Nhạc nền cho thiệp cưới',
  gift: 'Thông tin gửi mừng cưới',
};
