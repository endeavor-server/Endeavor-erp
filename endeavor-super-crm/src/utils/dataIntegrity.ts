import { PostgrestError } from '@supabase/supabase-js';

// ============================================
// ERROR HANDLING TYPES
// ============================================

export interface DataIntegrityError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  constraint?: string;
  severity: 'error' | 'warning' | 'info';
  action?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// ============================================
// SUPABASE ERROR PARSER
// ============================================

export function parseSupabaseError(error: PostgrestError | null): DataIntegrityError | null {
  if (!error) return null;

  const errorMap: Record<string, DataIntegrityError> = {
    '23505': {
      code: 'DUPLICATE_VALUE',
      message: 'A record with this value already exists',
      field: extractFieldFromDetail(error.details || ''),
      severity: 'error',
      action: 'Use a different value or update the existing record',
    },
    '23503': {
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'Referenced record does not exist',
      details: error.details,
      severity: 'error',
      action: 'Ensure the referenced record exists before creating this one',
    },
    '23514': {
      code: 'CHECK_VIOLATION',
      message: 'Value does not meet the required constraints',
      details: error.details,
      severity: 'error',
    },
    '23502': {
      code: 'NOT_NULL_VIOLATION',
      message: 'Required field is missing',
      field: extractColumnFromMessage(error.message),
      severity: 'error',
      action: 'Please fill in all required fields',
    },
    'PGRST116': {
      code: 'UNIQUE_VIOLATION',
      message: 'This value must be unique',
      severity: 'error',
    },
    '42501': {
      code: 'INSUFFICIENT_PRIVILEGES',
      message: 'You do not have permission to perform this action',
      severity: 'error',
    },
    'PGRST301': {
      code: 'ROW_NOT_FOUND',
      message: 'The requested record was not found',
      severity: 'warning',
    },
  };

  const mappedError = errorMap[error.code];
  if (mappedError) {
    return {
      ...mappedError,
      details: error.details || error.hint || undefined,
    };
  }

  // Generic error handling
  return {
    code: error.code,
    message: error.message,
    details: error.details || error.hint || undefined,
    severity: 'error',
  };
}

function extractFieldFromDetail(detail: string): string | undefined {
  const match = detail.match(/Key \(([^)]+)\)/);
  return match ? match[1] : undefined;
}

function extractColumnFromMessage(message: string): string | undefined {
  const match = message.match(/column "([^"]+)"/);
  return match ? match[1] : undefined;
}

// ============================================
// DATA SANITIZATION UTILITIES
// ============================================

export function sanitizeString(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value
    .trim()
    .replace(/[<>]/g, '') // Basic XSS prevention
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

export function sanitizeGSTNumber(gst: string | null | undefined): string | undefined {
  if (!gst) return undefined;
  const cleaned = gst.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned || undefined;
}

export function sanitizePANNumber(pan: string | null | undefined): string | undefined {
  if (!pan) return undefined;
  const cleaned = pan.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned || undefined;
}

export function sanitizeAmount(amount: number | string | null | undefined): number {
  if (amount === null || amount === undefined) return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100);
}

// ============================================
// DATA NORMALIZATION UTILITIES
// ============================================

export function normalizeName(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Title case
}

export function normalizeCompanyName(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' '); // Preserve case for company names
}

export function normalizeIFSC(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  const cleaned = code.toUpperCase().trim();
  return cleaned || undefined;
}

export function normalizeDate(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date || undefined;
}

// ============================================
// DUPLICATE DETECTION UTILITIES
// ============================================

export interface DuplicateCheckOptions {
  fields: string[];
  threshold?: number; // For fuzzy matching (0-1)
  caseSensitive?: boolean;
}

export function findDuplicates<T extends Record<string, unknown>>(
  items: T[],
  options: DuplicateCheckOptions
): Array<{ item: T; matches: T[]; confidence: number }> {
  const { fields, threshold = 1, caseSensitive = false } = options;
  const duplicates: Array<{ item: T; matches: T[]; confidence: number }> = [];
  const processed = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    if (processed.has(i)) continue;

    const matches: T[] = [];
    let maxConfidence = 0;

    for (let j = i + 1; j < items.length; j++) {
      if (processed.has(j)) continue;

      const confidence = calculateSimilarity(items[i], items[j], fields, caseSensitive);

      if (confidence >= threshold) {
        matches.push(items[j]);
        processed.add(j);
        maxConfidence = Math.max(maxConfidence, confidence);
      }
    }

    if (matches.length > 0) {
      duplicates.push({
        item: items[i],
        matches,
        confidence: maxConfidence,
      });
      processed.add(i);
    }
  }

  return duplicates;
}

function calculateSimilarity(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  fields: string[],
  caseSensitive: boolean
): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const field of fields) {
    const valueA = String(a[field] || '');
    const valueB = String(b[field] || '');

    if (!valueA && !valueB) continue;

    const weight = valueA.length + valueB.length;
    const score = calculateLevenshteinSimilarity(
      caseSensitive ? valueA : valueA.toLowerCase(),
      caseSensitive ? valueB : valueB.toLowerCase()
    );

    totalScore += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

function calculateLevenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return maxLength > 0 ? 1 - distance / maxLength : 1;
}

// ============================================
// DATA CONSISTENCY CHECKERS
// ============================================

export interface ConsistencyCheck<T> {
  name: string;
  check: (item: T) => boolean | { valid: boolean; message: string };
  severity: 'error' | 'warning';
}

