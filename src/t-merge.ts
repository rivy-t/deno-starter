// import merge from 'https://deno.land/x/lodash@4.17.15-es/merge.js';
import merge from 'https://cdn.esm.sh/v54/deepmerge@4.2.2/es2021/deepmerge.js';

const a = { a: 1 };
const b = { Filter: { level: 1 } };
const c = { c: 3, Filter: { level: 2, note: 'this' }, [Symbol('x')]: 10 };

const o = merge({}, a, b, c);

console.log({ o, c });
