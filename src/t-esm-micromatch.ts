import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';
import Micromatch from 'https://esm.sh/micromatch@4.0.2';
import braces from 'https://esm.sh/braces';

const pathSepRe = /[\\/]/;
const globChars = ['?', '*', '[', ']'];
// const globCharsReS = '(?:' + globChars.map((c) => '\\' + c).join('|') + ')';
const globCharsReS = globChars.map((c) => '\\' + c).join('|');
function tokenizeString(s: string) {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; escapes are not supported
	const arr: Array<string> = [];
	console.warn({ s });
	s.replace(/^\s+/, ''); // trim leading whitespace
	while (s !== '') {
		const m = s.match(/^((?:"[^"]*(?:"|$)|'[^']*(?:'|$)|\S+)+)(.*$)/msu);
		if (m) {
			arr.push(m[1]);
			s = m[2] ? m[2].replace(/^\s+/, '') : ''; // trim leading whitespace
		} else {
			s = '';
		}
		console.warn({ s, m, arr });
	}
	// console.warn('tokenizeString()', { arr });
	return arr;
}

function parseNonGlobPrefix(s: string): { prefix: string; glob: string } {
	let prefix = '';
	let glob = '';

	const sep = Path.sep;
	// const sepReS = Path.SEP_PATTERN;
	const sepReS = `[\\\\\\/]`;

	console.warn({ globCharsReS, SEP: Path.SEP, SEP_PATTERN: Path.SEP_PATTERN });

	const DQStringReS = '"[^"]*(?:"|$)'; // double-quoted string (unbalanced is allowed)
	const SQStringReS = "'[^']*(?:'|$)"; // single-quoted string (unbalanced is allowed)
	const QReS = `["']`; // double or single quote character
	const nonGlobReS = `(?:(?!${globCharsReS}).)`;
	const nonGlobQReS = `(?:(?!${globCharsReS}|${QReS}).)`;
	const nonGlobQSepReS = `(?:(?!${globCharsReS}|${QReS}|${sepReS}).)`;

	const re = new RegExp(
		`^((?:${DQStringReS}|${SQStringReS}|${nonGlobQSepReS}+)*(?:${sepReS}+|$))(.*$)`
	);
	console.log({ re });
	while (s !== '') {
		const m = s.match(re);
		console.warn({ s, m });
		if (m) {
			prefix += m && m[1] ? m[1] : '';
			glob = m && m[2];
			s = m && m[1] && m[2] ? m[2] : '';
		} else {
			glob = s || '';
			s = '';
		}
		console.warn({ prefix, glob });
	}

	return { prefix, glob };
}

console.log(Micromatch.isMatch('a.a\\b', '*.a\\b', { windows: true }));
console.log(braces('\\\\{"a,b",c}', { expand: true }));
console.log(Micromatch.scan('c/*.cmd'));
console.log({ parsed: parseNonGlobPrefix(`a/b/c"a"'aa'/b/"c\\d"\\e*.cmd`) });
console.log({ parsed: parseNonGlobPrefix(`a/b/c"a"'aa'/b/"c\\d"\\e.cmd`) });
console.log({ parsed: parseNonGlobPrefix(`"c\\d"\\e*.cmd`) });
console.log({ parsed: parseNonGlobPrefix(`"c\\d"*\\e*.cmd`) });
