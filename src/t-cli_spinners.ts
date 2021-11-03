import Spinner from 'https://deno.land/x/cli_spinners@v0.0.2/mod.ts';

const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const spinner = Spinner.getInstance();

spinner.start('running step 1');

// Perform long running step 1
await delay(5000);

spinner.setText('running step 2');

// Perform long running step 2
await delay(2500);

spinner.stop();
