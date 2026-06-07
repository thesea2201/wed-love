import type { SectionConfig, SectionProps, InvitationData, GuestData, SectionType } from '../../types';
import HeroSection from './HeroSection';
import StorySection from './StorySection';
import EventSection from './EventSection';
import RSVPSection from './RSVPSection';
import GallerySection from './GallerySection';
import CountdownSection from './CountdownSection';
import MapSection from './MapSection';
import MusicSection from './MusicSection';
import GiftSection from './GiftSection';

const SECTION_COMPONENTS: Partial<Record<SectionType, React.ComponentType<SectionProps>>> = {
  hero: HeroSection as any,
  story: StorySection as any,
  event: EventSection as any,
  rsvp: RSVPSection as any,
  gallery: GallerySection,
  countdown: CountdownSection,
  map: MapSection,
  music: MusicSection,
  gift: GiftSection,
};

interface SectionRendererProps {
  sections: SectionConfig[];
  invitation: InvitationData;
  guest: GuestData | null;
  guestToken?: string | null;
}

export default function SectionRenderer({ sections, invitation, guest, guestToken }: SectionRendererProps) {
  const visibleSections = sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleSections.map(section => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;

        // Pass extra props for specific sections
        const extraProps: Record<string, any> = {};
        if (section.type === 'rsvp' && guestToken) {
          extraProps.token = guestToken;
        }

        return (
          <Component
            key={section.id}
            config={section.config}
            invitation={invitation}
            guest={guest}
            {...extraProps}
          />
        );
      })}
    </>
  );
}
