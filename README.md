# 👑 Invitación Digital de XV Años - Valentina Sofía
### Arquitectura Modelo-Vista-Controlador (MVC) para Apache NetBeans

Una aplicación interactiva de alta gama para invitación de XV Años con confirmación de asistencia en tiempo real (RSVP), generación de pases digitales con código QR, enlace directo a WhatsApp, reproductor musical con sintetizador Web Audio y panel de control para los anfitriones.

Diseñada respetando estrictamente el patrón de diseño **Modelo-Vista-Controlador (MVC)**, compatible tanto para su visualización web inmediata en cualquier navegador como para su apertura académica y profesional en **Apache NetBeans**.

---

## 🏛️ Estructura del Proyecto (Patrón MVC)

El proyecto se divide de manera desacoplada en tres capas principales:

```
invitacion-xv-anos/
│
├── 📂 css/
│   ├── tailwind.css                   (Framework Tailwind CSS v4 compilado de alto rendimiento)
│   ├── input.css                      (Directivas @import 'tailwindcss' y tokens @theme de gala)
│   ├── bootstrap-icons.min.css        (Iconografía oficial de apoyo)
│   ├── variables.css                  (Tokens de diseño: Rose Gold, Oro Champaña)
│   └── styles.css                     (Estilos de gala, sobre 3D, física de apertura y animaciones)
│
├── 📂 js/                               <--- Implementación Web MVC (Frontend)
│   ├── 📂 models/                      <--- CAPA MODELO
│   │   ├── EventoModel.js             (Datos del evento, fechas, cálculo del countdown, calendarios)
│   │   ├── InvitadoModel.js           (Entidad Invitado, reglas de negocio, validaciones, WhatsApp)
│   │   └── ConfirmacionDAO.js         (Patrón DAO, persistencia local, métricas, exportación a Excel)
│   │
│   ├── 📂 views/                       <--- CAPA VISTA
│   │   ├── InvitacionView.js          (Sobre interactivo, countdown, música Web Audio, partículas)
│   │   ├── ConfirmacionView.js        (Formulario RSVP, selector de pases, pase digital con QR, confeti)
│   │   └── AdminView.js               (Panel de anfitriones, estadísticas en tiempo real, tabla responsiva)
│   │
│   ├── 📂 controllers/                 <--- CAPA CONTROLADOR
│   │   ├── InvitacionController.js    (Coordina eventos de la invitación, timer regresivo y calendario)
│   │   ├── ConfirmacionController.js  (Procesa formulario RSVP, invoca DAO, muestra pase y WhatsApp)
│   │   └── AdminController.js         (Autenticación, filtrado en vivo, eliminación y exportación)
│   │
│   └── app.js                         (Bootstrapper que inyecta dependencias entre M, V y C)
│
├── 📂 src/main/java/com/quinceanera/    <--- Clases Java MVC (Estructura estándar NetBeans)
│   ├── 📂 model/                      (Invitado.java, Evento.java, ConfirmacionDAO.java)
│   ├── 📂 controller/                 (ConfirmacionServlet.java, EventoController.java)
│   └── 📂 view/                       (VistaInvitacion.java)
│
├── 📂 nbproject/                       <--- Archivos de configuración nativa de Apache NetBeans
│   ├── project.xml
│   └── project.properties
│
├── 📂 css/                             <--- Sistema de diseño y variables
│   ├── variables.css                  (Paleta Rose Gold, Champagne Gold, tipografías y tokens)
│   └── styles.css                     (Diseño de alta fidelidad, animaciones, sobre interactivo)
│
├── 📂 assets/                          <--- Recursos multimedia
│   └── quinceanera.jpg                (Fotografía de gala de la quinceañera)
│
├── pom.xml                             <--- Descriptor Maven para importar en NetBeans
├── index.html                          <--- Vista principal interactiva
├── server.js                           <--- Servidor HTTP ligero en Node.js (cero dependencias)
└── package.json                        <--- Configuración de paquetes
```

