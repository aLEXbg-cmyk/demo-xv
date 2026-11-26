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
        pases = 1,
        asistencia = true,
        telefono = "",
        mensaje = "",
        menu = "Gala Tradicional",
        alergias = "Ninguna",
        cancionDj = "",
        fechaConfirmacion = null
    } = {}) {
        this.id = id || this.generarIdUnico();
        this.nombre = nombre.trim();
        this.pases = parseInt(pases, 10) || 1;
        this.asistencia = Boolean(asistencia);
        this.telefono = telefono.trim();
        this.mensaje = mensaje.trim();
        this.menu = menu;
        this.alergias = (alergias || "Ninguna").trim();
        this.cancionDj = (cancionDj || "").trim();
        this.fechaConfirmacion = fechaConfirmacion || new Date().toLocaleString("es-MX", {
            dateStyle: "medium",
            timeStyle: "short"
        });
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
            errores.push("Por favor ingresa tu nombre completo o familia (mínimo 3 caracteres).");
        }

        if (this.asistencia) {
            if (this.pases < 1 || this.pases > 10) {
                errores.push("El número de pases debe estar entre 1 y 10 personas.");
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
            return `*CONFIRMACIÓN DE ASISTENCIA · XV AÑOS DE ${nombreQuinceanera.toUpperCase()}*\n` +
                   `───────────────────────────────\n` +
                   `*Pase Familiar / Invitado:* ${this.nombre}\n` +
                   `*Respuesta:* Lamentablemente no podremos asistir.\n` +
                   (this.mensaje ? `*Dedicatoria:* "${this.mensaje}"\n` : '') +
                   `───────────────────────────────\n` +
                   `¡Muchas felicidades a ${nombreQuinceanera} y que sea una velada inolvidable!`;
        }

        let texto = `*CONFIRMACIÓN DE ASISTENCIA · XV AÑOS DE ${nombreQuinceanera.toUpperCase()}*\n` +
                    `───────────────────────────────\n` +
                    `*Pase Familiar Digital:* ${this.id}\n` +
                    `*Familia Invitada:* ${this.nombre}\n` +
                    `*Integrantes Confirmados:* ${this.pases} persona(s)\n`;

        if (this.telefono) {
            texto += `*Teléfono:* ${this.telefono}\n`;
        }

        if (this.mensaje) {
            texto += `*Mensaje para ${nombreQuinceanera}:* "${this.mensaje}"\n`;
        }

        texto += `───────────────────────────────\n` +
                 `Confirmamos con gusto nuestra asistencia para celebrar esta ocasión especial.`;

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
            pases: this.pases,
            asistencia: this.asistencia,
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
