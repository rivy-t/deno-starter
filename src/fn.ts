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
// see Foldable<T> from 'rubico'
// * ref: <https://github.com/a-synchronous/rubico/issues/179>
// * ref: <https://github.com/a-synchronous/rubico/blob/master/_internal/iteratorFind.js>
// * ref: <https://github.com/a-synchronous/rubico/blob/master/_internal/asyncIteratorFind.js>
// * ref: <https://github.com/a-synchronous/rubico/blob/master/x/find.js>

export async function* from<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	for await (const e of iterable) {
		yield e;
	}
}
export function* fromSync<T>(iterable: Iterable<T>) {
	for (const e of iterable) {
		yield e;
	}
}

type ValueOrArray<T> = T | Array<ValueOrArray<T>>;

export async function* flatten<T>(
	iterable: AsyncIterable<ValueOrArray<T>> | Iterable<ValueOrArray<T>>
): AsyncGenerator<T, void, unknown> {
	for await (const e of iterable) {
		if (Array.isArray(e)) {
			const it = flatten(e);
			for await (const x of it) {
				yield x;
			}
		} else yield e;
	}
}
export function* flattenSync<T>(iterable: Iterable<ValueOrArray<T>>): Generator<T, void, unknown> {
	for (const e of iterable) {
		if (Array.isArray(e)) {
			const it = flattenSync(e);
			for (const x of it) {
				yield x;
			}
		} else yield e;
	}
}

// spell-checker:ignore unnest
export async function* unnest<T>(
	n: number,
	iterable: AsyncIterable<ValueOrArray<T>> | Iterable<ValueOrArray<T>>
): AsyncGenerator<ValueOrArray<T>, void, unknown> {
	for await (const e of iterable) {
		if (Array.isArray(e) && n > 0) {
			const it = unnest(n - 1, e);
			for await (const x of it) {
				yield x;
			}
		} else yield e;
	}
}
export function* unnestSync<T>(
	n: number,
	iterable: Iterable<ValueOrArray<T>>
): Generator<ValueOrArray<T>, void, unknown> {
	for (const e of iterable) {
		if (Array.isArray(e) && n > 0) {
			const it = unnestSync(n - 1, e);
			for (const x of it) {
				yield x;
			}
		} else yield e;
	}
}

/**
 *  Collect all sequence values into a promised array (`Promise<T[]>`)
 */
export async function collect<T>(list: AsyncIterable<T> | Iterable<T>) {
	// O(n); O(1) by specialization for arrays
	if (Array.isArray(list)) {
		return list as T[];
	}
	const arr: T[] = [];
	for await (const e of list) {
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
	const arr: T[] = [];
	for (const e of list) {
		arr.push(e);
	}
	return arr;
}

export async function toArray<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	return collect(iterable);
}
export function toArraySync<T>(iterable: Iterable<T>) {
	return collectSync(iterable);
}
export async function toList<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	return collect(iterable);
}
export function toListSync<T>(iterable: Iterable<T>) {
	return collectSync(iterable);
}

export function enumerate<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	return zip(range(0, Infinity), iterable);
}
export function enumerateSync<T>(iterable: Iterable<T>) {
	return zipSync(rangeSync(0, Infinity), iterable);
}

/**
 *  Map function (`(element, index) => result`) over sequence values
 */
export async function* map<T, U>(
	fn: (element: T, index: number) => U,
	iterable: AsyncIterable<T> | Iterable<T>
) {
	let idx = 0;
	for await (const e of iterable) {
		yield fn(e, idx);
	}
}
export function* mapSync<T, U>(fn: (element: T, index: number) => U, iterable: Iterable<T>) {
	let idx = 0;
	for (const e of iterable) {
		yield fn(e, idx);
	}
}

export async function reduce<T, U>(
	fn: (accumulator: U, element: T, index: number) => U,
	initialValue: U,
	iterable: AsyncIterable<T> | Iterable<T>
) {
	let acc = initialValue;
	let idx = 0;
	for await (const e of iterable) {
		acc = fn(acc, e, idx);
	}
	return acc;
}
export function reduceSync<T, U>(
	fn: (accumulator: U, element: T, index: number) => U,
	initialValue: U,
	iterable: Iterable<T>
) {
	let acc = initialValue;
	let idx = 0;
	for (const e of iterable) {
		acc = fn(acc, e, idx);
	}
	return acc;
}

export async function* scan<T, U>(
	fn: (accumulator: U, element: T, index: number) => U,
	initialValue: U,
	iterable: AsyncIterable<T> | Iterable<T>
) {
	let acc = initialValue;
	let idx = 0;
	for await (const e of iterable) {
		acc = fn(acc, e, idx);
		yield acc;
	}
}
export function* scanSync<T, U>(
	fn: (accumulator: U, element: T, index: number) => U,
	initialValue: U,
	iterable: Iterable<T>
) {
	let acc = initialValue;
	let idx = 0;
	for (const e of iterable) {
		acc = fn(acc, e, idx);
		yield acc;
	}
}

/**
 * Converts a (potentially infinite) sequence into a sequence of length `n`
 */
export async function* take<T>(n: number, iterable: AsyncIterable<T> | Iterable<T>) {
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
export async function* drop<T>(n: number, iterable: AsyncIterable<T> | Iterable<T>) {
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

export async function* slice<T>(
	start: number,
	end: number,
	iterable: AsyncIterable<T> | Iterable<T>
) {
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

export async function* zip<T, U>(
	iterable_0: AsyncIterable<T> | Iterable<T>,
	iterable_1: AsyncIterable<U> | Iterable<U>
) {
	const it_0 = from(iterable_0);
	const it_1 = from(iterable_1);
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

export async function head<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	const it = from(iterable);
	const next = await it.next();
	return next.done ? undefined : next.value;
}
export function headSync<T>(iterable: Iterable<T>) {
	const it = iterable[Symbol.iterator]();
	const next = it.next();
	return next.done ? undefined : next.value;
}

export async function* tail<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	return drop(1, iterable);
}
export function* tailSync<T>(iterable: Iterable<T>) {
	return dropSync(1, iterable);
}

export async function first<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	return head<T>(iterable);
}
export function firstSync<T>(iterable: Iterable<T>) {
	return headSync<T>(iterable);
}

export async function last<T>(list: AsyncIterable<T> | Iterable<T>) {
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

export function f<T>(list: AsyncIterable<T> | Iterable<T> | Map<any, any> | Object) {
	if (typeof list === 'undefined' || list === null) {
		return [] as T[];
	}
	if (typeof (list as any)[symbolIterator] === 'function') {
		return list.next();
	}
	if (typeof (list as any)[symbolAsyncIterator] === 'function') {
		return;
	}
}
