import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import { splitByBareWS } from '../lib/parse.ts';

export function info() {
	const shimInfo = {
		// needs ~ for best CLI operations
		0: Deno.env.get('DENO_SHIM_0'), // executable string which initiated execution of the current process
		ARGS: Deno.env.get('DENO_SHIM_ARGS'), // argument string for current process (needed for modern Windows argument processing (CMD/PowerShell defer to process for argument processing); generally not useful for POSIX as shell will have already processed the command line)
		// useful ~ for Windows modification of parent environment (needed for creation of equivalents for `cd` and `source` applications)
		PIPE: Deno.env.get('DENO_SHIM_PIPE'), // path of pipe file (an escape hatch which allows modification of parent environment (variables and CWD))
		// implementation detail
		EXEC: Deno.env.get('DENO_SHIM_EXEC'), // executable path of secondary shim (when needed; generally windows only) // ToDO? remove as implementation detail?
	};
	const denoExec = Deno.execPath();
	const denoMain = Deno.mainModule;
	// note: DENO_SHIM_0 == `[runner [runner_args]] name`
	const shim0Tokens = splitByBareWS(shimInfo[0] || '');
	const nameFromShim0 = shim0Tokens.pop() || '';
	const path = nameFromShim0
		? nameFromShim0
		: !Path.basename(denoExec).match(/^deno([.]exe)?$/)
		? denoExec
		: denoMain;
	const name = Path.parse(path).name;
	return { ...shimInfo, path, name };
}
