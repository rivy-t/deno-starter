// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

import { exists, existsSync } from 'https://deno.land/std@0.83.0/fs/exists.ts';
import { expandGlob, expandGlobSync } from 'https://deno.land/std@0.83.0/fs/expand_glob.ts';
import { walk, walkSync } from 'https://deno.land/std@0.83.0/fs/walk.ts';
const fs = { exists, existsSync, expandGlob, expandGlobSync, walk, walkSync };

import { argsIt } from './lib/xArgs.ts';
import * as Me from './lib/xProcess.ts';

// console.warn(Me.name, { Me });

if (Deno.build.os === 'windows' && !Me.arg0) {
	console.warn(
		Me.name +
			': warn: diminished capacity; full function requires an enhanced runner (use `dxr` or install with `dxi`)',
	);
}

const { arg: targetPath, tailOfArgText: targetArgs } = await (async () => {
	const it = argsIt(Me.argsText || '');
	const itNext = await it.next();
	return !itNext.done ? itNext.value : {};
})();

if (!targetPath) {
	console.error(`${Me.name}: err!: no target name supplied (use \`${Me.name} TARGET\`)`);
	Deno.exit(1);
} else {
	if (!fs.existsSync(targetPath)) {
		console.error(`${Me.name}: err!: target ('${targetPath}') does not exist`);
		Deno.exit(1);
	}
	const denoOptions = ['run', '-A'];
	const runOptions: Deno.RunOptions = {
		cmd: ['deno', ...denoOptions, targetPath, targetArgs || ''],
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
		env: {
			DENO_SHIM_0: `${Me.arg0 ? Me.arg0 : ['deno', ...denoOptions].join(' ')} ${targetPath}`,
			DENO_SHIM_ARGS: targetArgs || '',
		},
	};
	// console.warn(me.name, { runOptions });
	const process = Deno.run(runOptions);
	const status = await process.status();
	Deno.exit(status.success ? 0 : status.code);
}
