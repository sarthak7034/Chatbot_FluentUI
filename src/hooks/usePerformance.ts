import { useEffect, useRef, useCallback } from 'react';
import { 
  performanceMonitor, 
  PerformanceConfig,
  DEFAULT_PERFORMANCE_CONFIG 
} from '../utils/performance';

/**
 * Hook for performance monitoring and optimization
 * Provides utilities for measuring and tracking component performance
 */
export const usePerformance = (
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Initialize performance monitoring on first use
  useEffect(() => {
    performanceMonitor.init({ ...DEFAULT_PERFORMANCE_CONFIG, ...config });
  }, []);

  // Track component mount time
  useEffect(() => {
    mountTimeRef.current = performance.now();
    performanceMonitor.mark(`${componentName}-mount-start`);

    return () => {
      const mountDuration = performance.now() - mountTimeRef.current;
      performanceMonitor.record({
        renderTime: mountDuration,
        componentCount: 1,
        timestamp: Date.now(),
      }, `${componentName}-mount`);
    };
  }, [componentName]);

  // Track render count and timing
  useEffect(() => {
    renderCountRef.current += 1;
    const renderTime = performance.now();
    
    if (lastRenderTimeRef.current > 0) {
      const timeSinceLastRender = renderTime - lastRenderTimeRef.current;
      performanceMonitor.record({
        renderTime: timeSinceLastRender,
        componentCount: 1,
        timestamp: Date.now(),
      }, `${componentName}-render`);
    }
    
    lastRenderTimeRef.current = renderTime;
  });

  // Measure function execution time
  const measureFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: any[]) => {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      
      performanceMonitor.record({
        renderTime: endTime - startTime,
        componentCount: 1,
        timestamp: Date.now(),
      }, `${componentName}-${functionName}`);
      
      return result;
    }) as T;
  }, [componentName]);

  // Mark performance points
  const mark = useCallback((markName: string) => {
    performanceMonitor.mark(`${componentName}-${markName}`);
  }, [componentName]);

  // Measure between marks
  const measure = useCallback((measureName: string, startMark: string, endMark?: string) => {
    return performanceMonitor.measure(
      `${componentName}-${measureName}`,
      `${componentName}-${startMark}`,
      endMark ? `${componentName}-${endMark}` : undefined
    );
  }, [componentName]);

  return {
    // Current metrics
    renderCount: renderCountRef.current,
    
    // Measurement utilities
    measureFunction,
    mark,
    measure,
    
    // Performance data
    getMetrics: performanceMonitor.getHistory,
    getAverageRenderTime: performanceMonitor.getAverage,
    detectIssues: performanceMonitor.detect,
    
    // Component-specific utilities
    recordCustomMetric: (metricName: string, value: number) => {
      performanceMonitor.record({
        renderTime: value,
        componentCount: 1,
        timestamp: Date.now(),
      }, `${componentName}-${metricName}`);
    },
  };
};

/**
 * Hook for measuring component render performance
 * Simpler version focused on render timing
 */
export const useRenderPerformance = (componentName: string) => {
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    if (renderTime > 0) {
      performanceMonitor.record({
        renderTime,
        componentCount: 1,
        timestamp: Date.now(),
      }, `${componentName}-render`);
    }
  });

  return {
    componentName,
    getCurrentRenderTime: () => performance.now() - renderStartRef.current,
  };
};