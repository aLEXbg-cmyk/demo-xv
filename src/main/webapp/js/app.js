/**
 * ========================================================
 * PUNTO DE ENTRADA / BOOTSTRAPPER MVC (app.js)
 * Coordina la inicialización e inyección de dependencias entre:
 * - MODELOS (EventoModel, ConfirmacionDAO, InvitadoModel)
 * - VISTAS (InvitacionView, ConfirmacionView, AdminView)
 * - CONTROLADORES (InvitacionController, ConfirmacionController, AdminController)
 * ========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Inicializando Invitación de XV Años (Arquitectura MVC)...");

    // 1. INICIALIZAR CAPA DE MODELOS
    const eventoModel = new EventoModel();
    const confirmacionDAO = new ConfirmacionDAO();

    // 2. INICIALIZAR CAPA DE VISTAS
    const invitacionView = new InvitacionView();
    const confirmacionView = new ConfirmacionView();
    const adminView = new AdminView();

    // 3. INICIALIZAR CAPA DE CONTROLADORES
    const adminController = new AdminController(confirmacionDAO, adminView);

    const confirmacionController = new ConfirmacionController(
        eventoModel,
        confirmacionDAO,
        confirmacionView,
        (nuevoInvitado) => {
            // Notificar al controlador administrativo para actualizar métricas en vivo
            adminController.actualizarVista();
            console.log("[MVC] Nueva confirmacion procesada:", nuevoInvitado);
        }
    );

    const invitacionController = new InvitacionController(eventoModel, invitacionView);

    console.log("[OK] Sistema MVC cargado exitosamente. Todo listo para los XV Anos.");
});
