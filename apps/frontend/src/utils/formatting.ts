/**
 * Text formatting utilities
 */

export const capitalize = (text: string): string => {
  if (!text) {return '';}
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  if (!text) {return '';}
  return text.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {return text;}
  return text.slice(0, maxLength).trim() + '...';
};

export const formatJobTitle = (title: string): string => {
  return capitalizeWords(title.replace(/[_-]/g, ' '));
};

export const formatCompanyName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

export const extractInitials = (name: string): string => {
  if (!name) {return '';}
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {return '0 Bytes';}
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPercentage = (value: number): string => {
  return Math.round(value) + '%';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};