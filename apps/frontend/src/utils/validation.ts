/**
 * Validation utilities for the application
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{3,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatDuration = (duration: string): string => {
  return duration.trim().replace(/\s+/g, ' ');
};

export const validateResumeData = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') {return false;}
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.experience) && 
         Array.isArray(obj.skills) && 
         Array.isArray(obj.education);
};