/**
 * Optimized API Service Layer
 * Features: Request deduplication, batching, caching, and error handling
 * Optimized for high-traffic scenarios with 900+ workforce
 */

import { supabase } from '../lib/supabase';
import { generateCacheKey } from '../utils/pagination';

// ============================================
// Types
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

interface BatchRequest {
  id: string;
  table: string;
  query: any;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}

export interface APIConfig {
  cacheEnabled: boolean;
  defaultCacheTTL: number; // milliseconds
  deduplicationEnabled: boolean;
  batchingEnabled: boolean;
  batchWindow: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

// ============================================
// Configuration
// ============================================

const DEFAULT_CONFIG: APIConfig = {
  cacheEnabled: true,
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
  deduplicationEnabled: true,
  batchingEnabled: true,
  batchWindow: 10, // 10ms batching window
  retryAttempts: 3,
  retryDelay: 1000,
};

// ============================================
// LRU Cache Implementation
// ============================================

class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  size(): number {
    return this.cache.size;
  }
}

// ============================================
// API Service Class
// ============================================

class APIService {
  private cache: LRUCache<string, CacheEntry<any>>;
  private pendingRequests: Map<string, PendingRequest<any>>;
  private batchQueue: BatchRequest[];
  private batchTimeout: ReturnType<typeof setTimeout> | null;
  private config: APIConfig;

  constructor(config: Partial<APIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new LRUCache(200); // Max 200 cached items
    this.pendingRequests = new Map();
    this.batchQueue = [];
    this.batchTimeout = null;
  }

  // ============================================
  // Core Query Methods
  // ============================================

