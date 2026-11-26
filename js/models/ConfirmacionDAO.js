/**
 * ========================================================
 * MODELO / DAO: ConfirmacionDAO.js
 * Implementa el patrón Data Access Object (DAO) estándar de NetBeans
 * para gestionar persistencia, consultas filtradas, analítica y exportación.
 * ========================================================
 */

class ConfirmacionDAO {
    constructor() {
        this.storageKey = "xv_lizette_confirmaciones_db";
        this.inicializar();
    }

    /**
     * Inicializa la base de datos local limpia sin datos demo
     */
    inicializar() {
        const existente = localStorage.getItem(this.storageKey);
        if (!existente) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        } else {
            // Limpiar automáticamente cualquier dato demo precargado previamente
            try {
                const lista = JSON.parse(existente);
                const demoIds = ["VIP-LIZ-1001", "VIP-LIZ-1002", "VIP-LIZ-1003", "VIP-LIZ-1004"];
                const sinDemo = lista.filter(item => !demoIds.includes(item.id));
                if (sinDemo.length !== lista.length) {
                    localStorage.setItem(this.storageKey, JSON.stringify(sinDemo));
                    console.log("[DAO] Datos demo eliminados. Base de datos limpia.");
                }
            } catch (e) {
                console.error("Error al procesar confirmaciones en localStorage:", e);
            }
        }
    }

    /**
     * Obtiene todos los invitados registrados como instancias de InvitadoModel
     */
    obtenerTodos() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return [];
            const lista = JSON.parse(data);
            return lista.map(item => new InvitadoModel(item));
        } catch (e) {
            console.error("Error al leer confirmaciones de localStorage:", e);
            return [];
        }
    }

    /**
     * Guarda o actualiza un invitado en el almacenamiento
     */
    guardar(invitado) {
        if (!(invitado instanceof InvitadoModel)) {
            invitado = new InvitadoModel(invitado);
        }

        const validacion = invitado.validar();
        if (!validacion.valido) {
            throw new Error(validacion.errores.join(" "));
        }

        const lista = this.obtenerTodos();
        const indexExistente = lista.findIndex(i => i.id === invitado.id);

        if (indexExistente >= 0) {
            lista[indexExistente] = invitado;
        } else {
            lista.unshift(invitado);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(lista.map(i => i.toJSON())));
        // Sincronizar asíncronamente con la base de datos en la nube (MySQL)
        this.enviarANube(invitado);
        return invitado;
    }

    /**
     * Elimina un invitado por su ID
     */
    eliminar(id) {
        const lista = this.obtenerTodos().filter(i => i.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(lista.map(i => i.toJSON())));
        // Eliminar en la base de datos en la nube (MySQL)
        this.eliminarDeNube(id);
        return true;
    }

    /**
     * Envía una confirmación al endpoint API serverless de MySQL en Vercel
     */
    async enviarANube(invitado) {
        try {
            const data = (invitado && typeof invitado.toJSON === 'function') ? invitado.toJSON() : invitado;
            const res = await fetch("/api/confirmaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            return json;
        } catch (e) {
            console.warn("[DAO] Sincronización en la nube (operando en modo local):", e.message);
            return null;
        }
    }

    /**
     * Elimina un registro de la base de datos MySQL en la nube
     */
    async eliminarDeNube(id) {
        try {
            await fetch(`/api/confirmaciones?id=${encodeURIComponent(id)}`, {
                method: "DELETE"
            });
        } catch (e) {
            console.warn("[DAO] Error al eliminar en la nube:", e.message);
        }
    }

    /**
     * Consulta las confirmaciones en MySQL y las sincroniza en el panel
     */
    async sincronizarConNube(onActualizado = null) {
        try {
            const res = await fetch("/api/confirmaciones");
            const json = await res.json();
            if (json && json.success && Array.isArray(json.data)) {
                const remotos = json.data;
                const locales = this.obtenerTodos().map(i => i.toJSON());
                const mapa = new Map();

                locales.forEach(item => mapa.set(item.id, item));
                remotos.forEach(item => mapa.set(item.id, item));

                const combinados = Array.from(mapa.values());
                localStorage.setItem(this.storageKey, JSON.stringify(combinados));

                if (typeof onActualizado === "function") {
                    onActualizado(combinados.map(i => new InvitadoModel(i)));
                }
            }
        } catch (e) {
            console.warn("[DAO] Lectura en la nube no disponible (operando en modo local):", e.message);
        }
    }

    /**
     * Busca un invitado por su ID
     */
    buscarPorId(id) {
        const lista = this.obtenerTodos();
        return lista.find(i => i.id === id) || null;
    }

    /**
     * Calcula métricas y estadísticas para el panel de anfitriones
     */
    obtenerEstadisticas() {
        const lista = this.obtenerTodos();
        let totalPases = 0;
        let confirmadosSi = 0;
        let noAsisten = 0;
        const menus = {
            "Gala Tradicional": 0,
            "Menú Vegetariano": 0,
            "Menú Infantil": 0
        };
        const cancionesSugeridas = [];

        lista.forEach(invitado => {
            if (invitado.asistencia) {
                confirmadosSi++;
                totalPases += invitado.pases;
                if (menus[invitado.menu] !== undefined) {
                    menus[invitado.menu] += invitado.pases;
                } else {
                    menus["Gala Tradicional"] += invitado.pases;
                }
                if (invitado.cancionDj) {
                    cancionesSugeridas.push({ invitado: invitado.nombre, cancion: invitado.cancionDj });
                }
            } else {
                noAsisten++;
            }
        });

        return {
            totalRegistros: lista.length,
            confirmadosSi,
            noAsisten,
            totalPases,
            menus,
            cancionesSugeridas
        };
    }

    /**
     * Exporta la lista de confirmados a un archivo CSV compatible con Microsoft Excel
     */
    exportarCSV() {
        const lista = this.obtenerTodos();
        if (lista.length === 0) {
            alert("No hay confirmaciones registradas para exportar.");
            return;
        }

        // BOM UTF-8 para que Excel muestre acentos y caracteres especiales correctamente
        let csvContent = "\uFEFF";
        csvContent += "Código Pase,Tipo Invitación,Nombre Invitado / Familia,Integrantes / Asistentes,Estado,Pases Confirmados,Menú,Restricciones / Alergias,Canción para el DJ,Teléfono,Fecha Confirmación,Dedicatoria\n";

        lista.forEach(i => {
            const asistentesStr = (i.asistentes && i.asistentes.length > 0) ? i.asistentes.join(" | ") : (i.asistencia ? i.nombre : "N/A");
            const fila = [
                `"${i.id}"`,
                `"${i.tipo === 'amigo' ? 'Amiga / Amigo' : 'Familia'}"`,
                `"${i.nombre.replace(/"/g, '""')}"`,
                `"${asistentesStr.replace(/"/g, '""')}"`,
                `"${i.asistencia ? 'SÍ ASISTE' : 'NO ASISTE'}"`,
                i.asistencia ? i.pases : 0,
                `"${i.menu}"`,
                `"${(i.alergias || 'Ninguna').replace(/"/g, '""')}"`,
                `"${(i.cancionDj || '').replace(/"/g, '""')}"`,
                `"${i.telefono || 'N/A'}"`,
                `"${i.fechaConfirmacion}"`,
                `"${(i.mensaje || '').replace(/"/g, '""')}"`
            ];
            csvContent += fila.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `Lista_Oficial_Confirmados_XV_Lizette_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }

    /**
     * Limpia todas las confirmaciones y deja la base de datos en blanco
     */
    limpiarTodo() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfirmacionDAO;
}
