// files: in `which npm.cmd` directory
// pattern: "%_prog%"  "%dp0%\node_modules\rollup\dist\bin\rollup" %*
// regex: "^\s*\x22%_prog%\x22\s+(\x22%dp0%[\\/]node_modules[\\/][^\x22]+\x22)"

// `deno run --allow-... PROG`

// spell-checker:ignore (shell/cmd) COMSPEC PATHEXT

import { expandGlobSync } from 'https://deno.land/std@0.83.0/fs/mod.ts';

const shimTemplate = `
@setLocal
@echo off
goto :_START_

:set_real_dp0
@rem:: ref: "https://stackoverflow.com/questions/19781569/cmd-failure-of-d0-when-call-quotes-the-name-of-the-batch-file"
@rem:: ref: "https://stackoverflow.com/questions/12141482/what-is-the-reason-for-batch-file-path-referenced-with-dp0-sometimes-changes-o/26851883#26851883"
@rem:: ref: "https://www.dostips.com/forum/viewtopic.php?f=3&t=5057"
set dp0=%~dp0
set "dp0=%dp0:~0,-1%" &@rem:: clip trailing path separator
goto :EOF

:_START_
call :set_real_dp0

IF EXIST "%dp0%\\node.exe" (
    SET "_prog=%dp0%\\node.exe"
) ELSE (
    SET "_prog=node"
    SET PATHEXT=%PATHEXT:;.JS;=;%
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "\${binPath}" %*
`;

const isWinOS = Deno.build.os === 'windows';
const pathSeparator = isWinOS ? '[\\/]' : '/';
const pathListSeparator = isWinOS ? ';' : ':';

const npmBinPath = './{kb,fix,djs}*';
const files = Array.from(expandGlobSync(npmBinPath));

files.forEach((file) => console.log({ file }));

console.log({ mainModule: Deno.mainModule });
console.log({ PATH: Deno.env.get('PATH') });
