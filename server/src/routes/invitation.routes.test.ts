import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import invitationRoutes from './invitation.routes';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/invitations', invitationRoutes);

// Test user and invitation
let testUser: any;
let testInvitation: any;
let authToken: string;

// Helper: create a fresh invitation for each test that needs a clean slate
async function createTestInvitation(overrides: any = {}) {
  return await prisma.invitation.create({
    data: {
      userId: testUser.id,
      slug: `test-slug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: 'Test Title',
      groomName: 'Original Groom',
      brideName: 'Original Bride',
      weddingDate: new Date('2025-12-25'),
      template: 'cinematic',
      ...overrides,
    },
  });
}

describe('Invitation Routes - brideName / groomName / weddingDate Regression', () => {
  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `test-regression-${Date.now()}@example.com`,
        password: 'hashedpassword',
        groomName: 'Seed Groom',
        brideName: 'Seed Bride',
        weddingDate: new Date('2025-12-25'),
      },
    });

    testInvitation = await createTestInvitation();

    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET!);
  });

  afterAll(async () => {
    await prisma.invitation.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  // ─── REGRESSION GUARD: brideName must persist through PATCH ───
  describe('REGRESSION: brideName must save and persist', () => {
    it('PATCH with brideName → DB reflects the new value (not old, not null)', async () => {
      const updatedBrideName = 'Updated Bride Name';

      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ brideName: updatedBrideName });

      expect(res.status).toBe(200);
      expect(res.body.brideName).toBe(updatedBrideName);

      // ★ Regression guard: direct DB check
      const fromDb = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
      });
      expect(fromDb?.brideName).toBe(updatedBrideName);
    });

    it('PATCH with brideName → old value is gone (not silently ignored)', async () => {
      const invitation = await createTestInvitation();
      const newName = 'Regression Bride';

      await request(app)
        .patch(`/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ brideName: newName });

      const fromDb = await prisma.invitation.findUnique({
        where: { id: invitation.id },
      });
      expect(fromDb?.brideName).toBe(newName);
      expect(fromDb?.brideName).not.toBe('Original Bride');
    });
  });

  // ─── REGRESSION GUARD: groomName must persist through PATCH ───
  describe('REGRESSION: groomName must save and persist', () => {
    it('PATCH with groomName → DB reflects the new value (not old, not null)', async () => {
      const updatedGroomName = 'Updated Groom Name';

      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ groomName: updatedGroomName });

      expect(res.status).toBe(200);
      expect(res.body.groomName).toBe(updatedGroomName);

      const fromDb = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
      });
      expect(fromDb?.groomName).toBe(updatedGroomName);
    });

    it('PATCH with groomName → old value is gone (not silently ignored)', async () => {
      const invitation = await createTestInvitation();
      const newName = 'Regression Groom';

      await request(app)
        .patch(`/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ groomName: newName });

      const fromDb = await prisma.invitation.findUnique({
        where: { id: invitation.id },
      });
      expect(fromDb?.groomName).toBe(newName);
      expect(fromDb?.groomName).not.toBe('Original Groom');
    });
  });

  // ─── REGRESSION GUARD: weddingDate must persist through PATCH ───
  describe('REGRESSION: weddingDate must save and persist', () => {
    it('PATCH with weddingDate → DB reflects the new value', async () => {
      const newDate = '2026-08-20T00:00:00.000Z';

      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ weddingDate: newDate });

      expect(res.status).toBe(200);
      expect(new Date(res.body.weddingDate).toISOString()).toBe(newDate);

      const fromDb = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
      });
      expect(fromDb?.weddingDate.toISOString()).toBe(newDate);
    });
  });

  // ─── REGRESSION GUARD: all three fields in one request ───
  describe('REGRESSION: multi-field PATCH must persist all fields', () => {
    it('PATCH with all three fields → every field is saved, none are silently dropped', async () => {
      const invitation = await createTestInvitation();
      const payload = {
        groomName: 'Multi Groom',
        brideName: 'Multi Bride',
        weddingDate: '2027-01-01T00:00:00.000Z',
      };

      // Generate fresh token for the test user
      const freshToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET!);

      const res = await request(app)
        .patch(`/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${freshToken}`)
        .send(payload);

      // Debug if it fails
      if (res.status !== 200) {
        console.log('PATCH status:', res.status);
        console.log('PATCH body:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.groomName).toBe(payload.groomName);
      expect(res.body.brideName).toBe(payload.brideName);
      expect(new Date(res.body.weddingDate).toISOString()).toBe(payload.weddingDate);

      // ★ Key regression check: verify DB, not just response
      const fromDb = await prisma.invitation.findUnique({
        where: { id: invitation.id },
      });
      expect(fromDb?.groomName).toBe(payload.groomName);
      expect(fromDb?.brideName).toBe(payload.brideName);
      expect(fromDb?.weddingDate.toISOString()).toBe(payload.weddingDate);
    });
  });

  // ─── REGRESSION GUARD: allowedFields whitelist must include critical fields ───
  describe('REGRESSION: server whitelist must include critical fields', () => {
    it('allowedFields must contain brideName (if removed, form saves will silently fail)', () => {
      // Read the route file and verify the whitelist still includes brideName
      const fs = require('fs');
      const routeContent = fs.readFileSync(
        require('path').resolve(__dirname, './invitation.routes.ts'),
        'utf-8'
      );
      expect(routeContent).toMatch(/'brideName'/);
      expect(routeContent).toMatch(/'groomName'/);
      expect(routeContent).toMatch(/'weddingDate'/);
    });
  });

  // ─── REGRESSION GUARD: GET returns the saved values ───
  describe('REGRESSION: GET /:slug returns saved brideName and groomName', () => {
    it('public GET after PATCH brideName → response contains updated value', async () => {
      const invitation = await createTestInvitation();
      const newBride = 'Public Bride';

      await request(app)
        .patch(`/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ brideName: newBride });

      // ★ Regression guard: public route is /invitations/:slug (no auth required)
      const res = await request(app).get(`/invitations/${invitation.slug}`);
      expect(res.status).toBe(200);
      expect(res.body.invitation.brideName).toBe(newBride);
    });
  });

  // ─── ZOD VALIDATION ───
  describe('Zod input validation', () => {
    it('POST /invitations with invalid primaryColor (400)', async () => {
      const res = await request(app)
        .post('/invitations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ primaryColor: 'not-a-hex' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details.primaryColor).toBeDefined();
    });

    it('POST /invitations with coverPhoto that is not a URL (400)', async () => {
      const res = await request(app)
        .post('/invitations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ coverPhoto: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details.coverPhoto).toBeDefined();
    });

    it('PATCH /invitations/:id with latitude out of range (400)', async () => {
      const invitation = await createTestInvitation();
      const res = await request(app)
        .patch(`/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ latitude: 200 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details.latitude).toBeDefined();
    });

    it('PATCH /invitations/:id with unknown field is rejected by strict schema (400)', async () => {
      const invitation = await createTestInvitation();
      const res = await request(app)
        .patch(`/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ unknownField: 'evil' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });
});
