const album = {
    fotos: [
        {
            src: "IMG/fotos/foto1.jpeg",
            type: "img",
            texto: "¡Bienvenida tía! 🎂 Estos son nuestros momentos en familia :D"
        },
        {src: "IMG/fotos/foto2.jpeg", type: "img", texto: "Bueno primero tiramos flow con esta foto👌😎"},
        {src: "IMG/fotos/foto3.jpeg", type: "img", texto: "Nos reímos un poco, porque no? 😂"},
        {
            src: "IMG/fotos/foto4.jpeg",
            type: "img",
            texto: "Te queremos mucho ❤️, cada momento que compartimos juntos se vuelve increíble con tu carisma😊"
        },
        {
            src: "IMG/fotos/foto5.jpeg",
            type: "img",
            texto: "Recuerda que el verte sonreír es una de las mejores cosas que nos puede pasar 😁"
        },
        {src: "IMG/fotos/foto6.jpeg", type: "img", texto: "Y verte tan feliz es de las cosas que mas deseamos!!❤️"},
        {
            src: "IMG/fotos/foto8.jpeg",
            type: "img",
            texto: "Cada uno de los que te conoce sabe lo grandiosa persona que eres, en este día tan especial queremos agradecer, no solo que tengas un año mas de vida ,si no, el que se nos permitió tenerte a ti una mujer tan increíble que vuelve especial cada día\n" +
                "\n" +
                "Queremos desearte lo mejor, que se cumplan todas tu metas restantes, que sigas siendo esa mujer tan alegre y especial que eres\n" +
                "\n" +
                "Que tu sonrisa nos siga alegrando dia a dia\n" +
                "\n" +
                "Te queremos con todo el kokoro!! \n" +
                "\n"
        },
        {src: "IMG/fotos/foto7.jpg", type: "img", texto: "Se me acabaron las fotos!, ve a ver los videos ;)"},
    ],
    videos: [
        {
            src: "https://res.cloudinary.com/gz5rl3pa/video/upload/v1789234757/video.mp4",
            type: "video",
            texto: "Shakira vio este video y pidió clases"
        },
        {
            src: "https://res.cloudinary.com/gz5rl3pa/video/upload/v1789236304/Video5.mp4",
            type: "video",
            texto: "Momentos que no se olvidan"
        },
        /*        {
                    src: "https://res.cloudinary.com/gz5rl3pa/video/upload/v1789236315/Video6.mp4",
                    type: "video",
                    texto: "Demostrando el talento natural de cantooo🎤"
                },*/
        {
            src: "https://res.cloudinary.com/gz5rl3pa/video/upload/v1789236342/Video1.mp4",
            type: "video",
            texto: "Ni el gestor de tráfico baila así en plena vía pública "
        },
        {
            src: "https://res.cloudinary.com/gz5rl3pa/video/upload/v1789236350/Video2.mp4",
            type: "video",
            texto: "La Tenchis les dio clases particulares y se nota"
        },
    ]
};

// --- VARIABLES ---
let catActual = 'fotos';
let indiceActual = 0;
let autoplayInterval = null;
let isAutoplayActive = true;
let pauseTimeout = null;

// --- ELEMENTOS DEL DOM ---
const imgElement = document.getElementById('fotoActual');
const videoElement = document.getElementById('videoActual');
const textElement = document.getElementById('textoFoto');
const titleElement = document.getElementById('tituloCat');
const modal = document.getElementById('modalSorpresa');
const autoIndicator = document.getElementById('autoIndicator');
const musicBtn = document.getElementById('musicBtn');
const audioPlayer = document.getElementById('audioPlayer');
const soundBtn = document.getElementById('soundBtn'); // ← NUEVO

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Botones de categorías
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cargarCategoria(btn.dataset.cat);
        });
    });

    // Navegación manual
    document.getElementById('prevBtn').addEventListener('click', () => {
        cambiarMedio(-1);
        pausarAutoplayTemporal();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        cambiarMedio(1);
        pausarAutoplayTemporal();
    });

    // Sorpresa
    document.getElementById('surpriseBtn').addEventListener('click', mostrarSorpresa);
    document.getElementById('closeModal').addEventListener('click', cerrarSorpresa);
    window.addEventListener('click', (e) => {
        if (e.target === modal) cerrarSorpresa();
    });

    // Botón de música
    musicBtn.addEventListener('click', toggleMusica);

    // NUEVO: botón de sonido del video
    soundBtn.addEventListener('click', toggleSonidoVideo);

    // Cuando termine un video, pasar al siguiente automáticamente
    videoElement.addEventListener('ended', () => {
        if (isAutoplayActive) cambiarMedio(1);
    });

    // ⚠️ BUG CORREGIDO: antes decía 'inicio' pero tu album solo tiene 'fotos' y 'videos'
    cargarCategoria('fotos');
    iniciarAutoplay();
});

