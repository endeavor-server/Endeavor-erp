/**
 * Screen Reader Announcer Component
 * Programmatically announces content to assistive technologies
 * WCAG 4.1.3 Status Messages
 */

import { useEffect, useRef, useState } from 'react';

interface AnnouncerProps {
  /** Message to announce */
  message: string;
  /** Politeness level */
  politeness?: 'polite' | 'assertive';
  /** Maximum number of announcements to keep */
  maxAnnouncements?: number;
}

/**
 * useAnnouncer - Hook for making announcements
 */
export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    politeness: 'polite' | 'assertive';
    id: string;
  } | null>(null);

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({
      message,
      politeness,
      id: Math.random().toString(36).substring(2),
    });
  };

  const announceError = (message: string) => {
    announce(`Error: ${message}`, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite');
  };

  const announceLoading = (message: string = 'Loading...') => {
    announce(message, 'polite');
  };

  return {
    announcement,
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
}

/**
 * Announcer - Global announcer component
 * Place this in your app root
 */
export function Announcer() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; politeness: string }>>([]);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make announce function globally available
    window.announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
      const id = Math.random().toString(36).substring(2);
      setMessages(prev => [...prev, { id, text: message, politeness }]);
      
      // Remove message after announcement
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== id));
      }, 1000);
    };

    return () => {
      delete (window as any).announce;
    };
  }, []);

  const politeMessages = messages.filter(m => m.politeness === 'polite');
  const assertiveMessages = messages.filter(m => m.politeness === 'assertive');

  return (
    <>
      {/* Polite announcements */}
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {politeMessages.map(m => (
          <div key={m.id}>{m.text}</div>
        ))}
      </div>

      {/* Assertive announcements */}
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {assertiveMessages.map(m => (
          <div key={m.id}>{m.text}</div>
        ))}
      </div>
    </>
  );
}

// Add global type declaration
declare global {
  interface Window {
    announce?: (message: string, politeness?: 'polite' | 'assertive') => void;
  }
}

export default Announcer;