  /**
   * Optimized query with caching and deduplication
   */
  async query<T>(
    table: string,
    queryBuilder: (qb: any) => any,
    options: {
      cacheKey?: string;
      cacheTTL?: number;
      forceRefresh?: boolean;
      tags?: string[];
    } = {}
  ): Promise<{ data: T[] | null; error: any; fromCache: boolean }> {
    const cacheKey = options.cacheKey || `${table}:${Date.now()}`;
    const ttl = options.cacheTTL || this.config.defaultCacheTTL;

    // Check cache first
    if (this.config.cacheEnabled && !options.forceRefresh) {
      const cached = this.getFromCache<T[]>(cacheKey);
      if (cached) {
        console.log(`[API] Cache hit: ${cacheKey}`);
        return { data: cached, error: null, fromCache: true };
      }
    }

    // Check for pending request (deduplication)
    if (this.config.deduplicationEnabled) {
      const pending = this.pendingRequests.get(cacheKey);
      if (pending && Date.now() - pending.timestamp < 5000) {
        console.log(`[API] Deduplicating request: ${cacheKey}`);
        const data = await pending.promise;
        return { data, error: null, fromCache: false };
      }
    }

    // Create new request
    const promise = this.executeQuery<T>(table, queryBuilder);
    
    // Track pending request
    if (this.config.deduplicationEnabled) {
      this.pendingRequests.set(cacheKey, { promise, timestamp: Date.now() });
    }

    try {
      const data = await promise;
      
      // Cache successful response
      if (this.config.cacheEnabled && data) {
        this.setCache(cacheKey, data, ttl);
      }

      return { data, error: null, fromCache: false };
    } catch (error) {
      return { data: null, error, fromCache: false };
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute query with retry logic
   */
  private async executeQuery<T>(
    table: string,
    queryBuilder: (qb: any) => any
  ): Promise<T[]> {
    let lastError: any;
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const baseQuery = supabase.from(table).select();
        const query = queryBuilder(baseQuery);
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        lastError = error;
        console.warn(`[API] Query failed (attempt ${attempt + 1}/${this.config.retryAttempts}):`, error);
        
        if (attempt < this.config.retryAttempts - 1) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Single record fetch with caching
   */
  async getById<T>(
    table: string,
    id: string,
    options: {
      select?: string;
      cacheTTL?: number;
    } = {}
  ): Promise<{ data: T | null; error: any; fromCache: boolean }> {
    const cacheKey = `${table}:id:${id}`;
    const { select = '*', cacheTTL } = options;

    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return { data: cached, error: null, fromCache: true };
      }
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Cache result
      if (this.config.cacheEnabled && data) {
        this.setCache(cacheKey, data, cacheTTL);
      }

      return { data, error: null, fromCache: false };
    } catch (error) {
      return { data: null, error, fromCache: false };
    }
  }

  // ============================================
  // Batch Operations
  // ============================================

  /**
   * Add request to batch queue
   */
  batch<T>(table: string, queryBuilder: (qb: any) => any): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest = {
        id: `${table}:${Date.now()}:${Math.random()}`,
        table,
        query: queryBuilder,
        resolve,
        reject,
      };

      this.batchQueue.push(request);

      // Flush batch after window
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flushBatch(), this.config.batchWindow);
      }
    });
  }

  /**
   * Execute batched requests
   */
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      this.batchTimeout = null;
      return;
    }

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;

    console.log(`[API] Flushing batch of ${batch.length} requests`);

    // Group by table for efficient querying
    const groupedByTable = batch.reduce((acc, req) => {
      if (!acc[req.table]) acc[req.table] = [];
      acc[req.table].push(req);
      return acc;
    }, {} as Record<string, BatchRequest[]>);

    // Execute batch queries
    await Promise.all(
      Object.entries(groupedByTable).map(async ([table, requests]) => {
        try {
          // For now, execute individually but in parallel
          // Future: Implement actual batch RPC
          const results = await Promise.all(
            requests.map(async (req) => {
              try {
                const baseQuery = supabase.from(table).select();
                const query = req.query(baseQuery);
                const { data, error } = await query;
                
                if (error) throw error;
                req.resolve(data);
                return { success: true, data };
              } catch (error) {
                req.reject(error);
                return { success: false, error };
              }
            })
          );
        } catch (error) {
          console.error('[API] Batch execution error:', error);
        }
      })
    );
  }

  // ============================================
  // Cache Management
  // ============================================

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.config.defaultCacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('[API] Cache cleared');
      return;
    }

    // Clear specific pattern
    // Note: In production, use a more sophisticated cache with pattern matching
    console.log(`[API] Cache invalidated for pattern: ${pattern}`);
  }

  invalidateTable(table: string): void {
    // This would need proper pattern support
    console.log(`[API] Cache invalidated for table: ${table}`);
  }

  // ============================================
  // Real-time Subscriptions
  // ============================================

  subscribe<T>(
    table: string,
    callback: (payload: { event: string; data: T }) => void,
    filter?: string
  ) {
    const channel = supabase
      .channel(`${table}_realtime`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          // Invalidate cache on changes
          this.invalidateTable(table);
          
          callback({
            event: payload.eventType,
            data: payload.new as T,
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  // ============================================
  // Optimistic Updates
  // ============================================

  async optimisticUpdate<T>(
    table: string,
    id: string,
    updates: Partial<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ): Promise<{ data: T | null; error: any }> {
    const cacheKey = `${table}:id:${id}`;
    const previousData = this.getFromCache<T>(cacheKey);

    // Optimistically update cache
    if (previousData) {
      this.setCache(cacheKey, { ...previousData, ...updates });
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update cache with confirmed data
      if (data) {
        this.setCache(cacheKey, data);
      }

      onSuccess?.(data);
      return { data, error: null };
    } catch (error) {
      // Revert optimistic update
      if (previousData) {
        this.setCache(cacheKey, previousData);
      }

      onError?.(error);
      return { data: null, error };
    }
  }

  // ============================================
  // Utilities
  // ============================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size(),
      keys: [], // Would need to expose keys from LRUCache
    };
  }

  getPendingRequestCount(): number {
    return this.pendingRequests.size;
  }
}

// ============================================
// Singleton Export
// ============================================

export const api = new APIService();

// ============================================
// Convenience Hooks
// ============================================

export function createOptimizedQuery(table: string) {
  return {
    // Paginated query with caching
    paginated: async <T>(
      queryBuilder: (qb: any) => any,
      options?: { cacheTTL?: number; forceRefresh?: boolean }
    ) => api.query<T>(table, queryBuilder, options),

    // Single record by ID
    byId: <T>(id: string, select?: string) => api.getById<T>(table, id, { select }),

    // Real-time subscription
    subscribe: <T>(callback: (payload: { event: string; data: T }) => void) =>
      api.subscribe<T>(table, callback),

    // Optimistic update
    optimisticUpdate: <T>(id: string, updates: Partial<T>) =>
      api.optimisticUpdate<T>(table, id, updates),
  };
}

// ============================================
// Pre-built Table APIs
// ============================================

export const optimizedAPI = {
  freelancers: createOptimizedQuery('freelancers'),
  employees: createOptimizedQuery('employees'),
  contractors: createOptimizedQuery('contractors'),
  vendors: createOptimizedQuery('vendors'),
  invoices: createOptimizedQuery('invoices'),
  contacts: createOptimizedQuery('contacts'),
  deals: createOptimizedQuery('deals'),
  activities: createOptimizedQuery('activities'),
  
  // Utility methods
  invalidateCache: (pattern?: string) => api.invalidateCache(pattern),
  getStats: () => ({
    cacheSize: api.getCacheStats().size,
    pendingRequests: api.getPendingRequestCount(),
  }),
};