// --- FUNCIONES ---

function cargarCategoria(cat) {
    catActual = cat;
    indiceActual = 0;

    // Actualizar botones activos
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });

    // Actualizar título
    const nombres = {
        fotos: "✨ Recuerdos",
        videos: "🙈 Locuras"
    };
    titleElement.innerText = nombres[cat] || cat;

    mostrarMedioActual();
    reiniciarAutoplay();
}

function cambiarMedio(direccion) {
    const medios = album[catActual];
    indiceActual += direccion;

    if (indiceActual < 0) indiceActual = medios.length - 1;
    else if (indiceActual >= medios.length) indiceActual = 0;

    mostrarMedioActual();
}

function mostrarMedioActual() {
    const medio = album[catActual][indiceActual];

    // Fade-out
    imgElement.classList.remove('media-active');
    videoElement.classList.remove('media-active');

    videoElement.pause();
    videoElement.currentTime = 0;

    // Actualizar texto
    textElement.innerText = medio.texto;

    setTimeout(() => {
        if (medio.type === 'video') {
            imgElement.style.display = 'none';
            videoElement.style.display = 'block';
            videoElement.src = medio.src;
            videoElement.load();
            videoElement.classList.add('media-active');

            // NUEVO: mostrar botón de sonido
            soundBtn.style.display = 'block';

            // Intento 1: reproducir CON sonido (si el navegador lo permite)
            videoElement.muted = false;
            videoElement.play()
                .then(() => {
                    // Si logró sonar, pausamos la música de fondo
                    if (!audioPlayer.paused) {
                        audioPlayer.pause();
                        musicBtn.classList.remove('playing');
                    }
                    actualizarBotonSonido();
                })
                .catch(() => {
                    // Intento 2: el navegador bloqueó el sonido → silencio + botón visible
                    videoElement.muted = true;
                    videoElement.play().then(() => actualizarBotonSonido());
                });
        } else {
            videoElement.style.display = 'none';
            soundBtn.style.display = 'none'; // NUEVO: ocultar botón en fotos
            imgElement.style.display = 'block';
            imgElement.src = medio.src;
            imgElement.classList.add('media-active');
        }
    }, 100);
}

function iniciarAutoplay() {
    detenerAutoplay();
    isAutoplayActive = true;
    autoIndicator.innerText = "▶ Auto";
    autoIndicator.classList.remove('paused');

    autoplayInterval = setInterval(() => {
        const medioActual = album[catActual][indiceActual];
        if (medioActual.type === 'img') {
            cambiarMedio(1);
        }
    }, 5000);
}

function detenerAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

function pausarAutoplayTemporal() {
    isAutoplayActive = false;
    autoIndicator.innerText = "⏸ Pausado";
    autoIndicator.classList.add('paused');
    detenerAutoplay();

    if (pauseTimeout) clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
        iniciarAutoplay();
    }, 10000);
}

function reiniciarAutoplay() {
    if (pauseTimeout) clearTimeout(pauseTimeout);
    iniciarAutoplay();
}

// --- MÚSICA ---
function toggleMusica() {
    if (audioPlayer.paused) {
        audioPlayer.play()
            .then(() => {
                musicBtn.classList.add('playing');
            })
            .catch(e => {
                console.log("Error al reproducir audio:", e);
                alert("No se pudo reproducir el audio. Asegúrate de que el archivo existe en audio/musica.mp3");
            });
    } else {
        audioPlayer.pause();
        musicBtn.classList.remove('playing');
    }
}

// --- NUEVO: SONIDO DEL VIDEO ---
function toggleSonidoVideo() {
    videoElement.muted = !videoElement.muted;
    actualizarBotonSonido();
}

function actualizarBotonSonido() {
    if (videoElement.muted) {
        soundBtn.innerText = "🔇 Activar sonido";
        soundBtn.classList.remove('unmuted');
    } else {
        soundBtn.innerText = "🔊 Sonido activado";
        soundBtn.classList.add('unmuted');
    }
}

// --- SORPRESA ---
function mostrarSorpresa() {
    modal.style.display = 'flex';
}

function cerrarSorpresa() {
    modal.style.display = 'none';
}