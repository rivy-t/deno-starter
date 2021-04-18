// spell-checker:ignore (abbrev) PRNG

import * as Log from 'https://deno.land/std@0.93.0/log/mod.ts';

import {
	bench,
	BenchmarkTimer,
	runBenchmarks,
} from 'https://deno.land/std@0.93.0/testing/bench.ts';
import {
	prettyBenchmarkProgress,
	prettyBenchmarkResult,
} from 'https://deno.land/x/pretty_benching@v0.3.3/mod.ts';

import Random from 'https://deno.land/x/random@v1.1.2/Random.js';
import { Seed } from 'https://deno.land/x/seed@1.0.0/index.ts';

import * as Parser from '../lib/parse.ts';

Log.info('setup');

const usePresetPRNGSeed = false;
const presetPRNGSeed = 'bpcc2cfyslscmgrylcy2'; // spell-checker:disable-line
const seed = usePresetPRNGSeed ? presetPRNGSeed : (new Random()).string(20);
Log.info({ seed });

const seededPRNG = new Seed(seed);
const random = new Random(() => seededPRNG.randomFloat());

Log.info('starting');

function randomBoolean() {
	return random.real(0, 1) > 0.5;
}

function randomTokenFragment() {
	const quote = randomBoolean() ? '' : (randomBoolean() ? '"' : "'");
	const length = random.int(1, 10);
	return (quote +
		random.string(length, Random.LOWER_ALPHA_NUMERICS + (quote ? '' : '           ')) +
		quote);
}

function randomTokenString() {
	const tokenNumber = random.int(1, 20);
	const WS = randomBoolean() ? '' : ' ';
	let tokenS = '';
	for (let i = 0; i < tokenNumber; i++) tokenS += randomTokenFragment();
	return WS + tokenS;
}

// build random token strings
const arr: string[] = [];
const size = 1000;
for (let i = 0; i < size; i++) {
	arr.push(randomTokenString());
}

Log.debug({ arrEg: arr.slice(0, 10) });

const runs = 5000;

bench({
	name: 'Single function parse',
	runs,
	func: (() => {
		let passN = 0;
		return (b: BenchmarkTimer) => {
			b.start();
			Parser.splitByBareWS(arr[passN++ % arr.length]);
			b.stop();
		};
	})(),
});

bench({
	name: 'Shifting parse',
	runs,
	func: (() => {
		let passN = 0;
		return (b: BenchmarkTimer) => {
			b.start();
			Parser.splitByShiftBareWS(arr[passN++ % arr.length]);
			b.stop();
		};
	})(),
});

// bench({
// 	name: 'Rotating arrays',
// 	runs: 1000,
// 	func(b): void {
// 		b.start();
// 		Parser.splitByShiftBareWS(s);
// 		b.stop();
// 	},
// });

runBenchmarks(
	{ silent: true, skip: /_long/ },
	prettyBenchmarkProgress(),
).then(
	prettyBenchmarkResult(),
);
