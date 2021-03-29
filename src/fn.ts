// ToDO: look at `rambda` for automatic handling of async (see <https://www.skypack.dev/view/rambda>)
// inspirations/refs
// * <https://exploringjs.com/es6/ch_iteration.html#sec_take_closing> , <https://2ality.com/2016/10/asynchronous-iteration.html>
// * <https://medium.com/@patarkf/synchronize-your-asynchronous-code-using-javascripts-async-await-5f3fa5b1366d>
// * <https://stackoverflow.com/questions/58668361/how-can-i-convert-an-async-iterator-to-an-array>
// * <https://javascript.info/async-iterators-generators>
// * <https://github.com/selfrefactor/rambda/search?q=async>
// * "Working with async functions"; [Mastering JavaScript Functional Programming, 2ndE [by Federico Kereki]{Packt, 2020-01(Jan)}], pp.137-44
// * <https://exploringjs.com/impatient-js/ch_async-iteration.html#example-converting-a-sync-iterable-to-an-async-iterable> @@ <https://archive.is/d0bqk>
// * [Generic Type Guard](https://dev.to/krumpet/generic-type-guard-in-typescript-258l) @@ <https://archive.is/9fu95>
// * [TypeScript FAQs](https://github.com/Microsoft/TypeScript/wiki/FAQ#faqs)

// ToDO: generalize and define more types
// see Foldable<T> iter 'rubico'
// * ref: <https://github.com/a-synchronous/rubico/issues/179>
// * ref: <https://github.com/a-synchronous/rubico/blob/master/_internal/iteratorFind.js>
// * ref: <https://github.com/a-synchronous/rubico/blob/master/_internal/asyncIteratorFind.js>
// * ref: <https://github.com/a-synchronous/rubico/blob/master/x/find.js>

// const symbolAsyncIterator = Symbol.asyncIterator;
// const symbolIterator = Symbol.iterator;
// const isPromise = (value: any) => value != null && typeof value.then == 'function';
// const isObject = (value: any) => {
// 	if (typeof value === 'undefined' || value === null) {
// 		return false;
// 	}
// 	const typeofValue = typeof value;
// 	return typeofValue == 'object' || typeofValue == 'function';
// };

// note: Iterable<T>, by ECMA2020 default, includes Array<T>, ArrayLike<T>, Map<K,T>, Set<T>, and String

type ObjectKey = number | string | symbol;
// type ObjectKey = number | string;
// type ObjectKey = string | symbol;
// type MapLikeObject<K extends ObjectKey, T> = { [P in K]: T };
// interface MapLikeObject<K, T> {
// 	[key: number]: T;
// 	[key: string]: T;
// 	// [key: symbol]: T;
// }
type MapLikeObject<K extends ObjectKey, T> = { [P in K]: T };
type MapLike<K, V> = Map<K, V> | MapLikeObject<ObjectKey, V> | { entries: () => [K, V][] };

type Enumerable<T, K = TypeOfEnumerableKey<T>, V = TypeOfEnumerableValue<T>> =
	| MapLike<K, V>
	| Generator<K, V>
	| ArrayLike<V>
	| Iterable<V>;

type AnyEnumerable<T, K = TypeOfEnumerableKey<T>, V = TypeOfEnumerableValue<T>> =
	| MapLike<K, V>
	| AsyncGenerator<K, V>
	| Generator<K, V>
	| ArrayLike<V>
	| AnyIterable<V>;

type TypeOfEnumerableKey<T> = T extends ArrayLike<any>
	? number
	: T extends
			| MapLike<infer K, any>
			| AsyncGenerator<[infer K, any], any, any>
			| Generator<[infer K, any], any, any>
	? K
	: T extends Iterator<any>
	? number
	: never;
type TypeOfEnumerableValue<T> = T extends
	| ArrayLike<infer V>
	| MapLike<any, infer V>
	| AsyncGenerator<[any, infer V], any, any>
	| Generator<[any, infer V], any, any>
	| Iterable<infer V>
	? V
	: unknown;

// ####

const m_1 = new Map([['a', 'z']]);
const it_1 = m_1[Symbol.iterator]();
const n = it_1.next();
let [k, v] = !n.done ? n.value : [];

const o = { 1: 1, 2: 2 };
const e = enumerate(
	// new Map<string, number>([['a', 1]])
	new Map<string, [number]>([['a', [1]]])
	// [1, 2]
);
const c = collect(e);

