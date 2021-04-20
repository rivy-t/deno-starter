import * as Me from '../src/lib/me.ts';
import * as Parse from '../src/lib/parse.ts';

console.log('processInfo:', Me.info());

const args = Me.info().ARGS;
const argv = Parse.argv(args);

console.log({ args, argv });
