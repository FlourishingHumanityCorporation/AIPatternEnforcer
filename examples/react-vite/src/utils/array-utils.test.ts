import { unique, chunk, flatten, groupBy } from './array-utils';

describe('array-utils', () => {
  describe('unique', () => {
    it('removes duplicate numbers', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('removes duplicate strings', () => {
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('handles empty array', () => {
      expect(unique([])).toEqual([]);
    });

    it('handles array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('chunk', () => {
    it('chunks array into specified size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('handles empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('handles size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('handles size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('handles invalid size', () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -1)).toEqual([]);
    });
  });

  describe('flatten', () => {
    it('flattens nested arrays', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles empty nested arrays', () => {
      expect(flatten([[], [1, 2], []])).toEqual([1, 2]);
    });

    it('handles empty array', () => {
      expect(flatten([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    it('groups objects by key', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' }
      ];
      
      const result = groupBy(items, item => item.type);
      
      expect(result).toEqual({
        fruit: [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' }
        ],
        vegetable: [
          { type: 'vegetable', name: 'carrot' }
        ]
      });
    });

    it('groups numbers by parity', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd');
      
      expect(result).toEqual({
        odd: [1, 3, 5],
        even: [2, 4, 6]
      });
    });

    it('handles empty array', () => {
      expect(groupBy([], x => x)).toEqual({});
    });
  });
});