import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGuestSchema, bulkGuestSchema, rsvpSchema } from '../schemas';
import type { z } from 'zod';
import crypto from 'crypto';
import QRCode from 'qrcode';

const router = express.Router();

const generateGuestToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Find a guest by id, verify ownership, and send 403/404 if not. Returns
// the guest (with invitation.userId + invitation.slug selected) on success,
// or null after sending the response. Callers must `return` on null.
async function findGuestForUser(
  id: string,
  userId: string,
  res: express.Response,
): Promise<(Awaited<ReturnType<typeof prisma.guest.findUnique>> & { invitation: { userId: string; slug: string } }) | null> {
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: { invitation: { select: { userId: true, slug: true } } },
  });
  if (!guest) {
    res.status(404).json({ error: 'Guest not found' });
    return null;
  }
  const guestAny = guest as any;
  if (guestAny.invitation.userId !== userId) {
    res.status(403).json({ error: 'Not authorized' });
    return null;
  }
  return guestAny;
}

const buildGuestInviteUrl = (
  req: express.Request,
  invitation: { slug: string },
  token: string,
): string => {
  // Prefer explicit public base URL from env, fall back to request host
  const hostHeader = req.get('host');
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const envBase = process.env.PUBLIC_BASE_URL;
  let baseUrl: string;
  if (envBase) {
    try {
      // Validate env-set base URL parses; otherwise fall through to request host
      new URL(envBase);
      baseUrl = envBase;
    } catch {
      baseUrl = `${req.protocol}://${host || 'localhost'}`;
    }
  } else {
    baseUrl = `${req.protocol}://${host || 'localhost'}`;
  }
  return `${baseUrl.replace(/\/$/, '')}/invitation/${invitation.slug}?token=${token}`;
};

// Add single guest
router.post('/', authenticate, validate(createGuestSchema), async (req, res, next) => {
  try {
    const { invitationId, name, email, phone, customMessage, sharedPhoto, tableNumber } = req.body;
    const userId = (req as any).userId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId,
        token: generateGuestToken(),
        name,
        email,
        phone,
        customMessage,
        sharedPhoto,
        tableNumber,
      },
    });

    res.status(201).json(guest);
  } catch (error) {
    next(error);
  }
});

// List guests for invitation
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { invitationId, status, page = '1', limit = '50' } = req.query;
    const userId = (req as any).userId;

    if (!invitationId) {
      return res.status(400).json({ error: 'invitationId required' });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId as string, userId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const where: any = { invitationId: invitationId as string };
    if (status) where.rsvpStatus = status as string;

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.guest.count({ where }),
    ]);

    res.json({
      guests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Bulk import guests
router.post('/bulk', authenticate, validate(bulkGuestSchema), async (req, res, next) => {
  try {
    const { invitationId, guests: guestList } = req.body;
    const userId = (req as any).userId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const guestsToInsert = guestList.map((g: z.infer<typeof bulkGuestSchema>['guests'][number]) => ({
      invitationId,
      token: generateGuestToken(),
      name: g.name,
      email: g.email || null,
      phone: g.phone || null,
      customMessage: g.customMessage || null,
      sharedPhoto: g.sharedPhoto || null,
      tableNumber: g.tableNumber ?? null,
    }));

    const result = await prisma.guest.createMany({ data: guestsToInsert });

    res.json({ imported: result.count, failed: [] });
  } catch (error) {
    next(error);
  }
});

// Public RSVP endpoint
router.post('/:token/rsvp', validate(rsvpSchema), async (req, res, next) => {
  try {
    const { token } = req.params as { token: string };
    const { status, attendees, dietary } = req.body;

    const guest = await prisma.guest.findUnique({ where: { token } });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    const updated = await prisma.guest.update({
      where: { token },
      data: {
        rsvpStatus: status,
        rsvpAttendees: attendees || 0,
        rsvpDietary: dietary || [],
        rsvpResponded: new Date(),
      },
    });

    res.json({
      success: true,
      guest: {
        name: updated.name,
        rsvpStatus: updated.rsvpStatus,
        rsvpAttendees: updated.rsvpAttendees,
      },
    });
  } catch (error) {
    next(error);
  }
});

// QR code info (URL + stats) for a single guest
router.get('/:id/qr-info', authenticate, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;

    const guest = await findGuestForUser(id, userId, res);
    if (!guest) return;

    const url = buildGuestInviteUrl(req, guest.invitation, guest.token);

    res.json({
      guestId: guest.id,
      guestName: guest.name,
      url,
      pngUrl: `/guests/${guest.id}/qr?format=png`,
      svgUrl: `/guests/${guest.id}/qr?format=svg`,
      viewedAt: guest.viewedAt,
      viewCount: guest.viewCount,
    });
  } catch (error) {
    next(error);
  }
});

