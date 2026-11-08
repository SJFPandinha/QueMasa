/* ==========================================================================
   ¡Qué Masa! — Pizza mitad y mitad
   Dos sabores en una misma prepizza. Usa las variedades de js/menu-datos.js
   de las categorías con "mitades: true".
   menu.html#mitad-y-mitad lleva directo a esta sección.
   ========================================================================== */
(function () {
    'use strict';

    var CATEGORIAS = window.QM_CATEGORIAS || [];
    var MENU = window.QM_MENU || [];
    var QM = window.QM || {};
    var $ = function (id) { return document.getElementById(id); };

    var seccion = $('mitad-y-mitad');
    if (!seccion) return;

    var categorias = CATEGORIAS.filter(function (c) { return c.mitades; });
    var sabores = MENU.filter(function (p) {
        return categorias.some(function (c) { return c.id === p.categoria; });
    });
    // Hacen falta al menos dos sabores para combinar
    if (sabores.length < 2) return;
    seccion.hidden = false;

    var el = {
        select1: $('mitades-sabor-1'),
        select2: $('mitades-sabor-2'),
        img1: $('mitades-img-1'),
        img2: $('mitades-img-2'),
        visual1: $('mitades-visual-1'),
        visual2: $('mitades-visual-2'),
        resumen: $('mitades-resumen'),
        pedir: $('mitades-pedir'),
        nota: $('mitades-nota')
    };

    function porId(id) {
        for (var i = 0; i < sabores.length; i++) if (sabores[i].id === id) return sabores[i];
        return null;
    }
    // "Pizza picante" → "Picante" para que el mensaje se lea natural
    function nombreCorto(p) {
        return p.nombre.replace(/^(pizza|pizzeta)\s+/i, '').replace(/^./, function (c) { return c.toUpperCase(); });
    }
    function nombreCategoria() {
        return categorias.length === 1 ? categorias[0].nombre.toLowerCase().replace(/s(\s|$)/g, '$1').trim() : 'pizza';
    }

    // Opciones de los dos selectores (agrupadas si hay más de una categoría)
    function llenar(select) {
        categorias.forEach(function (cat) {
            var destino = select;
            if (categorias.length > 1) {
                destino = document.createElement('optgroup');
                destino.label = cat.nombre;
                select.appendChild(destino);
            }
            sabores.forEach(function (p) {
                if (p.categoria !== cat.id) return;
                var o = document.createElement('option');
                o.value = p.id;
                o.textContent = nombreCorto(p);
                destino.appendChild(o);
            });
        });
    }
    llenar(el.select1);
    llenar(el.select2);
    el.select1.value = sabores[0].id;
    el.select2.value = sabores[1].id;

    // Nota de precio: el precio de la mitad y mitad se consulta por WhatsApp
    el.nota.querySelector('span').textContent = sabores.some(function (p) { return p.aDefinir; })
        ? 'Precios a definir: consultanos por WhatsApp.'
        : 'Consultanos el precio por WhatsApp.';

    function actualizar() {
        var a = porId(el.select1.value);
        var b = porId(el.select2.value);

        // No se puede elegir el mismo sabor en las dos mitades
        Array.prototype.forEach.call(el.select1.options, function (o) { o.disabled = o.value === b.id; });
        Array.prototype.forEach.call(el.select2.options, function (o) { o.disabled = o.value === a.id; });

        el.img1.src = a.imagen;
        el.img2.src = b.imagen;
        el.visual1.textContent = nombreCorto(a);
        el.visual2.textContent = nombreCorto(b);
        el.resumen.textContent = 'Tu ' + nombreCategoria() + ': mitad ' + nombreCorto(a).toLowerCase() +
            ' y mitad ' + nombreCorto(b).toLowerCase() + '.';

        var mensaje = '¡Hola, Qué Masa! Quiero una ' + nombreCategoria() + ' mitad y mitad: mitad ' +
            nombreCorto(a).toLowerCase() + ' y mitad ' + nombreCorto(b).toLowerCase() + '.';
        el.pedir.href = QM.enlaceWhatsApp ? QM.enlaceWhatsApp(mensaje)
            : 'https://wa.me/5493816120182?text=' + encodeURIComponent(mensaje);
    }

    el.select1.addEventListener('change', actualizar);
    el.select2.addEventListener('change', actualizar);
    actualizar();

    // Desde el carrusel: ese sabor pasa a ser la primera mitad
    function elegir(id) {
        var p = porId(id);
        if (p) {
            if (el.select2.value === p.id) el.select2.value = el.select1.value !== p.id ? el.select1.value : sabores[p === sabores[0] ? 1 : 0].id;
            el.select1.value = p.id;
            actualizar();
        }
        seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { el.select2.focus({ preventScroll: true }); }, 600);
    }

    QM.mitades = { elegir: elegir };

    if (location.hash === '#mitad-y-mitad') {
        setTimeout(function () { seccion.scrollIntoView({ block: 'start' }); }, 80);
    }
})();
