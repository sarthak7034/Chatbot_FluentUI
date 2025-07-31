/**
 * Accessibility utility functions
 * Provides utilities for WCAG compliance and accessibility features
 */

export interface AccessibilityConfig {
  announceMessages: boolean;
  keyboardShortcuts: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

export interface FocusManagement {
  trapFocus: boolean;
  restoreFocus: boolean;
  skipLinks: boolean;
}

// Default accessibility configuration
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  announceMessages: true,
  keyboardShortcuts: true,
  highContrast: false,
  reducedMotion: false,
  screenReaderOptimized: true,
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Check if user prefers dark theme
 */
export const prefersDarkTheme = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Create ARIA label for message
 */
export const createMessageAriaLabel = (
  sender: 'user' | 'bot',
  message: string,
  timestamp?: Date
): string => {
  const timeString = timestamp ? `, sent at ${timestamp.toLocaleTimeString()}` : '';
  return `${sender === 'user' ? 'You' : 'Bot'} said: ${message}${timeString}`;
};

/**
 * Generate unique ID for accessibility
 */
export const generateA11yId = (prefix: string = 'a11y'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check color contrast ratio
 */
export const checkContrastRatio = (
  foreground: string,
  background: string
): { ratio: number; passes: { aa: boolean; aaa: boolean } } => {
  // Simplified contrast calculation
  // In a real implementation, you'd use a proper color contrast library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use a proper color library in production
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio,
    passes: {
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    },
  };
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within an element
   */
  trapFocus: (element: HTMLElement): (() => void) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
  
  /**
   * Get next focusable element
   */
  getNextFocusable: (current: HTMLElement, direction: 'next' | 'prev' = 'next'): HTMLElement | null => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
    
    const currentIndex = focusableElements.indexOf(current);
    if (currentIndex === -1) return null;
    
    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    
    return focusableElements[nextIndex];
  },
  
  /**
   * Save and restore focus
   */
  createFocusManager: () => {
    let savedFocus: HTMLElement | null = null;
    
    return {
      save: () => {
        savedFocus = document.activeElement as HTMLElement;
      },
      restore: () => {
        if (savedFocus && savedFocus.focus) {
          savedFocus.focus();
        }
      },
    };
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation
   */
  handleArrowKeys: (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ): void => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        newIndex = Math.min(items.length - 1, currentIndex + 1);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentIndex) {
      e.preventDefault();
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  },
  
  /**
   * Create keyboard shortcut handler
   */
  createShortcutHandler: (shortcuts: Record<string, () => void>) => {
    return (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.metaKey && 'meta',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');
      
      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
  },
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Create live region for announcements
   */
  createLiveRegion: (priority: 'polite' | 'assertive' = 'polite'): HTMLElement => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  },
  
  /**
   * Announce to live region
   */
  announce: (message: string, liveRegion?: HTMLElement): void => {
    if (!liveRegion) {
      announceToScreenReader(message);
      return;
    }
    
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  },
};

/**
 * ARIA utilities
 */
export const aria = {
  /**
   * Set ARIA attributes on element
   */
  setAttributes: (element: HTMLElement, attributes: Record<string, string | boolean | null>): void => {
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      
      if (value === null) {
        element.removeAttribute(ariaKey);
      } else {
        element.setAttribute(ariaKey, String(value));
      }
    });
  },
  
  /**
   * Create describedby relationship
   */
  createDescribedBy: (element: HTMLElement, descriptionId: string): void => {
    const existingDescribedBy = element.getAttribute('aria-describedby');
    const describedBy = existingDescribedBy 
      ? `${existingDescribedBy} ${descriptionId}`
      : descriptionId;
    
    element.setAttribute('aria-describedby', describedBy);
  },
  
  /**
   * Create labelledby relationship
   */
  createLabelledBy: (element: HTMLElement, labelId: string): void => {
    element.setAttribute('aria-labelledby', labelId);
  },
};

// Export accessibility utilities
export const a11y = {
  config: DEFAULT_ACCESSIBILITY_CONFIG,
  announce: announceToScreenReader,
  createMessageLabel: createMessageAriaLabel,
  generateId: generateA11yId,
  checkContrast: checkContrastRatio,
  focus: focusManagement,
  keyboard: keyboardNavigation,
  screenReader,
  aria,
  preferences: {
    reducedMotion: prefersReducedMotion,
    highContrast: prefersHighContrast,
    darkTheme: prefersDarkTheme,
  },
};