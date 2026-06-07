import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { getTemplatePreset, validateSections } from '../config/section-presets';
import crypto from 'crypto';

const router = express.Router();

const generateSlug = (groomName: string, brideName: string): string => {
  const base = `${groomName.toLowerCase().replace(/\s+/g, '-')}-va-${brideName.toLowerCase().replace(/\s+/g, '-')}`;
  const hash = crypto.randomBytes(4).toString('hex');
  return `${base}-${hash}`;
};

// Create invitation
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    const {
      template, title, subtitle, primaryColor, secondaryColor, fontFamily,
      venue, venueAddress, ceremonyTime, receptionTime, story, coverPhoto,
    } = req.body;
    const slug = generateSlug(user.groomName, user.brideName);
    const templateName = template || 'cinematic';
    const sections = getTemplatePreset(templateName);

    const invitation = await prisma.invitation.create({
      data: {
        userId,
        slug,
        template: templateName,
        title: title || `${user.groomName} & ${user.brideName}`,
        subtitle,
        primaryColor: primaryColor || '#d4a574',
        secondaryColor,
        fontFamily: fontFamily || 'Playfair Display',
        groomName: user.groomName,
        brideName: user.brideName,
        weddingDate: user.weddingDate,
        venue,
        venueAddress,
        ceremonyTime,
        receptionTime,
        story,
        coverPhoto,
        sections: sections as any,
      },
    });

    res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
});

// List user's invitations
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const invitations = await prisma.invitation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
});

// Get single invitation by ID (admin)
router.get('/id/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const invitation = await prisma.invitation.findFirst({ where: { id, userId } });
    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }
    res.json({ invitation });
  } catch (error) {
    next(error);
  }
});

// Get single invitation (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const token = req.query.token as string;

    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    // Track view: write the analytics row + (optionally) bump the guest
    // viewCount atomically. If either fails, neither persists — prevents
    // the two from drifting (e.g. analytics row with no viewCount bump,
    // or vice versa).
    let guestData = null;
    const viewTrackingOps: any[] = [
      prisma.analytics.create({
        data: {
          invitationId: invitation.id,
          event: 'view',
          guestToken: token || null,
          userAgent: req.headers['user-agent'] || null,
          ip: req.ip,
        },
      }),
    ];

    let matchedGuest: Awaited<ReturnType<typeof prisma.guest.findFirst>> = null;
    if (token) {
      matchedGuest = await prisma.guest.findFirst({
        where: { invitationId: invitation.id, token },
      });
      if (matchedGuest) {
        // Track view on guest: set viewedAt on first scan, increment viewCount after
        viewTrackingOps.push(
          prisma.guest.update({
            where: { id: matchedGuest.id },
            data: {
              viewedAt: matchedGuest.viewedAt ?? new Date(),
              viewCount: { increment: 1 },
            },
          }),
        );
      }
    }

    const results = await prisma.$transaction(viewTrackingOps);
    if (matchedGuest) {
      // results[1] is the updated guest (analytics row is results[0])
      const updatedGuest = results[1] as typeof matchedGuest;
      guestData = {
        name: updatedGuest.name,
        personalization: {
          customMessage: updatedGuest.customMessage,
          sharedPhoto: updatedGuest.sharedPhoto,
        },
        rsvp: {
          status: updatedGuest.rsvpStatus,
          attendees: updatedGuest.rsvpAttendees,
        },
        view: {
          firstViewedAt: updatedGuest.viewedAt,
          viewCount: updatedGuest.viewCount,
        },
      };
    }

    res.json({
      invitation,
      guest: guestData,
      isPersonalized: !!guestData,
    });
  } catch (error) {
    next(error);
  }
});

// Update invitation
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    // Whitelist updatable fields
    const allowedFields = [
      'title', 'subtitle', 'primaryColor', 'secondaryColor', 'fontFamily',
      'venue', 'venueAddress', 'ceremonyTime', 'receptionTime', 'story',
      'coverPhoto', 'gallery', 'template', 'musicUrl', 'musicAutoplay',
      'musicFadeIn', 'mapUrl', 'latitude', 'longitude',
      'brideName', 'groomName', 'weddingDate',
    ];
    const data: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    // If template changed, reset sections to new preset
    if (data.template && data.template !== invitation.template) {
      data.sections = getTemplatePreset(data.template);
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Update sections (reorder, add, remove, toggle visibility)
router.patch('/:id/sections', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const { sections } = req.body;
    if (!sections) {
      return res.status(400).json({ error: 'Thiếu dữ liệu sections' });
    }

    const validation = validateSections(sections);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Dữ liệu sections không hợp lệ', details: validation.errors });
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: { sections },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Publish invitation
router.post('/:id/publish', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date(), status: 'published' },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Duplicate invitation
router.post('/:id/duplicate', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const original = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!original || !user) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const newSlug = generateSlug(user.groomName, user.brideName);

    const duplicated = await prisma.invitation.create({
      data: {
        userId,
        slug: newSlug,
        template: original.template,
        title: original.title + ' (bản sao)',
        subtitle: original.subtitle,
        primaryColor: original.primaryColor,
        secondaryColor: original.secondaryColor,
        fontFamily: original.fontFamily,
        groomName: original.groomName,
        brideName: original.brideName,
        weddingDate: original.weddingDate,
        venue: original.venue,
        venueAddress: original.venueAddress,
        ceremonyTime: original.ceremonyTime,
        receptionTime: original.receptionTime,
        story: original.story,
        coverPhoto: original.coverPhoto,
        gallery: original.gallery,
        sections: original.sections as any,
        musicUrl: original.musicUrl,
        musicAutoplay: original.musicAutoplay,
        musicFadeIn: original.musicFadeIn,
        mapUrl: original.mapUrl,
        latitude: original.latitude,
        longitude: original.longitude,
      },
    });

    res.status(201).json(duplicated);
  } catch (error) {
    next(error);
  }
});

// Get analytics
router.get('/:id/analytics', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const [totalViews, totalGuests, attending, rsvpBreakdown] = await Promise.all([
      prisma.analytics.count({ where: { invitationId: invitation.id, event: 'view' } }),
      prisma.guest.count({ where: { invitationId: invitation.id } }),
      prisma.guest.count({ where: { invitationId: invitation.id, rsvpStatus: 'attending' } }),
      prisma.guest.groupBy({
        by: ['rsvpStatus'],
        where: { invitationId: invitation.id },
        _count: { rsvpStatus: true },
      }),
    ]);

    res.json({
      views: totalViews,
      totalGuests,
      attending,
      rsvpBreakdown: rsvpBreakdown.map((r) => ({ status: r.rsvpStatus, count: r._count.rsvpStatus })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
