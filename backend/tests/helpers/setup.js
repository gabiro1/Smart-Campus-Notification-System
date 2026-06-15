import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

let mongoServer;

export const connectTestDB = async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-defence-presentation';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  process.env.NODE_ENV = 'test';
  process.env.EMAIL_USER = 'noreply@university.edu';
  process.env.EMAIL_APP_PASSWORD = 'dummy-app-password-for-test';
  process.env.SKIP_RATE_LIMIT = 'true';
  process.env.MONGO_URI = 'mongodb://localhost:27017/test';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

export const createUser = async (overrides = {}) => {
  const hashedPassword = await bcrypt.hash('Test@1234', 12);
  const User = mongoose.model('User');
  return User.create({
    name: 'Test User',
    email: `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`,
    password: hashedPassword,
    role: 'student',
    emailVerified: true,
    ...overrides,
  });
};
