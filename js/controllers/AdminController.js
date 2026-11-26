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
        this.claveAcceso = this.obtenerClave();
        this.autenticado = false;

        // Estado de filtros
        this.filtroAsistencia = "todos"; // "todos" | "si" | "no"
        this.terminoBusqueda = "";

        // Estado de Carga Masiva Excel
        this.invitadosExcel = [];
        this.invitadosExcelProcesados = [];

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
                this.terminoBusqueda = e.target.value;
                this.aplicarFiltros();
            });
        }

        // Eventos de los botones de Filtro de Asistencia (SÍ / NO / TODOS)
        if (this.adminView.filterBtns) {
            this.adminView.filterBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    const filtro = btn.getAttribute("data-filter") || "todos";
                    this.filtroAsistencia = filtro;
                    this.adminView.establecerFiltroActivo(filtro);
                    this.aplicarFiltros();
                });
            });
        }

        // Botón exportar CSV
        if (this.adminView.btnExport) {
            this.adminView.btnExport.addEventListener("click", () => {
                this.confirmacionDAO.exportarCSV();
            });
        }

        // EVENTOS DEL GENERADOR DE ENLACES PERSONALIZADOS
        if (this.adminView.btnGenLink) {
            this.adminView.btnGenLink.addEventListener("click", () => {
                this.generarEnlacePersonalizado();
            });
        }

        if (this.adminView.btnCopyGenLink) {
            this.adminView.btnCopyGenLink.addEventListener("click", () => {
                this.copiarEnlaceAlPortapapeles(this.ultimoEnlaceGenerado);
            });
        }

        if (this.adminView.btnShortenGenLink) {
            this.adminView.btnShortenGenLink.addEventListener("click", () => {
                this.acortarEnlaceActual();
            });
        }

        if (this.adminView.btnWhatsAppGenLink) {
            this.adminView.btnWhatsAppGenLink.addEventListener("click", () => {
                this.abrirWhatsAppConMensaje(this.ultimoTelefono, this.ultimoMensajeWA);
            });
        }

        if (this.adminView.btnClearGenHistory) {
            this.adminView.btnClearGenHistory.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar la lista de enlaces generados recientemente?")) {
                    this.limpiarHistorialEnlaces();
                }
            });
        }

        // EVENTOS DE PESTAÑAS (MANUAL VS EXCEL)
        if (this.adminView.tabBtnManual) {
            this.adminView.tabBtnManual.addEventListener("click", () => {
                this.adminView.cambiarModoGenerador("manual");
            });
        }

        if (this.adminView.tabBtnExcel) {
            this.adminView.tabBtnExcel.addEventListener("click", () => {
                this.adminView.cambiarModoGenerador("excel");
            });
        }

        // EVENTOS DE CARGA MASIVA CON EXCEL
        if (this.adminView.excelDropzone && this.adminView.excelFileInput) {
            this.adminView.excelDropzone.addEventListener("click", () => {
                this.adminView.excelFileInput.click();
            });

            this.adminView.excelDropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                this.adminView.excelDropzone.classList.add("dragover");
            });

            this.adminView.excelDropzone.addEventListener("dragleave", () => {
                this.adminView.excelDropzone.classList.remove("dragover");
            });

            this.adminView.excelDropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                this.adminView.excelDropzone.classList.remove("dragover");
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.manejarArchivoExcel(e.dataTransfer.files[0]);
                }
            });

            this.adminView.excelFileInput.addEventListener("change", (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    this.manejarArchivoExcel(e.target.files[0]);
                }
            });
        }

        if (this.adminView.btnProcessExcel) {
            this.adminView.btnProcessExcel.addEventListener("click", () => {
                this.procesarInvitadosExcel();
            });
        }

        if (this.adminView.btnExportExcelLinks) {
            this.adminView.btnExportExcelLinks.addEventListener("click", () => {
                this.exportarExcelConEnlaces();
            });
        }

        if (this.adminView.btnClearExcel) {
            this.adminView.btnClearExcel.addEventListener("click", () => {
                this.limpiarExcel();
            });
        }

        // Acceso rápido directo si la URL incluye #admin o ?admin=1
        const urlParams = new URLSearchParams(window.location.search);
        if (window.location.hash === "#admin" || urlParams.get("admin") === "1") {
            setTimeout(() => {
                this.autenticado = true;
                this.actualizarVista();
                this.adminView.abrir();
            }, 300);
        }
    }

    generarFirma(nombre, pases) {
        const secret = "xv_valentina_gala_2026";
        const str = `${(nombre || "").trim().toLowerCase().replace(/\s+/g, "_")}_${pases}_${secret}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(36).substring(0, 5);
    }

    solicitarAcceso() {
        if (this.autenticado) {
            this.actualizarVista();
            this.adminView.abrir();
            return;
        }

        const claveReal = this.obtenerClave();
        const claveIngresada = prompt("Panel de Anfitriones (Padres de Valentina)\nIngresa la clave de acceso:");
        if (claveIngresada === claveReal) {
            this.autenticado = true;
            this.actualizarVista();
            this.adminView.abrir();
        } else if (claveIngresada !== null) {
            alert("Clave incorrecta. Acceso denegado.");
        }
    }

    obtenerClave() {
        return localStorage.getItem("xv_valentina_admin_password") || "xvvalentina2026";
    }

    cambiarClave(claveActual, nuevaClave, confirmarClave) {
        const claveReal = this.obtenerClave();
        if ((claveActual || "").trim() !== claveReal) {
            return { exito: false, mensaje: "La contraseña actual no es correcta." };
        }
        if (!nuevaClave || nuevaClave.trim().length < 4) {
            return { exito: false, mensaje: "La nueva contraseña debe tener al menos 4 caracteres." };
        }
        if (nuevaClave !== confirmarClave) {
            return { exito: false, mensaje: "Las contraseñas no coinciden. Verifica e intenta nuevamente." };
        }
        localStorage.setItem("xv_valentina_admin_password", nuevaClave.trim());
        this.claveAcceso = nuevaClave.trim();
        return { exito: true, mensaje: "¡Contraseña actualizada con éxito!" };
    }

    restablecerClave() {
        localStorage.removeItem("xv_valentina_admin_password");
        this.claveAcceso = "xvvalentina2026";
        return { exito: true, mensaje: "La contraseña ha sido restablecida a xvvalentina2026." };
    }

    actualizarVista() {
        const stats = this.confirmacionDAO.obtenerEstadisticas();
        this.adminView.actualizarEstadisticas(stats);

        const invitados = this.confirmacionDAO.obtenerTodos();
        const countTotal = invitados.length;
        const countSi = invitados.filter(i => i.asistencia).length;
        const countNo = invitados.filter(i => !i.asistencia).length;

        // Actualizar números en los botones de filtro SÍ / NO / Todos
        this.adminView.actualizarContadoresFiltro(countTotal, countSi, countNo);

        // Renderizar dedicatorias y palabras bonitas para Valentina
        if (typeof this.adminView.renderizarMensajes === "function") {
            this.adminView.renderizarMensajes(invitados);
        }

        // Renderizar aplicando los filtros actuales (SÍ/NO y Búsqueda)
        this.aplicarFiltros();

        // Cargar historial de enlaces personalizados
        this.actualizarHistorialEnlaces();

        // Sincronizar en tiempo real desde MySQL (si está conectado en la nube)
        if (typeof this.confirmacionDAO.sincronizarConNube === "function") {
            this.confirmacionDAO.sincronizarConNube((invitadosActualizados) => {
                const countTot = invitadosActualizados.length;
                const countS = invitadosActualizados.filter(i => i.asistencia).length;
                const countN = invitadosActualizados.filter(i => !i.asistencia).length;
                this.adminView.actualizarContadoresFiltro(countTot, countS, countN);
                const statsUp = this.confirmacionDAO.obtenerEstadisticas();
                this.adminView.actualizarEstadisticas(statsUp);
                if (typeof this.adminView.renderizarMensajes === "function") {
                    this.adminView.renderizarMensajes(invitadosActualizados);
                }
                this.aplicarFiltros();
            });
        }
    }

    /**
     * Construye de manera determinista la URL con firma criptográfica y el mensaje oficial de WhatsApp
     */
    construirInvitacion(nombre, pases, tipo = "familia", telefono = "", resetear = false) {
        let baseUrl = window.location.href.split("?")[0].split("#")[0];
        if (baseUrl.endsWith("/admin.html")) {
            baseUrl = baseUrl.replace("/admin.html", "/");
        } else if (baseUrl.endsWith("/admin")) {
            baseUrl = baseUrl.replace("/admin", "/");
        } else if (baseUrl.endsWith("/index.html")) {
            baseUrl = baseUrl.replace("/index.html", "/");
        }
        if (!baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
        }

        const nombreSlug = encodeURIComponent((nombre || "").trim().replace(/\s+/g, "_"));
        const firma = this.generarFirma(nombre, pases);
        let urlFinal = "";
        if (pases === 1 && tipo === "amigo") {
            urlFinal = `${baseUrl}invitacion.html?${nombreSlug}&s=${firma}`;
        } else {
            urlFinal = `${baseUrl}invitacion.html?${nombreSlug}=${pases}&s=${firma}`;
        }

        if (resetear) {
            urlFinal += "&r=1";
        }

        let mensajeGala = "";
        if (tipo === "amigo") {
            mensajeGala = `✨ *¡HOLA ${nombre.toUpperCase()}! · MIS XV AÑOS* ✨\n\n` +
                `¡Qué emoción! Me encantaría muchísimo que me acompañes a celebrar mis XV Años en este día tan soñado e importante para mí.\n\n` +
                `🎟️ He reservado con mucho cariño *${pases} ${pases === 1 ? 'pase personal exclusivo' : 'pases especiales'}* para ti.\n\n` +
                `Aquí puedes abrir tu invitación interactiva con itinerario, música y confirmar tu asistencia:\n` +
                `👉 ${urlFinal}\n\n` +
                `_Por favor confírmame antes del 10 de Octubre para garantizar tu lugar._\n` +
                `¡No puedes faltar, te espero con mucha emoción! 💖👑`;
        } else {
            mensajeGala = `✨ *INVITACIÓN OFICIAL DE GALA · MIS XV AÑOS* ✨\n\n` +
                `Querida *${nombre}*:\n\n` +
                `En compañía de Dios y nuestra familia, nos complace enormemente invitarlos a la celebración de los XV Años de *Valentina Sofía*.\n\n` +
                `🎟️ Hemos reservado con mucho aprecio *${pases} ${pases === 1 ? 'pase oficial' : 'pases oficiales'}* para su distinguida familia.\n\n` +
                `Pueden abrir su invitación digital personalizada para consultar itinerario, mapa de ubicaciones y confirmar quiénes asistirán aquí:\n` +
                `👉 ${urlFinal}\n\n` +
                `_Por favor confirmen antes del 10 de Octubre para garantizar su reservación._\n` +
                `¡Será un honor compartir este día tan especial con ustedes! 🥂💖`;
        }

        let waLink = "";
        const textoEncoded = encodeURIComponent(mensajeGala);
        const telDigits = (telefono || "").replace(/\D/g, "");
        if (telDigits && telDigits.length >= 10) {
            let num = telDigits;
            if (num.length === 10) num = "52" + num;
            waLink = `https://wa.me/${num}?text=${textoEncoded}`;
        } else {
            waLink = `https://api.whatsapp.com/send?text=${textoEncoded}`;
        }

        return {
            url: urlFinal,
            mensaje: mensajeGala,
            waLink: waLink
        };
    }

    generarEnlacePersonalizado() {
        const tipo = this.adminView.genTypeSelect ? this.adminView.genTypeSelect.value : "familia";
        const nombreFamilia = (this.adminView.genNameInput.value || "").trim();
        const pases = parseInt(this.adminView.genPassesInput.value, 10) || 1;
        const telefono = (this.adminView.genPhoneInput.value || "").replace(/\D/g, "");

        if (!nombreFamilia) {
            const mensajeAlerta = tipo === "amigo" 
                ? "Por favor escribe el nombre de la amiga o amigo (Ej: Sofía Martínez)." 
                : "Por favor escribe el nombre de la familia o del invitado (Ej: Familia Castillo Morales).";
            alert(mensajeAlerta);
            if (this.adminView.genNameInput) this.adminView.genNameInput.focus();
            return;
        }

        const resetear = this.adminView.genResetLock && this.adminView.genResetLock.checked;
        const inv = this.construirInvitacion(nombreFamilia, pases, tipo, telefono, resetear);

        this.ultimoEnlaceGenerado = inv.url;
        this.ultimoMensajeWA = inv.mensaje;
        this.ultimoTelefono = telefono;

        this.adminView.mostrarEnlaceGenerado(inv.url, inv.url);
        this.guardarEnHistorial(nombreFamilia, pases, inv.url, inv.mensaje, telefono, tipo);
        this.actualizarHistorialEnlaces();
    }

    /**
     * Lee y procesa un archivo Excel (.xlsx, .xls) o CSV subido por el usuario
     */
    manejarArchivoExcel(file) {
        if (!file) return;

        if (typeof XLSX === "undefined") {
            alert("La librería de procesamiento de Excel aún no ha cargado. Por favor espera un momento o recarga la página.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (!rawRows || rawRows.length === 0) {
                    alert("El archivo subido está vacío o no contiene filas con datos.");
                    return;
                }

                const procesados = [];
                rawRows.forEach((row) => {
                    const getVal = (...keys) => {
                        for (const k of keys) {
                            for (const rowKey of Object.keys(row)) {
                                const normKey = rowKey.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                if (normKey === k.toLowerCase()) {
                                    return String(row[rowKey]).trim();
                                }
                            }
                        }
                        return "";
                    };

                    const nombre = getVal("nombre", "familia", "invitado", "name");
                    if (!nombre) return; // omitir filas sin nombre

                    let tipo = getVal("tipo", "type").toLowerCase();
                    if (!tipo.includes("amig") && !tipo.includes("person")) {
                        tipo = "familia";
                    } else {
                        tipo = "amigo";
                    }

                    let pases = parseInt(getVal("pases", "boletos", "lugares", "passes", "cupos"), 10);
                    if (isNaN(pases) || pases <= 0) {
                        pases = tipo === "amigo" ? 1 : 4;
                    }

                    let telefono = getVal("telefono", "whatsapp", "celular", "tel", "phone").replace(/\D/g, "");

                    procesados.push({
                        tipo,
                        nombre,
                        pases,
                        telefono
                    });
                });

                if (procesados.length === 0) {
                    alert("No se detectaron invitados válidos en el archivo. Asegúrate de incluir una columna llamada 'Nombre' con los datos.");
                    return;
                }

                this.invitadosExcel = procesados;
                this.invitadosExcelProcesados = [];
                this.adminView.mostrarVistaPreviaExcel(file.name, procesados);
            } catch (err) {
                console.error("Error al leer archivo Excel:", err);
                alert("Ocurrió un error al procesar el archivo: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    /**
     * Genera las invitaciones y enlaces de todos los registros detectados en el Excel
     */
    procesarInvitadosExcel() {
        if (!this.invitadosExcel || this.invitadosExcel.length === 0) {
            alert("Primero selecciona o arrastra un archivo Excel con invitados.");
            return;
        }

        const resultados = [];
        this.invitadosExcel.forEach(item => {
            const inv = this.construirInvitacion(item.nombre, item.pases, item.tipo, item.telefono);
            resultados.push({
                tipo: item.tipo,
                nombre: item.nombre,
                pases: item.pases,
                telefono: item.telefono,
                enlace: inv.url,
                waLink: inv.waLink,
                mensaje: inv.mensaje
            });
            // Guardar en el historial de enlaces del panel
            this.guardarEnHistorial(item.nombre, item.pases, inv.url, inv.mensaje, item.telefono, item.tipo);
        });

        this.invitadosExcelProcesados = resultados;
        this.actualizarHistorialEnlaces();

        this.adminView.mostrarExitoExcel(`🎉 ¡${resultados.length} invitaciones generadas con éxito y agregadas al historial! Ahora puedes descargar el archivo Excel con todos los enlaces listos o usarlos desde aquí abajo.`);
    }

    /**
     * Exporta un archivo Excel que incluye todos los enlaces web y links directos de WhatsApp
     */
    exportarExcelConEnlaces() {
        if (!this.invitadosExcelProcesados || this.invitadosExcelProcesados.length === 0) {
            alert("Primero genera las invitaciones haciendo clic en el botón morado.");
            return;
        }

        if (typeof XLSX === "undefined") {
            alert("Librería XLSX no disponible.");
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            const headers = [
                "Tipo",
                "Nombre Invitado / Familia",
                "Pases",
                "Teléfono WhatsApp",
                "Enlace Invitación Web",
                "Link Directo WhatsApp",
                "Mensaje Completo para WhatsApp"
            ];

            const rows = [headers];
            this.invitadosExcelProcesados.forEach(item => {
                rows.push([
                    item.tipo === "amigo" ? "Amigo" : "Familia",
                    item.nombre,
                    item.pases,
                    item.telefono || "N/A",
                    item.enlace,
                    item.waLink,
                    item.mensaje
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws["!cols"] = [
                { wch: 12 },
                { wch: 32 },
                { wch: 8 },
                { wch: 18 },
                { wch: 55 },
                { wch: 50 },
                { wch: 65 }
            ];

            XLSX.utils.book_append_sheet(wb, ws, "Invitaciones Listas");
            XLSX.writeFile(wb, "Invitaciones_Generadas_XV_Valentina.xlsx");
        } catch (err) {
            console.error("Error al exportar Excel con enlaces:", err);
            alert("No se pudo descargar el archivo: " + err.message);
        }
    }

    /**
     * Limpia el estado y la vista previa del archivo Excel cargado
     */
    limpiarExcel() {
        this.invitadosExcel = [];
        this.invitadosExcelProcesados = [];
        this.adminView.limpiarVistaPreviaExcel();
    }

    async acortarEnlaceActual() {
        if (!this.ultimoEnlaceGenerado) return;
        const btnShorten = this.adminView.btnShortenGenLink;
        const originalHtml = btnShorten ? btnShorten.innerHTML : "";

        if (btnShorten) {
            btnShorten.disabled = true;
            btnShorten.innerHTML = `<i class="bi bi-hourglass-split me-1"></i> Acortando...`;
        }

        try {
            const apiEndpoint = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(this.ultimoEnlaceGenerado)}`;
            const resp = await fetch(apiEndpoint);
            if (!resp.ok) throw new Error("No se pudo contactar al servicio de TinyURL");
            const shortUrl = (await resp.text()).trim();

            if (shortUrl && shortUrl.startsWith("http")) {
                const urlAnterior = this.ultimoEnlaceGenerado;
                this.ultimoEnlaceGenerado = shortUrl;
                if (this.ultimoMensajeWA) {
                    this.ultimoMensajeWA = this.ultimoMensajeWA.replace(urlAnterior, shortUrl);
                }
                this.adminView.mostrarEnlaceGenerado(shortUrl, shortUrl);
                alert(`¡Listo! Enlace ultra-corto generado:\n${shortUrl}`);
            } else {
                throw new Error("Respuesta inválida del acortador");
            }
        } catch (err) {
            console.warn("No se pudo acortar automáticamente:", err);
            alert("No se pudo conectar con el servicio en este momento. El enlace generado ya está en su formato más compacto posible.");
        } finally {
            if (btnShorten) {
                btnShorten.disabled = false;
                btnShorten.innerHTML = originalHtml || `<i class="bi bi-link-45deg me-1"></i> Acortar (TinyURL)`;
            }
        }
    }

    copiarEnlaceAlPortapapeles(texto) {
        if (!texto) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(() => {
                alert("¡Enlace copiado al portapapeles! Listo para pegar en WhatsApp o mensaje.");
            }).catch(() => {
                this.fallbackCopiar(texto);
            });
        } else {
            this.fallbackCopiar(texto);
        }
    }

    fallbackCopiar(texto) {
        const dummy = document.createElement("textarea");
        dummy.value = texto;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("¡Enlace copiado al portapapeles!");
    }

    abrirWhatsAppConMensaje(telefono, mensaje) {
        if (!mensaje) {
            mensaje = this.ultimoMensajeWA || "";
        }
        const textoEncoded = encodeURIComponent(mensaje);
        let waUrl = "";

        if (telefono && telefono.length >= 10) {
            // Si tiene 10 dígitos y es de México, agregar código de país 52 si no lo tiene
            let num = telefono;
            if (num.length === 10) num = "52" + num;
            waUrl = `https://wa.me/${num}?text=${textoEncoded}`;
        } else {
            // Abre WhatsApp para que la clienta seleccione a qué contacto enviarlo
            waUrl = `https://api.whatsapp.com/send?text=${textoEncoded}`;
        }

        window.open(waUrl, "_blank");
    }

    guardarEnHistorial(familia, pases, url, mensaje, telefono, tipo = "familia") {
        try {
            const historial = JSON.parse(localStorage.getItem("xv_valentina_enlaces_gen") || "[]");
            historial.unshift({
                familia,
                pases,
                url,
                mensaje,
                telefono,
                tipo,
                fecha: new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
            });
            // Mantener solo los últimos 20
            localStorage.setItem("xv_valentina_enlaces_gen", JSON.stringify(historial.slice(0, 20)));
        } catch (e) {
            console.error("Error guardando historial de enlaces:", e);
        }
    }

    actualizarHistorialEnlaces() {
        try {
            const historial = JSON.parse(localStorage.getItem("xv_valentina_enlaces_gen") || "[]");
            this.adminView.renderizarHistorial(
                historial,
                (item) => this.copiarEnlaceAlPortapapeles(item.url),
                (item) => this.abrirWhatsAppConMensaje(item.telefono, item.mensaje),
                (index) => this.eliminarEnlaceHistorial(index)
            );
        } catch (e) {
            console.error("Error cargando historial de enlaces:", e);
        }
    }

    eliminarEnlaceHistorial(index) {
        try {
            const historial = JSON.parse(localStorage.getItem("xv_valentina_enlaces_gen") || "[]");
            if (index >= 0 && index < historial.length) {
                historial.splice(index, 1);
                localStorage.setItem("xv_valentina_enlaces_gen", JSON.stringify(historial));
                this.actualizarHistorialEnlaces();
            }
        } catch (e) {
            console.error("Error eliminando enlace de historial:", e);
        }
    }

    limpiarHistorialEnlaces() {
        localStorage.removeItem("xv_valentina_enlaces_gen");
        this.actualizarHistorialEnlaces();
    }

    /**
     * Aplica simultáneamente el filtro de asistencia (SÍ / NO / Todos)
     * y el término de búsqueda por texto.
     */
    aplicarFiltros() {
        const todos = this.confirmacionDAO.obtenerTodos();
        const termino = (this.terminoBusqueda || "").toLowerCase().trim();
        const filtro = this.filtroAsistencia || "todos";

        const filtrados = todos.filter(i => {
            // 1. Filtro de Asistencia (SÍ / NO / Todos)
            if (filtro === "si" && !i.asistencia) return false;
            if (filtro === "no" && i.asistencia) return false;

            // 2. Filtro de Búsqueda de Texto
            if (termino) {
                const nombre = (i.nombre || "").toLowerCase();
                const id = (i.id || "").toLowerCase();
                const tel = (i.telefono || "");
                const cancion = (i.cancionDj || "").toLowerCase();
                const menu = (i.menu || "").toLowerCase();
                const alergias = (i.alergias || "").toLowerCase();

                const coincideAsistente = i.asistentes && i.asistentes.some(a => (a || "").toLowerCase().includes(termino));

                const coincide = nombre.includes(termino) ||
                                 id.includes(termino) ||
                                 tel.includes(termino) ||
                                 cancion.includes(termino) ||
                                 menu.includes(termino) ||
                                 alergias.includes(termino) ||
                                 coincideAsistente;

                if (!coincide) return false;
            }

            return true;
        });

        this.adminView.renderizarTabla(filtrados, (id) => this.eliminarInvitado(id));
    }

    eliminarInvitado(id) {
        if (!confirm("¿Deseas eliminar este registro de confirmación?")) {
            return;
        }
        this.confirmacionDAO.eliminar(id);
        this.actualizarVista();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminController;
}
