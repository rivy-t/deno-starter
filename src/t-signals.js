// ref: <>
// deno-lint-ignore-file no-undef
[`SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
	process.on(eventType, catchSignal.bind(null, eventType));
});
[`exit`].forEach((eventType) => {
	process.on(eventType, catchExit.bind(null, eventType));
});

function catchSignal(eventType) {
	console.log('Caught signal...', { eventType });
}
function catchExit(eventType) {
	console.log('Now exiting...', { eventType });
}

setTimeout(() => {
	console.log('The service is now finished.');
}, 2000);
