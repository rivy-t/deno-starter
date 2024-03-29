// ref: <https://doc.deno.land/builtin/unstable#Deno.consoleSize>

// spell-checker:ignore (names) Deno
// spell-checker:ignore (shell) stty tput
// spell-checker:ignore (shell/CMD) CONOUT
// spell-checker:ignore (utils) DPrint

// const haveDenoRunPerm = await Deno.permissions.query({ name: "run" });
// const haveDenoRunPerm = await Deno.permissions.request({ name: "run" });
// console.log({haveDenoRunPerm});

// export async function isInteractiveAsync(stream: { rid: number }): Promise<boolean> {
//   if (await Deno.permissions.query({ name: "env" })) {
//     return (
//       Deno.isatty(stream.rid) &&
//       Deno.env.get("TERM") !== "dumb" &&
//       !Deno.env.get("CI")
//     );
//   }
//   return Deno.isatty(stream.rid);
// }

const decoder = new TextDecoder();
export const decode = (input?: Uint8Array): string => decoder.decode(input);

const isWinOS = Deno.build.os === 'windows';

type ConsoleSize = { columns: number, rows: number };

async function consoleSizeViaDeno(
	rid: number = Deno.stdout.rid,
	options: {fallbackRIDs: number[], conoutFallback: boolean} = {fallbackRIDs: [Deno.stderr.rid], conoutFallback: true}
): Promise<ConsoleSize | undefined> {
	// `Deno.consoleSize()` is unstable API (as of v1.12+) => deno-lint-ignore no-explicit-any
	// deno-lint-ignore no-explicit-any
	const denoConsoleSize = (Deno as any)?.consoleSize as (rid: number) => { columns: number; rows: number} | undefined;
	if (denoConsoleSize == undefined) return undefined;

	let size: { columns: number; rows: number } | undefined;
	try {
		// * throws if rid is redirected
		size = denoConsoleSize?.(rid);
	} catch {
		size = undefined;
	}
	let fallbackRID;
	while (size == undefined && (fallbackRID = options.fallbackRIDs.shift()) != undefined) {
		// console.warn('fallback to ...', fallbackRID)
		try {
			// * throws if rid is redirected
			size = denoConsoleSize?.(fallbackRID);
		} catch {
			size = undefined;
		}
	}

	if ((size == undefined) && isWinOS && options.conoutFallback) {
		try {
			const conOut = await Deno.open('CONOUT$');
			size = conOut && denoConsoleSize?.(conOut.rid);
			// * throws if rid is redirected
		} catch {
			size = undefined;
		}
	}

	return size;
}

async function consoleSizeViaPowerShell(): Promise<ConsoleSize | undefined> {
	const output = await (() => {
	try {
		const process = Deno.run({
			cmd: ['powershell', '-nonInteractive', '-noProfile', '-executionPolicy', 'unrestricted', '-command', '$Host.UI.RawUI.WindowSize.Width;$Host.UI.RawUI.WindowSize.Height'],
			stdin: 'null',
			stderr: 'null',
			stdout: 'piped',
		});
		return (process.output()).then((out) => decode(out)).finally(() => process.close());
	} catch (_) {
		return Promise.resolve(undefined);
	}})() ?? '';
	const values = output.split(/\s+/).filter((s) => s.length > 0);
	return values.length > 0 ? { columns: Number(values.shift()), rows: Number(values.shift()) } : undefined;
}

async function consoleSizeViaSTTY(): Promise<ConsoleSize | undefined> {
	// * note: `stty size` depends on a TTY connected to STDIN; ie, `stty size </dev/null` will fail
	const output = await (async () => {
	try {
		const process = Deno.run({
			cmd: ['stty', 'size'],
			stdin: 'inherit',
			stderr: 'null',
			stdout: 'piped',
		});
		return (process.output()).then((out) => decode(out)).finally(() => process.close());
	} catch (_) {
		return Promise.resolve(undefined);
	}})() ?? '';
	const values = output.split(/\s+/).filter((s) => s.length > 0).reverse();
	return values.length > 0 ? { columns: Number(values.shift()), rows: Number(values.shift()) } : undefined;
}

async function consoleSizeViaTPUT(): Promise<ConsoleSize | undefined> {
	// * note: `tput` is resilient to STDIN, STDOUT, and STDERR redirects, but requires two system calls
	const cols = await (async () => {
	try {
		const process = Deno.run({
			cmd: ['tput', 'cols'],
			stdin: 'null',
			stderr: 'null',
			stdout: 'piped',
		});
		return (process.output()).then((out) => decode(out)).finally(() => process.close());
	} catch (_) {
		return Promise.resolve(undefined);
	}})() ?? '';
	const lines = await (async () => {
		try {
			const process = Deno.run({
				cmd: ['tput', 'lines'],
				stdin: 'null',
				stderr: 'null',
				stdout: 'piped',
			});
			return (process.output()).then((out) => decode(out)).finally(() => process.close());
		} catch (_) {
			return Promise.resolve(undefined);
	}})() ?? '';
	return (cols.length > 0  && lines.length > 0) ? { columns: Number(cols), rows: Number(lines) } : undefined;
}

const consoleSizes = {
	consoleSizeViaDeno: await consoleSizeViaDeno(),
	consoleSizeViaPowerShell: await consoleSizeViaPowerShell(),
	consoleSizeViaSTTY: await consoleSizeViaSTTY(),
	consoleSizeViaTPUT: await consoleSizeViaTPUT()
}

console.log('stdout', {consoleSizes});
console.log('stderr', {consoleSizes});
