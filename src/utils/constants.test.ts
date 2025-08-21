import {
  APP_CONFIG,
  INTERVIEW_TYPES,
  QUESTION_CATEGORIES,
  TIMING_OPTIONS,
  THEME_TYPES,
  STEPS,
  LOCAL_STORAGE_KEYS,
  getFileExtension,
  isValidFileType,
  formatFileSize,
  isFileSizeValid,
  getErrorMessage
} from './constants';

describe('constants', () => {
  describe('APP_CONFIG', () => {
    it('should have correct application configuration', () => {
      expect(APP_CONFIG.name).toBe('AI Interview Prep');
      expect(APP_CONFIG.version).toBe('1.0.0');
      expect(APP_CONFIG.defaultTheme).toBe('light');
      expect(APP_CONFIG.maxFileSize).toBe(10 * 1024 * 1024);
      expect(APP_CONFIG.supportedFileTypes).toEqual(['pdf', 'doc', 'docx', 'txt']);
      expect(APP_CONFIG.apiTimeout).toBe(30000);
    });
  });

  describe('constant objects', () => {
    it('should have correct interview types', () => {
      expect(INTERVIEW_TYPES.TECHNICAL).toBe('technical');
      expect(INTERVIEW_TYPES.BEHAVIORAL).toBe('behavioral');
      expect(INTERVIEW_TYPES.SITUATIONAL).toBe('situational');
    });

    it('should have correct question categories', () => {
      expect(QUESTION_CATEGORIES.ROLE).toBe('role');
      expect(QUESTION_CATEGORIES.COMPANY).toBe('company');
      expect(QUESTION_CATEGORIES.TEAM).toBe('team');
      expect(QUESTION_CATEGORIES.GROWTH).toBe('growth');
      expect(QUESTION_CATEGORIES.CULTURE).toBe('culture');
    });

    it('should have correct timing options', () => {
      expect(TIMING_OPTIONS.EARLY).toBe('early');
      expect(TIMING_OPTIONS.MIDDLE).toBe('middle');
      expect(TIMING_OPTIONS.END).toBe('end');
    });

    it('should have correct theme types', () => {
      expect(THEME_TYPES.LIGHT).toBe('light');
      expect(THEME_TYPES.DARK).toBe('dark');
      expect(THEME_TYPES.BLUE).toBe('blue');
      expect(THEME_TYPES.INDIGO).toBe('indigo');
      expect(THEME_TYPES.GREEN).toBe('green');
      expect(THEME_TYPES.HIGH_CONTRAST).toBe('high-contrast');
      expect(THEME_TYPES.LOW_CONTRAST).toBe('low-contrast');
      expect(THEME_TYPES.WARM).toBe('warm');
      expect(THEME_TYPES.COOL).toBe('cool');
    });

    it('should have correct steps', () => {
      expect(STEPS.UPLOAD).toBe('upload');
      expect(STEPS.ANALYSIS).toBe('analysis');
      expect(STEPS.DASHBOARD).toBe('dashboard');
      expect(STEPS.INTERVIEW).toBe('interview');
    });

    it('should have correct local storage keys', () => {
      expect(LOCAL_STORAGE_KEYS.THEME).toBe('ai-interview-prep-theme');
      expect(LOCAL_STORAGE_KEYS.USER_SETTINGS).toBe('ai-interview-prep-settings');
      expect(LOCAL_STORAGE_KEYS.LAST_SESSION).toBe('ai-interview-prep-last-session');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('resume.doc')).toBe('doc');
      expect(getFileExtension('cover-letter.docx')).toBe('docx');
      expect(getFileExtension('notes.txt')).toBe('txt');
      expect(getFileExtension('file.PDF')).toBe('pdf'); // case insensitive
    });

    it('should handle files without extensions', () => {
      expect(getFileExtension('filename')).toBe('filename'); // no dot means whole filename is returned
      expect(getFileExtension('')).toBe('');
    });

    it('should handle complex filenames', () => {
      expect(getFileExtension('my.resume.v2.pdf')).toBe('pdf');
      expect(getFileExtension('file-name_with.dots.docx')).toBe('docx');
    });
  });

  describe('isValidFileType', () => {
    it('should validate supported file types', () => {
      expect(isValidFileType('document.pdf')).toBe(true);
      expect(isValidFileType('resume.doc')).toBe(true);
      expect(isValidFileType('cover.docx')).toBe(true);
      expect(isValidFileType('notes.txt')).toBe(true);
    });

    it('should reject unsupported file types', () => {
      expect(isValidFileType('image.jpg')).toBe(false);
      expect(isValidFileType('video.mp4')).toBe(false);
      expect(isValidFileType('archive.zip')).toBe(false);
      expect(isValidFileType('script.js')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidFileType('document.PDF')).toBe(true);
      expect(isValidFileType('resume.DOC')).toBe(true);
      expect(isValidFileType('cover.DOCX')).toBe(true);
    });

    it('should handle files without extensions', () => {
      expect(isValidFileType('filename')).toBe(false);
      expect(isValidFileType('')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should handle small values', () => {
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(100)).toBe('100 B');
    });
  });

  describe('isFileSizeValid', () => {
    it('should validate file sizes within limit', () => {
      expect(isFileSizeValid(1024)).toBe(true);
      expect(isFileSizeValid(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(isFileSizeValid(10 * 1024 * 1024)).toBe(true); // 10MB (exactly at limit)
    });

    it('should reject file sizes over limit', () => {
      expect(isFileSizeValid(11 * 1024 * 1024)).toBe(false); // 11MB
      expect(isFileSizeValid(20 * 1024 * 1024)).toBe(false); // 20MB
    });

    it('should handle edge cases', () => {
      expect(isFileSizeValid(0)).toBe(true);
      expect(isFileSizeValid(APP_CONFIG.maxFileSize + 1)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages for known error types', () => {
      expect(getErrorMessage('file-too-large')).toContain('File size exceeds');
      expect(getErrorMessage('invalid-file-type')).toContain('Only pdf, doc, docx, txt files are supported');
      expect(getErrorMessage('upload-failed')).toBe('File upload failed. Please try again.');
      expect(getErrorMessage('analysis-failed')).toBe('Analysis failed. Please try again.');
      expect(getErrorMessage('network-error')).toBe('Network error. Please check your connection.');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage('unknown-error')).toBe('An unknown error occurred');
      expect(getErrorMessage('')).toBe('An unknown error occurred');
      expect(getErrorMessage('not-defined')).toBe('An unknown error occurred');
    });

    it('should format file size in error messages', () => {
      const message = getErrorMessage('file-too-large');
      expect(message).toContain('10 MB');
    });
  });
});