type ty = MapLikeObject<string, bigint>;
type tu = TypeOfEnumerableValue<Map<string, bigint>>;
// type tz = TypeOfEnumerableKey<AsyncGenerator<[bigint, number], void, void>>;
type tz = TypeOfEnumerableKey<ty>;

type my_t1<V, K> = Enumerable<Map<K, V>, V, K>;
type my_t2 = Enumerable<boolean[]>;
type my_t3 = Enumerable<String>;
type my_t4 = Enumerable<Map<number, string>>;

// ####

/**
 *  Collect all sequence values into a promised array (`Promise<T[]>`)
 */
export async function collect<
	T extends AnyEnumerable<any, any, any>
	// ,
	// TKey = TypeOfEnumerableValue<T>,
	// TValue = TypeOfEnumerableValue<T>
>(list: T) {
	type TKey = TypeOfEnumerableKey<T>;
	type TValue = TypeOfEnumerableValue<T>;

	// O(n); O(1) by specialization for arrays
	if (Array.isArray(list)) {
		return list as TValue[];
	}
	const it = enumerate(list);
	const arr: TValue[] = [];
	for await (const e of it) {
		arr.push(Array.isArray(e) ? e[1] : e);
	}
	return arr;
}
export function collectSync<T extends Enumerable<any, any, any>>(list: T) {
	// type TKey = TypeOfEnumerableKey<T>;
	type TValue = TypeOfEnumerableValue<T>;
	// O(n); O(1) by specialization for arrays
	if (Array.isArray(list)) {
		console.log('here');
		return list as TValue[];
	}
	const it = enumerateSync(list);
	const arr: TValue[] = [];
	for (const e of it) {
		arr.push(Array.isArray(e) ? e[1] : e);
	}
	return arr;
}

export async function* enumerate<
	T extends AnyEnumerable<T>,
	TKey = TypeOfEnumerableKey<T>,
	TValue = TypeOfEnumerableValue<T>
>(enumerable: T): AsyncGenerator<[TKey, TValue], void, void> {
	// type TKey = TypeOfEnumerableKey<T>;
	// type TValue = TypeOfEnumerableValue<T>;

	const hasEntries = typeof (enumerable as any).entries === 'function';
	const isIterable = typeof (enumerable as any)[Symbol.iterator] === 'function';

	let idx = 0;
	if (isIterable) {
		for await (const e of (enumerable as unknown) as AsyncIterable<[TKey, TValue]>) {
			yield (Array.isArray(e) ? e : [idx++, e]) as [TKey, TValue];
		}
	} else if (hasEntries) {
		const arr = ((enumerable as unknown) as any).entries() as [TKey, TValue][];
		for (const e of arr) {
			yield e;
		}
	} else {
		const arr: ObjectKey[] = Reflect.ownKeys(enumerable);
		for (const k in arr) {
			yield ([k, Reflect.get(enumerable, k)] as unknown) as [TKey, TValue];
		}
	}
}
export function* enumerateSync<
	T extends Enumerable<T>,
	TKey = TypeOfEnumerableKey<T>,
	TValue = TypeOfEnumerableValue<T>
>(enumerable: T): Generator<[TKey, TValue], void, void> {
	const hasEntries = typeof (enumerable as any).entries === 'function';
	const isIterable = typeof (enumerable as any)[Symbol.iterator] === 'function';

	let idx = 0;
	if (isIterable) {
		for (const e of (enumerable as unknown) as Iterable<[TKey, TValue]>) {
			yield (Array.isArray(e) ? e : [idx++, e]) as [TKey, TValue];
		}
	} else if (hasEntries) {
		const arr = ((enumerable as unknown) as any).entries() as [TKey, TValue][];
		for (const e of arr) {
			yield e;
		}
	} else {
		const arr: ObjectKey[] = Reflect.ownKeys(enumerable);
		for (const k in arr) {
			yield ([k, Reflect.get(enumerable, k)] as unknown) as [TKey, TValue];
		}
	}
}

