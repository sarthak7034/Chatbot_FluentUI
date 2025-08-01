/**
 * Performance monitoring utilities and optimization helpers
 * Provides tools for measuring and optimizing application performance
 */

export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  bundleSize?: number;
  timestamp: number;
}

export interface PerformanceConfig {
  enableLogging: boolean;
  enableMemoryTracking: boolean;
  sampleRate: number;
  maxMetricsHistory: number;
}

// Default performance configuration
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableLogging: import.meta.env.DEV,
  enableMemoryTracking: "memory" in performance,
  sampleRate: 1.0, // 100% sampling in development
  maxMetricsHistory: 100,
};

// Performance metrics storage
let metricsHistory: PerformanceMetrics[] = [];
let config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG;

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (
  customConfig?: Partial<PerformanceConfig>
): void => {
  config = { ...DEFAULT_PERFORMANCE_CONFIG, ...customConfig };

  if (config.enableLogging) {
    console.log("Performance monitoring initialized", config);
  }
};

/**
 * Measure component render time
 */
export const measureRenderTime = <T extends (...args: any[]) => any>(
  componentName: string,
  renderFunction: T
): T => {
  return ((...args: any[]) => {
    if (!shouldSample()) return renderFunction(...args);

    const startTime = performance.now();
    const result = renderFunction(...args);
    const endTime = performance.now();

    recordMetric(
      {
        renderTime: endTime - startTime,
        componentCount: 1,
        timestamp: Date.now(),
      },
      componentName
    );

    return result;
  }) as T;
};

/**
 * Create a performance mark
 */
export const mark = (name: string): void => {
  if (performance.mark) {
    performance.mark(name);
  }
};

/**
 * Measure time between two marks
 */
export const measure = (
  name: string,
  startMark: string,
  endMark?: string
): number => {
  if (!performance.measure || !performance.getEntriesByName) {
    return 0;
  }

  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, "measure");
    return entries.length > 0 ? entries[entries.length - 1].duration : 0;
  } catch (error) {
    console.warn("Performance measurement failed:", error);
    return 0;
  }
};

/**
 * Get current memory usage (if available)
 */
export const getMemoryUsage = (): number | undefined => {
  if (!config.enableMemoryTracking) return undefined;

  // @ts-ignore - memory API is not in all browsers
  const memory = (performance as any).memory;
  if (memory) {
    return memory.usedJSHeapSize;
  }

  return undefined;
};

/**
 * Record performance metric
 */
export const recordMetric = (
  metric: Omit<PerformanceMetrics, "memoryUsage">,
  context?: string
): void => {
  if (!shouldSample()) return;

  const fullMetric: PerformanceMetrics = {
    ...metric,
    memoryUsage: getMemoryUsage(),
  };

  // Add to history
  metricsHistory.push(fullMetric);

  // Limit history size
  if (metricsHistory.length > config.maxMetricsHistory) {
    metricsHistory = metricsHistory.slice(-config.maxMetricsHistory);
  }

  // Log if enabled
  if (config.enableLogging && context) {
    console.log(`Performance [${context}]:`, fullMetric);
  }
};

/**
 * Get performance metrics history
 */
export const getMetricsHistory = (): PerformanceMetrics[] => {
  return [...metricsHistory];
};

/**
 * Clear metrics history
 */
export const clearMetricsHistory = (): void => {
  metricsHistory = [];
};

/**
 * Calculate average render time
 */
export const getAverageRenderTime = (lastN?: number): number => {
  const metrics = lastN ? metricsHistory.slice(-lastN) : metricsHistory;
  if (metrics.length === 0) return 0;

  const totalTime = metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
  return totalTime / metrics.length;
};

/**
 * Detect performance issues
 */
