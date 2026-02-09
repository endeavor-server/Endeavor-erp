/**
 * Keyboard Shortcuts Documentation
 * Provides help for keyboard navigation
 * WCAG 2.1.1 Keyboard
 */

import { useState, useEffect, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  /** Key(s) to press */
  keys: string[];
  /** Action description */
  description: string;
  /** Context where shortcut works */
  scope?: 'global' | 'form' | 'table' | 'modal';
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['?'], description: 'Show/hide keyboard shortcuts', scope: 'global' },
  { keys: ['Tab'], description: 'Move to next focusable element', scope: 'global' },
  { keys: ['Shift', 'Tab'], description: 'Move to previous focusable element', scope: 'global' },
  { keys: ['Enter'], description: 'Activate focused element', scope: 'global' },
  { keys: ['Space'], description: 'Toggle checkbox/button', scope: 'global' },
  { keys: ['Escape'], description: 'Close modal/dialog', scope: 'modal' },
  { keys: ['Ctrl', 'K'], description: 'Open global search', scope: 'global' },
  { keys: ['Home'], description: 'Go to first item in list', scope: 'table' },
  { keys: ['End'], description: 'Go to last item in list', scope: 'table' },
  { keys: ['↑', '↓'], description: 'Navigate up/down in list', scope: 'table' },
];

interface KeyboardShortcutsProps {
  /** Additional custom shortcuts */
  customShortcuts?: Shortcut[];
  /** Hotkey to open shortcuts (default: '?') */
  hotkey?: string;
}

/**
 * KeyboardShortcuts - Help dialog for keyboard navigation
 */
export function KeyboardShortcuts({
  customShortcuts = [],
  hotkey = '?',
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allShortcuts = [...SHORTCUTS, ...customShortcuts];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === hotkey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [hotkey, isOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const shortcutsByScope = allShortcuts.reduce((acc, shortcut) => {
    const scope = shortcut.scope || 'global';
    if (!acc[scope]) acc[scope] = [];
    acc[scope].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const scopeLabels: Record<string, string> = {
    global: 'Global Shortcuts',
    form: 'Form Navigation',
    table: 'Table/List Navigation',
    modal: 'Modal/Dialog',
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-[var(--surface)] border border-[var(--border)] 
                   rounded-full shadow-lg hover:bg-[var(--surface-hover)] 
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                   z-40"
        aria-label="Show keyboard shortcuts (press ?)"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 text-[var(--text-secondary)]" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-[var(--text-primary)]">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] 
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" aria-hidden="true" />
          </button>
        </header>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {Object.entries(shortcutsByScope).map(([scope, shortcuts]) => (
            <section key={scope} className="mb-6">
              <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                {scopeLabels[scope] || scope}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-[var(--bg)] rounded-lg"
                  >
                    <span className="text-sm text-[var(--text-secondary)]">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1 ml-4">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-mono bg-[var(--surface-hover)] 
                                         border border-[var(--border)] rounded 
                                         text-[var(--text-primary)]">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-[var(--text-muted)]">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="p-4 border-t border-[var(--border)] bg-[var(--bg)]">
          <p className="text-sm text-[var(--text-muted)]">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--surface-hover)] 
                                border border-[var(--border)] rounded">
              Escape
            </kbd> to close
          </p>
        </footer>
      </div>
    </div>
  );
}

export default KeyboardShortcuts;
