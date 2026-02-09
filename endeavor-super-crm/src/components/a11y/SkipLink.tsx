/**
 * Skip Link Component
 * Allows keyboard users to skip repetitive navigation
 * WCAG 2.4.1 Bypass Blocks
 */

import type { ReactNode } from 'react';

interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId: string;
  /** Link text */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkipLink - "Skip to main content" link
 * Hidden until focused, essential for keyboard navigation
 */
export function SkipLink({
  targetId,
  children = 'Skip to main content',
  className = '',
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const target = document.getElementById(targetId);
    if (target) {
      // Make target focusable
      const originalTabIndex = target.getAttribute('tabindex');
      if (!originalTabIndex) {
        target.setAttribute('tabindex', '-1');
      }

      // Focus and scroll
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Optional: Restore original tabindex after a delay
      setTimeout(() => {
        if (!originalTabIndex) {
          target.removeAttribute('tabindex');
        }
      }, 1000);
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        skip-link
        absolute -top-full left-0 z-[9999]
        bg-[var(--primary)] text-white
        px-4 py-3 text-sm font-medium
        rounded-br-lg
        transition-transform duration-200 ease-out
        focus:top-0 focus:left-0
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--primary)]
        ${className}
      `}
      style={{
        transform: 'translateY(-100%)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.transform = 'translateY(-100%)';
      }}
    >
      {children}
    </a>
  );
}

interface SkipLinksProps {
  /** Navigation configuration */
  links?: Array<{
    targetId: string;
    label: string;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkipLinks - Multiple skip navigation options
 * Common targets: main content, navigation, search
 */
export function SkipLinks({
  links = [
    { targetId: 'main-content', label: 'Skip to main content' },
    { targetId: 'main-navigation', label: 'Skip to navigation' },
    { targetId: 'global-search', label: 'Skip to search' },
  ],
  className = '',
}: SkipLinksProps) {
  return (
    <nav
      className={`skip-links ${className}`}
      aria-label="Skip navigation"
    >
      {links.map((link) => (
        <SkipLink key={link.targetId} targetId={link.targetId}>
          {link.label}
        </SkipLink>
      ))}
    </nav>
  );
}

export default SkipLink;
