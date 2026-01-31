// DevTools Detection Utility
export const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    return true;
  }

  // Check for Firebug
  if (window.console && (window.console as any).firebug) {
    return true;
  }

  // Check for Firefox dev tools
  if ('Firebug' in window) {
    return true;
  }

  // Advanced detection using debugger
  const element = new Image();
  const devtoolsOpen = () => {
    return Boolean(
      (element as any).x ||
      element.offsetHeight ||
      element.offsetWidth
    );
  };

  Object.defineProperty(element, 'id', {
    get: function() {
      return devtoolsOpen();
    }
  });

  return false;
};