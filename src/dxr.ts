// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

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
	);
}

// export type ArgIncrement = { arg: string; tailOfArgExpansion: AsyncIterableIterator<string>[]; tailOfArgText: string; };
// export type ArgIncrementSync = { arg: string; tailOfArgExpansion: string[][]; tailOfArgText: string };
const { arg: targetPath, tailOfArgExpansion, tailOfArgText } = await (async () => {
	const it = xArgs.argsIt(Me.argsText || '');
	const itNext = await it.next();
	return !itNext.done ? itNext.value : { arg: '', tailOfArgExpansion: [], tailOfArgText: '' };
})();

// console.warn({ targetPath, CWD: Deno.cwd() });

if (!targetPath) {
	console.error(`${Me.name}: err!: no target name supplied (use \`${Me.name} TARGET\`)`);
	Deno.exit(1);
} else {
	// console.warn(Me.name, { targetPath });
	// if (!fs.existsSync('eg/args.ts')) {
	// 	console.error(`${Me.name}: err!: target ('${targetPath}') does not exist`);
	// 	Deno.exit(1);
	// }
	// const targetArgs = [...tailOfArgExpansion.flat(), tailOfArgText].join(' ');
	console.warn(Me.name, { tailOfArgExpansion });
	// for (const aE of tailOfArgExpansion) for await (const a of aE) console.warn({ a });
	const x = await tailOfArgExpansion.flatMap(async (it) => {
		const arr: string[] = [];
		for await (const a of it) arr.push(a);
		return arr;
	});
	console.warn(Me.name, { x });

	const targetArgs = [
		// FixME ~ tailOfArgExpansion is incorrect (here and/or in filenameExpansionIter/Sync)
		// ...tailOfArgExpansion.map(async (v) => {
		// 	const arr = [];
		// 	for await (const e of v) arr.push(e);
		// 	return arr.join(' ');
		// }),
		tailOfArgText,
	].join(' ');
	const denoOptions = ['run', '-A'];
	const runOptions: Deno.RunOptions = {
		cmd: ['deno', ...denoOptions, targetPath, targetArgs],
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
		env: {
			DENO_SHIM_0: `${Me.arg0 ? Me.arg0 : ['deno', ...denoOptions].join(' ')} ${targetPath}`,
			DENO_SHIM_ARGS: targetArgs,
		},
	};
	// console.warn(me.name, { runOptions });
	const process = Deno.run(runOptions);
	const status = await process.status();
	Deno.exit(status.success ? 0 : status.code);
}
