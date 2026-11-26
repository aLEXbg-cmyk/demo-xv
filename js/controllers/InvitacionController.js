/**
 * ========================================================
 * CONTROLADOR: InvitacionController.js (Arquitectura MVC)
 * Coordina la vista principal, la cuenta regresiva en tiempo real,
 * la música ambiental, el sobre de bienvenida y los eventos del calendario.
 * ========================================================
 */

class InvitacionController {
    constructor(eventoModel, invitacionView) {
        this.eventoModel = eventoModel;
        this.invitacionView = invitacionView;
        this.timerInterval = null;

        this.inicializar();
    }

    inicializar() {
        // Iniciar reloj de cuenta regresiva
        this.actualizarReloj();
        this.timerInterval = setInterval(() => this.actualizarReloj(), 1000);

        // Función unificada de apertura del sobre
        const manejarAperturaSobre = () => {
            this.invitacionView.abrirSobre(() => {
                // Iniciar música automáticamente con interacción del usuario
                this.invitacionView.alternarMusica();
            });
        };

        // Eventos de apertura: botón, sello de cera o clic en el sobre
        if (this.invitacionView.openEnvelopeBtn) {
            this.invitacionView.openEnvelopeBtn.addEventListener("click", manejarAperturaSobre);
        }

        const waxSeal = document.getElementById("envelope-wax-seal");
        if (waxSeal) {
            waxSeal.addEventListener("click", manejarAperturaSobre);
        }

        const realEnvelope = document.getElementById("real-envelope");
        if (realEnvelope) {
            realEnvelope.addEventListener("click", (e) => {
                // Si aún no está abierto, abrirlo
                if (!realEnvelope.classList.contains("opening-seal") && !realEnvelope.classList.contains("open")) {
                    manejarAperturaSobre();
                }
            });
        }

        // Clic en la carta o en el botón de entrar para saltar a la invitación
        const letter = document.getElementById("envelope-letter");
        if (letter) {
            letter.addEventListener("click", (e) => {
                if (realEnvelope && realEnvelope.classList.contains("letter-revealed")) {
                    e.stopPropagation();
                    this.invitacionView.entrarInvitacion();
                }
            });
        }

        const letterEnterBtn = document.getElementById("letter-enter-btn");
        if (letterEnterBtn) {
            letterEnterBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.invitacionView.entrarInvitacion();
            });
        }

        // Evento para volver a ver el sobre
        const btnReopen = document.getElementById("reopen-envelope-btn");
        if (btnReopen) {
            btnReopen.addEventListener("click", () => {
                this.invitacionView.reabrirSobre();
            });
        }

        // Modal de bienvenida: elección de música o silencio al ingresar
        if (this.invitacionView.btnEnterWithMusic) {
            this.invitacionView.btnEnterWithMusic.addEventListener("click", () => {
                this.invitacionView.cerrarModalMusica();
                this.invitacionView.alternarMusica();
            });
        }

        if (this.invitacionView.btnEnterSilent) {
            this.invitacionView.btnEnterSilent.addEventListener("click", () => {
                this.invitacionView.cerrarModalMusica();
            });
        }

        // Control manual flotante de música
        if (this.invitacionView.floatingAudioBtn) {
            this.invitacionView.floatingAudioBtn.addEventListener("click", () => {
                this.invitacionView.alternarMusica();
            });
        }

        // Control manual de música en barra (si estuviese presente)
        if (this.invitacionView.musicBtn) {
            this.invitacionView.musicBtn.addEventListener("click", () => {
                this.invitacionView.alternarMusica();
            });
        }

        // Evento de copiado de CLABE interbancaria
        const btnCopyClabe = document.getElementById("btn-copy-clabe");
        if (btnCopyClabe) {
            btnCopyClabe.addEventListener("click", () => {
                const clabe = this.eventoModel.getDatos().regalos.clabe;
                navigator.clipboard.writeText(clabe).then(() => {
                    this.invitacionView.mostrarToast("CLABE copiada al portapapeles");
                }).catch(() => {
                    this.invitacionView.mostrarToast(`CLABE: ${clabe}`);
                });
            });
        }

        // Enlace a Google Calendar
        const btnGoogleCal = document.getElementById("btn-google-calendar");
        if (btnGoogleCal) {
            btnGoogleCal.href = this.eventoModel.generarGoogleCalendarUrl();
        }

        // Descarga de archivo .ICS (Apple Calendar / Outlook)
        const btnDownloadIcs = document.getElementById("btn-download-ics");
        if (btnDownloadIcs) {
            btnDownloadIcs.addEventListener("click", (e) => {
                e.preventDefault();
                this.eventoModel.descargarArchivoICS();
                this.invitacionView.mostrarToast("Descargando evento para tu calendario...");
            });
        }

        // Clic en la marca superior / logotipo para regresar al principio suavemente
        const navBrandBtn = document.getElementById("nav-brand-btn") || document.querySelector(".nav-brand");
        if (navBrandBtn) {
            navBrandBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }
    }

    actualizarReloj() {
        const tiempo = this.eventoModel.obtenerTiempoRestante();
        this.invitacionView.actualizarCuentaRegresiva(tiempo);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvitacionController;
}
