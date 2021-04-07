const DQStringReS = '"[^"]*(?:"|$)'; // double-quoted string (unbalanced at end-of-line is allowed)
const SQStringReS = "'[^']*(?:'|$)"; // single-quoted string (unbalanced at end-of-line is allowed)
const DQStringStrictReS = '"[^"]*"'; // double-quoted string (quote balance is required)
const SQStringStrictReS = "'[^']*'"; // single-quoted string (quote balance is required)

const notQWSReS = `(?:(?!["']|\\s).)`; // non-quote, non-whitespace character

export function splitByBareWS(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; note: no character escape sequences are recognized
	const addBalance = true;
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWS()', s });
	while (s) {
		const m = s.match(
			new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${notQWSReS}+)*)(.*$)`, 'msu')
		);
		if (m) {
			arr.push(m[1]);
			s = m[2] ? m[2].replace(/^\s+/, '') : ''; // trim leading whitespace
		} else {
			s = '';
		}
		// console.warn({ _: 'splitByBareWS()', s, m, arr });
	}
	return arr;
}
