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
	const tokenRe = new RegExp(`^((?:${DQStringReS}|${SQStringReS}|${notQWSReS}+)*)(.*$)`, 'msu');
	while (s) {
		const m = s.match(tokenRe);
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

export function splitByBareWSBalanced(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; note: no character escape sequences are recognized
	const addBalance = true;
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWS()', s });
	const tokenRe = new RegExp(
		`^((?:${DQStringReS}|${SQStringReS}|${notQWSReS}+))(\s+)?(.*$)`,
		'msu'
	);
	let text = '';
	let value = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				// ""?
				if (matchStr[0] === '"') {
					if (addBalance && matchStr[matchStr.length - 1] !== '"') {
						matchStr += '"';
					}
				} else if (matchStr[0] === "'") {
					if (addBalance && matchStr[matchStr.length - 1] !== "'") {
						matchStr += "'";
					}
				}
			}
			text += matchStr;
			arr.push(m[1]);
			s = m[2] ? m[2].replace(/^\s+/, '') : ''; // trim leading whitespace
		} else {
			s = '';
		}
		// console.warn({ _: 'splitByBareWS()', s, m, arr });
	}
	return arr;
}

export type Token = { text: string; value: string; isBrace: boolean };

export function splitToTokenByBareWS(s: string): Array<string> {
	// parse string into tokens separated by unquoted-whitespace
	// * supports both single and double quotes; note: no character escape sequences are recognized
	const arr: Array<string> = [];
	s.replace(/^\s+/, ''); // trim leading whitespace
	// console.warn({ _: 'splitByBareWSBalanced()', s });
	const tokenRe = new RegExp(
		`^((?:${DQStringReS}|${SQStringReS}|${notQWSReS}+))(\s+)?(.*$)`,
		'msu'
	);
	let text = '';
	while (s) {
		const m = s.match(tokenRe);
		if (m) {
			let matchStr = m[1];
			if (matchStr.length > 0) {
				// ""?
				console.warn('here:1');
				if (matchStr[0] === '"') {
					console.warn('here:"', { matchStr });
					// * de-quote
					const spl = matchStr.split('"');
					matchStr = spl[1];
					matchStr = matchStr.replace(/(.)/gmsu, '\\$1');
					// matchStr
				} else if (matchStr[0] === "'") {
					// console.warn("here:'", { matchStr });
					const spl = matchStr.split("'");
					matchStr = spl[1];
					matchStr = matchStr.replace(/(.)/gmsu, '\\$1');
				}
			}
			text += matchStr;
			// console.warn({ text });
			s = m[3] ? m[3].replace(/^\s+/, '') : ''; // trim leading whitespace
			if (m[2] || !s) {
				arr.push(text);
			}
		} else {
			s = '';
		}
	}
	// console.warn({ arr });
	return arr;
}
