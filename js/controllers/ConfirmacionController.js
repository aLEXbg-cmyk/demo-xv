/**
 * ========================================================
 * CONTROLADOR: ConfirmacionController.js (Arquitectura MVC)
 * Gestiona el flujo de confirmación de asistencia:
 * Captura datos de la vista, crea el modelo Invitado, invoca al DAO
 * para persistir, genera el enlace de WhatsApp y actualiza la vista.
 * ========================================================
 */

class ConfirmacionController {
    constructor(eventoModel, confirmacionDAO, confirmacionView, onNuevaConfirmacion = null) {
        this.eventoModel = eventoModel;
        this.confirmacionDAO = confirmacionDAO;
        this.confirmacionView = confirmacionView;
        this.onNuevaConfirmacion = onNuevaConfirmacion;

        this.inicializar();
    }

    inicializar() {
        if (this.confirmacionView.form) {
            this.confirmacionView.form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.procesarConfirmacion();
            });
        }

        // Verificar si este invitado ya confirmó anteriormente en este dispositivo
        this.verificarConfirmacionPrevia();
    }

    obtenerClaveStorageInvitado() {
        const params = new URLSearchParams(window.location.search);
        let nombre = params.get("familia") || params.get("f") || params.get("invitado") || params.get("nombre");
        if (!nombre) {
            const rawSearch = window.location.search ? window.location.search.substring(1).trim() : "";
            if (rawSearch && !rawSearch.startsWith("admin")) {
                const primerParam = rawSearch.split("&")[0];
                const parts = primerParam.split("=");
                if (parts[0] && !["r", "reset", "nuevo", "fbclid"].includes(parts[0].toLowerCase())) {
                    nombre = parts[0];
                }
            }
        }
        const slug = nombre ? decodeURIComponent(nombre).toLowerCase().replace(/[^a-z0-9]/g, "_") : "general";
        return `xv_lizette_lock_${slug}`;
    }

    verificarConfirmacionPrevia() {
        const params = new URLSearchParams(window.location.search);
        const storageKey = this.obtenerClaveStorageInvitado();

        // Si el enlace incluye parámetro de reinicio/desbloqueo (?r=1 o ?reset=1 o ?nuevo=1)
        if (params.get("r") || params.get("reset") || params.get("nuevo")) {
            try {
                localStorage.removeItem(storageKey);
                console.log("[RSVP] Enlace de desbloqueo detectado: Formulario habilitado para nueva respuesta.");
                if (this.confirmacionView) {
                    this.confirmacionView.desbloquearFormulario();
                }
            } catch (e) {
                console.error("Error al limpiar clave de bloqueo:", e);
            }
            return;
        }

        // Verificar si ya existe confirmación guardada para este invitado
        try {
            const guardado = localStorage.getItem(storageKey);
            if (guardado) {
                const data = JSON.parse(guardado);
                const invitado = new InvitadoModel(data);
                const contactoWhatsApp = this.eventoModel.getDatos().contactoWhatsApp;
                const nombreQuinceanera = this.eventoModel.getDatos().quinceanera.nombre;
                const whatsappUrl = invitado.generarEnlaceWhatsApp(contactoWhatsApp, nombreQuinceanera);

                // Ocultar formulario y mostrar tarjeta de confirmación bloqueada
                this.confirmacionView.mostrarConfirmacionRegistrada(invitado, whatsappUrl);
                console.log("[RSVP] Invitado ya confirmado previamente. Formulario bloqueado.");
            }
        } catch (e) {
            console.error("Error al verificar confirmación previa:", e);
        }
    }

    procesarConfirmacion() {
        try {
            const formData = this.confirmacionView.obtenerDatosFormulario();

            // Instanciar el Modelo
            const nuevoInvitado = new InvitadoModel(formData);

            // Validar Reglas de Negocio
            const validacion = nuevoInvitado.validar();
            if (!validacion.valido) {
                alert("Por favor revisa los siguientes campos:\n- " + validacion.errores.join("\n- "));
                return;
            }

            // Persistir a través del DAO (Data Access Object)
            this.confirmacionDAO.guardar(nuevoInvitado);

            // Guardar bloqueo persistente en este dispositivo para este invitado
            const storageKey = this.obtenerClaveStorageInvitado();
            try {
                localStorage.setItem(storageKey, JSON.stringify(nuevoInvitado.toJSON()));
            } catch (e) {
                console.warn("No se pudo guardar bloqueo en localStorage:", e);
            }

            // Generar Enlace de WhatsApp
            const contactoWhatsApp = this.eventoModel.getDatos().contactoWhatsApp;
            const nombreQuinceanera = this.eventoModel.getDatos().quinceanera.nombre;
            const whatsappUrl = nuevoInvitado.generarEnlaceWhatsApp(contactoWhatsApp, nombreQuinceanera);

            // Mostrar el Pase Digital en el Modal y lanzar confeti
            this.confirmacionView.mostrarPaseDigital(nuevoInvitado, whatsappUrl);

            // Ocultar el formulario y reemplazarlo con la tarjeta permanente de confirmación
            this.confirmacionView.mostrarConfirmacionRegistrada(nuevoInvitado, whatsappUrl);

            // Notificar a observadores (como el Panel de Anfitriones)
            if (typeof this.onNuevaConfirmacion === "function") {
                this.onNuevaConfirmacion(nuevoInvitado);
            }

        } catch (error) {
            console.error("Error al procesar la confirmación:", error);
            alert("Ocurrió un error al guardar la confirmación: " + error.message);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfirmacionController;
}
