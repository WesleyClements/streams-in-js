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

  #generator: () => Generator<T>;

  constructor(generator: () => Generator<T>) {
    Object.defineProperty(this, iterableStreamSymbol, {
      value: true,
    });
    this.#generator = generator;
  }

  concat(...values: (T | IterableStream<T>)[]): IterableStream<T> {
    const generator = this.#generator;
    return new IterableStream(function* () {
      yield* generator();
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
    for (const value of this.#generator()) {
      if (!predicate(value)) {
        return false;
      }
    }
    return true;
  }

  filter(predicate: Predicate<T>): IterableStream<T> {
    const generator = this.#generator;
    return new IterableStream(function* () {
      for (const value of generator()) {
        if (predicate(value)) {
          yield value;
        }
      }
    });
  }

  find(predicate: Predicate<T>): T | null {
    for (const value of this.#generator()) {
      if (!predicate(value)) {
        return value;
      }
    }
    return null;
  }

  flatMap<S>(mapper: MapCallback<T, S[]>): IterableStream<S> {
    const generator = this.#generator;
    return new IterableStream(function* () {
      for (const value of generator()) {
        yield* mapper(value);
      }
    });
  }

  forEach(callback: Callback<T>): void {
    for (const value of this.#generator()) {
      callback(value);
    }
  }

  includes(searchElement: T): boolean {
    for (const value of this.#generator()) {
      if (value === searchElement) {
        return true;
      }
    }
    return false;
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
    const generator = this.#generator;
    return new IterableStream(function* () {
      let index = 0;
      for (const value of generator()) {
        if (index >= count) {
          return;
        }
        yield value;
        index += 1;
      }
    });
  }

  map<S>(mapper: MapCallback<T, S>): IterableStream<S> {
    const generator = this.#generator;
    return new IterableStream(function* () {
      for (const value of generator()) {
        yield mapper(value);
      }
    });
  }

  max(comparator: Comparator<T>): T {
    const generator = this.#generator();
    let max = generator.next().value;
    for (const value of generator) {
      const comparison = comparator(max, value);
      if (comparison > 0) {
        max = value;
      }
    }
    return max;
  }

  min(comparator: Comparator<T>): T {
    const generator = this.#generator();
    let min = generator.next().value;
    for (const value of generator) {
      const comparison = comparator(min, value);
      if (comparison < 0) {
        min = value;
      }
    }
    return min;
  }

  peek(callback: Callback<T>): IterableStream<T> {
    const generator = this.#generator;
    return new IterableStream(function* () {
      for (const value of generator()) {
        callback(value);
        yield value;
      }
    });
  }

  reduce<S>(reducer: ReduceCallback<T, S>, initialValue: S): S {
    let accumulator = initialValue;
    for (const value of this.#generator()) {
      accumulator = reducer(accumulator, value);
    }
    return accumulator;
  }

  skip(count: number): IterableStream<T> {
    const generator = this.#generator;
    return new IterableStream(function* () {
      let index = 0;
      for (const value of generator()) {
        if (index >= count) {
          yield value;
        }
        index += 1;
      }
    });
  }

  some(predicate: Predicate<T>): boolean {
    for (const value of this.#generator()) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  }

  sum(): number {
    let sum = 0;
    for (const value of this.#generator()) {
      sum += Number(value);
    }
    return sum;
  }

  toArray(): T[] {
    return Array.from(this.#generator());
  }

  toMap<K, V>(keyMapper: MapCallback<T, K>, valueMapper: MapCallback<T, V>): Map<K, V> {
    return new Map(
      this.toArray().map((value) => [
        keyMapper(value),
        valueMapper(value),
      ]),
    );
  }

  toSet(): Set<T> {
    return new Set(this.#generator());
  }

  unique<S>(keyMapper: MapCallback<T, S> = identity as MapCallback<T, S>): IterableStream<T> {
    const previousGenerator = this.#generator;
    const values = new Set();
    return new IterableStream(function* () {
      for (const value of previousGenerator()) {
        const id = keyMapper(value);
        if (!values.has(id)) {
          yield value;
          values.add(value);
        }
      }
    });
  }

  * [Symbol.iterator]() {
    yield* this.#generator();
  }
}

export default IterableStream;
