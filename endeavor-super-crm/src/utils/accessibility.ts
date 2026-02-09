/**
 * Accessibility Utilities
 * WCAG 2.1 AA Compliant Helpers
 */

// ============================================================================
// ARIA & Role Helpers
// ============================================================================

export const aria = {
  /** Generate unique IDs for form elements */
  id: (prefix: string, suffix?: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return suffix ? `${prefix}-${suffix}-${random}` : `${prefix}-${timestamp}-${random}`;
  },

  /** Connect label and input with aria-labelledby */
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),

  /** Connect input with its description */
  describedBy: (id: string) => ({ 'aria-describedby': id }),

  /** Mark element as invalid with error message */
  invalid: (errorId?: string) => ({
    'aria-invalid': true as const,
    'aria-errormessage': errorId,
  }),

  /** Set expanded state for collapsible sections */
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),

  /** Set selected state */
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),

  /** Set pressed state for toggle buttons */
  pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),

  /** Set hidden state for screen reader only content */
  hidden: () => ({ 'aria-hidden': true as const }),

  /** Live region for dynamic content announcements */
  live: (politeness: 'polite' | 'assertive' = 'polite') => ({
    'aria-live': politeness,
    'aria-atomic': 'true' as const,
  }),

  /** Set current page/location */
  current: (type: 'page' | 'step' | 'location' | 'date' | 'time' | true = 'page') => ({
    'aria-current': type,
  }),
} as const;

// ============================================================================
// Keyboard Navigation
// ============================================================================

export const keyboard = {
  /** Key codes for common keys */
  keys: {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
  } as const,

  /** Check if key is an arrow key */
  isArrowKey: (key: string) =>
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key),

  /** Focus trap utilities */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(selectors));
  },

  /** Check if element is focusable */
  isFocusable: (element: HTMLElement): boolean => {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return selectors.some(selector => element.matches(selector));
  },
};

// ============================================================================
// Focus Management
// ============================================================================

export const focus = {
  /** Save current focus and restore later */
  trap: (container: HTMLElement, onEscape?: () => void) => {
    const previousFocus = document.activeElement as HTMLElement;
    const focusableElements = keyboard.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyboard.keys.TAB) {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }

      if (e.key === keyboard.keys.ESCAPE && onEscape) {
        onEscape();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return {
      release: () => {
        container.removeEventListener('keydown', handleKeyDown);
        previousFocus?.focus();
      },
    };
  },

  /** Move focus to element by selector or ref */
  move: (target: string | HTMLElement) => {
    const element = typeof target === 'string'
      ? document.querySelector(target) as HTMLElement
      : target;
    element?.focus();
  },
};

// ============================================================================
// Color Contrast (WCAG ratios)
// ============================================================================

export const contrast = {
  /** Calculate luminance of a color */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /** Calculate contrast ratio between two colors */
  getRatio: (color1: string, color2: string): number => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const rgb1 = [
      parseInt(hex1.substring(0, 2), 16),
      parseInt(hex1.substring(2, 4), 16),
      parseInt(hex1.substring(4, 6), 16),
    ];

    const rgb2 = [
      parseInt(hex2.substring(0, 2), 16),
      parseInt(hex2.substring(2, 4), 16),
      parseInt(hex2.substring(4, 6), 16),
    ];

    const lum1 = contrast.getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = contrast.getLuminance(rgb2[0], rgb2[1], rgb2[2]);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  /** Check if contrast meets WCAG AA standards */
  meetsAA: (ratio: number, isLargeText = false): boolean => {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },

  /** Check if contrast meets WCAG AAA standards */
  meetsAAA: (ratio: number, isLargeText = false): boolean => {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  },
};

// ============================================================================
// Announcements for Screen Readers
// ============================================================================

