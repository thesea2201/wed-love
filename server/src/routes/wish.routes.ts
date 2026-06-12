import express from 'express';
import { prisma } from '../config/database';

const router = express.Router();

/**
 * GET /api/v1/public/invitations/:slug/wishes
 * List wishes for an invitation. Public endpoint.
 * - ?status=approved (default) returns only approved + public wishes (visible to all)
 * - ?status=mine requires guestToken, returns this guest's own wishes (any status)
 */
router.get('/public/invitations/:slug/wishes', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const status = (req.query.status as string) || 'approved';
    const token = req.query.token as string | undefined;

    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    if (status === 'mine') {
      if (!token) {
        return res.status(400).json({ error: 'Thiếu guestToken' });
      }
      const guest = await prisma.guest.findFirst({
        where: { invitationId: invitation.id, token },
      });
      if (!guest) {
        return res.status(404).json({ error: 'Không tìm thấy khách mời' });
      }
      const wishes = await prisma.wish.findMany({
        where: { guestId: guest.id, invitationId: invitation.id },
        orderBy: { createdAt: 'desc' },
        include: { gifts: { select: { id: true, giftType: true, guestId: true, createdAt: true } } },
      });
      return res.json({ wishes });
    }

    if (status !== 'approved') {
      return res.status(400).json({ error: 'Chỉ hỗ trợ status=approved hoặc status=mine' });
    }

    const wishes = await prisma.wish.findMany({
      where: {
        invitationId: invitation.id,
        moderationStatus: 'approved',
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        guest: { select: { name: true } },
        gifts: { select: { id: true, giftType: true, guestId: true, createdAt: true } },
      },
    });

    return res.json({ wishes });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/public/invitations/:slug/wishes
 * Guest creates a wish. Requires guestToken in body.
 * moderationStatus defaults to 'pending'.
 */
router.post('/public/invitations/:slug/wishes', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { guestToken, text, audioUrl, audioDuration } = req.body || {};

    if (!guestToken) {
      return res.status(400).json({ error: 'Thiếu guestToken' });
    }
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Lời chúc không được để trống' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: 'Lời chúc quá dài (tối đa 2000 ký tự)' });
    }

    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const guest = await prisma.guest.findFirst({
      where: { invitationId: invitation.id, token: guestToken },
    });
    if (!guest) {
      return res.status(404).json({ error: 'Không tìm thấy khách mời' });
    }

    const wish = await prisma.wish.create({
      data: {
        guestId: guest.id,
        invitationId: invitation.id,
        text: text.trim(),
        audioUrl: audioUrl || null,
        audioDuration: audioDuration || null,
        moderationStatus: 'pending',
        isPublic: true,
      },
      include: {
        guest: { select: { name: true } },
        gifts: true,
      },
    });

    res.status(201).json({ wish });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/public/wishes/:id
 * Guest can delete their own wish. Only if moderationStatus is still 'pending'.
 */
router.delete('/public/wishes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = req.query.token as string | undefined;

    if (!token) {
      return res.status(400).json({ error: 'Thiếu guestToken' });
    }

    const wish = await prisma.wish.findUnique({ where: { id } });
    if (!wish) {
      return res.status(404).json({ error: 'Không tìm thấy lời chúc' });
    }

    const guest = await prisma.guest.findFirst({
      where: { id: wish.guestId, token },
    });
    if (!guest) {
      return res.status(403).json({ error: 'Không có quyền xóa lời chúc này' });
    }

    if (wish.moderationStatus !== 'pending') {
      return res.status(400).json({ error: 'Chỉ có thể xóa lời chúc đang chờ duyệt' });
    }

    await prisma.wish.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/public/invitations/:slug/gifts
 * List recent gifts for an invitation (for animation polling).
 * ?since=ISO returns only gifts newer than the timestamp.
 */
router.get('/public/invitations/:slug/gifts', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const since = req.query.since as string | undefined;

    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const gifts = await prisma.gift.findMany({
      where: {
        invitationId: invitation.id,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { guest: { select: { name: true } } },
    });

    res.json({ gifts });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/public/wishes/:id/gifts
 * Guest sends a virtual gift attached to a wish. Mock (no payment).
 */
router.post('/public/wishes/:id/gifts', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { guestToken, giftType } = req.body || {};

    if (!guestToken) {
      return res.status(400).json({ error: 'Thiếu guestToken' });
    }

    const validTypes = ['heart', 'flower', 'star', 'cake', 'ring'];
    if (!validTypes.includes(giftType)) {
      return res.status(400).json({ error: `giftType phải là một trong: ${validTypes.join(', ')}` });
    }

    const wish = await prisma.wish.findUnique({ where: { id } });
    if (!wish) {
      return res.status(404).json({ error: 'Không tìm thấy lời chúc' });
    }

    const guest = await prisma.guest.findFirst({
      where: { invitationId: wish.invitationId, token: guestToken },
    });
    if (!guest) {
      return res.status(404).json({ error: 'Không tìm thấy khách mời' });
    }

    const gift = await prisma.gift.create({
      data: {
        wishId: wish.id,
        guestId: guest.id,
        invitationId: wish.invitationId,
        giftType,
      },
    });

    res.status(201).json({ gift });
  } catch (error) {
    next(error);
  }
});

export default router;
