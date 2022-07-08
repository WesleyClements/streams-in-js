import { identity, isIterable } from '../src/utils';

describe('utils', () => {
  describe('identity', () => {
    it('should return the argument', () => {
      const value = {};
      expect(identity(value)).toBe(value);
    });
  });
  describe('isIterable', () => {
    it('should return the false if value is nullish', () => {
      [undefined, null].forEach((value) => {
        expect(isIterable(value)).toBe(false);
      });
    });
    it('should return the false if value isn\'t iterable', () => {
      const value = {};
      expect(isIterable(value)).toBe(false);
    });
    it('should return the true if value is iterable', () => {
      const value = {
        [Symbol.iterator]() {},
      };
      expect(isIterable(value)).toBe(true);
    });
  });
});
