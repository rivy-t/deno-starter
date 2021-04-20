// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import * as Me from './lib/xProcess.ts';

const me = Me.info();
const meExec = Deno.execPath();
const meMain = Deno.mainModule;

console.warn(me.name, { meExec, meMain, me });

if (Deno.build.os === 'windows' && !me[0]) {
	console.warn(
		me.name +
			': warn: diminished capacity; full functionality requires an enhanced runner (use `dxr` or install with `dxi`)',
	);
}

// Deno.exit(101);
