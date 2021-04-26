// spell-checker:ignore iterplus

// ref: <https://exploringjs.com/es6/ch_iteration.html>
// ref: <https://2ality.com/2016/10/asynchronous-iteration.html>

import { iterplus as itPlus } from 'https://deno.land/x/iterplus@v2.3.0/index.ts';
import { Lazy } from 'https://deno.land/x/lazy@v1.7.2/lib/mod.ts';

// ref: <https://github.com/Aplet123/iterplus>
export function itpLongestCommonPrefix(list: Iterable<string>) {
	const itList = itPlus(list).collect();
	if (itList.length == 0) return '';
	if (itList.length == 1) return itList[0];
	return itPlus(itList[0])
		.zip(...itList.slice(1))
		.takeWhile((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.map((NthChars) => NthChars[0])
		.collect()
		.join('');
}

export function isAsyncIter(obj: unknown): obj is AsyncIterator<unknown> {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		// deno-lint-ignore no-explicit-any
		typeof (obj as any).next === 'function'
	);
}
export function canAsyncIter(obj: unknown): obj is AsyncIterable<unknown> {
	return (
		typeof obj === 'object' && obj !== null && Symbol.asyncIterator in obj
	);
}

export async function* asyncIt<T>(it: AsyncIterable<T> | Iterable<T>): AsyncIterable<T> {
	if (canAsyncIter(it)) return it;
	for (const e of it) {
		yield e;
	}
}

// ref: <https://stackoverflow.com/a/48293566/43774> , <https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function>
export async function* zip<T>(
	...iterables: (Iterable<T> | AsyncIterable<T>)[]
): AsyncIterable<T[]> {
	if (!iterables.length) return;
	const iterators = iterables.map((iterable) => asyncIt(iterable)[Symbol.asyncIterator]());
	while (true) {
		const results = await Promise.all(iterators.map((it) => it.next()));
		if (results.some((res) => res.done)) return;
		else yield results.map((res) => res.value);
	}
}
export function* zipSync<T>(...iterables: Iterable<T>[]): Iterable<T[]> {
	if (!iterables.length) return;
	const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());
	while (true) {
		const results = iterators.map((it) => it.next());
		if (results.some((res) => res.done)) return;
		else yield results.map((res) => res.value);
	}
}

export function lazyLongestCommonPrefixSync(list: Iterable<string>) {
	return Lazy.from(zipSync(...list))
		.where((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.select((NthChars) => NthChars[0])
		.toArray()
		.join('');
}

export async function lazyLongestCommonPrefix(list: Iterable<string> | AsyncIterable<string>) {
	const itList = await (async () => {
		if (!isAsyncIter(list)) return list as Iterable<string>;
		const a: string[] = [];
		for await (const e of list) {
			a.push(e);
		}
		return a;
	})();
	return Lazy.from(zipSync(...itList))
		.where((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.select((NthChars) => NthChars[0])
		.toArray()
		.join('');
}

// if (Deno.mainModule === import.meta.url) {
if (import.meta.main) {
	const data = ['flowery', 'floral', 'flux', 'flannel'];
	console.log('itpLongestCommonPrefix', itpLongestCommonPrefix(data));
	console.log('lazyLongestCommonPrefixSync', lazyLongestCommonPrefixSync(data));
	console.log('lazyLongestCommonPrefix', await lazyLongestCommonPrefix(data));
	console.log('lazyLongestCommonPrefix', await lazyLongestCommonPrefix(asyncIt(data)));
	console.log('itpLongestCommonPrefix', itpLongestCommonPrefix([]));
	console.log('lazyLongestCommonPrefixSync', lazyLongestCommonPrefixSync([]));
	console.log('lazyLongestCommonPrefix', await lazyLongestCommonPrefix([]));
}
