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
const a = R.map(double, R.fromPairs(Array.from(m)));
console.log({ m, a });

const b = R.map(double, await F.toArray(F.flatten(y)));
console.log({ b });
