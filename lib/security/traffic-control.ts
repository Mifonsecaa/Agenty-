import { incrementOpsCounter } from "@/lib/observability/ops-metrics";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type ConcurrencyBucket = {
  count: number;
  updatedAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
  limit: number;
};

type ConcurrencyRelease = () => void;

const rateBuckets = new Map<string, RateLimitBucket>();
const concurrencyBuckets = new Map<string, ConcurrencyBucket>();

const STALE_CONCURRENCY_TTL_MS = 10 * 60 * 1000;
const REDIS_CONCURRENCY_TTL_MS = 90 * 1000;
const REDIS_PREFIX = process.env.REDIS_PREFIX || "agenty:traffic";

let redisClientPromise: Promise<any | null> | null = null;
let redisMetricsReported = {
  enabled: false,
  connected: false,
  unavailable: false,
  fallback: false,
};

function nowMs() {
  return Date.now();
}

function makeKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

function makeRedisKey(type: "rate" | "conc", scope: string, key: string) {
  return `${REDIS_PREFIX}:${type}:${scope}:${key}`;
}

function isRedisEnabled() {
  const enabled = (process.env.REDIS_ENABLED || "false").toLowerCase();
  const hasUrl = Boolean(process.env.REDIS_URL);
  return hasUrl && (enabled === "true" || enabled === "1");
}

async function getRedisClient() {
  if (!isRedisEnabled()) return null;
  if (!redisMetricsReported.enabled) {
    incrementOpsCounter("traffic.redis_enabled");
    redisMetricsReported.enabled = true;
  }
  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      try {
        const Redis = require("ioredis");
        return new Redis(process.env.REDIS_URL, {
          connectTimeout: Number(process.env.REDIS_TIMEOUT_MS || 1200),
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          lazyConnect: true,
        });
      } catch {
        if (!redisMetricsReported.unavailable) {
          incrementOpsCounter("traffic.redis_unavailable");
          redisMetricsReported.unavailable = true;
        }
        console.warn("[TrafficControl] Redis unavailable, using in-memory fallback");
        return null;
      }
    })();
  }

  const client = await redisClientPromise;
  if (!client) return null;

  try {
    if (client.status === "wait") {
      await client.connect();
    }
    if (!redisMetricsReported.connected) {
      incrementOpsCounter("traffic.redis_connected");
      redisMetricsReported.connected = true;
    }
  } catch {
    redisClientPromise = null;
    if (!redisMetricsReported.unavailable) {
      incrementOpsCounter("traffic.redis_unavailable");
      redisMetricsReported.unavailable = true;
    }
    return null;
  }

  return client;
}

function cleanupStaleConcurrency() {
  const now = nowMs();
  for (const [key, bucket] of concurrencyBuckets.entries()) {
    if (bucket.count <= 0 || now - bucket.updatedAt > STALE_CONCURRENCY_TTL_MS) {
      concurrencyBuckets.delete(key);
    }
  }
}

export function buildRequesterKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown-ip";
  const ua = req.headers.get("user-agent") || "unknown-ua";
  return `${ip}:${ua.slice(0, 32)}`;
}

function checkRateLimitMemory(params: {
  scope: string;
  key: string;
  maxRequests: number;
  windowMs: number;
}): RateLimitResult {
  const { scope, key, maxRequests, windowMs } = params;
  const now = nowMs();
  const bucketKey = makeKey(scope, key);

  let bucket = rateBuckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(bucketKey, bucket);
  }

  bucket.count += 1;

  const allowed = bucket.count <= maxRequests;
  const retryAfterMs = Math.max(0, bucket.resetAt - now);
  const remaining = Math.max(0, maxRequests - bucket.count);

  return {
    allowed,
    retryAfterMs,
    remaining,
    limit: maxRequests,
  };
}

