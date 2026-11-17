/* ==========================================================================
   ¡Qué Masa! — Interacciones
   JavaScript sin dependencias: menú responsive, header al hacer scroll,
   enlace activo, enlaces de WhatsApp con mensaje, animaciones y lightbox.
   ========================================================================== */
(function () {
    'use strict';

    document.documentElement.classList.add('js');

    var NEGOCIO = window.QM_NEGOCIO || {};
    var WHATSAPP_NUMERO = NEGOCIO.whatsapp || '5493816120182'; // 381 612-0182 con código de país (54) y prefijo móvil (9)

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

    /* ---------- Horarios y "Abierto ahora / Cerrado" ---------- */
    // Los horarios están en js/negocio-datos.js. Siempre se calcula con la hora de Tucumán,
    // aunque quien mire la página esté en otro huso horario.
    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var horario = (function () {
        var franjasPorDia = NEGOCIO.horarios || {};
        var zona = NEGOCIO.zonaHoraria || 'America/Argentina/Tucuman';
        var lector;
        try {
            lector = new Intl.DateTimeFormat('en-US', {
                timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
            });
        } catch (e) { lector = null; }

        function minutos(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
        function hhmm(min) { return ('0' + Math.floor(min / 60)).slice(-2) + ':' + ('0' + min % 60).slice(-2); }
        // "10:00" → "10", "19:30" → "19:30"
        function horaCorta(texto) { return texto.slice(-2) === '00' ? String(+texto.slice(0, 2)) : texto; }
        function franjas(dia) { return franjasPorDia[dia] || []; }

        // Fecha y hora actuales en Tucumán
        function ahora() {
            var d = new Date();
            if (!lector) return { fecha: Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), minutos: d.getHours() * 60 + d.getMinutes() };
            var p = {};
            lector.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
            return { fecha: Date.UTC(+p.year, +p.month - 1, +p.day), minutos: +p.hour * 60 + +p.minute };
        }

        function estado() {
            var a = ahora();
            var hoy = new Date(a.fecha).getUTCDay();
            var abierta = franjas(hoy).filter(function (f) { return a.minutos >= minutos(f[0]) && a.minutos < minutos(f[1]); })[0];
            if (abierta) return { abierto: true, texto: 'Abierto ahora · hasta las ' + horaCorta(abierta[1]) + ' h' };
            for (var i = 0; i < 8; i++) {
                var dia = (hoy + i) % 7;
                var proxima = franjas(dia).filter(function (f) { return i > 0 || minutos(f[0]) > a.minutos; })[0];
                if (proxima) {
                    var cuando = i === 0 ? 'hoy' : i === 1 ? 'mañana' : 'el ' + DIAS[dia];
                    return { abierto: false, texto: 'Cerrado · abrimos ' + cuando + ' a las ' + horaCorta(proxima[0]) + ' h' };
                }
            }
            return { abierto: false, texto: 'Cerrado' };
        }

        // Próximos días con su lista de horarios para pedir (cada 30 min)
        function proximosDias(cantidad) {
            var a = ahora();
            var lista = [];
            for (var i = 0; i < cantidad; i++) {
                var fecha = new Date(a.fecha + i * 864e5);
                var dia = fecha.getUTCDay();
                var nombre = DIAS[dia].charAt(0).toUpperCase() + DIAS[dia].slice(1);
                var dm = fecha.getUTCDate() + '/' + (fecha.getUTCMonth() + 1);
                lista.push({
                    clave: fecha.toISOString().slice(0, 10),
                    etiqueta: (i === 0 ? 'Hoy, ' + DIAS[dia] : i === 1 ? 'Mañana, ' + DIAS[dia] : nombre) + ' ' + dm,
                    horas: (function (dia, esHoy) {
                        return function () {
                            var horas = [];
                            franjas(dia).forEach(function (f) {
                                // Hoy: desde dentro de 30 minutos en adelante
                                var desde = Math.max(minutos(f[0]), esHoy ? Math.ceil((a.minutos + 30) / 30) * 30 : 0);
                                for (var m = desde; m <= minutos(f[1]) - 30; m += 30) horas.push(hhmm(m));
                            });
                            return horas;
                        };
                    })(dia, i === 0)
                });
            }
            return lista;
        }

        // "Jueves a domingo · 10 a 23 h"
        function resumen() {
            var orden = [1, 2, 3, 4, 5, 6, 0];
            var grupos = [];
            orden.forEach(function (dia, i) {
                var clave = franjas(dia).map(function (f) { return horaCorta(f[0]) + ' a ' + horaCorta(f[1]); }).join(' y ');
                var ultimo = grupos[grupos.length - 1];
                if (ultimo && ultimo.clave === clave && ultimo.hasta === i - 1) { ultimo.hasta = i; ultimo.diaHasta = dia; }
                else grupos.push({ clave: clave, desde: i, hasta: i, diaDesde: dia, diaHasta: dia });
            });
            return grupos.filter(function (g) { return g.clave; }).map(function (g) {
                var dias = g.desde === g.hasta ? DIAS[g.diaDesde] : DIAS[g.diaDesde] + ' a ' + DIAS[g.diaHasta];
                return dias.charAt(0).toUpperCase() + dias.slice(1) + ' · ' + g.clave + ' h';
            });
        }

        // Completa todos los [data-estado-local] y [data-horarios] de la página
        function pintar() {
            var e = estado();
            document.querySelectorAll('[data-estado-local]').forEach(function (n) {
                n.textContent = e.texto;
                n.classList.toggle('is-abierto', e.abierto);
                n.classList.toggle('is-cerrado', !e.abierto);
            });
            var lineas = resumen();
            document.querySelectorAll('[data-horarios]').forEach(function (n) {
                n.textContent = lineas.length ? lineas.join(' — ') : 'Consultanos por WhatsApp';
            });
        }

        return { estado: estado, proximosDias: proximosDias, resumen: resumen, pintar: pintar };
    })();
    window.QM.horario = horario;
    horario.pintar();
    setInterval(horario.pintar, 60000);

    /* ---------- Promociones (js/negocio-datos.js) ---------- */
    // Se muestran en los contenedores [data-promos] mientras estén activas y dentro de sus fechas.
    var hoyISO = new Date().toISOString().slice(0, 10);
    var promosActivas = (NEGOCIO.promos || []).filter(function (p) {
        return p.activa && (!p.desde || p.desde <= hoyISO) && (!p.hasta || p.hasta >= hoyISO);
    });
    document.querySelectorAll('[data-promos]').forEach(function (contenedor) {
        contenedor.hidden = !promosActivas.length;
        promosActivas.forEach(function (p) {
            var tarjeta = document.createElement('div');
            tarjeta.className = 'promo';
            var etiqueta = document.createElement('span');
            etiqueta.className = 'promo__etiqueta';
            etiqueta.textContent = p.etiqueta || 'Promo';
            var textos = document.createElement('div');
            textos.className = 'promo__textos';
            var titulo = document.createElement('strong');
            titulo.className = 'promo__titulo';
            titulo.textContent = p.titulo;
            var texto = document.createElement('span');
            texto.textContent = p.texto || '';
            textos.appendChild(titulo);
            textos.appendChild(texto);
            var boton = document.createElement('a');
            boton.className = 'btn btn--amarillo promo__boton';
            boton.href = enlaceWhatsApp('¡Hola, Qué Masa! Quiero la promo "' + p.titulo + '".');
            boton.target = '_blank';
            boton.rel = 'noopener';
            boton.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> La quiero';
            tarjeta.appendChild(etiqueta);
            tarjeta.appendChild(textos);
            tarjeta.appendChild(boton);
            contenedor.appendChild(tarjeta);
        });
    });

    /* ---------- Título de la pestaña ---------- */
    // Mientras la pestaña está a la vista se ve el título normal (bueno para Google);
    // si el cliente se va a otra pestaña, lo invita a volver.
    var tituloOriginal = document.title;
    document.addEventListener('visibilitychange', function () {
        document.title = document.hidden ? '🍕 ¡Volvé, tu pizza te espera!' : tituloOriginal;
    });

    /* ---------- Estadísticas de visitas (Vercel Web Analytics, sin cookies) ---------- */
    // Solo en el sitio publicado; se activa desde el panel de Vercel (Analytics → Enable).
    if (/\.vercel\.app$/.test(location.hostname) || NEGOCIO.dominio === location.hostname) {
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        var analytics = document.createElement('script');
        analytics.defer = true;
        analytics.src = '/_vercel/insights/script.js';
        document.head.appendChild(analytics);
    }

    /* ---------- Año actual en el footer ---------- */
    var anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
})();
