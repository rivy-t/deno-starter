import rubico from 'https://unpkg.com/rubico/es.js';
import * as F from '../../src/fn.ts';

const {
	pipe,
	fork,
	assign,
	tap,
	tryCatch,
	switchCase,
	map,
	filter,
	reduce,
	transform,
	flatMap,
	any,
	all,
	and,
	or,
	not,
	eq,
	gt,
	lt,
	gte,
	lte,
	get,
	pick,
	omit,
} = rubico;

const iterables = [
	[1, 2, 3, 4, 5],
	'12345',
	new Set([1, 2, 3, 4, 5]),
	new Uint8Array([1, 2, 3, 4, 5]),
	{ a: 1, b: 2, c: 3, d: 4, e: 5 },
	// new Map([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]), // try uncommenting this. Why does this break?
];

function identity<T>(x: T) {
	return x;
}

const square = (x: number) => {
	// if (Array.isArray(x)) return map(square)(x) // uncommenting this may fix the issue
	return x ** 2;
};

map(
	pipe([
		fork({ original: identity, squared: map(square) }),
		({ original, squared }: { original: number; squared: number }) => {
			console.log('squared:', original, '->', squared);
		},
	]),
)(iterables);

// from: <https://www.youtube.com/watch?v=jmPZztKIFf4&t=2860s>
function compose<A extends any[], B, C>(f: (...args: A) => B, g: (arg: B) => C) {
	return (...args: A) => g(f(...args));
}
const zip = <T, U>(a: T[], b: U[]) => a.map((_, i) => [a[i], b[i]] as const);
const newMap = <K, V>(entries: (readonly [K, V])[]) => new Map(entries);
const arraysToMap = compose(zip, newMap);

declare const keys: string[];
declare const elements: number[];

let mapping = arraysToMap(keys, elements);
