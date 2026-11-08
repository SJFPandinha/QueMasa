/* ==========================================================================
   ¡Qué Masa! — Interacciones
   JavaScript sin dependencias: menú responsive, header al hacer scroll,
   enlace activo, enlaces de WhatsApp con mensaje, animaciones y lightbox.
   ========================================================================== */
(function () {
    'use strict';

    document.documentElement.classList.add('js');

    var WHATSAPP_NUMERO = '5493816120182'; // 381 612-0182 con código de país (54) y prefijo móvil (9)

    /* ---------- Enlaces de WhatsApp con mensaje precargado ---------- */
    // Cada enlace define su mensaje en data-wa; el href base funciona aun sin JS.
    function enlaceWhatsApp(mensaje) {
        return 'https://wa.me/' + WHATSAPP_NUMERO + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
    }
    document.querySelectorAll('[data-wa]').forEach(function (enlace) {
        enlace.href = enlaceWhatsApp(enlace.getAttribute('data-wa'));
    });

    /* ---------- Header: cambia de fondo al hacer scroll ---------- */
    var header = document.getElementById('header');
    function actualizarHeader() {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    actualizarHeader();
    window.addEventListener('scroll', actualizarHeader, { passive: true });

    /* ---------- Menú responsive ---------- */
    var toggle = document.querySelector('.nav__toggle');
    var menu = document.getElementById('menu-principal');
    var overlay = document.querySelector('.nav-overlay');

    function abrirMenu(abrir) {
        menu.classList.toggle('is-open', abrir);
        document.body.classList.toggle('menu-abierto', abrir);
        toggle.setAttribute('aria-expanded', String(abrir));
        toggle.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    }

    toggle.addEventListener('click', function () {
        abrirMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    overlay.addEventListener('click', function () { abrirMenu(false); });
    menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { abrirMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
            abrirMenu(false);
            toggle.focus();
        }
    });
    window.matchMedia('(min-width: 1061px)').addEventListener('change', function (mq) {
        if (mq.matches) abrirMenu(false);
    });

    /* ---------- Enlace activo según la sección visible ---------- */
    // Solo para los enlaces internos (#seccion) de la página actual.
    // Los enlaces a otra página (ej. menu.html) se marcan con aria-current="page" en el HTML.
    var enlacesNav = Array.prototype.filter.call(document.querySelectorAll('.nav__link'), function (a) {
        return a.getAttribute('href').charAt(0) === '#';
    });
    // Se observan todas las secciones: en las que no tienen enlace (galería, mayorista) no se resalta ninguno.
    var secciones = document.querySelectorAll('main section[id]');

    if (enlacesNav.length && 'IntersectionObserver' in window) {
        var observadorNav = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) return;
                var id = '#' + entrada.target.id;
                enlacesNav.forEach(function (a) {
                    var activo = a.getAttribute('href') === id;
                    a.classList.toggle('is-active', activo);
                    if (activo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        secciones.forEach(function (s) { observadorNav.observe(s); });
    }

    /* ---------- Animaciones sutiles al hacer scroll ---------- */
    var soportaIO = 'IntersectionObserver' in window;
    var observadorReveal = soportaIO ? new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('is-visible');
                obs.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

    // Respaldo: con scroll muy rápido (o saltos desde el menú) se muestra
    // todo bloque que ya llegó a la pantalla, para que nada quede oculto.
    var pendientes = [];
    function revisarPendientes() {
        var limite = window.innerHeight;
        pendientes = pendientes.filter(function (el) {
            if (el.getBoundingClientRect().top < limite) {
                el.classList.add('is-visible');
                if (observadorReveal) observadorReveal.unobserve(el);
                return false;
            }
            return true;
        });
    }
    var esperando = false;
    window.addEventListener('scroll', function () {
        if (esperando || !pendientes.length) return;
        esperando = true;
        setTimeout(function () { esperando = false; revisarPendientes(); }, 150);
    }, { passive: true });

    // Registra elementos .revelar (también los que se crean después, como las tarjetas del menú)
    function revelar(elementos) {
        Array.prototype.forEach.call(elementos, function (el) {
            if (!observadorReveal) { el.classList.add('is-visible'); return; }
            observadorReveal.observe(el);
            pendientes.push(el);
        });
    }
    revelar(document.querySelectorAll('.revelar'));

    /* ---------- Lightbox reutilizable (galería y menú) ---------- */
    // Cada imagen de la lista es { src, alt, leyenda }.
    var lightbox = (function () {
        var caja = document.getElementById('lightbox');
        if (!caja) return { abrir: function () {} };

        var lbImg = caja.querySelector('.lightbox__img');
        var lbLeyenda = caja.querySelector('.lightbox__leyenda');
        var btnCerrar = caja.querySelector('.lightbox__cerrar');
        var btnPrev = caja.querySelector('.lightbox__prev');
        var btnNext = caja.querySelector('.lightbox__next');
        var lista = [];
        var actual = 0;
        var origen = null;

        function mostrar(indice) {
            actual = (indice + lista.length) % lista.length;
            lbImg.src = lista[actual].src;
            lbImg.alt = lista[actual].alt || '';
            lbLeyenda.textContent = lista[actual].leyenda || '';
        }

        function abrir(imagenes, indice) {
            lista = imagenes;
            origen = document.activeElement;
            btnPrev.hidden = btnNext.hidden = lista.length < 2;
            mostrar(indice || 0);
            caja.hidden = false;
            requestAnimationFrame(function () { caja.classList.add('is-open'); });
            document.body.style.overflow = 'hidden';
            btnCerrar.focus();
        }

        function cerrar() {
            caja.classList.remove('is-open');
            document.body.style.overflow = '';
            setTimeout(function () { caja.hidden = true; }, 350);
            if (origen) origen.focus();
        }

        btnCerrar.addEventListener('click', cerrar);
        btnPrev.addEventListener('click', function () { mostrar(actual - 1); });
        btnNext.addEventListener('click', function () { mostrar(actual + 1); });
        caja.addEventListener('click', function (e) { if (e.target === caja) cerrar(); });
        document.addEventListener('keydown', function (e) {
            if (caja.hidden) return;
            if (e.key === 'Escape') cerrar();
            if (e.key === 'ArrowLeft' && lista.length > 1) mostrar(actual - 1);
            if (e.key === 'ArrowRight' && lista.length > 1) mostrar(actual + 1);
        });

        return { abrir: abrir };
    })();

    // Galería de la página de inicio
    var itemsGaleria = Array.prototype.slice.call(document.querySelectorAll('.galeria__item'));
    var imagenesGaleria = itemsGaleria.map(function (item) {
        var img = item.querySelector('img');
        return { src: img.currentSrc || img.src, alt: img.alt, leyenda: item.getAttribute('data-leyenda') };
    });
    itemsGaleria.forEach(function (item, i) {
        item.addEventListener('click', function () { lightbox.abrir(imagenesGaleria, i); });
    });

    /* ---------- Ficha deslizable reutilizable (tipo historias de Instagram) ---------- */
    // Estructura esperada dentro de `raiz` (.ficha): .ficha__fondo, .ficha__panel,
    // .ficha__cerrar, .ficha__media y las zonas .ficha__zona--prev / --next.
    // opciones.anterior() y opciones.siguiente() se llaman al tocar los costados,
    // deslizar la foto o usar las flechas del teclado.
    function crearHoja(raiz, opciones) {
        opciones = opciones || {};
        var panel = raiz.querySelector('.ficha__panel');
        var btnCerrar = raiz.querySelector('.ficha__cerrar');
        var media = raiz.querySelector('.ficha__media');
        var zonaPrev = raiz.querySelector('.ficha__zona--prev');
        var zonaNext = raiz.querySelector('.ficha__zona--next');
        var anterior = opciones.anterior || function () {};
        var siguiente = opciones.siguiente || function () {};
        var origenFoco = null;

        function abierta() { return !raiz.hidden; }

        function abrir() {
            if (abierta()) return;
            origenFoco = document.activeElement;
            raiz.hidden = false;
            panel.style.transform = '';
            requestAnimationFrame(function () { raiz.classList.add('is-abierta'); });
            document.body.style.overflow = 'hidden';
            btnCerrar.focus({ preventScroll: true });
            panel.scrollTop = 0;
        }

        function cerrar() {
            if (!abierta()) return;
            raiz.classList.remove('is-abierta');
            panel.style.transform = '';
            document.body.style.overflow = '';
            setTimeout(function () { raiz.hidden = true; }, 350);
            if (origenFoco && origenFoco.focus) origenFoco.focus({ preventScroll: true });
        }

        btnCerrar.addEventListener('click', cerrar);
        raiz.querySelector('.ficha__fondo').addEventListener('click', cerrar);
        if (zonaPrev) zonaPrev.addEventListener('click', anterior);
        if (zonaNext) zonaNext.addEventListener('click', siguiente);
        if (media) media.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        document.addEventListener('keydown', function (e) {
            if (!abierta()) return;
            if (e.key === 'Escape') cerrar();
            if (e.key === 'ArrowLeft') anterior();
            if (e.key === 'ArrowRight') siguiente();
        });

        // Deslizar hacia abajo cierra; deslizar la foto a los costados cambia
        var gesto = null;
        panel.addEventListener('touchstart', function (e) {
            var t = e.touches[0];
            gesto = { x: t.clientX, y: t.clientY, dy: 0, enMedia: media && media.contains(e.target), arriba: panel.scrollTop <= 0 };
        }, { passive: true });
        panel.addEventListener('touchmove', function (e) {
            if (!gesto) return;
            var t = e.touches[0];
            var dx = t.clientX - gesto.x;
            var dy = t.clientY - gesto.y;
            if (gesto.arriba && dy > 0 && Math.abs(dy) > Math.abs(dx)) {
                gesto.dy = dy;
                panel.style.transform = 'translateY(' + dy + 'px)';
            }
        }, { passive: true });
        panel.addEventListener('touchend', function (e) {
            if (!gesto) return;
            var t = e.changedTouches[0];
            var dx = t.clientX - gesto.x;
            var dy = t.clientY - gesto.y;
            if (gesto.dy > 110) {
                cerrar();
            } else {
                panel.style.transform = '';
                if (gesto.enMedia && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? siguiente : anterior)();
            }
            gesto = null;
        });

        // Muestra u oculta las zonas de navegación según la cantidad de elementos
        function navegable(si) {
            if (zonaPrev) zonaPrev.hidden = !si;
            if (zonaNext) zonaNext.hidden = !si;
        }

        return { abrir: abrir, cerrar: cerrar, abierta: abierta, navegable: navegable, panel: panel };
    }

    // Barras de progreso tipo historias: `total` barras, la `actual` resaltada
    function pintarHistorias(contenedor, total, actual) {
        contenedor.textContent = '';
        for (var i = 0; i < total; i++) {
            var barra = document.createElement('span');
            barra.className = 'historias__barra' + (i < actual ? ' is-vista' : i === actual ? ' is-actual' : '');
            contenedor.appendChild(barra);
        }
        contenedor.hidden = total < 2;
    }

    /* ---------- Pasos de "Cómo comprar" (página de inicio) ---------- */
    var hojaPasosRaiz = document.getElementById('hoja-pasos');
    var botonesPaso = Array.prototype.slice.call(document.querySelectorAll('[data-paso]'));
    if (hojaPasosRaiz && botonesPaso.length) {
        var pasoActual = 0;
        var hp = {
            img: document.getElementById('hoja-pasos-img'),
            numero: document.getElementById('hoja-pasos-numero'),
            titulo: document.getElementById('hoja-pasos-titulo'),
            texto: document.getElementById('hoja-pasos-texto'),
            progreso: document.getElementById('hoja-pasos-progreso'),
            contador: document.getElementById('hoja-pasos-contador')
        };
        var mostrarPaso = function (indice) {
            pasoActual = (indice + botonesPaso.length) % botonesPaso.length;
            var b = botonesPaso[pasoActual];
            var img = b.querySelector('img');
            hp.img.src = img.currentSrc || img.src;
            hp.img.alt = img.alt;
            hp.numero.textContent = 'Paso ' + (pasoActual + 1);
            hp.titulo.textContent = b.getAttribute('data-titulo');
            hp.texto.textContent = b.getAttribute('data-detalle');
            hp.contador.textContent = (pasoActual + 1) + ' de ' + botonesPaso.length;
            pintarHistorias(hp.progreso, botonesPaso.length, pasoActual);
        };
        var hojaPasos = crearHoja(hojaPasosRaiz, {
            anterior: function () { mostrarPaso(pasoActual - 1); },
            siguiente: function () { mostrarPaso(pasoActual + 1); }
        });
        botonesPaso.forEach(function (b, i) {
            b.addEventListener('click', function () { mostrarPaso(i); hojaPasos.abrir(); });
        });
    }

    /* ---------- Precios ---------- */
    var formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    // valor: número o null. aDefinir: true muestra "A definir" en lugar de "Consultar".
    function textoPrecio(valor, aDefinir) {
        if (typeof valor === 'number') return formatoPrecio.format(valor);
        return aDefinir ? 'A definir' : 'Consultar';
    }

    /* ---------- Utilidades compartidas con otras páginas (menu.js) ---------- */
    window.QM = {
        enlaceWhatsApp: enlaceWhatsApp,
        revelar: revelar,
        lightbox: lightbox,
        crearHoja: crearHoja,
        textoPrecio: textoPrecio,
        pintarHistorias: pintarHistorias
    };

    /* ---------- Título de la pestaña alternando en loop ---------- */
    // El <title> del HTML se mantiene para Google y para compartir el enlace;
    // en la pestaña se alterna entre estos textos de forma infinita.
    var TITULOS_PESTANA = ['¡Qué Masa!', '¡Hacé tu pedido!'];
    var INTERVALO_TITULO = 500; // milisegundos entre cada cambio (medio segundo)
    var indiceTitulo = 0;
    document.title = TITULOS_PESTANA[0];
    setInterval(function () {
        indiceTitulo = (indiceTitulo + 1) % TITULOS_PESTANA.length;
        document.title = TITULOS_PESTANA[indiceTitulo];
    }, INTERVALO_TITULO);

    /* ---------- Año actual en el footer ---------- */
    var anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
})();
