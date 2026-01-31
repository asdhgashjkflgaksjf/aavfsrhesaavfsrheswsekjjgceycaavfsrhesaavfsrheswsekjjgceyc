import { useEffect, useState, useCallback } from 'react';
import { csrfProtection, getCSRFToken, getCSRFHeaders } from '@/utils/security/csrf';
import CryptoJS from 'crypto-js';

interface CSRFHookReturn {
  token: string;
  headers: Record<string, string>;
  refreshToken: () => void;
  isReady: boolean;
}

export const useCSRF = (): CSRFHookReturn => {
  const [token, setToken] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);

  const generateFingerprint = useCallback((): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
    }

    const canvasData = canvas.toDataURL();
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezoneOffset = new Date().getTimezoneOffset();
    const language = navigator.language;
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;

    const fingerprintData = `${canvasData}${screenInfo}${timezoneOffset}${language}${platform}${userAgent}`;
    return CryptoJS.SHA256(fingerprintData).toString();
  }, []);

  const refreshToken = useCallback(() => {
    const newToken = getCSRFToken();
    setToken(newToken);
  }, []);

  useEffect(() => {
    refreshToken();
    setIsReady(true);

    const rotationInterval = setInterval(() => {
      refreshToken();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(rotationInterval);
    };
  }, [refreshToken]);

  return {
    token,
    headers: getCSRFHeaders(),
    refreshToken,
    isReady
  };
};
