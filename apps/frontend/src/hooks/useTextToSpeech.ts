import { useState, useCallback, useEffect } from 'react';
import { stopSpeaking, pauseSpeaking, resumeSpeaking, isTTSSupported, speakText, SpeechOptions } from '@/utils/textToSpeech';

/**
 * React hook for text-to-speech functionality
 * 
 * Provides state management and control functions for text-to-speech,
 * with proper cleanup and browser compatibility handling.
 */
export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported] = useState(isTTSSupported());

  // Update speaking state based on speechSynthesis events
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const updateSpeakingState = () => {
      setIsSpeaking(speechSynthesis.speaking);
      setIsPaused(speechSynthesis.pending);
    };

    // Check state periodically since speechSynthesis events are unreliable
    const interval = setInterval(updateSpeakingState, 100);

    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isSupported]);

  const speak = useCallback((text: string, options?: SpeechOptions) => {
    if (!isSupported || !text.trim()) {
      return;
    }

    // Use the enhanced speakText utility
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    // Use enhanced voice configuration with defaults optimized for accessibility
    speakText(text, {
      rate: 0.85, // Slower for better comprehension
      pitch: 1,
      volume: 0.9, // Higher volume for accessibility
      preferHighQuality: true,
      lang: 'en-US',
      ...options
    });
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) {
      return;
    }
    pauseSpeaking();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) {
      return;
    }
    resumeSpeaking();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) {
      return;
    }
    stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported
  };
};