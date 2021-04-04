// ref: <https://doc.deno.land/builtin/unstable#Deno.consoleSize>

// spell-checker:ignore (shell/CMD) CONOUT

function consoleSize(rid: number) {
	let size: { columns: number; rows: number } | undefined;
	try {
		size = Deno.consoleSize(rid);
	} catch {
		size = void 0;
	}
	return size;
}

const conOut = Deno.openSync('CONOUT$');
const conOutSize = consoleSize(conOut.rid);
const stdoutSize = consoleSize(Deno.stdout.rid);

console.log({ conOutSize, stdoutSize });
