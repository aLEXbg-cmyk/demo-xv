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

            // Generar Enlace de WhatsApp
            const contactoWhatsApp = this.eventoModel.getDatos().contactoWhatsApp;
            const nombreQuinceanera = this.eventoModel.getDatos().quinceanera.nombre;
            const whatsappUrl = nuevoInvitado.generarEnlaceWhatsApp(contactoWhatsApp, nombreQuinceanera);

            // Mostrar el Pase Digital en la Vista y lanzar confeti
            this.confirmacionView.mostrarPaseDigital(nuevoInvitado, whatsappUrl);

            // Limpiar formulario para futuros ingresos
            this.confirmacionView.limpiarFormulario();

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
