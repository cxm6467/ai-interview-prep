import {
  shuffleArray,
  chunkArray,
  uniqueArray,
  groupBy,
  findDuplicates,
  isEmpty,
  getRandomItem
} from './arrayUtils';

describe('arrayUtils', () => {
  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(array);
      expect(shuffled).toHaveLength(array.length);
    });

    it('should contain all original elements', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(array);
      expect(shuffled.sort()).toEqual(array.sort());
    });

    it('should not modify original array', () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      shuffleArray(array);
      expect(array).toEqual(original);
    });
  });

  describe('chunkArray', () => {
    it('should chunk array into specified sizes', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = chunkArray(array, 3);
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle empty arrays', () => {
      expect(chunkArray([], 3)).toEqual([]);
    });

    it('should handle arrays smaller than chunk size', () => {
      expect(chunkArray([1, 2], 5)).toEqual([[1, 2]]);
    });
  });

  describe('uniqueArray', () => {
    it('should remove duplicates', () => {
      const array = [1, 2, 2, 3, 3, 3, 4];
      expect(uniqueArray(array)).toEqual([1, 2, 3, 4]);
    });

    it('should work with strings', () => {
      const array = ['a', 'b', 'a', 'c', 'b'];
      expect(uniqueArray(array)).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty arrays', () => {
      expect(uniqueArray([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    it('should group objects by key', () => {
      const people = [
        { name: 'Alice', age: 25, city: 'NYC' },
        { name: 'Bob', age: 30, city: 'LA' },
        { name: 'Charlie', age: 25, city: 'NYC' }
      ];

      const grouped = groupBy(people, person => person.city);
      expect(grouped).toEqual({
        NYC: [
          { name: 'Alice', age: 25, city: 'NYC' },
          { name: 'Charlie', age: 25, city: 'NYC' }
        ],
        LA: [{ name: 'Bob', age: 30, city: 'LA' }]
      });
    });

    it('should handle empty arrays', () => {
      expect(groupBy([], item => item)).toEqual({});
    });
  });

  describe('findDuplicates', () => {
    it('should find duplicate values', () => {
      const array = [1, 2, 3, 2, 4, 3, 5];
      expect(findDuplicates(array)).toEqual([2, 3]);
    });

    it('should return empty array when no duplicates', () => {
      const array = [1, 2, 3, 4, 5];
      expect(findDuplicates(array)).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(findDuplicates([])).toEqual([]);
    });
  });

  describe('isEmpty', () => {
    it('should identify empty arrays', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('not array')).toBe(true);
    });

    it('should identify non-empty arrays', () => {
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe('getRandomItem', () => {
    it('should return item from array', () => {
      const array = [1, 2, 3, 4, 5];
      const item = getRandomItem(array);
      expect(array).toContain(item);
    });

    it('should return null for empty arrays', () => {
      expect(getRandomItem([])).toBe(null);
      expect(getRandomItem(null as any)).toBe(null);
    });

    it('should return the only item for single-item arrays', () => {
      expect(getRandomItem([42])).toBe(42);
    });
  });
});