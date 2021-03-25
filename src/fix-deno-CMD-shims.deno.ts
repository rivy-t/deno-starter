// files: in `which npm.cmd` directory
// pattern: "%_prog%"  "%dp0%\node_modules\rollup\dist\bin\rollup" %*
// regex: "^\s*\x22%_prog%\x22\s+(\x22%dp0%[\\/]node_modules[\\/][^\x22]+\x22)"

// `deno run --allow-... PROG`

// spell-checker:ignore (abbrev/names) Cygwin MSYS SkyPack
// spell-checker:ignore (jargon) globstar templating
// spell-checker:ignore (libraries) rambda
// spell-checker:ignore (names/people) Frederico Kereki , Packt
// spell-checker:ignore (shell/cmd) COMSPEC ERRORLEVEL PATHEXT
// spell-checker:ignore (words) occurences

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';
import OsPaths from 'https://deno.land/x/os_paths@v6.9.0/src/mod.deno.ts';

// import * as fs from 'https://deno.land/std@0.83.0/fs/mod.ts';
import { exists, existsSync } from 'https://deno.land/std@0.83.0/fs/exists.ts';
import { expandGlob, expandGlobSync } from 'https://deno.land/std@0.83.0/fs/expand_glob.ts';
import { walk, walkSync } from 'https://deno.land/std@0.83.0/fs/walk.ts';
const fs = { exists, existsSync, expandGlob, expandGlobSync, walk, walkSync };

import { collect } from './fn.ts';

// templating engines ~ <https://colorlib.com/wp/top-templating-engines-for-javascript> @@ <https://archive.is/BKYMw>

// lodash
// ref: <https://github.com/denoland/deno/issues/3957>
// ref: <https://ada.is/blog/2020/08/03/using-node-modules-in-deno> @@ <https://archive.is/5xbLy>
// ref: <https://stackoverflow.com/questions/64979829/deno-import-lodash-from-deno-land-x>
//
// import { ld as _ } from 'https://x.nest.land/deno-lodash@1.0.0/mod.ts';
// import _ from 'https://cdn.skypack.dev/lodash-es?dts';
// import * as _ from 'https://cdn.pika.dev/lodash-es@4.17.15';
// import * as _ from 'https://deno.land/x/lodash@4.17.15-es/';
// // * [skypack "pinned" URLs](https://docs.skypack.dev/skypack-cdn/api-reference/pinned-urls-optimized)
// import * as _ from 'https://cdn.skypack.dev/pin/lodash@v4.17.20-4NISnx5Etf8JOo22u9rw/min/lodash.js';
import * as _ from 'https://cdn.skypack.dev/pin/lodash@v4.17.20-4NISnx5Etf8JOo22u9rw/lodash.js';

const decoder = new TextDecoder(); // default == 'utf-8'
const encoder = new TextEncoder(); // default == 'utf-8'

const cmdShimTemplate = `% <%=targetBinName%> (*revised* Deno CMD shim) %
@set _DENO_SHIM_0_=%0
@set "ERRORLEVEL="
@deno.exe "run" <%=target%>
@set "ERRORLEVEL=%ERRORLEVEL%"
@set "_DENO_SHIM_0_="
@set "ERRORLEVEL=" & @goto _undefined_ 2>NUL || @for %%G in ("%COMSPEC%") do @title %%~nG & @"%COMSPEC%" /d/c "@exit %ERRORLEVEL%"
`;

