/**
 * Focus Trap Component
 * Traps focus within a modal or dialog for keyboard navigation
 * WCAG 2.4.7 Focus Visible, 2.1.2 No Keyboard Trap
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { keyboard } from '../../utils/accessibility';

interface FocusTrapProps {
  /** Child elements */
  children: ReactNode;
  /** Whether the trap is active */
  isActive: boolean;
  /** Callback when user presses Escape */
  onEscape?: () => void;
  /** Whether to return focus on deactivate */
  returnFocusOnDeactivate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Initial element to focus */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * FocusTrap - Traps keyboard focus within a container
 * Essential for modals, dialogs, and dropdowns
 */
export function FocusTrap({
  children,
  isActive,
  onEscape,
  returnFocusOnDeactivate = true,
  className = '',
  initialFocusRef,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else {
      const focusableElements = keyboard.getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      if (e.key === keyboard.keys.ESCAPE && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key === keyboard.keys.TAB) {
        const focusableElements = keyboard.getFocusableElements(containerRef.current);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab on first element -> wrap to last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // Tab on last element -> wrap to first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (returnFocusOnDeactivate && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, onEscape, returnFocusOnDeactivate, initialFocusRef]);

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={className} role="presentation">
      {children}
    </div>
  );
}

interface ModalFocusTrapProps extends Omit<FocusTrapProps, 'children'> {
  children: ReactNode;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
}

/**
 * ModalFocusTrap - Pre-configured focus trap for modals
 */
export function ModalFocusTrap({
  children,
  isOpen,
  onClose,
  className = '',
  initialFocusRef,
}: ModalFocusTrapProps) {
  return (
    <FocusTrap
      isActive={isOpen}
      onEscape={onClose}
      returnFocusOnDeactivate={true}
      initialFocusRef={initialFocusRef}
      className={className}
    >
      {children}
    </FocusTrap>
  );
}

/**
 * DropdownFocusTrap - Focus trap for dropdowns
 */
interface DropdownFocusTrapProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function DropdownFocusTrap({
  children,
  isOpen,
  onClose,
  className = '',
}: DropdownFocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyboard.keys.ESCAPE) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap isActive={isOpen} onEscape={onClose} returnFocusOnDeactivate={true}>
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </FocusTrap>
  );
}

export default FocusTrap;
