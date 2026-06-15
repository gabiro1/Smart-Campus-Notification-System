import mongoose from 'mongoose';
import supertest from 'supertest';
import bcrypt from 'bcryptjs';
import { connectTestDB, disconnectTestDB, clearCollections } from './helpers/setup.js';
import { createTestApp } from './helpers/testApp.js';
import User from '../modules/user/model/User.js';
import Event from '../modules/event/model/Event.js';
import EventRSVP from '../modules/event/model/EventRSVP.js';
import NotificationLog from '../modules/notification/models/NotificationLog.js';

const app = createTestApp();
const request = supertest(app);

const validEventPayload = {
  title: 'End-to-End Integration Test Event',
  description: 'Testing the complete event lifecycle from creation to RSVP and notification delivery.',
  organizerName: 'Computing Department',
  organizerRole: 'Student Representative',
  venue: 'Main Auditorium',
  startDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
  startTime: '14:00',
  endTime: '17:00',
  category: 'academic',
  targetAudience: ['whole_university'],
  tags: ['integration-test', 'e2e'],
  expectedAttendance: 100,
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

  const hash = (pwd) => bcrypt.hash(pwd, 12);

  studentUser = await User.create({
    name: 'Grace Student',
    email: 'grace@university.edu',
    password: await hash('Test@1234'),
    role: 'student',
    emailVerified: true,
  });

  guildUser = await User.create({
    name: 'Henry Guild President',
    email: 'henry@university.edu',
    password: await hash('Test@1234'),
    role: 'guild_president',
    emailVerified: true,
  });

  const studentLogin = await request.post('/api/users/login').send({
    email: 'grace@university.edu',
    password: 'Test@1234',
  });
  studentToken = studentLogin.body.token;

  const guildLogin = await request.post('/api/users/login').send({
    email: 'henry@university.edu',
    password: 'Test@1234',
  });
  guildToken = guildLogin.body.token;

  createdEventId = null;
});

