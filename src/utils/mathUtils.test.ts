import {
  clamp,
  roundToDecimal,
  randomInRange,
  randomInt,
  average,
  median,
  sum,
  max,
  min,
  isEven,
  isOdd,
  isPrime,
  factorial,
  gcd
} from './mathUtils';

describe('mathUtils', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(5, 5, 5)).toBe(5);
      expect(clamp(0, 1, 10)).toBe(1);
    });
  });

  describe('roundToDecimal', () => {
    it('should round to specified decimal places', () => {
      expect(roundToDecimal(3.14159, 2)).toBe(3.14);
      expect(roundToDecimal(10.999, 1)).toBe(11);
      expect(roundToDecimal(42, 0)).toBe(42);
    });
  });

  describe('randomInRange', () => {
    it('should return value within range', () => {
      const result = randomInRange(5, 10);
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThan(10);
    });
  });

  describe('randomInt', () => {
    it('should return integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 6);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('average', () => {
    it('should calculate average correctly', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20, 30])).toBe(20);
    });

    it('should handle empty arrays', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('median', () => {
    it('should calculate median for odd length arrays', () => {
      expect(median([1, 3, 5])).toBe(3);
      expect(median([7, 1, 9, 3, 5])).toBe(5);
    });

    it('should calculate median for even length arrays', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
      expect(median([10, 20])).toBe(15);
    });

    it('should handle empty arrays', () => {
      expect(median([])).toBe(0);
    });
  });

  describe('sum', () => {
    it('should calculate sum correctly', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
      expect(sum([10, -5, 3])).toBe(8);
    });

    it('should handle empty arrays', () => {
      expect(sum([])).toBe(0);
    });
  });

  describe('max', () => {
    it('should find maximum value', () => {
      expect(max([1, 5, 3, 9, 2])).toBe(9);
      expect(max([-5, -1, -10])).toBe(-1);
    });

    it('should handle empty arrays', () => {
      expect(max([])).toBe(0);
    });
  });

  describe('min', () => {
    it('should find minimum value', () => {
      expect(min([1, 5, 3, 9, 2])).toBe(1);
      expect(min([-5, -1, -10])).toBe(-10);
    });

    it('should handle empty arrays', () => {
      expect(min([])).toBe(0);
    });
  });

  describe('isEven', () => {
    it('should identify even numbers', () => {
      expect(isEven(2)).toBe(true);
      expect(isEven(4)).toBe(true);
      expect(isEven(0)).toBe(true);
      expect(isEven(-2)).toBe(true);
    });

    it('should reject odd numbers', () => {
      expect(isEven(1)).toBe(false);
      expect(isEven(3)).toBe(false);
      expect(isEven(-1)).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('should identify odd numbers', () => {
      expect(isOdd(1)).toBe(true);
      expect(isOdd(3)).toBe(true);
      expect(isOdd(-1)).toBe(true);
    });

    it('should reject even numbers', () => {
      expect(isOdd(2)).toBe(false);
      expect(isOdd(4)).toBe(false);
      expect(isOdd(0)).toBe(false);
    });
  });

  describe('isPrime', () => {
    it('should identify prime numbers', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(5)).toBe(true);
      expect(isPrime(7)).toBe(true);
      expect(isPrime(11)).toBe(true);
      expect(isPrime(13)).toBe(true);
    });

    it('should reject non-prime numbers', () => {
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(6)).toBe(false);
      expect(isPrime(8)).toBe(false);
      expect(isPrime(9)).toBe(false);
      expect(isPrime(10)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isPrime(0)).toBe(false);
      expect(isPrime(-5)).toBe(false);
    });
  });

  describe('factorial', () => {
    it('should calculate factorials correctly', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(3)).toBe(6);
      expect(factorial(4)).toBe(24);
      expect(factorial(5)).toBe(120);
    });

    it('should handle negative numbers', () => {
      expect(factorial(-1)).toBe(0);
      expect(factorial(-5)).toBe(0);
    });
  });

  describe('gcd', () => {
    it('should calculate greatest common divisor', () => {
      expect(gcd(12, 8)).toBe(4);
      expect(gcd(15, 25)).toBe(5);
      expect(gcd(17, 13)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(gcd(0, 5)).toBe(5);
      expect(gcd(7, 0)).toBe(7);
    });
  });
});