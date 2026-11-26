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
                nombre: "Valentina Sofía",
                apellidos: "Castillo Herrera",
                titulo: "Mis XV Años",
                frase: "Hay momentos en la vida que son inolvidables, y compartirlos con las personas que más quiero los hace aún más especiales. ¡Acompáñame a celebrar mis 15 primaveras!",
                foto: "assets/quinceanera.jpg"
            },
            padres: {
                papa: "Alejandro Castillo Morales",
                mama: "Claudia Herrera Gómez"
            },
            padrinos: {
                padrino: "Fernando Torres Delgado",
                madrina: "Mariana Castillo Morales"
            },
            fechaEvento: new Date("2026-10-17T17:00:00"),
            fechaLimiteConfirmacion: new Date("2026-10-10T23:59:59"),
            ceremonia: {
                tipo: "Ceremonia Religiosa",
                lugar: "Parroquia de San Sebastián Mártir",
                hora: "17:00 hrs",
                direccion: "Blvd. Adolfo López Mateos 1205, Zona Centro, C.P. 37000 León, Gto.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Parroquia+de+San+Sebastian+Martir+Leon+Gto"
            },
            recepcion: {
                tipo: "Recepción y Fiesta",
                lugar: "Jardín Real de Los Rosales",
                hora: "19:00 hrs",
                direccion: "Av. Paseo de los Insurgentes 1850, Jardines del Moral, C.P. 37160 León, Gto.",
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jardines+del+Moral+Leon+Gto"
            },
            itinerario: [
                { hora: "17:00 hrs", titulo: "Misa de Acción de Gracias", descripcion: "Parroquia de San Sebastián Mártir" },
                { hora: "19:00 hrs", titulo: "Recepción & Cóctel de Bienvenida", descripcion: "Jardín Real de Los Rosales" },
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
            contactoWhatsApp: "524774097517", // Teléfono de recepción de confirmaciones
            musica: {
                titulo: "Para Elisa, Beethoven",
                artista: "Ludwig van Beethoven"
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
        const destino = this.datos.fechaEvento.getTime();
        let diferencia = destino - ahora;

        // Si la fecha configurada ya pasó respecto a la fecha del sistema, proyecta automáticamente al próximo 17 de octubre
        if (diferencia <= 0) {
            const d = new Date();
            const year = (d.getMonth() < 9 || (d.getMonth() === 9 && d.getDate() < 17)) ? d.getFullYear() : d.getFullYear() + 1;
            const proximoOctubre = new Date(year, 9, 17, 17, 0, 0);
            diferencia = proximoOctubre.getTime() - ahora;
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
        const fechaInicio = "20261017T230000Z";
        const fechaFin = "20261018T080000Z";
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
            "PRODID:-//XV Valentina Sofia//Invitacion Digital//ES",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            "UID:xv-valentina-sofia@quinceanera.com",
            "DTSTAMP:20261001T120000Z",
            "DTSTART:20261017T230000Z",
            "DTEND:20261018T080000Z",
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
        enlace.download = "XV_Anos_Valentina_Sofia.ics";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }
}

// Exportación compatible tanto con módulos ES como con inclusión directa
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventoModel;
}
