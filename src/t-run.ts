const process = Deno.run({
	cmd: ['stty', 'size'],
	// stdin: 'null',
	// stderr: 'null',
	// stdout: 'piped',
});

console.log(process);