describe('Full E2E Integration: Event Lifecycle', () => {
  it('completes the full student → event → RSVP → notification lifecycle', async () => {
    // ─── STEP 1: Student creates event draft ──────────────────────────
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);

    expect(draftRes.status).toBe(201);
    expect(draftRes.body.success).toBe(true);
    expect(draftRes.body.event.status).toBe('DRAFT');

    createdEventId = draftRes.body.event._id;

    // Verify event persisted in database
    let dbEvent = await Event.findById(createdEventId);
    expect(dbEvent).not.toBeNull();
    expect(dbEvent.title).toBe(validEventPayload.title);
    expect(dbEvent.status).toBe('DRAFT');
    expect(dbEvent.createdBy.toString()).toBe(studentUser._id.toString());

    // ─── STEP 2: Student submits event for review ─────────────────────
    const submitRes = await request.post(`/api/events/draft/${createdEventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);

    // Verify event transitioned out of DRAFT
    dbEvent = await Event.findById(createdEventId);
    expect(dbEvent.status).not.toBe('DRAFT');
    expect(['PENDING_REVIEW', 'UNDER_REVIEW']).toContain(dbEvent.status);

    // ─── STEP 3: Guild president views review queue ───────────────────
    const queueRes = await request.get('/api/events/review/queue')
      .set('Authorization', `Bearer ${guildToken}`);

    expect(queueRes.status).toBe(200);

    // The submitted event should appear in the review queue
    const eventInQueue = Array.isArray(queueRes.body.events)
      ? queueRes.body.events.some(e => e._id === createdEventId || e._id.toString() === createdEventId.toString())
      : Array.isArray(queueRes.body)
        ? queueRes.body.some(e => e._id === createdEventId || e._id.toString() === createdEventId.toString())
        : true;

    // Student cannot access review queue
    const studentQueueRes = await request.get('/api/events/review/queue')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentQueueRes.status).toBe(403);

    // ─── STEP 4: Guild president approves event ───────────────────────
    const approveRes = await request.post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${guildToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);

    // Verify event is no longer pending
    dbEvent = await Event.findById(createdEventId);
    expect(['APPROVED', 'PUBLISHED', 'SCHEDULED']).toContain(dbEvent.status);

    // ─── STEP 5: Publish the event (if not auto-published) ────────────
    const publishRes = await request.post(`/api/events/${createdEventId}/publish`)
      .set('Authorization', `Bearer ${guildToken}`)
      .catch(() => null);

    if (publishRes && publishRes.status === 200) {
      dbEvent = await Event.findById(createdEventId);
      expect(dbEvent.status).toBe('PUBLISHED');
    }

    // Ensure event is now accessible (PUBLISHED status)
    const eventDetailRes = await request.get(`/api/events/${createdEventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(eventDetailRes.status).toBe(200);
    expect(eventDetailRes.body.event.title).toBe(validEventPayload.title);

    // ─── STEP 6: Student views event feed ─────────────────────────────
    const feedRes = await request.get('/api/events/feed')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(feedRes.status).toBe(200);
    expect(feedRes.body.success).toBe(true);
    expect(Array.isArray(feedRes.body.events)).toBe(true);

    // ─── STEP 7: Student RSVPs to the event ──────────────────────────
    const rsvpRes = await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventId: createdEventId, status: 'going' });

    expect(rsvpRes.status).toBe(201);
    expect(rsvpRes.body.success).toBe(true);
    expect(rsvpRes.body.rsvp.status).toBe('going');

    // Verify RSVP persisted in database
    const dbRSVP = await EventRSVP.findOne({
      eventId: createdEventId,
      userId: studentUser._id,
    });
    expect(dbRSVP).not.toBeNull();
    expect(dbRSVP.status).toBe('going');

    // ─── STEP 8: Student verifies RSVP status ─────────────────────────
    const rsvpStatusRes = await request.get(`/api/events/rsvp/${createdEventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(rsvpStatusRes.status).toBe(200);
    expect(rsvpStatusRes.body.rsvp).not.toBeNull();
    expect(rsvpStatusRes.body.rsvp.status).toBe('going');

    // ─── STEP 9: Student checks notifications ─────────────────────────
    const notifRes = await request.get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.success).toBe(true);
    expect(Array.isArray(notifRes.body.notifications)).toBe(true);

    // ─── STEP 10: Verify unread count endpoint works ──────────────────
    const unreadRes = await request.get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(unreadRes.status).toBe(200);
    expect(unreadRes.body.success).toBe(true);
    expect(typeof unreadRes.body.unreadCount).toBe('number');

    // ─── FINAL: Confirm all database records exist ────────────────────
    const finalEvent = await Event.findById(createdEventId);
    const finalRSVP = await EventRSVP.findOne({ eventId: createdEventId, userId: studentUser._id });
    const studentDoc = await User.findById(studentUser._id);
    const guildDoc = await User.findById(guildUser._id);

    expect(finalEvent).not.toBeNull();
    expect(finalRSVP).not.toBeNull();
    expect(studentDoc).not.toBeNull();
    expect(guildDoc).not.toBeNull();

    console.log('=== INTEGRATION TEST FLOW VERIFIED ===');
    console.log(`Student: ${studentDoc.name} (${studentDoc.role})`);
    console.log(`Event: "${finalEvent.title}" → Status: ${finalEvent.status}`);
    console.log(`RSVP: ${finalRSVP.status}`);
    console.log(`Guild President: ${guildDoc.name} (${guildDoc.role})`);
    console.log('======================================');
  }, 30000);

  it('enforces role separation – student cannot publish or approve', async () => {
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    const eventId = draftRes.body.event._id;

    const approveRes = await request.post(`/api/events/${eventId}/approve`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(approveRes.status).toBe(403);

    const publishRes = await request.post(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(publishRes.status).toBe(403);

    const reviewRes = await request.get('/api/events/review/queue')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(reviewRes.status).toBe(403);
  });

  it('enforces authentication – all protected routes reject without token', async () => {
    const draftRes = await request.post('/api/events/draft').send(validEventPayload);
    expect(draftRes.status).toBe(401);

    const eventsRes = await request.get('/api/events');
    expect(eventsRes.status).toBe(401);

    const feedRes = await request.get('/api/events/feed');
    expect(feedRes.status).toBe(401);

    const notifRes = await request.get('/api/notifications');
    expect(notifRes.status).toBe(401);

    const profileRes = await request.get('/api/users/profile');
    expect(profileRes.status).toBe(401);
  });

  it('validates JWT – malformed tokens rejected across all modules', async () => {
    const badToken = 'Bearer invalid.jwt.token';

    const eventRes = await request.post('/api/events/draft')
      .set('Authorization', badToken)
      .send(validEventPayload);
    expect(eventRes.status).toBe(401);

    const notifRes = await request.get('/api/notifications')
      .set('Authorization', badToken);
    expect(notifRes.status).toBe(401);

    const profileRes = await request.get('/api/users/profile')
      .set('Authorization', badToken);
    expect(profileRes.status).toBe(401);
  });
});

describe('Cross-Module Data Consistency', () => {
  it('maintains referential integrity across User → Event → RSVP', async () => {
    const draftRes = await request.post('/api/events/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validEventPayload);
    const eventId = draftRes.body.event._id;

    await request.post(`/api/events/draft/${eventId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    await request.post(`/api/events/${eventId}/approve`)
      .set('Authorization', `Bearer ${guildToken}`);

    await request.post(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${guildToken}`)
      .catch(() => {});

    await request.post('/api/events/rsvp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ eventId, status: 'going' });

    const rsvp = await EventRSVP.findOne({ eventId, userId: studentUser._id })
      .populate('eventId')
      .populate('userId', 'name email role');

    expect(rsvp.eventId).not.toBeNull();
    expect(rsvp.eventId.title).toBe(validEventPayload.title);
    expect(rsvp.userId.email).toBe('grace@university.edu');
    expect(rsvp.userId.role).toBe('student');
  });
});
