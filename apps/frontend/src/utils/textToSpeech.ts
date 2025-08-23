/**
 * Text-to-Speech Utility Functions
 * 
 * Provides simple, lightweight text-to-speech functionality using the Web Speech API.
 * Handles browser compatibility and provides sensible defaults for voice settings.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  preferHighQuality?: boolean;
  preferFemale?: boolean;
  preferMale?: boolean;
  lang?: string;
}

/**
 * Check if the browser supports text-to-speech
 */
export const isTTSSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Get the best available voice based on preferences
 * @param options - Voice selection preferences
 * @returns The best matching voice or null
 */
export const getBestVoice = (options: SpeechOptions = {}): SpeechSynthesisVoice | null => {
  if (!isTTSSupported()) {
    return null;
  }

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    return null;
  }

  // Filter by language preference (default to English)
  const lang = options.lang || 'en';
  let filteredVoices = voices.filter(voice => voice.lang.startsWith(lang));
  
  // If no voices for preferred language, use all voices
  if (filteredVoices.length === 0) {
    filteredVoices = voices;
  }

  // Prefer high quality voices (neural/premium voices often have 'enhanced', 'neural', or 'premium' in name)
  if (options.preferHighQuality) {
    const highQualityVoices = filteredVoices.filter(voice => 
      voice.name.toLowerCase().includes('enhanced') ||
      voice.name.toLowerCase().includes('neural') ||
      voice.name.toLowerCase().includes('premium') ||
      voice.name.toLowerCase().includes('natural') ||
      voice.localService === false // Online voices are often higher quality
    );
    if (highQualityVoices.length > 0) {
      filteredVoices = highQualityVoices;
    }
  }

  // Gender preference
  if (options.preferFemale) {
    const femaleVoices = filteredVoices.filter(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('susan') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('alice')
    );
    if (femaleVoices.length > 0) {
      filteredVoices = femaleVoices;
    }
  } else if (options.preferMale) {
    const maleVoices = filteredVoices.filter(voice => 
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('man') ||
      voice.name.toLowerCase().includes('alex') ||
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('mark') ||
      voice.name.toLowerCase().includes('daniel')
    );
    if (maleVoices.length > 0) {
      filteredVoices = maleVoices;
    }
  }

  // Specific voice name preference
  if (options.voice) {
    const namedVoice = filteredVoices.find(voice => 
      voice.name.toLowerCase().includes(options.voice!.toLowerCase())
    );
    if (namedVoice) {
      return namedVoice;
    }
  }

  // Return the first available voice from filtered results
  return filteredVoices[0] || voices[0];
};

/**
 * Get available voices with metadata
 * @returns Array of voice information
 */
export const getAvailableVoices = () => {
  if (!isTTSSupported()) {
    return [];
  }

  return speechSynthesis.getVoices().map(voice => ({
    name: voice.name,
    lang: voice.lang,
    localService: voice.localService,
    default: voice.default,
    voiceURI: voice.voiceURI
  }));
};

/**
 * Speak the provided text using the Web Speech API with enhanced voice selection
 * @param text - The text to speak
 * @param options - Voice configuration options
 */
export const speakText = (text: string, options: SpeechOptions = {}): void => {
  if (!isTTSSupported()) {
    return;
  }

  // Clean up any existing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice options with sensible defaults for accessibility
  utterance.rate = options.rate || 0.85; // Slower rate for better comprehension
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 0.9; // Higher volume for accessibility
  
  // Use enhanced voice selection
  const defaultOptions: SpeechOptions = {
    preferHighQuality: true,
    lang: 'en-US',
    ...options
  };
  
  const bestVoice = getBestVoice(defaultOptions);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }
  
  speechSynthesis.speak(utterance);
};

/**
 * Stop any current speech
 */
export const stopSpeaking = (): void => {
  if (isTTSSupported()) {
    speechSynthesis.cancel();
  }
};

/**
 * Pause current speech
 */
export const pauseSpeaking = (): void => {
  if (isTTSSupported()) {
    speechSynthesis.pause();
  }
};

/**
 * Resume paused speech
 */
export const resumeSpeaking = (): void => {
  if (isTTSSupported()) {
    speechSynthesis.resume();
  }
};

/**
 * Check if speech is currently active
 */
export const isSpeaking = (): boolean => {
  if (!isTTSSupported()) {
    return false;
  }
  return speechSynthesis.speaking;
};

/**
 * Check if speech is currently paused
 */
export const isPaused = (): boolean => {
  if (!isTTSSupported()) {
    return false;
  }
  return speechSynthesis.pending;
};