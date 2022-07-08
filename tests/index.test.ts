import IterableStream from '../src/index';

describe('IterableStream', () => {
  describe('static', () => {
    describe('empty', () => {
      it('should return a stream', () => {
        expect(IterableStream.isIteratorStream(IterableStream.empty())).toBe(true);
      });
      it('should return a stream of length 0', () => {
        expect(IterableStream.empty().length()).toBe(0);
      });
    });
    describe('from', () => {
      it('should create a stream containing the elements of the given iterable', () => {
        const elements = [0, 1, 2, 3, 4];
        const instance = IterableStream.from(elements);
        expect(instance.toArray()).toEqual(elements);
      });
    });
    describe('isIteratorStream', () => {
      it('should return true if value is IterableStream', () => {
        const instance = new IterableStream(function* () { yield null; });
        expect(IterableStream.isIteratorStream(instance)).toBe(true);
      });
      it('should return false if value anything else', () => {
        [1, 1n, true, 'str', undefined, null, {}, [], Symbol('test')]
          .forEach((type) => {
            expect(IterableStream.isIteratorStream(type)).toBe(false);
          });
      });
    });
    describe('join', () => {
      it('should create a stream containing the elements from a single stream', () => {
        const elements = [0, 1, 2, 3, 4];
        const instance = IterableStream.join(IterableStream.from(elements));
        expect(instance.toArray()).toEqual(elements);
      });
      it('should create a stream containing the elements from many element', () => {
        const elements = [0, 1, 2, 3, 4];
        const instance = IterableStream.join(
          ...Array(4).fill(elements).map(IterableStream.from),
        );
        expect(instance.toArray()).toEqual(
          Array(4).fill(elements).flat(),
        );
      });
    });
    describe('of', () => {
      it('should create a stream containing the provided elements', () => {
        const elements = [0, 1, 2, 3, 4];
        const instance = IterableStream.of(...elements);
        expect(instance.toArray()).toEqual(elements);
      });
    });
  });
  describe('constructor', () => {
    it('should contain the values yielded by the generator', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.toArray())
        .toEqual(elements);
    });
  });
  describe('concat', () => {
    it('should create a new stream', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.concat(2))
        .not.toBe(instance);
    });
    it('should create a new stream containing the additional elements from the given stream', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.concat(instance).toArray())
        .toEqual([...elements, ...elements]);
    });
    it('should create a new stream containing the additional element', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.concat(2).toArray())
        .toEqual([...elements, 2]);
    });
    it('should concat multiple elements', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.concat(5, 6, 7, instance).toArray())
        .toEqual([...elements, 5, 6, 7, ...elements]);
    });
  });
  describe('every', () => {
    it('should return a true if all predicates are true', () => {
      expect(IterableStream.of(true, true, true, true).every((value) => value))
        .toBe(true);
    });
    it('should return a false if any predicates are false', () => {
      const array = Array(20).fill(0);
      for (let i = 0; i < array.length; i += 1) {
        const stream = IterableStream.from(array.map((_, j) => j !== i));
        expect(stream.every((value) => value))
          .toBe(false);
      }
    });
  });
  describe('filter', () => {
    it('should create a new stream', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.filter((n) => n % 2 === 0))
        .not.toBe(instance);
    });
    it('should create a new stream that only contains filtered values', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const test = (n: number) => n % 2 === 0;
      expect(instance.filter(test).toArray())
        .toEqual(elements.filter(test));
    });
  });
  describe('find', () => {
    it('should return the first element that passes the test', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.find((n) => n === 3))
        .toBe(3);
    });
    it('should return null if no elements pass the test', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.find((n) => n === 5))
        .toBeNull();
    });
  });
  describe('flatMap', () => {
    it('should create a new stream', () => {
      const elements = [0, 1, 2, 3, 4];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.flatMap((n) => [n, n * 2]))
        .not.toBe(instance);
    });
    it('should create a new stream containing flattened elements of the returned iterable', () => {
      const elements = [[0, 1], [2, 3, 4]];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.flatMap((n) => n).toArray())
        .toEqual(elements.flat());
    });

    it('should create be able to handle non iterable return', () => {
      const elements = [[0, 1], [2, 3, 4], 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.flatMap((n) => n as any).toArray())
        .toEqual(elements.flat());
    });
  });
  describe('forEach', () => {
    it('should run the callback for every element', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const result: number[] = [];
      instance.forEach((n) => {
        result.push(n);
      });
      expect(result).toEqual(elements);
    });
  });
  describe('includes', () => {
    it('should return true if the element is in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.includes(4))
        .toBe(true);
    });
    it('should return false if the element is not in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.includes(6))
        .toBe(false);
    });
  });
  describe('length', () => {
    it('should return 0 for an empty array', () => {
      const instance = IterableStream.of();
      expect(instance.length())
        .toBe(0);
    });
    it('should return the number of elements in the stream', () => {
      for (let i = 0; i < 20; i += 1) {
        const elements = Array(i).fill(0);
        const instance = new IterableStream(function* () {
          yield* elements;
        });
        expect(instance.length())
          .toBe(i);
      }
    });
  });
  describe('limit', () => {
    it('should return a new stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.limit(1))
        .not.toBe(instance);
    });
    it('should return a new stream that contains no more than the number of elements given', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      for (let i = 0; i < elements.length; i += 1) {
        expect(instance.limit(i).toArray())
          .toEqual(elements.slice(0, i));
      }
    });
    it('should return a new stream that contains all elements if the count is bigger than the length', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.limit(7).toArray())
        .toEqual(elements);
    });
  });
  describe('map', () => {
    it('should return a new stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const mapper = (n: number) => 2 * n;
      expect(instance.map(mapper))
        .not.toBe(instance);
    });
    it('should return a new stream with element that are the result of mapping the previous stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const mapper = (n: number) => 2 * n;
      expect(instance.map(mapper).toArray())
        .toEqual(elements.map(mapper));
    });
  });
  describe('max', () => {
    it('should return the maximum value', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.max((a, b) => a - b))
        .toBe(5);
    });
    it('should return undefined for an empty steam', () => {
      expect(IterableStream.of<number>().max((a, b) => a - b))
        .toBeUndefined();
    });
  });
  describe('min', () => {
    it('should return the minimum value', () => {
      const elements = [0, 1, 2, 3, 4, 5].reverse();
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.min((a, b) => a - b))
        .toBe(0);
    });
    it('should return undefined for an empty steam', () => {
      expect(IterableStream.of<number>().min((a, b) => a - b))
        .toBeUndefined();
    });
  });
  describe('peek', () => {
    it('should return a new stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.peek(() => {}))
        .not.toBe(instance);
    });
    it('should not modify the elements in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.peek(() => {}).toArray())
        .toEqual(elements);
    });
    it('should be called for every elements in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const results: number[] = [];
      instance.peek((n) => {
        results.push(n);
      }).toArray();
      expect(results)
        .toEqual(elements);
    });
  });
  describe('reduce', () => {
    it('should return the accumulated value of all elements in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.reduce((sum, n) => sum + n, 0))
        .toBe(elements.reduce((sum, n) => sum + n, 0));
    });

    it('should return the initials value for an empty stream', () => {
      expect(IterableStream.empty().reduce((sum, n) => sum + n, 0))
        .toBe(0);
    });
  });
  describe('skip', () => {
    it('should return a new stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.skip(1))
        .not.toBe(instance);
    });
    it('should return a new stream that contains all elements after the given number of elements', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      for (let i = 0; i < elements.length; i += 1) {
        expect(instance.skip(i).toArray())
          .toEqual(elements.slice(i));
      }
    });

    it('should return a new stream that contains all elements if the count is 0', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.skip(0).toArray())
        .toEqual(elements);
    });
  });
  describe('some', () => {
    it('should return a true if any predicates are true', () => {
      const array = Array(20).fill(0);
      for (let i = 0; i < array.length; i += 1) {
        const stream = IterableStream.from(array.map((_, j) => j === i));
        expect(stream.some((value) => value))
          .toBe(true);
      }
    });
    it('should return a false if all predicates are false', () => {
      expect(IterableStream.of(false, false, false, false).some((value) => value))
        .toBe(false);
    });
  });
  describe('sum', () => {
    it('should return the sum of all elements in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.sum())
        .toBe(elements.reduce((sum, n) => sum + n, 0));
    });

    it('should return the sum of all elements with mapper if provided', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const mapper = (n: number) => 2 * n;
      expect(instance.sum(mapper))
        .toBe(elements.reduce((sum, n) => sum + n * 2, 0));
    });
  });
  describe('toArray', () => {
    it('should return an Array', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.toArray())
        .toBeInstanceOf(Array);
    });
    it('should return an array with the elements in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.toArray())
        .toEqual(elements);
    });
  });
  describe('toMap', () => {
    it('should return a Map', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const keyMapper = (n: number) => n;
      const valueMapper = (n: number) => `$${n}`;
      expect(instance.toMap(keyMapper, valueMapper))
        .toBeInstanceOf(Map);
    });
    it('should return a Map with keys that result from keyMapper', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const keyMapper = (n: number) => n;
      const valueMapper = (n: number) => `$${n}`;
      expect([...instance.toMap(keyMapper, valueMapper).keys()])
        .toEqual(elements.map(keyMapper));
    });
    it('should return a Map with values that result from valueMapper', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const keyMapper = (n: number) => n;
      const valueMapper = (n: number) => `$${n}`;
      expect([...instance.toMap(keyMapper, valueMapper).values()])
        .toEqual(elements.map(valueMapper));
    });

    it('should return a Map with keys that result from keyMapper with no valueMapper', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const keyMapper = (n: number) => `${n}-`;
      expect([...instance.toMap(keyMapper).keys()])
        .toEqual(elements.map(keyMapper));
    });
    it('should return a Map with values that result from valueMapper', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      const keyMapper = (n: number) => `${n}-`;
      expect([...instance.toMap(keyMapper).values()])
        .toEqual(elements);
    });
  });
  describe('toSet', () => {
    it('should return a Set', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.toSet())
        .toBeInstanceOf(Set);
    });
    it('should return a Set with the elements in the stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect([...instance.toSet()])
        .toEqual(elements);
    });
    it('should return a Set with only the unique elements in the stream', () => {
      const elements = [0, 0, 1, 1, 2, 3, 3, 3, 4, 5, 5, 5, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect([...instance.toSet()])
        .toEqual([...new Set(elements)]);
    });
  });
  describe('unique', () => {
    it('should return a new stream', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.unique())
        .not.toBe(instance);
    });
    it('should return a new unmodified stream if no duplicates', () => {
      const elements = [0, 1, 2, 3, 4, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.unique().toArray())
        .toEqual(elements);
    });
    it('should return a new stream with duplicates removed', () => {
      const elements = [0, 0, 1, 1, 2, 3, 3, 3, 4, 5, 5, 5, 5];
      const instance = new IterableStream(function* () {
        yield* elements;
      });
      expect(instance.unique().toArray())
        .toEqual([...new Set(elements)]);
    });
  });
  describe('[Symbol.iterator]', () => {

  });
});
