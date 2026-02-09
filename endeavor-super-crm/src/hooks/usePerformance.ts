/**
 * Performance Monitoring Hooks
 * Tracks render times, memory usage, and component performance
 * Optimized for 60fps (16ms frame budget) and 100MB memory target
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// Types
// ============================================

export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  fps?: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;
  slowRenders: number; // Renders > 16ms
}

export interface GlobalPerformanceState {
  components: Map<string, ComponentMetrics>;
  totalRenders: number;
  slowRenders: number;
  averageFps: number;
  memoryEstimate: number;
}

// ============================================
// Constants
// ============================================

const FRAME_BUDGET = 16; // 60fps = 16.67ms per frame, we use 16ms
const SLOW_RENDER_THRESHOLD = 16; // ms
const MEMORY_LIMIT = 100 * 1024 * 1024; // 100MB in bytes

// ============================================
// Global Performance Store
// ============================================

class PerformanceStore {
  private static instance: PerformanceStore;
  private metrics: Map<string, ComponentMetrics> = new Map();
  private fpsHistory: number[] = [];
  private listeners: Set<(state: GlobalPerformanceState) => void> = new Set();
  private animationFrameId: number | null = null;
  private lastFrameTime: number = performance.now();

  private constructor() {
    this.startFpsMonitoring();
  }

  static getInstance(): PerformanceStore {
    if (!PerformanceStore.instance) {
      PerformanceStore.instance = new PerformanceStore();
    }
    return PerformanceStore.instance;
  }

  private startFpsMonitoring() {
    const measureFps = (timestamp: number) => {
      const delta = timestamp - this.lastFrameTime;
      const fps = 1000 / delta;
      
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      this.lastFrameTime = timestamp;
      this.animationFrameId = requestAnimationFrame(measureFps);
    };
    
    this.animationFrameId = requestAnimationFrame(measureFps);
  }

  recordRender(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      lastRenderTime: 0,
      slowRenders: 0,
    };

    existing.renderCount++;
    existing.totalRenderTime += renderTime;
    existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
    existing.maxRenderTime = Math.max(existing.maxRenderTime, renderTime);
    existing.lastRenderTime = renderTime;
    
    if (renderTime > SLOW_RENDER_THRESHOLD) {
      existing.slowRenders++;
      console.warn(
        `[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms ` +
        `(threshold: ${SLOW_RENDER_THRESHOLD}ms)`
      );
    }

    this.metrics.set(componentName, existing);
    this.notifyListeners();
  }

  getState(): GlobalPerformanceState {
    const totalRenders = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.renderCount, 0);
    const slowRenders = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.slowRenders, 0);
    const averageFps = this.fpsHistory.length > 0
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      : 60;
    
    // Estimate memory usage
    const memoryEstimate = this.estimateMemoryUsage();

    return {
      components: new Map(this.metrics),
      totalRenders,
      slowRenders,
      averageFps,
      memoryEstimate,
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimate based on component count and renders
    const componentCount = this.metrics.size;
    const totalRenders = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.renderCount, 0);
    
    // Base estimate: ~1KB per component, ~100 bytes per render
    return componentCount * 1024 + totalRenders * 100;
  }

  subscribe(listener: (state: GlobalPerformanceState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  reset() {
    this.metrics.clear();
    this.fpsHistory = [];
    this.notifyListeners();
  }

  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.listeners.clear();
  }

  // Get slow components for optimization
  getSlowComponents(thresholdMs: number = SLOW_RENDER_THRESHOLD): ComponentMetrics[] {
    return Array.from(this.metrics.values())
      .filter(m => m.averageRenderTime > thresholdMs || m.slowRenders > 0)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }
}

export const performanceStore = PerformanceStore.getInstance();

// ============================================
// Hooks
// ============================================

/**
 * Track component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  // Start timing before render
  renderStartTime.current = performance.now();

  useEffect(() => {
    const mountTime = performance.now() - renderStartTime.current;
    const renderTime = mountTime;
    
    performanceStore.recordRender(componentName, renderTime);
    
    setMetrics(prev => ({
      ...prev,
      mountTime,
      renderTime,
      lastRenderTime: renderTime,
      updateCount: prev.updateCount + 1,
      averageRenderTime: (prev.averageRenderTime * prev.updateCount + renderTime) / (prev.updateCount + 1),
    }));
  });

  return metrics;
}

/**
 * Track specific operations or computations
 */
