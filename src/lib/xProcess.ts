import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import { splitByBareWS } from '../lib/xArgs.ts';
import { argv as xArgv } from '../lib/xArgs.ts';

const isWinOS = Deno.build.os === 'windows';

// needs ~ for best CLI operations
// * executable string which initiated execution of the current process
export const arg0 = Deno.env.get('DENO_SHIM_0'); // note: DENO_SHIM_0 == `[runner [runner_args]] name`
// * argument string for current process (needed for modern Windows argument processing (CMD/PowerShell defer to process for argument processing); generally not useful for POSIX as shell will have already processed the command line)
export const args = Deno.env.get('DENO_SHIM_ARGS');

export const argv = () => {
	if ((args == undefined) && !isWinOS) return Deno.args; // undefined/null => return Deno.args
	return xArgv(args || Deno.args);
};

export const path = (() => {
	const denoExec = Deno.execPath();
	const denoMain = Deno.mainModule;
	const nameFromArg0 = arg0 ? splitByBareWS(arg0).pop() : undefined;
	return nameFromArg0
		? nameFromArg0
		: !Path.basename(denoExec).match(/^deno([.]exe)?$/)
		? denoExec
		: denoMain;
})();

export const name = Path.parse(path).name;

export const shim = {
	// useful ~ for Windows modification of parent environment (needed for creation of equivalents for enhanced-`cd` (`enhan-cd`, `goto`, `scd`, ...) and `source` applications)
	PIPE: Deno.env.get('DENO_SHIM_PIPE'), // path of pipe file (an escape hatch which allows modification of parent environment (variables and CWD))
	// implementation detail`
	EXEC: Deno.env.get('DENO_SHIM_EXEC'), // executable path of secondary shim (when needed; generally windows only) // ToDO? remove as implementation detail?
};
