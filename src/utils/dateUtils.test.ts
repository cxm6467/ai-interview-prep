import {
  formatDate,
  formatDateShort,
  getRelativeTime,
  isValidDate,
  addDays,
  isWeekend,
  getYearFromDateString
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date(2023, 11, 25); // Month is 0-indexed
      expect(formatDate(date)).toBe('December 25, 2023');
    });
  });

  describe('formatDateShort', () => {
    it('should format dates in short format', () => {
      const date = new Date(2023, 11, 25); // Month is 0-indexed
      expect(formatDateShort(date)).toBe('Dec 25, 2023');
    });
  });

  describe('getRelativeTime', () => {
    const now = new Date();
    
    it('should return "Today" for today', () => {
      expect(getRelativeTime(now)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(getRelativeTime(yesterday)).toBe('Yesterday');
    });

    it('should return days ago for recent dates', () => {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return weeks ago for dates within a month', () => {
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('should return months ago for dates within a year', () => {
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(twoMonthsAgo)).toBe('2 months ago');
    });

    it('should return years ago for old dates', () => {
      const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(twoYearsAgo)).toBe('2 years ago');
    });
  });

  describe('isValidDate', () => {
    it('should validate correct dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2023-12-25'))).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('string')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date(2023, 11, 25); // Dec 25, 2023
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(30); // Dec 30, 2023
    });

    it('should subtract days with negative values', () => {
      const date = new Date(2023, 11, 25); // Dec 25, 2023
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(20); // Dec 20, 2023
    });
  });

  describe('isWeekend', () => {
    it('should identify weekend days', () => {
      const saturday = new Date(2023, 11, 23); // Dec 23, 2023 (Saturday)
      const sunday = new Date(2023, 11, 24); // Dec 24, 2023 (Sunday)
      
      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should identify weekdays', () => {
      const monday = new Date(2023, 11, 25); // Dec 25, 2023 (Monday)
      const friday = new Date(2023, 11, 29); // Dec 29, 2023 (Friday)
      
      expect(isWeekend(monday)).toBe(false);
      expect(isWeekend(friday)).toBe(false);
    });
  });

  describe('getYearFromDateString', () => {
    it('should extract year from date strings', () => {
      expect(getYearFromDateString('Jan 2020 - Dec 2022')).toBe(2020);
      expect(getYearFromDateString('2023')).toBe(2023);
      expect(getYearFromDateString('Graduated in 2021')).toBe(2021);
    });

    it('should return null for strings without years', () => {
      expect(getYearFromDateString('No year here')).toBe(null);
      expect(getYearFromDateString('')).toBe(null);
    });
  });
});