// Builds dist/roboeyes.js (ES module + .d.ts) with tsc, then dist/roboeyes.global.js for plain <script> tags.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
execSync('tsc -p .', { stdio: 'inherit' });
let js = readFileSync('dist/roboeyes.js', 'utf8');
const names = [...js.matchAll(/^export (?:const|class|function) (\w+)/gm)].map((m) => m[1]);
js = js.replace(/^export /gm, '');
writeFileSync('dist/roboeyes.global.js',
    '/* RoboEyes, script-tag build: everything is on window.RoboEyesLib. Licence and credits below. */\n(function () {\n'
    + js + `\nwindow.RoboEyesLib = { ${names.join(', ')} };\n})();\n`);
console.log('built', names.length, 'exports');
