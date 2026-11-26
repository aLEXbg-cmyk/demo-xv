/**
 * ========================================================
 * MODELO: EventoModel.js (Arquitectura MVC)
 * Encapsula la información, fechas, ubicaciones y lógica de negocio
 * del evento de XV Años.
 * ========================================================
 */

class EventoModel {
    constructor() {
        this.datos = {
            quinceanera: {
                nombre: "Lizette Guadalupe",
                apellidos: "Esparza Díaz",
                titulo: "Mis XV Años",
                frase: "Hay momentos en la vida que son inolvidables, y compartirlos con las personas que más quiero los hace aún más especiales. ¡Acompáñame a celebrar mis 15 primaveras!",
                foto: "assets/quinceanera.jpg"
            },
            padres: {
                papa: "Marco Antonio Esparza Solís",
                mama: "Yolanda Díaz Soria"
            },
            padrinos: {
                padrino: "Jonathan Calvillo García",
                madrina: "Paulina Díaz Soria"
            },
            fechaEvento: new Date("2027-01-16T17:00:00"),
            fechaLimiteConfirmacion: new Date("2027-01-08T23:59:59"),
            ceremonia: {
                tipo: "Ceremonia Religiosa",
                lugar: "Parroquia del Señor de Los Milagros",
                hora: "17:00 hrs",
                direccion: "Constelaciones 401, Col. Popular Anaya, C.P. 37240 León, Gto.",
                mapsUrl: "https://maps.app.goo.gl/sz6uGPwsLEBQSrg58"
            },
            recepcion: {
                tipo: "Recepción y Fiesta",
                lugar: "Quinta San Juan",
                hora: "19:00 hrs",
                direccion: "Del Avio 113, San Jerónimo II, C.P. 37148 León, Gto.",
                mapsUrl: "https://maps.app.goo.gl/rM3Nq6uEkKoEwpLx6"
            },
            itinerario: [
                { hora: "17:00 hrs", titulo: "Misa de Acción de Gracias", descripcion: "Parroquia del Señor de Los Milagros" },
                { hora: "19:00 hrs", titulo: "Recepción & Cóctel de Bienvenida", descripcion: "Quinta San Juan" },
                { hora: "20:30 hrs", titulo: "Entrada Triunfal & Vals de Honor", descripcion: "Vals con papás y chambelanes" },
                { hora: "21:30 hrs", titulo: "Cena de Gala", descripcion: "Banquete formal en tres tiempos" },
                { hora: "22:45 hrs", titulo: "Brindis & Pastel", descripcion: "Palabras de agradecimiento" },
                { hora: "23:15 hrs", titulo: "¡Apertura de Pista & Fiesta!", descripcion: "Música, show y sorpresas toda la noche" }
            ],
            codigoVestimenta: {
                tipo: "Elegante",
                nota: "Damas: Vestido elegante · Caballeros: Traje formal."
            },
            regalos: {
                tipo: "Mesa de Regalos",
                mensaje: "Tu presencia es mi mayor alegría y el mejor obsequio. Si deseas hacerme un detalle, pongo a tu disposición nuestra mesa de regalos seleccionada con mucho cariño.",
                tienda: "Mesa de Regalos Departamental & Mesa de Obsequios en Recepción"
            },
            contactoWhatsApp: "524772067395", // Teléfono de recepción de confirmaciones (Pruebas)
            musica: {
                titulo: "Vals de las Flores & Sueño de Ensueño",
                artista: "Música Clásica en 3/4"
            }
        };
    }

    /**
     * Obtiene todos los datos del evento
     */
    getDatos() {
        return this.datos;
    }

    /**
     * Calcula la diferencia de tiempo hasta la fecha del evento
     */
    obtenerTiempoRestante() {
        const ahora = new Date().getTime();
        let destino = this.datos.fechaEvento.getTime();
        let diferencia = destino - ahora;

        // Si la fecha configurada ya pasó respecto a la fecha del sistema, proyecta automáticamente al próximo 16 de enero
        if (diferencia <= 0) {
            const d = new Date();
            const year = (d.getMonth() === 0 && d.getDate() < 16) ? d.getFullYear() : d.getFullYear() + 1;
            const proximoEnero = new Date(year, 0, 16, 17, 0, 0);
            diferencia = proximoEnero.getTime() - ahora;
        }

        if (diferencia <= 0) {
            return { dias: 0, horas: 0, minutos: 0, segundos: 0, finalizado: true };
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        return { dias, horas, minutos, segundos, finalizado: false };
    }

    /**
     * Genera la URL para agregar el evento a Google Calendar
     */
    generarGoogleCalendarUrl() {
        const titulo = encodeURIComponent(`XV Años de ${this.datos.quinceanera.nombre}`);
        const fechaInicio = "20261219T230000Z";
        const fechaFin = "20261220T080000Z";
        const detalles = encodeURIComponent(`Celebración de los XV Años de ${this.datos.quinceanera.nombre}. Ceremonia en ${this.datos.ceremonia.lugar} y Recepción en ${this.datos.recepcion.lugar}.`);
        const ubicacion = encodeURIComponent(`${this.datos.ceremonia.lugar}, ${this.datos.ceremonia.direccion}`);

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaInicio}/${fechaFin}&details=${detalles}&location=${ubicacion}`;
    }

    /**
     * Genera el archivo .ICS (iCalendar) para descargar y abrir en iPhone/Outlook/Android
     */
    descargarArchivoICS() {
        const contenido = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//XV Lizette Guadalupe//Invitacion Digital//ES",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            "UID:xv-lizette-guadalupe@quinceanera.com",
            "DTSTAMP:20261105T120000Z",
            "DTSTART:20270116T230000Z",
            "DTEND:20270117T080000Z",
            `SUMMARY:Mis XV Años - ${this.datos.quinceanera.nombre}`,
            `DESCRIPTION:Acompáñanos a celebrar los XV Años de ${this.datos.quinceanera.nombre}. Recepción en ${this.datos.recepcion.lugar}.`,
            `LOCATION:${this.datos.ceremonia.lugar}, ${this.datos.ceremonia.direccion}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([contenido], { type: "text/calendar;charset=utf-8" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = "XV_Anos_Lizette_Guadalupe.ics";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }
}

// Exportación compatible tanto con módulos ES como con inclusión directa
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventoModel;
}
