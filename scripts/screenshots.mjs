// Renders every mood to screenshots/<mood>.png in headless Firefox: serves scripts/screenshots.html, which posts
// each canvas back. Needs `npm run dist` first and firefox on PATH. Usage: node scripts/screenshots.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'screenshots');
fs.mkdirSync(out, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'roboeyes-ff-'));

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', (d) => (body += d));
        req.on('end', () => {
            if (req.url === '/done') {
                res.end();
                firefox.kill();
                server.close();
                return;
            }
            fs.writeFileSync(path.join(out, `${req.url.slice('/save/'.length)}.png`), Buffer.from(body.split(',')[1], 'base64'));
            res.end();
        });
        return;
    }
    const file = req.url === '/' ? path.join(root, 'scripts/screenshots.html') : path.join(root, req.url);
    try {
        res.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : 'text/html');
        res.end(fs.readFileSync(file));
    } catch {
        res.statusCode = 404;
        res.end();
    }
}).listen(8765);

const firefox = spawn('firefox', ['--headless', '--no-remote', '--profile', profile, 'http://localhost:8765/'], { stdio: 'ignore' });
firefox.on('exit', () => fs.rmSync(profile, { recursive: true, force: true }));
