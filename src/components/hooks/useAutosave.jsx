/**
 * useAutosave Hook
 * Automatically save form data to localStorage with debouncing
 */

import { useEffect, useRef, useCallback } from 'react';

export function useAutosave(key, data, options = {}) {
  const {
    delay = 2000,
    enabled = true,
    onSave,
    onRestore,
  } = options;

  const timeoutRef = useRef(null);
  const initialMount = useRef(true);

  // Restore on mount
  useEffect(() => {
    if (initialMount.current && enabled) {
      try {
        const saved = localStorage.getItem(`autosave-${key}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (onRestore) {
            onRestore(parsed);
          }
        }
      } catch (error) {
        console.error('Autosave restore failed:', error);
      }
      initialMount.current = false;
    }
  }, [key, enabled, onRestore]);

  // Save with debounce
  useEffect(() => {
    if (!enabled || initialMount.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`autosave-${key}`, JSON.stringify(data));
        if (onSave) {
          onSave(data);
        }
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay, enabled, onSave]);

  // Clear autosave
  const clearAutosave = useCallback(() => {
    try {
      localStorage.removeItem(`autosave-${key}`);
    } catch (error) {
      console.error('Clear autosave failed:', error);
    }
  }, [key]);

  return { clearAutosave };
}

export default useAutosave;