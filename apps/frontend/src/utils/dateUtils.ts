/**
 * Date utilities for the application
 */

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {return 'Today';}
  if (diffDays === 1) {return 'Yesterday';}
  if (diffDays < 7) {return `${diffDays} days ago`;}
  if (diffDays < 30) {return `${Math.floor(diffDays / 7)} weeks ago`;}
  if (diffDays < 365) {return `${Math.floor(diffDays / 30)} months ago`;}
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const isValidDate = (date: unknown): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getYearFromDateString = (dateStr: string): number | null => {
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
};