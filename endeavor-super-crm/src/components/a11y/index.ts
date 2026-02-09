/**
 * Accessibility Components Export
 * WCAG 2.1 AA Compliant UI Components
 */

// Screen reader utilities
export { 
  ScreenReaderOnly, 
  VisuallyHidden, 
  ScreenReaderText,
  HiddenUntilFocus 
} from './ScreenReaderOnly';

// Navigation
export { 
  SkipLink, 
  SkipLinks 
} from './SkipLink';

// Live regions
export { 
  LiveRegion, 
  AlertRegion, 
  ErrorRegion, 
  LoadingRegion, 
  SuccessRegion 
} from './LiveRegion';

// Icons
export { 
  AccessibleIcon, 
  IconButton, 
  LinkIcon, 
  StatusIcon 
} from './AccessibleIcon';

// Focus management
export { 
  FocusTrap, 
  ModalFocusTrap, 
  DropdownFocusTrap 
} from './FocusTrap';

// Announcer
export { 
  Announcer, 
  useAnnouncer 
} from './Announcer';

// Keyboard shortcuts
export { 
  KeyboardShortcuts 
} from './KeyboardShortcuts';

// Default export
export { default } from './ScreenReaderOnly';
