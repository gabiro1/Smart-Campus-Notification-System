import mongoose from 'mongoose';
import supertest from 'supertest';
import { connectTestDB, disconnectTestDB, clearCollections, createUser } from './helpers/setup.js';
import { createTestApp } from './helpers/testApp.js';
import NotificationLog from '../modules/notification/models/NotificationLog.js';

const app = createTestApp();
const request = supertest(app);

let hodUser, hodToken;
let studentUser, studentToken;
let dispatchedNotificationId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections();

  hodUser = await createUser({
    name: 'Dr. HOD',
    email: 'hod@university.edu',
    role: 'hod',
  });

  studentUser = await createUser({
    name: 'Frank Student',
    email: 'frank@university.edu',
    role: 'student',
  });

  const hodLogin = await request.post('/api/users/login').send({
    email: 'hod@university.edu',
    password: 'Test@1234',
  });
  hodToken = hodLogin.body.token;

  const studentLogin = await request.post('/api/users/login').send({
    email: 'frank@university.edu',
    password: 'Test@1234',
  });
  studentToken = studentLogin.body.token;

  dispatchedNotificationId = null;
});

describe('GET /api/notifications – Inbox', () => {
  it('returns empty notification list for a new user', async () => {
    const res = await request.get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it('rejects request without authentication (401)', async () => {
    const res = await request.get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/notifications/dispatch – Send Notification', () => {
  it('hod can dispatch a notification to a student', async () => {
    const res = await request.post('/api/notifications/dispatch')
      .set('Authorization', `Bearer ${hodToken}`)
      .send({
        targetUserId: studentUser._id.toString(),
        email: 'frank@university.edu',
        name: 'Frank Student',
        message: 'Your attendance report is due tomorrow.',
        title: 'Attendance Reminder',
        priority: 'high',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.channelsActived).toContain('Database_Log');
    expect(res.body.priority).toBe('high');

    dispatchedNotificationId = res.body.notificationId || null;
  });

  it('rejects dispatch from unauthorized role (student)', async () => {
    const res = await request.post('/api/notifications/dispatch')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        targetUserId: hodUser._id.toString(),
        email: 'hod@university.edu',
        message: 'Test message',
        title: 'Test',
      });

    expect(res.status).toBe(403);
  });

  it('rejects dispatch with incomplete payload (400)', async () => {
    const res = await request.post('/api/notifications/dispatch')
      .set('Authorization', `Bearer ${hodToken}`)
      .send({
        targetUserId: studentUser._id.toString(),
      });

    expect(res.status).toBe(400);
  });

  it('rejects dispatch without authentication (401)', async () => {
    const res = await request.post('/api/notifications/dispatch')
      .send({
        targetUserId: studentUser._id.toString(),
        email: 'frank@university.edu',
        message: 'Test',
      });

    expect(res.status).toBe(401);
  });
});

describe('Notification Lifecycle – Read Status', () => {
  beforeEach(async () => {
    await request.post('/api/notifications/dispatch')
      .set('Authorization', `Bearer ${hodToken}`)
      .send({
        targetUserId: studentUser._id.toString(),
        email: 'frank@university.edu',
        name: 'Frank Student',
        message: 'Exam schedule has been updated.',
        title: 'Exam Update',
      });
  });

  it('shows dispatched notification in recipient inbox', async () => {
    const res = await request.get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
    const notif = res.body.notifications[0];
    expect(notif.title).toBe('Exam Update');
    expect(notif.status).toBe('unread');
  });

  it('marks notification as read', async () => {
    const inbox = await request.get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    const notifId = inbox.body.notifications[0]._id;

    const res = await request.put(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('unread count decreases after marking as read', async () => {
    const inbox = await request.get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    const notifId = inbox.body.notifications[0]._id;

    const before = await request.get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(before.body.unreadCount).toBeGreaterThanOrEqual(1);

    await request.put(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${studentToken}`);

    const after = await request.get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(after.body.unreadCount).toBeLessThan(before.body.unreadCount);
  });
});

describe('GET /api/notifications/unread-count', () => {
  it('returns 0 for user with no notifications', async () => {
    const res = await request.get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.unreadCount).toBe('number');
  });
});

describe('Notification Authorization', () => {
  it('hod can view dispatch history', async () => {
    await request.post('/api/notifications/dispatch')
      .set('Authorization', `Bearer ${hodToken}`)
      .send({
        targetUserId: studentUser._id.toString(),
        email: 'frank@university.edu',
        message: 'Test history',
        title: 'History Test',
      });

    const res = await request.get('/api/notifications/dispatch/history')
      .set('Authorization', `Bearer ${hodToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('student cannot view dispatch history (403)', async () => {
    const res = await request.get('/api/notifications/dispatch/history')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});
