/**
 * ========================================================
 * VISTA: ConfirmacionView.js (Arquitectura MVC Profesional)
 * Gestiona el formulario de confirmación (RSVP), selector de pases,
 * estados de validación, modal de pase digital VIP y efectos de confeti.
 * ========================================================
 */

class ConfirmacionView {
    constructor() {
        this.form = document.getElementById("rsvp-form");
        this.nombreInput = document.getElementById("guest-name");
        this.telefonoInput = document.getElementById("guest-phone");
        this.mensajeInput = document.getElementById("guest-message");
        this.menuSelect = document.getElementById("guest-menu");
        this.allergiesInput = document.getElementById("guest-allergies");
        this.songInput = document.getElementById("guest-song");
        
        this.passesDisplay = document.getElementById("passes-count");
        this.btnPassesMinus = document.getElementById("btn-passes-minus");
        this.btnPassesPlus = document.getElementById("btn-passes-plus");
        this.passesContainer = document.getElementById("passes-container");
        this.menuContainer = document.getElementById("menu-container");
        this.allergiesContainer = document.getElementById("allergies-container");
        this.songContainer = document.getElementById("song-container");

        // Radio cards de asistencia
        this.radioYes = document.getElementById("att-yes");
        this.radioNo = document.getElementById("att-no");
        this.cardYes = document.getElementById("card-att-yes");
        this.cardNo = document.getElementById("card-att-no");

        // Modal de Pase Digital VIP
        this.modal = document.getElementById("pass-modal");
        this.modalClose = document.getElementById("modal-close-btn");
        this.passIdEl = document.getElementById("modal-pass-id");
        this.passNameEl = document.getElementById("modal-guest-name");
        this.passCountBadge = document.getElementById("modal-pass-count");
        this.passMenuEl = document.getElementById("modal-pass-menu");
        this.whatsappBtn = document.getElementById("btn-send-whatsapp");
        this.btnPrintPass = document.getElementById("btn-print-pass");
        this.qrCanvas = document.getElementById("qr-canvas");

        this.numeroPases = 4; // Valor inicial por defecto para Pase Familiar
        this.inicializarEventosInternos();
    }

    inicializarEventosInternos() {
        // Control de selector de pases con límites
        if (this.btnPassesMinus) {
            this.btnPassesMinus.addEventListener("click", () => {
                if (this.numeroPases > 1) {
                    this.numeroPases--;
                    this.actualizarPasesDisplay();
                }
            });
        }

        if (this.btnPassesPlus) {
            this.btnPassesPlus.addEventListener("click", () => {
                if (this.numeroPases < 10) {
                    this.numeroPases++;
                    this.actualizarPasesDisplay();
                }
            });
        }

        // Alternancia de asistencia
        if (this.radioYes && this.radioNo) {
            this.radioYes.addEventListener("change", () => this.actualizarEstadoAsistencia(true));
            this.radioNo.addEventListener("change", () => this.actualizarEstadoAsistencia(false));
            if (this.cardYes) this.cardYes.addEventListener("click", () => {
                this.radioYes.checked = true;
                this.actualizarEstadoAsistencia(true);
            });
            if (this.cardNo) this.cardNo.addEventListener("click", () => {
                this.radioNo.checked = true;
                this.actualizarEstadoAsistencia(false);
            });
        }

        // Cierre de modal
        if (this.modalClose) {
            this.modalClose.addEventListener("click", () => this.cerrarModal());
        }
        if (this.modal) {
            this.modal.addEventListener("click", (e) => {
                if (e.target === this.modal) this.cerrarModal();
            });
        }

        // Botón de imprimir / guardar pase
        if (this.btnPrintPass) {
            this.btnPrintPass.addEventListener("click", () => {
                window.print();
            });
        }
    }

    actualizarPasesDisplay() {
        if (this.passesDisplay) {
            this.passesDisplay.textContent = this.numeroPases;
        }
    }

    actualizarEstadoAsistencia(asiste) {
        if (asiste) {
            if (this.cardYes) this.cardYes.classList.add("selected-yes");
            if (this.cardNo) this.cardNo.classList.remove("selected-no");
            if (this.passesContainer) this.passesContainer.style.display = "block";
            if (this.menuContainer) this.menuContainer.style.display = "block";
            if (this.allergiesContainer) this.allergiesContainer.style.display = "block";
            if (this.songContainer) this.songContainer.style.display = "block";
        } else {
            if (this.cardNo) this.cardNo.classList.add("selected-no");
            if (this.cardYes) this.cardYes.classList.remove("selected-yes");
            if (this.passesContainer) this.passesContainer.style.display = "none";
            if (this.menuContainer) this.menuContainer.style.display = "none";
            if (this.allergiesContainer) this.allergiesContainer.style.display = "none";
            if (this.songContainer) this.songContainer.style.display = "none";
        }
    }

    /**
     * Obtiene los valores actuales del formulario
     */
    obtenerDatosFormulario() {
        const asiste = this.radioYes ? this.radioYes.checked : true;
        return {
            nombre: this.nombreInput ? this.nombreInput.value : "",
            pases: asiste ? this.numeroPases : 0,
            asistencia: asiste,
            telefono: this.telefonoInput ? this.telefonoInput.value : "",
            mensaje: this.mensajeInput ? this.mensajeInput.value : "",
            menu: this.menuSelect ? this.menuSelect.value : "Gala Tradicional",
            alergias: this.allergiesInput ? this.allergiesInput.value : "Ninguna",
            cancionDj: this.songInput ? this.songInput.value : ""
        };
    }

