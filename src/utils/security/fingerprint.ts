export interface BrowserFingerprint {
  userAgent: string;
  language: string;
  screenResolution: string;
  timezone: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  plugins: string[];
  canvas: string;
}

export const getBrowserFingerprint = (): BrowserFingerprint => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasHash = '';

  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser Fingerprint', 4, 17);
    canvasHash = canvas.toDataURL().slice(-50);
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    plugins: Array.from(navigator.plugins).map(p => p.name),
    canvas: canvasHash
  };
};

export const generateFingerprintHash = async (fingerprint: BrowserFingerprint): Promise<string> => {
  const data = JSON.stringify(fingerprint);
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encodedData);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Synchronous fingerprint generation for rate limiting
export const generateFingerprint = (): string => {
  const fp = getBrowserFingerprint();
  const data = JSON.stringify(fp);
  // Simple hash for synchronous use
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `fp_${Math.abs(hash).toString(36)}`;
};
