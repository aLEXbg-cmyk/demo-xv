/**
 * ========================================================
 * API ENDPOINT SERVERLESS: /api/confirmaciones
 * Compatible con Vercel Serverless Functions y Node.js local.
 * Gestiona la persistencia de confirmaciones en tiempo real en MySQL.
 * ========================================================
 */

const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
    if (pool) return pool;

    const host = process.env.MYSQL_HOST || process.env.DB_HOST;
    const user = process.env.MYSQL_USER || process.env.DB_USER;
    const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
    const database = process.env.MYSQL_DATABASE || process.env.DB_NAME;
    const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
    
    const isCloud = (process.env.MYSQL_SSL === 'true' || 
                     process.env.DB_SSL === 'true' || 
                     (host && (host.includes('tidb') || host.includes('aiven') || host.includes('aws') || host.includes('cleardb'))));
    const ssl = isCloud ? { rejectUnauthorized: false } : undefined;

    if (!host || !user) {
        return null;
    }

    pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        ssl,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    });

    return pool;
}

let tableInitialized = false;

async function initTable(p) {
    if (tableInitialized) return;
    await p.query(`
        CREATE TABLE IF NOT EXISTS confirmaciones (
            id VARCHAR(60) PRIMARY KEY,
            tipo VARCHAR(30) DEFAULT 'familia',
            nombre VARCHAR(180) NOT NULL,
            asistencia TINYINT(1) NOT NULL DEFAULT 1,
            pases INT NOT NULL DEFAULT 1,
            asistentes TEXT,
            telefono VARCHAR(30),
            mensaje TEXT,
            fecha_confirmacion VARCHAR(60),
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        if (typeof res.status === 'function') {
            res.status(200).end();
        } else {
            res.writeHead(200);
            res.end();
        }
        return;
    }

    const p = getPool();
    if (!p) {
        const respuesta = {
            configured: false,
            message: 'MySQL no configurado en variables de entorno. Operando en modo local.',
            data: []
        };
        if (typeof res.status === 'function') {
            res.status(200).json(respuesta);
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
            res.end(JSON.stringify(respuesta));
        }
        return;
    }

    try {
        await initTable(p);

        // 1. OBTENER TODAS LAS CONFIRMACIONES
        if (req.method === 'GET') {
            const [rows] = await p.query('SELECT * FROM confirmaciones ORDER BY creado_en DESC');
            const data = rows.map(r => ({
                id: r.id,
                tipo: r.tipo,
                nombre: r.nombre,
                asistencia: Boolean(r.asistencia),
                pases: parseInt(r.pases, 10),
                asistentes: r.asistentes ? (typeof r.asistentes === 'string' ? JSON.parse(r.asistentes) : r.asistentes) : [r.nombre],
                telefono: r.telefono,
                mensaje: r.mensaje,
                fechaConfirmacion: r.fecha_confirmacion
            }));

            const payload = { configured: true, success: true, count: data.length, data };
            if (typeof res.status === 'function') {
                res.status(200).json(payload);
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify(payload));
            }
            return;
        }

        // 2. GUARDAR / ACTUALIZAR CONFIRMACIÓN
        if (req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch (e) { body = {}; }
            }

            const { id, tipo, nombre, asistencia, pases, asistentes, telefono, mensaje, fechaConfirmacion } = body || {};

            if (!id || !nombre) {
                const errPayload = { success: false, error: 'Faltan campos obligatorios (id, nombre)' };
                if (typeof res.status === 'function') res.status(400).json(errPayload);
                else { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(errPayload)); }
                return;
            }

            const asistentesJson = JSON.stringify(asistentes || [nombre]);
            const query = `
                INSERT INTO confirmaciones 
                (id, tipo, nombre, asistencia, pases, asistentes, telefono, mensaje, fecha_confirmacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                tipo = VALUES(tipo),
                nombre = VALUES(nombre),
                asistencia = VALUES(asistencia),
                pases = VALUES(pases),
                asistentes = VALUES(asistentes),
                telefono = VALUES(telefono),
                mensaje = VALUES(mensaje),
                fecha_confirmacion = VALUES(fecha_confirmacion);
            `;

            await p.query(query, [
                id,
                tipo || 'familia',
                nombre,
                asistencia ? 1 : 0,
                pases || 1,
                asistentesJson,
                telefono || '',
                mensaje || '',
                fechaConfirmacion || new Date().toLocaleString('es-MX')
            ]);

            const okPayload = { success: true, message: 'Confirmación registrada exitosamente en MySQL' };
            if (typeof res.status === 'function') res.status(200).json(okPayload);
            else { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(okPayload)); }
            return;
        }

        // 3. ELIMINAR CONFIRMACIÓN
        if (req.method === 'DELETE') {
            const urlParts = (req.url || '').split('?');
            const searchParams = new URLSearchParams(urlParts[1] || '');
            let id = searchParams.get('id');

            if (!id && req.body) {
                let body = req.body;
                if (typeof body === 'string') {
                    try { body = JSON.parse(body); } catch (e) { body = {}; }
                }
                id = body.id;
            }

            if (!id) {
                const errPayload = { success: false, error: 'Falta el ID del registro a eliminar' };
                if (typeof res.status === 'function') res.status(400).json(errPayload);
                else { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(errPayload)); }
                return;
            }

            await p.query('DELETE FROM confirmaciones WHERE id = ?', [id]);
            const okPayload = { success: true, message: 'Registro eliminado de MySQL' };
            if (typeof res.status === 'function') res.status(200).json(okPayload);
            else { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(okPayload)); }
            return;
        }

        const notAllowed = { error: 'Método no permitido' };
        if (typeof res.status === 'function') res.status(405).json(notAllowed);
        else { res.writeHead(405, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(notAllowed)); }

    } catch (err) {
        console.error('[API MySQL Error]:', err);
        const errObj = { success: false, error: err.message };
        if (typeof res.status === 'function') res.status(500).json(errObj);
        else { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(errObj)); }
    }
};