    /**
     * Muestra el modal del Pase Digital VIP con confeti y botón de WhatsApp
     */
    mostrarPaseDigital(invitado, whatsappUrl) {
        if (this.passIdEl) this.passIdEl.textContent = `PASE FAMILIAR OFICIAL · ${invitado.id}`;
        if (this.passNameEl) this.passNameEl.textContent = invitado.nombre;

        if (this.passCountBadge) {
            if (invitado.asistencia) {
                this.passCountBadge.textContent = `PASE FAMILIAR · ${invitado.pases} INTEGRANTE(S)`;
                this.passCountBadge.style.background = "var(--gradient-cta-btn)";
                this.passCountBadge.style.color = "#ffffff";
            } else {
                this.passCountBadge.textContent = `NO ASISTIRÁ`;
                this.passCountBadge.style.background = "#ffebee";
                this.passCountBadge.style.color = "#c62828";
            }
        }

        if (this.passMenuEl) {
            this.passMenuEl.style.display = "none";
        }

        if (this.whatsappBtn) {
            this.whatsappBtn.href = whatsappUrl;
        }

        this.dibujarCodigoQR(invitado.id);

        if (this.modal) {
            this.modal.classList.add("active");
        }

        if (invitado.asistencia) {
            this.lanzarConfeti();
        }
    }

    cerrarModal() {
        if (this.modal) {
            this.modal.classList.remove("active");
        }
    }

    limpiarFormulario() {
        if (this.form) this.form.reset();
        this.numeroPases = 4;
        this.actualizarPasesDisplay();
        this.actualizarEstadoAsistencia(true);
    }

    /**
     * Dibuja un código QR estilizado en Canvas con alta resolución y estética dorada
     */
    dibujarCodigoQR(texto) {
        if (!this.qrCanvas) return;
        const ctx = this.qrCanvas.getContext("2d");
        const size = (this.qrCanvas.width = this.qrCanvas.height = 160);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // Genera una matriz QR visual de alta definición
        const modulos = 21;
        const celda = size / modulos;

        const dibujarOjo = (x, y) => {
            ctx.fillStyle = "#3A2E31";
            ctx.fillRect(x * celda, y * celda, 7 * celda, 7 * celda);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect((x + 1) * celda, (y + 1) * celda, 5 * celda, 5 * celda);
            ctx.fillStyle = "#D6798E";
            ctx.fillRect((x + 2) * celda, (y + 2) * celda, 3 * celda, 3 * celda);
        };

        dibujarOjo(0, 0);
        dibujarOjo(modulos - 7, 0);
        dibujarOjo(0, modulos - 7);

        let hash = 0;
        for (let i = 0; i < texto.length; i++) {
            hash = (hash << 5) - hash + texto.charCodeAt(i);
            hash |= 0;
        }

        ctx.fillStyle = "#3A2E31";
        for (let r = 0; r < modulos; r++) {
            for (let c = 0; c < modulos; c++) {
                if ((r < 7 && c < 7) || (r < 7 && c >= modulos - 7) || (r >= modulos - 7 && c < 7)) {
                    continue;
                }
                const bit = Math.abs(Math.sin((r * 17 + c * 11 + hash) * 456.789));
                if (bit > 0.45) {
                    ctx.fillRect(c * celda, r * celda, celda - 0.5, celda - 0.5);
                }
            }
        }
    }

    /**
     * Animación de Confeti de gala: confeti dorado, pétalos de rosa y destellos
     */
    lanzarConfeti() {
        const canvas = document.getElementById("confetti-canvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = (canvas.width = window.innerWidth);
        const height = (canvas.height = window.innerHeight);

        const colores = ["#D6798E", "#EAA5B2", "#F7C8D0", "#FDE8EB", "#FFF6F7", "#9B3E54", "#ffffff"];
        const piezas = [];
        const cantidad = 90;

        for (let i = 0; i < cantidad; i++) {
            piezas.push({
                x: width / 2 + (Math.random() - 0.5) * 300,
                y: height / 2 + (Math.random() - 0.5) * 150,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.85) * 18,
                color: colores[Math.floor(Math.random() * colores.length)],
                size: Math.random() * 9 + 4,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 14,
                gravedad: 0.38,
                alpha: 1
            });
        }

        let frame = 0;
        const animar = () => {
            ctx.clearRect(0, 0, width, height);
            let vivas = 0;

            piezas.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravedad;
                p.rotation += p.rotSpeed;
                p.vx *= 0.98;

                if (frame > 45) {
                    p.alpha -= 0.015;
                }

                if (p.alpha > 0 && p.y < height + 50) {
                    vivas++;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = Math.max(0, p.alpha);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
                    ctx.restore();
                }
            });

            frame++;
            if (vivas > 0 && frame < 190) {
                requestAnimationFrame(animar);
            } else {
                ctx.clearRect(0, 0, width, height);
            }
        };

        animar();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfirmacionView;
}
