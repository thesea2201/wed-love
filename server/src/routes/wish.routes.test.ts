import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import wishRoutes from './wish.routes';
import wishAdminRoutes from './wish-admin.routes';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/', wishRoutes);
app.use('/', wishAdminRoutes);

let testUser: any;
let otherUser: any;
let testInvitation: any;
let testGuest: any;
let otherGuest: any;
let authToken: string;
let otherAuthToken: string;
let guestToken: string;
let otherGuestToken: string;

function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!);
}

const generateGuestToken = (): string => crypto.randomBytes(16).toString('hex');

describe('Wish Routes - Public + Admin', () => {
  beforeAll(async () => {
    const stamp = Date.now();
    testUser = await prisma.user.create({
      data: {
        email: `wish-test-${stamp}@example.com`,
        password: await bcrypt.hash('password123', 12),
        groomName: 'Wish Groom',
        brideName: 'Wish Bride',
        weddingDate: new Date('2026-09-01'),
      },
    });
    otherUser = await prisma.user.create({
      data: {
        email: `wish-other-${stamp}@example.com`,
        password: await bcrypt.hash('password123', 12),
        groomName: 'Other Groom',
        brideName: 'Other Bride',
        weddingDate: new Date('2026-09-01'),
      },
    });
    authToken = generateToken(testUser.id);
    otherAuthToken = generateToken(otherUser.id);

    testInvitation = await prisma.invitation.create({
      data: {
        userId: testUser.id,
        slug: `wish-test-slug-${stamp}`,
        title: 'Wish Test',
        template: 'minimal',
        groomName: 'Wish Groom',
        brideName: 'Wish Bride',
        weddingDate: new Date('2026-09-01'),
      },
    });

    guestToken = generateGuestToken();
    otherGuestToken = generateGuestToken();
    testGuest = await prisma.guest.create({
      data: {
        invitationId: testInvitation.id,
        name: 'Test Guest',
        token: guestToken,
      },
    });
    otherGuest = await prisma.guest.create({
      data: {
        invitationId: testInvitation.id,
        name: 'Other Guest',
        token: otherGuestToken,
      },
    });
  });

  afterAll(async () => {
    await prisma.gift.deleteMany({ where: { invitationId: testInvitation.id } });
    await prisma.wish.deleteMany({ where: { invitationId: testInvitation.id } });
    await prisma.guest.deleteMany({ where: { invitationId: testInvitation.id } });
    await prisma.invitation.delete({ where: { id: testInvitation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  beforeEach(async () => {
    await prisma.gift.deleteMany({ where: { invitationId: testInvitation.id } });
    await prisma.wish.deleteMany({ where: { invitationId: testInvitation.id } });
  });

  describe('GET /public/invitations/:slug/wishes?status=approved', () => {
    it('returns only approved + public wishes', async () => {
      await prisma.wish.create({
        data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'Approved', moderationStatus: 'approved', isPublic: true },
      });
      await prisma.wish.create({
        data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'Pending', moderationStatus: 'pending', isPublic: true },
      });
      await prisma.wish.create({
        data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'Private', moderationStatus: 'approved', isPublic: false },
      });
      const res = await request(app).get(`/public/invitations/${testInvitation.slug}/wishes?status=approved`);
      expect(res.status).toBe(200);
      expect(res.body.wishes).toHaveLength(1);
      expect(res.body.wishes[0].text).toBe('Approved');
    });

    it('returns 404 for unknown slug', async () => {
      const res = await request(app).get('/public/invitations/does-not-exist/wishes');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /public/invitations/:slug/wishes?status=mine', () => {
    it('returns all wishes for the guest when given their token', async () => {
      await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'A', moderationStatus: 'pending' } });
      await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'B', moderationStatus: 'approved' } });
      const res = await request(app).get(`/public/invitations/${testInvitation.slug}/wishes?status=mine&token=${guestToken}`);
      expect(res.status).toBe(200);
      expect(res.body.wishes).toHaveLength(2);
    });

    it('rejects when token missing', async () => {
      const res = await request(app).get(`/public/invitations/${testInvitation.slug}/wishes?status=mine`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /public/invitations/:slug/wishes', () => {
    it('creates a pending wish when given a valid guest token', async () => {
      const res = await request(app).post(`/public/invitations/${testInvitation.slug}/wishes`).send({ guestToken, text: 'Chúc mừng!' });
      expect(res.status).toBe(201);
      expect(res.body.wish.text).toBe('Chúc mừng!');
      expect(res.body.wish.moderationStatus).toBe('pending');
    });

    it('rejects empty text', async () => {
      const res = await request(app).post(`/public/invitations/${testInvitation.slug}/wishes`).send({ guestToken, text: '   ' });
      expect(res.status).toBe(400);
    });

    it('rejects unknown guest token', async () => {
      const res = await request(app).post(`/public/invitations/${testInvitation.slug}/wishes`).send({ guestToken: 'not-real', text: 'hi' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /public/wishes/:id', () => {
    it('lets the guest delete their own pending wish', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'pending' } });
      const res = await request(app).delete(`/public/wishes/${wish.id}?token=${guestToken}`);
      expect(res.status).toBe(200);
      const exists = await prisma.wish.findUnique({ where: { id: wish.id } });
      expect(exists).toBeNull();
    });

    it('blocks deleting an already-approved wish', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'approved' } });
      const res = await request(app).delete(`/public/wishes/${wish.id}?token=${guestToken}`);
      expect(res.status).toBe(400);
    });

    it('blocks another guest from deleting', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'pending' } });
      const res = await request(app).delete(`/public/wishes/${wish.id}?token=${otherGuestToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /public/wishes/:id/gifts', () => {
    it('creates a gift on a wish', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'approved' } });
      const res = await request(app).post(`/public/wishes/${wish.id}/gifts`).send({ guestToken, giftType: 'heart' });
      expect(res.status).toBe(201);
      expect(res.body.gift.giftType).toBe('heart');
    });

    it('rejects unknown gift type', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'approved' } });
      const res = await request(app).post(`/public/wishes/${wish.id}/gifts`).send({ guestToken, giftType: 'spaceship' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /public/invitations/:slug/gifts', () => {
    it('returns gifts, optionally filtered by since', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'approved' } });
      const g1 = await prisma.gift.create({ data: { wishId: wish.id, guestId: testGuest.id, invitationId: testInvitation.id, giftType: 'heart' } });
      await new Promise(r => setTimeout(r, 10));
      const g2 = await prisma.gift.create({ data: { wishId: wish.id, guestId: otherGuest.id, invitationId: testInvitation.id, giftType: 'flower' } });

      const all = await request(app).get(`/public/invitations/${testInvitation.slug}/gifts`);
      expect(all.status).toBe(200);
      expect(all.body.gifts).toHaveLength(2);

      const sinceCutoff = g1.createdAt.toISOString();
      const filtered = await request(app).get(`/public/invitations/${testInvitation.slug}/gifts?since=${encodeURIComponent(sinceCutoff)}`);
      expect(filtered.status).toBe(200);
      expect(filtered.body.gishes).toBeUndefined();
      expect(filtered.body.gifts).toHaveLength(1);
      expect(filtered.body.gifts[0].id).toBe(g2.id);
    });
  });

  describe('GET /admin/invitations/:id/wishes', () => {
    it('returns only the owner\'s invitation wishes', async () => {
      const otherInvitation = await prisma.invitation.create({
        data: {
          userId: otherUser.id,
          slug: `other-slug-${Date.now()}`,
          title: 'Other',
          template: 'minimal',
          groomName: 'O',
          brideName: 'B',
          weddingDate: new Date('2026-09-01'),
        },
      });
      const wish1 = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'mine', moderationStatus: 'pending' } });
      await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: otherInvitation.id, text: 'theirs', moderationStatus: 'pending' } });

      const res = await request(app).get(`/admin/invitations/${testInvitation.id}/wishes`).set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.wishes).toHaveLength(1);
      expect(res.body.wishes[0].id).toBe(wish1.id);

      await prisma.wish.deleteMany({ where: { invitationId: otherInvitation.id } });
      await prisma.invitation.delete({ where: { id: otherInvitation.id } });
    });

    it('rejects non-owner', async () => {
      const res = await request(app).get(`/admin/invitations/${testInvitation.id}/wishes`).set('Authorization', `Bearer ${otherAuthToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /admin/wishes/:id', () => {
    it('approves a pending wish', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'pending' } });
      const res = await request(app).patch(`/admin/wishes/${wish.id}`).set('Authorization', `Bearer ${authToken}`).send({ moderationStatus: 'approved' });
      expect(res.status).toBe(200);
      expect(res.body.wish.moderationStatus).toBe('approved');
    });

    it('rejects bad status', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'pending' } });
      const res = await request(app).patch(`/admin/wishes/${wish.id}`).set('Authorization', `Bearer ${authToken}`).send({ moderationStatus: 'banana' });
      expect(res.status).toBe(400);
    });

    it('blocks non-owner from approving', async () => {
      const wish = await prisma.wish.create({ data: { guestId: testGuest.id, invitationId: testInvitation.id, text: 'x', moderationStatus: 'pending' } });
      const res = await request(app).patch(`/admin/wishes/${wish.id}`).set('Authorization', `Bearer ${otherAuthToken}`).send({ moderationStatus: 'approved' });
      expect(res.status).toBe(403);
    });
  });
});