// type ObjectKey = number | string; // [2021-03-27; rivy] ~ Deno/TS has poor symbol handling; see <https://github.com/microsoft/TypeScript/issues/1863>
// type EnumerableObject<K, V> = { [P in string]: V };
// type Enumerable<T> = AnyIterable<T> | EnumerableObject<T>;
// type Iterant<T> = AnyIterable<T>;
// type AnyEnumerable<T, V, K = number> = T extends AsyncIterable<V>
// 	? Enumerable<T, number, V>
// 	: Enumerable<T, V, K>;
// type AnyEnumerable<T extends AnyIterable<V> | ArrayLike<V> | MapLike<K, V>, V = void, K = void> = T;
// type Enumerable<T, K, V> = T extends Iterable<V> ? Enumerable<T, number, V> : MapLike<K, V>;
// type Enumerable<T extends (eArrayLike<V> | MapLike<K,V>), V = void, K = void> = T extends eArrayLike<
// 	V extends any ? V : never,
// 	K extends number ? number : never
// >
// type Enumerable<
// 	T extends MapLike<TK, TV> | ArrayLike<TV> | Iterable<TV>,
// 	TV = TypeOfEnumerableValue<T>,
// 	TK = TypeOfEnumerableKey<T>
// > = T;
type AnyIterable<T> = AsyncIterable<T> | Iterable<T>;
// | AsyncIterableIterator<T>
// | IterableIterator<T>;
type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
type ValueOrKeyValuePair<K, T> = T | [K, T];
// ArrayLike; ref: <https://2ality.com/2013/05/quirk-array-like-objects.html> @@ <https://archive.is/9lfox>
// type ArrayLike<T> = Array<T> | Set<T> | { [n: number]: T; length: () => number };
// type MapLike<K, V> = Map<K, V> | { entries: () => [K, V][] };
type KeyValuePair<K, V> = [K, V];
type KV<K, V> = [K, V];

export async function* iter<T>(iterable: AnyEnumerable<T>) {
	const isIterable = typeof (iterable as any)[Symbol.asyncIterator] === 'function';
	const isIterator = typeof (iterable as any).next === 'function';
	if (isIterator) {
		yield* (iterable as unknown) as AsyncGenerator<T, void, void>;
	} else if (isIterable && !(iterable instanceof String)) {
		for await (const e of (iterable as unknown) as AsyncIterable<T>) {
			yield (Array.isArray(e) ? e[1] : e) as T;
		}
	}
	// else if (iterable instanceof String) {
	// 	for await (const e of Array.from((iterable as unknown) as string)) {
	// 		yield e;
	// 	}
	// }
}
export function* iterSync<T>(iterable: Enumerable<T>) {
	const isIterable = typeof (iterable as any)[Symbol.iterator] === 'function';
	const isIterator = typeof (iterable as any).next === 'function';
	if (isIterator) {
		yield* (iterable as unknown) as Generator<T, void, void>;
	} else if (isIterable && !(iterable instanceof String)) {
		for (const e of (iterable as unknown) as Iterable<T>) {
			yield (Array.isArray(e) ? e[1] : e) as T;
		}
	}
	// else if (iterable instanceof String) {
	// 	for (const e in Array.from((iterable as unknown) as string)) {
	// 		yield e;
	// 	}
	// }
}

// // export async function collectKeys<K, T>(list: AnyEnumerable<K, T>) {
// export async function collectKeysS<T, V = void, K = void>(list: Enumerable<T>) {
// 	// if (Array.isArray(list)) {
// 	// 	const len = list.length;
// 	// 	return collectValuesSync(rangeSync(0, len));
// 	// }
// 	let idx = 0;
// 	const it = iter<T>(list);
// 	const arr: K[] = [];
// 	for await (const e of it) {
// 		arr.push(Array.isArray(e) ? (e[0] as K) : idx++);
// 	}
// 	return arr;
// }
// export function collectKeysSync<K, T>(list: Enumerable<K, T>) {
// 	if (Array.isArray(list)) {
// 		const len = list.length;
// 		return collectValuesSync(rangeSync(0, len));
// 	}
// 	let idx = 0;
// 	const it = iterSync(list);
// 	const arr: K[] | number[] = [];
// 	for (const e of it) {
// 		arr.push(Array.isArray(e) ? e[0] : idx++);
// 	}
// 	return arr;
// }

// export async function* iter<T>(enumerable: AnyEnumerable<T>) {
// 	// Iterable vs Iterator ... ref: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols> @@ <https://archive.is/njvmp>
// 	const isIterable =
// 		typeof ((enumerable as any)[Symbol.asyncIterator] || (enumerable as any)[Symbol.iterator]) ===
// 		'function';
// 	const isIterator = typeof (enumerable as any).next === 'function';
// 	if (isIterator) {
// 		yield* (enumerable as unknown) as AsyncGenerator<T | [K, T], void, void>;
// 	} else if (isIterable) {
// 		for await (const e of enumerable) {
// 			yield e as T;
// 		}
// 	} else {
// 		for (const key of Reflect.ownKeys(enumerable)) {
// 			yield [key, (enumerable as any)[key as string]] as [K, T];
// 		}
// 	}
// }

