interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
}

class BotDetector {
  private detectionResults: string[] = [];
  private startTime = Date.now();

  detect(): BotDetectionResult {
    this.detectionResults = [];
    let botScore = 0;

    if (this.checkUserAgent()) botScore += 30;
    if (this.checkWebDriver()) botScore += 40;
    if (this.checkAutomation()) botScore += 35;
    if (this.checkPlugins()) botScore += 5;
    if (this.checkLanguages()) botScore += 5;
    if (this.checkScreenResolution()) botScore += 10;
    if (this.checkTouchSupport()) botScore += 5;
    if (this.checkWebGL()) botScore += 10;
    if (this.checkChrome()) botScore += 15;
    if (this.checkPermissions()) botScore += 10;
    if (this.checkNotifications()) botScore += 5;
    if (this.checkConnectionRtt()) botScore += 5;
    if (this.checkBattery()) botScore += 5;
    if (this.checkDeviceMemory()) botScore += 8;
    if (this.checkHardwareConcurrency()) botScore += 8;
    if (this.checkMouseBehavior()) botScore += 15;
    if (this.checkKeyboardBehavior()) botScore += 10;
    if (this.checkBrowserFeatures()) botScore += 20;

    const isBot = botScore >= 60;

    return {
      isBot,
      confidence: Math.min(botScore, 100),
      reasons: this.detectionResults
    };
  }

  private checkUserAgent(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    const botPatterns = [
      'bot', 'crawl', 'spider', 'slurp', 'mediapartners', 'headless',
      'phantom', 'selenium', 'webdriver', 'puppeteer', 'playwright',
      'scraper', 'curl', 'wget', 'python', 'java', 'perl', 'ruby',
      'go-http', 'okhttp', 'apache', 'http_request', 'scrapy'
    ];

    for (const pattern of botPatterns) {
      if (ua.includes(pattern)) {
        this.detectionResults.push('Bot user agent detected');
        return true;
      }
    }
    return false;
  }

  private checkWebDriver(): boolean {
    if ('webdriver' in navigator && (navigator as any).webdriver) {
      this.detectionResults.push('WebDriver detected');
      return true;
    }

    if ((window as any).__webdriver_script_fn) {
      this.detectionResults.push('WebDriver script function detected');
      return true;
    }

    if ((document as any).__webdriver_evaluate || (document as any).__selenium_evaluate) {
      this.detectionResults.push('Selenium detected');
      return true;
    }

    if ((window as any).callPhantom || (window as any)._phantom) {
      this.detectionResults.push('PhantomJS detected');
      return true;
    }

    return false;
  }

  private checkAutomation(): boolean {
    const documentCheck = (document as any).documentElement;
    if (documentCheck && documentCheck.getAttribute('webdriver')) {
      this.detectionResults.push('Automation detected in document');
      return true;
    }

    if ((window as any).domAutomation || (window as any).domAutomationController) {
      this.detectionResults.push('DOM automation detected');
      return true;
    }

    if ((window as any).__nightmare) {
      this.detectionResults.push('Nightmare detected');
      return true;
    }

    if ((navigator as any).__selenium_unwrapped || (navigator as any).__webdriver_unwrapped) {
      this.detectionResults.push('Unwrapped automation detected');
      return true;
    }

    return false;
  }

  private checkPlugins(): boolean {
    if (navigator.plugins.length === 0) {
      this.detectionResults.push('No plugins detected');
      return true;
    }
    return false;
  }

  private checkLanguages(): boolean {
    if (!navigator.languages || navigator.languages.length === 0) {
      this.detectionResults.push('No languages detected');
      return true;
    }
    return false;
  }

  private checkScreenResolution(): boolean {
    if (screen.width === 0 || screen.height === 0) {
      this.detectionResults.push('Invalid screen resolution');
      return true;
    }

    if (screen.colorDepth === 0) {
      this.detectionResults.push('Invalid color depth');
      return true;
    }

    return false;
  }

  private checkTouchSupport(): boolean {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!hasTouch && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      this.detectionResults.push('Mobile device without touch support');
      return true;
    }

