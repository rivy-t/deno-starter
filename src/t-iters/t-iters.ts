// spell-checker:ignore iterplus

import { iterplus as itPlus } from 'https://deno.land/x/iterplus@v2.3.0/index.ts';
import { Lazy } from 'https://deno.land/x/lazy@v1.7.2/lib/mod.ts';

// ref: <https://github.com/Aplet123/iterplus>
function itpLongestCommonPrefix(list: string[]) {
	if (list.length == 0) return [];
	if (list.length < 2) return [list[0]];
	return itPlus(list[0])
		.zip(...list.slice(1))
		.takeWhile((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.map((NthChars) => NthChars[0])
		.collect()
		.join('');
}

// ref: <https://stackoverflow.com/a/48293566/43774> , <https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function>
function* zip<T>(...iterables: Iterable<T>[]) {
	const iterators = iterables.map((i) => i[Symbol.iterator]());
	while (true) {
		const results = iterators.map((iter) => iter.next());
		if (results.some((res) => res.done)) return;
		else yield results.map((res) => res.value);
	}
}
function lazyLongestCommonPrefix(list: string[]) {
	if (list.length == 0) return [];
	if (list.length < 2) return [list[0]];
	return Lazy.from(zip(...list))
		.where((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.select((NthChars) => NthChars[0])
		.toArray()
		.join('');
}

const data = ['flowery', 'floral', 'flux', 'flannel'];

console.log('itpLongestCommonPrefix', itpLongestCommonPrefix(data));
console.log('lazyLongestCommonPrefix', lazyLongestCommonPrefix(data));
