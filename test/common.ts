// tests ~ common code

import { Path } from './deps.ts';

export function nameGen(filename: string) {
	return (testName: string) => Path.parse(filename).name + ':' + testName;
}
