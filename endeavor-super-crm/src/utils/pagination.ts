/**
 * Pagination Utilities
 * Handles cursor-based and offset-based pagination for large datasets
 * Optimized for 900+ workforce and thousands of invoices
 */

export interface CursorPaginationParams {
  cursor?: string | null;
  limit: number;
  direction?: 'forward' | 'backward';
}

export interface OffsetPaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface OffsetPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Cursor-based pagination for large tables (freelancers, invoices)
 * Best for: 1000+ records with real-time updates
 * Uses created_at timestamp + id as cursor
 */
export function encodeCursor(item: { id: string; created_at: string }): string {
  return btoa(`${item.created_at}:${item.id}`);
}

export function decodeCursor(cursor: string): { timestamp: string; id: string } | null {
  try {
    const decoded = atob(cursor);
    const [timestamp, id] = decoded.split(':');
    if (!timestamp || !id) return null;
    return { timestamp, id };
  } catch {
    return null;
  }
}

/**
 * Build Supabase query for cursor-based pagination
 * Optimized for large datasets with proper indexing
 */
export function buildCursorQuery<T extends { id: string; created_at: string }>(
  baseQuery: any,
  params: CursorPaginationParams
) {
  const { cursor, limit = 20, direction = 'forward' } = params;
  
  let query = baseQuery.limit(limit + 1); // +1 to check if more data exists
  
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      if (direction === 'forward') {
        query = query.lt('created_at', decoded.timestamp)
          .or(`created_at.eq.${decoded.timestamp},id.lt.${decoded.id}`);
      } else {
        query = query.gt('created_at', decoded.timestamp)
          .or(`created_at.eq.${decoded.timestamp},id.gt.${decoded.id}`);
      }
    }
  }
  
  // Always sort by created_at DESC, then id for stable ordering
  query = query.order('created_at', { ascending: direction === 'backward' })
    .order('id', { ascending: direction === 'backward' });
  
  return query;
}

/**
 * Transform Supabase response to cursor paginated result
 */
export function toCursorPaginatedResult<T extends { id: string; created_at: string }>(
  items: T[],
  limit: number,
  direction: 'forward' | 'backward' = 'forward'
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  
  // Reverse if we're going backward
  if (direction === 'backward') {
    data.reverse();
  }
  
  return {
    data,
    nextCursor: hasMore && data.length > 0 ? encodeCursor(data[data.length - 1]) : null,
    prevCursor: data.length > 0 ? encodeCursor(data[0]) : null,
    hasMore,
  };
}

/**
 * Offset-based pagination for smaller tables
 * Best for: < 500 records, needs jump to specific page
 */
export function buildOffsetQuery(baseQuery: any, params: OffsetPaginationParams) {
  const { page, pageSize } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  return baseQuery.range(from, to);
}

/**
 * Transform Supabase response to offset paginated result
 */
export function toOffsetPaginatedResult<T>(
  data: T[],
  total: number,
  params: OffsetPaginationParams
): OffsetPaginatedResult<T> {
  const { page, pageSize } = params;
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Smart pagination selector - automatically chooses cursor vs offset
 * based on total count and use case
 */
export function selectPaginationStrategy(
  estimatedTotalCount: number,
  needsRandomAccess: boolean = false
): 'cursor' | 'offset' {
  // Use cursor pagination for large datasets without random page jumps
  if (estimatedTotalCount > 500 && !needsRandomAccess) {
    return 'cursor';
  }
  // Use offset for smaller datasets or when jumping to specific page is needed
  return 'offset';
}

/**
 * Pagination hook for managing paginated state
 */
export interface PaginationState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  // Cursor pagination
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  // Offset pagination
  page: number;
  totalPages: number;
  total: number;
}

export const initialPaginationState: PaginationState<any> = {
  data: [],
  loading: false,
  error: null,
  nextCursor: null,
  prevCursor: null,
  hasMore: true,
  page: 1,
  totalPages: 0,
  total: 0,
};

/**
 * Field selection helper - only fetch needed columns
 * Reduces payload size by 50-80% for large queries
 */
export function selectFields(table: string, fields?: string[]): string {
  const fieldMap: Record<string, Record<string, string>> = {
    freelancers: {
      minimal: 'id,freelancer_code,first_name,last_name,email,skills,primary_skill,availability,rating',
      list: 'id,freelancer_code,first_name,last_name,email,phone,skills,primary_skill,hourly_rate,availability,rating,total_projects,total_hours,city,status,created_at',
      card: 'id,freelancer_code,first_name,last_name,email,skills,primary_skill,hourly_rate,availability,rating,total_projects,total_hours,city,created_at',
      full: '*',
    },
    employees: {
      minimal: 'id,employee_code,first_name,last_name,email,department,designation,status',
      list: 'id,employee_code,first_name,last_name,email,phone,department,designation,base_salary,status,created_at',
      full: '*',
    },
    invoices: {
      minimal: 'id,invoice_number,invoice_type,total_amount,status,created_at',
      list: 'id,invoice_number,invoice_type,contact_id,freelancer_id,invoice_date,due_date,total_amount,amount_due,status,created_at',
      detail: 'id,invoice_number,invoice_type,contact_id,freelancer_id,contractor_id,vendor_id,invoice_date,due_date,subtotal,taxable_amount,cgst_amount,sgst_amount,igst_amount,tds_amount,total_amount,amount_due,amount_paid,status,notes,terms,created_at',
      full: '*,line_items:invoice_line_items(*),contacts(*),freelancers(*),contractors(*),vendors(*)',
    },
    contacts: {
      minimal: 'id,first_name,last_name,email,company_name,status',
      list: 'id,first_name,last_name,email,phone,company_name,contact_type,status,created_at',
      full: '*',
    },
    deals: {
      minimal: 'id,deal_name,stage,value,probability',
      list: 'id,deal_name,contact_id,stage,value,currency,probability,expected_close_date,created_at',
      full: '*,contacts(*)',
    },
  };
  
  if (!fields || fields.length === 0) {
    // Return default fields based on table
    return fieldMap[table]?.list || '*';
  }
  
  if (fields.length === 1 && fieldMap[table]?.[fields[0]]) {
    return fieldMap[table][fields[0]];
  }
  
  return fields.join(',');
}

/**
 * Cache key generator for pagination requests
 */
export function generateCacheKey(
  table: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return `${table}:${sortedParams}`;
}

/**
 * Debounced search for large datasets
 * Prevents excessive API calls while typing
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Smart batch size calculator
 * Adjusts batch size based on data complexity
 */
export function calculateOptimalBatchSize(
  fields: string,
  hasJoins: boolean = false
): number {
  const baseSize = 50;
  let multiplier = 1;
  
  // Reduce batch size for complex queries
  if (fields.includes('*')) multiplier *= 0.5;
  if (hasJoins) multiplier *= 0.5;
  if (fields.split(',').length > 10) multiplier *= 0.7;
  
  return Math.max(10, Math.floor(baseSize * multiplier));
}