export const detectPerformanceIssues = (): {
  slowRenders: number;
  memoryLeaks: boolean;
  recommendations: string[];
} => {
  const slowRenderThreshold = 16; // 16ms for 60fps
  const slowRenders = metricsHistory.filter(
    (m) => m.renderTime > slowRenderThreshold
  ).length;

  // Simple memory leak detection
  const recentMetrics = metricsHistory.slice(-10);
  const memoryTrend =
    recentMetrics.length > 1
      ? recentMetrics[recentMetrics.length - 1].memoryUsage! -
        recentMetrics[0].memoryUsage!
      : 0;
  const memoryLeaks = memoryTrend > 1024 * 1024; // 1MB increase

  const recommendations: string[] = [];

  if (slowRenders > metricsHistory.length * 0.1) {
    recommendations.push(
      "Consider using React.memo for frequently re-rendering components"
    );
    recommendations.push("Check for expensive calculations in render methods");
  }

  if (memoryLeaks) {
    recommendations.push(
      "Potential memory leak detected - check for uncleared intervals/timeouts"
    );
    recommendations.push("Review event listeners and ensure proper cleanup");
  }

  return {
    slowRenders,
    memoryLeaks,
    recommendations,
  };
};

/**
 * Optimize bundle size analysis
 */
export const analyzeBundleSize = (): Promise<{
  totalSize: number;
  recommendations: string[];
}> => {
  return new Promise((resolve) => {
    // This would typically integrate with webpack-bundle-analyzer
    // For now, provide basic analysis
    const recommendations: string[] = [
      "Use dynamic imports for code splitting",
      "Remove unused dependencies",
      "Optimize images and assets",
      "Enable gzip compression",
    ];

    resolve({
      totalSize: 0, // Would be calculated from actual bundle
      recommendations,
    });
  });
};

/**
 * Debounced performance logger
 */
export const debouncedLog = debounce((message: string, data?: any) => {
  if (config.enableLogging) {
    console.log(message, data);
  }
}, 100);

/**
 * Check if we should sample this performance measurement
 */
const shouldSample = (): boolean => {
  return Math.random() < config.sampleRate;
};

/**
 * Simple debounce utility
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * React performance optimization helpers
 */
export const optimizationHelpers = {
  /**
   * Create a memoized component comparison function
   */
  createMemoComparison:
    <T extends Record<string, any>>(keys: (keyof T)[]) =>
    (prevProps: T, nextProps: T): boolean => {
      return keys.every((key) => prevProps[key] === nextProps[key]);
    },

  /**
   * Check if an object has changed (shallow comparison)
   */
  hasChanged: <T extends Record<string, any>>(prev: T, next: T): boolean => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    if (prevKeys.length !== nextKeys.length) return true;

    return prevKeys.some((key) => prev[key] !== next[key]);
  },

  /**
   * Create a stable callback reference
   */
  createStableCallback: <T extends (...args: any[]) => any>(callback: T): T => {
    // This would typically use useCallback in a React context
    // Here we provide the logic for manual optimization
    return callback;
  },
};

/**
 * Virtual scrolling performance helpers
 */
export const virtualScrollHelpers = {
  /**
   * Calculate visible items for virtual scrolling
   */
  calculateVisibleItems: (
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 5
  ): { startIndex: number; endIndex: number; visibleItems: number } => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(
      totalItems - 1,
      startIndex + visibleItems + overscan * 2
    );

    return { startIndex, endIndex, visibleItems };
  },

  /**
   * Calculate scroll position for item
   */
  getScrollPositionForItem: (itemIndex: number, itemHeight: number): number => {
    return itemIndex * itemHeight;
  },
};

// Export performance monitoring instance
export const performanceMonitor = {
  init: initPerformanceMonitoring,
  measureRender: measureRenderTime,
  mark,
  measure,
  record: recordMetric,
  getHistory: getMetricsHistory,
  clear: clearMetricsHistory,
  getAverage: getAverageRenderTime,
  detect: detectPerformanceIssues,
  analyze: analyzeBundleSize,
};