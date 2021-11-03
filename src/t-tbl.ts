import { Table } from 'https://deno.land/x/tbl@1.0.3/mod.ts';

const table = new Table();

table.push([ 'hello', 'world' ]);
table.push([ 'testing', 123 ]);

console.log(table.toString());
