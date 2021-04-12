import Schema, { Type, string, number, array, unknown } from 'http://esm.sh/computed-types@1.6.0';

// const isType = <T>(t: Type<T>, x: unknown) => { unknown.schema(t).destruct()(x);}

const s = '10';

// console.log(isType(s, s));
console.log(unknown.schema(string).destruct()(s));

function isS(x:unknown) { return unknown.schema(string).destruct()(x); }
