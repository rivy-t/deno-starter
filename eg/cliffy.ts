import { Command } from 'https://deno.land/x/cliffy/command/mod.ts';

await new Command()
	.stopEarly() // <-- enable stop early
	.option('-d, --debug-level <level:string>', 'Debug level.')
	.arguments('[script:string] [...args:number]')
	.action((options: any, script: string, args: string[]) => {
		console.log('options:', options);
		console.log('script:', script);
		console.log('args:', args);
	})
	.parse(Deno.args);
