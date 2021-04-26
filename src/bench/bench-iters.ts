// spell-checker:ignore (abbrev) LOGLEVEL NOTSET PRNG ; (libs) iterplus

import { getLevelByName } from 'https://deno.land/std@0.93.0/log/levels.ts';
import * as Log from 'https://deno.land/std@0.93.0/log/mod.ts';

const logLevels = ['NOTSET', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
const logFromEnv = Deno.env.get('LOG_LEVEL') ||
	Deno.env.get('LOGLEVEL') ||
	(Deno.env.get('DEBUG') ? 'DEBUG' : undefined) ||
	'';
const logLevelName = logLevels.find((v) => v === logFromEnv.toLocaleUpperCase()) || 'INFO';
// deno-lint-ignore no-explicit-any
const logLevel = getLevelByName(logLevelName as unknown as any);

// await Log.setup({
// 	handlers: {
// 		console: new Log.handlers.ConsoleHandler('DEBUG'),
// 	},
// 	loggers: {
// 		default: {
// 			level: 'INFO',
// 			handlers: ['console'],
// 		},
// 	},
// });

const log = Log.getLogger();
log.level = log.handlers[0].level = logLevel; // quick, but hackish (for handler level setting) => assumes console is `handlers[0]`

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

log.debug('setup: started');
// log.info('setup');
// log.warning('setup');
// log.error('setup');
// log.critical('setup');

performance.mark('setup:start');

const runs = 5000;

const usePresetPRNGSeed = false;
const presetPRNGSeed = 'bpcc2cfyslscmgrylcy2'; // spell-checker:disable-line
const seed = usePresetPRNGSeed ? presetPRNGSeed : (new Random()).string(20);
log.info({ seed });

const seededPRNG = new Seed(seed);
const random = new Random(() => seededPRNG.randomFloat());
// note: randomX.(min, max) => [min, max)

function randomBoolean() {
	return random.real(0, 1) > 0.5;
}

const wordList = [
	'anchor',
	'ankle',
	'approval',
	'army',
	'border',
	'civilian',
	'conference',
	'cultivate',
	'cutting',
	'designer',
	'dignity',
	'disability',
	'double',
	'engineer',
	'feminist',
	'fibre',
	'forward',
	'fuel',
	'indication',
	'invisible',
	'mainstream',
	'manual',
	'menu',
	'miscarriage',
	'module',
	'morsel',
	'mutual',
	'oven',
	'overwhelm',
	'paradox',
	'particular',
	'predator',
	'preside',
	'president',
	'principle',
	'producer',
	'progress',
	'promote',
	'proper',
	'psychology',
	'redeem',
	'retirement',
	'rifle',
	'senior',
	'straighten',
	'survivor',
	'swallow',
	'tradition',
	'unique',
	'violation',
	'wire',
];

function randomWord(list: string[]) {
	return list[random.int(0, list.length)];
}

// build random word lists
const arr: string[][] = [];
const size = 1000;
for (let i = 0; i < size; i++) {
	const prefix = randomBoolean() ? undefined : randomWord(wordList);
	const listSize = random.int(0, 10);
	const list = [];
	for (let j = 0; j < listSize; j++) {
		const s = [prefix, randomWord(wordList)].filter((e) => e != null).join(' ');
		list.push(s);
	}
	arr.push(list);
}

log.debug({ arrEg: arr.slice(0, 10) });

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

function isAsyncIter(obj: unknown): obj is AsyncIterator<unknown> {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof (obj as any).next === 'function'
	);
}
function canAsyncIter(obj: unknown): obj is AsyncIterable<unknown> {
	return (
		//typeof obj === "string" ||
		typeof obj === 'object' && obj !== null && Symbol.asyncIterator in obj
	);
}

async function* asyncIt<T>(it: AsyncIterable<T> | Iterable<T>): AsyncIterable<T> {
	if (canAsyncIter(it)) return it;
	for (const e of it) {
		yield e;
	}
}

// ref: <https://stackoverflow.com/a/48293566/43774> , <https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function>
async function* zip<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]): AsyncIterable<T[]> {
	if (!iterables.length) return;
	const iterators = iterables.map((iterable) => asyncIt(iterable)[Symbol.asyncIterator]());
	while (true) {
		const results = await Promise.all(iterators.map((it) => it.next()));
		if (results.some((res) => res.done)) return;
		else yield results.map((res) => res.value);
	}
}
function* zipSync<T>(...iterables: Iterable<T>[]): Iterable<T[]> {
	if (!iterables.length) return;
	const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());
	while (true) {
		const results = iterators.map((it) => it.next());
		if (results.some((res) => res.done)) return;
		else yield results.map((res) => res.value);
	}
}

function lazyLongestCommonPrefixSync(list: Iterable<string>) {
	return Lazy.from(zipSync(...list))
		.where((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.select((NthChars) => NthChars[0])
		.toArray()
		.join('');
}

async function lazyLongestCommonPrefix(list: Iterable<string> | AsyncIterable<string>) {
	const itList = await (async () => {
		if (!isAsyncIter(list)) return list as Iterable<string>;
		const a = [];
		for await (const e of list) {
			a.push(e);
		}
		return a;
	})();
	return Lazy.from(zipSync(...itList))
		.where((NthChars) => NthChars.every((c) => c === NthChars[0]))
		.select((NthChars) => NthChars[0])
		.toArray()
		.join('');
}

bench({
	name: 'iterplus LongestCommonPrefix',
	runs,
	func: (() => {
		let passN = 0;
		return (b: BenchmarkTimer) => {
			const idx = passN++ % arr.length;
			b.start();
			itpLongestCommonPrefix(arr[idx]);
			b.stop();
		};
	})(),
});

bench({
	name: 'Lazy LongestCommonPrefix',
	runs,
	func: (() => {
		let passN = 0;
		return (b: BenchmarkTimer) => {
			const idx = passN++ % arr.length;
			b.start();
			lazyLongestCommonPrefixSync(arr[idx]);
			b.stop();
		};
	})(),
});

bench({
	name: 'Lazy LongestCommonPrefix (async)',
	runs,
	func: (() => {
		let passN = 0;
		return (b: BenchmarkTimer) => {
			const idx = passN++ % arr.length;
			b.start();
			lazyLongestCommonPrefix(arr[idx]);
			b.stop();
		};
	})(),
});

performance.mark('setup:stop');
performance.measure('setup', 'setup:start', 'setup:stop');

log.debug(
	`setup done (duration: ${
		(() => {
			const duration = performance.getEntriesByName('setup')[0].duration;
			const [unit, n] = (duration > 1000) ? ['s', duration / 1000] : ['ms', duration];
			return (new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(n)) + ' ' +
				unit;
		})()
	})`,
);

log.debug('starting benchmarking');

performance.mark('bench:start');

await runBenchmarks(
	{ silent: true, skip: /_long/ },
	prettyBenchmarkProgress(),
).then(
	prettyBenchmarkResult(),
);

performance.mark('bench:stop');
performance.measure('bench', 'bench:start', 'bench:stop');
log.debug(
	`benchmarking done (duration: ${
		(() => {
			const duration = performance.getEntriesByName('bench')[0].duration;
			const [unit, n] = (duration > 1000) ? ['s', duration / 1000] : ['ms', duration];
			return (new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(n)) + ' ' +
				unit;
		})()
	})`,
);
