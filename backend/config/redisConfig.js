import Redis from 'ioredis';

// Database configuration for Redis
// host and port fall back to localhost defaults if not provided in .env
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ compatibility
};

const redisConnection = new Redis(redisConfig);

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis for Notification Engine');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

export default redisConnection;