export async function checkRateLimit(params: {
  scope: string;
  key: string;
  maxRequests: number;
  windowMs: number;
}) {
  const { scope, key, maxRequests, windowMs } = params;
  const client = await getRedisClient();

  if (!client) {
    if (!redisMetricsReported.fallback && isRedisEnabled()) {
      incrementOpsCounter("traffic.redis_fallback_memory");
      redisMetricsReported.fallback = true;
    }
    return checkRateLimitMemory(params);
  }

  try {
    const now = nowMs();
    const redisKey = makeRedisKey("rate", scope, key);
    const script = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("PEXPIRE", KEYS[1], ARGV[1])
      end
      local ttl = redis.call("PTTL", KEYS[1])
      return {current, ttl}
    `;
    const result = await client.eval(script, 1, redisKey, String(windowMs));
    const count = Number(result?.[0] || 0);
    const ttl = Math.max(0, Number(result?.[1] || windowMs));

    return {
      allowed: count <= maxRequests,
      retryAfterMs: ttl,
      remaining: Math.max(0, maxRequests - count),
      limit: maxRequests,
    };
  } catch {
    if (!redisMetricsReported.fallback) {
      incrementOpsCounter("traffic.redis_fallback_memory");
      redisMetricsReported.fallback = true;
    }
    return checkRateLimitMemory(params);
  }
}

function acquireConcurrencySlotMemory(params: {
  scope: string;
  key: string;
  maxConcurrent: number;
}): ConcurrencyRelease | null {
  const { scope, key, maxConcurrent } = params;
  const bucketKey = makeKey(scope, key);

  cleanupStaleConcurrency();

  const current = concurrencyBuckets.get(bucketKey) || { count: 0, updatedAt: nowMs() };
  if (current.count >= maxConcurrent) {
    return null;
  }

  current.count += 1;
  current.updatedAt = nowMs();
  concurrencyBuckets.set(bucketKey, current);

  let released = false;
  return () => {
    if (released) return;
    released = true;

    const bucket = concurrencyBuckets.get(bucketKey);
    if (!bucket) return;

    bucket.count = Math.max(0, bucket.count - 1);
    bucket.updatedAt = nowMs();

    if (bucket.count === 0) {
      concurrencyBuckets.delete(bucketKey);
    } else {
      concurrencyBuckets.set(bucketKey, bucket);
    }
  };
}

async function releaseRedisConcurrency(scope: string, key: string) {
  const client = await getRedisClient();
  if (!client) return;

  try {
    const redisKey = makeRedisKey("conc", scope, key);
    const script = `
      local current = redis.call("GET", KEYS[1])
      if not current then return 0 end
      current = tonumber(current)
      if current <= 1 then
        redis.call("DEL", KEYS[1])
        return 0
      end
      local next = redis.call("DECR", KEYS[1])
      redis.call("PEXPIRE", KEYS[1], ARGV[1])
      return next
    `;
    await client.eval(script, 1, redisKey, String(REDIS_CONCURRENCY_TTL_MS));
  } catch {
    // best-effort release
  }
}

export async function acquireConcurrencySlot(params: {
  scope: string;
  key: string;
  maxConcurrent: number;
}): Promise<ConcurrencyRelease | null> {
  const { scope, key, maxConcurrent } = params;
  const client = await getRedisClient();
  if (!client) {
    if (!redisMetricsReported.fallback && isRedisEnabled()) {
      incrementOpsCounter("traffic.redis_fallback_memory");
      redisMetricsReported.fallback = true;
    }
    return acquireConcurrencySlotMemory(params);
  }

  const redisKey = makeRedisKey("conc", scope, key);
  try {
    const script = `
      local limit = tonumber(ARGV[1])
      local ttl = tonumber(ARGV[2])
      local current = redis.call("GET", KEYS[1])

      if not current then
        redis.call("SET", KEYS[1], 1, "PX", ttl)
        return 1
      end

      current = tonumber(current)
      if current >= limit then
        return 0
      end

      redis.call("INCR", KEYS[1])
      redis.call("PEXPIRE", KEYS[1], ttl)
      return 1
    `;

    const acquired = Number(await client.eval(script, 1, redisKey, String(maxConcurrent), String(REDIS_CONCURRENCY_TTL_MS)) || 0);
    if (acquired !== 1) {
      return null;
    }

    let released = false;
    return () => {
      if (released) return;
      released = true;
      void releaseRedisConcurrency(scope, key);
    };
  } catch {
    if (!redisMetricsReported.fallback) {
      incrementOpsCounter("traffic.redis_fallback_memory");
      redisMetricsReported.fallback = true;
    }
    return acquireConcurrencySlotMemory(params);
  }
}

