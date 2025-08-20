import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook for chat-like auto-scrolling with unseen message tracking
 * 
 * This hook manages auto-scrolling behavior and tracks unseen messages
 * when the user is not at the bottom of the chat container.
 * 
 * @param messages - Array of messages to monitor
 * @param enabled - Whether auto-scroll is enabled (default: true)
 * @param threshold - Distance from bottom to consider "near bottom" (default: 100px)
 * @returns Object with container ref, unseen count, and scroll function
 */
export const useAutoScrollToBottom = <T extends HTMLElement>(
  messages: unknown[],
  enabled: boolean = true,
  threshold: number = 100
) => {
  const containerRef = useRef<T>(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const lastSeenCountRef = useRef(0);
  
  // Check if user is near bottom of container
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) {
      return false;
    }
    
    const container = containerRef.current;
    const isNear = 
      container.scrollTop + container.clientHeight >= 
      container.scrollHeight - threshold;
    
    setIsNearBottom(isNear);
    
    if (isNear) {
      // User is at bottom, reset unseen count
      setUnseenCount(0);
      lastSeenCountRef.current = messages.length;
    }
    
    return isNear;
  }, [messages.length, threshold]);
  
  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!containerRef.current) {
      return;
    }
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior
    });
    
    // Reset unseen count when manually scrolling to bottom
    setUnseenCount(0);
    lastSeenCountRef.current = messages.length;
  }, [messages.length]);
  
  // Handle new messages
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }
    
    const currentNearBottom = checkScrollPosition();
    
    // If new messages were added
    if (messages.length > lastSeenCountRef.current) {
      if (currentNearBottom) {
        // User is near bottom, auto-scroll
        requestAnimationFrame(() => {
          scrollToBottom('smooth');
        });
      } else {
        // User is not near bottom, increment unseen count
        const newMessages = messages.length - lastSeenCountRef.current;
        setUnseenCount(prev => prev + newMessages);
      }
    }
  }, [messages, enabled, checkScrollPosition, scrollToBottom]);
  
  // Add scroll event listener to track user scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    
    const handleScroll = () => {
      checkScrollPosition();
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScrollPosition]);
  
  return {
    containerRef,
    unseenCount,
    isNearBottom,
    scrollToBottom
  };
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