    return false;
  }

  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) {
        this.detectionResults.push('WebGL not supported');
        return true;
      }

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer && (renderer.includes('SwiftShader') || renderer.includes('llvmpipe'))) {
          this.detectionResults.push('Software renderer detected');
          return true;
        }
      }
    } catch (e) {
      return false;
    }

    return false;
  }

  private checkChrome(): boolean {
    const isChrome = /Chrome/.test(navigator.userAgent);

    if (isChrome && !(window as any).chrome) {
      this.detectionResults.push('Chrome without chrome object');
      return true;
    }

    if ((window as any).chrome && (window as any).chrome.runtime) {
      if (!(window as any).chrome.runtime.sendMessage) {
        this.detectionResults.push('Modified chrome runtime');
        return true;
      }
    }

    return false;
  }

  private checkPermissions(): boolean {
    if (!navigator.permissions) {
      this.detectionResults.push('Permissions API not available');
      return true;
    }
    return false;
  }

  private checkNotifications(): boolean {
    if (!('Notification' in window)) {
      this.detectionResults.push('Notification API not available');
      return true;
    }
    return false;
  }

  private checkConnectionRtt(): boolean {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection && connection.rtt === 0) {
      this.detectionResults.push('Invalid RTT value');
      return true;
    }

    return false;
  }

  private checkBattery(): boolean {
    return false;
  }

  private checkDeviceMemory(): boolean {
    const memory = (navigator as any).deviceMemory;

    if (memory !== undefined && memory < 0.5) {
      this.detectionResults.push('Suspiciously low device memory');
      return true;
    }

    return false;
  }

  private checkHardwareConcurrency(): boolean {
    if (navigator.hardwareConcurrency === 0 || navigator.hardwareConcurrency === undefined) {
      this.detectionResults.push('Invalid hardware concurrency');
      return true;
    }

    if (navigator.hardwareConcurrency > 64) {
      this.detectionResults.push('Suspiciously high CPU cores');
      return true;
    }

    return false;
  }

  private checkMouseBehavior(): boolean {
    const now = Date.now();
    const elapsed = now - this.startTime;

    if (elapsed > 5000 && !this.hasMouseMovement()) {
      this.detectionResults.push('No natural mouse movement detected');
      return true;
    }

    return false;
  }

  private hasMouseMovement(): boolean {
    return (window as any).__mouseMovementDetected === true;
  }

  private checkKeyboardBehavior(): boolean {
    return false;
  }

  private checkBrowserFeatures(): boolean {
    let suspiciousCount = 0;

    if (!window.sessionStorage) suspiciousCount++;
    if (!window.localStorage) suspiciousCount++;
    if (!window.indexedDB) suspiciousCount++;
    if (!document.createElement('canvas').getContext) suspiciousCount++;
    if (!window.WebSocket) suspiciousCount++;

    if (suspiciousCount >= 3) {
      this.detectionResults.push('Missing critical browser features');
      return true;
    }

    return false;
  }

  async performAdvancedChecks(): Promise<boolean> {
    let suspiciousCount = 0;

    if (await this.checkMouseMovementPattern()) suspiciousCount++;
    if (await this.checkTimingConsistency()) suspiciousCount++;
    if (await this.checkCanvasConsistency()) suspiciousCount++;

    return suspiciousCount >= 2;
  }

  private async checkMouseMovementPattern(): Promise<boolean> {
    return new Promise((resolve) => {
      let moveCount = 0;
      const timeout = setTimeout(() => {
        document.removeEventListener('mousemove', handler);
        resolve(moveCount === 0);
      }, 2000);

      const handler = () => {
        moveCount++;
        if (moveCount >= 3) {
          clearTimeout(timeout);
          document.removeEventListener('mousemove', handler);
          resolve(false);
        }
      };

      document.addEventListener('mousemove', handler);
    });
  }

  private async checkTimingConsistency(): Promise<boolean> {
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const end = performance.now();
    const diff = end - start;

    return diff < 95 || diff > 150;
  }

  private async checkCanvasConsistency(): Promise<boolean> {
    try {
      const canvas1 = this.generateCanvasFingerprint();
      const canvas2 = this.generateCanvasFingerprint();

      return canvas1 !== canvas2;
    } catch (e) {
      return true;
    }
  }

  private generateCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 200;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('Test', 2, 15);

    return canvas.toDataURL();
  }
}

export const botDetector = new BotDetector();
export default BotDetector;

if (typeof window !== 'undefined') {
  let mouseMoveCount = 0;
  window.addEventListener('mousemove', () => {
    mouseMoveCount++;
    if (mouseMoveCount > 3) {
      (window as any).__mouseMovementDetected = true;
    }
  }, { passive: true });
}
