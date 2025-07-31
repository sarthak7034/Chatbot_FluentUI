/**
 * Responsive utility functions and breakpoint detection
 * Provides utilities for responsive design and breakpoint management
 */

export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}

export interface ResponsiveState {
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  reducedMotion: boolean;
}

export interface LayoutConfig {
  maxWidth: number;
  padding: number;
  messageSpacing: number;
  headerHeight: number;
  inputHeight: number;
}

export interface ResponsiveConfig {
  breakpoints: Breakpoints;
  layouts: {
    mobile: LayoutConfig;
    tablet: LayoutConfig;
    desktop: LayoutConfig;
    large: LayoutConfig;
  };
}

// Default breakpoint configuration
export const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  large: 1920,
};

// Default responsive configuration
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: DEFAULT_BREAKPOINTS,
  layouts: {
    mobile: {
      maxWidth: 100,
      padding: 16,
      messageSpacing: 8,
      headerHeight: 56,
      inputHeight: 48,
    },
    tablet: {
      maxWidth: 100,
      padding: 24,
      messageSpacing: 12,
      headerHeight: 64,
      inputHeight: 52,
    },
    desktop: {
      maxWidth: 800,
      padding: 32,
      messageSpacing: 16,
      headerHeight: 72,
      inputHeight: 56,
    },
    large: {
      maxWidth: 1000,
      padding: 40,
      messageSpacing: 20,
      headerHeight: 80,
      inputHeight: 60,
    },
  },
};

/**
 * Get current breakpoint based on window width
 */
export const getCurrentBreakpoint = (
  width: number,
  breakpoints: Breakpoints = DEFAULT_BREAKPOINTS
): ResponsiveState['breakpoint'] => {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  if (width < breakpoints.desktop) return 'desktop';
  return 'large';
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get device orientation
 */
export const getOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
  return width > height ? 'landscape' : 'portrait';
};

/**
 * Create responsive state object
 */
export const createResponsiveState = (
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  breakpoints: Breakpoints = DEFAULT_BREAKPOINTS
): ResponsiveState => {
  return {
    breakpoint: getCurrentBreakpoint(width, breakpoints),
    width,
    height,
    orientation: getOrientation(width, height),
    touchDevice: isTouchDevice(),
    reducedMotion: prefersReducedMotion(),
  };
};

/**
 * Get layout configuration for current breakpoint
 */
export const getLayoutConfig = (
  breakpoint: ResponsiveState['breakpoint'],
  config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG
): LayoutConfig => {
  return config.layouts[breakpoint];
};

/**
 * Create media query string for breakpoint
 */
export const createMediaQuery = (
  breakpoint: keyof Breakpoints,
  breakpoints: Breakpoints = DEFAULT_BREAKPOINTS,
  type: 'min' | 'max' = 'min'
): string => {
  const width = breakpoints[breakpoint];
  return `(${type}-width: ${width}px)`;
};

/**
 * Check if current viewport matches media query
 */
export const matchesMediaQuery = (query: string): boolean => {
  return window.matchMedia(query).matches;
};

/**
 * Debounce function for resize events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for scroll events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Calculate optimal message width based on viewport
 */
export const calculateMessageWidth = (
  viewportWidth: number,
  breakpoint: ResponsiveState['breakpoint'],
  config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG
): number => {
  const layout = config.layouts[breakpoint];
  const maxWidth = layout.maxWidth;
  
  if (typeof maxWidth === 'number' && maxWidth < 100) {
    // If maxWidth is a percentage (< 100), treat as percentage
    return Math.min(viewportWidth * (maxWidth / 100), 800);
  }
  
  // Otherwise treat as absolute pixel value
  return Math.min(viewportWidth - layout.padding * 2, maxWidth);
};

/**
 * Get touch target size based on device type
 */
export const getTouchTargetSize = (touchDevice: boolean): number => {
  return touchDevice ? 44 : 32; // 44px for touch, 32px for mouse
};