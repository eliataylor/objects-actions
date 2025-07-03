// Performance monitoring utilities for tRPC requests

interface PerformanceMetric {
  endpoint: string;
  duration: number;
  timestamp: number;
  status: 'success' | 'error';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  logRequest(endpoint: string, duration: number, status: 'success' | 'error' = 'success') {
    this.metrics.push({
      endpoint,
      duration,
      timestamp: Date.now(),
      status,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request detected: ${endpoint} took ${duration}ms`);
    }
  }

  getSlowRequests(threshold: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  getPerformanceReport(): {
    totalRequests: number;
    avgResponseTime: number;
    slowRequests: number;
    errorRate: number;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
  } {
    const last5Minutes = Date.now() - 5 * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);

    const slowRequests = recentMetrics.filter(m => m.duration > 1000);
    const errors = recentMetrics.filter(m => m.status === 'error');

    // Group by endpoint and calculate averages
    const endpointStats = new Map<string, number[]>();
    recentMetrics.forEach(m => {
      if (!endpointStats.has(m.endpoint)) {
        endpointStats.set(m.endpoint, []);
      }
      endpointStats.get(m.endpoint)!.push(m.duration);
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      totalRequests: recentMetrics.length,
      avgResponseTime: this.getAverageResponseTime(),
      slowRequests: slowRequests.length,
      errorRate: errors.length / recentMetrics.length,
      slowestEndpoints,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper function to wrap tRPC calls with performance monitoring
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      performanceMonitor.logRequest(endpoint, Date.now() - start, 'success');
      return result;
    } catch (error) {
      performanceMonitor.logRequest(endpoint, Date.now() - start, 'error');
      throw error;
    }
  }) as T;
} 