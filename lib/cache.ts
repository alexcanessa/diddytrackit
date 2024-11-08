import { Redis } from "@upstash/redis";
import Bottleneck from "bottleneck";

// Set up Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const limiter = new Bottleneck({
  minTime: 1000, // 1 request per second
  maxConcurrent: 1, // 1 concurrent request
  reservoir: 60, // Allow 60 requests per minute (adjust based on API limits)
  reservoirRefreshAmount: 60, // Refresh to 60 requests
  reservoirRefreshInterval: 60 * 1000, // every minute
});

type CacheFunction<Type> = () => Promise<Type>;

/**
 * Handles caching. Checks Redis for existing data and stores new data if not present.
 */
export async function withCache<Type>(
  key: string,
  callback: CacheFunction<Type>
): Promise<Type> {
  try {
    const cachedData = await redis.get(key);

    if (cachedData) {
      return JSON.parse(
        typeof cachedData === "string" ? cachedData : JSON.stringify(cachedData)
      ) as Type;
    }

    // If no cache, execute the callback and store the result
    const result = await callback();
    await redis.set(key, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error(`Error with caching for key ${key}`, error);
    throw error; // Re-throw to handle errors elsewhere if needed
  }
}

/**
 * Handles rate-limiting using Bottleneck.
 */
export function withLimit<Type>(callback: CacheFunction<Type>): Promise<Type> {
  return limiter.schedule(callback);
}

/**
 * Combines caching and rate-limiting. Checks cache first, applies rate limit if needed.
 */
export async function withCacheAndLimit<Type>(
  key: string,
  callback: CacheFunction<Type>
): Promise<Type> {
  return withCache(key, () => withLimit(callback));
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
