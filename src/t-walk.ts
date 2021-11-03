import { walk, walkSync } from 'https://deno.land/std@0.113.0/fs/mod.ts';

const p = 'C:/';
const maxDepth = 1;

for (const entry of walkSync(p, { maxDepth })) {
	console.log(entry.path);
}

// Async
async function printFilesNames(path: string) {
	for await (const entry of walk(path, { maxDepth })) {
		console.log(entry.path);
	}
}

printFilesNames(p).then(() => console.log('Done!'));
