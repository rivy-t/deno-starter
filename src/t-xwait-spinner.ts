// spell-checker:ignore (vars) arr globstar gmsu nullglob PATHEXT

import { wait } from 'https://deno.land/x/wait/mod.ts';

// ! unfortunately, signals are NIXy-only as of 2021-04 (unimplemented errors on Windows)

// NodeJS signal info: <https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits>
// // // ref: <https://github.com/denoland/deno/pull/4696/files> , <https://github.com/denoland/deno/issues/2339>

// import { onSignal } from 'https://deno.land/std/signal/mod.ts';
// const handle = onSignal(Deno.Signal.SIGINT, () => {
// 	// 	handle.dispose(); // de-register from receiving further events.
// 	Deno.exit(1);
// });

// const sig = Deno.signal(Deno.Signal.SIGTERM);
// setTimeout(() => {
// 	sig.dispose();
// }, 5000);
// for await (const _ of sig) {
// 	console.log('SIGTERM!');
// }

const spinner = wait('Generating terrain').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Breeding dinosaurs\nLoading wagons';
	setTimeout(() => {
		spinner.stop();
	}, 1500);
}, 1500);
