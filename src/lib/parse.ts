// spell-checker:ignore (js) gmsu ; (names) micromatch picomatch

// ESM conversion refs
// ref: <https://esbuild.github.io/plugins>
// ref: <https://github.com/postui/esm.sh/blob/master/server/build.go>
// ref: <https://github.com/postui/esm.sh>
// ref: <https://esbuild.github.io/plugins/#resolve-results>
// ref: <https://dev.to/ije/introducing-esm-cdn-for-npm-deno-1mpo> // `esm` client?
// ref: <https://github.com/remorses/esbuild-plugins>
// ref: <https://github.com/snowpackjs/rollup-plugin-polyfill-node>
// ref: <https://esbuild.github.io/plugins/#resolve-callbacks>
// ref: <https://www.google.com/search?q=using+esbuild+polyfill&oq=using+esbuild+polyfill&aqs=chrome..69i57.7740j0j1&sourceid=chrome&ie=UTF-8>
// ref: <https://github.com/evanw/esbuild/issues/298>
// ref: <https://github.com/evanw/esbuild/blob/03a33e6e007467d99989ecf82fad61bd928a71aa/CHANGELOG.md#0717>
// ref: <https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5>
// ref: <https://www.npmjs.com/package/path-browserify>
// ref: <https://github.com/evanw/esbuild/issues/85>
// ref: <https://stackoverflow.com/questions/61821038/how-to-use-npm-module-in-deno>
// ref: <https://jspm.org/docs/cdn>

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

// import Picomatch from 'https://cdn.esm.sh/picomatch@2.2.2';
// import Micromatch from 'https://cdn.esm.sh/micromatch@4.0.2';
// import braces from 'https://cdn.esm.sh/braces@3.0.2';
import Picomatch from 'https://cdn.esm.sh/picomatch@2.2.2?dev';
import Micromatch from 'https://cdn.esm.sh/micromatch@4.0.2?dev';
import braces from 'https://cdn.esm.sh/braces@3.0.2?dev';

// // jspm.io
// import Picomatch from 'https://ga.jspm.io/npm:picomatch@2.2.2/index.js';
// import Micromatch from 'https://ga.jspm.io/npm:micromatch@4.0.2/index.js';
// import braces from 'https://ga.jspm.io/npm:braces@3.0.2/index.js';
// // jspm.dev
// import Picomatch from 'https://jspm.dev/npm:picomatch@2.2.2';
// import Micromatch from 'https://jspm.dev/npm:micromatch@4.0.2';
// import braces from 'https://jspm.dev/npm:braces@3.0.2';

// import Picomatch from 'http://localhost/picomatch@2.2.2?bundle';
// import Micromatch from 'http://localhost/micromatch@4.0.2?bundle';
// import braces from 'http://localhost/braces@3.0.2?bundle';

// import Picomatch from 'http://smtp-lan:8080/picomatch@2.2.2?bundle';
// import Micromatch from 'http://smtp-lan:8080/micromatch@4.0.2?bundle';
// import braces from 'http://smtp-lan:8080/braces@3.0.2?bundle';

// * skypack imports fail due to missing polyfills
// import Picomatch from 'https://cdn.skypack.dev/picomatch@2.2.2?dts';
// import Micromatch from 'https://cdn.skypack.dev/micromatch@4.0.2?dts';
// import braces from 'https://cdn.skypack.dev/braces@3.0.2?dts';

const isWinOS = Deno.build.os === 'windows';

const DQStringReS = '"[^"]*(?:"|$)'; // double-quoted string (unbalanced at end-of-line is allowed)
const SQStringReS = "'[^']*(?:'|$)"; // single-quoted string (unbalanced at end-of-line is allowed)
const DQStringStrictReS = '"[^"]*"'; // double-quoted string (quote balance is required)
const SQStringStrictReS = "'[^']*'"; // single-quoted string (quote balance is required)

const pathSepRe = /[\\/]/;
const globChars = ['?', '*', '[', ']'];
const globCharsReS = globChars.map((c) => '\\' + c).join('|');

