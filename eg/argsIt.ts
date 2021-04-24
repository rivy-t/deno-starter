import * as Log from 'https://deno.land/std@0.93.0/log/mod.ts';

import * as xArgs from '../src/lib/xArgs.ts';
import * as Me from '../src/lib/xProcess.ts';

const isWinOS = Deno.build.os === 'windows';

if (isWinOS && !Me.arg0) {
	Log.warning(
		'diminished capacity; full command line processing requires an enhanced runner (use `dxr` or install with `dxi`)',
	);
}

console.log('xProcess:', Me);

const args = Me.argsText;
const argv = Me.args();

const argIts = [];
for await (const argInc of xArgs.argsIt(args || '')) {
	// console.log({ argInc });
	argIts.push(argInc);
}

console.log({ args, argv, argIts, vsDeno: Deno.args });
