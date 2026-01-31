export const MAX_REQUEST_SIZE = 100 * 1024;

export const TIMESTAMP_WINDOW = 5 * 60 * 1000;

export const SUSPICIOUS_PATTERNS = {
  userAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /headless/i,
    /puppet/i
  ],
  ipRanges: [
    '0.0.0.0/8',
    '100.64.0.0/10',
    '192.168.0.0/16'
  ]
};

export const ALLOWED_ORIGINS = [
  'https://helpcenter-8v8.pages.dev',
  'https://help-center-worker.nigaje3574.workers.dev'
];