---

## 🚀 Cómo Abrir y Ejecutar el Proyecto

### Opción 1: En Apache NetBeans (Recomendada para entrega de proyecto)
1. Abre **Apache NetBeans**.
2. Ve al menú superior: **File (Archivo) > Open Project (Abrir Proyecto)**.
3. Navega hasta la carpeta `C:\Users\rober\.gemini\antigravity-ide\scratch\invitacion-xv-anos`.
4. NetBeans lo detectará automáticamente con el icono de proyecto web / Maven.
5. Haz clic derecho sobre el proyecto y selecciona **Run (Ejecutar)** o presiona `F6`. NetBeans abrirá el navegador predeterminado con la invitación interactiva.

### Opción 2: Ejecución Directa en el Navegador
- Simplemente haz doble clic en el archivo [`index.html`](file:///C:/Users/rober/.gemini/antigravity-ide/scratch/invitacion-xv-anos/index.html) desde tu explorador de archivos.

### Opción 3: Servidor Local con Node.js
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm start
```
Luego abre tu navegador en `http://localhost:3000`.

---

## ✨ Características y Módulos de la Invitación

1. **Sobre Interactivo de Apertura**:
   - Experiencia de sobre real con sello de lacre dorado "XV".
   - Al hacer clic en "Abrir Invitación", se abre suavemente y reproduce de fondo un vals clásico mediante el sintetizador Web Audio API.

2. **Hero de Gala y Fotografía**:
   - Fotografía oficial enmarcada con ribete dorado de lujo y efecto de brillo.
   - Monograma de corona y tipografía de caligrafía real (`Great Vibes` y `Cinzel Decorative`).

3. **Cuenta Regresiva en Tiempo Real**:
   - Tarjetas de cristal esmerilado (Glassmorphism) que calculan en vivo los días, horas, minutos y segundos restantes para el 19 de Diciembre de 2026.

4. **Ubicaciones y Guardar Fecha**:
   - Tarjetas para la Parroquia de San Juan Bautista y Hacienda Real Los Rosales.
   - Botones directos con enlace a Google Maps.
   - Botón para agregar automáticamente a **Google Calendar** y descarga de archivo `.ics` para iPhone y Outlook.

5. **Itinerario de la Velada**:
   - Cronología interactiva con nodos dorados (Misa, Recepción, Vals de Honor, Cena de Gala, Brindis y Fiesta).

6. **Código de Vestimenta (Dress Code)**:
   - Rigurosa Etiqueta / Gala Formal, con guía de colores y aviso de cortesía sobre el color Rosa Oro reservado para la Quinceañera.

7. **Mesa de Regalos**:
   - Tradicional Lluvia de Sobres.
   - Datos bancarios con botón interactivo de **"Copiar CLABE con 1 clic"** y notificación visual.

8. **Confirmación de Asistencia (RSVP)**:
   - Formulario completo con selector numérico de pases (+ y -).
   - Alternancia de asistencia (Sí asistiré / No podré asistir).
   - Selección de tipo de menú (Gala Tradicional, Vegetariano, Infantil).
   - Validación automática de campos.
   - Al confirmar, lanza una explosión de confeti dorado y genera un **Pase Digital con código QR**.
   - Botón directo que abre **WhatsApp** con el mensaje perfectamente formateado para enviar a los papás.

9. **👑 Panel de Anfitriones (Exclusivo para los papás)**:
   - Ubicado discretamente en el pie de página.
   - Protegido con contraseña (por defecto: `xvvalentina2026`).
   - Métricas en tiempo real: Total de pases confirmados, asistentes confirmados, declinados y distribución de menús.
   - Buscador en tiempo real por nombre, folio o teléfono.
   - Botón para **Exportar a Microsoft Excel (formato CSV con codificación UTF-8)**.
