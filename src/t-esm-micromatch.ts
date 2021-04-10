// spell-checker:ignore (js) gmsu

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

// import Micromatch from 'https://esm.sh/micromatch@4.0.2';
// import braces from 'https://esm.sh/braces@3.0.2';

import * as Me from './lib/me.ts';
import {
	braceExpand,
	splitByBareWS,
	splitByBareWSBalanced,
	splitByBareWSToPreBrace,
	parseNonGlobPathPrefix,
	globToRe,
} from './lib/parse.ts';

const me = Me.info();
console.warn(me.name, { me });
if (Deno.build.os === 'windows' && !me[0]) {
	console.warn(
		me.name +
			': warn: diminished capacity; full functionality requires an enhanced runner (use `dxr` or install with `dxi`)'
	);
}

const args = me.ARGS || '';
const argvSplit = splitByBareWS(args);
const argvSplitBalanced = splitByBareWSBalanced(args);
const argvSplitBraceExpanded = splitByBareWS(args).flatMap(braceExpand);
const argv = argvSplitBraceExpanded;
const argvToGlobRe = argv.map(globToRe);

console.warn(me.name, {
	args,
	argvSplit,
	argvSplitBalanced,
	argvSplitBraceExpanded,
	argv,
	argvToGlobRe,
});

// console.log(Micromatch.isMatch('a.a\\b', '*.a\\b', { windows: true }));
// console.log(braces('\\\\{"a,b",c}', { expand: true }));
// console.log(Micromatch.scan('c/*.cmd'));
// console.log({ parsed: parseNonGlobPathPrefix(`a/b/c"a"'aa'/b/"c\\d"\\e*.cmd`) });
// console.log({ parsed: parseNonGlobPathPrefix(`a/b/c"a"'aa'/b/"c\\d"\\e.cmd`) });
// console.log({ parsed: parseNonGlobPathPrefix(`"c\\d"\\e*.cmd`) });
// console.log({ parsed: parseNonGlobPathPrefix(`"c\\d"*\\e*.cmd`) });

// console.log({ parsedArgs: parseNonGlobPathPrefix(args) });
// console.log({ parsedArgV: argv.map((v) => parseNonGlobPathPrefix(v)) });
