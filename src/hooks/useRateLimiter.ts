import { useState, useEffect, useCallback } from 'react';
import { orderRateLimiter, phoneRateLimiter, emailRateLimiter, fingerprintRateLimiter } from '@/utils/security/rateLimiter';
import { generateFingerprint } from '@/utils/security/fingerprint';

interface RateLimitStatus {
  canOrder: boolean;
  remainingOrders: number;
  blockTimeRemaining: string;
  isChecking: boolean;
}

export const useRateLimiter = () => {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [status, setStatus] = useState<RateLimitStatus>({
    canOrder: true,
    remainingOrders: 10,
    blockTimeRemaining: '',
    isChecking: true
  });

  useEffect(() => {
    // Generate fingerprint on mount
    const fp = generateFingerprint();
    setFingerprint(fp);
    
    // Check rate limit
    const result = fingerprintRateLimiter.check(fp);
    setStatus({
      canOrder: result.allowed && result.remaining > 0,
      remainingOrders: result.remaining,
      blockTimeRemaining: result.allowed ? '' : fingerprintRateLimiter.formatTimeRemaining(result.resetIn),
      isChecking: false
    });
  }, []);

  const checkRateLimit = useCallback((phone?: string, email?: string) => {
    const checks: { allowed: boolean; remaining: number; resetIn: number }[] = [];
    
    // Check fingerprint
    checks.push(fingerprintRateLimiter.check(fingerprint));
    
    // Check phone if provided
    if (phone) {
      checks.push(phoneRateLimiter.check(phone));
    }
    
    // Check email if provided
    if (email) {
      checks.push(emailRateLimiter.check(email));
    }
    
    // Find the most restrictive limit
    const mostRestrictive = checks.reduce((min, current) => {
      if (!current.allowed) return current;
      if (!min.allowed) return min;
      return current.remaining < min.remaining ? current : min;
    }, checks[0]);
    
    return {
      allowed: mostRestrictive.allowed && mostRestrictive.remaining > 0,
      remaining: mostRestrictive.remaining,
      resetIn: mostRestrictive.resetIn,
      message: !mostRestrictive.allowed 
        ? `Anda telah melebihi batas pemesanan. Coba lagi dalam ${fingerprintRateLimiter.formatTimeRemaining(mostRestrictive.resetIn)}`
        : mostRestrictive.remaining <= 1 
        ? `Peringatan: Anda hanya memiliki ${mostRestrictive.remaining} kesempatan order tersisa dalam 1 jam ini.`
        : ''
    };
  }, [fingerprint]);

  const recordOrder = useCallback((phone: string, email: string) => {
    fingerprintRateLimiter.record(fingerprint);
    phoneRateLimiter.record(phone);
    emailRateLimiter.record(email);
    
    // Update status
    const result = fingerprintRateLimiter.check(fingerprint);
    setStatus({
      canOrder: result.allowed && result.remaining > 0,
      remainingOrders: result.remaining,
      blockTimeRemaining: result.allowed ? '' : fingerprintRateLimiter.formatTimeRemaining(result.resetIn),
      isChecking: false
    });
  }, [fingerprint]);

  return {
    fingerprint,
    status,
    checkRateLimit,
    recordOrder
  };
};