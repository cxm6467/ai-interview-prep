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
 * @param shouldCountMessage - Function to determine if a message should be counted as unseen
 * @returns Object with container ref, unseen count, and scroll function
 */
export const useAutoScrollToBottom = <T extends HTMLElement, M = unknown>(
  messages: M[],
  enabled: boolean = true,
  threshold: number = 100,
  shouldCountMessage?: (message: M) => boolean
) => {
  const containerRef = useRef<T>(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messageCountWhenScrolledAwayRef = useRef<number | null>(null);
  
  // Check if user is near bottom of container
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) {
      return false;
    }
    
    const container = containerRef.current;
    const isNear = 
      container.scrollTop + container.clientHeight >= 
      container.scrollHeight - threshold;
    
    const wasNearBottom = isNearBottom;
    setIsNearBottom(isNear);
    
    if (isNear && !wasNearBottom) {
      // User just scrolled back to bottom, reset everything
      setUnseenCount(0);
      messageCountWhenScrolledAwayRef.current = null;
    } else if (!isNear && wasNearBottom) {
      // User just scrolled away from bottom, start tracking from current message count
      messageCountWhenScrolledAwayRef.current = messages.length;
      setUnseenCount(0); // Reset count when they first scroll away
    }
    
    return isNear;
  }, [isNearBottom, messages.length, threshold]);
  
  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!containerRef.current) {
      return;
    }
    
    const container = containerRef.current;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // Ensure we have content to scroll to
    if (scrollHeight <= clientHeight) {
      return;
    }
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      container.scrollTo({
        top: scrollHeight,
        behavior
      });
      
      // Reset unseen count and tracking when manually scrolling to bottom
      setUnseenCount(0);
      messageCountWhenScrolledAwayRef.current = null;
      setIsNearBottom(true);
    });
  }, []);
  
  // Handle new messages
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }
    
    const currentNearBottom = checkScrollPosition();
    
    // If we have new messages
    if (messages.length > 0) {
      if (currentNearBottom) {
        // User is near bottom, auto-scroll
        requestAnimationFrame(() => {
          scrollToBottom('smooth');
        });
      } else if (messageCountWhenScrolledAwayRef.current !== null) {
        // User is not near bottom and we're tracking unseen messages
        const messagesSinceScrolledAway = messages.slice(messageCountWhenScrolledAwayRef.current);
        const unseenMessages = shouldCountMessage 
          ? messagesSinceScrolledAway.filter(shouldCountMessage).length
          : messagesSinceScrolledAway.length;
        setUnseenCount(Math.max(0, unseenMessages));
      }
    }
  }, [messages.length, messages, enabled, checkScrollPosition, scrollToBottom, shouldCountMessage]);
  
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