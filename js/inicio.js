/* ==========================================================================
   ¡Qué Masa! — Página de inicio
   Arma con los datos de js/negocio-datos.js:
   - Guía de horneado (tiempos por producto, pasos, consejos y conservación).
   - Opiniones de clientes (o una invitación a dejarla si todavía no hay).
   - Publicaciones destacadas de Instagram.
   ========================================================================== */
(function () {
    'use strict';

    var NEG = window.QM_NEGOCIO || {};
    var CATEGORIAS = window.QM_CATEGORIAS || [];
    var QM = window.QM || {};
    var $ = function (id) { return document.getElementById(id); };

    function crear(etiqueta, clase, texto) {
        var n = document.createElement(etiqueta);
        if (clase) n.className = clase;
        if (texto != null) n.textContent = texto;
        return n;
    }
    function icono(clases) {
        var i = crear('i', clases);
        i.setAttribute('aria-hidden', 'true');
        return i;
    }
    function revelar(contenedor) {
        if (QM.revelar) QM.revelar(contenedor.querySelectorAll('.revelar'));
    }

    /* ---------- Guía de horneado ---------- */
    var tiempos = $('horneado-tiempos');
    if (tiempos) {
        var horneado = NEG.horneado || {};
        CATEGORIAS.forEach(function (cat) {
            var h = horneado[cat.id];
            if (!h) return;
            var tarjeta = crear('div', 'tiempo');
            var cab = crear('span', 'tiempo__producto');
            cab.appendChild(icono('fa-solid ' + cat.icono));
            cab.appendChild(document.createTextNode(' ' + cat.nombre));
            tarjeta.appendChild(cab);
            var datos = crear('div', 'tiempo__datos');
            [['fa-temperature-high', h.temperatura, 'Temperatura'], ['fa-stopwatch', h.tiempo, 'Tiempo']].forEach(function (d) {
                var dato = crear('span', 'tiempo__dato');
                dato.appendChild(icono('fa-solid ' + d[0]));
                var textos = crear('span');
                textos.appendChild(crear('small', null, d[2]));
                textos.appendChild(crear('strong', null, d[1]));
                dato.appendChild(textos);
                datos.appendChild(dato);
            });
            tarjeta.appendChild(datos);
            tiempos.appendChild(tarjeta);
        });

        var pasos = $('horneado-pasos');
        (NEG.pasosHorneado || []).forEach(function (texto) {
            pasos.appendChild(crear('li', 'horneado__paso', texto));
        });

        var consejos = $('horneado-consejos');
        (NEG.consejosHorneado || []).forEach(function (c, i) {
            var li = crear('li', 'consejo revelar');
            li.style.setProperty('--retraso', (i * 0.1) + 's');
            var ic = crear('span', 'consejo__icono');
            ic.appendChild(icono('fa-solid ' + c.icono));
            li.appendChild(ic);
            var cuerpo = crear('div');
            cuerpo.appendChild(crear('h3', null, c.titulo));
            cuerpo.appendChild(crear('p', null, c.texto));
            li.appendChild(cuerpo);
            consejos.appendChild(li);
        });
        revelar(consejos);

        // Conservación: solo se muestra lo que esté completado
        var cons = NEG.conservacion || {};
        var filas = [
            ['fa-snowflake', 'En la heladera', cons.heladera],
            ['fa-icicles', 'En el freezer', cons.freezer],
            ['fa-fire', 'Si está congelada', cons.congelada]
        ].filter(function (f) { return f[2]; });
        var cajaCons = $('horneado-conservacion');
        if (filas.length) {
            cajaCons.hidden = false;
            cajaCons.appendChild(crear('h3', 'horneado__conservacion-titulo', 'Cómo guardarla'));
            var ul = crear('ul', 'horneado__conservacion-lista');
            filas.forEach(function (f) {
                var li = crear('li');
                li.appendChild(icono('fa-solid ' + f[0]));
                var t = crear('span');
                t.appendChild(crear('strong', null, f[1] + ': '));
                t.appendChild(document.createTextNode(f[2]));
                li.appendChild(t);
                ul.appendChild(li);
            });
            cajaCons.appendChild(ul);
        }
    }

    /* ---------- Opiniones ---------- */
    var opiniones = $('opiniones-lista');
    if (opiniones) {
        var resenas = NEG.resenas || [];
        if (resenas.length) {
            resenas.forEach(function (o) {
                var fig = crear('figure', 'opinion');
                var estrellas = crear('span', 'opinion__estrellas');
                var n = Math.max(0, Math.min(5, o.estrellas || 5));
                estrellas.setAttribute('aria-label', n + ' de 5 estrellas');
                for (var i = 0; i < 5; i++) estrellas.appendChild(icono((i < n ? 'fa-solid' : 'fa-regular') + ' fa-star'));
                fig.appendChild(estrellas);
                fig.appendChild(crear('blockquote', 'opinion__texto', '“' + o.texto + '”'));
                var pie = crear('figcaption', 'opinion__autor', o.nombre + (o.origen ? ' · ' + o.origen : ''));
                fig.appendChild(pie);
                opiniones.appendChild(fig);
            });
        }
        // Invitación a dejar una opinión (siempre al final)
        var invita = crear('div', 'opinion opinion--invitacion');
        var ic = crear('span', 'opinion__icono');
        ic.appendChild(icono('fa-solid fa-comment-dots'));
        invita.appendChild(ic);
        invita.appendChild(crear('h3', null, resenas.length ? '¿Vos también la probaste?' : '¿Ya probaste ¡Qué Masa!?'));
        invita.appendChild(crear('p', null, 'Contanos qué te pareció: tu opinión nos ayuda a mejorar y a que más gente nos conozca.'));
        var acciones = crear('div', 'opinion__acciones');
        var google = crear('a', 'btn btn--rojo');
        google.href = NEG.enlaceResenas || 'https://www.google.com/maps';
        google.target = '_blank';
        google.rel = 'noopener';
        google.appendChild(icono('fa-brands fa-google'));
        google.appendChild(document.createTextNode(' Opinar en Google'));
        var wa = crear('a', 'btn btn--contorno-rojo');
        wa.href = QM.enlaceWhatsApp ? QM.enlaceWhatsApp('¡Hola, Qué Masa! Les quiero dejar mi opinión: ') : 'https://wa.me/5493816120182';
        wa.target = '_blank';
        wa.rel = 'noopener';
        wa.appendChild(icono('fa-brands fa-whatsapp'));
        wa.appendChild(document.createTextNode(' Contanos por WhatsApp'));
        acciones.appendChild(google);
        acciones.appendChild(wa);
        invita.appendChild(acciones);
        opiniones.appendChild(invita);
        opiniones.classList.toggle('opiniones--con-resenas', resenas.length > 0);
    }

    /* ---------- Instagram ---------- */
    var grilla = $('instagram-grid');
    var publicaciones = NEG.publicacionesInstagram || [];
    if (grilla && publicaciones.length) {
        grilla.hidden = false;
        publicaciones.slice(0, 6).forEach(function (pub) {
            var a = crear('a', 'instagram-caja__foto');
            a.href = pub.enlace || 'https://www.instagram.com/' + (NEG.instagram || '') + '/';
            a.target = '_blank';
            a.rel = 'noopener';
            a.setAttribute('aria-label', 'Ver publicación en Instagram');
            var img = crear('img');
            img.src = pub.imagen;
            img.alt = '';
            img.loading = 'lazy';
            img.width = 300; img.height = 300;
            a.appendChild(img);
            a.appendChild(icono('fa-brands fa-instagram'));
            grilla.appendChild(a);
        });
    }
})();
