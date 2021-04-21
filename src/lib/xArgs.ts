// spell-checker:ignore (js) gmsu msu ; (libs) micromatch picomatch ; (names) SkyPack ; (options) nobrace noquantifiers nocase nullglob

// ToDO: review checks for progression in splits => continue to use an assert? what do we guarantee about returned 'token'?

// ref: [bash shell expansion](https://tldp.org/LDP/Bash-Beginners-Guide/html/sect_03_04.html) @@ <https://archive.is/GFMJ1>
// ref: [GNU ~ bash shell expansions](https://www.gnu.org/software/bash/manual/html_node/Shell-Expansions.html) @@ <https://archive.is/lHgK6>

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
import { exists, existsSync } from 'https://deno.land/std@0.93.0/fs/exists.ts';
import { assert } from 'https://deno.land/std@0.93.0/testing/asserts.ts';

import OSPaths from 'https://deno.land/x/os_paths@v6.9.0/src/mod.deno.ts';

import { walk, walkSync } from './xWalk.ts';

// import * as Walk from './xWalk.ts';
import * as Braces from './xBraces.ts';

export { expand as braceExpand } from './xBraces.ts';

// esm.sh
// import Braces from 'https://cdn.esm.sh/braces@3.0.2';
// import Micromatch from 'https://cdn.esm.sh/micromatch@4.0.2';
// import Picomatch from 'https://cdn.esm.sh/picomatch@2.2.2';
// esm.sh (un-minimized, readable source)
// import Braces from 'https://cdn.esm.sh/braces@3.0.2?dev';
// import Micromatch from 'https://cdn.esm.sh/micromatch@4.0.2?dev';
// import Picomatch from 'https://cdn.esm.sh/picomatch@2.2.2?dev';

// // jspm.io
// import BracesM from 'https://ga.jspm.io/npm:braces@3.0.2/index.js';
// import MicromatchM from 'https://ga.jspm.io/npm:micromatch@4.0.2/index.js';
// import PicomatchM from 'https://ga.jspm.io/npm:picomatch@2.2.2/index.js';
// jspm.dev
// import * as BracesT from 'https://cdn.jsdelivr.net/gh/DefinitelyTyped/DefinitelyTyped@7121cbff79/types/braces/index.d.ts';
// import * as MicromatchT from 'https://cdn.jsdelivr.net/gh/DefinitelyTyped/DefinitelyTyped@7121cbff79/types/micromatch/index.d.ts';
import * as PicomatchT from 'https://cdn.jsdelivr.net/gh/DefinitelyTyped/DefinitelyTyped@7121cbff79/types/picomatch/index.d.ts';
// import BracesM from 'https://jspm.dev/npm:braces@3.0.2';
// import MicromatchM from 'https://jspm.dev/npm:micromatch@4.0.2';
import PicomatchM from 'https://jspm.dev/npm:picomatch@2.2.2';
// const Braces = BracesM as typeof BracesT;
// const Micromatch = MicromatchM as typeof MicromatchT;
const Picomatch = PicomatchM as typeof PicomatchT;

// import Braces from 'http://localhost/braces@3.0.2?bundle';
// import Micromatch from 'http://localhost/micromatch@4.0.2?bundle';
// import Picomatch from 'http://localhost/picomatch@2.2.2?bundle';

// import Braces from 'http://smtp-lan:8080/braces@3.0.2?bundle';
// import Micromatch from 'http://smtp-lan:8080/micromatch@4.0.2?bundle';
// import Picomatch from 'http://smtp-lan:8080/picomatch@2.2.2?bundle';

// * skypack imports fail due to missing polyfills
// import Braces from 'https://cdn.skypack.dev/braces@3.0.2?dts';
// import Micromatch from 'https://cdn.skypack.dev/micromatch@4.0.2?dts';
// import Picomatch from 'https://cdn.skypack.dev/picomatch@2.2.2?dts';

const isWinOS = Deno.build.os === 'windows';

export const portablePathSepReS = '[\\/]';

const DQ = '"';
const SQ = "'";
const DQStringReS = `${DQ}[^${DQ}]*(?:${DQ}|$)`; // double-quoted string (unbalanced at end-of-line is allowed)
const SQStringReS = `${SQ}[^${SQ}]*(?:${SQ}|$)`; // single-quoted string (unbalanced at end-of-line is allowed)
// const DQStringStrictReS = '"[^"]*"'; // double-quoted string (quote balance is required)
// const SQStringStrictReS = "'[^']*'"; // single-quoted string (quote balance is required)

