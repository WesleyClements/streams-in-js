export type MapCallback<T, S> = (value: T, index?: number) => S;
export type ReduceCallback<T, S> = (accumulator: S, value: T, index?: number) => S;
export type Callback<T> = (value: T, index?: number) => void;
export type Predicate<T> = (value: T, index?: number) => boolean;

export type Comparator<T> = (a: T, b: T) => number;

export const identity: MapCallback<any, any> = (n: any) => n