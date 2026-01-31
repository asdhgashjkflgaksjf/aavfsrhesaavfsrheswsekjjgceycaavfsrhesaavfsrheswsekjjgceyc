import type { CSSProperties } from 'react';

// Generate random class names
const generateRandomClass = () => {
  return `c${Math.random().toString(36).substring(2, 8)}`;
};

// Generate random styles
const generateRandomStyles = (): CSSProperties => {
  const styles: CSSProperties = {};
  
  // Random padding
  styles.padding = `${Math.floor(Math.random() * 4) + 1}px ${Math.floor(Math.random() * 4) + 1}px`;
  
  // Random margin
  styles.margin = `${Math.floor(Math.random() * 4)}px`;
  
  // Random flex order
  styles.order = Math.floor(Math.random() * 5).toString();
  
  return styles;
};

// Generate random attributes
const generateRandomAttributes = () => {
  const attrs: Record<string, string> = {};
  attrs[`data-${generateRandomClass()}`] = generateRandomClass();
  return attrs;
};

// Mutate element structure
export const mutateDOMStructure = (element: HTMLElement) => {
  // Add random wrapper divs
  const wrapperCount = Math.floor(Math.random() * 2) + 1;
  let currentElement = element;
  
  for (let i = 0; i < wrapperCount; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = generateRandomClass();
    Object.assign(wrapper.style, generateRandomStyles());
    currentElement.parentNode?.insertBefore(wrapper, currentElement);
    wrapper.appendChild(currentElement);
    currentElement = wrapper;
  }
  
  // Add random attributes to children
  const children = element.getElementsByTagName('*');
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    const attrs = generateRandomAttributes();
    Object.entries(attrs).forEach(([key, value]) => {
      child.setAttribute(key, value);
    });
    Object.assign(child.style, generateRandomStyles());
  }
};

// Initialize mutation on load
export const initDOMMutation = () => {
  window.addEventListener('load', () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      // Wait for React to render
      setTimeout(() => {
        mutateDOMStructure(rootElement);
      }, 100);
    }
  });
};