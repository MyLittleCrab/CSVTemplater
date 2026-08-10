const fs = require('fs');
const path = require('path');

const ps1Path = path.join(__dirname, '..', 'src', 'windows-interface', 'windows-interface.ps1');
const jsPath = path.join(__dirname, '..', 'src', 'windows-interface', 'windows-interface.js');

const ps1 = fs.readFileSync(ps1Path, 'utf8');
const js = 'export default ' + JSON.stringify(ps1) + ';\n';

fs.writeFileSync(jsPath, js);
console.log('Generated ' + jsPath);
