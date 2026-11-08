/* ==========================================================================
   ¡Qué Masa! — Menú interactivo
   Arma la carta a partir de js/menu-datos.js:
   - Filtros por categoría y buscador.
   - Carrusel con foto grande, ingredientes y barras de progreso.
   - Ficha deslizable (tipo historias de Instagram) al mantener presionada la foto.
   - Listado de ingredientes de cada variedad.
   ========================================================================== */
(function () {
    'use strict';

    var CATEGORIAS = window.QM_CATEGORIAS || [];
    var MENU = window.QM_MENU || [];
    var QM = window.QM || { enlaceWhatsApp: function () { return 'https://wa.me/5493816120182'; }, revelar: function () {}, lightbox: { abrir: function () {} }, textoPrecio: String };

    var $ = function (id) { return document.getElementById(id); };

    // Elementos de la página
    var el = {
        aviso: $('aviso-ejemplo'),
        filtros: $('filtros'),
        buscador: $('buscador'),
        vitrina: $('vitrina'),
        foto: $('vitrina-foto'),
        prev: $('vitrina-prev'),
        next: $('vitrina-next'),
        verFicha: $('vitrina-ver-ficha'),
        mitades: $('vitrina-mitades'),
        vacio: $('carta-vacio'),
        lista: $('lista-ingredientes'),
        ficha: $('ficha')
    };
    if (!el.vitrina || !MENU.length) return;

    // Partes que se completan igual en el carrusel y en la ficha
    function partes(prefijo) {
        return {
            img: $(prefijo + '-img'),
            etiqueta: $(prefijo + '-etiqueta'),
            categoria: $(prefijo + '-categoria'),
            nombre: $(prefijo + '-nombre'),
            descripcion: $(prefijo + '-descripcion'),
            ingredientes: $(prefijo + '-ingredientes'),
            nota: $(prefijo + '-nota'),
            precio: $(prefijo + '-precio'),
            pedir: $(prefijo + '-pedir'),
            contador: $(prefijo + '-contador'),
            progreso: $(prefijo + '-progreso')
        };
    }
    var vitrina = partes('vitrina');
    var ficha = el.ficha ? partes('ficha') : null;

    var estado = { categoria: 'todas', busqueda: '', seleccionado: MENU[0].id };

    /* ---------- Utilidades ---------- */
    function normalizar(texto) {
        return String(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
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
    function categoriaDe(id) {
        for (var i = 0; i < CATEGORIAS.length; i++) if (CATEGORIAS[i].id === id) return CATEGORIAS[i];
        return { id: id, nombre: id, icono: 'fa-pizza-slice' };
    }
    function textoPrecio(producto) {
        if (typeof producto.precioMenor === 'number') return QM.textoPrecio(producto.precioMenor);
        return producto.aDefinir ? 'Precio a definir' : 'Consultar precio';
    }
    function coincide(producto) {
        if (estado.categoria !== 'todas' && producto.categoria !== estado.categoria) return false;
        if (!estado.busqueda) return true;
        var q = normalizar(estado.busqueda);
        return normalizar(producto.nombre).indexOf(q) > -1 ||
            normalizar(producto.descripcion || '').indexOf(q) > -1 ||
            producto.ingredientes.some(function (ing) { return normalizar(ing).indexOf(q) > -1; });
    }
    function filtrados() { return MENU.filter(coincide); }
    function ingredienteCoincide(ing) {
        return estado.busqueda && normalizar(ing).indexOf(normalizar(estado.busqueda)) > -1;
    }
    function actualYLista() {
        var lista = filtrados();
        var producto = lista.filter(function (p) { return p.id === estado.seleccionado; })[0] || lista[0];
        return { producto: producto, lista: lista };
    }

    /* ---------- Aviso de fotos de referencia ---------- */
    if (el.aviso && MENU.some(function (p) { return p.fotoDeEjemplo; })) el.aviso.hidden = false;

    // Categorías que tienen al menos un producto
    var categoriasConProductos = CATEGORIAS.filter(function (cat) {
        return MENU.some(function (p) { return p.categoria === cat.id; });
    });
    // Con varias categorías, la carta arranca mostrando la primera (las pizzas)
    var CATEGORIA_INICIAL = categoriasConProductos.length > 1 ? categoriasConProductos[0].id : 'todas';
    estado.categoria = CATEGORIA_INICIAL;

    /* ---------- Filtros ---------- */
    function renderFiltros() {
        el.filtros.textContent = '';
        el.filtros.hidden = categoriasConProductos.length < 2;
        if (el.filtros.hidden) return;
        var opciones = [{ id: 'todas', nombre: 'Todo el menú', icono: 'fa-border-all' }].concat(categoriasConProductos);
        opciones.forEach(function (cat) {
            var cantidad = cat.id === 'todas' ? MENU.length : MENU.filter(function (p) { return p.categoria === cat.id; }).length;
            var b = crear('button', 'filtro');
            b.type = 'button';
            b.setAttribute('aria-pressed', String(estado.categoria === cat.id));
            b.appendChild(icono('fa-solid ' + cat.icono));
            b.appendChild(document.createTextNode(' ' + cat.nombre + ' '));
            b.appendChild(crear('span', 'filtro__cantidad', String(cantidad)));
            b.addEventListener('click', function () {
                estado.categoria = cat.id;
                actualizarHash();
                render();
            });
            el.filtros.appendChild(b);
        });
        // En celulares los filtros se desplazan: se deja visible el activo
        var activo = el.filtros.querySelector('[aria-pressed="true"]');
        if (activo) el.filtros.scrollLeft = activo.offsetLeft - el.filtros.offsetLeft - 20;
    }

    /* ---------- Contenido de una variedad (carrusel o ficha) ---------- */
    function pintar(d, producto, lista) {
        var cat = categoriaDe(producto.categoria);

        d.etiqueta.hidden = !producto.etiqueta;
        d.etiqueta.textContent = producto.etiqueta || '';

        d.categoria.textContent = '';
        d.categoria.appendChild(icono('fa-solid ' + cat.icono));
        d.categoria.appendChild(document.createTextNode(' ' + cat.nombre));
        d.nombre.textContent = producto.nombre;
        d.descripcion.textContent = producto.descripcion || '';
        d.descripcion.hidden = !producto.descripcion;

        d.ingredientes.textContent = '';
        producto.ingredientes.forEach(function (ing) {
            var li = crear('li', 'ingrediente' + (ingredienteCoincide(ing) ? ' is-coincide' : ''));
            li.appendChild(icono('fa-solid fa-check'));
            li.appendChild(crear('span', null, ing));
            d.ingredientes.appendChild(li);
        });
        if (!producto.ingredientes.length) {
            var pendiente = crear('li', 'ingrediente ingrediente--pendiente');
            pendiente.appendChild(icono('fa-solid fa-hourglass-half'));
            pendiente.appendChild(crear('span', null, 'Ingredientes a definir'));
            d.ingredientes.appendChild(pendiente);
        }
        d.nota.hidden = !(producto.aDefinir && producto.ingredientes.length);

        d.precio.textContent = textoPrecio(producto);
        d.precio.classList.toggle('is-consultar', typeof producto.precioMenor !== 'number');
        d.pedir.href = QM.enlaceWhatsApp('¡Hola, Qué Masa! Quiero pedir: ' + producto.nombre + ' (' + cat.nombre + ').');

        var pos = lista.indexOf(producto);
        d.contador.textContent = (pos + 1) + ' de ' + lista.length;

        // Barras de progreso tipo historias
        if (QM.pintarHistorias) QM.pintarHistorias(d.progreso, lista.length, pos);
    }

    function cambiarFoto(img, contenedor, producto) {
        if (img.getAttribute('src') === producto.imagen) return;
        contenedor.classList.add('is-cambiando');
        var nueva = new Image();
        nueva.onload = nueva.onerror = function () {
            img.src = producto.imagen;
            img.alt = producto.nombre;
            contenedor.classList.remove('is-cambiando');
        };
        nueva.src = producto.imagen;
    }

    function mostrarEnVitrina(producto, lista) {
        cambiarFoto(vitrina.img, el.foto, producto);
        pintar(vitrina, producto, lista);
        el.prev.hidden = el.next.hidden = lista.length < 2;
        // "También mitad y mitad": solo en categorías que lo permiten
        if (el.mitades) el.mitades.hidden = !categoriaDe(producto.categoria).mitades;
    }

    // Lleva a la sección "Mitad y mitad" con este sabor ya elegido como primera mitad
    if (el.mitades) {
        el.mitades.addEventListener('click', function (e) {
            if (!QM.mitades) return;
            e.preventDefault();
            QM.mitades.elegir(estado.seleccionado);
        });
    }

    /* ---------- Listado de ingredientes por variedad ---------- */
    function renderListaIngredientes() {
        el.lista.textContent = '';
        var hayAlguno = false;

        categoriasConProductos.forEach(function (cat) {
            var productos = MENU.filter(function (p) { return p.categoria === cat.id && coincide(p); });
            if (!productos.length) return;
            hayAlguno = true;

            var grupo = crear('div', 'grupo-ingredientes revelar');
            if (categoriasConProductos.length > 1) {
                var titulo = crear('h3', 'grupo-ingredientes__titulo');
                titulo.appendChild(icono('fa-solid ' + cat.icono));
                titulo.appendChild(document.createTextNode(' ' + cat.nombre));
                grupo.appendChild(titulo);
            }

            var ul = crear('ul', 'filas-ingredientes');
            productos.forEach(function (producto) {
                var li = crear('li');
                var b = crear('button', 'fila-ingredientes');
                b.type = 'button';
                b.setAttribute('aria-label', producto.nombre + ' (' + cat.nombre + '): ver en el carrusel');

                var img = crear('img', 'fila-ingredientes__img');
                img.src = producto.imagen;
                img.alt = '';
                img.loading = 'lazy';
                img.width = 120; img.height = 120;
                b.appendChild(img);

                var cuerpo = crear('span', 'fila-ingredientes__cuerpo');
                var cabecera = crear('span', 'fila-ingredientes__cabecera');
                cabecera.appendChild(crear('span', 'fila-ingredientes__nombre', producto.nombre));
                cabecera.appendChild(crear('span', 'fila-ingredientes__precio', textoPrecio(producto)));
                cuerpo.appendChild(cabecera);

                var chips = crear('span', 'fila-ingredientes__lista');
                producto.ingredientes.forEach(function (ing) {
                    chips.appendChild(crear('span', 'chip' + (ingredienteCoincide(ing) ? ' is-coincide' : ''), ing));
                });
                if (!producto.ingredientes.length) {
                    chips.appendChild(crear('span', 'chip chip--pendiente', 'Ingredientes a definir'));
                } else if (producto.aDefinir) {
                    chips.appendChild(crear('span', 'chip chip--pendiente', 'Lista completa a confirmar'));
                }
                cuerpo.appendChild(chips);
                b.appendChild(cuerpo);
                b.appendChild(icono('fa-solid fa-eye fila-ingredientes__ver'));

                b.addEventListener('click', function () { seleccionar(producto.id, true); });
                li.appendChild(b);
                ul.appendChild(li);
            });
            grupo.appendChild(ul);
            el.lista.appendChild(grupo);
        });

        if (!hayAlguno) {
            el.lista.appendChild(crear('p', 'carta__vacio', 'No hay variedades que coincidan con la búsqueda.'));
        }
        QM.revelar(el.lista.querySelectorAll('.revelar'));
    }

    /* ---------- Render general ---------- */
    function render() {
        var a = actualYLista();
        renderFiltros();

        var hay = a.lista.length > 0;
        el.vitrina.hidden = !hay;
        el.vacio.hidden = hay;

        if (hay) {
            estado.seleccionado = a.producto.id;
            mostrarEnVitrina(a.producto, a.lista);
        }
        renderListaIngredientes();
    }

    function seleccionar(id, irAlCarrusel) {
        estado.seleccionado = id;
        var lista = filtrados();
        var producto = lista.filter(function (p) { return p.id === id; })[0];
        if (!producto) {
            // Si viene del listado y no está en el filtro actual, se muestra todo el menú
            estado.categoria = 'todas';
            actualizarHash();
            render();
        } else {
            mostrarEnVitrina(producto, lista);
            if (fichaAbierta()) pintarFicha();
        }
        if (irAlCarrusel) el.vitrina.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function mover(paso) {
        var lista = filtrados();
        if (lista.length < 2) return;
        var i = lista.map(function (p) { return p.id; }).indexOf(estado.seleccionado);
        seleccionar(lista[(i + paso + lista.length) % lista.length].id, false);
    }

    el.prev.addEventListener('click', function () { mover(-1); });
    el.next.addEventListener('click', function () { mover(1); });

    // Flechas del teclado cuando el foco está dentro del carrusel
    el.vitrina.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
    });

    /* ---------- Foto del carrusel: tocar, deslizar y mantener presionado ---------- */
    var MS_PRESION_LARGA = 450;
    var presion = null;          // { x, y, timer }
    var presionLarga = false;    // true si el último toque fue una presión larga
    var inicioDeslizar = null;   // { x, y }

    el.foto.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        presionLarga = false;
        inicioDeslizar = { x: e.clientX, y: e.clientY };
        presion = {
            x: e.clientX, y: e.clientY,
            timer: setTimeout(function () {
                presionLarga = true;
                presion = null;
                if (navigator.vibrate) navigator.vibrate(15);
                abrirFicha();
            }, MS_PRESION_LARGA)
        };
        el.foto.classList.add('is-presionando');
    });
    el.foto.addEventListener('pointermove', function (e) {
        if (presion && (Math.abs(e.clientX - presion.x) > 10 || Math.abs(e.clientY - presion.y) > 10)) cancelarPresion();
    });
    function cancelarPresion() {
        if (presion) { clearTimeout(presion.timer); presion = null; }
        el.foto.classList.remove('is-presionando');
    }
    el.foto.addEventListener('pointerup', function (e) {
        cancelarPresion();
        // Deslizar a los costados cambia de variedad
        if (!presionLarga && inicioDeslizar) {
            var dx = e.clientX - inicioDeslizar.x;
            var dy = e.clientY - inicioDeslizar.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                mover(dx < 0 ? 1 : -1);
                presionLarga = true; // evita que el gesto abra la foto ampliada
            }
        }
        inicioDeslizar = null;
    });
    el.foto.addEventListener('pointercancel', function () { cancelarPresion(); inicioDeslizar = null; });
    el.foto.addEventListener('pointerleave', cancelarPresion);
    // Evita el menú del navegador ("guardar imagen") al mantener presionado
    el.foto.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // Toque corto: foto ampliada
    el.foto.addEventListener('click', function (e) {
        if (presionLarga) { presionLarga = false; e.preventDefault(); return; }
        var lista = filtrados();
        var imagenes = lista.map(function (p) {
            return { src: p.imagen, alt: p.nombre, leyenda: p.nombre + (p.ingredientes.length ? ' — ' + p.ingredientes.join(', ') : '') };
        });
        var i = lista.map(function (p) { return p.id; }).indexOf(estado.seleccionado);
        QM.lightbox.abrir(imagenes, Math.max(i, 0));
    });

    if (el.verFicha) el.verFicha.addEventListener('click', abrirFicha);

    /* ---------- Ficha deslizable (tipo historias de Instagram) ---------- */
    // La lógica de abrir, cerrar y los gestos está en main.js (QM.crearHoja)
    var hoja = el.ficha && QM.crearHoja
        ? QM.crearHoja(el.ficha, { anterior: function () { mover(-1); }, siguiente: function () { mover(1); } })
        : null;

    function fichaAbierta() { return !!hoja && hoja.abierta(); }

    function pintarFicha() {
        var a = actualYLista();
        if (!a.producto) return;
        ficha.img.src = a.producto.imagen;
        ficha.img.alt = a.producto.nombre;
        pintar(ficha, a.producto, a.lista);
        hoja.navegable(a.lista.length > 1);
        hoja.panel.scrollTop = 0;
    }

    function abrirFicha() {
        if (!hoja || hoja.abierta()) return;
        cancelarPresion();
        pintarFicha();
        hoja.abrir();
    }

    /* ---------- Buscador ---------- */
    var temporizador;
    el.buscador.addEventListener('input', function () {
        clearTimeout(temporizador);
        temporizador = setTimeout(function () {
            estado.busqueda = el.buscador.value.trim();
            // La búsqueda recorre todas las categorías
            if (estado.busqueda) estado.categoria = 'todas';
            actualizarHash();
            render();
        }, 180);
    });

    /* ---------- Enlaces directos: menu.html#focaccias o menu.html#pizza-tomate ---------- */
    function leerHash() {
        var h = decodeURIComponent(location.hash.replace('#', ''));
        if (!h) return false;
        if (h === 'todas' || categoriasConProductos.some(function (c) { return c.id === h; })) { estado.categoria = h; return true; }
        if (MENU.some(function (p) { return p.id === h; })) { estado.seleccionado = h; estado.categoria = 'todas'; return true; }
        return false;
    }
    function actualizarHash() {
        var nuevo = estado.categoria === CATEGORIA_INICIAL
            ? location.pathname + location.search
            : '#' + estado.categoria;
        history.replaceState(null, '', nuevo);
    }

    var desdeEnlace = leerHash();
    render();
    if (desdeEnlace) {
        setTimeout(function () { document.getElementById('carta').scrollIntoView({ block: 'start' }); }, 50);
    }
    window.addEventListener('hashchange', function () { if (leerHash()) render(); });
})();
