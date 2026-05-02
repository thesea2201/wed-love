import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

const generateGuestToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Add single guest
router.post('/', authenticate, async (req, res, next) => {
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
router.post('/bulk', authenticate, async (req, res, next) => {
  try {
    const { invitationId, guests: guestList } = req.body;
    const userId = (req as any).userId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const results = { imported: 0, failed: [] as any[] };
    const guestsToInsert = [];

    for (let i = 0; i < guestList.length; i++) {
      const guestData = guestList[i];
      if (!guestData.name) {
        results.failed.push({ row: i + 1, reason: 'Name is required' });
        continue;
      }

      guestsToInsert.push({
        invitationId,
        token: generateGuestToken(),
        name: guestData.name,
        email: guestData.email || null,
        phone: guestData.phone || null,
        customMessage: guestData.customMessage || null,
        sharedPhoto: guestData.sharedPhoto || null,
        tableNumber: guestData.tableNumber || null,
      });
      results.imported++;
    }

    if (guestsToInsert.length > 0) {
      await prisma.guest.createMany({ data: guestsToInsert });
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Public RSVP endpoint
router.post('/:token/rsvp', async (req, res, next) => {
  try {
    const { token } = req.params;
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
