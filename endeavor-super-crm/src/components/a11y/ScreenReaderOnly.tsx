/**
 * Screen Reader Only Component
 * Visually hidden but accessible to assistive technologies
 */

import type { ReactNode, CSSProperties, ElementType } from 'react';

type HTMLIntrinsicElements = 'span' | 'div' | 'p' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: HTMLIntrinsicElements;
  id?: string;
}

/**
 * ScreenReaderOnly - Content only visible to screen readers
 * Uses clip technique for maximum compatibility
 */
export function ScreenReaderOnly({
  children,
  as: Component = 'span',
  id,
}: ScreenReaderOnlyProps) {
  const styles: CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  };

  return (
    <Component id={id} style={styles}>
      {children}
    </Component>
  );
}

/**
 * VisuallyHidden - Alias for ScreenReaderOnly
 */
export const VisuallyHidden = ScreenReaderOnly;

/**
 * ScreenReaderText - Text supplement with visible indication
 * For when you want to provide more context to screen readers
 */
interface ScreenReaderTextProps {
  visible: ReactNode;
  hidden: ReactNode;
}

export function ScreenReaderText({ visible, hidden }: ScreenReaderTextProps) {
  return (
    <>
      {visible}
      <ScreenReaderOnly>{hidden}</ScreenReaderOnly>
    </>
  );
}

/**
 * HiddenUntilFocus - Shows content when it receives focus
 * Good for skip links and focusable hidden elements
 */
interface HiddenUntilFocusProps {
  children: ReactNode;
  className?: string;
}

export function HiddenUntilFocus({ children, className = '' }: HiddenUntilFocusProps) {
  return (
    <div
      className={`absolute -top-full left-1/2 -translate-x-1/2 -translate-y-full 
                  focus-within:top-4 focus-within:translate-y-0 
                  bg-[var(--surface)] border border-[var(--border)] 
                  rounded-lg shadow-lg p-4 z-[9999] transition-all ${className}`}
      style={{
        clipPath: 'inset(100% 0 0 0)',
      }}
    >
      {children}
    </div>
  );
}

export default ScreenReaderOnly;
