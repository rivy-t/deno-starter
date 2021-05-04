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

import {
	itpLongestCommonPrefix,
	lazyLongestCommonPrefix,
	lazyLongestCommonPrefixSync,
} from '../t-iters/t-iters.ts';

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
			(async () => await lazyLongestCommonPrefix(arr[idx]))();
			b.stop();
		};
	})(),
});

performance.mark('setup:stop');
performance.measure('setup', 'setup:start', 'setup:stop');

log.debug(`setup done (duration: ${
	(() => {
		const duration = performance.getEntriesByName('setup')[0].duration;
		const [unit, n] = (duration > 1000) ? ['s', duration / 1000] : ['ms', duration];
		return (new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(n)) + ' ' + unit;
	})()
})`);

log.debug('starting benchmarking');

performance.mark('bench:start');

await runBenchmarks({ silent: true, skip: /_long/ }, prettyBenchmarkProgress()).then(
	prettyBenchmarkResult(),
);

performance.mark('bench:stop');
performance.measure('bench', 'bench:start', 'bench:stop');
log.debug(`benchmarking done (duration: ${
	(() => {
		const duration = performance.getEntriesByName('bench')[0].duration;
		const [unit, n] = (duration > 1000) ? ['s', duration / 1000] : ['ms', duration];
		return (new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(n)) + ' ' + unit;
	})()
})`);
