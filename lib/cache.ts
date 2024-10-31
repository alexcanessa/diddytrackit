import { Redis } from '@upstash/redis';
import Bottleneck from 'bottleneck';

// Set up Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Set up Bottleneck limiter
const limiter = new Bottleneck({
  minTime: 1000, // 1 request per second
});

export default async function withCacheAndLimit<Type>(key: string, callback: () => Promise<Type>): Promise<Type> {
  try {
    // Check cache first
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(typeof cachedData === 'string' ? cachedData : JSON.stringify(cachedData));
    }

    // Execute callback with rate limiting and store the result
    const result = await limiter.schedule(callback);
    await redis.set(key, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error(`Error with cache or rate limit for key ${key}:`, error);
    throw error; // Re-throw to handle errors elsewhere if needed
  }
}
