-- ========================================================
-- BASE DE DATOS OFICIAL: XV AÑOS LIZETTE GUADALUPE
-- Compatible con MySQL 8.0+, TiDB Cloud y MySQL Workbench
-- ========================================================

CREATE DATABASE IF NOT EXISTS xv_lizette_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE xv_lizette_db;

-- Tabla limpia con los campos EXACTOS del formulario:
CREATE TABLE IF NOT EXISTS confirmaciones (
    id VARCHAR(60) PRIMARY KEY COMMENT 'Folio único de confirmación (Ej: VIP-LIZ-1234)',
    tipo VARCHAR(30) DEFAULT 'familia' COMMENT 'familia o amigo',
    nombre VARCHAR(180) NOT NULL COMMENT 'Nombre de la familia o del invitado',
    asistencia TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Sí asistirá, 0 = No podrá asistir',
    pases INT NOT NULL DEFAULT 1 COMMENT 'Número de lugares reservados',
    asistentes TEXT COMMENT 'Nombres de los integrantes que asistirán',
    telefono VARCHAR(30) COMMENT 'Teléfono de contacto',
    mensaje TEXT COMMENT 'Palabras bonitas y dedicatoria para Lizette',
    fecha_confirmacion VARCHAR(60) COMMENT 'Fecha y hora de la confirmación',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Registro en el servidor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- CONSULTAS RÁPIDAS PARA MYSQL WORKBENCH:
-- ========================================================

-- 1. Ver todas las confirmaciones recibidas (más recientes primero):
SELECT * FROM confirmaciones ORDER BY creado_en DESC;

-- 2. Conteo total de pases de quienes SÍ asistirán:
SELECT SUM(pases) AS total_pases_confirmados FROM confirmaciones WHERE asistencia = 1;

-- 3. Ver todas las palabras bonitas y dedicatorias para Lizette:
SELECT nombre, mensaje, fecha_confirmacion FROM confirmaciones WHERE mensaje IS NOT NULL AND mensaje != '' ORDER BY creado_en DESC;

-- 4. Lista de personas que no podrán asistir:
SELECT nombre, fecha_confirmacion FROM confirmaciones WHERE asistencia = 0;
