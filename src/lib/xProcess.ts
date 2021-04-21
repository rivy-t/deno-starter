import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import { splitByBareWS } from '../lib/xArgs.ts';
import { argv as xArgv } from '../lib/xArgs.ts';

const isWinOS = Deno.build.os === 'windows';

// needs ~ for best CLI operations
/** * executable string which initiated execution of the current process */
export const arg0 = Deno.env.get('DENO_SHIM_0'); // note: DENO_SHIM_0 == `[runner [runner_args]] name`
/** * argument string for current process (needed for modern Windows argument processing, but generally not useful for POSIX) */
export const args = Deno.env.get('DENO_SHIM_ARGS');

/** * array (aka 'vector') of 'shell'-expanded arguments; simple pass-through of `Deno.args` for non-Windows platforms */
export const argv = () => {
	if (!isWinOS) return Deno.args; // pass-through of `Deno.args` for non-Windows platforms
	return xArgv(args || Deno.args);
};

/** * path string of main script file (best guess from all available sources) */
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

/** * name of main script file (best guess from all available sources) */
export const name = Path.parse(path).name;

/** * information related to any 'shim'-executable initiating the main script, when available */
export const shim = {
	// useful ~ for Windows modification of parent environment (needed for creation of equivalents for enhanced-`cd` (`enhan-cd`, `goto`, `scd`, ...) and `source` applications)
	/** * path of pipe file (an escape hatch which allows modification of parent environment (variables and CWD)) */
	PIPE: Deno.env.get('DENO_SHIM_PIPE'),
	// implementation detail // ToDO? remove as implementation detail?
	/** * executable path of secondary shim (when needed; generally defined only for Windows) */
	EXEC: Deno.env.get('DENO_SHIM_EXEC'),
};