export async function* flatten<T>(
	iterable: AnyIterable<ValueOrArray<T>>
): AsyncGenerator<T, void, void> {
	for await (const e of iterable) {
		if (Array.isArray(e)) {
			const it = flatten(e);
			for await (const x of it) {
				yield x;
			}
		} else yield e;
	}
}
export function* flattenSync<T>(iterable: Iterable<ValueOrArray<T>>): Generator<T, void, void> {
	for (const e of iterable) {
		if (Array.isArray(e)) {
			const it = flattenSync(e);
			for (const x of it) {
				yield x;
			}
		} else yield e;
	}
}

export async function* flatN<T>(
	n: number,
	iterable: AnyIterable<ValueOrArray<T>>
): AsyncGenerator<ValueOrArray<T>, void, void> {
	for await (const e of iterable) {
		if (Array.isArray(e) && n > 0) {
			const it = flatN(n - 1, e);
			for await (const x of it) {
				yield x;
			}
		} else yield e;
	}
}
export function* flatNSync<T>(
	n: number,
	iterable: Iterable<ValueOrArray<T>>
): Generator<ValueOrArray<T>, void, void> {
	for (const e of iterable) {
		if (Array.isArray(e) && n > 0) {
			const it = flatNSync(n - 1, e);
			for (const x of it) {
				yield x;
			}
		} else yield e;
	}
}

// spell-checker:ignore unnest
export async function* unnest<T>(
	n: number,
	iterable: AnyIterable<ValueOrArray<T>>
): AsyncGenerator<ValueOrArray<T>, void, void> {
	yield* flatN<T>(n, iterable);
}
export function* unnestSync<T>(
	n: number,
	iterable: Iterable<ValueOrArray<T>>
): Generator<ValueOrArray<T>, void, void> {
	yield* flatNSync<T>(n, iterable);
}

export async function collectValues<T extends AnyEnumerable<T>>(list: T) {
	return collect(list);
}
export function collectValuesSync<T extends Enumerable<T>>(list: T) {
	return collectSync(list);
}

export async function collectEntries<T extends AnyEnumerable<T>>(list: T) {
	type TKey = TypeOfEnumerableKey<T>;
	type TValue = TypeOfEnumerableValue<T>;
	const en = enumerate(list);
	const arr: [TKey, TValue][] = [];
	for await (const e of en) {
		arr.push(e);
	}
	return arr;
}
export function collectEntriesSync<T extends Enumerable<T>>(list: T) {
	type TKey = TypeOfEnumerableKey<T>;
	type TValue = TypeOfEnumerableValue<T>;
	const en = enumerateSync(list);
	const arr: [TKey, TValue][] = [];
	for (const e of en) {
		arr.push(e);
	}
	return arr;
}

export async function toArray<T>(iterable: AnyEnumerable<T>) {
	return collect(iterable);
}
export function toArraySync<T>(iterable: Enumerable<T>) {
	return collectSync(iterable);
}
export async function toList<T>(iterable: AnyEnumerable<T>) {
	return collect(iterable);
}
export function toListSync<T>(iterable: Enumerable<T>) {
	return collectSync(iterable);
}

/**
 *  Map function (`(element, key) => result`) over sequence values
 */
export async function* map<T, U>(fn: (element: T) => U, iterable: AnyIterable<T>) {
	for await (const e of iterable) {
		yield fn(e);
	}
}
export function* mapSync<T, U>(fn: (element: T) => U, iterable: Iterable<T>) {
	for (const e of iterable) {
		yield fn(e);
	}
}

export async function reduce<T, U>(
	fn: (accumulator: U, element: T) => U,
	initialValue: U,
	iterable: AnyIterable<T>
) {
	let acc = initialValue;
	for await (const e of iterable) {
		acc = fn(acc, e);
	}
	return acc;
}
export function reduceSync<T, U>(
	fn: (accumulator: U, element: T) => U,
	initialValue: U,
	iterable: Iterable<T>
) {
	let acc = initialValue;
	for (const e of iterable) {
		acc = fn(acc, e);
	}
	return acc;
}

