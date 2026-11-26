/**
 * ========================================================
 * CONTROLADOR: AdminController.js (Arquitectura MVC)
 * Controla el Panel de Anfitriones: autenticación, filtrado en vivo,
 * eliminación de confirmaciones, carga de datos de prueba y exportación a Excel.
 * ========================================================
 */

class AdminController {
    constructor(confirmacionDAO, adminView) {
        this.confirmacionDAO = confirmacionDAO;
        this.adminView = adminView;
        this.claveAcceso = "xvlizette2026";
        this.autenticado = false;

        this.inicializar();
    }

    inicializar() {
        // Botón de abrir panel (con verificación de clave)
        if (this.adminView.btnOpen) {
            this.adminView.btnOpen.addEventListener("click", () => {
                this.solicitarAcceso();
            });
        }

        // Búsqueda en tiempo real
        if (this.adminView.searchInput) {
            this.adminView.searchInput.addEventListener("input", (e) => {
                this.filtrarInvitados(e.target.value);
            });
        }

        // Botón exportar CSV
        if (this.adminView.btnExport) {
            this.adminView.btnExport.addEventListener("click", () => {
                this.confirmacionDAO.exportarCSV();
            });
        }

        // Botón cargar datos demo
        if (this.adminView.btnDemo) {
            this.adminView.btnDemo.addEventListener("click", () => {
                if (confirm("¿Deseas recargar la lista de invitados de prueba?")) {
                    this.confirmacionDAO.cargarDatosEjemplo();
                    this.actualizarVista();
                }
            });
        }
    }

    solicitarAcceso() {
        if (this.autenticado) {
            this.actualizarVista();
            this.adminView.abrir();
            return;
        }

        const claveIngresada = prompt("Panel de Anfitriones (Padres de Lizette)\nIngresa la clave de acceso (por defecto: xvlizette2026):");
        if (claveIngresada === this.claveAcceso) {
            this.autenticado = true;
            this.actualizarVista();
            this.adminView.abrir();
        } else if (claveIngresada !== null) {
            alert("Clave incorrecta. Acceso denegado.");
        }
    }

    actualizarVista() {
        const stats = this.confirmacionDAO.obtenerEstadisticas();
        this.adminView.actualizarEstadisticas(stats);

        const invitados = this.confirmacionDAO.obtenerTodos();
        this.adminView.renderizarTabla(invitados, (id) => this.eliminarInvitado(id));
    }

    filtrarInvitados(termino) {
        const terminoLimpio = termino.toLowerCase().trim();
        const todos = this.confirmacionDAO.obtenerTodos();

        if (!terminoLimpio) {
            this.adminView.renderizarTabla(todos, (id) => this.eliminarInvitado(id));
            return;
        }

        const filtrados = todos.filter(i => 
            i.nombre.toLowerCase().includes(terminoLimpio) ||
            i.id.toLowerCase().includes(terminoLimpio) ||
            (i.telefono && i.telefono.includes(terminoLimpio))
        );

        this.adminView.renderizarTabla(filtrados, (id) => this.eliminarInvitado(id));
    }

    eliminarInvitado(id) {
        this.confirmacionDAO.eliminar(id);
        this.actualizarVista();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminController;
}
