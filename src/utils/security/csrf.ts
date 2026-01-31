import CryptoJS from 'crypto-js';

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_EXPIRY = 'csrf_token_expiry';
const TOKEN_LIFETIME = 3600000;
const TOKEN_ROTATION_THRESHOLD = 300000;

interface CSRFToken {
  token: string;
  signature: string;
  timestamp: number;
  sessionId: string;
}

class CSRFProtection {
  private static instance: CSRFProtection;
  private currentToken: CSRFToken | null = null;
  private tokenRotationTimer: number | null = null;

  private constructor() {
    this.initializeToken();
    this.startTokenRotation();
  }

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  private generateSessionId(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    const timestamp = Date.now();
    const userAgent = navigator.userAgent;
    const screenRes = `${window.screen.width}x${window.screen.height}`;

    const sessionData = `${randomBytes.toString()}${timestamp}${userAgent}${screenRes}`;
    return CryptoJS.SHA256(sessionData).toString();
  }

  private generateToken(): CSRFToken {
    const timestamp = Date.now();
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    const sessionId = this.getOrCreateSessionId();

    const tokenPayload = `${randomBytes.toString()}:${timestamp}:${sessionId}`;
    const token = CryptoJS.SHA256(tokenPayload).toString();

    const signatureData = `${token}:${timestamp}:${sessionId}:${this.getSecretKey()}`;
    const signature = CryptoJS.HmacSHA512(signatureData, this.getSecretKey()).toString();

    return {
      token,
      signature,
      timestamp,
      sessionId
    };
  }

  private getSecretKey(): string {
    let secret = sessionStorage.getItem('csrf_secret');
    if (!secret) {
      secret = CryptoJS.lib.WordArray.random(64).toString();
      sessionStorage.setItem('csrf_secret', secret);
    }
    return secret;
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('csrf_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('csrf_session_id', sessionId);
    }
    return sessionId;
  }

  private initializeToken(): void {
    const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
    const storedExpiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY);

    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        try {
          this.currentToken = JSON.parse(storedToken);
          return;
        } catch (e) {
          console.warn('Failed to parse stored CSRF token');
        }
      }
    }

    this.rotateToken();
  }

  private rotateToken(): void {
    this.currentToken = this.generateToken();
    const expiryTime = Date.now() + TOKEN_LIFETIME;

    sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(this.currentToken));
    sessionStorage.setItem(CSRF_TOKEN_EXPIRY, expiryTime.toString());
  }

  private startTokenRotation(): void {
    if (this.tokenRotationTimer) {
      clearInterval(this.tokenRotationTimer);
    }

    this.tokenRotationTimer = window.setInterval(() => {
      if (this.currentToken) {
        const tokenAge = Date.now() - this.currentToken.timestamp;
        if (tokenAge > TOKEN_ROTATION_THRESHOLD) {
          this.rotateToken();
        }
      }
    }, TOKEN_ROTATION_THRESHOLD);
  }

  getToken(): string {
    if (!this.currentToken) {
      this.rotateToken();
    }

    const tokenAge = Date.now() - this.currentToken!.timestamp;
    if (tokenAge > TOKEN_LIFETIME) {
      this.rotateToken();
    }

    return this.currentToken!.token;
  }

  getTokenWithSignature(): { token: string; signature: string; timestamp: number } {
    if (!this.currentToken) {
      this.rotateToken();
    }

    const tokenAge = Date.now() - this.currentToken!.timestamp;
    if (tokenAge > TOKEN_LIFETIME) {
      this.rotateToken();
    }

    return {
      token: this.currentToken!.token,
      signature: this.currentToken!.signature,
      timestamp: this.currentToken!.timestamp
    };
  }

  validateToken(token: string, signature: string, timestamp: number): boolean {
    if (!this.currentToken) {
      return false;
    }

    if (Date.now() - timestamp > TOKEN_LIFETIME) {
      return false;
    }

    if (this.currentToken.token !== token) {
      return false;
    }

    const sessionId = this.getOrCreateSessionId();
    const expectedSignatureData = `${token}:${timestamp}:${sessionId}:${this.getSecretKey()}`;
    const expectedSignature = CryptoJS.HmacSHA512(expectedSignatureData, this.getSecretKey()).toString();

    if (signature !== expectedSignature) {
      return false;
    }

    return true;
  }

  validateDoubleSubmit(headerToken: string, cookieToken: string): boolean {
    if (!headerToken || !cookieToken) {
      return false;
    }

    return headerToken === cookieToken && headerToken === this.currentToken?.token;
  }

  clearToken(): void {
    this.currentToken = null;
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    sessionStorage.removeItem(CSRF_TOKEN_EXPIRY);

    if (this.tokenRotationTimer) {
      clearInterval(this.tokenRotationTimer);
      this.tokenRotationTimer = null;
    }
  }

  encryptToken(token: string): string {
    return CryptoJS.AES.encrypt(token, this.getSecretKey()).toString();
  }

  decryptToken(encryptedToken: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, this.getSecretKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

export const csrfProtection = CSRFProtection.getInstance();

export const getCSRFToken = (): string => {
  return csrfProtection.getToken();
};

export const getCSRFHeaders = (): Record<string, string> => {
  const { token, signature, timestamp } = csrfProtection.getTokenWithSignature();
  return {
    'X-CSRF-Token': token,
    'X-CSRF-Signature': signature,
    'X-CSRF-Timestamp': timestamp.toString()
  };
};

export const validateCSRFToken = (token: string, signature: string, timestamp: number): boolean => {
  return csrfProtection.validateToken(token, signature, timestamp);
};

export const clearCSRFToken = (): void => {
  csrfProtection.clearToken();
};
