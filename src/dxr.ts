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
			': warn: diminished capacity; full function requires an enhanced runner (use `dxr` or install with `dxi`)'
	);
}

const args = me.ARGS || Deno.args.join(' ');
const argv = splitByBareWS(args);
// console.warn(me.name, { args, argv });
const targetPath = argv.shift();
const targetArgs = argv.join(' ');

if (!targetPath) {
	console.error(`${me.name}: err!: no target name supplied (use \`${me.name} TARGET\`)`);
	Deno.exit(1);
} else {
	if (!fs.existsSync(targetPath)) {
		console.error(`${me.name}: err!: target ('${targetPath}') does not exist`);
		Deno.exit(1);
	}
	const runOptions: Deno.RunOptions = {
		cmd: ['deno', ...['run', '-A', targetPath, targetArgs]],
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
		env: { DENO_SHIM_0: targetPath, DENO_SHIM_ARGS: targetArgs },
	};
	// console.warn(me.name, { runOptions });
	const process = Deno.run(runOptions);
	const status = await process.status();
	Deno.exit(status.success ? 0 : status.code);
}