// QR code image (PNG by default, optional SVG)
router.get('/:id/qr', authenticate, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;
    const formatParam = req.query.format as string | undefined;
    let format: 'png' | 'svg';
    if (formatParam === undefined || formatParam === 'png') {
      format = 'png';
    } else if (formatParam === 'svg') {
      format = 'svg';
    } else {
      return res.status(400).json({ error: 'format must be "png" or "svg"' });
    }

    const guest = await findGuestForUser(id, userId, res);
    if (!guest) return;

    const url = buildGuestInviteUrl(req, guest.invitation, guest.token);

    if (format === 'svg') {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 512,
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'private, max-age=300');
      return res.send(svg);
    }

    const png = await QRCode.toBuffer(url, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
    });
    // Include guest ID in filename to avoid collision when two guest names
    // collapse to the same sanitized string (e.g. "Nguyễn Văn A" and
    // "Nguyễn_Văn_A" both became "Nguy_n_V_n_A").
    const safeName = guest.name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '') || 'guest';
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="qr-${safeName}-${guest.id.slice(0, 8)}.png"`,
    );
    return res.send(png);
  } catch (error) {
    next(error);
  }
});

// Regenerate a guest's token (invalidates old links)
router.post('/:id/regenerate-token', authenticate, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;

    const guest = await findGuestForUser(id, userId, res);
    if (!guest) return;

    // Race protection: only update if the token is still the one we just read.
    // If a concurrent request beat us, the update affects 0 rows and we 409.
    const newToken = generateGuestToken();
    const updateResult = await prisma.guest.updateMany({
      where: { id, token: guest.token },
      data: { token: newToken },
    });
    if (updateResult.count === 0) {
      return res.status(409).json({ error: 'Token was rotated by a concurrent request' });
    }

    const updated = await prisma.guest.findUnique({ where: { id } });
    if (!updated) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({
      guestId: updated.id,
      token: updated.token,
      url: buildGuestInviteUrl(req, guest.invitation, updated.token),
    });
  } catch (error) {
    next(error);
  }
});

// Export guests
router.get('/export', authenticate, async (req, res, next) => {
  try {
    const { invitationId } = req.query;
    const userId = (req as any).userId;

    if (!invitationId) {
      return res.status(400).json({ error: 'invitationId required' });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId as string, userId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitationId as string },
    });

    const formatted = guests.map((g) => ({
      name: g.name,
      email: g.email,
      phone: g.phone,
      rsvp_status: g.rsvpStatus,
      rsvp_attendees: g.rsvpAttendees,
      dietary: g.rsvpDietary.join(', '),
      custom_message: g.customMessage,
      shared_photo: g.sharedPhoto,
    }));

    res.json({
      total: formatted.length,
      attending: formatted.filter((g) => g.rsvp_status === 'attending').length,
      declined: formatted.filter((g) => g.rsvp_status === 'declined').length,
      pending: formatted.filter((g) => g.rsvp_status === 'pending').length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
