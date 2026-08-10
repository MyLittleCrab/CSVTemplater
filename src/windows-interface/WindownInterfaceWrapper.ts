import * as std from 'qjs:std';
import * as os from 'qjs:os';
import iconv from 'iconv-lite';

import winint from './windows-interface';
import type { AppArguments } from '../types';

const win1251 = 'win1251';
const tmpFile = './config_form.ps1';
const responseFile = './interface_response.json';

export default function openWinInterface(): AppArguments {
    std.writeFile(tmpFile, iconv.encode(winint, win1251));

    const command = `powershell -ExecutionPolicy Bypass -File "${tmpFile}" 2>&1`;
    const pipe = std.popen(command, "r");

    const responseAB = pipe.readAsArrayBuffer();
    const exitCode = pipe.close();

    const output = iconv.decode(responseAB, win1251);

    os.remove(tmpFile);

    if (exitCode !== 0) {
        console.log(`❌ Код возврата: ${exitCode}`);
        console.log("Вывод (stdout+stderr):\n", output || "(пусто)");
    } else {
        console.log('Done');
    }

    let responseFileText = std.loadFile(responseFile);
    responseFileText = responseFileText.charCodeAt(0) === 0xfeff ? responseFileText.slice(1) : responseFileText;

    os.remove(responseFile);

    return JSON.parse(responseFileText) as AppArguments;
}
