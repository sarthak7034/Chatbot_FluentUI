// Performance monitoring utilities for virtual scrolling and chat optimization

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  scrollPerformance: number;
  messageCount: number;
  timestamp: number;
}

interface ScrollPerformanceData {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  timestamp: number;
  fps: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private scrollData: ScrollPerformanceData[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;

  // Start performance monitoring
  startMonitoring(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  // Stop performance monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  // Record render performance
  recordRenderTime(startTime: number, messageCount: number): void {
    if (!this.isMonitoring) return;

    const renderTime = performance.now() - startTime;
    const memoryUsage = this.getMemoryUsage();

    const metric: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      scrollPerformance: this.calculateScrollPerformance(),
      messageCount,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Record scroll performance
  recordScrollPerformance(scrollElement: HTMLElement): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const fps = this.calculateFPS(now);

    const scrollData: ScrollPerformanceData = {
      scrollTop: scrollElement.scrollTop,
      scrollHeight: scrollElement.scrollHeight,
      clientHeight: scrollElement.clientHeight,
      timestamp: now,
      fps,
    };

    this.scrollData.push(scrollData);

    // Keep only last 50 scroll data points
    if (this.scrollData.length > 50) {
      this.scrollData = this.scrollData.slice(-50);
    }
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  // Calculate FPS
  private calculateFPS(currentTime: number): number {
    this.frameCount++;
    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime >= 1000) {
      const fps = (this.frameCount * 1000) / deltaTime;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
      return Math.round(fps);
    }

    return 60; // Default assumption
  }

  // Calculate scroll performance score
  private calculateScrollPerformance(): number {
    if (this.scrollData.length < 2) return 100;

    const recent = this.scrollData.slice(-10);
    const avgFps = recent.reduce((sum, data) => sum + data.fps, 0) / recent.length;
    
    // Score based on FPS (60 FPS = 100 score)
    return Math.min(100, (avgFps / 60) * 100);
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageRenderTime: number;
    averageMemoryUsage: number;
    averageScrollPerformance: number;
    totalMessages: number;
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        averageMemoryUsage: 0,
        averageScrollPerformance: 100,
        totalMessages: 0,
        recommendations: [],
      };
    }

    const recent = this.metrics.slice(-20); // Last 20 measurements
    const averageRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length;
    const averageMemoryUsage = recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length;
    const averageScrollPerformance = recent.reduce((sum, m) => sum + m.scrollPerformance, 0) / recent.length;
    const totalMessages = recent[recent.length - 1]?.messageCount || 0;

    const recommendations = this.generateRecommendations(
      averageRenderTime,
      averageMemoryUsage,
      averageScrollPerformance,
      totalMessages
    );

    return {
      averageRenderTime: Math.round(averageRenderTime * 100) / 100,
      averageMemoryUsage: Math.round(averageMemoryUsage * 100) / 100,
      averageScrollPerformance: Math.round(averageScrollPerformance),
      totalMessages,
      recommendations,
    };
  }

  // Generate performance recommendations
  private generateRecommendations(
    renderTime: number,
    memoryUsage: number,
    scrollPerformance: number,
    messageCount: number
  ): string[] {
    const recommendations: string[] = [];

    if (renderTime > 16) {
      recommendations.push("Consider enabling virtual scrolling for better render performance");
    }

    if (memoryUsage > 50) {
      recommendations.push("High memory usage detected. Consider reducing cached message count");
    }

    if (scrollPerformance < 80) {
      recommendations.push("Scroll performance is below optimal. Check for heavy components in messages");
    }

    if (messageCount > 1000 && renderTime > 10) {
      recommendations.push("Large message count with slow rendering. Virtual scrolling is recommended");
    }

    if (messageCount > 500 && !recommendations.length) {
      recommendations.push("Consider enabling virtual scrolling for optimal performance with large message lists");
    }

    return recommendations;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.scrollData = [];
    this.frameCount = 0;
  }

  // Export metrics for analysis
  exportMetrics(): {
    metrics: PerformanceMetrics[];
    scrollData: ScrollPerformanceData[];
  } {
    return {
      metrics: [...this.metrics],
      scrollData: [...this.scrollData],
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for using performance monitoring in React components
export const usePerformanceMonitoring = (enabled: boolean = false) => {
  const startRender = (): number => {
    return performance.now();
  };

  const endRender = (startTime: number, messageCount: number): void => {
    if (enabled) {
      performanceMonitor.recordRenderTime(startTime, messageCount);
    }
  };

  const recordScroll = (element: HTMLElement): void => {
    if (enabled) {
      performanceMonitor.recordScrollPerformance(element);
    }
  };

  const getSummary = () => {
    return performanceMonitor.getPerformanceSummary();
  };

  return {
    startRender,
    endRender,
    recordScroll,
    getSummary,
    monitor: performanceMonitor,
  };
};

// Utility functions for memory management
export const memoryUtils = {
  // Estimate message memory usage
  estimateMessageMemoryUsage: (messages: any[]): number => {
    const sampleSize = Math.min(messages.length, 10);
    if (sampleSize === 0) return 0;

    const sample = messages.slice(0, sampleSize);
    const avgSize = sample.reduce((sum, msg) => {
      return sum + JSON.stringify(msg).length * 2; // Rough estimate (UTF-16)
    }, 0) / sampleSize;

    return (avgSize * messages.length) / 1024 / 1024; // Convert to MB
  },

  // Check if memory optimization is needed
  shouldOptimizeMemory: (messageCount: number, memoryUsage: number): boolean => {
    return messageCount > 1000 || memoryUsage > 100; // 100MB threshold
  },

  // Get optimal cache size based on available memory
  getOptimalCacheSize: (availableMemory: number): number => {
    // Conservative approach: use max 10% of available memory for message cache
    const maxMemoryForCache = availableMemory * 0.1;
    const avgMessageSize = 0.5; // KB per message (rough estimate)
    
    return Math.floor(maxMemoryForCache / avgMessageSize);
  },
};

export default {
  performanceMonitor,
  usePerformanceMonitoring,
  memoryUtils,
};