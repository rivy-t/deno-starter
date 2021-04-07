export function quotedTokens(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; escapes are not supported
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	while (s !== '') {
		const m = s.match(/^((?:"[^"]*(?:"|$)|'[^']*(?:'|$)|\S+)+)(.*$)/msu);
		if (m) {
			arr.push(m[1]);
			s = m[2] ? m[2].replace(/^\s+/, '') : ''; // trim leading whitespace
		} else {
			s = '';
		}
		// console.warn({ from: 'quotedTokens()', s, m, arr });
	}
	return arr;
}
