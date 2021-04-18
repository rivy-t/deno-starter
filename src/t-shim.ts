// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

import { wait } from 'https://deno.land/x/wait/mod.ts';

// import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';
// import OsPaths from 'https://deno.land/x/os_paths@v6.9.0/src/mod.deno.ts';

// import { exists, existsSync } from 'https://deno.land/std@0.83.0/fs/exists.ts';
// import { expandGlob, expandGlobSync } from 'https://deno.land/std@0.83.0/fs/expand_glob.ts';
import { WalkEntry } from 'https://deno.land/std@0.83.0/fs/walk.ts';
// const fs = { exists, existsSync, walk, walkSync };

import { expandGlobSync } from './deno-glob.ts';
import { collectSync } from './funk.ts';

// const isWinOS = Deno.build.os === 'windows';
// const pathSeparator = isWinOS ? /[\\/]/ : /\//;
// const pathListSeparator = isWinOS ? /;/ : /:/;
// const paths = Deno.env.get('PATH')?.split(pathListSeparator) || [];
// const pathExtensions = (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [];
// const pathCaseSensitive = !isWinOS;

console.log(Deno.env.get('DENO_SHIM_0'));
console.log(Deno.env.get('DENO_SHIM_ARGS'));
console.log(Deno.env.get('DENO_SHIM_PIPE'));

// reminder: JS falsey == false, 0, -0, 0n, "", null, undefined, NaN ; truthy == !falsey

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
type GlobToken = { s: string; glob: string; isGlob: boolean };
function tokenToGlobToken(s_: string) {
	let s = s_;
	const globToken: GlobToken = { s: '', glob: '', isGlob: false };
	while (s && s !== '') {
		const m = s.match(/^(?:"([^"]*)(?:"|$)|'([^']*)(?:'|$)|(\S+))(.*$)/msu);
		const quoted = m && (m[1] || m[2]);
		console.warn({ s, m, quoted });
		if (quoted) {
			globToken.s += quoted;
			globToken.glob += quoted.replace(/([?*{}\[\]])/gmsu, '[$1]');
		} else {
			const s = (m && m[3]) || '';
			globToken.s += s;
			globToken.glob += s;
			globToken.isGlob = globToken.isGlob || (s.match(/[?*{}\[\]]/) ? true : false);
		}
		s = m ? m[4] : '';
	}
	return globToken;
}
function wildArgs() {
	const nullglob = false;
	const shimArgs = Deno.env.get('DENO_SHIM_ARGS');
	if (!shimArgs) return Deno.args;
	const tokens = tokenizeString(shimArgs);
	console.log({ tokens });
	const globTokens: Array<GlobToken> = [];
	for (const token of tokens) {
		globTokens.push(tokenToGlobToken(token));
	}
	const arr: Array<string> = [];
	for (const globToken of globTokens) {
		console.log({ globToken });
		if (globToken.isGlob) {
			const expandedGlobs = collectSync(
				expandGlobSync(globToken.glob) as IterableIterator<WalkEntry>,
			);
			if (expandedGlobs.length > 0) {
				const globs = Array.from(expandedGlobs, (v) => v.path);
				arr.push(...globs);
			} else {
				if (nullglob) {
					arr.push(globToken.s);
				}
			}
		} else {
			arr.push(globToken.s);
		}
	}
	console.warn({ globTokens, arr });
	return arr.length > 0 ? arr : Deno.args;
}
// function localExpandGlob(glob: string) {
// 	// * disable '`' escape character (by escaping all occurrences)
// 	const winGlobEscape = '`';
// 	glob.replace(winGlobEscape, winGlobEscape + winGlobEscape);

// 	const isAbsolute = Path.isAbsolute(glob);
// 	// configure regex (`[\\/]` as path separators, no escape characters (use character sets (`[..]`)instead) )
// 	const re = new RegExp(
// 		// Path.globToRegExp(cmdGlob, { extended: true, globstar: true, os: 'windows' }),
// 		Path.globToRegExp(glob, { extended: true, globstar: true, os: 'windows' }).source,
// 		// .replace(
// 		// 	// * remove leading "anchor"
// 		// 	/^[^]/,
// 		// 	''
// 		// ),
// 		// * configure case sensitivity
// 		pathCaseSensitive ? void 0 : 'i',
// 	);
// 	const res = [re];
// 	const fileEntries = collectSync(
// 		fs.walkSync('.', {
// 			// maxDepth: 1,
// 			match: res,
// 			// skip: [/[.]/],
// 		}),
// 	);
// 	// console.warn({ glob, re, res, fileEntries });
// 	return fileEntries;
// }

const args = wildArgs();

console.log({ args, shimArgs: Deno.env.get('DENO_SHIM_ARGS'), DenoArgs: Deno.args });

// ! unfortunately, signals are NIXy-only as of 2021-04 (unimplemented errors on Windows)

// NodeJS signal info: <https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits>
// // // ref: <https://github.com/denoland/deno/pull/4696/files> , <https://github.com/denoland/deno/issues/2339>

// import { onSignal } from 'https://deno.land/std/signal/mod.ts';
// const handle = onSignal(Deno.Signal.SIGINT, () => {
// 	// 	handle.dispose(); // de-register from receiving further events.
// 	Deno.exit(1);
// });

// const sig = Deno.signal(Deno.Signal.SIGTERM);
// setTimeout(() => {
// 	sig.dispose();
// }, 5000);
// for await (const _ of sig) {
// 	console.log('SIGTERM!');
// }

const spinner = wait('Generating terrain').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading dinosaurs';
	setTimeout(() => {
		spinner.stop();
	}, 1500);
}, 1500);
