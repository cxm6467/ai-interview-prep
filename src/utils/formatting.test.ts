import {
  capitalize,
  capitalizeWords,
  truncateText,
  formatJobTitle,
  formatCompanyName,
  extractInitials,
  formatFileSize,
  formatPercentage,
  slugify
} from './formatting';

describe('formatting utilities', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('tEST')).toBe('Test');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null as any)).toBe('');
      expect(capitalize(undefined as any)).toBe('');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('javascript developer')).toBe('Javascript Developer');
    });

    it('should handle empty strings', () => {
      expect(capitalizeWords('')).toBe('');
      expect(capitalizeWords(null as any)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is a...');
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText('test', 0)).toBe('...');
    });
  });

  describe('formatJobTitle', () => {
    it('should format job titles', () => {
      expect(formatJobTitle('software-engineer')).toBe('Software Engineer');
      expect(formatJobTitle('front_end_developer')).toBe('Front End Developer');
    });
  });

  describe('formatCompanyName', () => {
    it('should format company names', () => {
      expect(formatCompanyName('  Google   Inc  ')).toBe('Google Inc');
      expect(formatCompanyName('Apple\n\nInc')).toBe('Apple Inc');
    });
  });

  describe('extractInitials', () => {
    it('should extract initials from names', () => {
      expect(extractInitials('John Doe')).toBe('JD');
      expect(extractInitials('Alice Bob Charlie')).toBe('AB');
      expect(extractInitials('john')).toBe('J');
    });

    it('should handle empty names', () => {
      expect(extractInitials('')).toBe('');
      expect(extractInitials(null as any)).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(85.7)).toBe('86%');
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('JavaScript & React')).toBe('javascript-react');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(slugify('café-résumé')).toBe('caf-rsum');
      expect(slugify('test_underscore-dash')).toBe('test-underscore-dash');
    });
  });
});