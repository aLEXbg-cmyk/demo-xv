/**
 * ========================================================
 * VISTA: InvitacionView.js (Arquitectura MVC)
 * Gestiona los elementos visuales de la invitación: sobre de bienvenida,
 * cuenta regresiva, reproductor musical con sintetizador Web Audio,
 * efectos de partículas y animaciones.
 * ========================================================
 */

class InvitacionView {
    constructor() {
        this.envelopeScreen = document.getElementById("envelope-screen");
        this.openEnvelopeBtn = document.getElementById("open-envelope-btn");
        this.musicBtn = document.getElementById("music-toggle-btn");
        this.floatingAudioBtn = document.getElementById("floating-audio-btn");
        this.floatingAudioIcon = document.getElementById("floating-audio-icon");
        this.musicPromptModal = document.getElementById("music-prompt-modal");
        this.btnEnterWithMusic = document.getElementById("btn-enter-with-music");
        this.btnEnterSilent = document.getElementById("btn-enter-silent");
        this.audioPlayer = document.getElementById("background-audio");
        this.toastElement = document.getElementById("toast-msg");
        this.sparklesCanvas = document.getElementById("sparkles-canvas");

        // Elementos de la cuenta regresiva
        this.diasEl = document.getElementById("cd-dias");
        this.horasEl = document.getElementById("cd-horas");
        this.minutosEl = document.getElementById("cd-minutos");
        this.segundosEl = document.getElementById("cd-segundos");

        // Estado del audio
        this.audioIniciado = false;
        this.isPlaying = false;
        this.audioCtx = null;
        this.synthTimer = null;

        this.enterTimer = null;
        this.iniciarParticulasFondo();
    }

    /**
     * Efecto de sonido arpegio de arpa / campanillas doradas al romper el sello
     */
    reproducirEfectoApertura() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = this.audioCtx || new AudioContext();
            this.audioCtx = ctx;

            if (ctx.state === "suspended") {
                ctx.resume();
            }

            // Arpegio brillante en escala pentatónica de gala
            const notas = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
            const now = ctx.currentTime;

