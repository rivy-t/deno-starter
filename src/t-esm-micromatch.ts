import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import Micromatch from 'https://esm.sh/micromatch@4.0.2';
import braces from 'https://esm.sh/braces@3.0.2';

import * as Me from './lib/me.ts';
import { splitByBareWS } from './lib/parse.ts';

const me = Me.info();
console.warn(me.name, { me });
if (Deno.build.os === 'windows' && !me[0]) {
	console.warn(
		me.name +
			': warn: diminished capacity; full functionality requires an enhanced runner (use `dxr` or install with `dxi`)'
	);
}
const args = me.ARGS || '';
const argvSplit0 = splitByBareWS(args);
const argvReslash1 = argvSplit0; //.flatMap((v) => v.replace(/\\/gmsu, '/'));
const argvBraceExp2 = argvReslash1.flatMap((v) => braces.expand(v));
const argv = argvBraceExp2;
console.warn(me.name, { args, argvSplit0, argvReslash1, argvBraceExp2, argv });

const DQStringReS = '"[^"]*(?:"|$)'; // double-quoted string (unbalanced at end-of-line is allowed)
const SQStringReS = "'[^']*(?:'|$)"; // single-quoted string (unbalanced at end-of-line is allowed)
const DQStringStrictReS = '"[^"]*"'; // double-quoted string (quote balance is required)
const SQStringStrictReS = "'[^']*'"; // single-quoted string (quote balance is required)

const pathSepRe = /[\\/]/;
const globChars = ['?', '*', '[', ']'];
const globCharsReS = globChars.map((c) => '\\' + c).join('|');

// ToDO: handle long paths, "\\?\...", and UNC paths
// ref: [1][MSDN - Windows: Naming Files, Paths, and Namespaces] http://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx @@ https://archive.today/DgH7i

function parseNonGlobPathPrefix(s: string): { prefix: string; glob: string } {
	// options.os => undefined (aka portable), 'windows', 'posix'/'linux'
	const options: { os?: string } = {};
	let prefix = '';
	let glob = '';

	const sep = Path.sep;
	// const sepReS = Path.SEP_PATTERN;
	const sepReS = `[\\\\\\/]`;

	// console.warn({ _: 'parseNonGlobPathPrefix', globCharsReS, SEP: Path.SEP, SEP_PATTERN: Path.SEP_PATTERN });

	// for 'windows' or portable, strip any leading "\\?\" as a prefix
	if (!options.os || options.os === 'windows') {
		const m = s.match(/^\\\\?\\(.*)/);
		if (m) {
			prefix = '\\\\?\\';
			s = m && m[1] ? m[1] : '';
		}
	}

	const QReS = `["']`; // double or single quote character
	const nonGlobReS = `(?:(?!${globCharsReS}).)`;
	const nonGlobQReS = `(?:(?!${globCharsReS}|${QReS}).)`;
	const nonGlobQSepReS = `(?:(?!${globCharsReS}|${QReS}|${sepReS}).)`;

	const re = new RegExp(
		`^((?:${DQStringReS}|${SQStringReS}|${nonGlobQSepReS}+)*(?:${sepReS}+|$))(.*$)`
	);
	// console.warn({ _: 'parseNonGlobPathPrefix', re });
	while (s) {
		const m = s.match(re);
		// console.warn({ _: 'parseNonGlobPathPrefix', s, m });
		if (m) {
			prefix += m && m[1] ? m[1] : '';
			glob = m && m[2];
			s = m && m[1] && m[2] ? m[2] : '';
		} else {
			glob = s || '';
			s = '';
		}
		// console.warn({ _: 'parseNonGlobPathPrefix', prefix, glob });
	}

	return { prefix, glob };
}

// console.log(Micromatch.isMatch('a.a\\b', '*.a\\b', { windows: true }));
// console.log(braces('\\\\{"a,b",c}', { expand: true }));
// console.log(Micromatch.scan('c/*.cmd'));
// console.log({ parsed: parseNonGlobPathPrefix(`a/b/c"a"'aa'/b/"c\\d"\\e*.cmd`) });
// console.log({ parsed: parseNonGlobPathPrefix(`a/b/c"a"'aa'/b/"c\\d"\\e.cmd`) });
// console.log({ parsed: parseNonGlobPathPrefix(`"c\\d"\\e*.cmd`) });
// console.log({ parsed: parseNonGlobPathPrefix(`"c\\d"*\\e*.cmd`) });

console.log({ parsedArgs: parseNonGlobPathPrefix(args) });
console.log({ parsedArgV: argv.map((v) => parseNonGlobPathPrefix(v)) });
