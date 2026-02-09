/**
 * Custom Hooks Export
 * Performance monitoring, data fetching, and UI hooks
 */

export {
  useRenderPerformance,
  usePerformanceMonitor,
  useMemoryMonitor,
  useGlobalPerformance,
  useExpensiveRenderWarning,
  useDebouncedCallback,
  useVirtualization,
  performanceStore,
  generatePerformanceReport,
} from './usePerformance';

export type {
  PerformanceMetrics,
  ComponentMetrics,
  GlobalPerformanceState,
} from './usePerformance';
