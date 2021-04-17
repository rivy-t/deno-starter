// spell-checker:ignore (js) gmsu

// import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

// import Micromatch from 'https://esm.sh/micromatch@4.0.2';
// import braces from 'https://esm.sh/braces@3.0.2';

import * as Me from './lib/me.ts';
import {
	braceExpand,
	// filenameExpand,
	filenameExpandSync,
	globToReS,
	parseGlob,
	splitByBareWS,
	// splitByBareWSToPreBrace,
	tildeExpand,
} from './lib/parse.ts';

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
// const argvSplit = splitByBareWS(args);
// const argvSplitBraceExpanded = splitByBareWS(args).flatMap(braceExpand);
const argvSplitBraceExpandedTildeExpanded = splitByBareWS(args)
	.flatMap(braceExpand)
	.flatMap(tildeExpand);
const argvSplitBraceExpandedTildeExpandedGlobExpanded = splitByBareWS(args)
	.flatMap(braceExpand)
	.flatMap(tildeExpand)
	.flatMap(filenameExpandSync);
const argv = argvSplitBraceExpandedTildeExpandedGlobExpanded;
// const argsBraceExpanded = braceExpand(args);
const parsedGlobs = argvSplitBraceExpandedTildeExpanded.map(parseGlob);

console.warn(me.name, {
	args,
	// // argsBraceExpanded,
	// argvSplit,
	// argvSplitBraceExpanded,
	// argvSplitBraceExpandedTildeExpanded,
	// argvSplitBraceExpandedTildeExpandedGlobExpanded,
	argv,
	parsedGlobs,
});

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
// console.log({ parsedArgV: argv.map((v) => parseGlob(v)) });

// Deno.exit(100);
