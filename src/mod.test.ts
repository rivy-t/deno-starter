import { assertEquals } from '../test/test_deps.ts';
import { getHelloWorld } from './mod.ts';

Deno.test({
	name: 'first test',
	fn(): void {
		assertEquals(getHelloWorld(), '\x1b[1mHello World\x1b[22m');
	},
});
