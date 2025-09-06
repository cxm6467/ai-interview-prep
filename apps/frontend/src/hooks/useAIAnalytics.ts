import { useCallback, useEffect, useState } from 'react';
import { 
  trackPageView, 
  trackAIToolUsage, 
  trackAPICall, 
  trackGenerationEvent,
  getAnalyticsStatus 
} from '../utils/analytics';

export const usePageTracking = (customPage?: string) => {
  useEffect(() => {
    // For single-page apps without routing, track page views
    const page = customPage || (window.location.pathname + window.location.search);
    const title = document.title;
    
    trackPageView(page, title);
  }, [customPage]);
};

// Hook to track step changes within the SPA
export const useStepTracking = (currentStep: string) => {
  useEffect(() => {
    if (currentStep) {
      trackPageView(`/step/${currentStep}`, `AI Interview Prep - ${currentStep}`);
    }
  }, [currentStep]);
};

export const useAIToolTracking = (toolName: string) => {
  const [isActive, setIsActive] = useState(false);
  
  const startSession = useCallback(() => {
    setIsActive(true);
    trackAIToolUsage(toolName, 'session_start');
  }, [toolName]);
  
  const endSession = useCallback(() => {
    setIsActive(false);
    trackAIToolUsage(toolName, 'session_end');
  }, [toolName]);
  
  const trackAction = useCallback((action: string, details?: string) => {
    trackAIToolUsage(toolName, action, details);
  }, [toolName]);
  
  const trackGeneration = useCallback(async (
    inputData: string, 
    generationFunction: () => Promise<string>
  ) => {
    const startTime = performance.now();
    const inputLength = inputData.length;
    
    try {
      trackAIToolUsage(toolName, 'generation_start');
      const result = await generationFunction();
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      trackGenerationEvent(toolName, inputLength, result.length, processingTime);
      trackAIToolUsage(toolName, 'generation_success');
      
      return result;
    } catch (error) {
      trackAIToolUsage(toolName, 'generation_error', error instanceof Error ? error.message : 'unknown');
      throw error;
    }
  }, [toolName]);
  
  useEffect(() => {
    return () => {
      if (isActive) {
        endSession();
      }
    };
  }, [isActive, endSession]);
  
  return {
    startSession,
    endSession,
    trackAction,
    trackGeneration,
    isActive,
  };
};

export const useAPITracking = () => {
  const trackAPI = async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackAPICall(endpoint, duration, true);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackAPICall(endpoint, duration, false);
      throw error;
    }
  };
  
  return { trackAPI };
};

export const useAnalyticsStatus = () => {
  return getAnalyticsStatus();
};