export function runConsistencyChecks<T>(
  item: T,
  checks: ConsistencyCheck<T>[]
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  for (const check of checks) {
    const result = check.check(item);
    const isValid = typeof result === 'boolean' ? result : result.valid;
    const message = typeof result === 'boolean' ? undefined : result.message;

    if (!isValid && message) {
      if (check.severity === 'error') {
        errors[check.name] = message;
      } else {
        warnings[check.name] = message;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

// ============================================
// REFERENTIAL INTEGRITY CHECKERS
// ============================================

export interface ReferenceCheck {
  table: string;
  id: string;
  required?: boolean;
}

export async function checkReferences(
  checks: ReferenceCheck[],
  queryFn: (table: string, filter: Record<string, string>) => Promise<{ count: number }>
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const check of checks) {
    try {
      const { count } = await queryFn(check.table, { id: check.id });
      results[`${check.table}.${check.id}`] = count > 0;
    } catch {
      results[`${check.table}.${check.id}`] = check.required ? false : true;
    }
  }

  return results;
}

// ============================================
// SOFT DELETE UTILITIES
// ============================================

export interface SoftDeletable {
  id: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

export function isDeleted(item: SoftDeletable): boolean {
  return !!item.deleted_at || item.is_deleted === true;
}

export function filterActive<T extends SoftDeletable>(items: T[]): T[] {
  return items.filter((item) => !isDeleted(item));
}

export function createSoftDeleteData(): { deleted_at: string; is_deleted: boolean } {
  return {
    deleted_at: new Date().toISOString(),
    is_deleted: true,
  };
}

// ============================================
// AUDIT LOG GENERATOR
// ============================================

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'delete' | 'soft_delete' | 'restore';
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  changed_fields?: string[];
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export function createAuditLogEntry<T extends Record<string, unknown>>(
  tableName: string,
  recordId: string,
  action: AuditLogEntry['action'],
  oldData?: T,
  newData?: T,
  userInfo?: { id: string; email: string }
): AuditLogEntry {
  const changedFields = oldData && newData ? detectChanges(oldData, newData) : [];

  return {
    id: generateUUID(),
    table_name: tableName,
    record_id: recordId,
    action,
    old_data: oldData,
    new_data: newData,
    changed_fields: changedFields,
    user_id: userInfo?.id,
    user_email: userInfo?.email,
    created_at: new Date().toISOString(),
  };
}

function detectChanges<T extends Record<string, unknown>>(
  oldData: T,
  newData: T
): string[] {
  const changes: string[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.push(key);
    }
  }

  return changes;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// TRANSACTION HANDLER
// ============================================

export interface TransactionOperation<T = unknown> {
  table: string;
  data: Partial<T>;
  id?: string;
  type: 'insert' | 'update' | 'delete';
}

export async function executeTransaction<T>(
  operations: TransactionOperation<T>[],
  executeFn: (op: TransactionOperation<T>) => Promise<void>,
  onError?: (error: DataIntegrityError, operation: TransactionOperation<T>) => void
): Promise<{ success: boolean; errors: Array<{ operation: TransactionOperation<T>; error: DataIntegrityError }> }> {
  const errors: Array<{ operation: TransactionOperation<T>; error: DataIntegrityError }> = [];

  for (const operation of operations) {
    try {
      await executeFn(operation);
    } catch (error) {
      const parsedError = parseSupabaseError(error as PostgrestError);
      if (parsedError) {
        errors.push({ operation, error: parsedError });
        if (onError) {
          onError(parsedError, operation);
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

// ============================================
// DATA EXPORTS
// ============================================

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: Array<{ key: keyof T; header: string; format?: (value: unknown) => string }>
): string {
  const headers = columns.map((col) => col.header).join(',');

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        const formatted = col.format ? col.format(value) : String(value ?? '');
        // Escape cells with commas, newlines, or quotes
        if (formatted.includes(',') || formatted.includes('\n') || formatted.includes('"')) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted;
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ============================================
// DATA QUALITY REPORT GENERATOR
// ============================================

export interface DataQualityReport {
  tableName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: Array<{
    recordId: string;
    field: string;
    issue: string;
    severity: 'error' | 'warning';
  }>;
  checks: Array<{
    name: string;
    passed: number;
    failed: number;
  }>;
  generatedAt: string;
}

export function generateDataQualityReport<T extends Record<string, unknown> & { id: string }>(
  tableName: string,
  records: T[],
  validators: Array<{ name: string; validate: (record: T) => { valid: boolean; issues: string[] } }>
): DataQualityReport {
  let validRecords = 0;
  let invalidRecords = 0;
  const errors: DataQualityReport['errors'] = [];
  const checks: DataQualityReport['checks'] = [];

  for (const record of records) {
    let recordValid = true;

    for (const validator of validators) {
      const result = validator.validate(record);
      const check = checks.find((c) => c.name === validator.name) || {
        name: validator.name,
        passed: 0,
        failed: 0,
      };

      if (!result.valid) {
        recordValid = false;
        check.failed++;
        for (const issue of result.issues) {
          errors.push({
            recordId: record.id,
            field: validator.name,
            issue,
            severity: 'error',
          });
        }
      } else {
        check.passed++;
      }

      if (!checks.find((c) => c.name === validator.name)) {
        checks.push(check);
      }
    }

    if (recordValid) {
      validRecords++;
    } else {
      invalidRecords++;
    }
  }

  return {
    tableName,
    totalRecords: records.length,
    validRecords,
    invalidRecords,
    errors,
    checks,
    generatedAt: new Date().toISOString(),
  };
}
