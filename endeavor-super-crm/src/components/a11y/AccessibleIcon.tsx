/**
 * Accessible Icon Component
 * Ensures icons have proper labeling for screen readers
 * WCAG 1.1.1 Non-text Content
 */

import type { ReactNode, SVGProps } from 'react';
import { ScreenReaderOnly } from './ScreenReaderOnly';

interface AccessibleIconProps {
  /** The icon component or SVG */
  children: ReactNode;
  /** Accessible label for the icon */
  label: string;
  /** Whether to hide from screen readers (decorative only) */
  decorative?: boolean;
  /** Additional props for the wrapper */
  className?: string;
}

/**
 * AccessibleIcon - Wraps icons with proper accessibility
 * If decorative, hides from screen readers
 * If informative, adds proper label
 */
export function AccessibleIcon({
  children,
  label,
  decorative = false,
  className = '',
}: AccessibleIconProps) {
  if (decorative) {
    return (
      <span aria-hidden="true" className={className}>
        {children}
      </span>
    );
  }

  return (
    <span className={className} role="img" aria-label={label}>
      {children}
    </span>
  );
}

/**
 * IconButton - Button with accessible icon labeling
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon component */
  icon: ReactNode;
  /** Accessible label for the button */
  label: string;
  /** Optional visible text (overrides label) */
  children?: ReactNode;
  /** Button variant */
  variant?: 'ghost' | 'solid' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
  icon,
  label,
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]';

  const variantClasses = {
    ghost: 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    solid: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
    outline: 'border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-hover)]',
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className={iconSizeClasses[size]} aria-hidden="true">
        {icon}
      </span>
      {children && <span className="ml-2">{children}</span>}
    </button>
  );
}

/**
 * LinkIcon - Link with accessible icon
 */
interface LinkIconProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The icon component */
  icon: ReactNode;
  /** Accessible label for the link */
  label: string;
  /** Link text */
  children?: ReactNode;
  /** Whether to show only icon (hidden label) */
  iconOnly?: boolean;
}

export function LinkIcon({
  icon,
  label,
  children,
  iconOnly = false,
  className = '',
  ...props
}: LinkIconProps) {
  return (
    <a
      aria-label={iconOnly ? label : undefined}
      className={`inline-flex items-center rounded-lg transition-colors 
                  hover:bg-[var(--surface-hover)] focus:outline-none 
                  focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${className}`}
      {...props}
    >
      <span aria-hidden="true" className="w-5 h-5">
        {icon}
      </span>
      {iconOnly ? (
        <ScreenReaderOnly>{label}</ScreenReaderOnly>
      ) : (
        children
      )}
    </a>
  );
}

/**
 * StatusIcon - Icon with status indication
 */
interface StatusIconProps {
  /** Icon component */
  icon: ReactNode;
  /** Status type */
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /** Accessible label */
  label?: string;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIcon({
  icon,
  status,
  label,
  size = 'md',
}: StatusIconProps) {
  const statusClasses = {
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    error: 'text-[var(--error)]',
    info: 'text-[var(--info)]',
    neutral: 'text-[var(--text-secondary)]',
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <span
      className={`${statusClasses[status]} ${sizeClasses[size]}`}
      role="img"
      aria-label={label || `${status} status`}
    >
      {icon}
    </span>
  );
}

export default AccessibleIcon;
