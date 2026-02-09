/**
 * Utilities Export
 * Pagination, calculations, and optimization utilities
 */

export {
  encodeCursor,
  decodeCursor,
  buildCursorQuery,
  buildOffsetQuery,
  toCursorPaginatedResult,
  toOffsetPaginatedResult,
  selectPaginationStrategy,
  selectFields,
  generateCacheKey,
  debounce,
  calculateOptimalBatchSize,
} from './pagination';

export type {
  CursorPaginationParams,
  OffsetPaginationParams,
  PaginatedResult,
  OffsetPaginatedResult,
  PaginationState,
} from './pagination';

// Re-export calculation utilities
export * from './gstCalculations';
export * from './tdsCalculations';
export * from './invoiceNumbering';
export * from './pdfGenerator';
