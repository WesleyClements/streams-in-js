import {
  Callback,
  Comparator,
  identity,
  MapCallback,
  Predicate,
  ReduceCallback,
} from './utils';

const iterableStreamSymbol = Symbol('stream');

class IterableStream<T> implements Iterable<T> {
  static isIteratorStream<T>(obj: any): obj is IterableStream<T> {
    return Boolean(obj?.[iterableStreamSymbol]);
  }

  static of<S>(...elements: S[]) {
    return IterableStream.from(elements);
  }

  static from<S>(iterable: Iterable<S>) {
    return new IterableStream(function* () {
      yield* iterable;
    });
  }

  static join<S>(...streams: IterableStream<S>[]) {
    return new IterableStream(function* () {
      for (let i = 0; i < streams.length; i += 1) {
        yield* streams[i].#generator();
      }
    });
  }

  [iterableStreamSymbol] = true;

  #generator: () => Generator<T>;

  constructor(generator: () => Generator<T>) {
    this.#generator = generator;
  }

  concat(...values: (T | IterableStream<T>)[]): IterableStream<T> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      yield* previousGenerator();
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        if (IterableStream.isIteratorStream(value)) {
          yield* value;
        } else {
          yield value;
        }
      }
    });
  }

  every(predicate: Predicate<T>): boolean {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    while (!iterator.done) {
      if (!predicate(iterator.value, index)) {
        return false;
      }
      iterator = generator.next();
      index += 1;
    }
    return true;
  }

  filter(predicate: Predicate<T>): IterableStream<T> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        if (predicate(iterator.value, index)) {
          yield iterator.value;
        }
        iterator = generator.next();
        index += 1;
      }
    });
  }

  find(predicate: Predicate<T>): T | null {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    while (!iterator.done) {
      if (!predicate(iterator.value, index)) {
        return iterator.value;
      }
      iterator = generator.next();
      index += 1;
    }
    return null;
  }

  flatMap<S>(mapper: MapCallback<T, S[]>): IterableStream<S> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        yield* mapper(iterator.value, index);
        iterator = generator.next();
        index += 1;
      }
    });
  }

  forEach(callback: Callback<T>): void {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    while (!iterator.done) {
      callback(iterator.value, index);
      iterator = generator.next();
      index += 1;
    }
  }

  includes(value: T, fromIndex: number = 0): boolean {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    while (!iterator.done) {
      if (index >= fromIndex && iterator.value === value) {
        return true;
      }
      iterator = generator.next();
      index += 1;
    }
    return false;
  }

  join(separator?: string): string {
    return [...this.#generator()].map(String).join(separator);
  }

  length(): number {
    const generator = this.#generator();
    let iterator = generator.next();
    let count = 0;
    while (!iterator.done) {
      count += 1;
      iterator = generator.next();
    }
    return count;
  }

  limit(count: number): IterableStream<T> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        if (index >= count) {
          return;
        }
        yield iterator.value;
        iterator = generator.next();
        index += 1;
      }
    });
  }

  map<S>(mapper: MapCallback<T, S>): IterableStream<S> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        yield mapper(iterator.value, index);
        iterator = generator.next();
        index += 1;
      }
    });
  }

  max(comparator: Comparator<T>): T {
    const generator = this.#generator();
    let max = generator.next().value;
    let iterator = generator.next();
    while (!iterator.done) {
      const result = comparator(max, iterator.value);
      if (result > 0) {
        max = iterator.value;
      }
      iterator = generator.next();
    }
    return max;
  }

  min(comparator: Comparator<T>): T {
    const generator = this.#generator();
    let min = generator.next().value;
    let iterator = generator.next();
    while (!iterator.done) {
      const result = comparator(min, iterator.value);
      if (result < 0) {
        min = iterator.value;
      }
      iterator = generator.next();
    }
    return min;
  }

  peek(callback: Callback<T>): IterableStream<T> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        callback(iterator.value, index);
        yield iterator.value;
        iterator = generator.next();
        index += 1;
      }
    });
  }

  reduce<S>(reducer: ReduceCallback<T, S>, initialValue: S): S {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    let accumulator = initialValue;
    while (!iterator.done) {
      accumulator = reducer(accumulator, iterator.value, index);
      iterator = generator.next();
      index += 1;
    }
    return accumulator;
  }

  skip(count: number): IterableStream<T> {
    const previousGenerator = this.#generator;
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        if (index >= count) {
          yield iterator.value;
        }
        iterator = generator.next();
        index += 1;
      }
    });
  }

  some(predicate: Predicate<T>): boolean {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    while (!iterator.done) {
      if (predicate(iterator.value, index)) {
        return true;
      }
      iterator = generator.next();
      index += 1;
    }
    return false;
  }

  sum(mapper: MapCallback<T, number> = identity): number {
    const generator = this.#generator();
    let iterator = generator.next();
    let index = 0;
    let sum = 0;
    while (!iterator.done) {
      sum += mapper(iterator.value, index);
      iterator = generator.next();
      index += 1;
    }
    return sum;
  }

  toArray(): T[] {
    return Array.from(this.#generator());
  }

  toMap<K, V>(keyMapper: MapCallback<T, K>, valueMapper: MapCallback<T, V>): Map<K, V> {
    return new Map(this.toArray().map((value) => [keyMapper(value), valueMapper(value)]));
  }

  toSet(): Set<T> {
    return new Set(this.#generator());
  }

  unique<S>(keyMapper: MapCallback<T, S> = identity): IterableStream<T> {
    const previousGenerator = this.#generator;
    const values = new Set();
    return new IterableStream(function* () {
      const generator = previousGenerator();
      let iterator = generator.next();
      let index = 0;
      while (!iterator.done) {
        const id = keyMapper(iterator.value, index);
        if (!values.has(id)) {
          yield iterator.value;
          values.add(iterator.value);
        }
        iterator = generator.next();
        index += 1;
      }
    });
  }

  * [Symbol.iterator]() {
    yield* this.#generator();
  }
}

export default IterableStream;
