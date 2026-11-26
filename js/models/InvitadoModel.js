/**
 * ========================================================
 * MODELO: InvitadoModel.js (Entidad del Invitado Profesional)
 * Representa los datos de un invitado que confirma asistencia,
 * con métodos de validación de negocio, sanitización y formateo para WhatsApp.
 * ========================================================
 */

class InvitadoModel {
    constructor({
        id = null,
        nombre = "",
        tipo = "familia", // "familia" | "amigo"
        pases = 1,
        asistencia = true,
        telefono = "",
        mensaje = "",
        menu = "Gala Tradicional",
        alergias = "Ninguna",
        cancionDj = "",
        fechaConfirmacion = null,
        asistentes = []
    } = {}) {
        this.id = id || this.generarIdUnico();
        this.nombre = (nombre || "").trim();
        this.tipo = (tipo === "amigo" || tipo === "personal") ? "amigo" : "familia";
        this.pases = parseInt(pases, 10) || 1;
        this.asistencia = Boolean(asistencia);
        this.telefono = (telefono || "").trim();
        this.mensaje = (mensaje || "").trim();
        this.menu = menu;
        this.alergias = (alergias || "Ninguna").trim();
        this.cancionDj = (cancionDj || "").trim();
        this.fechaConfirmacion = fechaConfirmacion || new Date().toLocaleString("es-MX", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        // Normalizar lista de asistentes individuales
        if (Array.isArray(asistentes)) {
            this.asistentes = asistentes.map(a => String(a || "").trim()).filter(a => a.length > 0);
        } else if (typeof asistentes === "string" && asistentes.trim()) {
            this.asistentes = asistentes.split(",").map(a => a.trim()).filter(a => a.length > 0);
        } else {
            this.asistentes = [];
        }
    }

    /**
     * Genera un código de pase único estilizado (Ej: VIP-VAL-7821)
     */
    generarIdUnico() {
        const aleatorio = Math.floor(1000 + Math.random() * 9000);
        return `VIP-LIZ-${aleatorio}`;
    }

    /**
     * Valida las reglas de negocio del invitado con estándares profesionales
     */
    validar() {
        const errores = [];

        if (!this.nombre || this.nombre.length < 3) {
            const campo = this.tipo === "amigo" ? "tu nombre completo" : "el nombre de tu familia";
            errores.push(`Por favor ingresa ${campo} (mínimo 3 caracteres).`);
        }

        if (this.asistencia) {
            if (this.pases < 1 || this.pases > 25) {
                errores.push("El número de pases debe estar entre 1 y 25 personas.");
            }

            // Validar campos de asistentes individuales cuando es familiar o más de 1 pase
            if (this.tipo === "familia" || this.pases > 1) {
                if (this.asistentes.length === 0) {
                    errores.push("Por favor escribe el nombre de quién o quiénes asistirán.");
                } else if (this.asistentes.length < this.pases) {
                    errores.push(`Por favor completa los nombres de todos los integrantes (${this.asistentes.length} de ${this.pases} ingresados).`);
                }
            }
        }

        if (this.telefono && !/^[0-9+() -]{8,18}$/.test(this.telefono)) {
            errores.push("El teléfono ingresado no tiene un formato válido (ej: 55 1234 5678).");
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    }

    /**
     * Genera el mensaje oficial con formato editorial para enviar por WhatsApp
     */
    generarTextoWhatsApp(nombreQuinceanera = "Lizette Guadalupe") {
        if (!this.asistencia) {
            if (this.tipo === "amigo") {
                return `*RESPUESTA A INVITACIÓN · XV AÑOS DE ${nombreQuinceanera.toUpperCase()}*\n` +
                    `───────────────────────────────\n` +
                    `*Invitada/o:* ${this.nombre}\n` +
                    `*Respuesta:* Lamentablemente no podré asistir.\n` +
                    (this.mensaje ? `*Dedicatoria:* "${this.mensaje}"\n` : '') +
                    `───────────────────────────────\n` +
                    `¡Te deseo una fiesta hermosa e inolvidable! 💖`;
            }

            return `*CONFIRMACIÓN DE ASISTENCIA · XV AÑOS DE ${nombreQuinceanera.toUpperCase()}*\n` +
                `───────────────────────────────\n` +
                `*Pase Familiar:* ${this.nombre}\n` +
                `*Respuesta:* Lamentablemente no podremos asistir.\n` +
                (this.mensaje ? `*Dedicatoria:* "${this.mensaje}"\n` : '') +
                `───────────────────────────────\n` +
                `¡Muchas felicidades a ${nombreQuinceanera} y que sea una velada inolvidable!`;
        }

        // Si es confirmación positiva para AMIGO / AMIGA
        if (this.tipo === "amigo") {
            let texto = `✨ *¡CONFIRMACIÓN DE ASISTENCIA! · MIS XV AÑOS* ✨\n` +
                `───────────────────────────────\n` +
                `*Amiga/o Invitada/o:* ${this.nombre}\n` +
                `*Lugar(es):* ${this.pases === 1 ? '1 Pase Personal' : `${this.pases} Pases`}\n`;

            if (this.asistentes && this.asistentes.length > 1) {
                texto += `*Asistentes:*\n` + this.asistentes.map((a, idx) => `  ${idx + 1}. ${a}`).join('\n') + '\n';
            }

            if (this.telefono) {
                texto += `*Teléfono:* ${this.telefono}\n`;
            }

            if (this.mensaje) {
                texto += `*Mensaje para ${nombreQuinceanera}:* "${this.mensaje}"\n`;
            }

            texto += `───────────────────────────────\n` +
                `¡Será un placer celebrar contigo en grande! 🥳💖`;
            return texto;
        }

        // Si es confirmación positiva para FAMILIA
        let texto = `👑 *CONFIRMACIÓN DE ASISTENCIA · XV AÑOS DE ${nombreQuinceanera.toUpperCase()}*\n` +
            `───────────────────────────────\n` +
            `*Familia Invitada:* ${this.nombre}\n` +
            `*Total Lugares Confirmados:* ${this.pases} persona(s)\n`;

        if (this.asistentes && this.asistentes.length > 0) {
            texto += `*Integrantes que asistirán:*\n` + this.asistentes.map((a, idx) => `  ${idx + 1}. ${a}`).join('\n') + '\n';
        }

        if (this.telefono) {
            texto += `*Teléfono:* ${this.telefono}\n`;
        }

        if (this.mensaje) {
            texto += `*Mensaje para ${nombreQuinceanera}:* "${this.mensaje}"\n`;
        }

        texto += `───────────────────────────────\n` +
            `Confirmamos con mucho gusto nuestra asistencia para celebrar esta ocasión especial. 🥂✨`;

        return texto;
    }

    /**
     * Retorna la URL directa de WhatsApp Web / App
     */
    generarEnlaceWhatsApp(telefonoDestino, nombreQuinceanera) {
        const texto = encodeURIComponent(this.generarTextoWhatsApp(nombreQuinceanera));
        const numeroLimpio = String(telefonoDestino).replace(/[^0-9]/g, '');
        return `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${texto}`;
    }

    /**
     * Serializa a JSON
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            tipo: this.tipo,
            pases: this.pases,
            asistencia: this.asistencia,
            asistentes: this.asistentes,
            telefono: this.telefono,
            mensaje: this.mensaje,
            menu: this.menu,
            alergias: this.alergias,
            cancionDj: this.cancionDj,
            fechaConfirmacion: this.fechaConfirmacion
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvitadoModel;
}
