// Builds dist/roboeyes.js, dist/config.js and dist/defaultConfig.json (ES modules + .d.ts) with tsc, then dist/roboeyes.global.js for
// plain <script> tags.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
execSync('tsc -p .', { stdio: 'inherit' });
// config.js goes first, since roboeyes.js uses it; their imports and re-exports become one shared scope.
// The JSON import becomes the JSON itself, since a script tag cannot import it.
const defaults = readFileSync('src/defaultConfig.json', 'utf8');
let js = ['dist/config.js', 'dist/speech.js', 'dist/roboeyes.js'].map((file) => readFileSync(file, 'utf8')).join('\n')
    .replace(/^import defaultConfigJson .*\n/m, () => `const defaultConfigJson = ${defaults};\n`)
    .replace(/^(?:import .*|export (?:\*|\{[^}]*\}) from .*)\n/gm, '');
const names = [...js.matchAll(/^export (?:const|class|function) (\w+)/gm)].map((m) => m[1]);
js = js.replace(/^export /gm, '');
writeFileSync('dist/roboeyes.global.js',
    '/* RoboEyes, script-tag build: everything is on window.RoboEyesLib. Licence and credits below. */\n(function () {\n'
    + js + `\nwindow.RoboEyesLib = { ${names.join(', ')} };\n})();\n`);
console.log('built', names.length, 'exports');