export function usePerformanceMonitor(operationName: string) {
  const measures = useRef<number[]>([]);

  const startMeasure = useCallback(() => {
    return performance.now();
  }, []);

  const endMeasure = useCallback((startTime: number) => {
    const duration = performance.now() - startTime;
    measures.current.push(duration);
    
    if (measures.current.length > 100) {
      measures.current.shift();
    }

    if (duration > SLOW_RENDER_THRESHOLD) {
      console.warn(`[Performance] Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    performanceStore.recordRender(operationName, duration);
    return duration;
  }, [operationName]);

  const getStats = useCallback(() => {
    const times = measures.current;
    if (times.length === 0) return null;
    
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      slowCount: times.filter(t => t > SLOW_RENDER_THRESHOLD).length,
    };
  }, []);

  return { startMeasure, endMeasure, getStats };
}

/**
 * Monitor memory usage
 */
export function useMemoryMonitor(warningThreshold: number = MEMORY_LIMIT * 0.8) {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const checkMemory = () => {
      // Use Performance Memory API if available
      const memory = (performance as any).memory;
      if (memory) {
        const used = memory.usedJSHeapSize;
        setMemoryUsage(used);
        setIsWarning(used > warningThreshold);
        
        if (used > MEMORY_LIMIT) {
          console.error(
            `[Performance] Memory limit exceeded: ${(used / 1024 / 1024).toFixed(2)}MB ` +
            `(limit: ${(MEMORY_LIMIT / 1024 / 1024).toFixed(0)}MB)`
          );
        }
      } else {
        // Fallback estimation
        setMemoryUsage(performanceStore.getState().memoryEstimate);
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [warningThreshold]);

  return { memoryUsage, isWarning };
}

/**
 * Subscribe to global performance state
 */
export function useGlobalPerformance() {
  const [state, setState] = useState<GlobalPerformanceState>(() => performanceStore.getState());

  useEffect(() => {
    return performanceStore.subscribe(setState);
  }, []);

  return state;
}

/**
 * Detect and warn about expensive re-renders
 */
export function useExpensiveRenderWarning(
  componentName: string,
  dependencies: any[],
  threshold: number = SLOW_RENDER_THRESHOLD
) {
  const prevDeps = useRef(dependencies);
  const renderStartTime = useRef<number>(0);

  renderStartTime.current = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderTime > threshold) {
      const changedDeps = dependencies.map((dep, i) => ({
        index: i,
        changed: !Object.is(dep, prevDeps.current[i]),
      })).filter(d => d.changed);
      
      console.warn(
        `[Performance] Expensive render in ${componentName}: ${renderTime.toFixed(2)}ms\n` +
        `Changed dependencies: ${changedDeps.map(d => d.index).join(', ')}`
      );
    }

    prevDeps.current = dependencies;
  });
}

/**
 * Debounce expensive operations
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: any[] = []
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, deps);
}

/**
 * Virtualization helper - calculate visible items
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));

    return {
      virtualItems,
      totalHeight: items.length * itemHeight,
      startIndex,
      endIndex,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    onScroll,
    scrollTop,
  };
}

// Import useMemo
import { useMemo } from 'react';

// ============================================
// Performance Dashboard Helper
// ============================================

export function generatePerformanceReport(): string {
  const state = performanceStore.getState();
  const slowComponents = performanceStore.getSlowComponents();
  
  let report = `
╔══════════════════════════════════════════════════════════════╗
║               PERFORMANCE REPORT                             ║
╠══════════════════════════════════════════════════════════════╣
║ Total Renders:       ${state.totalRenders.toString().padEnd(40)} ║
║ Slow Renders (>16ms): ${state.slowRenders.toString().padEnd(39)} ║
║ Average FPS:         ${state.averageFps.toFixed(1).padEnd(40)} ║
║ Memory Estimate:     ${(state.memoryEstimate / 1024 / 1024).toFixed(2)}MB${''.padEnd(36)} ║
╠══════════════════════════════════════════════════════════════╣
║ SLOW COMPONENTS (Average > 16ms):                            ║
`;

  if (slowComponents.length === 0) {
    report += `║ None - Great performance!                                    ║\n`;
  } else {
    slowComponents.slice(0, 10).forEach(c => {
      report += `║ • ${c.componentName.slice(0, 30).padEnd(30)} ${c.averageRenderTime.toFixed(1).padStart(6)}ms avg  ${c.slowRenders} slow  ║\n`;
    });
  }

  report += `╚══════════════════════════════════════════════════════════════╝`;

  return report;
}

// Console logging for development
if (import.meta.env.DEV) {
  setInterval(() => {
    console.log(generatePerformanceReport());
  }, 60000); // Log every minute in dev mode
}