// const pathSepRe = /[\\/]/;
const globChars = ['?', '*', '[', ']'];
const globCharsReS = globChars.map((c) => '\\' + c).join('|');

// const sep = Path.sep;
// const sepReS = Path.SEP_PATTERN;
const sepReS = `[\\\\\\/]`;

const QReS = `[${DQ}${SQ}]`; // double or single quote character
// const nonGlobReS = `(?:(?!${globCharsReS}).)`;
// const nonGlobQReS = `(?:(?!${globCharsReS}|${QReS}).)`;
const nonGlobQSepReS = `(?:(?!${globCharsReS}|${QReS}|${sepReS}).)`;

const nonQReS = `(?:(?!${QReS}).)`; // non-quote, non-whitespace character
const nonQWSReS = `(?:(?!${QReS}|\\s).)`; // non-quote, non-whitespace character

export function splitByBareWSo(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes
	// * no character escape sequences are recognized
	// * unbalanced quotes are allowed (parsed as if EOL is a completing quote)
	const arr: Array<string> = [];
	s = s.replace(/^\s+/msu, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWSo()', s });
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQWSReS}+)*)(.*$)`, 'msu');
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			arr.push(m[1]);
			s = m[2] ? m[2].replace(/^\s+/msu, '') : ''; // trim leading whitespace
		} else {
			s = '';
		}
		// console.warn({ _: 'splitByBareWSo()', s, m, arr });
	}
	return arr;
}

const TokenReS = {
	bareWS: new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQWSReS}+))(\\s+)?(.*$)`, 'msu'),
	brace: new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQReS}+))(.*?$)`, ''),
};

export function shiftByBareWS(
	s: string,
	options: { autoQuote: boolean } = { autoQuote: true },
): [string, string] {
	// parse string into a token + restOfString separated by unquoted-whitespace
	// * supports both single and double quotes
	// * no character escape sequences are recognized
	// * unbalanced quotes are allowed (parsed as if EOL is a completing quote)
	const { autoQuote } = options;
	const initialS = s;
	// console.warn({ _: 'shiftByBareWS()', s, options, initialS });
	s = s.replace(/^\s+/msu, ''); // trim leading whitespace // ToDO: remove? allow leading WS in first token?
	const tokenRe = TokenReS.bareWS; // == (tokenFragment)(bareWS)?(restOfString)
	let foundFullToken = false;
	let token = '';
	while (s && !foundFullToken) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				const firstChar = matchStr[0];
				// "..." or '...'?
				if (firstChar === DQ || firstChar === SQ) {
					if (autoQuote && matchStr[matchStr.length - 1] !== firstChar) {
						matchStr += firstChar;
					}
				}
			}
			token += matchStr;
			s = m[3] ? m[3].replace(/^\s+/msu, '') : ''; // trim leading whitespace
			if (m[2] || !s) {
				foundFullToken = true;
			}
		} else {
			// possible?
			foundFullToken = true;
			token += s;
			s = '';
		}
	}
	assert(!initialS || (s !== initialS), 'non-progression of `shiftByBareWS()`'); // assert progress has been made o/w panic
	return [token, s];
}

export function splitByShiftBareWS(
	s: string,
	options: { autoQuote: boolean } = { autoQuote: true },
): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes
	// * no character escape sequences are recognized
	// * unbalanced quotes are allowed (parsed as if EOL is a completing quote)
	const arr: Array<string> = [];
	s = s.replace(/^\s+/msu, ''); // trim leading whitespace
	while (s) {
		const [token, restOfString] = shiftByBareWS(s, options);
		arr.push(token);
		assert(s !== restOfString, 'non-progression of `splitByShiftBareWS()`'); // assert progress has been made o/w panic
		s = restOfString;
	}
	return arr;
}

export function splitByBareWS(
	s: string,
	options: { autoQuote: boolean } = { autoQuote: true },
): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes
	// * no character escape sequences are recognized
	// * unbalanced quotes are allowed (parsed as if EOL is a completing quote)
	const { autoQuote } = options;
	const arr: Array<string> = [];
	s = s.replace(/^\s+/msu, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWS()', s });
	const tokenRe = TokenReS.bareWS; // == (tokenFragment)(bareWS)?(restOfString)
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				const firstChar = matchStr[0];
				// "..." or '...'?
				if (firstChar === DQ || firstChar === SQ) {
					if (autoQuote && matchStr[matchStr.length - 1] !== firstChar) {
						matchStr += firstChar;
					}
				}
			}
			text += matchStr;
			s = m[3] ? m[3].replace(/^\s+/msu, '') : ''; // trim leading whitespace
			if (m[2] || !s) {
				arr.push(text);
				text = '';
			}
		} else {
			// possible?
			arr.push(text);
			text = s = '';
		}
	}
	return arr;
}

export function tildeExpand(s: string): string {
	// tilde expand a string
	// * any leading whitespace is removed
	// ToDO?: handle `~USERNAME` for other users
	s = s.replace(/^\s+/msu, ''); // trim leading whitespace
	// console.warn({ _: 'tildeExpand()', s });
	// const sepReS = portablePathSepReS;
	const username = Deno.env.get('USER') || Deno.env.get('USERNAME') || '';
	const usernameReS = username.replace(/(.)/gmsu, '\\$1');
	const re = new RegExp(`^\s*(~(?:${usernameReS})?)(${sepReS}|$)(.*)`, 'i');
	const m = s.match(re);
	if (m) {
		s = OSPaths.home() + (m[2] ? m[2] : '') + (m[3] ? m[3] : '');
	}
	return s;
}

export function shellExpand(_s: string): Array<string> {
	throw 'unimplemented';
}

export async function* filenameExpandIter(s: string) {
	// filename (glob) expansion
	const nullglob = false;
	const parsed = parseGlob(s);

	// console.warn({ _: 'filenameExpandIter()', parsed });

	let found = false;
	if (parsed.glob) {
		const currentWorkingDirectory = Deno.cwd();
		const resolvedPrefix = Path.resolve(parsed.prefix);
		if (await exists(resolvedPrefix)) {
			// console.warn('here', { resolvedPrefix });
			Deno.chdir(resolvedPrefix);
			// prettier-ignore
			for await (
				const e of walk('.', {
					match: [new RegExp('^' + parsed.globAsReS + '$', isWinOS ? 'imsu' : 'msu')],
					maxDepth: parsed.globScan.maxDepth ? parsed.globScan.maxDepth : 1,
				})
			) {
				found = true;
				yield Path.join(parsed.prefix, e.path);
			}
			Deno.chdir(currentWorkingDirectory);
		}
	}

	if (!found && !nullglob) {
		yield s;
	}
}

export function* filenameExpandIterSync(s: string) {
	// filename (glob) expansion
	const nullglob = false;
	const parsed = parseGlob(s);

	// console.warn({ _: 'filenameExpandIter()', parsed });

	let found = false;
	if (parsed.glob) {
		const currentWorkingDirectory = Deno.cwd();
		const resolvedPrefix = Path.resolve(parsed.prefix);
		if (existsSync(resolvedPrefix)) {
			// console.warn('here', { resolvedPrefix });
			Deno.chdir(resolvedPrefix);
			// prettier-ignore
			for (
				const e of walkSync('.', {
					match: [new RegExp('^' + parsed.globAsReS + '$', isWinOS ? 'imsu' : 'msu')],
					maxDepth: parsed.globScan.maxDepth ? parsed.globScan.maxDepth : 1,
				})
			) {
				found = true;
				yield Path.join(parsed.prefix, e.path);
			}
			Deno.chdir(currentWorkingDirectory);
		}
	}

	if (!found && !nullglob) {
		yield s;
	}
}

export async function filenameExpand(s: string) {
	// filename (glob) expansion
	const arr = [];
	for await (const e of filenameExpandIter(s)) {
		arr.push(e);
	}
	return arr;
}
export function filenameExpandSync(s: string) {
	// filename (glob) expansion
	const arr = [];
	for (const e of filenameExpandIterSync(s)) {
		arr.push(e);
	}
	return arr;
}

function pathToPosix(p: string) {
	return p.replace(/\\/g, '/');
}
// function pathToWindows(p: string) {
// 	return p.replace(/\//g, '\\');
// }

// ToDO: handle long paths, "\\?\...", and UNC paths
// ref: [1][MSDN - Windows: Naming Files, Paths, and Namespaces] http://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx @@ https://archive.today/DgH7i

export function parseGlob(s: string) {
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
		`^((?:${DQStringReS}|${SQStringReS}|${nonGlobQSepReS}+)*(?:${sepReS}+|$))(.*$)`,
	);
	// console.warn({ _: 'parseGlob', re });
	while (s) {
		const m = s.match(re);
		// console.warn({ _: 'parseGlob', s, m });
		if (m) {
			prefix += m && m[1] ? m[1] : '';
			glob = m && m[2];
			s = m && m[1] && m[2] ? m[2] : '';
		} else {
			glob = s || '';
			s = '';
		}
		// console.warn({ _: 'parseGlob', prefix, glob });
	}

	const pJoin = Path.join(prefix, glob);
	const pJoinToPosix = pathToPosix(pJoin);
	// console.warn({
	// 	_: 'parseGlob',
	// 	prefix,
	// 	glob,
	// 	pJoin,
	// 	pJoinToPosix,
	// 	pJoinParsed: Path.parse(pJoin),
	// 	pJoinToPosixParsed: Path.parse(pJoinToPosix),
	// });
	const globAsReS = glob && globToReS(glob);
	// console.warn({ _: 'parseGlob', globAsReS });
	// const globScan: any = Picomatch.scan(Path.join(prefix, glob), {
	// console.warn({ _: 'parseGlob', prefix, glob, pathJoin: Path.posix.join(prefix, glob) });
	// deno-lint-ignore no-explicit-any ## 'picomatch' has incomplete typing
	const globScan: any = Picomatch.scan(pJoinToPosix, {
		windows: true,
		dot: false,
		nobrace: true,
		noquantifiers: true,
		posix: true,
		nocase: isWinOS,
		tokens: true,
		parts: true,
	});
	const globScanTokens = globScan.tokens;
	const globScanSlashes = globScan.slashes;
	const globScanParts = globScan.parts;
	// const globParsed = Picomatch.scan(glob, {
	// 	windows: true,
	// 	dot: false,
	// 	nobrace: true,
	// 	noquantifiers: true,
	// 	posix: true,
	// 	nocase: isWinOS,
	// 	tokens: true,
	// });
	// const globParsedTokens = ((globParsed as unknown) as any).tokens;
	// const globParsedParts = ((globParsed as unknown) as any).parts;

	return {
		prefix,
		glob,
		globAsReS,
		globScan,
		globScanTokens,
		globScanSlashes,
		globScanParts,
		// globParsed,
		// globParsedTokens,
		// globParsedParts,
	};
}

export function globToReS(s: string) {
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${nonQReS}+))(.*?$)`, '');
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				const firstChar = matchStr[0];
				if (firstChar === DQ || firstChar === SQ) {
					// "..." or '...' => de-quote and `[.]` escape any special characters
					const spl = matchStr.split(firstChar);
					matchStr = spl[1];
					// * `[.]` escape glob characters
					matchStr = matchStr.replace(/([?*\[\]])/gmsu, '[$1]');
				}
			}
			text += matchStr;
			s = m[2];
		}
	}
	// convert PATTERN to POSIX-path-style by replacing all backslashes with slashes (backslash is *not* used as an escape)
	text = text.replace(/\\/g, '/');

	// console.warn({ _: 'globToReS', text });

	// windows = true => match backslash and slash as path separators
	const parsed = Picomatch.parse(text, {
		windows: true,
		dot: false,
		nobrace: true,
		noquantifiers: true,
		posix: true,
		nocase: isWinOS,
	});
	// console.warn({ _: 'globToReS', parsed });
	// deno-lint-ignore no-explicit-any
	return ((parsed as unknown) as any).output;
}

export function argv(args: string | string[]) {
	const arr = Array.isArray(args) ? args : splitByShiftBareWS(args);
	return arr
		.flatMap(Braces.expand)
		.map(tildeExpand)
		.flatMap(filenameExpandSync);
}

export function argvIt(args: string) {
	// lazy iterable version (async)
	if (args == null) return Deno.args; // as iter...
	return ['iter'];
}
export function argvItSync(args: string) {
	// lazy iterable version (sync)
	if (args == null) return Deno.args; // as iter...
	return ['iter']; // ? [iter, restOfArgs]
}