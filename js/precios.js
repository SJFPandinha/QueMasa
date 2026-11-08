/* ==========================================================================
   ¡Qué Masa! — Lista de precios por mayor y menor
   Usa los mismos datos del menú (js/menu-datos.js): precioMenor y precioMayor.
   precios.html#menor o precios.html#mayor abre la página con esa modalidad.
   ========================================================================== */
(function () {
    'use strict';

    var CATEGORIAS = window.QM_CATEGORIAS || [];
    var MENU = window.QM_MENU || [];
    var QM = window.QM || {};
    var $ = function (id) { return document.getElementById(id); };

    var el = {
        aviso: $('aviso-precios'),
        filtros: $('filtros-precios'),
        lista: $('lista-precios'),
        botonesModo: Array.prototype.slice.call(document.querySelectorAll('.modalidad')),
        consultaTitulo: $('consulta-titulo'),
        consultaTexto: $('consulta-texto'),
        consultaBoton: $('consulta-boton'),
        consultaBotonTexto: $('consulta-boton-texto')
    };
    if (!el.lista || !MENU.length) return;

    var MODOS = {
        menor: {
            columna: 'Por menor',
            titulo: '¿Es para tu casa?',
            texto: 'Escribinos por WhatsApp con las variedades que querés y te ayudamos con tu pedido.',
            boton: 'Pedir por menor',
            mensaje: '¡Hola, Qué Masa! Quiero hacer un pedido por menor.'
        },
        mayor: {
            columna: 'Por mayor',
            titulo: '¿Es para tu negocio?',
            texto: 'Consultanos por WhatsApp las condiciones de compra por mayor y te pasamos toda la información.',
            boton: 'Consultar condiciones por mayor',
            mensaje: '¡Hola, Qué Masa! Quiero consultar las condiciones y precios de compra por mayor.'
        }
    };

    var categoriasConProductos = CATEGORIAS.filter(function (cat) {
        return MENU.some(function (p) { return p.categoria === cat.id; });
    });
    var estado = { modo: 'menor', categoria: 'todas' };

    /* ---------- Utilidades ---------- */
    function crear(etiqueta, clase, texto) {
        var nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto != null) nodo.textContent = texto;
        return nodo;
    }
    function icono(clases) {
        var i = crear('i', clases);
        i.setAttribute('aria-hidden', 'true');
        return i;
    }
    function precio(valor, producto) {
        return QM.textoPrecio ? QM.textoPrecio(valor, producto.aDefinir) : (valor == null ? 'A definir' : String(valor));
    }

    // Aviso si todavía falta algún precio
    if (el.aviso && MENU.some(function (p) { return typeof p.precioMenor !== 'number' || typeof p.precioMayor !== 'number'; })) {
        el.aviso.hidden = false;
    }

    /* ---------- Modalidad (por menor / por mayor) ---------- */
    function aplicarModo() {
        var m = MODOS[estado.modo];
        el.botonesModo.forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-modo') === estado.modo));
        });
        el.lista.setAttribute('data-modo', estado.modo);
        el.consultaTitulo.textContent = m.titulo;
        el.consultaTexto.textContent = m.texto;
        el.consultaBotonTexto.textContent = m.boton;
        if (QM.enlaceWhatsApp) el.consultaBoton.href = QM.enlaceWhatsApp(m.mensaje);
    }
    el.botonesModo.forEach(function (b) {
        b.addEventListener('click', function () {
            estado.modo = b.getAttribute('data-modo');
            history.replaceState(null, '', '#' + estado.modo);
            aplicarModo();
        });
    });

    /* ---------- Filtros por categoría ---------- */
    function renderFiltros() {
        el.filtros.textContent = '';
        el.filtros.hidden = categoriasConProductos.length < 2;
        if (el.filtros.hidden) return;
        [{ id: 'todas', nombre: 'Todo', icono: 'fa-border-all' }].concat(categoriasConProductos).forEach(function (cat) {
            var b = crear('button', 'filtro');
            b.type = 'button';
            b.setAttribute('aria-pressed', String(estado.categoria === cat.id));
            b.appendChild(icono('fa-solid ' + cat.icono));
            b.appendChild(document.createTextNode(' ' + cat.nombre));
            b.addEventListener('click', function () {
                estado.categoria = cat.id;
                render();
            });
            el.filtros.appendChild(b);
        });
    }

    /* ---------- Tablas de precios ---------- */
    function renderTablas() {
        el.lista.textContent = '';
        categoriasConProductos.forEach(function (cat) {
            if (estado.categoria !== 'todas' && estado.categoria !== cat.id) return;
            var productos = MENU.filter(function (p) { return p.categoria === cat.id; });

            var grupo = crear('div', 'grupo-precios');
            var titulo = crear('h3', 'grupo-ingredientes__titulo');
            titulo.appendChild(icono('fa-solid ' + cat.icono));
            titulo.appendChild(document.createTextNode(' ' + cat.nombre));
            grupo.appendChild(titulo);

            var tabla = crear('table', 'tabla-precios');
            var caption = crear('caption', 'visualmente-oculto', 'Precios de ' + cat.nombre.toLowerCase() + ' por menor y por mayor');
            tabla.appendChild(caption);

            var thead = crear('thead');
            var filaCab = crear('tr');
            var thVar = crear('th', 'tabla-precios__variedad', 'Variedad');
            thVar.scope = 'col';
            var thMenor = crear('th', 'tabla-precios__precio col-menor', 'Por menor');
            thMenor.scope = 'col';
            var thMayor = crear('th', 'tabla-precios__precio col-mayor', 'Por mayor');
            thMayor.scope = 'col';
            filaCab.appendChild(thVar); filaCab.appendChild(thMenor); filaCab.appendChild(thMayor);
            thead.appendChild(filaCab);
            tabla.appendChild(thead);

            var tbody = crear('tbody');
            productos.forEach(function (p) {
                var tr = crear('tr');

                var thNombre = crear('th', 'tabla-precios__variedad');
                thNombre.scope = 'row';
                var enlace = crear('a', 'tabla-precios__enlace');
                enlace.href = 'menu.html#' + encodeURIComponent(p.id);
                enlace.title = 'Ver ' + p.nombre + ' en el menú';
                var img = crear('img', 'tabla-precios__img');
                img.src = p.imagen; img.alt = ''; img.loading = 'lazy'; img.width = 64; img.height = 64;
                enlace.appendChild(img);
                var textos = crear('span', 'tabla-precios__textos');
                textos.appendChild(crear('span', 'tabla-precios__nombre', p.nombre));
                textos.appendChild(crear('span', 'tabla-precios__ingredientes',
                    p.ingredientes.length ? p.ingredientes.join(' · ') : 'Ingredientes a definir'));
                enlace.appendChild(textos);
                thNombre.appendChild(enlace);
                tr.appendChild(thNombre);

                [['precioMenor', 'col-menor', 'Por menor'], ['precioMayor', 'col-mayor', 'Por mayor']].forEach(function (c) {
                    var td = crear('td', 'tabla-precios__precio ' + c[1]);
                    td.setAttribute('data-etiqueta', c[2]);
                    var valor = p[c[0]];
                    td.appendChild(crear('span', 'tabla-precios__valor' + (typeof valor === 'number' ? '' : ' is-pendiente'), precio(valor, p)));
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            tabla.appendChild(tbody);
            grupo.appendChild(tabla);
            el.lista.appendChild(grupo);
        });
    }

    function render() {
        renderFiltros();
        renderTablas();
        aplicarModo();
    }

    /* ---------- Inicio: modalidad desde el enlace (#menor / #mayor) ---------- */
    var h = location.hash.replace('#', '');
    if (MODOS[h]) estado.modo = h;
    render();
    if (MODOS[h]) {
        setTimeout(function () { document.getElementById('lista').scrollIntoView({ block: 'start' }); }, 50);
    }
    window.addEventListener('hashchange', function () {
        var n = location.hash.replace('#', '');
        if (MODOS[n]) { estado.modo = n; aplicarModo(); }
    });
})();