export const announce = {
  /** Create or update announcer element */
  createAnnouncer: () => {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    return announcer;
  },

  /** Send announcement to screen readers */
  message: (text: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const announcer = announce.createAnnouncer();
    announcer.setAttribute('aria-live', politeness);

    // Clear first to ensure re-announcement
    announcer.textContent = '';

    // Use requestAnimationFrame for better screen reader support
    requestAnimationFrame(() => {
      announcer.textContent = text;
    });

    // Auto-clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  },

  /** Announce form errors */
  error: (message: string) => announce.message(`Error: ${message}`, 'assertive'),

  /** Announce success messages */
  success: (message: string) => announce.message(`Success: ${message}`, 'polite'),

  /** Announce loading states */
  loading: (message = 'Loading...') => announce.message(message, 'polite'),
};

// ============================================================================
// Skip Links & Navigation
// ============================================================================

export const skipLinks = {
  /** Generate skip link targets */
  targets: {
    main: 'main-content',
    navigation: 'main-navigation',
    search: 'global-search',
    footer: 'main-footer',
  } as const,

  /** Focus main content */
  toMain: () => {
    const main = document.getElementById(skipLinks.targets.main);
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  },
};

// ============================================================================
// Reduced Motion Support
// ============================================================================

export const motion = {
  /** Check if user prefers reduced motion */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /** Get animation duration based on preference */
  getDuration: (defaultDuration: number): number => {
    return motion.prefersReducedMotion() ? 0 : defaultDuration;
  },

  /** Disable animations class */
  noAnimationClass: 'motion-reduce',
};

// ============================================================================
// Form Accessibility
// ============================================================================

export const formA11y = {
  /** Generate IDs for form field association */
  fieldIds: (name: string) => ({
    input: `${name}-input`,
    label: `${name}-label`,
    error: `${name}-error`,
    help: `${name}-help`,
  }),

  /** Build aria attributes for form input */
  inputProps: ({
    id,
    hasError,
    errorId,
    helpId,
    isRequired,
  }: {
    id: string;
    hasError?: boolean;
    errorId?: string;
    helpId?: string;
    isRequired?: boolean;
  }) => {
    const describedBy = [helpId, hasError ? errorId : null].filter(Boolean).join(' ') || undefined;

    return {
      id,
      'aria-invalid': hasError || false,
      'aria-required': isRequired || false,
      'aria-describedby': describedBy,
      'aria-errormessage': hasError ? errorId : undefined,
    };
  },
};

// ============================================================================
// Error Messages
// ============================================================================

export const a11yErrors = {
  messages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Must be no more than ${max} characters`,
    pattern: 'Please match the requested format',
    number: 'Please enter a valid number',
    date: 'Please enter a valid date',
    password: 'Password must meet security requirements',
    match: 'Passwords do not match',
  },
};

// ============================================================================
// Role Attributes
// ============================================================================

export const roles = {
  /** Alert for critical messages */
  alert: { role: 'alert' as const },

  /** Status for non-critical updates */
  status: { role: 'status' as const },

  /** Dialog for modal dialogs */
  dialog: { role: 'dialog' as const },

  /** Menu for navigation menus */
  menu: { role: 'menu' as const },
  menuitem: { role: 'menuitem' as const },

  /** Tab panels */
  tab: { role: 'tab' as const },
  tabpanel: { role: 'tabpanel' as const },
  tablist: { role: 'tablist' as const },

  /** Toolbar */
  toolbar: { role: 'toolbar' as const },

  /** Tree view */
  tree: { role: 'tree' as const },
  treeitem: { role: 'treeitem' as const },

  /** Search */
  search: { role: 'search' as const },

  /** Combobox for autocomplete inputs */
  combobox: { role: 'combobox' as const },
  listbox: { role: 'listbox' as const },
  option: { role: 'option' as const },
} as const;

export default {
  aria,
  keyboard,
  focus,
  contrast,
  announce,
  skipLinks,
  motion,
  formA11y,
  a11yErrors,
  roles,
};
