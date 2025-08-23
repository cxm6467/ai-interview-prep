import React, { useEffect, useState } from 'react';
import { Button } from '@atoms/Button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { getAvailableVoices } from '@/utils/textToSpeech';

interface SpeechButtonProps {
  /** The text content to read aloud */
  text: string;
  /** Optional CSS class name */
  className?: string;
  /** Button size variant */
  size?: 'small' | 'medium' | 'large';
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Whether to show text label alongside icon */
  showLabel?: boolean;
  /** Voice preference for higher quality speech */
  preferHighQuality?: boolean;
  /** Language code for speech (default: en-US) */
  lang?: string;
  /** Voice gender preference */
  voiceGender?: 'male' | 'female';
  /** Custom speech rate (0.1 to 10, default: 0.85) */
  speechRate?: number;
}

/**
 * SpeechButton Component
 * 
 * A reusable button component that provides text-to-speech functionality
 * with enhanced voice options and accessibility features.
 * 
 * @component
 * @param {SpeechButtonProps} props - Component props
 * @returns {JSX.Element} Rendered SpeechButton component
 */
export const SpeechButton: React.FC<SpeechButtonProps> = ({
  text,
  className = '',
  size = 'small',
  variant = 'ghost',
  showLabel = true,
  preferHighQuality = true,
  lang = 'en-US',
  voiceGender,
  speechRate = 0.85
}) => {
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();
  const [hasVoices, setHasVoices] = useState(false);

  // Check for available voices (needed for some browsers)
  useEffect(() => {
    const checkVoices = () => {
      const voices = getAvailableVoices();
      setHasVoices(voices.length > 0);
    };

    checkVoices();
    
    // Some browsers load voices asynchronously
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = checkVoices;
    }

    return () => {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Don't render if TTS is not supported or no text provided
  if (!isSupported || !text.trim()) {
    return null;
  }

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      // Use enhanced speech options
      const speechOptions = {
        preferHighQuality,
        lang,
        preferFemale: voiceGender === 'female',
        preferMale: voiceGender === 'male',
        rate: speechRate
      };
      
      speak(text, speechOptions);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Enter and Space keys for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const icon = isSpeaking ? '⏸️' : '🔊';
  const label = isSpeaking ? 'Pause' : 'Listen';
  const ariaLabel = isSpeaking 
    ? `Pause reading: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"` 
    : `Read aloud: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${className} speech-button`}
      icon={icon}
      aria-label={ariaLabel}
      disabled={!hasVoices}
      title={hasVoices ? ariaLabel : 'Text-to-speech not available'}
      role="button"
      tabIndex={0}
    >
      {showLabel ? label : ''}
    </Button>
  );
};