// Anti-copy protection
export const preventCopyPaste = () => {
  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('cut', (e) => e.preventDefault());
  document.addEventListener('paste', (e) => e.preventDefault());
};

// Prevent right click
export const preventRightClick = () => {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
};

// Disable keyboard shortcuts
export const preventKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Dev tools)
    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      // Prevent Ctrl+U (View source)
      (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
      // Prevent F12
      e.key === 'F12'
    ) {
      e.preventDefault();
      return false;
    }
  });
};

// Prevent iframe embedding - modified to be safer
export const preventFraming = () => {
  try {
    if (window.self !== window.top) {
      document.body.innerHTML = 'This page cannot be displayed in a frame.';
    }
  } catch (e) {
    console.error('Frame access denied');
  }
};

// Canvas Fingerprinting
export const generateCanvasFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Add some canvas operations
  canvas.width = 200;
  canvas.height = 200;
  
  // Add text with different styles
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125,1,62,20);
  
  // Add gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#ff0000');
  gradient.addColorStop(1, '#0000ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(10, 10, 100, 100);
  
  // Add text
  ctx.fillStyle = '#069';
  ctx.fillText('👋 Hello, world!', 2, 15);
  
  // Hidden rendering
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgb(255,0,255)';
  ctx.beginPath();
  ctx.arc(50, 50, 30, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
};

// Mouse Movement Analysis
export class MouseAnalyzer {
  private movements: Array<{x: number; y: number; timestamp: number}> = [];
  private startTime: number = Date.now();
  private readonly maxSamples = 100;
  
  constructor() {
    this.initializeTracking();
  }

  private initializeTracking(): void {
    document.addEventListener('mousemove', (e) => {
      if (this.movements.length >= this.maxSamples) {
        this.movements.shift();
      }
      
      this.movements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now() - this.startTime
      });
    });
  }

  public analyze(): {
    isNatural: boolean;
    entropy: number;
    averageSpeed: number;
  } {
    if (this.movements.length < 10) {
      return { isNatural: false, entropy: 0, averageSpeed: 0 };
    }

    // Calculate movement entropy
    const speeds: number[] = [];
    for (let i = 1; i < this.movements.length; i++) {
      const dx = this.movements[i].x - this.movements[i-1].x;
      const dy = this.movements[i].y - this.movements[i-1].y;
      const dt = this.movements[i].timestamp - this.movements[i-1].timestamp;
      const speed = Math.sqrt(dx*dx + dy*dy) / dt;
      speeds.push(speed);
    }

    // Calculate entropy of speeds
    const entropy = this.calculateEntropy(speeds);
    const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    // Natural mouse movements typically have higher entropy
    const isNatural = entropy > 2.5 && averageSpeed < 3.0;

    return {
      isNatural,
      entropy,
      averageSpeed
    };
  }

  private calculateEntropy(values: number[]): number {
    const histogram: Map<number, number> = new Map();
    values.forEach(v => {
      const rounded = Math.round(v * 100) / 100;
      histogram.set(rounded, (histogram.get(rounded) || 0) + 1);
    });

    return Array.from(histogram.values()).reduce((entropy, count) => {
      const p = count / values.length;
      return entropy - p * Math.log2(p);
    }, 0);
  }
}

// Honeypot Fields Generator
export class HoneypotManager {
  private readonly honeypotFields: Array<{id: string; name: string}> = [];

  constructor() {
    this.generateHoneypotFields();
  }

  private generateHoneypotFields(): void {
    const fields = [
      { id: crypto.randomUUID(), name: 'website' },
      { id: crypto.randomUUID(), name: 'email_confirm' },
      { id: crypto.randomUUID(), name: 'phone_confirm' }
    ];

    this.honeypotFields.push(...fields);
  }

  public injectHoneypots(form: HTMLFormElement): void {
    this.honeypotFields.forEach(field => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = field.id;
      input.name = field.name;
      input.autocomplete = 'off';
      
      // Hide the field using various techniques
      input.style.cssText = `
        position: absolute !important;
        width: 0 !important;
        height: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        clip: rect(1px 1px 1px 1px) !important;
        clip: rect(1px, 1px, 1px, 1px) !important;
        overflow: hidden !important;
      `;

      form.appendChild(input);
    });
  }

  public validateHoneypots(formData: FormData): boolean {
    return this.honeypotFields.every(field => {
      const value = formData.get(field.name);
      return !value || value === '';
    });
  }
}

// Export security utilities
export const security = {
  fingerprint: generateCanvasFingerprint,
  mouseAnalyzer: new MouseAnalyzer(),
  honeypot: new HoneypotManager()
};