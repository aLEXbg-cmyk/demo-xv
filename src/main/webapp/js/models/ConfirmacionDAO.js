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
     * Inicializa la base de datos local y carga datos demo si está vacía
     */
    inicializar() {
        const existente = localStorage.getItem(this.storageKey);
        if (!existente) {
            this.cargarDatosEjemplo();
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
        return invitado;
    }

    /**
     * Elimina un invitado por su ID
     */
    eliminar(id) {
        const lista = this.obtenerTodos().filter(i => i.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(lista.map(i => i.toJSON())));
        return true;
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
        csvContent += "Código Pase,Nombre Invitado / Familia,Estado,Pases Confirmados,Menú,Restricciones / Alergias,Canción para el DJ,Teléfono,Fecha Confirmación,Dedicatoria\n";

        lista.forEach(i => {
            const fila = [
                `"${i.id}"`,
                `"${i.nombre.replace(/"/g, '""')}"`,
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
     * Carga invitados de ejemplo representativos
     */
    cargarDatosEjemplo() {
        const ejemplos = [
            new InvitadoModel({
                id: "VIP-LIZ-1001",
                nombre: "Familia Morales González",
                pases: 4,
                asistencia: true,
                telefono: "477 987 6543",
                mensaje: "¡Muchísimas felicidades Lizette hermosa! Toda la familia estamos listos para celebrar contigo en grande.",
                menu: "Gala Tradicional",
                alergias: "Ninguna",
                cancionDj: "Tiempo de Vals - Chayanne",
                fechaConfirmacion: "24/10/2026, 18:30"
            }),
            new InvitadoModel({
                id: "VIP-LIZ-1002",
                nombre: "Familia Ruiz Díaz",
                pases: 3,
                asistencia: true,
                telefono: "477 334 5566",
                mensaje: "Será un gran honor acompañar a tus queridos padres y a ti en esta noche inolvidable.",
                menu: "Menú Vegetariano",
                alergias: "Vegetariano estricto",
                cancionDj: "Danubio Azul - Strauss",
                fechaConfirmacion: "25/10/2026, 11:15"
            }),
            new InvitadoModel({
                id: "VIP-LIZ-1003",
                nombre: "Lic. Andrea Salgado",
                pases: 0,
                asistencia: false,
                telefono: "477 889 0011",
                mensaje: "Liz hermosa, me coincide con un congreso fuera del país pero te mando un fuerte abrazo y mis bendiciones.",
                menu: "Gala Tradicional",
                alergias: "Ninguna",
                cancionDj: "",
                fechaConfirmacion: "26/10/2026, 15:40"
            }),
            new InvitadoModel({
                id: "VIP-LIZ-1004",
                nombre: "Familia Castillo Rivas (Tía Claudia)",
                pases: 4,
                asistencia: true,
                telefono: "477 776 5544",
                mensaje: "¡Qué emoción que ya cumplas tus 15 primaveras! Ya queremos verte bailar tu vals.",
                menu: "Menú Infantil",
                alergias: "Intolerancia a la lactosa (niño)",
                cancionDj: "No Se Va - Morat",
                fechaConfirmacion: "27/10/2026, 09:20"
            })
        ];

        localStorage.setItem(this.storageKey, JSON.stringify(ejemplos.map(i => i.toJSON())));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfirmacionDAO;
}
