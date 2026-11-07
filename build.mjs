// Builds dist/robobuddy.js, dist/config.js and dist/defaultConfig.json (ES modules + .d.ts) with tsc, then dist/defaultConfig.js and
// dist/robobuddy.global.js for plain <script> tags.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
execSync('tsc -p .', { stdio: 'inherit' });
const defaults = readFileSync('src/defaultConfig.json', 'utf8');
// config.js takes the defaults from a script module instead of JSON, which a page that only allows scripts can still load.
const jsonImport = "from './defaultConfig.json' with { type: 'json' };";
const config = readFileSync('dist/config.js', 'utf8');
if (!config.includes(jsonImport)) throw new Error('dist/config.js no longer imports defaultConfig.json as expected');
writeFileSync('dist/defaultConfig.js', `export default ${defaults.trim()};\n`);
writeFileSync('dist/config.js', config.replace(jsonImport, "from './defaultConfig.js';"));
// config.js goes first, since robobuddy.js uses it; their imports and re-exports become one shared scope.
// The defaults import becomes the defaults themselves, since a script tag cannot import them.
let js = ['dist/config.js', 'dist/speech.js', 'dist/robobuddy.js'].map((file) => readFileSync(file, 'utf8')).join('\n')
    .replace(/^import defaultConfigJson .*\n/m, () => `const defaultConfigJson = ${defaults};\n`)
    .replace(/^(?:import .*|export (?:\*|\{[^}]*\}) from .*)\n/gm, '');
const names = [...js.matchAll(/^export (?:const|class|function) (\w+)/gm)].map((m) => m[1]);
js = js.replace(/^export /gm, '');
writeFileSync('dist/robobuddy.global.js',
    '/* RoboBuddy, script-tag build: everything is on window.RoboBuddyLib. Licence and credits below. */\n(function () {\n'
    + js + `\nwindow.RoboBuddyLib = { ${names.join(', ')} };\n})();\n`);
console.log('built', names.length, 'exports');
