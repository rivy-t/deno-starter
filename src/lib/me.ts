import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';

import { quotedTokens } from '../lib/parse.ts';

export function info() {
	const shimInfo = {
		0: Deno.env.get('DENO_SHIM_0'),
		ARGS: Deno.env.get('DENO_SHIM_ARGS'),
		PIPE: Deno.env.get('DENO_SHIM_PIPE'),
	};
	const denoExec = Deno.execPath();
	const denoMain = Deno.mainModule;
	// DENO_SHIM_0 => name | "runner" ... "name"
	const shim0Tokens = quotedTokens(shimInfo[0] || '');
	const nameFromShim0 = shim0Tokens.pop() || '';
	const path = nameFromShim0
		? nameFromShim0
		: !Path.basename(denoExec).match(/^deno([.]exe)?$/)
		? denoExec
		: denoMain;
	const name = Path.parse(path).name;
	return { 0: shimInfo['0'], ARGS: shimInfo.ARGS, PIPE: shimInfo.PIPE, path, name };
}
