// Section types — the core of the composable system
export type SectionType =
  | 'hero'
  | 'story'
  | 'event'
  | 'rsvp'
  | 'gallery'
  | 'countdown'
  | 'map'
  | 'music'
  | 'gift'
  | 'voice'
  | 'livestream'
  | 'custom';

export interface SectionConfig {
  id: string;
  type: SectionType;
  order: number;
  visible: boolean;
  config: Record<string, any>;
}

// Section config sub-types
export interface HeroConfig {
  showCountdown: boolean;
  parallax: boolean;
  greetingStyle: 'formal' | 'casual';
}

export interface StoryConfig {
  layout: 'split' | 'full' | 'timeline';
  imagePosition: 'left' | 'right' | 'top';
  imageUrl?: string;
}

export interface EventItem {
  id: string;
  name: string;
  time: string;
  venue: string;
  address: string;
  dressCode: string;
  mapUrl?: string;
}

export interface EventConfig {
  events: EventItem[];
  showDressCode: boolean;
}

export interface RSVPConfig {
  showDietary: boolean;
  dietaryOptions: string[];
  maxAttendees: number;
}

export interface GalleryConfig {
  columns: 2 | 3 | 4;
  lightbox: boolean;
  allowGuestUpload: boolean;
  images?: string[];
}

export interface GiftConfig {
  customMessage: string;
  showBrideSide: boolean;
  showGroomSide: boolean;
  // Bride bank info
  brideBankId: string;
  brideAccountNumber: string;
  brideAccountName: string;
  // Groom bank info
  groomBankId: string;
  groomAccountNumber: string;
  groomAccountName: string;
  displayMode?: 'inline' | 'modal';
}

export interface MusicConfig {
  autoplay: boolean;
  fadeIn: boolean;
  showControls: boolean;
}

// Invitation data
export interface InvitationData {
  id: string;
  slug: string;
  template: string;
  title: string;
  subtitle: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  fontFamily: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string | null;
  venueAddress: string | null;
  ceremonyTime: string | null;
  receptionTime: string | null;
  story: string | null;
  coverPhoto: string | null;
  gallery: string[];
  sections: SectionConfig[];
  musicUrl: string | null;
  musicAutoplay: boolean;
  musicFadeIn: boolean;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  isPublished: boolean;
  publishedAt: string | null;
}

// Guest data
export interface GuestData {
  name: string;
  personalization: {
    customMessage: string | null;
    sharedPhoto: string | null;
  };
  rsvp: {
    status: string;
    attendees: number;
  };
}

// API response types
export interface InvitationPublicResponse {
  invitation: InvitationData;
  guest: GuestData | null;
  isPersonalized: boolean;
}

export interface InvitationListItem {
  id: string;
  slug: string;
  title: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  isPublished: boolean;
  status: string;
  template: string;
}

export interface AnalyticsData {
  views: number;
  totalGuests: number;
  attending: number;
  rsvpBreakdown: { status: string; count: number }[];
}

// Template presets
export interface TemplatePreset {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  preview: string;
  sections: SectionConfig[];
}

// Section component props
export interface SectionProps {
  config: Record<string, any>;
  invitation: InvitationData;
  guest: GuestData | null;
}
