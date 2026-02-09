/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 * WCAG 4.1.3 Status Messages
 */

import type { ReactNode } from 'react';

interface LiveRegionProps {
  /** Content to announce */
  children?: ReactNode;
  /** Politeness level - assertive interrupts, polite waits */
  politeness?: 'polite' | 'assertive';
  /** Whether to announce atomic changes */
  atomic?: boolean;
  /** Whether the region is relevant */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  /** Unique ID for the region */
  id?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LiveRegion - Announces content changes to screen readers
 * Used for: loading states, error messages, success notifications
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  id,
  className = '',
}: LiveRegionProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * AlertRegion - For important and time-sensitive messages
 * Interrupts the user immediately
 */
export function AlertRegion({
  children,
  id,
  className = '',
}: Omit<LiveRegionProps, 'politeness'>) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic={true}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * ErrorRegion - For error messages
 */
interface ErrorRegionProps {
  /** Current error message */
  message?: string;
  /** Region ID */
  id?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ErrorRegion({ message, id, className = '' }: ErrorRegionProps) {
  return (
    <AlertRegion id={id} className={className}>
      {message ? `Error: ${message}` : ''}
    </AlertRegion>
  );
}

/**
 * LoadingRegion - For loading states
 */
interface LoadingRegionProps {
  /** Whether content is loading */
  isLoading: boolean;
  /** Loading message */
  message?: string;
  /** Region ID */
  id?: string;
}

export function LoadingRegion({
  isLoading,
  message = 'Loading content, please wait',
  id,
}: LoadingRegionProps) {
  return (
    <LiveRegion id={id} politeness="polite">
      {isLoading ? message : ''}
    </LiveRegion>
  );
}

/**
 * SuccessRegion - For success notifications
 */
interface SuccessRegionProps {
  /** Success message */
  message?: string;
  /** Region ID */
  id?: string;
}

export function SuccessRegion({ message, id }: SuccessRegionProps) {
  return (
    <LiveRegion id={id} politeness="polite">
      {message ? `Success: ${message}` : ''}
    </LiveRegion>
  );
}

export default LiveRegion;
