export type MapCallback<T, S> = (value: T) => S;
export type Callback<T> = MapCallback<T, void>;
export type Predicate<T> = MapCallback<T, boolean>;
export type ReduceCallback<T, S> = (accumulator: S, value: T) => S;

export type Comparator<T> = (a: T, b: T) => number;

export const identity = (n: any) => n;

export const isIterable = (obj: any): obj is Iterable<any> => typeof obj?.[Symbol.iterator] === 'function';
