import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { connectTestDB, disconnectTestDB, clearCollections, createUser } from './helpers/setup.js';
import { createTestApp } from './helpers/testApp.js';

const app = createTestApp();
const request = supertest(app);

let studentUser;
let studentToken;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections();

  studentUser = await createUser({
    name: 'Alice Student',
    email: 'alice@university.edu',
    role: 'student',
  });

  const loginRes = await request.post('/api/users/login').send({
    email: 'alice@university.edu',
    password: 'Test@1234',
  });
  studentToken = loginRes.body.token;
});

describe('POST /api/users/register – Validation', () => {
  it('rejects registration with missing name', async () => {
    const res = await request.post('/api/users/register').send({
      email: 'newstudent@university.edu',
      password: 'Strong@Pass1',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors.some(e => e.field === 'name')).toBe(true);
  });

  it('rejects registration with missing email', async () => {
    const res = await request.post('/api/users/register').send({
      name: 'New Student',
      password: 'Strong@Pass1',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  it('rejects registration with weak password (no uppercase)', async () => {
    const res = await request.post('/api/users/register').send({
      name: 'New Student',
      email: 'new@university.edu',
      password: 'weak@pass1',
    });
    expect(res.status).toBe(400);
  });

  it('rejects registration with short password (< 8 chars)', async () => {
    const res = await request.post('/api/users/register').send({
      name: 'New Student',
      email: 'new@university.edu',
      password: 'Sh@1',
    });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate email registration', async () => {
    const res = await request.post('/api/users/register').send({
      name: 'Duplicate User',
      email: 'alice@university.edu',
      password: 'Strong@Pass1',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe('POST /api/users/login – Authentication', () => {
  it('logs in with valid email and password, returns JWT + user data', async () => {
    const res = await request.post('/api/users/login').send({
      email: 'alice@university.edu',
      password: 'Test@1234',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.').length).toBe(3);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('alice@university.edu');
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.name).toBe('Alice Student');
  });

  it('rejects login with wrong password', async () => {
    const res = await request.post('/api/users/login').send({
      email: 'alice@university.edu',
      password: 'WrongPass@1',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects login for non-existent email', async () => {
    const res = await request.post('/api/users/login').send({
      email: 'ghost@university.edu',
      password: 'Test@1234',
    });
    expect(res.status).toBe(401);
  });

  it('logs in with registration number instead of email', async () => {
    const userWithRegNum = await createUser({
      name: 'Bob Registered',
      email: 'bob@university.edu',
      role: 'student',
      registrationNumber: '251234567',
    });

    const res = await request.post('/api/users/login').send({
      email: '251234567',
      password: 'Test@1234',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.registrationNumber).toBe('251234567');
  });
});

describe('JWT – Token Protection', () => {
  it('rejects /api/users/profile without token (401)', async () => {
    const res = await request.get('/api/users/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('rejects /api/users/profile with malformed token (401)', async () => {
    const res = await request.get('/api/users/profile')
      .set('Authorization', 'Bearer this-is-not-a-valid-jwt');
    expect(res.status).toBe(401);
  });

  it('returns user profile with valid token', async () => {
    const res = await request.get('/api/users/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@university.edu');
    expect(res.body.data.role).toBe('student');
  });
});

describe('Role-Based Access Control', () => {
  it('denies student access to guild_president-only route (403)', async () => {
    const res = await request.get('/api/events/review/queue')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('denies student access to event approve endpoint (403)', async () => {
    const res = await request.post('/api/events/some-fake-id/approve')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  it('allows guild_president to access review queue', async () => {
    const guildUser = await createUser({
      name: 'Guild President',
      email: 'guild@university.edu',
      role: 'guild_president',
    });

    const loginRes = await request.post('/api/users/login').send({
      email: 'guild@university.edu',
      password: 'Test@1234',
    });
    const guildToken = loginRes.body.token;

    const res = await request.get('/api/events/review/queue')
      .set('Authorization', `Bearer ${guildToken}`);

    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });
});

describe('POST /api/users/refresh-token', () => {
  it('rejects request without refresh token (400)', async () => {
    const res = await request.post('/api/users/refresh-token').send({});
    expect(res.status).toBe(400);
  });

  it('rejects invalid refresh token (401)', async () => {
    const res = await request.post('/api/users/refresh-token').send({
      refreshToken: 'invalid-token',
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users/logout', () => {
  it('logs out successfully and invalidates session', async () => {
    const res = await request.post('/api/users/logout')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Account Lockout', () => {
  it('locks account after multiple failed login attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request.post('/api/users/login').send({
        email: 'alice@university.edu',
        password: 'WrongPass@1',
      });
    }

    const res = await request.post('/api/users/login').send({
      email: 'alice@university.edu',
      password: 'WrongPass@1',
    });

    expect(res.status).toBe(423);
    expect(res.body.success).toBe(false);
    expect(res.body.lockType).toBe('account');
  });

  it('prevents login on locked account even with correct password', async () => {
    for (let i = 0; i < 5; i++) {
      await request.post('/api/users/login').send({
        email: 'alice@university.edu',
        password: 'WrongPass@1',
      });
    }

    const res = await request.post('/api/users/login').send({
      email: 'alice@university.edu',
      password: 'Test@1234',
    });

    expect(res.status).toBe(423);
  });
});
