/**
 * Application constants and configuration values
 */

export const APP_CONFIG = {
  name: 'AI Interview Prep',
  version: '1.0.0',
  defaultTheme: 'dark' as const,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
  apiTimeout: 30000, // 30 seconds
} as const;

export const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral', 
  SITUATIONAL: 'situational',
} as const;

export const QUESTION_CATEGORIES = {
  ROLE: 'role',
  COMPANY: 'company',
  TEAM: 'team',
  GROWTH: 'growth',
  CULTURE: 'culture',
} as const;

export const TIMING_OPTIONS = {
  EARLY: 'early',
  MIDDLE: 'middle',
  END: 'end',
} as const;

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  BLUE: 'blue',
  INDIGO: 'indigo',
  GREEN: 'green',
  HIGH_CONTRAST: 'high-contrast',
  LOW_CONTRAST: 'low-contrast',
  WARM: 'warm',
  COOL: 'cool',
} as const;

export const STEPS = {
  UPLOAD: 'upload',
  ANALYSIS: 'analysis',
  DASHBOARD: 'dashboard',
  INTERVIEW: 'interview',
} as const;

export const LOCAL_STORAGE_KEYS = {
  THEME: 'ai-interview-prep-theme',
  USER_SETTINGS: 'ai-interview-prep-settings',
  LAST_SESSION: 'ai-interview-prep-last-session',
} as const;

export const getFileExtension = (filename: string): string => {
  return filename.toLowerCase().split('.').pop() || '';
};

export const isValidFileType = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return APP_CONFIG.supportedFileTypes.includes(extension as 'pdf' | 'doc' | 'docx' | 'txt');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {return '0 B';}
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isFileSizeValid = (size: number): boolean => {
  return size <= APP_CONFIG.maxFileSize;
};

export const getErrorMessage = (errorType: string): string => {
  const messages = {
    'file-too-large': `File size exceeds ${formatFileSize(APP_CONFIG.maxFileSize)} limit`,
    'invalid-file-type': `Only ${APP_CONFIG.supportedFileTypes.join(', ')} files are supported`,
    'upload-failed': 'File upload failed. Please try again.',
    'analysis-failed': 'Analysis failed. Please try again.',
    'network-error': 'Network error. Please check your connection.',
  };
  
  return messages[errorType as keyof typeof messages] || 'An unknown error occurred';
};