import { 
  isValidEmail, 
  isValidPhone, 
  isValidName, 
  sanitizeString, 
  formatDuration,
  validateResumeData 
} from './validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('+1 (123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('0123456789')).toBe(false); // starts with 0
    });
  });

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Alice')).toBe(true);
      expect(isValidName('Jean-Claude Van Damme')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('A')).toBe(false);
      expect(isValidName('   ')).toBe(false);
      expect(isValidName('A'.repeat(51))).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('  Hello <script> World  ')).toBe('Hello script World');
      expect(sanitizeString('Test > text')).toBe('Test  text');
      expect(sanitizeString('Normal text')).toBe('Normal text');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  trimmed  ')).toBe('trimmed');
    });
  });

  describe('formatDuration', () => {
    it('should format duration strings', () => {
      expect(formatDuration('Jan  2020   -   Dec   2022')).toBe('Jan 2020 - Dec 2022');
      expect(formatDuration('  2020-2022  ')).toBe('2020-2022');
    });
  });

  describe('validateResumeData', () => {
    it('should validate correct resume data structure', () => {
      const validData = {
        experience: [],
        skills: [],
        education: []
      };
      expect(validateResumeData(validData)).toBe(true);
    });

    it('should reject invalid resume data', () => {
      expect(validateResumeData(null)).toBe(false);
      expect(validateResumeData(undefined)).toBe(false);
      expect(validateResumeData('string')).toBe(false);
      expect(validateResumeData({})).toBe(false);
      expect(validateResumeData({ experience: 'not array' })).toBe(false);
    });
  });
});