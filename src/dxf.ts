// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT ; (utils) dprint dprintrc

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import { exists, existsSync } from 'https://deno.land/std@0.83.0/fs/exists.ts';
import { expandGlob, expandGlobSync } from 'https://deno.land/std@0.83.0/fs/expand_glob.ts';
import { walk, walkSync } from 'https://deno.land/std@0.83.0/fs/walk.ts';
const fs = { exists, existsSync, expandGlob, expandGlobSync, walk, walkSync };

import { splitByBareWS } from './lib/xArgs.ts';
import * as Me from './lib/xProcess.ts';

// const isWinOS = Deno.build.os === 'windows';
// const pathSeparator = isWinOS ? /[\\/]/ : /\//;
// const pathListSeparator = isWinOS ? /;/ : /:/;
// const paths = Deno.env.get('PATH')?.split(pathListSeparator) || [];
// const pathExtensions = (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [];
// const pathCaseSensitive = !isWinOS;

// console.warn(Me.name, { Me });

if (Deno.build.os === 'windows' && !Me.arg0) {
	console.warn(
		Me.name +
			': warn: diminished capacity; full function requires an enhanced runner (use `dxr` or install with `dxi`)',
	);
}

const argv = splitByBareWS(Me.argsText || '');

// console.warn(me.name, { args, argv });

const runOptions: Deno.RunOptions = (() => {
	let options: Deno.RunOptions;
	const dprintConfigPaths = ['.dprint.json', 'dprint.json', '.dprintrc.json'];
	const dprintConfigPath = dprintConfigPaths.filter(fs.existsSync);
	if (dprintConfigPath) {
		// console.info('Using `dprint` formatting');
		const dprintConfig = dprintConfigPath ? ['--config', dprintConfigPath[0]] : [];
		const dprintConfigArgs = [...dprintConfig, ...argv];
		const cmd = ['dprint', ...['fmt', ...dprintConfigArgs, ...argv]];
		// console.info({ cmd });
		options = {
			cmd,
			stderr: 'inherit',
			stdin: 'inherit',
			stdout: 'inherit',
			// env: { DENO_SHIM_0: targetPath, DENO_SHIM_ARGS: targetArgs },
		};
	} else {
		// console.info('Using `deno` formatting');
		options = {
			cmd: ['deno', ...['fmt', ...argv]],
			stderr: 'inherit',
			stdin: 'inherit',
			stdout: 'inherit',
			// env: { DENO_SHIM_0: targetPath, DENO_SHIM_ARGS: targetArgs },
		};
	}
	return options;
})();

// console.warn(me.name, { runOptions });
const process = Deno.run(runOptions);
const status = await process.status();
Deno.exit(status.success ? 0 : status.code);
