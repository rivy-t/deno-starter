module.exports = {
	printWidth: 100,
	singleQuote: true,
	useTabs: true,
	tabWidth: 2,
	overrides: [
		{
			files: ['*.md', '*.mkd', '*.markdown'],
			options: {
				// ToDO: [2020-01-19; rivy] tabWidth ~ set to 4 when https://github.com/prettier/prettier/issues/5019 is fixed
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
};
