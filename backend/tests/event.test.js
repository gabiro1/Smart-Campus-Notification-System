import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { connectTestDB, disconnectTestDB, clearCollections, createUser } from './helpers/setup.js';
import { createTestApp } from './helpers/testApp.js';
import Event from '../modules/event/model/Event.js';
import EventRSVP from '../modules/event/model/EventRSVP.js';

const app = createTestApp();
const request = supertest(app);

const validEventPayload = {
  title: 'AI Workshop 2026',
  description: 'A hands-on workshop covering AI fundamentals and practical applications.',
  organizerName: 'Computing Department',
  organizerRole: 'Student Organizer',
  venue: 'CS Lecture Hall',
  startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  startTime: '10:00',
  endTime: '13:00',
  category: 'workshop',
  targetAudience: ['department'],
  tags: ['ai', 'machine-learning', 'workshop'],
  expectedAttendance: 50,
};

let studentUser, studentToken;
let guildUser, guildToken;
let createdEventId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections();

  studentUser = await createUser({
    name: 'Carol Student',
    email: 'carol@university.edu',
    role: 'student',
  });

  guildUser = await createUser({
    name: 'Diana Guild President',
    email: 'diana@university.edu',
    role: 'guild_president',
  });

  const studentLogin = await request.post('/api/users/login').send({
    email: 'carol@university.edu',
    password: 'Test@1234',
  });
  studentToken = studentLogin.body.token;

  const guildLogin = await request.post('/api/users/login').send({
    email: 'diana@university.edu',
    password: 'Test@1234',
  });
  guildToken = guildLogin.body.token;

  createdEventId = null;
});

describe('POST /api/events/draft – Create Event Draft', () => {
  it('creates a draft event as student with valid payload', async () => {
    const res = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.event).toBeDefined();
    expect(res.body.event.title).toBe(validEventPayload.title);
    expect(res.body.event.status).toBe('DRAFT');
    expect(res.body.event.createdBy.toString()).toBe(studentUser._id.toString());

    createdEventId = res.body.event._id;
  });

  it('rejects draft creation without authentication', async () => {
    const res = await request.post('/api/events/draft')
      .send(validEventPayload);

    expect(res.status).toBe(401);
  });

  it('rejects draft creation with missing title', async () => {
    const payload = { ...validEventPayload };
    delete payload.title;

    const res = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('rejects draft creation with missing venue', async () => {
    const payload = { ...validEventPayload };
    delete payload.venue;

    const res = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(payload);

    expect(res.status).toBe(400);
  });

  it('persists draft event in database', async () => {
    const res = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);

    const eventId = res.body.event._id;
    const dbEvent = await Event.findById(eventId);

    expect(dbEvent).not.toBeNull();
    expect(dbEvent.title).toBe(validEventPayload.title);
    expect(dbEvent.status).toBe('DRAFT');
    expect(dbEvent.createdBy.toString()).toBe(studentUser._id.toString());
  });
});

describe('POST /api/events/draft/:id/submit – Submit for Review', () => {
  beforeEach(async () => {
    const res = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    createdEventId = res.body.event._id;
  });

  it('submits draft event for guild council review', async () => {
    const res = await request.post(`/api/events/draft/${createdEventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(['PENDING_REVIEW', 'UNDER_REVIEW']).toContain(res.body.event.status);
  });

  it('rejects submission of non-existent event (404)', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request.post(`/api/events/draft/${fakeId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/events/:id/approve – Event Approval', () => {
  beforeEach(async () => {
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    createdEventId = draftRes.body.event._id;

    await request.post(`/api/events/draft/${createdEventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);
  });

  it('guild_president can approve submitted event', async () => {
    const res = await request.post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${guildToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('student cannot approve event (403)', async () => {
    const res = await request.post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  it('unauthenticated request is rejected (401)', async () => {
    const res = await request.post(`/api/events/${createdEventId}/approve`);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/events/rsvp – RSVP to Event', () => {
  beforeEach(async () => {
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    createdEventId = draftRes.body.event._id;

    await request.post(`/api/events/draft/${createdEventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    await request.post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${guildToken}`);

    // Publish after approval if separate endpoint exists
    await request.post(`/api/events/${createdEventId}/publish`)
      .set('Authorization', `Bearer ${guildToken}`)
      .catch(() => {});
  });

  it('student can RSVP to a published event', async () => {
    const res = await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventId: createdEventId, status: 'going' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.rsvp.status).toBe('going');
    expect(res.body.rsvp.eventId.toString()).toBe(createdEventId.toString());
  });

  it('persists RSVP in the database', async () => {
    await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventId: createdEventId, status: 'going' });

    const rsvp = await EventRSVP.findOne({
      eventId: createdEventId,
      userId: studentUser._id,
    });

    expect(rsvp).not.toBeNull();
    expect(rsvp.status).toBe('going');
  });

  it('rejects RSVP without eventId (400)', async () => {
    const res = await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'going' });

    expect(res.status).toBe(400);
  });

  it('rejects RSVP to non-existent event (404)', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventId: fakeId, status: 'going' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/events/rsvp/:eventId – Get User RSVP', () => {
  beforeEach(async () => {
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    createdEventId = draftRes.body.event._id;

    await request.post(`/api/events/draft/${createdEventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    await request.post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${guildToken}`);

    await request.post(`/api/events/${createdEventId}/publish`)
      .set('Authorization', `Bearer ${guildToken}`)
      .catch(() => {});

    await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventId: createdEventId, status: 'going' });
  });

  it('returns user RSVP status for an event', async () => {
    const res = await request.get(`/api/events/rsvp/${createdEventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rsvp).not.toBeNull();
    expect(res.body.rsvp.status).toBe('going');
  });

  it('returns null RSVP for user who has not RSVPed', async () => {
    const otherUser = await createUser({
      name: 'Eve Other',
      email: 'eve@university.edu',
      role: 'student',
    });

    const otherLogin = await request.post('/api/users/login').send({
      email: 'eve@university.edu',
      password: 'Test@1234',
    });
    const otherToken = otherLogin.body.token;

    const res = await request.get(`/api/events/rsvp/${createdEventId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rsvp).toBeNull();
  });
});

describe('Event Query Endpoints', () => {
  beforeEach(async () => {
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    createdEventId = draftRes.body.event._id;

    await request.post(`/api/events/draft/${createdEventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    await request.post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${guildToken}`);

    await request.post(`/api/events/${createdEventId}/publish`)
      .set('Authorization', `Bearer ${guildToken}`)
      .catch(() => {});
  });

  it('GET /api/events returns paginated events', async () => {
    const res = await request.get('/api/events')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/events/:id returns event details', async () => {
    const res = await request.get(`/api/events/${createdEventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.event.title).toBe(validEventPayload.title);
  });
});
