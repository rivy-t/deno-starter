// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import { exists, existsSync } from 'https://deno.land/std@0.83.0/fs/exists.ts';
import { expandGlob, expandGlobSync } from 'https://deno.land/std@0.83.0/fs/expand_glob.ts';
import { walk, walkSync } from 'https://deno.land/std@0.83.0/fs/walk.ts';
const fs = { exists, existsSync, expandGlob, expandGlobSync, walk, walkSync };

import * as Me from './lib/me.ts';
import { splitByBareWS } from './lib/parse.ts';

// const isWinOS = Deno.build.os === 'windows';
// const pathSeparator = isWinOS ? /[\\/]/ : /\//;
// const pathListSeparator = isWinOS ? /;/ : /:/;
// const paths = Deno.env.get('PATH')?.split(pathListSeparator) || [];
// const pathExtensions = (isWinOS && Deno.env.get('PATHEXT')?.split(pathListSeparator)) || [];
// const pathCaseSensitive = !isWinOS;

const me = Me.info();
// console.warn(me.name, { me });
if (Deno.build.os === 'windows' && !me[0]) {
	console.warn(
		me.name +
			': warn: diminished capacity; full function requires an enhanced runner (use `dxr` or install with `dxi`)',
	);
}

const args = me.ARGS || Deno.args.join(' ');
const argv = splitByBareWS(args);

// console.warn(me.name, { args, argv });

// const dprintConfigReS = /[.]?dprint(rc)?[.]json/;
const dprintConfigPaths = ['.dprintrc.json', '.dprint.json', 'dprint.json'];
const dprintConfig = dprintConfigPaths.filter(fs.existsSync);

if (dprintConfig) {
	const runOptions: Deno.RunOptions = {
		cmd: ['dprint', ...['fmt', ...argv]],
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
		// env: { DENO_SHIM_0: targetPath, DENO_SHIM_ARGS: targetArgs },
	};
} else {
	const runOptions: Deno.RunOptions = {
		cmd: ['deno', ...['fmt', ...argv]],
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
		// env: { DENO_SHIM_0: targetPath, DENO_SHIM_ARGS: targetArgs },
	};
	// console.warn(me.name, { runOptions });
	const process = Deno.run(runOptions);
	const status = await process.status();
	Deno.exit(status.success ? 0 : status.code);
}
