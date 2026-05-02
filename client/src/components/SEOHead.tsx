import { Helmet } from 'react-helmet-async';
import type { InvitationData } from '../types';

interface SEOHeadProps {
  invitation: InvitationData;
  guestName?: string | null;
}

export default function SEOHead({ invitation, guestName }: SEOHeadProps) {
  // Build title
  const coupleNames = `${invitation.groomName} & ${invitation.brideName}`;
  const pageTitle = invitation.title || coupleNames;
  const fullTitle = guestName
    ? `Thiệp mời ${coupleNames} - Kính mời ${guestName}`
    : `${pageTitle} | WedLove - Thiệp cưới online`;

  // Build description
  const weddingDate = new Date(invitation.weddingDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const venue = invitation.venue || 'Địa điểm hẹn hò';
  const description = invitation.subtitle
    ? `${invitation.subtitle}. ${coupleNames} tổ chức đám cưới vào ${weddingDate} tại ${venue}.`
    : `${coupleNames} trân trọng kính mời bạn đến dự đám cưới của chúng tôi vào ${weddingDate} tại ${venue}.`;

  // Cover image for sharing
  const coverImage = invitation.coverPhoto || invitation.gallery[0] || 'https://wedlove.pro/og-image.jpg';
  const canonicalUrl = `https://wedlove.pro/invitation/${invitation.slug}`;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={coverImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="WedLove" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={coverImage} />

      {/* Additional Meta */}
      <meta name="theme-color" content={invitation.primaryColor || '#c8956c'} />
      <meta name="apple-mobile-web-app-title" content={pageTitle} />

      {/* Preconnect for fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
}
