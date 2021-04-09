import * as Path from 'https://deno.land/std@0.83.0/path/mod.ts';
import { splitByBareWS } from '../lib/parse.ts';
export function info() {
    const shimInfo = {
        0: Deno.env.get('DENO_SHIM_0'),
        ARGS: Deno.env.get('DENO_SHIM_ARGS'),
        PIPE: Deno.env.get('DENO_SHIM_PIPE'),
    };
    const denoExec = Deno.execPath();
    const denoMain = Deno.mainModule;
    const shim0Tokens = splitByBareWS(shimInfo[0] || '');
    const nameFromShim0 = shim0Tokens.pop() || '';
    const path = nameFromShim0
        ? nameFromShim0
        : !Path.basename(denoExec).match(/^deno([.]exe)?$/)
            ? denoExec
            : denoMain;
    const name = Path.parse(path).name;
    return { 0: shimInfo['0'], ARGS: shimInfo.ARGS, PIPE: shimInfo.PIPE, path, name };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssSUFBSSxNQUFNLDBDQUEwQyxDQUFDO0FBRWpFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLFVBQVUsSUFBSTtJQUNuQixNQUFNLFFBQVEsR0FBRztRQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNwQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7S0FDcEMsQ0FBQztJQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBRWpDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckQsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM5QyxNQUFNLElBQUksR0FBRyxhQUFhO1FBQ3pCLENBQUMsQ0FBQyxhQUFhO1FBQ2YsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7WUFDbkQsQ0FBQyxDQUFDLFFBQVE7WUFDVixDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ1osTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDbkMsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ25GLENBQUMifQ==