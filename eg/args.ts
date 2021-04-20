import * as Me from '../src/lib/me.ts';
import * as Parse from '../src/lib/parse.ts';

console.log('processInfo:', Me.info());

// type ValueOrIterableIterator<T> =
// 	| T
// 	| IterableIterator<ValueOrIterableIterator<T>>
// 	| AsyncIterableIterator<ValueOrIterableIterator<T>>;

// async function collect<T>(
// 	it: AsyncIterableIterator<ValueOrIterableIterator<T>>,
// );

async function* argvList(
	list: (string | IterableIterator<string> | AsyncIterableIterator<string>)[],
) {
	for (const vs of list) {
		for await (const v of vs) {
			yield v;
		}
	}
}

// function isIterable(obj: unknown) {
// 	// checks for null and undefined
// 	if (obj == null) {
// 		return false;
// 	}
// 	// deno-lint-ignore no-explicit-any
// 	return typeof (obj as any)[Symbol.iterator] === 'function';
// }

// export type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
// export type ValueOrIter<T> = T | Iterable<ValueOrIter<T>>;
// export type ValueOrAnyIter<T> = T | Iterable<ValueOrAnyIter<T>> | AsyncIterable<ValueOrAnyIter<T>>;
// type ValueOrKeyValuePair<K, T> = T | [K, T];
// // ArrayLike; ref: <https://2ality.com/2013/05/quirk-array-like-objects.html> @@ <https://archive.is/9lfox>
// // type ArrayLike<T> = Array<T> | Set<T> | { [n: number]: T; length: () => number };
// // type MapLike<K, V> = Map<K, V> | { entries: () => [K, V][] };
// type KeyValuePair<K, V> = [K, V];
// type KV<K, V> = [K, V];

// type AnyIterable<T> = AsyncIterable<T> | Iterable<T>;
// type AnyIterableIterator<T> = AsyncIterableIterator<T> | IterableIterator<T>;
// type AnyIterator<T> = AsyncIterator<T> | Iterator<T>;

// export async function* flatten<T>(
// 	iterable: AnyIterable<ValueOrAnyIter<T>>,
// ): AsyncGenerator<T, void, unknown> {
// 	for await (const e of iterable) {
// 		if (isIterable(e)) {
// 			const it = flatten(e as AnyIterable<ValueOrAnyIter<T>>);
// 			for await (const x of it) {
// 				yield x;
// 			}
// 		} else yield e as T;
// 	}
// }
// export function* flattenSync<T>(
// 	iterable: Iterable<ValueOrAnyIter<T>>,
// ): Generator<T, void, unknown> {
// 	for (const e of iterable) {
// 		if (isIterable(e)) {
// 			const it = flattenSync(e as Iterable<ValueOrAnyIter<T>>);
// 			for (const x of it) {
// 				yield x;
// 			}
// 		} else yield e as T;
// 	}
// }

async function* transform<T>(generatorList: (AsyncGenerator<T> | Generator<T>)[]) {
	for (const gen of generatorList) {
		for await (const e of gen) {
			yield e;
		}
	}
}
function* transformSync<T>(generatorList: Generator<T>[]) {
	for (const gen of generatorList) {
		for (const e of gen) {
			yield e;
		}
	}
}

const args = Me.info().ARGS;
const argv = Parse.splitByShiftBareWS(args || '')
	.flatMap(Parse.braceExpand)
	.map(Parse.tildeExpand)
	.map(Parse.filenameExpandSync);

// const argvIt = Parse.splitByShiftBareWS(args || '')
// 	.flatMap(Parse.braceExpand)
// 	.map(Parse.tildeExpand)
// 	.flatMap(Parse.filenameExpandSync);
// const argvL = [];
// for (const gen of argvIt) for (const v of gen) argvL.push(v);
// console.log({ args, argv, argvL });

console.log({ args, argv });
