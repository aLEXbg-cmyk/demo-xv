/**
 * ========================================================
 * SERVICIO: PersonalizacionService.js
 * Gestiona la personalización de la invitación mediante parámetros URL.
 * Permite que cada familia reciba un enlace único con su nombre y número
 * de pases asignados (Ej: ?familia=Familia%20Morales&pases=4).
 * ========================================================
 */

class PersonalizacionService {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        this.datos = this.extraerParametros();
    }

    generarFirma(nombre, pases) {
        const secret = "xv_lizette_gala_2026";
        const str = `${(nombre || "").trim().toLowerCase().replace(/\s+/g, "_")}_${pases}_${secret}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(36).substring(0, 5);
    }

    /**
     * Extrae y normaliza los parámetros de la URL
     */
    extraerParametros() {
        // Soporta múltiples variantes de nombres de parámetros
        const rawFamilia = this.params.get("familia") || 
                           this.params.get("f") || 
                           this.params.get("invitado") || 
                           this.params.get("nombre");

        const rawPases = this.params.get("pases") || 
                         this.params.get("p") || 
                         this.params.get("boletos");

        const rawMesa = this.params.get("mesa") || 
                        this.params.get("m");

        const rawTipo = this.params.get("tipo") || 
                        this.params.get("t");

        const rawTel = this.params.get("tel") || 
                       this.params.get("telefono");

        let familia = rawFamilia ? decodeURIComponent(rawFamilia).replace(/_/g, " ").trim() : null;
        let pases = rawPases ? parseInt(rawPases, 10) : null;
        const mesa = rawMesa ? decodeURIComponent(rawMesa).trim() : null;
        const telefono = rawTel ? decodeURIComponent(rawTel).trim() : null;

        // Detección de formato ultra-corto: ?Karla=2 o ?Karla o ?Familia_Esparza=4 (incluso con &r=1 o reset)
        if (!familia) {
            const rawSearch = window.location.search ? window.location.search.substring(1).trim() : "";
            const rawHash = window.location.hash ? window.location.hash.substring(1).trim() : "";
            const candidate = rawSearch || rawHash;

            if (candidate && candidate !== "admin" && !candidate.startsWith("admin=")) {
                const queryParts = candidate.split("&");
                for (const part of queryParts) {
                    if (!part) continue;
                    const parts = part.split("=");
                    const nombreCandidato = decodeURIComponent(parts[0]).replace(/_/g, " ").replace(/\+/g, " ").trim();
                    const ignorados = ["fbclid", "utm_source", "utm_medium", "admin", "v", "r", "reset", "nuevo"];
                    if (nombreCandidato && !ignorados.includes(nombreCandidato.toLowerCase())) {
                        familia = nombreCandidato;
                        if (parts.length > 1 && !isNaN(parseInt(parts[1], 10))) {
                            pases = parseInt(parts[1], 10);
                        }
                        break;
                    }
                }
            }
        }

        // Inferencia inteligente de tipo:
        let tipo = rawTipo ? decodeURIComponent(rawTipo).toLowerCase().trim() : null;
        if (!tipo && familia) {
            if (/\b(fam|familia)\b/i.test(familia)) {
                tipo = "familia";
            } else {
                tipo = "amigo";
            }
        }
        tipo = (tipo === "amigo" || tipo === "personal" || tipo === "a") ? "amigo" : "familia";

        // Validación de Seguridad y Antimanipulación de Pases
        const rawFirma = this.params.get("s") || this.params.get("sig");
        let alterado = false;
        if (familia && pases) {
            if (rawFirma) {
                const firmaValida = this.generarFirma(familia, pases);
                if (rawFirma !== firmaValida) {
                    console.warn(`[Seguridad] Enlace alterado para "${familia}" con ${pases} pases. Firma inválida.`);
                    alterado = true;
                    pases = 1; // Restringir a 1 pase si fue manipulado
                }
            } else if (pases > 2) {
                // Enlace sin firma oficial que pretende más de 2 pases
                console.warn(`[Seguridad] Enlace sin firma oficial con ${pases} pases. Limitado por seguridad.`);
                alterado = true;
                pases = 2;
            }
        }

        return {
            esPersonalizada: Boolean(familia),
            familia: familia,
            tipo: tipo,
            pases: (!isNaN(pases) && pases > 0) ? pases : null,
            mesa: mesa,
            telefono: telefono,
            alterado: alterado
        };
    }

    /**
     * Aplica la personalización visual en la página
     */
    aplicar(invitacionView, confirmacionView) {
        if (!this.datos.esPersonalizada) {
            console.log("[Personalizacion] Invitación en modo genérico (sin parámetros URL).");
            return;
        }

        console.log(`[Personalizacion] Invitación personalizada para: "${this.datos.familia}" [${this.datos.tipo.toUpperCase()}] (${this.datos.pases || 'Pase familiar'} pases)`);

        // 1. Modificar el Modal de Bienvenida inicial
        this.personalizarModalBienvenida();

        // 2. Insertar Banner de Dedicación en Sección Hero
        this.personalizarHeroSection();

        // 3. Pre-llenar y configurar límites en el formulario de confirmación (RSVP)
        this.personalizarFormularioRSVP(confirmacionView);
    }

    personalizarModalBienvenida() {
        const welcomeCard = document.querySelector(".music-prompt-card");
        if (!welcomeCard) return;

        // Insertar un elegante medallón de invitado arriba de la pregunta de música
        const divider = welcomeCard.querySelector(".music-prompt-divider");
        if (divider) {
            const esAmigo = this.datos.tipo === "amigo";
            const badge = document.createElement("div");
            badge.className = `guest-welcome-badge ${esAmigo ? 'badge-amigo' : ''}`;

            const tagHtml = esAmigo
                ? `<div class="guest-welcome-tag tag-amigo"><i class="bi bi-heart-fill me-1"></i> Invitación Especial</div>`
                : `<div class="guest-welcome-tag"><i class="bi bi-envelope-heart me-1"></i> Invitación Familiar</div>`;

            const pasesTexto = esAmigo
                ? (this.datos.pases === 1 || !this.datos.pases 
                    ? `He reservado con mucho cariño <strong>1 pase personal</strong> para ti` 
                    : `He reservado con mucho cariño <strong>${this.datos.pases} pases</strong> para ti y tus acompañantes`)
                : (this.datos.pases 
                    ? `Hemos reservado con mucho aprecio <strong>${this.datos.pases} ${this.datos.pases === 1 ? 'pase' : 'pases'}</strong> en su honor` 
                    : 'Pase familiar reservado en su honor');

            badge.innerHTML = `
                ${tagHtml}
                <h3 class="guest-welcome-name">${this.sanitizarHTML(this.datos.familia)}</h3>
                <p class="guest-welcome-passes">
                    <i class="bi bi-ticket-perforated-fill me-1"></i>
                    ${pasesTexto}
                    ${this.datos.mesa ? ` · Mesa ${this.sanitizarHTML(this.datos.mesa)}` : ''}
                </p>
            `;
            divider.insertAdjacentElement("beforebegin", badge);
        }
    }

    personalizarHeroSection() {
        const heroSection = document.getElementById("hero-section");
        if (!heroSection) return;

        const heroSubtitle = heroSection.querySelector(".hero-subtitle");
        if (heroSubtitle) {
            const esAmigo = this.datos.tipo === "amigo";
            const dedicationBanner = document.createElement("div");
            dedicationBanner.className = "hero-guest-dedication";

            const icono = esAmigo ? "🌸" : "👑";
            const etiqueta = esAmigo ? "Invitación Especial para:" : "Invitación de Gala para:";
            const conteo = esAmigo
                ? (this.datos.pases === 1 || !this.datos.pases ? "Pase Personal" : `${this.datos.pases} Pases`)
                : `${this.datos.pases || 4} ${this.datos.pases === 1 ? 'Pase' : 'Pases Familiares'}`;

            dedicationBanner.innerHTML = `
                <div class="hero-guest-pill ${esAmigo ? 'pill-amigo' : ''}">
                    <span class="hero-guest-icon">${icono}</span>
                    <span class="hero-guest-label">${etiqueta}</span>
                    <strong class="hero-guest-name">${this.sanitizarHTML(this.datos.familia)}</strong>
                    <span class="hero-guest-count ${esAmigo ? 'count-amigo' : ''}">${conteo}</span>
                </div>
            `;
            heroSubtitle.insertAdjacentElement("beforebegin", dedicationBanner);
        }
    }

    personalizarFormularioRSVP(confirmacionView) {
        if (!confirmacionView) return;

        // Establecer tipo (amigo / familia) en la vista
        if (typeof confirmacionView.setTipo === "function") {
            confirmacionView.setTipo(this.datos.tipo);
        }

        // Si se envió teléfono en el enlace, conservarlo internamente
        if (this.datos.telefono) {
            confirmacionView.telefonoAsignado = this.datos.telefono;
        }

        // Prellenar nombre
        if (confirmacionView.nombreInput) {
            confirmacionView.nombreInput.value = this.datos.familia;
            confirmacionView.nombrePersonalizado = this.datos.familia;
            confirmacionView.nombreInput.classList.add("input-personalized");
        }

        // Configurar pases
        const pasesAsignados = this.datos.pases || (this.datos.tipo === "amigo" ? 1 : 4);
        confirmacionView.numeroPases = pasesAsignados;
        confirmacionView.maxPasesPermitidos = pasesAsignados;
        confirmacionView.esCupoFijo = true;

        if (typeof confirmacionView.actualizarPasesDisplay === "function") {
            confirmacionView.actualizarPasesDisplay();
        }

        // Mensaje informativo sobre los boletos reservados
        const passesContainer = document.getElementById("passes-container");
        if (passesContainer) {
            // Eliminar notices previos si los hubiera
            const prevNotice = passesContainer.querySelector(".passes-reservation-notice");
            if (prevNotice) prevNotice.remove();

            const notice = document.createElement("div");
            notice.className = `passes-reservation-notice ${this.datos.tipo === 'amigo' ? 'notice-amigo' : ''}`;

            if (this.datos.alterado) {
                notice.style.background = "#FFF8E1";
                notice.style.borderColor = "#FFE082";
                notice.style.color = "#795548";
                notice.innerHTML = `
                    <i class="bi bi-shield-exclamation me-1" style="color: #FFA000;"></i>
                    Aviso: Se ha validado la reservación con <strong>${pasesAsignados} ${pasesAsignados === 1 ? 'pase' : 'pases'}</strong> para <strong>${this.sanitizarHTML(this.datos.familia)}</strong>. Si tu familia requiere boletos adicionales, por favor contacta a los anfitriones.
                `;
            } else if (this.datos.tipo === "amigo") {
                notice.innerHTML = `
                    <i class="bi bi-heart-fill me-1" style="color: #D6798E;"></i>
                    ¡Hola <strong>${this.sanitizarHTML(this.datos.familia)}</strong>! Se ha reservado <strong>${pasesAsignados} ${pasesAsignados === 1 ? 'pase personal' : 'lugares'}</strong> para ti. Por favor confirma tu asistencia.
                `;
            } else {
                notice.innerHTML = `
                    <i class="bi bi-info-circle-fill me-1"></i>
                    Se han reservado <strong>${pasesAsignados} ${pasesAsignados === 1 ? 'lugar' : 'lugares'}</strong> para la <strong>${this.sanitizarHTML(this.datos.familia)}</strong>. Por favor indica abajo los nombres de quienes asistirán.
                `;
            }
            passesContainer.appendChild(notice);
        }
    }

    sanitizarHTML(str) {
        const temp = document.createElement("div");
        temp.textContent = str;
        return temp.innerHTML;
    }
}

// Exportar globalmente
window.PersonalizacionService = PersonalizacionService;

