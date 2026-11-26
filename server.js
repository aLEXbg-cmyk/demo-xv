/**
 * Servidor Web local ligero (Cero dependencias)
 * Permite ejecutar la aplicación web en cualquier navegador con 'npm start' o 'node server.js'
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env si existe
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [k, ...v] = trimmed.split('=');
                process.env[k.trim()] = v.join('=').trim();
            }
        }
    }
} catch (e) {}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv; charset=UTF-8'
};

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];

    // Soporte para API de confirmaciones (Vercel Serverless Function)
    if (cleanUrl === '/api/confirmaciones') {
        let bodyStr = '';
        req.on('data', chunk => { bodyStr += chunk; });
        req.on('end', () => {
            req.body = bodyStr;
            try {
                const apiHandler = require('./api/confirmaciones.js');
                apiHandler(req, res);
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    if (cleanUrl === '/') cleanUrl = '/index.html';

    let filePath = path.join(PUBLIC_DIR, cleanUrl);

    // Seguridad básica para evitar salir del directorio público
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('403 Prohibido');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`<h1>404 No encontrado</h1><p>El recurso ${cleanUrl} no existe.</p>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[MVC] Invitacion de XV Anos (Arquitectura MVC - NetBeans)`);
    console.log(`[OK] Servidor ejecutandose en: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