// const sep = Path.sep;
// const sepReS = Path.SEP_PATTERN;
const sepReS = `[\\\\\\/]`;

const QReS = `["']`; // double or single quote character
const nonGlobReS = `(?:(?!${globCharsReS}).)`;
const nonGlobQReS = `(?:(?!${globCharsReS}|${QReS}).)`;
const nonGlobQSepReS = `(?:(?!${globCharsReS}|${QReS}|${sepReS}).)`;

const nonQReS = `(?:(?!["']).)`; // non-quote, non-whitespace character
const nonQWSReS = `(?:(?!["']|\\s).)`; // non-quote, non-whitespace character

export function splitByBareWS(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; note: no character escape sequences are recognized
	const addBalance = true;
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWS()', s });
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQWSReS}+)*)(.*$)`, 'msu');
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			arr.push(m[1]);
			s = m[2] ? m[2].replace(/^\s+/, '') : ''; // trim leading whitespace
		} else {
			s = '';
		}
		// console.warn({ _: 'splitByBareWS()', s, m, arr });
	}
	return arr;
}

export function splitByBareWSBalanced(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; note: no character escape sequences are recognized
	const addBalance = true;
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWS()', s });
	const tokenRe = new RegExp(
		`^((?:${DQStringReS}|${SQStringReS}|${nonQWSReS}+))(\\s+)?(.*$)`,
		'msu'
	);
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				// ""?
				if (matchStr[0] === '"') {
					if (addBalance && matchStr[matchStr.length - 1] !== '"') {
						matchStr += '"';
					}
				} else if (matchStr[0] === "'") {
					if (addBalance && matchStr[matchStr.length - 1] !== "'") {
						matchStr += "'";
					}
				}
			}
			text += matchStr;
			s = m[3] ? m[3].replace(/^\s+/, '') : ''; // trim leading whitespace
			// console.warn({ _: 'splitByBareWSToPreBrace', text, s });
			if (m[2] || !s) {
				arr.push(text);
				text = '';
			}
		} else {
			arr.push(text);
			text = s = '';
		}
		// console.warn({ _: 'splitByBareWS()', s, m, arr });
	}
	return arr;
}

export function splitByBareWSToPreBrace(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; note: no character escape sequences are recognized
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWSBalanced()', s });
	// const tokenRe = new RegExp(`^((?:(?!["']|\\s).)+)(\\s)?(.*)$`, '');
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQWSReS}+))(\\s+)?(.*?$)`, '');
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		// console.warn({ _: 'splitByBareWSToPreBrace', s, m });
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				// ""?
				// console.warn('here:1');
				if (matchStr[0] === '"') {
					// console.warn('here:"', { matchStr });
					// * de-quote
					const spl = matchStr.split('"');
					matchStr = spl[1];
					// matchStr = matchStr.replace(/\\/gmsu, '\\\\');
					matchStr = matchStr.replace(/([\\?*\[\]])/gmsu, '\\$1');
					matchStr = matchStr.replace(/(.)/gmsu, '\\$1');
					// matchStr
				} else if (matchStr[0] === "'") {
					// console.warn("here:'", { matchStr });
					const spl = matchStr.split("'");
					matchStr = spl[1];
					// matchStr = matchStr.replace(/\\/gmsu, '\\\\');
					matchStr = matchStr.replace(/([?*\[\]])/gmsu, '\\$1');
					matchStr = matchStr.replace(/(.)/gmsu, '\\$1');
				} else {
					// const slashAndGlobChars = ['\\', '?', '*', '[', ']'];
					matchStr = matchStr.replace(/\\/gmsu, '\\\\');
					matchStr = matchStr.replace(/([\\?*\[\]])/gmsu, '\\$1');
				}
			}
			text += matchStr;
			s = m[3] ? m[3].replace(/^\s+/, '') : ''; // trim leading whitespace
			// console.warn({ _: 'splitByBareWSToPreBrace', text, s });
			if (m[2] || !s) {
				arr.push(text);
				text = '';
			}
		} else {
			arr.push(text);
			text = s = '';
		}
	}
	// console.warn({ arr });
	return arr;
}

export function braceExpand(s: string): Array<string> {
	// brace expand a string
	// * note: no character escape sequences are recognized; unbalanced quotes are allowed
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'braceExpand()', s });
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQReS}+))(.*?$)`, '');
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				if (matchStr[0] === '"') {
					// * "..." => de-quote and backslash escape contents
					const spl = matchStr.split('"');
					matchStr = spl[1];
					// * backslash escape (double-escape backslash or glob characters)
					matchStr = matchStr.replace(/([\\?*\[\]])/gmsu, '\\$1');
					matchStr = matchStr.replace(/(.)/gmsu, '\\$1');
				} else if (matchStr[0] === "'") {
					// * '...' => de-quote and backslash escape contents
					const spl = matchStr.split("'");
					matchStr = spl[1];
					// * backslash escape (double-escape backslash or glob characters)
					matchStr = matchStr.replace(/([?*\[\]])/gmsu, '\\$1');
					matchStr = matchStr.replace(/(.)/gmsu, '\\$1');
				} else {
					// unquoted text => backslash escape special characters (double-escape backslash)
					matchStr = matchStr.replace(/\\/gmsu, '\\\\');
					matchStr = matchStr.replace(/([\\?*\[\]])/gmsu, '\\$1');
				}
			}
			text += matchStr;
			s = m[2];
			if (!s) {
				arr.push(text);
				text = '';
			}
		} else {
			arr.push(text);
			text = s = '';
		}
	}
	return arr
		.flatMap((v) => braces.expand(v))
		.map((v) => v.replace(/\\(.)/gmsu, '"$1"'))
		.map((v) => v.replace(/"\\"/gmsu, '\\'));
}

