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

// note: Iterable<T>, by ECMA2020 default, includes Array<T>, ArrayLike<T>, Map<K,T>, Set<T>, and String
type ObjectKey = number | string | symbol;
// type ObjectKey = number | string; // [2021-03-27; rivy] ~ Deno/TS has poor symbol handling; see <https://github.com/microsoft/TypeScript/issues/1863>
type Object<K extends ObjectKey, T> = { [P in K]: T };
// type Enumerable<T> = AnyIterable<T> | Object<T>;
// type Iterant<T> = AnyIterable<T>;
type AnyEnumerable<T> = AsyncIterable<T> | Enumerable<T>;
type Enumerable<T> = Iterable<T> | Object<ObjectKey, T>;
type AnyIterable<T> = AsyncIterable<T> | Iterable<T>;
// | AsyncIterableIterator<T>
// | IterableIterator<T>;
type ValueOrArray<T> = T | Array<ValueOrArray<T>>;

const symbolAsyncIterator = Symbol.asyncIterator;
const symbolIterator = Symbol.iterator;
const isPromise = (value: any) => value != null && typeof value.then == 'function';
const isObject = (value: any) => {
	if (typeof value === 'undefined' || value === null) {
		return false;
	}
	const typeofValue = typeof value;
	return typeofValue == 'object' || typeofValue == 'function';
};

export async function* iter<T>(iterable: AnyIterable<T>) {
	// export async function* iter<T>(iterable: AnyEnumerable<T>) {
	// if (typeof (iterable as any).next === 'function') {
	// 	yield* (iterable as any) as AsyncIterator<T, void, void>;
	// } else if (typeof (iterable as any)[Symbol.asyncIterator] === 'function') {
	// 	for await (const e of (iterable as any) as AsyncIterator<T, void, void>) {
	// 		yield e;
	// 	}
	// } else {
	// 	for (const key of Reflect.ownKeys(iterable)) {
	// 		yield [key, iterable[key as string]];
	// 	}
	// }
	for await (const e of iterable) {
		yield e;
	}
}
export function* iterSync<T>(iterable: Iterable<T>) {
	// export function* iterSync<T>(iterable: Enumerable<T>) {
	// if (typeof (iterable as any).next === 'function') {
	// 	yield* (iterable as unknown) as Iterator<T, void, void>;
	// } else if (typeof (iterable as any)[Symbol.iterator] === 'function') {
	// 	for (const e of (iterable as unknown) as Iterator<T, void, void>) {
	// 		yield e;
	// 	}
	// } else {
	// 	for (const key of Reflect.ownKeys(iterable)) {
	// 		yield [key, iterable[key as string]];
	// 	}
	// }
	for (const e of iterable) {
		yield e;
	}
}

export function* toIterator<T>(obj: Object<ObjectKey, T>): Generator<[ObjectKey, T], void, void> {
	// if (typeof obj.next === 'function') {
	// 	yield* (obj as unknown) as Iterator<T>;
	// } else {
	for (const key of Reflect.ownKeys(obj)) {
		yield [key, obj[key as string]];
	}
	// }
}

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

/**
 *  Collect all sequence values into a promised array (`Promise<T[]>`)
 */
export async function collect<T>(list: AnyIterable<T>) {
	// O(n); O(1) by specialization for arrays
	if (Array.isArray(list)) {
		return list as T[];
	}
	// const it =
	// 	typeof (list as any).next === 'function' ? list : toIterator(list as Object<ObjectKey, T>);
	const it = list;
	const arr: T[] = [];
	for await (const e of it) {
		arr.push(e);
	}
	return arr;
}
export function collectSync<T>(list: Iterable<T>) {
	// O(n); O(1) by specialization for arrays
	if (Array.isArray(list)) {
		console.log('here');
		return list as T[];
	}
	// const it = typeof (list as any).next === 'function' ? list : toIterator(list);
	const it = list;
	// const it = iter(list);
	const arr: T[] = [];
	for (const e of it) {
		arr.push(e);
	}
	return arr;
}

export async function toArray<T>(iterable: AnyIterable<T>) {
	return collect(iterable);
}
export function toArraySync<T>(iterable: Iterable<T>) {
	return collectSync(iterable);
}
export async function toList<T>(iterable: AnyIterable<T>) {
	return collect(iterable);
}
export function toListSync<T>(iterable: Iterable<T>) {
	return collectSync(iterable);
}

export function enumerate<T>(iterable: AnyIterable<T>) {
	return zip(range(0, Infinity), iterable);
}
export function enumerateSync<T>(iterable: Iterable<T>) {
	return zipSync(rangeSync(0, Infinity), iterable);
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
	let idx = 0;
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

export async function* range<T>(start: number, end: number, step: number = 1) {
	let idx = start;
	while (idx < end) {
		yield idx;
		idx = idx + step;
	}
}
export function* rangeSync<T>(start: number, end: number, step: number = 1) {
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
	return head<T>(iterable);
}
export function firstSync<T>(iterable: Iterable<T>) {
	return headSync<T>(iterable);
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
		console.log('here');
		return list.length > 0 ? (list[list.length - 1] as T) : undefined;
	}
	const arr = collectSync<T>(list);
	return arr.length > 0 ? arr[arr.length - 1] : undefined;
}
