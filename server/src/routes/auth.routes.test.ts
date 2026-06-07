import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import authRoutes from './auth.routes';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Test user data
const TEST_EMAIL = 'test-auth@example.com';
const TEST_PASSWORD = 'securePassword123';
const TEST_GROOM = 'Auth Groom';
const TEST_BRIDE = 'Auth Bride';
const TEST_WEDDING_DATE = '2026-06-15T00:00:00.000Z';

// Auth token generation helper
function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

describe('Auth Routes - Registration, Login, User Profile', () => {
  let createdUserIds: string[] = [];

  afterEach(async () => {
    // Clean up all test users after each test
    for (const id of createdUserIds) {
      try {
        await prisma.user.delete({ where: { id } });
      } catch {
        // Ignore cleanup errors
      }
    }
    createdUserIds = [];
  });

  // ─── REGISTRATION ───

  describe('POST /auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const email = `newuser-${Date.now()}@example.com`;
      const response = await request(app)
        .post('/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: TEST_WEDDING_DATE,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(email);
      expect(response.body.user.groomName).toBe(TEST_GROOM);
      expect(response.body.user.brideName).toBe(TEST_BRIDE);

      // Store ID for cleanup
      createdUserIds.push(response.body.user.id);
    });

    it('should reject registration with duplicate email (400)', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First registration succeeds
      await request(app)
        .post('/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: TEST_WEDDING_DATE,
        });

      // Second registration with same email fails
      const secondResponse = await request(app)
        .post('/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: TEST_WEDDING_DATE,
        });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body).toHaveProperty('error', 'Email already registered');
    });

    it('should hash password before storing (security check)', async () => {
      const email = `hashcheck-${Date.now()}@example.com`;
      await request(app)
        .post('/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: TEST_WEDDING_DATE,
        });

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user).toBeDefined();
      expect(user!.password).not.toBe(TEST_PASSWORD);
      // bcrypt hash is always 60 characters (starts with $2a$, $2b$, or $2y$)
      expect(user!.password.length).toBe(60);
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'incomplete@example.com',
        // Missing password, groomName, brideName, weddingDate
      });

      // Should return error (500 due to DB constraint or 400 from validation)
      expect([400, 500]).toContain(response.status);
    });

    it('should return user data without password in response', async () => {
      const email = `nopass-${Date.now()}@example.com`;
      const response = await request(app)
        .post('/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: TEST_WEDDING_DATE,
        });

      expect(response.body.user).not.toHaveProperty('password');
      createdUserIds.push(response.body.user.id);
    });
  });

  // ─── LOGIN ───

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const user = await prisma.user.create({
        data: {
          email: TEST_EMAIL,
          password: await (await import('bcryptjs')).hash(TEST_PASSWORD, 12),
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: new Date(TEST_WEDDING_DATE),
        },
      });
      createdUserIds.push(user.id);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(TEST_EMAIL);
      expect(response.body.user.groomName).toBe(TEST_GROOM);
      expect(response.body.user.brideName).toBe(TEST_BRIDE);
    });

    it('should reject login with incorrect password (401)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with non-existent email (401)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: TEST_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with empty password (400 — Zod validation)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject register with bad email format (400 — Zod)', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'not-an-email',
        password: TEST_PASSWORD,
        groomName: TEST_GROOM,
        brideName: TEST_BRIDE,
        weddingDate: TEST_WEDDING_DATE,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.email).toBeDefined();
    });

    it('should reject register with short password (400 — Zod)', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'short-pw@example.com',
        password: 'abc',
        groomName: TEST_GROOM,
        brideName: TEST_BRIDE,
        weddingDate: TEST_WEDDING_DATE,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.password).toBeDefined();
    });
  });

  // ─── PROFILE ───

  describe('GET /auth/me', () => {
    let validToken: string;
    let testUserId: string;

    beforeEach(async () => {
      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `profile-${Date.now()}@example.com`,
          password: await (await import('bcryptjs')).hash(TEST_PASSWORD, 12),
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: new Date(TEST_WEDDING_DATE),
        },
      });
      testUserId = user.id;
      createdUserIds.push(user.id);
      validToken = generateToken(user.id);
    });

    it('should retrieve current user with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBeDefined();
      expect(response.body.user.groomName).toBe(TEST_GROOM);
      expect(response.body.user.brideName).toBe(TEST_BRIDE);
    });

    it('should reject request without authorization header (401)', async () => {
      const response = await request(app).get('/auth/me');
      expect(response.status).toBe(401);
    });

    it('should reject request with malformed token (401)', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 401 if user from token is deleted (middleware rejects)', async () => {
      // The authenticate middleware checks DB for user existence.
      // If user is deleted, middleware returns 401 (not 404).
      await prisma.user.delete({ where: { id: testUserId } });
      createdUserIds = createdUserIds.filter((id) => id !== testUserId);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      // Actual behavior: middleware returns 401 "User not found"
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  // ─── CHANGE PASSWORD ───

  describe('PUT /auth/password', () => {
    let testUserId: string;
    let validToken: string;
    const hashedTestPassword = bcrypt.hashSync(TEST_PASSWORD, 12);

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          email: `pwd-${Date.now()}@example.com`,
          password: hashedTestPassword,
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: new Date(TEST_WEDDING_DATE),
        },
      });
      testUserId = user.id;
      createdUserIds.push(user.id);
      validToken = generateToken(user.id);
    });

    it('changes password when current password is correct', async () => {
      const newPassword = 'newSecurePassword456';
      const response = await request(app)
        .put('/auth/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ currentPassword: TEST_PASSWORD, newPassword });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });

      // Verify the new password works for login
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: (await prisma.user.findUnique({ where: { id: testUserId } }))!.email, password: newPassword });
      expect(loginRes.status).toBe(200);
    });

    it('rejects when current password is wrong (401)', async () => {
      const response = await request(app)
        .put('/auth/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ currentPassword: 'wrongPassword', newPassword: 'newSecurePassword456' });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Mật khẩu hiện tại không đúng/);
    });

    it('rejects new password shorter than 8 chars (400)', async () => {
      const response = await request(app)
        .put('/auth/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ currentPassword: TEST_PASSWORD, newPassword: 'short' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('rejects missing currentPassword (400)', async () => {
      const response = await request(app)
        .put('/auth/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ newPassword: 'newSecurePassword456' });

      expect(response.status).toBe(400);
    });

    it('rejects request without auth (401)', async () => {
      const response = await request(app)
        .put('/auth/password')
        .send({ currentPassword: TEST_PASSWORD, newPassword: 'newSecurePassword456' });

      expect(response.status).toBe(401);
    });

    it('rejects unknown fields in body (strict)', async () => {
      const response = await request(app)
        .put('/auth/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ currentPassword: TEST_PASSWORD, newPassword: 'newSecurePassword456', role: 'admin' });

      expect(response.status).toBe(400);
    });
  });

  // ─── DELETE ACCOUNT ───

  describe('DELETE /auth/account', () => {
    let testUserId: string;
    let validToken: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          email: `del-${Date.now()}@example.com`,
          password: bcrypt.hashSync(TEST_PASSWORD, 12),
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: new Date(TEST_WEDDING_DATE),
        },
      });
      testUserId = user.id;
      createdUserIds.push(user.id);
      validToken = generateToken(user.id);
    });

    it('deletes the user and cascades invitations/guests when password is correct', async () => {
      // Create an invitation + guest to verify cascade
      const invitation = await prisma.invitation.create({
        data: {
          userId: testUserId,
          slug: `cascade-test-${Date.now()}`,
          template: 'cinematic',
          title: 'Anh & Em',
          primaryColor: '#c8956c',
          fontFamily: 'Playfair Display',
          groomName: TEST_GROOM,
          brideName: TEST_BRIDE,
          weddingDate: new Date(TEST_WEDDING_DATE),
        },
      });
      const guest = await prisma.guest.create({
        data: { invitationId: invitation.id, name: 'Khách', token: `tok-${crypto.randomUUID()}` },
      });

      const response = await request(app)
        .delete('/auth/account')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ password: TEST_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });

      // User is gone
      const userAfter = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(userAfter).toBeNull();

      // Cascade worked — invitation + guest are gone too
      const invAfter = await prisma.invitation.findUnique({ where: { id: invitation.id } });
      const guestAfter = await prisma.guest.findUnique({ where: { id: guest.id } });
      expect(invAfter).toBeNull();
      expect(guestAfter).toBeNull();

      // Cleanup list shouldn't try to delete this user
      createdUserIds = createdUserIds.filter((id) => id !== testUserId);
    });

    it('rejects wrong password (401)', async () => {
      const response = await request(app)
        .delete('/auth/account')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ password: 'wrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Mật khẩu không đúng/);

      // User still exists
      const userAfter = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(userAfter).not.toBeNull();
    });

    it('rejects missing password (400)', async () => {
      const response = await request(app)
        .delete('/auth/account')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('rejects request without auth (401)', async () => {
      const response = await request(app)
        .delete('/auth/account')
        .send({ password: TEST_PASSWORD });

      expect(response.status).toBe(401);
    });
  });
});
