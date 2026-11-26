/**
 * ========================================================
 * VISTA: AdminView.js (Arquitectura MVC Profesional)
 * Interfaz del Panel de Anfitriones para los papás y la quinceañera:
 * Estadísticas en tiempo real, tabla de confirmados, buscador, exportación a Excel
 * y lista de sugerencias musicales para el DJ.
 * ========================================================
 */

class AdminView {
    constructor() {
        this.drawer = document.getElementById("admin-drawer");
        this.btnClose = document.getElementById("btn-close-admin");
        this.btnOpen = document.getElementById("btn-open-admin");
        this.btnExport = document.getElementById("btn-export-csv");
        this.btnPrintList = document.getElementById("btn-print-list");
        this.btnDemo = document.getElementById("btn-load-demo");
        this.searchInput = document.getElementById("admin-search-input");
        this.tableBody = document.getElementById("admin-table-body");

        // Métricas
        this.statTotalPases = document.getElementById("stat-total-pases");
        this.statConfirmadosSi = document.getElementById("stat-confirmados-si");
        this.statNoAsisten = document.getElementById("stat-no-asisten");
        this.statTotalRegistros = document.getElementById("stat-total-registros");
        this.statMenus = document.getElementById("stat-menus-detail");

        this.inicializarEventosInternos();
    }

    inicializarEventosInternos() {
        if (this.btnClose) {
            this.btnClose.addEventListener("click", () => this.cerrar());
        }
        if (this.btnPrintList) {
            this.btnPrintList.addEventListener("click", () => {
                window.print();
            });
        }
    }

    abrir() {
        if (this.drawer) {
            this.drawer.classList.add("open");
        }
    }

    cerrar() {
        if (this.drawer) {
            this.drawer.classList.remove("open");
        }
    }

    /**
     * Actualiza las tarjetas de estadísticas con los datos recibidos del DAO
     */
    actualizarEstadisticas(stats) {
        if (this.statTotalPases) this.statTotalPases.textContent = stats.totalPases;
        if (this.statConfirmadosSi) this.statConfirmadosSi.textContent = stats.confirmadosSi;
        if (this.statNoAsisten) this.statNoAsisten.textContent = stats.noAsisten;
        if (this.statTotalRegistros) this.statTotalRegistros.textContent = stats.totalRegistros;

        if (this.statMenus) {
            this.statMenus.innerHTML = `
                <strong>Gala Tradicional:</strong> ${stats.menus["Gala Tradicional"]} | 
                <strong>Vegetariano:</strong> ${stats.menus["Menú Vegetariano"]} | 
                <strong>Infantil:</strong> ${stats.menus["Menú Infantil"]}
                ${stats.cancionesSugeridas.length > 0 ? `<br><small style="color:var(--color-rose-deep);"><strong>${stats.cancionesSugeridas.length}</strong> peticiones de canciones para el DJ registradas</small>` : ''}
            `;
        }
    }

    /**
     * Renderiza la tabla de confirmados con soporte para filtros de búsqueda
     */
    renderizarTabla(invitados, onEliminar) {
        if (!this.tableBody) return;
        this.tableBody.innerHTML = "";

        if (invitados.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 25px; color: #888;">
                        No hay confirmaciones registradas que coincidan con la búsqueda.
                    </td>
                </tr>
            `;
            return;
        }

        invitados.forEach(i => {
            const tr = document.createElement("tr");

            const estadoBadge = i.asistencia
                ? `<span style="background: #e8f5e9; color: #2e7d32; font-weight: bold; padding: 4px 10px; border-radius: 12px; font-size: 0.76rem;">SÍ ASISTE (${i.pases} pases)</span>`
                : `<span style="background: #ffebee; color: #c62828; font-weight: bold; padding: 4px 10px; border-radius: 12px; font-size: 0.76rem;">NO ASISTE</span>`;

            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: bold; color: var(--color-gold-dark);">${i.id}</td>
                <td><strong>${this.escaparHtml(i.nombre)}</strong></td>
                <td>${estadoBadge}</td>
                <td>${i.asistencia ? i.menu : '-'}</td>
                <td style="font-size: 0.8rem; color: #666;">${this.escaparHtml(i.alergias || 'Ninguna')}</td>
                <td style="font-size: 0.8rem; color: #333;">${i.cancionDj ? `${this.escaparHtml(i.cancionDj)}` : '-'}</td>
                <td>${i.telefono ? `<a href="tel:${i.telefono}" style="color: var(--color-rose-deep); text-decoration: none; font-weight:600;">${this.escaparHtml(i.telefono)}</a>` : '<span style="color:#aaa;">-</span>'}</td>
                <td>
                    <button class="btn-delete-row" data-id="${i.id}" style="background: transparent; border: 1px solid #ffcdd2; color: #c62828; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                        Eliminar
                    </button>
                </td>
            `;

            const btnDel = tr.querySelector(".btn-delete-row");
            if (btnDel && onEliminar) {
                btnDel.addEventListener("click", () => {
                    if (confirm(`¿Deseas eliminar la confirmación de "${i.nombre}"?`)) {
                        onEliminar(i.id);
                    }
                });
            }

            this.tableBody.appendChild(tr);
        });
    }

    escaparHtml(texto) {
        if (!texto) return "";
        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminView;
}
