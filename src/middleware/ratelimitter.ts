import { Request, Response, NextFunction } from 'express';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

const MAX_TOKENS = 5;
const REFILL_RATE = 0.1;

export function leakyBucketLimiter(req: Request, res: Response, next: NextFunction): void {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : Array.isArray(forwarded) ? forwarded[0] : undefined) ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown';

  const now = Date.now() / 1000;
  const bucket = buckets.get(ip) || { tokens: MAX_TOKENS, lastRefill: now };

  const timeElapsed = now - bucket.lastRefill;
  const leakedTokens = timeElapsed * REFILL_RATE;
  const currentTokens = Math.min(MAX_TOKENS, bucket.tokens + leakedTokens);

  if (currentTokens < 1) {
    console.log(`⛔ BLOCKED IP ${ip}`);
    res.status(429).json({
      message: 'Too many requests. Please try again later.',
    });
    return;
  }

  buckets.set(ip, {
    tokens: currentTokens - 1,
    lastRefill: now,
  });

  console.log(`✅ ALLOWED IP ${ip} | Tokens Left: ${currentTokens.toFixed(2)}`);
  next();
}

export default leakyBucketLimiter;
