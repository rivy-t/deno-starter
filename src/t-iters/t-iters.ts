// spell-checker:ignore iterplus

// ref: <https://exploringjs.com/es6/ch_iteration.html>
// ref: <https://2ality.com/2016/10/asynchronous-iteration.html>

import { iterplus as itPlus } from 'https://deno.land/x/iterplus@v2.3.0/index.ts';
import { Lazy } from 'https://deno.land/x/lazy@v1.7.2/lib/mod.ts';

// ref: <https://github.com/Aplet123/iterplus>
function itpLongestCommonPrefix(list: Iterable<string>) {
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

// ref: <https://stackoverflow.com/a/48293566/43774> , <https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function>
function* zip<T>(...iterables: Iterable<T>[]): Iterable<T[]> {
	if (!iterables.length) return;
	const iterators = iterables.map((i) => i[Symbol.iterator]());
	while (true) {
		const results = iterators.map((iter) => iter.next());
		if (results.some((res) => res.done)) return;
		else yield results.map((res) => res.value);
	}
}
function lazyLongestCommonPrefix(list: Iterable<string>) {
	return Lazy.from(zip(...list))
		.where((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.select((NthChars) => NthChars[0])
		.toArray()
		.join('');
}

const data = ['flowery', 'floral', 'flux', 'flannel'];

console.log('itpLongestCommonPrefix', itpLongestCommonPrefix(data));
console.log('lazyLongestCommonPrefix', lazyLongestCommonPrefix(data));
console.log('itpLongestCommonPrefix', itpLongestCommonPrefix([]));
console.log('lazyLongestCommonPrefix', lazyLongestCommonPrefix([]));

async function* asyncList(list: string[]) {
	for (let idx = 0; idx < list.length; idx++) {
		yield list[idx];
	}
}

// console.log('lazyLongestCommonPrefix', lazyLongestCommonPrefix(asyncList(data)));