export async function* scan<T, U>(
	fn: (accumulator: U, element: T) => U,
	initialValue: U,
	iterable: AnyIterable<T>
) {
	let acc = initialValue;
	for await (const e of iterable) {
		acc = fn(acc, e);
		yield acc;
	}
}
export function* scanSync<T, U>(
	fn: (accumulator: U, element: T) => U,
	initialValue: U,
	iterable: Iterable<T>
) {
	let acc = initialValue;
	for (const e of iterable) {
		acc = fn(acc, e);
		yield acc;
	}
}

/**
 * Converts a (potentially infinite) sequence into a sequence of length `n`
 */
export async function* take<T>(n: number, iterable: AnyIterable<T>) {
	for await (const e of iterable) {
		if (n <= 0) {
			break; // closes iterable
		}
		n--;
		yield e;
	}
}
export function* takeSync<T>(n: number, iterable: Iterable<T>) {
	for (const e of iterable) {
		if (n <= 0) {
			break; // closes iterable
		}
		n--;
		yield e;
	}
}

/**
 * Drop (iterate past) firstSync `n` elements of sequence
 */
export async function* drop<T>(n: number, iterable: AnyIterable<T>) {
	for await (const e of iterable) {
		if (n <= 0) {
			yield e;
		}
		n--;
	}
}
export function* dropSync<T>(n: number, iterable: Iterable<T>) {
	for (const e of iterable) {
		if (n <= 0) {
			yield e;
		}
		n--;
	}
}

export async function* range(
	start: number,
	end: number,
	step: number = 1
): AsyncGenerator<number, void, void> {
	let idx = start;
	while (idx < end) {
		yield idx;
		idx = idx + step;
	}
}
export function* rangeSync(
	start: number,
	end: number,
	step: number = 1
): Generator<number, void, void> {
	let idx = start;
	while (idx < end) {
		yield idx;
		idx = idx + step;
	}
}

export async function* slice<T>(start: number, end: number, iterable: AnyIterable<T>) {
	let idx = 0;
	for await (const e of iterable) {
		if (idx < start) {
			idx++;
		} else if (idx < end) {
			yield e;
		}
	}
}
export function* sliceSync<T>(start: number, end: number, iterable: Iterable<T>) {
	let idx = 0;
	for (const e of iterable) {
		if (idx < start) {
			idx++;
		} else if (idx < end) {
			yield e;
		}
	}
}

export async function* zip<T, U>(iterable_0: AnyIterable<T>, iterable_1: AnyIterable<U>) {
	const it_0 = iter(iterable_0);
	const it_1 = iter(iterable_1);
	let next_0 = await it_0.next();
	let next_1 = await it_1.next();
	while (!(next_0.done || next_1.done)) {
		yield [next_0.value, next_1.value] as [T, U];
		next_0 = await it_0.next();
		next_1 = await it_1.next();
	}
}
export function* zipSync<T, U>(iterable_0: Iterable<T>, iterable_1: Iterable<U>) {
	const it_0 = iterable_0[Symbol.iterator]();
	const it_1 = iterable_1[Symbol.iterator]();
	let next_0 = it_0.next();
	let next_1 = it_1.next();
	while (!(next_0.done || next_1.done)) {
		yield [next_0.value, next_1.value] as [T, U];
		next_0 = it_0.next();
		next_1 = it_1.next();
	}
}

export async function head<T>(iterable: AnyIterable<T>) {
	const it = iter(iterable);
	const next = await it.next();
	return next.done ? undefined : next.value;
}
export function headSync<T>(iterable: Iterable<T>) {
	const it = iterable[Symbol.iterator]();
	const next = it.next();
	return next.done ? undefined : next.value;
}

export async function* tail<T>(iterable: AnyIterable<T>) {
	return drop(1, iterable);
}
export function* tailSync<T>(iterable: Iterable<T>) {
	return dropSync(1, iterable);
}

export async function first<T>(iterable: AnyIterable<T>) {
	return head(iterable);
}
export function firstSync<T>(iterable: Iterable<T>) {
	return headSync(iterable);
}

export async function last<T>(list: AnyIterable<T>) {
	// O(n) for iterators, but O(1) by specialization for arrays
	if (Array.isArray(list)) {
		return list.length > 0 ? (list[list.length - 1] as T) : undefined;
	}
	const arr = await collect(list);
	return arr.length > 0 ? arr[arr.length - 1] : undefined;
}
export function lastSync<T>(list: Iterable<T>) {
	// O(n) for iterators, but O(1) by specialization for arrays
	if (Array.isArray(list)) {
		return list.length > 0 ? (list[list.length - 1] as T) : undefined;
	}
	const arr = collectSync(list);
	return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

// ####
