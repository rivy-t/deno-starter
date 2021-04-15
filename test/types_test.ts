import { assert } from 'https://deno.land/std@0.93.0/testing/asserts.ts';
import { writeAllSync } from 'https://deno.land/std@@0.93.0/io/mod.ts';

import Schema, { string, number, array, unknown } from 'http://esm.sh/computed-types@1.6.0';
// import type { SchemaValidatorFunction, SchemaReturnType } from 'http://esm.sh/computed-types@1.6.0';

import { nameGen } from './common.ts';

const testName = nameGen(import.meta.url);

type ValidatorType = unknown;
const isOfType = (s: ValidatorType, value: unknown) => {
	// deno-lint-ignore no-explicit-any
	return (s as any).destruct()(value);
};

import * as Parse from '../src/lib/parse.ts';

const e = new TextEncoder();

Deno.test(testName('parse'), () => {
	writeAllSync(Deno.stdout, e.encode('['));

	let result;

	writeAllSync(Deno.stdout, e.encode('.'));
	result = isOfType(unknown.array().of(string).max(0), Parse.splitByBareWS(''));
	// console.warn({ result });
	assert(result[1]);

	writeAllSync(Deno.stdout, e.encode('.'));
	result = isOfType(unknown.array().of(string), Parse.splitByBareWS('test this'));
	// console.warn({ result });
	assert(result[1]);

	writeAllSync(Deno.stdout, e.encode('] '));
});
