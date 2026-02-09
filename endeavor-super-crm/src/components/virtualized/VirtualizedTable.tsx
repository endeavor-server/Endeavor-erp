/**
 * Virtualized Table Component
 * Efficiently renders large datasets (600+ freelancers, thousands of invoices)
 * Only renders visible items for 60fps performance
 */

import React, { useRef, useState, useEffect, useCallback, useMemo, forwardRef } from 'react';

// ============================================
// Types
// ============================================

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
  cellClassName?: string;
}

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  headerHeight?: number;
  containerHeight?: number | string;
  overscan?: number;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
  loading?: boolean;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  stickyHeader?: boolean;
  className?: string;
  estimatedRowCount?: number;
}

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  containerHeight: number | string;
  overscan?: number;
  emptyMessage?: string;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

// ============================================
// Virtualized Table Component
// ============================================

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 56,
  headerHeight = 48,
  containerHeight = 400,
  overscan = 5,
  emptyMessage = 'No data available',
  onRowClick,
  rowClassName,
  loading = false,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  stickyHeader = true,
  className = '',
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width
  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  // Calculate visible range
  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const totalHeight = data.length * rowHeight;
    const containerH = typeof containerHeight === 'number' 
      ? containerHeight 
      : containerRef.current?.clientHeight || 400;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(containerH / rowHeight);
    const endIndex = Math.min(data.length, startIndex + visibleCount + overscan * 2);
    
    const virtualItems = data.slice(startIndex, endIndex).map((row, index) => ({
      row,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * rowHeight,
        left: 0,
        right: 0,
        height: rowHeight,
      },
    }));

    return { virtualItems, totalHeight, startIndex, endIndex };
  }, [data, rowHeight, scrollTop, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle sort
  const handleSort = useCallback((columnKey: string) => {
    if (!onSort) return;
    
    if (sortColumn === columnKey) {
      onSort(columnKey, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(columnKey, 'asc');
    }
  }, [sortColumn, sortDirection, onSort]);

  // Column width calculation
  const columnWidths = useMemo(() => {
    const totalDefinedWidth = columns.reduce((sum, col) => {
      return sum + (typeof col.width === 'number' ? col.width : 0);
    }, 0);
    
    const undefinedCount = columns.filter(col => !col.width).length;
    const remainingWidth = Math.max(0, containerWidth - totalDefinedWidth);
    const defaultWidth = undefinedCount > 0 ? remainingWidth / undefinedCount : 0;

    return columns.map(col => {
      if (typeof col.width === 'number') return col.width;
      if (typeof col.width === 'string') return col.width;
      return defaultWidth;
    });
  }, [columns, containerWidth]);

  if (loading) {
    return (
      <div 
        className={`virtualized-table-loading ${className}`}
        style={{ 
          height: typeof containerHeight === 'number' ? containerHeight : 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className={`virtualized-table-empty ${className}`}
        style={{ 
          height: typeof containerHeight === 'number' ? containerHeight : 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  const height = typeof containerHeight === 'number' ? containerHeight : '100%';

  return (
    <div 
      ref={containerRef}
      className={`virtualized-table ${className}`}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* Header */}
      <div
        className={`virtualized-table-header ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
        style={{
          height: headerHeight,
          backgroundColor: 'var(--surface-hover)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {columns.map((col, idx) => (
          <div
            key={col.key}
            onClick={() => col.sortable && handleSort(col.key)}
            style={{
              width: columnWidths[idx],
              minWidth: col.minWidth,
              maxWidth: col.maxWidth,
              padding: '0 16px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-secondary)',
              cursor: col.sortable ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
              userSelect: 'none',
            }}
          >
            {col.header}
            {col.sortable && sortColumn === col.key && (
              <span style={{ marginLeft: 4 }}>
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <div style={{ position: 'relative', height: totalHeight }}>
        {virtualItems.map(({ row, index, style }) => (
          <div
            key={`row-${index}`}
            className={`virtualized-table-row ${rowClassName?.(row, index) || ''}`}
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              cursor: onRowClick ? 'pointer' : 'default',
            }}
            onClick={() => onRowClick?.(row, index)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            {columns.map((col, colIdx) => (
              <div
                key={`${col.key}-${index}`}
                className={col.cellClassName}
                style={{
                  width: columnWidths[colIdx],
                  minWidth: col.minWidth,
                  maxWidth: col.maxWidth,
                  padding: '0 16px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: col.align || 'left',
                }}
              >
                {col.render ? col.render(row, index) : row[col.key]}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Render count indicator (dev mode) */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            padding: '4px 8px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          Showing {startIndex + 1}-{endIndex} of {data.length} (rendered: {virtualItems.length})
        </div>
      )}
    </div>
  );
}

// ============================================
// Virtualized List Component
// ============================================

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  overscan = 5,
  emptyMessage = 'No items',
  className = '',
  onScroll,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const containerH = typeof containerHeight === 'number' 
      ? containerHeight 
      : containerRef.current?.clientHeight || 400;
    const visibleCount = Math.ceil(containerH / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, idx) => ({
      item,
      index: startIndex + idx,
      style: {
        position: 'absolute' as const,
        top: (startIndex + idx) * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    }));

    return { virtualItems, totalHeight, startIndex, endIndex };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  if (items.length === 0) {
    return (
      <div 
        className={`virtualized-list-empty ${className}`}
        style={{ 
          height: typeof containerHeight === 'number' ? containerHeight : 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  const height = typeof containerHeight === 'number' ? containerHeight : '100%';

  return (
    <div
      ref={containerRef}
      className={`virtualized-list ${className}`}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div style={{ position: 'relative', height: totalHeight }}>
        {virtualItems.map(({ item, index, style }) => (
          <div key={`item-${index}`} style={style}>
            {renderItem(item, index, style)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Virtualized Dropdown Component
// ============================================

export interface VirtualizedDropdownProps<T> {
  items: T[];
  itemHeight: number;
  maxHeight?: number;
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  getItemId: (item: T) => string;
  selectedId?: string | null;
  onSelect: (item: T, index: number) => void;
  onClose?: () => void;
  emptyMessage?: string;
  className?: string;
}

export function VirtualizedDropdown<T>({
  items,
  itemHeight,
  maxHeight = 300,
  renderItem,
  getItemId,
  selectedId,
  onSelect,
  onClose,
  emptyMessage = 'No items available',
  className = '',
}: VirtualizedDropdownProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Find selected index for initial scroll
  useEffect(() => {
    if (selectedId) {
      const index = items.findIndex(item => getItemId(item) === selectedId);
      if (index !== -1 && containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    }
  }, [selectedId, items, getItemId, itemHeight]);

  const { virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const overscan = 3;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(maxHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, idx) => ({
      item,
      index: startIndex + idx,
      style: {
        position: 'absolute' as const,
        top: (startIndex + idx) * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    }));

    return { virtualItems, totalHeight };
  }, [items, itemHeight, scrollTop, maxHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }

    const currentIndex = selectedId 
      ? items.findIndex(item => getItemId(item) === selectedId)
      : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(items.length - 1, currentIndex + 1);
      if (nextIndex >= 0) {
        onSelect(items[nextIndex], nextIndex);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(0, currentIndex - 1);
      if (prevIndex >= 0) {
        onSelect(items[prevIndex], prevIndex);
      }
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      onSelect(items[currentIndex], currentIndex);
      onClose?.();
    }
  }, [items, selectedId, getItemId, onSelect, onClose]);

  return (
    <div
      ref={containerRef}
      className={`virtualized-dropdown ${className}`}
      style={{
        maxHeight,
        overflow: 'auto',
        position: 'relative',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {items.length === 0 ? (
        <div style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ position: 'relative', height: totalHeight }}>
          {virtualItems.map(({ item, index, style }) => {
            const isSelected = getItemId(item) === selectedId;
            return (
              <div
                key={getItemId(item)}
                style={{
                  ...style,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                }}
                onClick={() => {
                  onSelect(item, index);
                  onClose?.();
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {renderItem(item, index, isSelected)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// Export utilities
// ============================================

export { useMemo, useCallback };
