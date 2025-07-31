import { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveState, 
  ResponsiveConfig, 
  createResponsiveState, 
  debounce,
  DEFAULT_RESPONSIVE_CONFIG 
} from '../utils/responsive';

/**
 * Hook for responsive design and breakpoint detection
 * Provides current responsive state and utilities
 */
export const useResponsive = (config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG) => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() =>
    createResponsiveState(window.innerWidth, window.innerHeight, config.breakpoints)
  );

  // Debounced resize handler to avoid excessive re-renders
  const handleResize = useCallback(
    debounce(() => {
      const newState = createResponsiveState(
        window.innerWidth,
        window.innerHeight,
        config.breakpoints
      );
      setResponsiveState(newState);
    }, 150),
    [config.breakpoints]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Utility functions
  const isMobile = responsiveState.breakpoint === 'mobile';
  const isTablet = responsiveState.breakpoint === 'tablet';
  const isDesktop = responsiveState.breakpoint === 'desktop';
  const isLarge = responsiveState.breakpoint === 'large';
  
  const isMobileOrTablet = isMobile || isTablet;
  const isDesktopOrLarge = isDesktop || isLarge;

  // Get layout configuration for current breakpoint
  const layoutConfig = config.layouts[responsiveState.breakpoint];

  return {
    // Current state
    ...responsiveState,
    
    // Breakpoint checks
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isMobileOrTablet,
    isDesktopOrLarge,
    
    // Layout configuration
    layoutConfig,
    
    // Utility functions
    matchesBreakpoint: (breakpoint: ResponsiveState['breakpoint']) => 
      responsiveState.breakpoint === breakpoint,
    
    isBreakpointOrLarger: (breakpoint: ResponsiveState['breakpoint']) => {
      const breakpoints = ['mobile', 'tablet', 'desktop', 'large'];
      const currentIndex = breakpoints.indexOf(responsiveState.breakpoint);
      const targetIndex = breakpoints.indexOf(breakpoint);
      return currentIndex >= targetIndex;
    },
    
    isBreakpointOrSmaller: (breakpoint: ResponsiveState['breakpoint']) => {
      const breakpoints = ['mobile', 'tablet', 'desktop', 'large'];
      const currentIndex = breakpoints.indexOf(responsiveState.breakpoint);
      const targetIndex = breakpoints.indexOf(breakpoint);
      return currentIndex <= targetIndex;
    },
  };
};