// ToDO: handle long paths, "\\?\...", and UNC paths
// ref: [1][MSDN - Windows: Naming Files, Paths, and Namespaces] http://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx @@ https://archive.today/DgH7i

export function parseNonGlobPathPrefix(s: string) {
	// options.os => undefined (aka portable), 'windows', 'posix'/'linux'
	const options: { os?: string } = {};
	let prefix = '';
	let glob = '';

	// console.warn({ _: 'parseNonGlobPathPrefix', globCharsReS, SEP: Path.SEP, SEP_PATTERN: Path.SEP_PATTERN });

	// for 'windows' or portable, strip any leading `\\?\` as a prefix
	if (!options.os || options.os === 'windows') {
		const m = s.match(/^(\\\\\?\\)(.*)/);
		if (m) {
			prefix = m[1] ? m[1] : '';
			s = m[2] ? m[2] : '';
		}
	}

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

	console.log({ glob });
	const globAsRe = glob && globToRe(glob);
	const globScan = Micromatch.scan(glob, { tokens: true });
	const globScanTokens = globScan.tokens[0];
	const globSegs = Picomatch.scan(glob, {});

	return {
		prefix,
		glob,
		globAsRe,
		globScan,
		globScanTokens,
		globSegs,
	};
}

export function globToRe(s: string) {
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQReS}+))(.*?$)`, '');
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				if (matchStr[0] === '"') {
					// * "..." => de-quote and [.] escape any special characters
					const spl = matchStr.split('"');
					matchStr = spl[1];
					// * [.] escape glob characters
					matchStr = matchStr.replace(/([?*\[\]])/gmsu, '[$1]');
				} else if (matchStr[0] === "'") {
					// * '...' => de-quote and [.] escape any special characters
					const spl = matchStr.split("'");
					matchStr = spl[1];
					// * [.] escape glob characters
					matchStr = matchStr.replace(/([?*\[\]])/gmsu, '[$1]');
				}
			}
			text += matchStr;
			s = m[2];
		}
	}

	// windows = true => match backslash and slash as path separators
	return Picomatch.parse(text, {
		windows: true,
		dot: true,
		nobrace: true,
		noquantifiers: true,
		posix: true,
		nocase: isWinOS,
	});
}
