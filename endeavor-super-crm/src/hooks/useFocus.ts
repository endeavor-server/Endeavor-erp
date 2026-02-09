/**
 * Focus Management Hooks
 * WCAG 2.1 AA Compliant Focus Handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { keyboard, focus as focusUtils } from '../utils/accessibility';

// ============================================================================
// Focus Trap Hook
// ============================================================================

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  returnFocusOnDeactivate?: boolean;
}

export function useFocusTrap({
  isActive,
  onEscape,
  returnFocusOnDeactivate = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const trapRef = useRef<{ release: () => void } | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Activate trap
      trapRef.current = focusUtils.trap(containerRef.current, onEscape);

      return () => {
        trapRef.current?.release();
        if (returnFocusOnDeactivate && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isActive, onEscape, returnFocusOnDeactivate]);

  return containerRef;
}

// ============================================================================
// Focus Within Hook
// ============================================================================

export function useFocusWithin(onFocusChange?: (isFocused: boolean) => void) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleFocusIn = () => {
      setIsFocused(true);
      onFocusChange?.(true);
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Check if focus is moving outside the container
      if (!element.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
        onFocusChange?.(false);
      }
    };

    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return () => {
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
    };
  }, [onFocusChange]);

  return { ref: containerRef, isFocused };
}

// ============================================================================
// Auto Focus Hook
// ============================================================================

interface UseAutoFocusOptions {
  delay?: number;
  condition?: boolean;
}

export function useAutoFocus<T extends HTMLElement>({
  delay = 0,
  condition = true,
}: UseAutoFocusOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (condition && ref.current) {
      const timer = setTimeout(() => {
        ref.current?.focus();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, condition]);

  return ref;
}

// ============================================================================
// Focus Ring Hook
// ============================================================================

export function useFocusRing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyboard.keys.TAB) {
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return {
    isVisible,
    focusRingClass: isVisible ? 'focus-ring' : '',
    style: isVisible
      ? { outline: '2px solid var(--primary)', outlineOffset: '2px' }
      : undefined,
  };
}

// ============================================================================
// List Navigation Hook (Roving Tabindex)
// ============================================================================

interface UseListNavigationOptions<T> {
  items: T[];
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  onSelect?: (item: T, index: number) => void;
}

export function useListNavigation<T>({
  items,
  orientation = 'vertical',
  loop = false,
  onSelect,
}: UseListNavigationOptions<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const moveFocus = useCallback(
    (direction: 'next' | 'prev') => {
      const itemCount = items.length;
      if (itemCount === 0) return;

      let newIndex: number;

      if (direction === 'next') {
        newIndex = activeIndex + 1;
        if (newIndex >= itemCount) {
          newIndex = loop ? 0 : itemCount - 1;
        }
      } else {
        newIndex = activeIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? itemCount - 1 : 0;
        }
      }

      setActiveIndex(newIndex);

      // Focus the element
      const container = containerRef.current;
      if (container) {
        const focusableElements = keyboard.getFocusableElements(container);
        focusableElements[newIndex]?.focus();
      }
    },
    [activeIndex, items.length, loop]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isHorizontal = orientation === 'horizontal';
      const isVertical = orientation === 'vertical';

      switch (e.key) {
        case isVertical ? keyboard.keys.ARROW_DOWN : keyboard.keys.ARROW_RIGHT:
          e.preventDefault();
          moveFocus('next');
          break;
        case isVertical ? keyboard.keys.ARROW_UP : keyboard.keys.ARROW_LEFT:
          e.preventDefault();
          moveFocus('prev');
          break;
        case keyboard.keys.HOME:
          e.preventDefault();
          setActiveIndex(0);
          break;
        case keyboard.keys.END:
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
        case keyboard.keys.ENTER:
          e.preventDefault();
          onSelect?.(items[activeIndex], activeIndex);
          break;
      }
    },
    [orientation, moveFocus, activeIndex, items, onSelect]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      onClick: () => {
        setActiveIndex(index);
        onSelect?.(items[index], index);
      },
    }),
    [activeIndex, items, onSelect]
  );

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps,
  };
}

// ============================================================================
// Skip Link Hook
// ============================================================================

export function useSkipLink(targetId: string) {
  const skipToContent = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      // Make focusable temporarily
      const originalTabIndex = target.getAttribute('tabindex');
      if (!originalTabIndex) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus();

      // Move past the target
      const focusableElements = keyboard.getFocusableElements(document.body);
      const targetIndex = focusableElements.indexOf(target as HTMLElement);
      const nextElement = focusableElements[targetIndex + 1];
      nextElement?.focus();
    }
  }, [targetId]);

  return skipToContent;
}

// ============================================================================
// Form Field Focus Hook
// ============================================================================

interface UseFormFieldFocusOptions {
  error?: string;
  touched?: boolean;
}

export function useFormFieldFocus({ error, touched }: UseFormFieldFocusOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [wasFocused, setWasFocused] = useState(false);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const scrollIntoView = useCallback(() => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Auto-focus on error
  useEffect(() => {
    if (error && touched && !wasFocused) {
      focus();
      scrollIntoView();
      setWasFocused(true);
    }
  }, [error, touched, focus, scrollIntoView, wasFocused]);

  return {
    ref: inputRef,
    focus,
    scrollIntoView,
  };
}

// ============================================================================
// Debounced Focus Hook
// ============================================================================

export function useDebouncedFocus(delay = 100) {
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onFocus = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return { isFocused, onFocus, onBlur };
}

// ============================================================================
// Export all hooks
// ============================================================================

export default {
  useFocusTrap,
  useFocusWithin,
  useAutoFocus,
  useFocusRing,
  useListNavigation,
  useSkipLink,
  useFormFieldFocus,
  useDebouncedFocus,
};
