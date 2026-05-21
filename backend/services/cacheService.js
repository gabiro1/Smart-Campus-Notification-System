import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const NODE_ENV = process.env.NODE_ENV || 'development';

let redis;
let isAvailable = false;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis unavailable — caching disabled');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('connect', () => { isAvailable = true; });
  redis.on('close', () => { isAvailable = false; });
  redis.on('error', () => { isAvailable = false; });

  if (NODE_ENV !== 'test') {
    redis.connect().catch(() => {
      isAvailable = false;
    });
  }
} catch {
  isAvailable = false;
}

export const cacheGet = async (key) => {
  if (!isAvailable) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (key, data, ttlSeconds = 300) => {
  if (!isAvailable) return false;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

export const cacheDel = async (key) => {
  if (!isAvailable) return;
  try {
    await redis.del(key);
  } catch { /* ignore */ }
};

export const cacheWrap = async (key, ttlSeconds, fn) => {
  if (!isAvailable) return fn();
  const cached = await cacheGet(key);
  if (cached !== null) return cached;
  const data = await fn();
  await cacheSet(key, data, ttlSeconds);
  return data;
};

export const invalidatePattern = async (pattern) => {
  if (!isAvailable) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch { /* ignore */ }
};

export default { cacheGet, cacheSet, cacheDel, cacheWrap, invalidatePattern };
