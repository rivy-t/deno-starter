import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import * as xArgs from '../lib/xArgs.ts';

const isWinOS = Deno.build.os === 'windows';

// FixME: problematic transfer of information down to sub-processes
// ?... consume/reset all ENV variables when accessed;
//      this might work if using customized env variables so only xProcess-aware apps would access the variables
//      EXCEPT what of intervening non-xProcess aware app? The sub-process would see the API ENV vars but set for the non-aware parent by the grandparent.
//      Seems to need a variable which is process specific (similar to `GetCommandLine()`) or a way to specify the target sub-process.
// ?... same for SHIM_PIPE? (rename to xProcess_PIPE?)

// FixME: avoid double-expansions of command lines
// ?... use a stop-expansion token; but not transparent, requires coop of user process for option/argument processing
// ?... use separate ENV var for expanded command line (re-quoted) ... sub-processes would only "bareWS" tokenize and de-quote

// needs ~ for best CLI operations
/** * executable string which initiated execution of the current process */
export const arg0 = Deno.env.get('xProcess_ARG0') || Deno.env.get('DENO_SHIM_0'); // note: DENO_SHIM_0 == `[runner [runner_args]] name`
/** * raw argument text string for current process (needed for modern Windows argument processing, but generally not useful for POSIX) */
export const argsText = Deno.env.get('xProcess_ARGX') || Deno.env.get('xProcess_ARGS') ||
	Deno.env.get('DENO_SHIM_ARGS');

/** * array of 'shell'-expanded arguments; simple pass-through of `Deno.args` for non-Windows platforms */
export const args = () => {
	if (!isWinOS) return Deno.args; // pass-through of `Deno.args` for non-Windows platforms
	return xArgs.args(argsText || Deno.args);
};

/** * path string of main script file (best guess from all available sources) */
export const path = (() => {
	const denoExec = Deno.execPath();
	const denoMain = Deno.mainModule;
	const nameFromArg0 = arg0 ? xArgs.tokenizeCLText(arg0).pop() : undefined;
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
