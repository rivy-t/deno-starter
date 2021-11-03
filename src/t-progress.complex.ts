import ProgressBar from 'https://deno.land/x/progress@v1.2.4/mod.ts';

const total = 100;
const progress = new ProgressBar({
	total,
	complete: '=',
	incomplete: '-',
	display: ':completed/:total hello :time [:bar] :percent',
	// or =>
	// display: ':bar'
	// display: ':bar :time'
	// display: '[:bar]'
	// display: 'hello :bar world'
	// ...
});
let completed = 0;
function run() {
	if (completed <= total) {
		progress.render(completed++);

		setTimeout(function () {
			run();
		}, 100);
	}
}
run();
