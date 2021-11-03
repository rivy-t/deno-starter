import * as $colors from 'https://deno.land/std@0.113.0/fmt/colors.ts';

import * as $xWait from 'file://c:/users/Roy/OneDrive/Projects/deno/dxx/repo.GH/src/lib/xWait/$mod.ts';

const ok = Object.keys;
const s = $xWait.symbolStrings;
for (const type of ok(s)) {
	for (const tag of ok(s[type])) {
		const str = s[type][tag];
		const strBare = $colors.stripColor(str);
		console.log(
			'>' + str + '<',
			type,
			tag,
			`; size = ${strBare.length} ; codePoint(s) = { ${
				strBare.split('').map((s) => s.codePointAt(0)?.toString(16)).join('+')
			} }`,
		);

		// const symbolStringAsArray = new TextEncoder().encode(symbolString);
		// console.log(type, tag, '>' + symbolString + '<', symbolStringAsArray);
	}
}
