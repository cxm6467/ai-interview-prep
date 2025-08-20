import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for auto-scrolling to bottom (useful for chat interfaces)
 * 
 * This hook automatically scrolls to the bottom of a container when
 * new content is added, ensuring new messages are always visible.
 * 
 * @param dependency - Value to watch for changes that trigger auto-scroll
 * @param enabled - Whether auto-scroll is enabled (default: true)
 * @returns Ref to attach to the scrollable container
 */
export const useAutoScrollToBottom = <T extends HTMLElement>(
  dependency: unknown,
  enabled: boolean = true
) => {
  const containerRef = useRef<T>(null);
  
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }
    
    const container = containerRef.current;
    
    // Always scroll to bottom on new messages
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });
  }, [dependency, enabled]);
  
  return containerRef;
};

/**
 * Custom hook to maintain scroll position during re-renders
 * 
 * This hook helps prevent unwanted scroll jumping by preserving
 * the current scroll position and restoring it after state changes
 * that might cause layout shifts.
 * 
 * @returns Object with scroll position management functions
 */
export const useScrollFix = () => {
  const savedScrollPosition = useRef<number>(0);
  
  /**
   * Saves the current scroll position
   */
  const saveScrollPosition = useCallback(() => {
    savedScrollPosition.current = window.scrollY;
  }, []);
  
  /**
   * Restores the previously saved scroll position
   * Uses requestAnimationFrame to ensure DOM updates are complete
   */
  const restoreScrollPosition = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollPosition.current);
    });
  }, []);
  
  /**
   * Handles state changes that might cause scroll jumping
   * Call this before making state changes that could affect layout
   * 
   * @param callback - Function to execute between save and restore
   */
  const withScrollPreservation = useCallback((callback: () => void) => {
    saveScrollPosition();
    callback();
    // Use a timeout to ensure the callback's effects have been rendered
    setTimeout(() => {
      restoreScrollPosition();
    }, 0);
  }, [saveScrollPosition, restoreScrollPosition]);
  
  return {
    saveScrollPosition,
    restoreScrollPosition,
    withScrollPreservation
  };
};