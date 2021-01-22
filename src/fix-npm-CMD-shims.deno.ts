// files: in `which npm.cmd` directory
// pattern: "%_prog%"  "%dp0%\node_modules\rollup\dist\bin\rollup" %*
// regex: "^\s*\x22%_prog%\x22\s+(\x22%dp0%[\\/]node_modules[\\/][^\x22]+\x22)"

// `deno run --allow-... PROG`

// spell-checker:ignore (abbrev/names) Cygwin MSYS SkyPack
// spell-checker:ignore (jargon) templating
// spell-checker:ignore (shell/cmd) COMSPEC PATHEXT

import * as fs from 'https://deno.land/std@0.83.0/fs/mod.ts';
import * as path from 'https://deno.land/std@0.83.0/path/mod.ts';

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

const cmdShimTemplate = `@rem:: \`<%=targetBinName%>\` (*updated* \`npm\` CMD shim)
@setLocal
@echo off
goto :_START_

@rem:: spell-checker:ignore (shell/CMD) COMSPEC PATHEXT ; (bin) <%=targetBinName%>

:set_real_dp0
@rem:: ref: "https://stackoverflow.com/questions/19781569/cmd-failure-of-d0-when-call-quotes-the-name-of-the-batch-file"
@rem:: ref: "https://stackoverflow.com/questions/12141482/what-is-the-reason-for-batch-file-path-referenced-with-dp0-sometimes-changes-o/26851883#26851883"
@rem:: ref: "https://www.dostips.com/forum/viewtopic.php?f=3&t=5057"
set dp0=%~dp0
set "dp0=%dp0:~0,-1%" &@rem:: clip trailing path separator
goto :EOF

:_START_
call :set_real_dp0

IF EXIST "%dp0%\\node.exe" (
    SET "_prog=%dp0%\\node.exe"
) ELSE (
    SET "_prog=node"
    SET PATHEXT=%PATHEXT:;.JS;=;%
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "<%=targetBinPath%>" %*
`;

const isWinOS = Deno.build.os === 'windows';
// const pathSeparator = isWinOS ? /[\\/]/ : /\//;
const pathListSeparator = isWinOS ? /;/ : /:/;
// const paths = Deno.env.get('PATH')?.split(pathListSeparator) || [];
const pathExtensions = (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [];

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
	for (const path_ of paths) {
		for (const extension of extensions) {
			const p = path.join(path_, name) + extension;
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
	for (const path_ of paths) {
		for (const extension of extensions) {
			const p = path.join(path_, name) + extension;
			if (fs.existsSync(p) && (isWinOS || (Deno.lstatSync(p).mode || 0) & 0o111)) {
				yield p;
			}
		}
	}
}

// ToDO: look at `rambda` for automatic handling of async (see <https://www.skypack.dev/view/rambda>)
// inspirations/refs
// * <https://exploringjs.com/es6/ch_iteration.html#sec_take_closing> , <https://2ality.com/2016/10/asynchronous-iteration.html>
// * <https://medium.com/@patarkf/synchronize-your-asynchronous-code-using-javascripts-async-await-5f3fa5b1366d>
// * <https://stackoverflow.com/questions/58668361/how-can-i-convert-an-async-iterator-to-an-array>
// * <https://javascript.info/async-iterators-generators>
// * <https://github.com/selfrefactor/rambda/search?q=async>
// * "Working with async functions"; [Mastering JavaScript Functional Programming, 2ndE [by Federico Kereki]{Packt, 2020-01(Jan)}], pp.137-44

/**
 *  Collect all sequence values into a promised array (`Promise<T[]>`)
 */
async function collect<T>(iterable: AsyncIterable<T> | Iterable<T>) {
	const arr: T[] = [];
	for await (const x of iterable) {
		arr.push(x);
	}
	return arr;
}

/**
 *  Map function (`(element, index) => result`) over sequence values
 */
async function* map<T, U>(
	iterable: AsyncIterable<T> | Iterable<T>,
	fn: (element: T, index: number) => U
) {
	let index = 0;
	for await (const x of iterable) {
		yield fn(x, index);
	}
}

/**
 * Converts a (potentially infinite) sequence into a sequence of length `n`
 */
async function* take<T>(n: number, iterable: AsyncIterable<T> | Iterable<T>) {
	for await (const x of iterable) {
		if (n <= 0) {
			break; // closes iterable
		}
		n--;
		yield x;
	}
}

function head<T>(arr: readonly T[]) {
	return arr.length > 0 ? arr[0] : undefined;
}

// function head<T>(iterable: Iterable<T>) {
// 	const iterator = iterable[Symbol.iterator]();
// 	return iterator.next().value;
// }

function tail<T>(arr: readonly T[]) {
	return arr.slice(1);
}

function first<T>(arr: readonly T[]) {
	return head<T>(arr);
}
function last<T>(arr: readonly T[]) {
	return arr.length > 0 ? arr[arr.length - 1] : undefined;
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

const npmPath = first(await collect(take(1, findExecutable('npm')))) || '';
const npmBinPath = path.dirname(npmPath);

Deno.stdout.writeSync(encoder.encode('`npm` binaries folder found at "' + npmPath + '"' + '\n'));

// ref: [deno issue ~ add `caseSensitive` option to `expandGlob`](https://github.com/denoland/deno/issues/9208)
// ref: [deno/std ~ `expandGlob` discussion](https://github.com/denoland/deno/issues/1856)
// const files = await collect(fs.expandGlob(path.join(npmBinPath, '*.cmd')));
const files = fs.expandGlob(path.join(npmBinPath, '*.cmd'));

// console.log({ npmPath, npmBinPath, files });

// files.forEach((file) => {
// 	const data = decoder.decode(Deno.readFileSync(file.path));
// 	console.log({ file, data });
// });
// for await (const file of files) {
// 	const data = decoder.decode(await Deno.readFile(file.path));
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

const updates = await collect(
	map(files, async function (file) {
		const name = file.path;
		const contentsOriginal = eol.LF(decoder.decode(await Deno.readFile(name)));
		const targetBinPath =
			(contentsOriginal.match(/^[^\S\n]*\x22%_prog%\x22\s+\x22([^\x22]*)\x22.*$/m) || [])[1] ||
			undefined;
		// const contentsUpdated = eol.CRLF(cmdShimTemplate(targetBinPath));
		const targetBinName = targetBinPath ? path.parse(targetBinPath).name : undefined;
		const contentsUpdated = eol.CRLF(_.template(cmdShimTemplate)({ targetBinName, targetBinPath }));
		return {
			name,
			targetBinPath,
			contentsOriginal,
			contentsUpdated,
		};
	})
);

for await (const update of updates) {
	// if (options.debug) {
	// 	console.log({ update });
	// }
	if (update.targetBinPath) {
		Deno.stdout.writeSync(encoder.encode(path.basename(update.name) + '...'));
		Deno.writeFileSync(update.name, encoder.encode(update.contentsUpdated));
		Deno.stdout.writeSync(encoder.encode('updated' + '\n'));
	}
}
