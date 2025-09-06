/**
 * Math utilities for the application
 */

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const roundToDecimal = (num: number, decimals: number): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomInRange(min, max + 1));
};

export const average = (numbers: number[]): number => {
  if (numbers.length === 0) {return 0;}
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const median = (numbers: number[]): number => {
  if (numbers.length === 0) {return 0;}
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

export const sum = (numbers: number[]): number => {
  return numbers.reduce((acc, num) => acc + num, 0);
};

export const max = (numbers: number[]): number => {
  if (numbers.length === 0) {return 0;}
  return Math.max(...numbers);
};

export const min = (numbers: number[]): number => {
  if (numbers.length === 0) {return 0;}
  return Math.min(...numbers);
};

export const isEven = (num: number): boolean => {
  return num % 2 === 0;
};

export const isOdd = (num: number): boolean => {
  return num % 2 !== 0;
};

export const isPrime = (num: number): boolean => {
  if (num <= 1) {return false;}
  if (num <= 3) {return true;}
  if (num % 2 === 0 || num % 3 === 0) {return false;}
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) {
      return false;
    }
  }
  return true;
};

export const factorial = (n: number): number => {
  if (n < 0) {return 0;}
  if (n === 0 || n === 1) {return 1;}
  return n * factorial(n - 1);
};

export const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};