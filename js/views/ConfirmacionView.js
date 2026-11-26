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
        this.submitBtn = document.getElementById("btn-submit-rsvp");
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

        // Elementos adaptables y de asistentes individuales
        this.labelGuestName = document.getElementById("label-guest-name");
        this.labelPassesSelector = document.getElementById("label-passes-selector");
        this.passesHelperText = document.getElementById("passes-helper-text");
        this.passesSelectorControls = document.getElementById("passes-selector-controls");
        this.attendeesContainer = document.getElementById("attendees-container");
        this.attendeesFieldsList = document.getElementById("attendees-fields-list");
        this.attendeesCounterBadge = document.getElementById("attendees-counter-badge");
        this.labelAttendeesTitle = document.getElementById("label-attendees-title");

        // Radio cards de asistencia
        this.radioYes = document.getElementById("att-yes");
        this.radioNo = document.getElementById("att-no");
        this.cardYes = document.getElementById("card-att-yes");
        this.cardNo = document.getElementById("card-att-no");

        // Modal de Confirmación
        this.modal = document.getElementById("pass-modal");
        this.modalClose = document.getElementById("modal-close-btn");
        this.btnCloseModalAction = document.getElementById("btn-close-modal-action");
        this.modalStatusIcon = document.getElementById("modal-status-icon");
        this.modalStatusTitle = document.getElementById("modal-status-title");
        this.modalStatusSubtitle = document.getElementById("modal-status-subtitle");
        this.modalGuestGreeting = document.getElementById("modal-guest-greeting");
        this.modalStatusBadge = document.getElementById("modal-status-badge");
        this.modalMessageBody = document.getElementById("modal-message-body");
        this.modalAttendeesSummary = document.getElementById("modal-attendees-summary");
        this.modalSummaryPasses = document.getElementById("modal-summary-passes");
        this.modalSummaryAttendeesRow = document.getElementById("modal-summary-attendees-row");
        this.modalSummaryAttendees = document.getElementById("modal-summary-attendees");
        this.whatsappBtn = document.getElementById("btn-send-whatsapp");

        // Tarjeta de Asistencia Ya Registrada (Bloqueo en la página tras confirmar)
        this.confirmedCard = document.getElementById("rsvp-confirmed-card");
        this.confirmedCardIcon = document.getElementById("confirmed-card-icon");
        this.confirmedStatusBadge = document.getElementById("confirmed-status-badge");
        this.confirmedGuestName = document.getElementById("confirmed-guest-name");
        this.confirmedGuestSubtitle = document.getElementById("confirmed-guest-subtitle");
        this.confirmedSummaryBox = document.getElementById("confirmed-summary-box");
        this.confirmedSummaryPasses = document.getElementById("confirmed-summary-passes");
        this.confirmedSummaryAttendeesRow = document.getElementById("confirmed-summary-attendees-row");
        this.confirmedSummaryAttendees = document.getElementById("confirmed-summary-attendees");
        this.btnConfirmedWhatsapp = document.getElementById("btn-confirmed-whatsapp");

        this.tipo = "familia"; // "familia" | "amigo"
        this.numeroPases = 4; // Valor inicial por defecto para Pase Familiar
        this.maxPasesPermitidos = null; // Límite configurable vía URL
        this.telefonoAsignado = ""; // Teléfono asignado desde la URL (si vino en el enlace)
        this.inicializarEventosInternos();
        this.actualizarPasesDisplay();
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
                const maximo = this.maxPasesPermitidos || 10;
                if (this.numeroPases < maximo) {
                    this.numeroPases++;
                    this.actualizarPasesDisplay();
                } else if (this.maxPasesPermitidos) {
                    // Notificación amigable si intentan agregar más de los pases asignados
                    const toast = document.getElementById("toast-msg");
                    if (toast) {
                        toast.textContent = `Se han reservado un máximo de ${this.maxPasesPermitidos} pases para su familia.`;
                        toast.classList.add("show");
                        setTimeout(() => toast.classList.remove("show"), 3500);
                    } else {
                        alert(`Se han reservado un máximo de ${this.maxPasesPermitidos} pases para su familia.`);
                    }
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
        if (this.btnCloseModalAction) {
            this.btnCloseModalAction.addEventListener("click", () => this.cerrarModal());
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

    /**
     * Define el tipo de invitado ('amigo' o 'familia') y adapta la interfaz
     */
    setTipo(tipo) {
        this.tipo = (tipo === "amigo" || tipo === "personal") ? "amigo" : "familia";
        this.adaptarVistaPorTipo();
    }

    /**
     * Adapta dinámicamente etiquetas, textos explicativos y visibilidad de controles según tipo
     */
    adaptarVistaPorTipo() {
        if (this.tipo === "amigo") {
            if (this.labelGuestName) {
                this.labelGuestName.innerHTML = `Tu Nombre Completo <span class="req">*</span>`;
            }
            if (this.nombreInput) {
                this.nombreInput.placeholder = "Ej: Sofía Martínez o Andrea";
            }
            if (this.labelPassesSelector) {
                this.labelPassesSelector.textContent = "Pase de Asistencia";
            }
            if (this.passesHelperText) {
                this.passesHelperText.textContent = (this.numeroPases === 1)
                    ? "Pase personal e intransferible reservado especialmente para ti."
                    : "Lugares reservados para ti y tus acompañantes.";
            }

            // Si es 1 pase personal para amiga/o, ocultamos los botones +/- y mostramos distintivo de pase personal
            if (this.numeroPases === 1) {
                if (this.passesSelectorControls) this.passesSelectorControls.style.display = "none";
                let singleBadge = document.getElementById("single-pass-badge");
                if (!singleBadge && this.passesContainer) {
                    singleBadge = document.createElement("div");
                    singleBadge.id = "single-pass-badge";
                    singleBadge.className = "single-personal-pass-badge";
                    singleBadge.innerHTML = `<i class="bi bi-heart-fill me-1" style="color: #D6798E;"></i> <strong>1 Pase Personal</strong> reservado en tu honor`;
                    if (this.passesSelectorControls) {
                        this.passesSelectorControls.insertAdjacentElement("beforebegin", singleBadge);
                    } else {
                        this.passesContainer.appendChild(singleBadge);
                    }
                }
                if (singleBadge) singleBadge.style.display = "flex";
            } else {
                if (this.passesSelectorControls) this.passesSelectorControls.style.display = "flex";
                const singleBadge = document.getElementById("single-pass-badge");
                if (singleBadge) singleBadge.style.display = "none";
            }
        } else {
            // Tipo FAMILIA
            if (this.labelGuestName) {
                this.labelGuestName.innerHTML = `Nombre de la Familia Invitada <span class="req">*</span>`;
            }
            if (this.nombreInput) {
                this.nombreInput.placeholder = "Ej: Familia Castillo Morales";
            }
            if (this.labelPassesSelector) {
                this.labelPassesSelector.textContent = "Integrantes de la Familia (Pase Familiar)";
            }
            if (this.passesHelperText) {
                this.passesHelperText.textContent = "Selecciona el número de integrantes que acudirán con este pase familiar.";
            }

            if (this.passesSelectorControls) this.passesSelectorControls.style.display = "flex";
            const singleBadge = document.getElementById("single-pass-badge");
            if (singleBadge) singleBadge.style.display = "none";
        }

        this.renderizarCamposAsistentes();
    }

    actualizarPasesDisplay() {
        if (this.passesDisplay) {
            this.passesDisplay.textContent = this.numeroPases;
        }

        // Si es tipo amigo y el número es 1, mantener insignia personal
        const singleBadge = document.getElementById("single-pass-badge");
        if (this.tipo === "amigo" && this.numeroPases === 1) {
            if (this.passesSelectorControls) this.passesSelectorControls.style.display = "none";
            if (singleBadge) singleBadge.style.display = "flex";
        } else if (this.passesSelectorControls) {
            this.passesSelectorControls.style.display = "flex";
            if (singleBadge) singleBadge.style.display = "none";
        }

        this.renderizarCamposAsistentes();
    }

    /**
     * Renderiza campos de texto individuales para capturar los nombres de cada asistente
     * ("quién y quiénes son") cuando es familia o cuando son múltiples pases.
     */
    renderizarCamposAsistentes() {
        if (!this.attendeesContainer || !this.attendeesFieldsList) return;

        const asiste = this.radioYes ? this.radioYes.checked : true;
        if (!asiste) {
            this.attendeesContainer.style.display = "none";
            return;
        }

        // Si es una amiga/amigo con solo 1 pase, no requiere campos extras (su nombre es el titular)
        if (this.tipo === "amigo" && this.numeroPases === 1) {
            this.attendeesContainer.style.display = "none";
            return;
        }

        // Para familia o si son 2 o más pases, mostramos los campos individuales
        this.attendeesContainer.style.display = "block";

        if (this.attendeesCounterBadge) {
            this.attendeesCounterBadge.textContent = `${this.numeroPases} ${this.numeroPases === 1 ? 'lugar' : 'lugares'}`;
        }

        // Resguardar nombres que el usuario ya haya escrito para no borrarlos
        const valoresPrevios = [];
        const inputsActuales = this.attendeesFieldsList.querySelectorAll(".attendee-input-field");
        inputsActuales.forEach(input => {
            valoresPrevios.push(input.value);
        });

        this.attendeesFieldsList.innerHTML = "";

        for (let i = 1; i <= this.numeroPases; i++) {
            const group = document.createElement("div");
            group.className = "attendee-input-group";

            const placeholder = (i === 1 && this.tipo === "amigo") ? "Tu nombre completo" : "Nombre completo";

            // Si hay un valor previo guardado, conservarlo
            const valorExistente = valoresPrevios[i - 1] !== undefined 
                ? valoresPrevios[i - 1] 
                : (i === 1 && this.tipo === "amigo" && this.nombreInput ? this.nombreInput.value.trim() : "");

            group.innerHTML = `
                <div class="attendee-num-badge">${i}</div>
                <div class="attendee-input-content" style="flex: 1;">
                    <input type="text" class="attendee-input-field" data-index="${i}" placeholder="${placeholder}" value="${this.escaparHtml(valorExistente)}" aria-label="Nombre del asistente ${i}">
                </div>
            `;

            this.attendeesFieldsList.appendChild(group);
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
            if (this.attendeesContainer) {
                const inputs = this.attendeesContainer.querySelectorAll(".attendee-input-field");
                inputs.forEach(inp => { inp.disabled = false; });
            }
            if (this.submitBtn) this.submitBtn.innerHTML = `<span>CONFIRMAR ASISTENCIA</span>`;
            this.renderizarCamposAsistentes();
        } else {
            if (this.cardNo) this.cardNo.classList.add("selected-no");
            if (this.cardYes) this.cardYes.classList.remove("selected-yes");
            if (this.passesContainer) this.passesContainer.style.display = "none";
            if (this.menuContainer) this.menuContainer.style.display = "none";
            if (this.allergiesContainer) this.allergiesContainer.style.display = "none";
            if (this.songContainer) this.songContainer.style.display = "none";
            if (this.attendeesContainer) {
                this.attendeesContainer.style.display = "none";
                const inputs = this.attendeesContainer.querySelectorAll(".attendee-input-field");
                inputs.forEach(inp => { inp.disabled = true; });
            }
            if (this.submitBtn) this.submitBtn.innerHTML = `<span>ENVIAR RESPUESTA</span>`;
        }
    }

    /**
     * Obtiene los valores actuales del formulario, incluyendo los nombres de cada asistente
     */
    obtenerDatosFormulario() {
        const asiste = this.radioYes ? this.radioYes.checked : true;
        const asistentes = [];

        if (asiste) {
            if (this.tipo === "amigo" && this.numeroPases === 1) {
                const nombreTitular = this.nombreInput ? this.nombreInput.value.trim() : "";
                if (nombreTitular) asistentes.push(nombreTitular);
            } else if (this.attendeesFieldsList) {
                const inputs = this.attendeesFieldsList.querySelectorAll(".attendee-input-field");
                inputs.forEach(inp => {
                    const val = inp.value.trim();
                    if (val) asistentes.push(val);
                });
            }
        }

        return {
            nombre: this.nombreInput ? this.nombreInput.value.trim() : "",
            tipo: this.tipo,
            pases: asiste ? this.numeroPases : 0,
            asistencia: asiste,
            asistentes: asistentes,
            telefono: this.telefonoAsignado || (this.telefonoInput ? this.telefonoInput.value.trim() : ""),
            mensaje: this.mensajeInput ? this.mensajeInput.value.trim() : "",
            menu: this.menuSelect ? this.menuSelect.value : "Gala Tradicional",
            alergias: this.allergiesInput ? this.allergiesInput.value.trim() : "Ninguna",
            cancionDj: this.songInput ? this.songInput.value.trim() : ""
        };
    }

    /**
     * Muestra el modal con el resultado de la confirmación (SÍ asistirá o NO asistirá)
     * y el botón para notificar por WhatsApp
     */
    mostrarPaseDigital(invitado, whatsappUrl) {
        const esAmigo = invitado.tipo === "amigo";
        const asiste = Boolean(invitado.asistencia);

        if (this.modalGuestGreeting) {
            this.modalGuestGreeting.textContent = invitado.nombre;
        }

        if (this.whatsappBtn) {
            this.whatsappBtn.href = whatsappUrl;
        }

        if (asiste) {
            // Caso 1: SÍ ASISTE
            if (this.whatsappBtn) {
                this.whatsappBtn.style.display = "flex";
                const btnSpan = this.whatsappBtn.querySelector("span");
                if (btnSpan) btnSpan.textContent = "ENVIAR CONFIRMACIÓN POR WHATSAPP";
            }
            if (this.btnCloseModalAction) {
                this.btnCloseModalAction.className = "btn-secondary-close";
                this.btnCloseModalAction.removeAttribute("style");
                this.btnCloseModalAction.textContent = "Aceptar y Cerrar";
            }
            if (this.modalStatusIcon) {
                this.modalStatusIcon.innerHTML = `<i class="bi bi-stars" style="color: var(--color-action-cta);"></i>`;
            }
            if (this.modalStatusTitle) {
                this.modalStatusTitle.textContent = "¡Confirmación Exitosa!";
            }
            if (this.modalStatusSubtitle) {
                this.modalStatusSubtitle.textContent = "Tu lugar ha sido reservado para esta gran noche";
            }
            if (this.modalStatusBadge) {
                this.modalStatusBadge.className = "confirmation-status-pill si";
                this.modalStatusBadge.innerHTML = `<i class="bi bi-check2-circle me-1"></i> Asistencia Confirmada`;
            }
            if (this.modalMessageBody) {
                if (esAmigo) {
                    this.modalMessageBody.textContent = `¡Muchas gracias por confirmar, ${invitado.nombre}! Nos llena de enorme emoción y alegría saber que nos acompañarás en esta gran noche de gala.`;
                } else {
                    this.modalMessageBody.textContent = `¡Muchas gracias por confirmar su asistencia! Será un gran honor y un placer enorme contar con su compañía en esta noche tan especial.`;
                }
            }

            if (this.modalAttendeesSummary) {
                this.modalAttendeesSummary.style.display = "block";
                if (this.modalSummaryPasses) {
                    this.modalSummaryPasses.textContent = `${invitado.pases} ${invitado.pases === 1 ? 'lugar' : 'lugares'}`;
                }
                if (this.modalSummaryAttendeesRow && this.modalSummaryAttendees) {
                    if (invitado.asistentes && invitado.asistentes.length > 0) {
                        this.modalSummaryAttendeesRow.style.display = "flex";
                        this.modalSummaryAttendees.textContent = invitado.asistentes.join(", ");
                    } else {
                        this.modalSummaryAttendeesRow.style.display = "none";
                    }
                }
            }

            this.lanzarConfeti();
        } else {
            // Caso 2: NO ASISTE -> Ocultar por completo el botón de WhatsApp
            if (this.whatsappBtn) {
                this.whatsappBtn.style.display = "none";
            }
            if (this.btnCloseModalAction) {
                this.btnCloseModalAction.className = "btn-luxury-modal-action";
                this.btnCloseModalAction.removeAttribute("style");
                this.btnCloseModalAction.textContent = "Aceptar y Cerrar";
            }
            if (this.modalStatusIcon) {
                this.modalStatusIcon.innerHTML = `<i class="bi bi-heart-fill" style="color: var(--color-action-cta);"></i>`;
            }
            if (this.modalStatusTitle) {
                this.modalStatusTitle.textContent = "Respuesta Registrada";
            }
            if (this.modalStatusSubtitle) {
                this.modalStatusSubtitle.textContent = "Agradecemos de corazón que nos hayas avisado";
            }
            if (this.modalStatusBadge) {
                this.modalStatusBadge.className = "confirmation-status-pill no";
                this.modalStatusBadge.innerHTML = `<i class="bi bi-x-circle me-1"></i> No podrá asistir`;
            }
            if (this.modalMessageBody) {
                if (esAmigo) {
                    this.modalMessageBody.textContent = `Muchas gracias por avisarnos, ${invitado.nombre}. Lamentamos mucho que no puedas acompañarnos, ¡pero agradecemos de todo corazón tu cariño y tus buenos deseos!`;
                } else {
                    this.modalMessageBody.textContent = `Muchas gracias por avisarnos. Lamentamos que no puedan acompañarnos en esta ocasión, ¡pero agradecemos sinceramente sus atenciones y bendiciones para Valentina!`;
                }
            }

            if (this.modalAttendeesSummary) {
                this.modalAttendeesSummary.style.display = "none";
            }
        }

        if (this.modal) {
            this.modal.classList.add("active");
        }
    }

    /**
     * Oculta el formulario de confirmación y muestra la tarjeta de respuesta registrada
     */
    mostrarConfirmacionRegistrada(invitado, whatsappUrl) {
        if (!invitado) return;

        // 1. Ocultar el formulario por completo
        if (this.form) {
            this.form.style.display = "none";
        }

        // 2. Mostrar la tarjeta de confirmación registrada
        if (this.confirmedCard) {
            this.confirmedCard.style.display = "block";
        }

        // 3. Asignar nombre del invitado o familia
        const nombreMostrar = invitado.nombre || "Invitado Especial";
        if (this.confirmedGuestName) {
            this.confirmedGuestName.textContent = nombreMostrar;
        }

        const asiste = Boolean(invitado.asistencia);

        if (asiste) {
            // Caso: SÍ ASISTE
            if (this.confirmedStatusBadge) {
                this.confirmedStatusBadge.className = "confirmation-status-pill si";
                this.confirmedStatusBadge.innerHTML = `<i class="bi bi-check2-circle me-1"></i> Asistencia Confirmada`;
            }
            if (this.confirmedCardIcon) {
                this.confirmedCardIcon.innerHTML = `<i class="bi bi-patch-check-fill" style="color: #2E7D32;"></i>`;
            }
            if (this.confirmedGuestSubtitle) {
                this.confirmedGuestSubtitle.textContent = "Tu lugar ha sido reservado para esta gran noche. ¡Nos vemos en los XV Años!";
            }
            if (this.confirmedSummaryBox) {
                this.confirmedSummaryBox.style.display = "block";
            }
            if (this.confirmedSummaryPasses) {
                this.confirmedSummaryPasses.textContent = `${invitado.pases} ${invitado.pases === 1 ? 'lugar' : 'lugares'}`;
            }
            if (this.confirmedSummaryAttendeesRow && this.confirmedSummaryAttendees) {
                if (invitado.asistentes && invitado.asistentes.length > 0) {
                    this.confirmedSummaryAttendeesRow.style.display = "flex";
                    this.confirmedSummaryAttendees.textContent = invitado.asistentes.join(", ");
                } else {
                    this.confirmedSummaryAttendeesRow.style.display = "none";
                }
            }
            if (this.btnConfirmedWhatsapp) {
                this.btnConfirmedWhatsapp.style.display = "flex";
                this.btnConfirmedWhatsapp.href = whatsappUrl || "#";
            }
        } else {
            // Caso: NO ASISTE
            if (this.confirmedStatusBadge) {
                this.confirmedStatusBadge.className = "confirmation-status-pill no";
                this.confirmedStatusBadge.innerHTML = `<i class="bi bi-dash-circle me-1"></i> No podrá asistir`;
            }
            if (this.confirmedCardIcon) {
                this.confirmedCardIcon.innerHTML = `<i class="bi bi-heart-fill" style="color: var(--color-action-cta);"></i>`;
            }
            if (this.confirmedGuestSubtitle) {
                this.confirmedGuestSubtitle.textContent = "Agradecemos de corazón habernos avisado. ¡Apreciamos tus bendiciones y buenos deseos para Valentina!";
            }
            if (this.confirmedSummaryBox) {
                this.confirmedSummaryBox.style.display = "none";
            }
            if (this.btnConfirmedWhatsapp) {
                this.btnConfirmedWhatsapp.style.display = "none";
            }
        }
    }

    /**
     * Restaura el formulario a su estado visible y oculta la tarjeta de confirmación
     */
    desbloquearFormulario() {
        if (this.confirmedCard) {
            this.confirmedCard.style.display = "none";
        }
        if (this.form) {
            this.form.style.display = "block";
        }
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

    cerrarModal() {
        if (this.modal) {
            this.modal.classList.remove("active");
        }
    }

    limpiarFormulario() {
        if (this.form) this.form.reset();
        this.numeroPases = this.maxPasesPermitidos || (this.tipo === "amigo" ? 1 : 4);
        if (this.nombrePersonalizado && this.nombreInput) {
            this.nombreInput.value = this.nombrePersonalizado;
        }
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