            notas.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0, now + idx * 0.08);
                gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.1);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 1.2);
            });
        } catch (e) {
            console.warn("Audio chime:", e);
        }
    }

    /**
     * Explosión de partículas doradas radiantes desde el centro del sello de cera
     */
    explotarParticulasSello(x, y) {
        if (!this.sparklesCanvas) return;
        const ctx = this.sparklesCanvas.getContext("2d");
        const burstParticles = [];
        const num = 45;

        for (let i = 0; i < num; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5.5 + 2;
            burstParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                radius: Math.random() * 3 + 1.5,
                color: Math.random() > 0.4 ? "#D6798E" : (Math.random() > 0.5 ? "#F7C8D0" : "#EAA5B2"),
                alpha: 1,
                decay: Math.random() * 0.022 + 0.015,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.25
            });
        }

        const animateBurst = () => {
            burstParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12; // Gravedad
                p.vx *= 0.96; // Fricción suave
                p.alpha -= p.decay;
                p.rotation += p.vRot;

                if (p.alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, p.alpha);
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);

                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;

                    ctx.beginPath();
                    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }
            });

            const active = burstParticles.filter(p => p.alpha > 0);
            if (active.length > 0) {
                requestAnimationFrame(animateBurst);
            }
        };

        requestAnimationFrame(animateBurst);
    }

    /**
     * Secuencia cinematográfica de apertura en 3D de alta gala:
     * 1. Rotura del sello dorado de cera con repique de campanillas y chispas
     * 2. Despliegue en 3D de la solapa superior revelando el forro de gala
     * 3. Deslizamiento suave de la carta interior emergiendo del sobre
     * 4. Revelación completa con foto de Lizette y opción de entrar
     */
    abrirSobre(callback) {
        const envelope = document.getElementById("real-envelope");
        if (!envelope || envelope.classList.contains("opening-seal") || envelope.classList.contains("open")) {
            return;
        }

        // Posición del sello para las chispas doradas
        const waxSeal = document.getElementById("envelope-wax-seal");
        if (waxSeal) {
            const rect = waxSeal.getBoundingClientRect();
            this.explotarParticulasSello(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        // Campanillas doradas de bienvenida
        this.reproducirEfectoApertura();

        // FASE 1: Romper sello dorado y repliegue de cinta
        envelope.classList.add("opening-seal");

        // FASE 2: Despliegue en 3D de la solapa superior (350ms)
        setTimeout(() => {
            envelope.classList.add("opening-flap");
        }, 350);

        // FASE 3: Deslizamiento majestuoso de la carta hacia arriba (800ms)
        setTimeout(() => {
            envelope.classList.add("letter-sliding");
            if (callback) {
                callback(); // Iniciar vals de cuerdas
            }
        }, 800);

        // FASE 4: Carta en el ápice, brillo y botón interactivo para entrar (2100ms)
        setTimeout(() => {
            envelope.classList.add("letter-revealed");
            envelope.classList.add("open");
        }, 2100);

        // FASE 5: Transición cinematográfica automática tras permitir apreciar la tarjeta (5500ms)
        this.enterTimer = setTimeout(() => {
            this.entrarInvitacion();
        }, 5500);
    }

    /**
     * Transición cinematográfica que introduce a la invitación principal
     */
    entrarInvitacion() {
        if (this.enterTimer) {
            clearTimeout(this.enterTimer);
            this.enterTimer = null;
        }

        const envelope = document.getElementById("real-envelope");
        if (envelope) {
            envelope.classList.add("entering-celebration");
        }

        if (this.envelopeScreen) {
            setTimeout(() => {
                this.envelopeScreen.classList.add("opened");
                setTimeout(() => {
                    this.envelopeScreen.style.display = "none";
                }, 900);
            }, 350);
        }
    }

    /**
     * Vuelve a mostrar el sobre para repetir la experiencia visual
     */
    reabrirSobre() {
        const envelope = document.getElementById("real-envelope");
        if (envelope) {
            envelope.className = "envelope-container";
        }
        if (this.envelopeScreen) {
            this.envelopeScreen.style.display = "flex";
            void this.envelopeScreen.offsetWidth; // Forzar reflow
            this.envelopeScreen.classList.remove("opened");
        }
        if (this.enterTimer) {
            clearTimeout(this.enterTimer);
            this.enterTimer = null;
        }
    }

    /**
     * Actualiza los números del reloj de cuenta regresiva
     */
    actualizarCuentaRegresiva(tiempo) {
        if (this.diasEl) this.diasEl.textContent = String(tiempo.dias).padStart(2, "0");
        if (this.horasEl) this.horasEl.textContent = String(tiempo.horas).padStart(2, "0");
        if (this.minutosEl) this.minutosEl.textContent = String(tiempo.minutos).padStart(2, "0");
        if (this.segundosEl) this.segundosEl.textContent = String(tiempo.segundos).padStart(2, "0");
    }

    /**
     * Muestra una notificación emergente estilizada (Toast)
     */
    mostrarToast(mensaje) {
        if (!this.toastElement) return;
        this.toastElement.textContent = mensaje;
        this.toastElement.classList.add("show");
        setTimeout(() => {
            this.toastElement.classList.remove("show");
        }, 3000);
    }

    /**
     * Gestiona el reproductor de música ambiental:
     * Si existe un archivo mp3 intenta reproducirlo; si no o ante bloqueo del navegador,
     * activa el sintetizador de vals clásico polifónico con Web Audio API.
     */
    alternarMusica() {
        if (!this.audioIniciado) {
            this.iniciarSintetizadorVals();
            this.audioIniciado = true;
            this.isPlaying = true;
            this.actualizarEstadoBotonMusica(true);
            return;
        }

        if (this.isPlaying) {
            this.detenerMusica();
        } else {
            this.reanudarMusica();
        }
    }

    cerrarModalMusica() {
        if (this.musicPromptModal) {
            this.musicPromptModal.classList.add("hidden");
            setTimeout(() => {
                if (this.musicPromptModal) {
                    this.musicPromptModal.style.display = "none";
                }
            }, 500);
        }
    }

    actualizarEstadoBotonMusica(reproduciendo) {
        this.isPlaying = reproduciendo;
        if (this.musicBtn) {
            if (reproduciendo) {
                this.musicBtn.classList.add("playing");
                this.musicBtn.setAttribute("title", "Pausar música");
            } else {
                this.musicBtn.classList.remove("playing");
                this.musicBtn.setAttribute("title", "Reproducir vals");
            }
        }
        if (this.floatingAudioBtn) {
            if (reproduciendo) {
                this.floatingAudioBtn.classList.add("playing");
                this.floatingAudioBtn.setAttribute("title", "Pausar música");
                if (this.floatingAudioIcon) {
                    this.floatingAudioIcon.className = "bi bi-volume-up";
                }
            } else {
                this.floatingAudioBtn.classList.remove("playing");
                this.floatingAudioBtn.setAttribute("title", "Reproducir música");
                if (this.floatingAudioIcon) {
                    this.floatingAudioIcon.className = "bi bi-volume-mute";
                }
            }
        }
    }

    /**
     * Sintetizador Web Audio API: Melodía de vals clásico de cuerdas y caja de música
     * 100% libre de derechos, no depende de conexión externa ni archivos caídos.
     */
    iniciarSintetizadorVals() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.audioCtx = new AudioContext();

            // Notas de un hermoso vals en 3/4 (La menor / Do Mayor / Fa Mayor)
            // Frecuencias en Hertz
            const notas = [
                // Compás 1: La menor (Bajo A3, acorde C4+E4, acorde C4+E4)
                { t: 0.0, f: 220.0, d: 0.45, v: 0.25 }, // A3
                { t: 0.5, f: 261.6, d: 0.35, v: 0.15 }, // C4
                { t: 0.5, f: 329.6, d: 0.35, v: 0.15 }, // E4
                { t: 1.0, f: 261.6, d: 0.35, v: 0.15 },
                { t: 1.0, f: 329.6, d: 0.35, v: 0.15 },
                { t: 0.0, f: 440.0, d: 0.8, v: 0.28 },  // Melodía A4
                { t: 1.0, f: 523.2, d: 0.45, v: 0.3 },  // Melodía C5

                // Compás 2: E4 / B4
                { t: 1.5, f: 164.8, d: 0.45, v: 0.25 }, // E3 bajo
                { t: 2.0, f: 293.6, d: 0.35, v: 0.15 }, // D4
                { t: 2.0, f: 392.0, d: 0.35, v: 0.15 }, // G4
                { t: 2.5, f: 293.6, d: 0.35, v: 0.15 },
                { t: 2.5, f: 392.0, d: 0.35, v: 0.15 },
                { t: 1.5, f: 493.8, d: 0.9, v: 0.28 },  // Melodía B4
                { t: 2.5, f: 440.0, d: 0.45, v: 0.25 }, // A4

                // Compás 3: Fa Mayor (F3, A4+C5)
                { t: 3.0, f: 174.6, d: 0.45, v: 0.25 }, // F3
                { t: 3.5, f: 349.2, d: 0.35, v: 0.15 }, // F4
                { t: 3.5, f: 440.0, d: 0.35, v: 0.15 }, // A4
                { t: 4.0, f: 349.2, d: 0.35, v: 0.15 },
                { t: 4.0, f: 440.0, d: 0.35, v: 0.15 },
                { t: 3.0, f: 523.2, d: 0.9, v: 0.3 },   // C5
                { t: 4.0, f: 587.3, d: 0.45, v: 0.3 },  // D5

                // Compás 4: Mi Mayor / Cierre cadencial
                { t: 4.5, f: 164.8, d: 0.45, v: 0.25 }, // E3
                { t: 5.0, f: 329.6, d: 0.35, v: 0.15 }, // E4
                { t: 5.0, f: 415.3, d: 0.35, v: 0.15 }, // G#4
                { t: 5.5, f: 329.6, d: 0.35, v: 0.15 },
                { t: 5.5, f: 415.3, d: 0.35, v: 0.15 },
                { t: 4.5, f: 659.2, d: 1.2, v: 0.32 }   // E5
            ];

            const duracionTotal = 6.0;

            const tocarCiclo = () => {
                if (!this.isPlaying || !this.audioCtx) return;
                const now = this.audioCtx.currentTime;

                notas.forEach(nota => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();

                    // Timbre cálido tipo música clásica (onda senoidal suave mezclada con triángulo)
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(nota.f, now + nota.t);

                    // Envolvente acústica (Ataque suave y decaimiento dulce como caja de música)
                    gain.gain.setValueAtTime(0.001, now + nota.t);
                    gain.gain.exponentialRampToValueAtTime(nota.v, now + nota.t + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + nota.t + nota.d);

                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);

                    osc.start(now + nota.t);
                    osc.stop(now + nota.t + nota.d + 0.1);
                });

                this.synthTimer = setTimeout(tocarCiclo, duracionTotal * 1000 - 50);
            };

            tocarCiclo();
        } catch (e) {
            console.log("Audio Web no disponible:", e);
        }
    }

    detenerMusica() {
        this.isPlaying = false;
        if (this.synthTimer) clearTimeout(this.synthTimer);
        if (this.audioCtx && this.audioCtx.state === "running") {
            this.audioCtx.suspend();
        }
        this.actualizarEstadoBotonMusica(false);
    }

    reanudarMusica() {
        this.isPlaying = true;
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
            this.iniciarSintetizadorVals();
        } else {
            this.iniciarSintetizadorVals();
        }
        this.actualizarEstadoBotonMusica(true);
    }

    /**
     * Dibuja partículas flotantes doradas en el canvas de fondo
     */
    iniciarParticulasFondo() {
        if (!this.sparklesCanvas) return;
        const ctx = this.sparklesCanvas.getContext("2d");
        let width = (this.sparklesCanvas.width = window.innerWidth);
        let height = (this.sparklesCanvas.height = window.innerHeight);

        window.addEventListener("resize", () => {
            width = this.sparklesCanvas.width = window.innerWidth;
            height = this.sparklesCanvas.height = window.innerHeight;
        });

        const numParticles = 28;
        const particles = [];

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.2 + 0.8,
                speedY: Math.random() * 0.4 + 0.15,
                speedX: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.6 + 0.2,
                alphaChange: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.y -= p.speedY;
                p.x += p.speedX;
                p.alpha += p.alphaChange;

                if (p.alpha <= 0.1 || p.alpha >= 0.8) {
                    p.alphaChange = -p.alphaChange;
                }

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(214, 121, 142, ${p.alpha})`;
                ctx.shadowColor = "rgba(247, 200, 208, 0.8)";
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.restore();
            });

            requestAnimationFrame(render);
        };

        render();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvitacionView;
}
