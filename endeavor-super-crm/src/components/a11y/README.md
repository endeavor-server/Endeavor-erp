# Accessibility Components

WCAG 2.1 AA compliant React components for Endeavor SUPER CRM.

## Components

### ScreenReaderOnly
Visually hidden content that remains accessible to assistive technologies.

```tsx
import { ScreenReaderOnly } from './a11y';

<ScreenReaderOnly>Screen reader only text</ScreenReaderOnly>
```

### SkipLink
"Skip to main content" link for keyboard navigation (WCAG 2.4.1).

```tsx
import { SkipLink, SkipLinks } from './a11y';

// Single skip link
<SkipLink targetId="main-content">Skip to main content</SkipLink>

// Multiple skip links
<SkipLinks links={[
  { targetId: 'main-content', label: 'Skip to main content' },
  { targetId: 'main-navigation', label: 'Skip to navigation' },
]} />
```

### LiveRegion
Announces dynamic content changes to screen readers (WCAG 4.1.3).

```tsx
import { LiveRegion, AlertRegion, ErrorRegion, LoadingRegion } from './a11y';

// Polite announcement
<LiveRegion politeness="polite">Content updated</LiveRegion>

// Error announcement (assertive)
<ErrorRegion message={errorMessage} />

// Loading state
<LoadingRegion isLoading={isLoading} message="Loading data" />
```

### AccessibleIcon
Ensures icons have proper labeling for screen readers (WCAG 1.1.1).

```tsx
import { AccessibleIcon, IconButton, StatusIcon } from './a11y';

// Decorative icon (hidden from AT)
<AccessibleIcon decorative>
  <SearchIcon />
</AccessibleIcon>

// Informative icon (labeled)
<AccessibleIcon label="Search">
  <SearchIcon />
</AccessibleIcon>

// Icon button
<IconButton icon={<SearchIcon />} label="Search" onClick={handleSearch} />

// Status icon
<StatusIcon icon={<CheckIcon />} status="success" label="Completed" />
```

### FocusTrap
Traps keyboard focus within a modal or dialog (WCAG 2.4.7, 2.1.2).

```tsx
import { FocusTrap, ModalFocusTrap } from './a11y';

// Basic focus trap
<FocusTrap isActive={isOpen} onEscape={closeModal}>
  <ModalContent />
</FocusTrap>

// Pre-configured modal trap
<ModalFocusTrap isOpen={isModalOpen} onClose={closeModal}>
  <ModalContent />
</ModalFocusTrap>
```

### Announcer
Global announcement system for screen readers.

```tsx
import { Announcer, useAnnouncer } from './a11y';

// In your app root
function App() {
  return (
    <>
      <Announcer />
      <YourApp />
    </>
  );
}

// In components
function MyComponent() {
  const { announce, announceSuccess, announceError } = useAnnouncer();
  
  const handleAction = async () => {
    announce('Processing...');
    try {
      await doSomething();
      announceSuccess('Action completed');
    } catch (err) {
      announceError('Action failed');
    }
  };
}
```

### KeyboardShortcuts
Help dialog for keyboard navigation (WCAG 2.1.1).

```tsx
import { KeyboardShortcuts } from './a11y';

function App() {
  return (
    <>
      <YourApp />
      <KeyboardShortcuts />
    </>
  );
}
```

Press `?` to show keyboard shortcuts help.

## Hooks

### useFocus Trap

```tsx
import { useFocusTrap } from '../../hooks/useFocus';

const containerRef = useFocusTrap({
  isActive: isModalOpen,
  onEscape: () => setIsModalOpen(false),
  returnFocusOnDeactivate: true,
});

return (
  <div ref={containerRef}>
    <ModalContent />
  </div>
);
```

### useAutoFocus

```tsx
import { useAutoFocus } from '../../hooks/useFocus';

const inputRef = useAutoFocus<HTMLInputElement>({
  delay: 100,
  condition: showForm,
});

return <input ref={inputRef} />;
```

### useListNavigation

```tsx
import { useListNavigation } from '../../hooks/useFocus';

const { 
  containerRef, 
  activeIndex, 
  handleKeyDown, 
  getItemProps 
} = useListNavigation({
  items,
  orientation: 'vertical',
  onSelect: (item, index) => console.log(item),
});

return (
  <ul ref={containerRef} onKeyDown={handleKeyDown}>
    {items.map((item, index) => (
      <li key={index} {...getItemProps(index)}>
        {item.name}
      </li>
    ))}
  </ul>
);
```

## Utilities

### announce

```tsx
import { announce } from '../../utils/accessibility';

announce.message('Loading complete');
announce.error('Failed to save');
announce.success('Saved successfully');
announce.loading('Processing...');
```

### aria helpers

```tsx
import { aria } from '../../utils/accessibility';

<input {...aria.describedBy('help-text-id')} />
<div {...aria.expanded(isOpen)} />
<div {...aria.live('polite')} />
```

### keyboard constants

```tsx
import { keyboard } from '../../utils/accessibility';

const handleKeyDown = (e) => {
  if (e.key === keyboard.keys.ESCAPE) {
    // Handle escape
  }
  if (e.key === keyboard.keys.ARROW_DOWN) {
    // Handle down arrow
  }
};
```

## WCAG 2.1 Checklist

- ✅ 1.1.1 Non-text Content - Icons labeled
- ✅ 1.3.1 Info and Relationships - Semantic HTML
- ✅ 1.4.3 Contrast - Proper color contrast
- ✅ 2.1.1 Keyboard - Full keyboard navigation
- ✅ 2.1.2 No Keyboard Trap - Focus trap releases
- ✅ 2.4.1 Bypass Blocks - Skip links
- ✅ 2.4.3 Focus Order - Logical tab order
- ✅ 2.4.4 Link Purpose - Descriptive links
- ✅ 2.4.6 Headings and Labels - Descriptive labels
- ✅ 2.4.7 Focus Visible - Clear focus indicators
- ✅ 3.3.1 Error Identification - Linked error messages
- ✅ 3.3.2 Labels or Instructions - All fields labeled
- ✅ 4.1.2 Name, Role, Value - Proper ARIA
- ✅ 4.1.3 Status Messages - Live regions

## Resources

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
