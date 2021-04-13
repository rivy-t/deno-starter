import { assert } from 'https://deno.land/std@0.92.0/testing/asserts.ts';

import Schema, { string, number, array, unknown } from 'http://esm.sh/computed-types@1.6.0';
// import type { SchemaValidatorFunction, SchemaReturnType } from 'http://esm.sh/computed-types@1.6.0';

type ValidatorType = unknown;
const isOfType = (s: ValidatorType, value: unknown) => {
	// deno-lint-ignore no-explicit-any
	return (s as any).destruct()(value);
};

import * as Parse from '../src/lib/parse.ts';

const e = new TextEncoder();

Deno.test('parse', () => {
	Deno.writeAllSync(Deno.stdout, e.encode('['));

	let result;

	Deno.writeAllSync(Deno.stdout, e.encode('.'));
	result = isOfType(unknown.array().of(string).max(0), Parse.splitByBareWS(''));
	// console.warn({ result });
	assert(result[1]);

	Deno.writeAllSync(Deno.stdout, e.encode('.'));
	result = isOfType(unknown.array().of(string), Parse.splitByBareWS('test this'));
	// console.warn({ result });
	assert(result[1]);

	Deno.writeAllSync(Deno.stdout, e.encode('] '));
});
