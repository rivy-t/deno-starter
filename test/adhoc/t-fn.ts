// var reduce = (fn) => {
// 	return (Arr, acc) => Arr.reduce(fn, acc);
// };

// var add = reduce((acc, x) => acc + x);

// const x = add([1, 2, 3], 0); // -> 6

// console.log({ x });

import * as F from '../../src/fn.ts'; // spell-checker:ignore unnest
import type { ValueOrArray } from '../../src/fn.ts'; // spell-checker:ignore unnest
import * as R from 'https://deno.land/x/ramda@v0.27.2/mod.ts';

const double = (x: number) => x + x;
const sum = (acc: number, x: number) => acc + x;

// function sumGeneric<T extends number | string>(acc: T, e: T) {
// 	return acc + e;
// }

// const z = await F.collect(F.zip(F.range(10, Infinity), ['a', 'bb', 'ccc', 'dddd']));
const z = await F.collect(F.enumerate(new Map()));
const flatZ = await F.collect(F.flatten(z));
console.log({ z, flatZ });
const m1 = new Map([
	['a', 1],
	['b', 20],
]);
const e_m1 = await F.collect(F.enumerate(m1));
const z_m1 = await F.collect(F.zip(F.range(10, Infinity), m1));
const flat_e_m1 = await F.collect(F.flatten(e_m1));
const flat_z_m1 = await F.collect(F.flatten(z_m1));
console.log({ m1, e_m1, z_m1, flat_e_m1, flat_z_m1 });

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

const mInitArrayOfTuples: [string, number][] = [
	['x', 1],
	['y', 2],
	['z', 30],
];
const m = new Map(mInitArrayOfTuples);
const m_entries = F.collectEntriesSync(m);
const m_entries_ToMap = F.collectToMapSync(m_entries);
const sbl = Symbol('unique');
let o = { 1: 'one', 2: 'two', sym: 10, [sbl]: 'symbol-here' };
const set = new Set(['one', 2, 'help', {}]);
const str = 'a string with 丝😃';
const double_m = await F.collect(F.map(double, m));
const double_mKV = await F.collect(F.mapKV(double, m));
const double_mKV_newMap = new Map(double_mKV);
const double_mKV_asMap = await F.collectToMap(F.mapKV(double, m));
console.log({
	m,
	m_entries,
	m_entries_ToMap,
	double_m,
	double_mKV,
	double_mKV_newMap,
	double_mKV_asMap,
});

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
	lastN3: await F.lastN(3, a),
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
	lastN3: await F.lastN(3, m),
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
	lastN3: await F.lastN(3, o),
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
	lastN3: await F.lastN(3, set),
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
	lastN3: await F.lastN(3, str),
});

// problems: first() is not working; collecting/enumerating for objects is faulty for non-numeric keys and sets show duplicate values
