// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';
import { exists, existsSync } from 'https://deno.land/std@0.92.0/fs/exists.ts';
import { expandGlob, expandGlobSync } from 'https://deno.land/std@0.92.0/fs/expand_glob.ts';
import { walk, walkSync } from 'https://deno.land/std@0.92.0/fs/walk.ts';
const fs = { exists, existsSync, expandGlob, expandGlobSync, walk, walkSync };

import * as xArgs from './lib/xArgs.ts';
import * as Me from './lib/xProcess.ts';

// console.warn(Me.name, { Me });

if (Deno.build.os === 'windows' && !Me.arg0) {
	console.warn(
		Me.name +
			': warn: diminished capacity; full function requires an enhanced runner (use `dxr` or install with `dxi`)',
		{ Me },
	);
}

// export type ArgIncrement = { arg: string; tailOfArgExpansion: AsyncIterableIterator<string>[]; tailOfArgsText: string; };
// export type ArgIncrementSync = { arg: string; tailOfArgExpansion: string[][]; tailOfArgsText: string };
const { arg: targetPath, tailOfArgExpansion, tailOfArgsText } = await (async () => {
	const it = xArgs.argsIt(Me.argsText || '');
	const itNext = await it.next();
	return !itNext.done ? itNext.value : { arg: '', tailOfArgExpansion: [], tailOfArgsText: '' };
})();

// console.warn({ targetPath, CWD: Deno.cwd() });
if (!targetPath) {
	console.error(`${Me.name}: err!: no target name supplied (use \`${Me.name} TARGET\`)`);
	Deno.exit(1);
} else {
	// console.warn(Me.name, { targetPath });
	// if (!fs.existsSync(targetPath)) {
	// 	console.error(`${Me.name}: err!: target ('${targetPath}') does not exist`);
	// 	Deno.exit(1);
	// }
	const iteratedArgTail = (await Promise.all(tailOfArgExpansion.flatMap(async (it) => {
		const arr: string[] = [];
		for await (const a of it) arr.push(a);
		return arr;
	}))).flat();
	// console.warn(Me.name, { tailOfArgExpansion, iteratedArgTail });

	let shimURL;
	// try {
	shimURL = (new URL(targetPath, 'file://' + Deno.cwd() + '/')).href;
	// } catch {
	// 	shimURL = '';
	// }
	console.warn('dxr', { CWD: Deno.cwd(), targetPath, shimURL });

	const targetArgs = [
		...iteratedArgTail,
		tailOfArgsText,
	].join(' ');
	const denoOptions = ['run', '-A'];
	const runOptions: Deno.RunOptions = {
		cmd: ['deno', ...denoOptions, targetPath, targetArgs],
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
		env: {
			DENO_SHIM_ARG0: `${Me.arg0 ? Me.arg0 : ['deno', ...denoOptions].join(' ')} ${targetPath}`,
			DENO_SHIM_ARGS: targetArgs,
			DENO_SHIM_URL: shimURL,
		},
	};
	console.warn(Me.name, { runOptions });
	const process = Deno.run(runOptions);
	const status = await process.status();
	Deno.exit(status.success ? 0 : status.code);
}
