// Builds dist/roboeyes.js and dist/config.js (ES modules + .d.ts) with tsc, then dist/roboeyes.global.js for
// plain <script> tags.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
execSync('tsc -p .', { stdio: 'inherit' });
// config.js goes first, since roboeyes.js uses it; their imports and re-exports become one shared scope.
let js = ['dist/config.js', 'dist/roboeyes.js'].map((file) => readFileSync(file, 'utf8')).join('\n')
    .replace(/^(?:import .*|export \* from .*)\n/gm, '');
const names = [...js.matchAll(/^export (?:const|class|function) (\w+)/gm)].map((m) => m[1]);
js = js.replace(/^export /gm, '');
writeFileSync('dist/roboeyes.global.js',
    '/* RoboEyes, script-tag build: everything is on window.RoboEyesLib. Licence and credits below. */\n(function () {\n'
    + js + `\nwindow.RoboEyesLib = { ${names.join(', ')} };\n})();\n`);
console.log('built', names.length, 'exports');
