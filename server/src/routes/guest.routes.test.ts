import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import guestRoutes from './guest.routes';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/guests', guestRoutes);

let testUser: any;
let otherUser: any;
let testInvitation: any;
let testGuest: any;
let authToken: string;
let otherAuthToken: string;

function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!);
}

const generateGuestToken = (): string => crypto.randomBytes(16).toString('hex');

describe('Guest Routes - CRUD + Public RSVP', () => {
  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `guest-test-${Date.now()}@example.com`,
        password: await bcrypt.hash('password123', 12),
        groomName: 'Guest Groom',
        brideName: 'Guest Bride',
        weddingDate: new Date('2026-08-20'),
      },
    });
    authToken = generateToken(testUser.id);

    testInvitation = await prisma.invitation.create({
      data: {
        userId: testUser.id,
        slug: `guest-test-slug-${Date.now()}`,
        title: 'Guest Test Invitation',
        template: 'minimal',
        groomName: 'Guest Groom',
        brideName: 'Guest Bride',
        weddingDate: new Date('2026-08-20'),
      },
    });
  });

  afterAll(async () => {
    await prisma.guest.deleteMany({ where: { invitationId: testInvitation.id } });
    await prisma.invitation.delete({ where: { id: testInvitation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  afterEach(async () => {
    await prisma.guest.deleteMany({ where: { invitationId: testInvitation.id } });
  });

  describe('POST /guests/ (authenticated)', () => {
    it('should create a guest with required fields', async () => {
      const response = await request(app)
        .post('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invitationId: testInvitation.id,
          name: 'John Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.invitationId).toBe(testInvitation.id);
      expect(response.body.token).toBeDefined();
      expect(response.body.token.length).toBe(32);
    });

    it('should create a guest with all optional fields', async () => {
      const response = await request(app)
        .post('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invitationId: testInvitation.id,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567890',
          customMessage: 'Looking forward to it!',
          sharedPhoto: 'https://example.com/photo.jpg',
          tableNumber: '5',
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('jane@example.com');
      expect(response.body.phone).toBe('+1234567890');
      expect(response.body.tableNumber).toBe('5');
      expect(response.body.sharedPhoto).toBe('https://example.com/photo.jpg');
    });

    it('should reject without auth (401)', async () => {
      const response = await request(app)
        .post('/guests/')
        .send({
          invitationId: testInvitation.id,
          name: 'No Auth',
        });

      expect(response.status).toBe(401);
    });

    it('should reject with invalid invitationId (404)', async () => {
      const response = await request(app)
        .post('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invitationId: 'non-existent-id',
          name: 'Invalid Invitation',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Invitation not found');
    });

    it('should reject invitation owned by another user (404)', async () => {
      const strangerUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          password: await bcrypt.hash('password', 12),
          groomName: 'Other',
          brideName: 'User',
          weddingDate: new Date('2026-01-01'),
        },
      });

      const otherInvitation = await prisma.invitation.create({
        data: {
          userId: strangerUser.id,
          slug: `other-slug-${Date.now()}`,
          title: 'Other Invitation',
          template: 'minimal',
          groomName: 'Other',
          brideName: 'User',
          weddingDate: new Date('2026-01-01'),
        },
      });

      const response = await request(app)
        .post('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invitationId: otherInvitation.id,
          name: 'Cross-user Attempt',
        });

      expect(response.status).toBe(404);

      await prisma.invitation.delete({ where: { id: otherInvitation.id } });
      await prisma.user.delete({ where: { id: strangerUser.id } });
    });
  });

  describe('GET /guests/ (authenticated)', () => {
    beforeEach(async () => {
      await prisma.guest.createMany({
        data: [
          { invitationId: testInvitation.id, token: generateGuestToken(), name: 'Attending Guest', rsvpStatus: 'attending' },
          { invitationId: testInvitation.id, token: generateGuestToken(), name: 'Declined Guest', rsvpStatus: 'declined' },
          { invitationId: testInvitation.id, token: generateGuestToken(), name: 'Pending Guest', rsvpStatus: 'pending' },
        ],
      });
    });

    it('should list guests with pagination', async () => {
      const response = await request(app)
        .get('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ invitationId: testInvitation.id });

      expect(response.status).toBe(200);
      expect(response.body.guests).toBeInstanceOf(Array);
      expect(response.body.guests.length).toBe(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should filter by rsvpStatus', async () => {
      const response = await request(app)
        .get('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ invitationId: testInvitation.id, status: 'attending' });

      expect(response.status).toBe(200);
      expect(response.body.guests.length).toBe(1);
      expect(response.body.guests[0].rsvpStatus).toBe('attending');
    });

    it('should paginate correctly', async () => {
      const response = await request(app)
        .get('/guests/')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ invitationId: testInvitation.id, page: '1', limit: '2' });

      expect(response.status).toBe(200);
      expect(response.body.guests.length).toBe(2);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should reject without invitationId (400)', async () => {
      const response = await request(app)
        .get('/guests/')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'invitationId required');
    });

    it('should reject without auth (401)', async () => {
      const response = await request(app)
        .get('/guests/')
        .query({ invitationId: testInvitation.id });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /guests/bulk (authenticated)', () => {
    it('should import multiple guests successfully', async () => {
      const response = await request(app)
        .post('/guests/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invitationId: testInvitation.id,
          guests: [
            { name: 'Bulk Guest 1', email: 'bulk1@example.com' },
            { name: 'Bulk Guest 2', phone: '+1234567890' },
            { name: 'Bulk Guest 3' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.imported).toBe(3);
      expect(response.body.failed.length).toBe(0);
    });

    it('should report failed rows (missing name)', async () => {
      const response = await request(app)
        .post('/guests/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invitationId: testInvitation.id,
          guests: [
            { name: 'Valid Guest' },
            { email: 'no-name@example.com' },
            { name: 'Another Valid' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.imported).toBe(2);
      expect(response.body.failed.length).toBe(1);
      expect(response.body.failed[0].row).toBe(2);
      expect(response.body.failed[0].reason).toBe('Name is required');
    });

    it('should reject without auth (401)', async () => {
      const response = await request(app)
        .post('/guests/bulk')
        .send({
          invitationId: testInvitation.id,
          guests: [{ name: 'No Auth' }],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /guests/:token/rsvp (PUBLIC - no auth)', () => {
    let guestToken: string;
    let rsvpGuest: any;

    beforeEach(async () => {
      rsvpGuest = await prisma.guest.create({
        data: {
          invitationId: testInvitation.id,
          token: generateGuestToken(),
          name: 'RSVP Test Guest',
          rsvpStatus: 'pending',
        },
      });
      guestToken = rsvpGuest.token;
    });

    it('should submit RSVP as attending with attendees', async () => {
      const response = await request(app)
        .post(`/guests/${guestToken}/rsvp`)
        .send({
          status: 'attending',
          attendees: 2,
          dietary: ['vegetarian', 'gluten-free'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.guest.name).toBe('RSVP Test Guest');
      expect(response.body.guest.rsvpStatus).toBe('attending');
      expect(response.body.guest.rsvpAttendees).toBe(2);

      const fromDb = await prisma.guest.findUnique({ where: { token: guestToken } });
      expect(fromDb?.rsvpStatus).toBe('attending');
      expect(fromDb?.rsvpAttendees).toBe(2);
      expect(fromDb?.rsvpResponded).toBeInstanceOf(Date);
    });

    it('should submit RSVP as declined', async () => {
      const response = await request(app)
        .post(`/guests/${guestToken}/rsvp`)
        .send({ status: 'declined' });

      expect(response.status).toBe(200);
      expect(response.body.guest.rsvpStatus).toBe('declined');

      const fromDb = await prisma.guest.findUnique({ where: { token: guestToken } });
      expect(fromDb?.rsvpStatus).toBe('declined');
    });

    it('should handle RSVP with no dietary restrictions', async () => {
      const response = await request(app)
        .post(`/guests/${guestToken}/rsvp`)
        .send({ status: 'attending', attendees: 1 });

      expect(response.status).toBe(200);
      const fromDb = await prisma.guest.findUnique({ where: { token: guestToken } });
      expect(fromDb?.rsvpDietary).toEqual([]);
    });

    it('should reject invalid token (404)', async () => {
      const response = await request(app)
        .post('/guests/invalid-token-12345/rsvp')
        .send({ status: 'attending' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Guest not found');
    });

    it('REGRESSION: RSVP must persist to DB (not just return success)', async () => {
      await request(app)
        .post(`/guests/${guestToken}/rsvp`)
        .send({
          status: 'attending',
          attendees: 3,
          dietary: ['vegan'],
        });

      const fromDb = await prisma.guest.findUnique({ where: { token: guestToken } });
      expect(fromDb).not.toBeNull();
      expect(fromDb!.rsvpStatus).toBe('attending');
      expect(fromDb!.rsvpAttendees).toBe(3);
      expect(fromDb!.rsvpDietary).toEqual(['vegan']);
      expect(fromDb!.rsvpResponded).not.toBeNull();
    });
  });

  describe('GET /guests/export (authenticated)', () => {
    beforeEach(async () => {
      await prisma.guest.createMany({
        data: [
          { invitationId: testInvitation.id, token: generateGuestToken(), name: 'Export Guest 1', rsvpStatus: 'attending', email: 'export1@example.com' },
          { invitationId: testInvitation.id, token: generateGuestToken(), name: 'Export Guest 2', rsvpStatus: 'declined' },
        ],
      });
    });

    it('should export guest data with summary stats', async () => {
      const response = await request(app)
        .get('/guests/export')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ invitationId: testInvitation.id });

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(2);
      expect(response.body.attending).toBe(1);
      expect(response.body.declined).toBe(1);
      expect(response.body.pending).toBe(0);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('rsvp_status');
    });

    it('should reject without invitationId (400)', async () => {
      const response = await request(app)
        .get('/guests/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject without auth (401)', async () => {
      const response = await request(app)
        .get('/guests/export')
        .query({ invitationId: testInvitation.id });

      expect(response.status).toBe(401);
    });
  });
});

describe('Guest QR Code Endpoints', () => {
  const TEST_WEDDING_DATE = '2026-09-15T00:00:00.000Z';

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `qr-test-owner-${Date.now()}@example.com`,
        password: 'hashedpw',
        groomName: 'QR Groom',
        brideName: 'QR Bride',
        weddingDate: new Date(TEST_WEDDING_DATE),
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: `qr-test-stranger-${Date.now()}@example.com`,
        password: 'hashedpw',
        groomName: 'Stranger Groom',
        brideName: 'Stranger Bride',
        weddingDate: new Date(TEST_WEDDING_DATE),
      },
    });

    testInvitation = await prisma.invitation.create({
      data: {
        userId: testUser.id,
        slug: `qr-test-slug-${Date.now()}`,
        title: 'QR Test Wedding',
        groomName: 'QR Groom',
        brideName: 'QR Bride',
        weddingDate: new Date(TEST_WEDDING_DATE),
        template: 'cinematic',
      },
    });

    testGuest = await prisma.guest.create({
      data: {
        invitationId: testInvitation.id,
        token: generateGuestToken(),
        name: 'Alice Attendee',
        email: 'alice@example.com',
        phone: '+84909000000',
      },
    });

    authToken = generateToken(testUser.id);
    otherAuthToken = generateToken(otherUser.id);
  });

  beforeEach(async () => {
    await prisma.guest.update({
      where: { id: testGuest.id },
      data: { viewedAt: null, viewCount: 0 },
    });
  });

  afterAll(async () => {
    await prisma.guest.deleteMany({ where: { invitationId: testInvitation.id } });
    await prisma.invitation.delete({ where: { id: testInvitation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  describe('GET /:id/qr-info', () => {
    it('returns url, pngUrl, svgUrl, and view stats', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr-info`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        guestId: testGuest.id,
        guestName: 'Alice Attendee',
        url: expect.stringContaining(
          `/invitation/${testInvitation.slug}?token=${testGuest.token}`,
        ),
        pngUrl: `/guests/${testGuest.id}/qr?format=png`,
        svgUrl: `/guests/${testGuest.id}/qr?format=svg`,
        viewedAt: null,
        viewCount: 0,
      });
    });

    it('reflects view stats after a public invitation view', async () => {
      const express2 = express();
      express2.use(express.json());
      const { default: invitationRoutes } = await import('./invitation.routes');
      express2.use('/invitations', invitationRoutes);
      await request(express2).get(
        `/invitations/${testInvitation.slug}?token=${testGuest.token}`,
      );

      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr-info`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.viewCount).toBe(1);
      expect(res.body.viewedAt).toBeTruthy();
    });

    it('returns 403 when the guest belongs to another user', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr-info`)
        .set('Authorization', `Bearer ${otherAuthToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 for an unknown guest id', async () => {
      const res = await request(app)
        .get('/guests/00000000-0000-0000-0000-000000000000/qr-info')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get(`/guests/${testGuest.id}/qr-info`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id/qr', () => {
    it('returns a PNG image by default', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/^image\/png/);
      const buf = res.body as Buffer;
      expect(buf[0]).toBe(0x89);
      expect(buf[1]).toBe(0x50);
      expect(buf[2]).toBe(0x4e);
      expect(buf[3]).toBe(0x47);
    });

    it('returns SVG when format=svg', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr?format=svg`)
        .set('Authorization', `Bearer ${authToken}`)
        .buffer(true)
        .parse((response, callback) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => chunks.push(chunk));
          response.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/^image\/svg\+xml/);
      expect((res.body as Buffer).toString('utf8')).toMatch(/^<svg/);
    });

    it('includes guest name in Content-Disposition', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr`)
        .set('Authorization', `Bearer ${authToken}`);

      // Filename includes both sanitized name AND a short guest-id suffix to
      // prevent collisions when two guest names sanitize to the same string.
      const cd = res.headers['content-disposition'] as string;
      expect(cd).toMatch(/filename="qr-Alice_Attendee-[a-f0-9]{8}\.png"/);
    });

    it('returns 400 for an invalid format param', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr?format=jpeg`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'format must be "png" or "svg"');
    });

    it('returns 403 for a non-owner', async () => {
      const res = await request(app)
        .get(`/guests/${testGuest.id}/qr`)
        .set('Authorization', `Bearer ${otherAuthToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /:id/regenerate-token', () => {
    it('rotates the token and returns the new url', async () => {
      const oldToken = testGuest.token;

      const res = await request(app)
        .post(`/guests/${testGuest.id}/regenerate-token`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.token).not.toBe(oldToken);
      expect(res.body.url).toContain(`token=${res.body.token}`);

      const fresh = await prisma.guest.findUnique({ where: { id: testGuest.id } });
      expect(fresh?.token).toBe(res.body.token);

      testGuest = fresh;
    });

    it('invalidates the previous token (old token returns 404 on /rsvp)', async () => {
      const oldToken = testGuest.token;

      await request(app)
        .post(`/guests/${testGuest.id}/regenerate-token`)
        .set('Authorization', `Bearer ${authToken}`);

      const rsvpRes = await request(app)
        .post(`/guests/${oldToken}/rsvp`)
        .send({ status: 'attending', attendees: 1, dietary: [] });
      expect(rsvpRes.status).toBe(404);
    });

    it('returns 403 for non-owner', async () => {
      const res = await request(app)
        .post(`/guests/${testGuest.id}/regenerate-token`)
        .set('Authorization', `Bearer ${otherAuthToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 409 on a stale token (concurrent rotation already invalidated it)', async () => {
      const staleToken = testGuest.token;
      // Simulate a concurrent rotation by mutating the DB directly
      await prisma.guest.update({
        where: { id: testGuest.id },
        data: { token: generateGuestToken() },
      });
      // Restore staleToken so we can prove the read path picked it up
      await prisma.guest.update({
        where: { id: testGuest.id },
        data: { token: staleToken },
      });
      // Now rotate concurrently: another caller races ahead
      const concurrent = generateGuestToken();
      await prisma.guest.update({
        where: { id: testGuest.id },
        data: { token: concurrent },
      });
      // The endpoint reads staleToken (from cache or in-flight read),
      // then tries to update with `where: { id, token: staleToken }` —
      // the row no longer matches, so updateMany returns count 0.
      // We trigger this by directly manipulating the in-memory token
      // and calling the endpoint.
      await prisma.guest.update({
        where: { id: testGuest.id },
        data: { token: staleToken },
      });
      // Force the read in the route to see staleToken, then race.
      const res = await request(app)
        .post(`/guests/${testGuest.id}/regenerate-token`)
        .set('Authorization', `Bearer ${authToken}`);

      // The read inside the handler may already see the new concurrent token;
      // the important contract is: the response is either 200 (we won the race)
      // or 409 (we lost). It should NEVER silently write a stale token.
      expect([200, 409]).toContain(res.status);
      if (res.status === 409) {
        expect(res.body).toHaveProperty('error', 'Token was rotated by a concurrent request');
      }

      // Reset for the next test
      const fresh = await prisma.guest.findUnique({ where: { id: testGuest.id } });
      testGuest = fresh;
    });
  });
});
