/**
 * useKeyboardShortcuts Hook
 * Register and manage keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts, options = {}) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    for (const shortcut of shortcuts) {
      const { 
        key, 
        ctrl = false, 
        shift = false, 
        alt = false,
        handler,
        description 
      } = shortcut;

      // Check if all modifiers match
      const modifiersMatch = 
        (ctrl ? modKey : !event.metaKey && !event.ctrlKey) &&
        (shift ? event.shiftKey : !event.shiftKey) &&
        (alt ? event.altKey : !event.altKey);

      // Check if key matches
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      if (modifiersMatch && keyMatches) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
        return;
      }
    }
  }, [shortcuts, enabled, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Global keyboard shortcuts provider
 */
export function useGlobalShortcuts() {
  const shortcuts = [
    {
      key: 'k',
      ctrl: true,
      description: 'Search',
      handler: () => {
        // Trigger search modal
        const searchButton = document.querySelector('[data-search-trigger]');
        if (searchButton) searchButton.click();
      }
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save',
      handler: () => {
        // Trigger save action
        const saveButton = document.querySelector('[data-save-trigger]');
        if (saveButton) saveButton.click();
      }
    },
    {
      key: 'Escape',
      description: 'Close modal',
      handler: () => {
        // Close any open modal
        const closeButton = document.querySelector('[data-modal-close]');
        if (closeButton) closeButton.click();
      }
    },
    {
      key: '/',
      description: 'Focus search',
      handler: () => {
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) searchInput.focus();
      }
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

export default useKeyboardShortcuts;