// var reduce = (fn) => {
// 	return (Arr, acc) => Arr.reduce(fn, acc);
// };

// var add = reduce((acc, x) => acc + x);

// const x = add([1, 2, 3], 0); // -> 6

// console.log({ x });

import * as F from '../../src/fn.ts'; // spell-checker:ignore unnest
import * as R from 'https://deno.land/x/ramda@v0.27.2/mod.ts';

// const z = await F.collect(F.zip(F.range(10, Infinity), ['a', 'bb', 'ccc', 'dddd']));
const z = await F.collect(F.enumerate(new Map()));
const flatZ = await F.collect(F.flatten(z));
console.log({ z, flatZ });
const mm = new Map([
	['a', 1],
	['b', 20],
]);
const zz = await F.collect(F.enumerate(mm));
const flatZZ = await F.collect(F.flatten(zz));
console.log({ mm, zz, flatZZ });

const y = [1, [2, [3, 4], [5, 6], 7], [8, 9], [[10, [11, 12]], 13]];

const flatY = F.collectSync(F.flattenSync(y));
const unNestY1 = await F.collect(F.unnest(1, y));
const unNestY2 = await F.collect(F.unnest(2, y));
console.log({ y, flatY, unNestY1, unNestY2, last: F.lastSync(flatY) });
console.log({
	flatY,
	reduce: F.reduceSync((acc, e) => acc + e, 0, flatY),
	scan: F.collectSync(F.scanSync((acc, e) => acc + e, 0, flatY)),
});

const double = (x: number) => x + x;
const m = new Map([
	['x', 1],
	['y', 2],
]);
const sbl = Symbol('unique');
let o = { 1: 'one', 2: 'two', sym: 10, [sbl]: 'symbol-here' };
const set = new Set(['one', 2, 'help', {}]);
const str = 'a string';
const aa = await F.collect(F.map(double, m.values()));
console.log({ m, aa });

const b = R.map(double, await F.toArray(F.flatten(y)));
console.log({ b });

const a = y;
console.log({
	a,
	collect: await F.collect(a),
	entry: await F.collectEntries(a),
	keys: await F.collectKeys(a),
	vals: await F.collectValues(a),
	first: await F.first(a),
});
console.log({
	m,
	collect: await F.collect(m),
	entry: await F.collectEntries(m),
	keys: await F.collectKeys(m),
	vals: await F.collectValues(m),
	first: await F.first(m),
});
console.log({
	o,
	collectEnum: await F.collect(F.enumerate(o)),
	entry: await F.collectEntries(o),
	keys: await F.collectKeys(o),
	vals: await F.collectValues(o),
	// first: await F.first(o),
});
console.log({
	set,
	collectEnum: await F.collect(F.enumerate(set)),
	entry: await F.collectEntries(set),
	keys: await F.collectKeys(set),
	vals: await F.collectValues(set),
	first: await F.first(set),
});

// problems: first() is not working; collecting/enumerating for objects is faulty for non-numeric keys and sets show duplicate values
