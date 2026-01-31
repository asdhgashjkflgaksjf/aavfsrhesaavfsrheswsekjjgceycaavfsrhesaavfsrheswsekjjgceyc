// Rate Limiter for preventing spam orders
interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;
  
  constructor(
    maxRequests: number = 3, // Max 3 orders
    windowMs: number = 60 * 60 * 1000, // Per 1 hour
    blockDurationMs: number = 24 * 60 * 60 * 1000 // Block for 24 hours if exceeded
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  private getKey(identifier: string): string {
    // Create a composite key from multiple identifiers
    return identifier.toLowerCase().trim();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      // Remove entries older than block duration
      if (now - entry.lastRequest > this.blockDurationMs) {
        this.limits.delete(key);
      }
    }
  }
  
  public check(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
    const key = this.getKey(identifier);
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry) {
      return { allowed: true, remaining: this.maxRequests, resetIn: this.windowMs };
    }
    
    // Check if in block period
    if (entry.count >= this.maxRequests) {
      const blockTimeRemaining = this.blockDurationMs - (now - entry.lastRequest);
      if (blockTimeRemaining > 0) {
        return { allowed: false, remaining: 0, resetIn: blockTimeRemaining };
      }
      // Block period expired, reset
      this.limits.delete(key);
      return { allowed: true, remaining: this.maxRequests, resetIn: this.windowMs };
    }
    
    // Check if window has expired
    if (now - entry.firstRequest > this.windowMs) {
      // Window expired, reset
      this.limits.delete(key);
      return { allowed: true, remaining: this.maxRequests, resetIn: this.windowMs };
    }
    
    const remaining = this.maxRequests - entry.count;
    const resetIn = this.windowMs - (now - entry.firstRequest);
    
    return { allowed: true, remaining, resetIn };
  }
  
  public record(identifier: string): void {
    const key = this.getKey(identifier);
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry) {
      this.limits.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return;
    }
    
    // Check if window has expired
    if (now - entry.firstRequest > this.windowMs) {
      // Start new window
      this.limits.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return;
    }
    
    // Increment count
    entry.count++;
    entry.lastRequest = now;
  }
  
  public isBlocked(identifier: string): boolean {
    const { allowed, remaining } = this.check(identifier);
    return !allowed || remaining <= 0;
  }
  
  public getRemainingAttempts(identifier: string): number {
    const { remaining } = this.check(identifier);
    return remaining;
  }
  
  public getBlockTimeRemaining(identifier: string): number {
    const { resetIn } = this.check(identifier);
    return resetIn;
  }
  
  public formatTimeRemaining(ms: number): string {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  }
}

// Create singleton instances for different rate limits
export const orderRateLimiter = new RateLimiter(10, 60 * 60 * 1000, 24 * 60 * 60 * 1000); // 10 orders per hour, 24h block
export const phoneRateLimiter = new RateLimiter(10, 60 * 60 * 1000, 12 * 60 * 60 * 1000); // 10 per phone per hour, 12h block
export const emailRateLimiter = new RateLimiter(10, 60 * 60 * 1000, 12 * 60 * 60 * 1000); // 10 per email per hour, 12h block

// Fingerprint-based rate limiter (harder to bypass)
export const fingerprintRateLimiter = new RateLimiter(10, 60 * 60 * 1000, 6 * 60 * 60 * 1000); // 10 per fingerprint, 6h block

export { RateLimiter };