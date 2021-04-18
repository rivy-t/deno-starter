// spell-checker:ignore (js) gmsu

// import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

// import Micromatch from 'https://esm.sh/micromatch@4.0.2';
// import braces from 'https://esm.sh/braces@3.0.2';

import * as Me from './lib/me.ts';
import {
	braceExpand,
	filenameExpand,
	// filenameExpandSync,
	// globToReS,
	// parseGlob,
	shiftByBareWS,
	splitByBareWS,
	splitByShiftBareWS,
	// splitByBareWSToPreBrace,
	tildeExpand,
} from './lib/parse.ts';

// import * as Fmt from 'https://deno.land/std@0.93.0/fmt/printf.ts';
// import * as Util from 'https://deno.land/std@0.93.0/node/util.ts';

const me = Me.info();
console.warn(me.name, { me });
if (Deno.build.os === 'windows' && !me[0]) {
	console.warn(
		me.name +
			': warn: diminished capacity; full functionality requires an enhanced runner (use `dxr` or install with `dxi`)',
	);
}

// bash-type command line expansion
// ref: [bash ~ Shell expansion](https://tldp.org/LDP/Bash-Beginners-Guide/html/sect_03_04.html) @@ <https://archive.is/GFMJ1>

const args = me.ARGS || '';
const argvSplit = splitByBareWS(args);
const argvSplitShift = splitByShiftBareWS(args);
// const argvSplitBraceExpanded = splitByBareWS(args).flatMap(braceExpand);
const argvSplitBraceExpandedTildeExpanded = splitByBareWS(args).flatMap(braceExpand).flatMap(
	tildeExpand,
);
// const argvSplitBraceExpandedTildeExpandedGlobExpanded = splitByBareWS(args)
// 	.flatMap(braceExpand)
// 	.flatMap(tildeExpand)
// 	.flatMap(filenameExpand);
// const argv = [];
// for (const values of argvSplitBraceExpandedTildeExpandedGlobExpanded) {
// 	for await (const vs of values) {
// 		// console.log({ vs });
// 		argv.push(vs);
// 	}
// }
// const argv = await argvSplitBraceExpandedTildeExpandedGlobExpandedGen.flat();
// const argsBraceExpanded = braceExpand(args);
// const parsedGlobs = argvSplitBraceExpandedTildeExpanded.map(parseGlob);

const argvViaShift = [];
let restOfArgs = args;
let token = '';
do {
	[token, restOfArgs] = shiftByBareWS(restOfArgs);
	if (token) {
		argvViaShift.push(token);
	}
} while (token && restOfArgs);

const argv = [];
const vGen = argvSplitBraceExpandedTildeExpanded.flatMap(filenameExpand);
for (const vs of vGen) {
	for await (const v of vs) {
		console.log({ v });
		argv.push(v);
	}
}

console.warn(
	me.name,
	{
		args,
		argvSplitBraceExpandedTildeExpanded,
		// vGen,
		// // argsBraceExpanded,
		argvViaShift,
		argvSplit,
		argvSplitShift,
		// argvSplitBraceExpanded,
		// argvSplitBraceExpandedTildeExpanded,
		// argvSplitBraceExpandedTildeExpandedGlobExpanded,
		argv,
		// parsedGlobs: Util.inspect(parsedGlobs),
	},
	// 'parsedGlobs ' + Deno.inspect(parsedGlobs, { depth: 10 }),
);

// for (const a of argvToGlobRe) {
// 	const o = ((a as unknown) as any).output;
// 	console.warn({ a, o }, o);
// }

// console.log(Micromatch.isMatch('a.a\\b', '*.a\\b', { windows: true }));
// console.log(braces('\\\\{"a,b",c}', { expand: true }));
// console.log(Micromatch.scan('c/*.cmd'));
// console.log({ parsed: parseGlob(`a/b/c"a"'aa'/b/"c\\d"\\e*.cmd`) });
// console.log({ parsed: parseGlob(`a/b/c"a"'aa'/b/"c\\d"\\e.cmd`) });
// console.log({ parsed: parseGlob(`"c\\d"\\e*.cmd`) });
// console.log({ parsed: parseGlob(`"c\\d"*\\e*.cmd`) });

// console.log({ parsedArgs: parseGlob(args) });
// console.log({ parsedArgV: argv.map((vs) => parseGlob(vs)) });

// Deno.exit(100);