const isWinOS = Deno.build.os === 'windows';
// const pathSeparator = isWinOS ? /[\\/]/ : /\//;
const pathListSeparator = isWinOS ? /;/ : /:/;
// const paths = Deno.env.get('PATH')?.split(pathListSeparator) || [];
const pathExtensions = (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [];
const pathCaseSensitive = !isWinOS;

// influenced by code from <https://github.com/npm/node-which/blob/master/which.js> (ISC License)
// handle PATHEXT for Cygwin or MSYS?

type findFileOptions = {
	paths?: readonly string[];
	extensions?: readonly string[];
};

async function* findExecutable(
	name: string,
	options: findFileOptions = {}
): AsyncIterableIterator<string> {
	const paths = options.paths
		? options.paths
		: (isWinOS ? ['.'] : []).concat(Deno.env.get('PATH')?.split(pathListSeparator) || []);
	const extensions = options.extensions
		? options.extensions
		: (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [''];
	for (const path of paths) {
		for (const extension of extensions) {
			const p = Path.join(path, name) + extension;
			if ((await fs.exists(p)) && (isWinOS || ((await Deno.lstat(p)).mode || 0) & 0o111)) {
				yield p;
			}
		}
	}
}
function* findExecutableSync(
	name: string,
	options: findFileOptions = {}
): IterableIterator<string> {
	const paths = options.paths
		? options.paths
		: (isWinOS ? ['.'] : []).concat(Deno.env.get('PATH')?.split(pathListSeparator) || []);
	const extensions = options.extensions
		? options.extensions
		: (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [''];
	for (const path of paths) {
		for (const extension of extensions) {
			const p = Path.join(path, name) + extension;
			if (fs.existsSync(p) && (isWinOS || (Deno.lstatSync(p).mode || 0) & 0o111)) {
				yield p;
			}
		}
	}
}

// const npmBinPath = './{kb,fix,djs}*';
// const files = Array.from(fs.expandGlobSync(npmBinPath));
// files.forEach((file) => console.log({ file }));

// console.log({ mainModule: Deno.mainModule });
// console.log({ PATH: Deno.env.get('PATH') });
// console.log({ paths, pathExtensions });

// const files = await collect(
// 	take(Infinity, findFile('npm', { extensions: ['', ...pathExtensions] }))
// );
// console.log({ files });

// const npmPath = first(await collect(take(1, findExecutable('npm')))) || '';
// const npmBinPath = Path.dirname(npmPath);

function filterUndefined<T>(ts: (T | undefined)[]): T[] {
	return ts.filter((t: T | undefined): t is T => !!t);
}

function joinDefinedPaths(...paths: (string | undefined)[]): string | undefined {
	if (paths.find((v) => typeof v === 'undefined')) {
		return void 0;
	}
	return Path.join(...(paths as string[]));
}

const denoInstallRoot = joinDefinedPaths(
	Deno.env.get('DENO_INSTALL_ROOT') ?? joinDefinedPaths(OsPaths.home(), '.deno'),
	'bin'
);

Deno.stdout.writeSync(
	encoder.encode(
		'`deno` binaries folder ' +
			(denoInstallRoot ? 'found at "' + denoInstallRoot + '"' : 'not found') +
			'\n'
	)
);

if (!denoInstallRoot) {
	Deno.exit(1);
}

// ref: [deno issue ~ add `caseSensitive` option to `expandGlob`](https://github.com/denoland/deno/issues/9208)
// ref: [deno/std ~ `expandGlob` discussion](https://github.com/denoland/deno/issues/1856)
// const files = await collect(fs.expandGlob(Path.join(npmBinPath, '*.cmd')));
// const files = fs.expandGlob(Path.join(denoInstallRoot, '*.cmd'));
// ... for case-insensitivity use 'walk' regexp instead
// const re = new RegExp(Path.globToRegExp('*.cmd'), pathCaseSensitive ? void 0 : 'i');

const cmdGlob = '*.cmd';
// * disable '`' escape character (by escaping all occurences)
const winGlobEscape = '`';
cmdGlob.replace(winGlobEscape, winGlobEscape + winGlobEscape);
// configure regex (`[\\/]` as path separators, no escape characters (use character sets (`[..]`)instead) )
const re = new RegExp(
	// * remove leading "anchor"
	Path.globToRegExp(cmdGlob, { extended: true, globstar: true, os: 'windows' }).source.replace(
		/^[^]/,
		''
	),
	// * configure case sensitivity
	pathCaseSensitive ? void 0 : 'i'
);

// const s = Path.SEP_PATTERN.
// const res = [/[^\\/]*(?:\\|\/)*$/];
// const res = [/.*/];
const res = [re];
const fileEntries = await collect(
	fs.walkSync(denoInstallRoot, {
		maxDepth: 1,
		match: res,
		// skip: [Path.globToRegExp(denoInstallRoot)],
	})
	// fs.walkSync(denoInstallRoot, { maxDepth: 1, match: [/^[^\/].*\.cmd(?:\\|\/)*$/i] })
	// fs.walkSync(denoInstallRoot, { maxDepth: 1, match: [/^[^\\/]*\.cmd(?:\\|\/)*$/] })
);
console.log({
	denoInstallRoot,
	res,
	source: res[0].source,
	fileEntries,
	SEP_PATTERN: Path.SEP_PATTERN,
});

// console.log({ npmPath, npmBinPath, files });

// files.forEach((file) => {
// 	const data = decoder.decode(Deno.readFileSync(file.Path));
// 	console.log({ file, data });
// });
// for await (const file of files) {
// 	const data = decoder.decode(await Deno.readFile(file.Path));
// 	console.log({ file, data });
// }

const eol = () => {};
eol.newline_ = /\r?\n|\n/g;
eol.CR_ = '\r';
eol.LF_ = '\n';
eol.CRLF_ = '\r\n';
eol.CR = function (s: string) {
	return s.replace(eol.newline_, eol.CR_);
};
eol.CRLF = function (s: string) {
	return s.replace(eol.newline_, eol.CRLF_);
};
eol.LF = function (s: string) {
	return s.replace(eol.newline_, eol.LF_);
};

// const updates = await collect(
// 	map(files, async function (file) {
// 		const name = file.path;
// 		const contentsOriginal = eol.LF(decoder.decode(await Deno.readFile(name)));
// 		const targetBinPath =
// 			(contentsOriginal.match(/^[^\S\n]*\x22%_prog%\x22\s+\x22([^\x22]*)\x22.*$/m) || [])[1] ||
// 			undefined;
// 		// const contentsUpdated = eol.CRLF(cmdShimTemplate(targetBinPath));
// 		const targetBinName = targetBinPath ? Path.parse(targetBinPath).name : undefined;
// 		const contentsUpdated = eol.CRLF(_.template(cmdShimTemplate)({ targetBinName, targetBinPath }));
// 		return {
// 			name,
// 			targetBinPath,
// 			contentsOriginal,
// 			contentsUpdated,
// 		};
// 	})
// );

// for await (const update of updates) {
// 	// if (options.debug) {
// 	// 	console.log({ update });
// 	// }
// 	if (update.targetBinPath) {
// 		Deno.stdout.writeSync(encoder.encode(Path.basename(update.name) + '...'));
// 		Deno.writeFileSync(update.name, encoder.encode(update.contentsUpdated));
// 		Deno.stdout.writeSync(encoder.encode('updated' + '\n'));
// 	}
// }
