import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/v1/admin/invitations/:id/wishes
 * List wishes for moderation. Owner only.
 * ?status=pending (default) | approved | rejected | all
 */
router.get('/admin/invitations/:id/wishes', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const status = (req.query.status as string) || 'pending';

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    }

    const where: any = { invitationId: id };
    if (status !== 'all') {
      where.moderationStatus = status;
    }

    const wishes = await prisma.wish.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: { select: { name: true, email: true } },
        gifts: { select: { id: true, giftType: true, createdAt: true } },
      },
    });

    res.json({ wishes });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/wishes/:id
 * Update moderation status. Owner only.
 * Body: { moderationStatus: 'approved' | 'rejected' }
 */
router.patch('/admin/wishes/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { moderationStatus } = (req.body || {}) as { moderationStatus?: string };

    if (!moderationStatus || !['approved', 'rejected', 'pending'].includes(moderationStatus)) {
      return res.status(400).json({ error: 'moderationStatus phải là approved, rejected, hoặc pending' });
    }

    const wish = await prisma.wish.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true } } },
    });
    if (!wish) {
      return res.status(404).json({ error: 'Không tìm thấy lời chúc' });
    }
    if (wish.invitation.userId !== userId) {
      return res.status(403).json({ error: 'Không có quyền duyệt lời chúc của thiệp cưới này' });
    }

    const updated = await prisma.wish.update({
      where: { id },
      data: { moderationStatus },
      include: {
        guest: { select: { name: true } },
        gifts: true,
      },
    });

    res.json({ wish: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
