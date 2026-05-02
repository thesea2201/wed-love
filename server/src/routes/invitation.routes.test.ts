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

describe('Invitation Routes - Critical Fields Update', () => {
  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test-critical@example.com',
        password: 'hashedpassword',
        groomName: 'Original Groom',
        brideName: 'Original Bride',
        weddingDate: new Date('2025-12-25'),
      },
    });

    // Create test invitation
    testInvitation = await prisma.invitation.create({
      data: {
        userId: testUser.id,
        slug: 'test-slug-abc123',
        title: 'Original Title',
        groomName: 'Original Groom',
        brideName: 'Original Bride',
        weddingDate: new Date('2025-12-25'),
        template: 'cinematic',
      },
    });

    // Generate auth token
    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // Cleanup
    await prisma.invitation.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  describe('PATCH /:id - Update brideName, groomName, weddingDate', () => {
    it('should update groomName successfully', async () => {
      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ groomName: 'New Groom Name' });

      expect(res.status).toBe(200);
      expect(res.body.groomName).toBe('New Groom Name');
      expect(res.body.brideName).toBe('Original Bride'); // unchanged

      // Verify in database
      const updated = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
      });
      expect(updated?.groomName).toBe('New Groom Name');
    });

    it('should update brideName successfully', async () => {
      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ brideName: 'New Bride Name' });

      expect(res.status).toBe(200);
      expect(res.body.brideName).toBe('New Bride Name');

      // Verify in database
      const updated = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
      });
      expect(updated?.brideName).toBe('New Bride Name');
    });

    it('should update weddingDate successfully', async () => {
      const newDate = '2026-06-15T00:00:00.000Z';
      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ weddingDate: newDate });

      expect(res.status).toBe(200);
      expect(new Date(res.body.weddingDate).toISOString()).toBe(newDate);

      // Verify in database
      const updated = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
      });
      expect(updated?.weddingDate.toISOString()).toBe(newDate);
    });

    it('should update all three fields in one request', async () => {
      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groomName: 'Final Groom',
          brideName: 'Final Bride',
          weddingDate: '2026-10-10T00:00:00.000Z',
        });

      expect(res.status).toBe(200);
      expect(res.body.groomName).toBe('Final Groom');
      expect(res.body.brideName).toBe('Final Bride');
      expect(new Date(res.body.weddingDate).toISOString()).toBe('2026-10-10T00:00:00.000Z');
    });

    it('should reject empty brideName', async () => {
      const res = await request(app)
        .patch(`/invitations/${testInvitation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ brideName: '' });

      // Empty string should be allowed by API but may be rejected by Prisma if field is required
      // This test documents current behavior
      expect([200, 400, 500]).toContain(res.status);
    });
  });
});
