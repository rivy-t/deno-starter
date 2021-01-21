// files: in `which npm.cmd` directory
// pattern: "%_prog%"  "%dp0%\node_modules\rollup\dist\bin\rollup" %*
// regex: "^\s*\x22%_prog%\x22\s+(\x22%dp0%[\\/]node_modules[\\/][^\x22]+\x22)"

// `deno run --allow-... PROG`

// spell-checker:ignore (OS) Cygwin MSYS
// spell-checker:ignore (shell/cmd) COMSPEC PATHEXT

import * as fs from 'https://deno.land/std@0.83.0/fs/mod.ts';
import * as path from 'https://deno.land/std@0.83.0/path/mod.ts';

const shimTemplate = `
@setLocal
@echo off
goto :_START_

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

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "\${binPath}" %*
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

function tail<T>(arr: readonly T[]) {
	return arr.slice(1);
}

function first<T>(arr: readonly T[]) {
	return head<T>(arr);
}
function last<T>(arr: readonly T[]) {
	return arr.slice(-1)[0];
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

// ref: [deno issue ~ add `caseSensitive` option to `expandGlob`](https://github.com/denoland/deno/issues/9208)
// ref: [deno/std ~ `expandGlob` discussion](https://github.com/denoland/deno/issues/1856)
// const files = await collect(fs.expandGlob(path.join(npmBinPath, '*.cmd')));
const files = fs.expandGlob(path.join(npmBinPath, '*.cmd'));

// console.log({ npmPath, npmBinPath, files });

const decoder = new TextDecoder(); // default == 'utf-8'
// files.forEach((file) => {
// 	const data = decoder.decode(Deno.readFileSync(file.path));
// 	console.log({ file, data });
// });
// for await (const file of files) {
// 	const data = decoder.decode(await Deno.readFile(file.path));
// 	console.log({ file, data });
// }

const data = await collect(
	map(files, async (file) => {
		const name = file.path;
		const contents = decoder.decode(await Deno.readFile(name)).replace(/\r?\n|\r/g, '\n');
		// const target = contents.match(/^\s*\x22%_prog%\x22\s+(\x22[^\x22]\x22)/gm);
		const target = (contents.match(/^[^\S\n]*\x22%_prog%\x22\s+(\x22[^\x22]*\x22).*$/m) || [])[1];
		return {
			name,
			contents,
			target,
		};
	})
);

console.log({ data });
