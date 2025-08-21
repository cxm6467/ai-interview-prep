// Jest globals are available
import { speakText, stopSpeaking, pauseSpeaking, resumeSpeaking, isTTSSupported, getAvailableVoices, getBestVoice, isSpeaking, isPaused } from './textToSpeech';

// Mock SpeechSynthesis API
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockGetVoices = jest.fn<SpeechSynthesisVoice[], []>(() => []);

beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock the SpeechSynthesis API
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: mockSpeak,
      cancel: mockCancel,
      pause: mockPause,
      resume: mockResume,
      getVoices: mockGetVoices,
      pending: false,
      speaking: false,
      paused: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    writable: true,
  });

  // Mock SpeechSynthesisUtterance constructor
  global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
    text,
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    lang: 'en-US',
    onstart: null,
    onend: null,
    onerror: null,
    onpause: null,
    onresume: null,
    onmark: null,
    onboundary: null,
  }));
});

describe('textToSpeech utilities', () => {
  it('should return isSupported as true when SpeechSynthesis is available', () => {
    expect(isTTSSupported()).toBe(true);
  });


  it('should speak text when speakText function is called', () => {
    speakText('Hello world');
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Hello world');
  });

  it('should cancel speech when stopSpeaking function is called', () => {
    stopSpeaking();
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('should pause speech when pauseSpeaking function is called', () => {
    pauseSpeaking();
    expect(mockPause).toHaveBeenCalledTimes(1);
  });

  it('should resume speech when resumeSpeaking function is called', () => {
    resumeSpeaking();
    expect(mockResume).toHaveBeenCalledTimes(1);
  });

  it('should return voices from getAvailableVoices', () => {
    const mockVoices = [
      { name: 'Voice 1', lang: 'en-US', voiceURI: 'voice1', localService: true, default: false },
      { name: 'Voice 2', lang: 'en-GB', voiceURI: 'voice2', localService: true, default: false },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);

    const voices = getAvailableVoices();
    expect(voices).toEqual(mockVoices);
  });

  it('should handle speech with custom options', () => {
    speakText('Test text', {
      voice: 'Test Voice',
      rate: 1.5,
      pitch: 1.2,
      volume: 0.8,
    });

    expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Test text');
  });

  it('should test getBestVoice with no voices available', () => {
    mockGetVoices.mockReturnValue([]);
    
    const result = getBestVoice();
    
    expect(result).toBeNull();
  });

  it('should test getBestVoice with language filtering', () => {
    const mockVoices = [
      { name: 'English Voice', lang: 'en-US', localService: true, default: true, voiceURI: 'en-voice' },
      { name: 'Spanish Voice', lang: 'es-ES', localService: true, default: false, voiceURI: 'es-voice' },
      { name: 'French Voice', lang: 'fr-FR', localService: true, default: false, voiceURI: 'fr-voice' },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);
    
    // Test language preference
    const result = getBestVoice({ lang: 'es' });
    expect(result?.name).toBe('Spanish Voice');
  });

  it('should test getBestVoice with no matching language falling back to all voices', () => {
    const mockVoices = [
      { name: 'English Voice', lang: 'en-US', localService: true, default: true, voiceURI: 'en-voice' },
      { name: 'Spanish Voice', lang: 'es-ES', localService: true, default: false, voiceURI: 'es-voice' },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);
    
    // Test with non-matching language
    const result = getBestVoice({ lang: 'zh' });
    expect(result?.name).toBe('English Voice'); // Falls back to first voice
  });

  it('should test getBestVoice with high quality preference', () => {
    const mockVoices = [
      { name: 'Basic Voice', lang: 'en-US', localService: true, default: true, voiceURI: 'basic-voice' },
      { name: 'Enhanced Voice', lang: 'en-US', localService: false, default: false, voiceURI: 'enhanced-voice' },
      { name: 'Neural Voice', lang: 'en-US', localService: false, default: false, voiceURI: 'neural-voice' },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);
    
    const result = getBestVoice({ preferHighQuality: true });
    expect(result?.name).toBe('Enhanced Voice');
  });

  it('should test getBestVoice with female preference', () => {
    const mockVoices = [
      { name: 'Male Voice', lang: 'en-US', localService: true, default: true, voiceURI: 'male-voice' },
      { name: 'Samantha Voice', lang: 'en-US', localService: true, default: false, voiceURI: 'samantha-voice' },
      { name: 'Victoria Voice', lang: 'en-US', localService: true, default: false, voiceURI: 'victoria-voice' },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);
    
    const result = getBestVoice({ preferFemale: true });
    expect(result?.name).toBe('Samantha Voice');
  });

  it('should test getBestVoice with male preference', () => {
    const mockVoices = [
      { name: 'Default Voice', lang: 'en-US', localService: true, default: true, voiceURI: 'default-voice' },
      { name: 'Alex Voice', lang: 'en-US', localService: true, default: false, voiceURI: 'alex-voice' },
      { name: 'David Voice', lang: 'en-US', localService: true, default: false, voiceURI: 'david-voice' },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);
    
    const result = getBestVoice({ preferMale: true });
    expect(result?.name).toBe('Alex Voice');
  });

  it('should test getBestVoice with specific voice name', () => {
    const mockVoices = [
      { name: 'Default Voice', lang: 'en-US', localService: true, default: true, voiceURI: 'default-voice' },
      { name: 'Special Test Voice', lang: 'en-US', localService: true, default: false, voiceURI: 'test-voice' },
    ];
    mockGetVoices.mockReturnValue(mockVoices as SpeechSynthesisVoice[]);
    
    const result = getBestVoice({ voice: 'test' });
    expect(result?.name).toBe('Special Test Voice');
  });

  it('should test isSpeaking function', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        ...window.speechSynthesis,
        speaking: true,
      },
      writable: true,
    });

    expect(isSpeaking()).toBe(true);
  });

  it('should test isPaused function', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        ...window.speechSynthesis,
        pending: true,
      },
      writable: true,
    });

    expect(isPaused()).toBe(true);
  });


});