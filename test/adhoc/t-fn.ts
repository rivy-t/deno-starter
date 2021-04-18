// var reduce = (fn) => {
// 	return (Arr, acc) => Arr.reduce(fn, acc);
// };

// var add = reduce((acc, x) => acc + x);

// const x = add([1, 2, 3], 0); // -> 6

// console.log({ x });

import * as R from 'https://deno.land/x/ramda@v0.27.2/mod.ts';
import * as F from '../../src/funk.ts'; // spell-checker:ignore unnest
import type { ValueOrArray } from '../../src/funk.ts'; // spell-checker:ignore unnest

const double = (x: number) => x + x;
const sum = (acc: number, x: number) => acc + x;
const concat = (acc: string, s: string) => acc + s;

const isPrime = (n: number) => {
	for (let i = 2, s = Math.sqrt(n); i <= s; i++) if (n % i === 0) return false;
	return n > 1;
};

// function sumGeneric<T extends number | string>(acc: T, e: T): T;
// // deno-lint-ignore no-explicit-any
// function sumGeneric(acc: any, e: any) {
// 	return acc + e;
// }

const z = await F.collect(F.zip(F.range(10, Infinity), ['a', 'bb', 'ccc', 'dddd']));
// const z = await F.collect(F.enumerate(new Map()));
const flatZ = await F.collect(F.flatten(z));
console.log({ z, flatZ });
const m1 = new Map([['a', 1], ['b', 20]]);
const mE1 = await F.collect(F.enumerate(m1));
const mZ1 = await F.collect(F.zip(F.range(10, Infinity), m1));
const mFlatE1 = await F.collect(F.flatten(mE1));
const mFlatZ1 = await F.collect(F.flatten(mZ1));
console.log({ m1, mE1, mZ1, mFlatE1, mFlatZ1 });

const y: ValueOrArray<number>[] = [1, [2, [3, 4], [5, 6], 7], [8, 9], [[10, [11, 12]], 13]];

const flatY = F.collectSync(F.flattenSync(y));
const unNestY1 = await F.collect(F.unnest(1, y));
const unNestY2 = await F.collect(F.unnest(2, y));
console.log({ y, flatY, unNestY1, unNestY2, last: F.lastSync(flatY) });
console.log({
	flatY,
	reduce: F.reduceSync(sum, 0, flatY),
	scan: F.collectSync(F.scanSync(sum, 0, flatY)),
});

const mInitArrayOfTuples: [string, number][] = [['x', 1], ['y', 2], ['z', 30]];
const m = new Map(mInitArrayOfTuples);
const mEntries = F.collectEntriesSync(m);
const mEntriesToMap = F.collectToMapSync(mEntries);
const sbl = Symbol('unique');
const o: F.MapLikeObject<F.ObjectKey, number | string> = {
	1: 'one',
	2: 'two',
	sym: 10,
	[sbl]: 'symbol-here',
};
// const set = new Set<string | number | {}>(['one', 2, 'help', {}]);
// const set = new Set(['one', 2, 'help', {}]);
const set = new Set(['one', 2, 'help']);
const str = 'a string with 丝😃';
const mDouble = await F.collect(F.map(double, m));
const mDoubleKV = await F.collect(F.mapKV(double, m));
const mDoubleKVToNewMap = new Map(mDoubleKV);
const mDoubleKVToMap = await F.collectToMap(F.mapKV(double, m));
console.log({ m, mEntries, mEntriesToMap, mDouble, mDoubleKV, mDoubleKVToNewMap, mDoubleKVToMap });

const b = R.map(double, await F.collectToArray(F.flatten(y)));
console.log({ b });

const a = y;
console.log({
	a,
	collect: await F.collect(a),
	entries: await F.collectEntries(a),
	keys: await F.collectKeys(a),
	values: await F.collectValues(a),
	first: await F.first(a),
	tail: await F.collect(F.tail(a)),
	last: await F.last(a),
	firstN3: await F.collect(F.firstN(3, a)),
	take2: await F.collect(F.take(2, a)),
	drop2: await F.collect(F.drop(2, a)),
	lastN3: await F.collect(F.lastN(3, a)),
});
console.log({
	m,
	collect: await F.collect(m),
	entries: await F.collectEntries(m),
	keys: await F.collectKeys(m),
	values: await F.collectValues(m),
	first: await F.first(m),
	tail: await F.collect(F.tail(m)),
	last: await F.last(m),
	firstN3: await F.collect(F.firstN(3, m)),
	take2: await F.collect(F.take(2, m)),
	drop2: await F.collect(F.drop(2, m)),
	lastN3: await F.collect(F.lastN(3, m)),
});
console.log({
	o,
	collectEnum: await F.collect(F.enumerate(o)),
	entries: await F.collectEntries(o),
	keys: await F.collectKeys(o),
	values: await F.collectValues(o),
	first: await F.first(o),
	tail: await F.collect(F.tail(o)),
	last: await F.last(o),
	firstN3: await F.collect(F.firstN(3, o)),
	take2: await F.collect(F.take(2, o)),
	drop2: await F.collect(F.drop(2, o)),
	lastN3: await F.collect(F.lastN(3, o)),
});
console.log({
	set,
	collectEnum: await F.collect(F.enumerate(set)),
	entries: await F.collectEntries(set),
	keys: await F.collectKeys(set),
	values: await F.collectValues(set),
	first: await F.first(set),
	tail: await F.collect(F.tail(set)),
	last: await F.last(set),
	firstN3: await F.collect(F.firstN(3, set)),
	take2: await F.collect(F.take(2, set)),
	drop2: await F.collect(F.drop(2, set)),
	lastN3: await F.collect(F.lastN(3, set)),
});
console.log({
	str,
	collectEnum: await F.collect(F.enumerate(str)),
	entries: await F.collectEntries(str),
	keys: await F.collectKeys(str),
	values: await F.collectValues(str),
	first: await F.first(str),
	tail: await F.collect(F.tail(str)),
	last: await F.last(str),
	firstN3: await F.collect(F.firstN(3, str)),
	take2: await F.collect(F.take(2, str)),
	drop2: await F.collect(F.drop(2, str)),
	lastN3: await F.collect(F.lastN(3, str)),
	scanConcat: await F.collect(F.scan(concat, '', str)),
});

console.log(await F.collect(F.take(10, F.range(100, 0, 0))));

const allPositiveIntegers = () => F.range(0, Infinity);
const primesOf = <T extends F.Enumerable<T>>(en: T) => F.filter(isPrime, en);

const p = primesOf(allPositiveIntegers());

const firstPrime = await F.head(p);
const next10primes = F.take(10, p);
const andNext10primes = F.take(10, p);
// let result = await F.collect(first10primes);

console.log({
	first: firstPrime,
	then10: await F.collect(next10primes),
	next10: await F.collect(andNext10primes),
});

// result = await F.collect(F.take(10, primes));

// console.log(await F.collect(F.take(10, primes)));

// console.log({ result });

const RPrimes = R.filter(isPrime, R.range(0, 100));
const R10primes = R.take(10, RPrimes);
const RNext10primes = R.take(10, RPrimes);

console.log({ R10primes, RNext10primes });

// const RNext10primes = R.take(10, RPrimes);

// console.log({ RNext10primes });
