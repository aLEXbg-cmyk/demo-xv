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
        this.searchClearBtn = document.getElementById("admin-search-clear");
        this.tableBody = document.getElementById("admin-table-body");

        // Botones y contadores del Filtro SÍ / NO
        this.filterBtns = document.querySelectorAll(".btn-filter-pill");
        this.pillCountTodos = document.getElementById("pill-count-todos");
        this.pillCountSi = document.getElementById("pill-count-si");
        this.pillCountNo = document.getElementById("pill-count-no");

        // Métricas
        this.statTotalPases = document.getElementById("stat-total-pases");
        this.statConfirmadosSi = document.getElementById("stat-confirmados-si");
        this.statNoAsisten = document.getElementById("stat-no-asisten");
        this.statTotalRegistros = document.getElementById("stat-total-registros");
        this.statMenus = document.getElementById("stat-menus-detail");

        // Elementos del Generador de Enlaces Personalizados
        this.tabBtnManual = document.getElementById("tab-btn-manual");
        this.tabBtnExcel = document.getElementById("tab-btn-excel");
        this.genPanelManual = document.getElementById("gen-panel-manual");
        this.genPanelExcel = document.getElementById("gen-panel-excel");

        this.genTypeSelect = document.getElementById("gen-invitation-type");
        this.genLabelFamilyName = document.getElementById("gen-label-family-name");
        this.genLabelFamilyPasses = document.getElementById("gen-label-family-passes");
        this.genNameInput = document.getElementById("gen-family-name");
        this.genPassesInput = document.getElementById("gen-family-passes");
        this.genPhoneInput = document.getElementById("gen-family-phone");
        this.genResetLock = document.getElementById("gen-reset-lock");
        this.btnGenLink = document.getElementById("btn-generate-link");
        this.genResultBox = document.getElementById("gen-result-container");
        this.genResultUrl = document.getElementById("gen-result-url");
        this.btnCopyGenLink = document.getElementById("btn-copy-gen-link");
        this.btnShortenGenLink = document.getElementById("btn-shorten-gen-link");
        this.btnWhatsAppGenLink = document.getElementById("btn-whatsapp-gen-link");
        this.btnPreviewGenLink = document.getElementById("btn-preview-gen-link");
        this.genHistoryList = document.getElementById("gen-history-list");
        this.btnClearGenHistory = document.getElementById("btn-clear-gen-history");

        // Elementos de Carga Masiva con Excel
        this.excelFileInput = document.getElementById("excel-file-input");
        this.excelDropzone = document.getElementById("excel-dropzone");
        this.excelDropzoneText = document.getElementById("excel-dropzone-text");
        this.excelPreviewBox = document.getElementById("excel-preview-box");
        this.excelFileName = document.getElementById("excel-file-name");
        this.excelCountBadge = document.getElementById("excel-count-badge");
        this.excelPreviewTbody = document.getElementById("excel-preview-tbody");
        this.btnProcessExcel = document.getElementById("btn-process-excel");
        this.btnExportExcelLinks = document.getElementById("btn-export-excel-links");
        this.btnClearExcel = document.getElementById("btn-clear-excel");
        this.excelSuccessAlert = document.getElementById("excel-success-alert");
        this.excelSuccessMsg = document.getElementById("excel-success-msg");

        // Sección de Palabras Bonitas & Mensajes para Lizette
        this.messagesGrid = document.getElementById("admin-messages-grid");
        this.messagesCountBadge = document.getElementById("messages-count-badge");

        this.inicializarEventosInternos();
    }

    inicializarEventosInternos() {
        // Listener del selector de Tipo de Invitación (Familia / Amigo)
        if (this.genTypeSelect) {
            this.genTypeSelect.addEventListener("change", () => {
                const tipo = this.genTypeSelect.value;
                if (tipo === "amigo") {
                    if (this.genLabelFamilyName) this.genLabelFamilyName.textContent = "Nombre de la Amiga / Amigo:";
                    if (this.genNameInput) this.genNameInput.placeholder = "Ej: Sofía Martínez o Andrea";
                    if (this.genLabelFamilyPasses) this.genLabelFamilyPasses.textContent = "Pases:";
                    if (this.genPassesInput && (this.genPassesInput.value === "4" || !this.genPassesInput.value)) {
                        this.genPassesInput.value = "1";
                    }
                } else {
                    if (this.genLabelFamilyName) this.genLabelFamilyName.textContent = "Nombre de la Familia:";
                    if (this.genNameInput) this.genNameInput.placeholder = "Ej: Familia Esparza Morales";
                    if (this.genLabelFamilyPasses) this.genLabelFamilyPasses.textContent = "Pases Familiares:";
                    if (this.genPassesInput && (this.genPassesInput.value === "1" || !this.genPassesInput.value)) {
                        this.genPassesInput.value = "4";
                    }
                }
            });
        }

        if (this.btnClose) {
            this.btnClose.addEventListener("click", () => this.cerrar());
        }
        if (this.btnPrintList) {
            this.btnPrintList.addEventListener("click", () => {
                window.print();
            });
        }

        // Control de botón para limpiar campo de búsqueda
        if (this.searchInput && this.searchClearBtn) {
            this.searchInput.addEventListener("input", () => {
                this.searchClearBtn.style.display = this.searchInput.value.trim() ? "block" : "none";
            });
            this.searchClearBtn.addEventListener("click", () => {
                this.searchInput.value = "";
                this.searchClearBtn.style.display = "none";
                this.searchInput.dispatchEvent(new Event("input"));
                this.searchInput.focus();
            });
        }
    }

    /**
     * Actualiza los contadores numéricos en las píldoras de filtro (Todos, SÍ, NO)
     */
    actualizarContadoresFiltro(total, si, no) {
        if (this.pillCountTodos) this.pillCountTodos.textContent = total;
        if (this.pillCountSi) this.pillCountSi.textContent = si;
        if (this.pillCountNo) this.pillCountNo.textContent = no;
    }

    /**
     * Marca visualmente el botón de filtro seleccionado
     */
    establecerFiltroActivo(filtroSeleccionado) {
        if (!this.filterBtns) return;
        this.filterBtns.forEach(btn => {
            if (btn.getAttribute("data-filter") === filtroSeleccionado) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
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
     * Muestra el enlace personalizado generado y habilita los botones de acción
     */
    mostrarEnlaceGenerado(url, previewUrl) {
        if (!this.genResultBox) return;
        this.genResultBox.style.display = "block";
        if (this.genResultUrl) {
            this.genResultUrl.textContent = url;
        }
        if (this.btnPreviewGenLink) {
            this.btnPreviewGenLink.href = previewUrl || url;
        }
        this.genResultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    /**
     * Renderiza el historial de invitaciones personalizadas generadas
     */
    renderizarHistorial(historial, onCopiar, onWhatsApp, onEliminar) {
        if (!this.genHistoryList) return;
        this.genHistoryList.innerHTML = "";

        if (!historial || historial.length === 0) {
            this.genHistoryList.innerHTML = `
                <div style="font-size: 0.8rem; color: #888; font-style: italic; padding: 6px 0;">
                    Aún no has generado enlaces personalizados. Crea uno arriba para tu primera familia.
                </div>
            `;
            return;
        }

        historial.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "gen-history-item";

            const tipoBadge = item.tipo === "amigo"
                ? `<span class="history-type-badge amigo"><i class="bi bi-heart-fill me-1"></i>Amiga/o</span>`
                : `<span class="history-type-badge familia"><i class="bi bi-people-fill me-1"></i>Familia</span>`;

            card.innerHTML = `
                <div class="gen-item-info">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <strong class="gen-item-name">${this.escaparHtml(item.familia)}</strong>
                        ${tipoBadge}
                    </div>
                    <span class="gen-item-meta">${item.pases} ${item.pases === 1 ? 'pase' : 'pases'} · ${item.fecha}</span>
                </div>
                <div class="gen-item-actions">
                    <button type="button" class="btn-item-action btn-item-copy" title="Copiar enlace" data-index="${index}">
                        <i class="bi bi-clipboard"></i>
                    </button>
                    <button type="button" class="btn-item-action btn-item-wa" title="Enviar por WhatsApp" data-index="${index}">
                        <i class="bi bi-whatsapp"></i>
                    </button>
                    <a href="${item.url}" target="_blank" class="btn-item-action btn-item-open" title="Abrir y probar invitación">
                        <i class="bi bi-box-arrow-up-right"></i>
                    </a>
                    <button type="button" class="btn-item-action btn-item-del" title="Eliminar invitación" data-index="${index}">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </div>
            `;

            const btnCopy = card.querySelector(".btn-item-copy");
            if (btnCopy && onCopiar) {
                btnCopy.addEventListener("click", () => onCopiar(item));
            }

            const btnWa = card.querySelector(".btn-item-wa");
            if (btnWa && onWhatsApp) {
                btnWa.addEventListener("click", () => onWhatsApp(item));
            }

            const btnDel = card.querySelector(".btn-item-del");
            if (btnDel && onEliminar) {
                btnDel.addEventListener("click", () => {
                    if (confirm(`¿Deseas eliminar de la lista la invitación para "${item.familia}"?`)) {
                        onEliminar(index);
                    }
                });
            }

            this.genHistoryList.appendChild(card);
        });
    }

    /**
     * Alterna la vista entre el modo manual (uno por uno) y el modo masivo con Excel
     */
    cambiarModoGenerador(modo) {
        if (modo === "excel") {
            if (this.tabBtnManual) this.tabBtnManual.classList.remove("active");
            if (this.tabBtnExcel) this.tabBtnExcel.classList.add("active");
            if (this.genPanelManual) this.genPanelManual.style.display = "none";
            if (this.genPanelExcel) this.genPanelExcel.style.display = "flex";
        } else {
            if (this.tabBtnExcel) this.tabBtnExcel.classList.remove("active");
            if (this.tabBtnManual) this.tabBtnManual.classList.add("active");
            if (this.genPanelExcel) this.genPanelExcel.style.display = "none";
            if (this.genPanelManual) this.genPanelManual.style.display = "block";
        }
    }

    /**
     * Renderiza la tabla de vista previa con los invitados detectados en el Excel
     */
    mostrarVistaPreviaExcel(nombreArchivo, listaInvitados) {
        if (!this.excelPreviewBox || !this.excelPreviewTbody) return;

        if (this.excelFileName) this.excelFileName.textContent = nombreArchivo;
        if (this.excelCountBadge) {
            this.excelCountBadge.textContent = `${listaInvitados.length} ${listaInvitados.length === 1 ? 'invitado detectado' : 'invitados detectados'}`;
        }

        if (this.excelSuccessAlert) this.excelSuccessAlert.style.display = "none";
        if (this.btnExportExcelLinks) this.btnExportExcelLinks.style.display = "none";
        if (this.btnProcessExcel) {
            this.btnProcessExcel.disabled = false;
            this.btnProcessExcel.innerHTML = `<i class="bi bi-magic"></i> Generar Todas las Invitaciones Masivamente`;
        }

        this.excelPreviewTbody.innerHTML = "";

        listaInvitados.forEach((item, index) => {
            const tr = document.createElement("tr");
            const esAmigo = item.tipo === "amigo";
            const tipoPill = esAmigo 
                ? `<span class="badge-type-pill amigo"><i class="bi bi-heart-fill me-1"></i>Amiga/o</span>`
                : `<span class="badge-type-pill familia"><i class="bi bi-people-fill me-1"></i>Familia</span>`;

            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--admin-text-muted);">${index + 1}</td>
                <td>${tipoPill}</td>
                <td style="font-weight: 600; color: var(--admin-wine-deep);">${this.escaparHtml(item.nombre)}</td>
                <td style="text-align: center; font-weight: 700;">${item.pases}</td>
                <td>${item.telefono ? `<i class="bi bi-whatsapp text-success me-1"></i>${this.escaparHtml(item.telefono)}` : '<span style="color: #999;">Opcional</span>'}</td>
                <td><span style="color: #107C41; font-weight: 600;"><i class="bi bi-check-circle-fill me-1"></i>Listo</span></td>
            `;
            this.excelPreviewTbody.appendChild(tr);
        });

        this.excelPreviewBox.style.display = "block";
        if (this.excelDropzoneText) {
            this.excelDropzoneText.innerHTML = `<strong>${nombreArchivo}</strong> cargado con éxito`;
        }
    }

    /**
     * Limpia la vista previa del archivo Excel
     */
    limpiarVistaPreviaExcel() {
        if (this.excelFileInput) this.excelFileInput.value = "";
        if (this.excelPreviewBox) this.excelPreviewBox.style.display = "none";
        if (this.excelPreviewTbody) this.excelPreviewTbody.innerHTML = "";
        if (this.excelSuccessAlert) this.excelSuccessAlert.style.display = "none";
        if (this.btnExportExcelLinks) this.btnExportExcelLinks.style.display = "none";
        if (this.excelDropzoneText) {
            this.excelDropzoneText.textContent = "Haz clic aquí o arrastra tu archivo Excel";
        }
    }

    /**
     * Muestra mensaje de éxito tras procesar el archivo Excel
     */
    mostrarExitoExcel(mensaje) {
        if (this.excelSuccessAlert) {
            if (this.excelSuccessMsg) this.excelSuccessMsg.textContent = mensaje;
            this.excelSuccessAlert.style.display = "flex";
        }
        if (this.btnExportExcelLinks) {
            this.btnExportExcelLinks.style.display = "inline-flex";
        }
        if (this.btnProcessExcel) {
            this.btnProcessExcel.disabled = true;
            this.btnProcessExcel.innerHTML = `<i class="bi bi-check2-all"></i> Invitaciones Ya Generadas`;
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
                    <td colspan="5" style="text-align: center; padding: 25px; color: #888;">
                        No hay confirmaciones registradas que coincidan con la búsqueda.
                    </td>
                </tr>
            `;
            return;
        }

        invitados.forEach(i => {
            const tr = document.createElement("tr");

            const esAmigo = i.tipo === "amigo";
            const tipoBadge = esAmigo
                ? `<span class="badge-type-pill amigo"><i class="bi bi-heart-fill me-1"></i>Amiga/o</span>`
                : `<span class="badge-type-pill familia"><i class="bi bi-people-fill me-1"></i>Familia</span>`;

            let asistentesHtml = "";
            if (i.asistencia && i.asistentes && i.asistentes.length > 0) {
                asistentesHtml = `
                    <div class="table-attendees-box">
                        <span class="table-attendees-title"><i class="bi bi-person-check-fill me-1"></i>Asistentes:</span>
                        <span class="table-attendees-text">${this.escaparHtml(i.asistentes.join(", "))}</span>
                    </div>
                `;
            }

            const avatarIcon = esAmigo ? "bi-person-heart" : "bi-people-fill";
            const avatarClass = esAmigo ? "guest-avatar-icon avatar-amigo" : "guest-avatar-icon";

            const estadoBadge = i.asistencia
                ? `<span class="status-badge-yes"><i class="bi bi-check-circle-fill"></i> SÍ ASISTE</span>`
                : `<span class="status-badge-no"><i class="bi bi-x-circle-fill"></i> NO ASISTE</span>`;

            const pasesHtml = i.asistencia
                ? `<span class="badge-passes-pill"><i class="bi bi-ticket-perforated-fill me-1"></i>${i.pases} ${i.pases === 1 ? 'pase' : 'pases'}</span>`
                : `<span class="badge-passes-none">0 pases</span>`;

            const rawTel = (i.telefono || "").replace(/\D/g, "");
            let telHtml = '<span style="color:#bbb; font-size:0.85rem;">-</span>';
            if (i.telefono) {
                const waUrl = rawTel.length >= 10 ? `https://wa.me/${rawTel.length === 10 ? '52' + rawTel : rawTel}` : `tel:${i.telefono}`;
                telHtml = `
                    <a href="${waUrl}" target="_blank" class="phone-action-badge" title="Contactar por WhatsApp">
                        <i class="bi bi-whatsapp"></i>
                        <span>${this.escaparHtml(i.telefono)}</span>
                    </a>
                `;
            }

            tr.innerHTML = `
                <td>
                    <div class="guest-name-cell">
                        <div class="${avatarClass}">
                            <i class="bi ${avatarIcon}"></i>
                        </div>
                        <div class="guest-name-info-block">
                            <div class="guest-name-header-row" style="display: flex; align-items: center; gap: 8px;">
                                <span class="guest-name-text">${this.escaparHtml(i.nombre)}</span>
                                ${tipoBadge}
                            </div>
                            ${asistentesHtml}
                        </div>
                    </div>
                </td>
                <td>${estadoBadge}</td>
                <td>${pasesHtml}</td>
                <td>${telHtml}</td>
                <td>
                    <button class="btn-delete-row" data-id="${i.id}" title="Eliminar confirmación de asistencia">
                        <i class="bi bi-trash3-fill me-1"></i>
                        <span>Eliminar</span>
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

    /**
     * Renderiza las dedicatorias y palabras bonitas de los invitados para Lizette
     */
    renderizarMensajes(invitados) {
        if (!this.messagesGrid) return;
        this.messagesGrid.innerHTML = "";

        const conMensaje = (invitados || []).filter(i => i.mensaje && i.mensaje.trim().length > 0);

        if (this.messagesCountBadge) {
            this.messagesCountBadge.textContent = `${conMensaje.length} ${conMensaje.length === 1 ? 'dedicatoria de cariño' : 'dedicatorias de cariño'}`;
        }

        if (conMensaje.length === 0) {
            this.messagesGrid.innerHTML = `
                <div class="empty-messages-box">
                    <i class="bi bi-envelope-heart" style="font-size: 2.4rem; color: var(--admin-wine-soft); display: block; margin-bottom: 8px;"></i>
                    <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--admin-text-main);">Aún no se han recibido dedicatorias escritas.</p>
                    <small style="color: var(--admin-text-muted); margin-top: 4px; display: block;">Cuando tus invitados escriban sus bonitas palabras al confirmar en la invitación, las podrás leer todas aquí.</small>
                </div>
            `;
            return;
        }

        conMensaje.forEach(i => {
            const card = document.createElement("div");
            card.className = "message-card-item";

            const esAmigo = i.tipo === "amigo";
            const avatarClass = esAmigo ? "message-sender-avatar amigo" : "message-sender-avatar";
            const avatarIcon = esAmigo ? "bi-heart-fill" : "bi-people-fill";
            const tipoBadge = esAmigo
                ? `<span class="badge-type-pill amigo"><i class="bi bi-heart-fill me-1"></i>Amiga/o</span>`
                : `<span class="badge-type-pill familia"><i class="bi bi-people-fill me-1"></i>Familia</span>`;

            card.innerHTML = `
                <div class="message-card-header">
                    <div class="message-sender-meta">
                        <div class="${avatarClass}">
                            <i class="bi ${avatarIcon}"></i>
                        </div>
                        <div class="message-sender-info">
                            <span class="message-sender-name">${this.escaparHtml(i.nombre)}</span>
                            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                ${tipoBadge}
                            </div>
                        </div>
                    </div>
                    <span class="message-date">${this.escaparHtml(i.fechaConfirmacion || '')}</span>
                </div>
                <div class="message-card-body">
                    <i class="bi bi-quote quote-icon"></i>
                    <p class="message-card-text">"${this.escaparHtml(i.mensaje)}"</p>
                </div>
            `;

            this.messagesGrid.appendChild(card);
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
