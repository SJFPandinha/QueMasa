/* ==========================================================================
   ¡Qué Masa! — Armador de pedido
   El cliente suma variedades (enteras o mitad y mitad), completa sus datos
   y se arma un único mensaje de WhatsApp, ordenado y en lista vertical.
   - El pedido se guarda en el navegador: sigue ahí al cambiar de página.
   - Los precios salen de js/menu-datos.js (escalas por cantidad o precioMenor).
   - Los horarios y medios de pago salen de js/negocio-datos.js.
   Desde otras partes del sitio: QM.pedido.agregar({ producto: 'pizza-tomate' })
   o QM.pedido.agregar({ mitades: ['pizza-tomate', 'pizza-picante'] }).
   ========================================================================== */
(function () {
    'use strict';

    var CATEGORIAS = window.QM_CATEGORIAS || [];
    var MENU = window.QM_MENU || [];
    var NEG = window.QM_NEGOCIO || {};
    var QM = window.QM = window.QM || {};
    if (!MENU.length) return;

    var CLAVE = 'qm-pedido-v1';
    var EN_MENU = !!document.getElementById('vitrina');
    var EMOJI_CATEGORIA = { pizzas: '🍕', pizzetas: '🍕', focaccias: '🥖' };

    /* ---------- Guardado en el navegador (si no se puede, funciona igual) ---------- */
    function cargar() {
        try {
            var g = JSON.parse(localStorage.getItem(CLAVE));
            if (g && Array.isArray(g.items)) {
                g.items = g.items.filter(function (i) { return itemValido(i); });
                g.datos = g.datos || {};
                return g;
            }
        } catch (e) { /* sin almacenamiento */ }
        return { items: [], datos: {} };
    }
    function guardar() {
        try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (e) { /* sin almacenamiento */ }
    }

    /* ---------- Datos del menú ---------- */
    function productoDe(id) {
        for (var i = 0; i < MENU.length; i++) if (MENU[i].id === id) return MENU[i];
        return null;
    }
    function categoriaDe(id) {
        for (var i = 0; i < CATEGORIAS.length; i++) if (CATEGORIAS[i].id === id) return CATEGORIAS[i];
        return { id: id, nombre: id, icono: 'fa-pizza-slice' };
    }
    function itemValido(item) {
        if (!item || !(item.cantidad > 0)) return false;
        if (item.mitades) return item.mitades.length === 2 && !!productoDe(item.mitades[0]) && !!productoDe(item.mitades[1]);
        return !!productoDe(item.producto);
    }
    // "Pizza picante" → "Picante"
    function nombreCorto(p) {
        return p.nombre.replace(/^(pizza|pizzeta|focaccia de)\s+/i, '').replace(/^./, function (c) { return c.toUpperCase(); });
    }
    function categoriaItem(item) {
        return productoDe(item.mitades ? item.mitades[0] : item.producto).categoria;
    }
    function nombreItem(item) {
        if (item.mitades) {
            return 'Mitad y mitad: ' + nombreCorto(productoDe(item.mitades[0])) + ' / ' + nombreCorto(productoDe(item.mitades[1]));
        }
        return productoDe(item.producto).nombre;
    }

    /* ---------- Precios según cantidad ---------- */
    function escalasDe(p) {
        if (p.escalas && p.escalas.length) return p.escalas;
        var cat = categoriaDe(p.categoria);
        return cat.escalas && cat.escalas.length ? cat.escalas : null;
    }
    // Precio por unidad de una variedad, según cuántas unidades de su categoría hay en el pedido
    function precioUnidad(p, cantidadCategoria) {
        var escalas = escalasDe(p);
        if (escalas) {
            var elegida = null;
            escalas.forEach(function (e) {
                if (cantidadCategoria >= e.desde && (!elegida || e.desde >= elegida.desde)) elegida = e;
            });
            return elegida && typeof elegida.precio === 'number' ? elegida.precio : null;
        }
        return typeof p.precioMenor === 'number' ? p.precioMenor : null;
    }
    function precioItem(item, cantidadCategoria) {
        if (!item.mitades) return precioUnidad(productoDe(item.producto), cantidadCategoria);
        // Mitad y mitad: se cobra la mitad más cara
        var a = precioUnidad(productoDe(item.mitades[0]), cantidadCategoria);
        var b = precioUnidad(productoDe(item.mitades[1]), cantidadCategoria);
        return a === null || b === null ? null : Math.max(a, b);
    }
    function calcular() {
        var porCategoria = {};
        pedido.items.forEach(function (i) {
            var c = categoriaItem(i);
            porCategoria[c] = (porCategoria[c] || 0) + i.cantidad;
        });
        var unidades = 0, total = 0, faltanPrecios = false;
        var lineas = pedido.items.map(function (i) {
            var unidad = precioItem(i, porCategoria[categoriaItem(i)]);
            unidades += i.cantidad;
            if (unidad === null) faltanPrecios = true; else total += unidad * i.cantidad;
            return { item: i, unidad: unidad, subtotal: unidad === null ? null : unidad * i.cantidad };
        });
        return { lineas: lineas, unidades: unidades, total: total, faltanPrecios: faltanPrecios, porCategoria: porCategoria };
    }
    var formato = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    function plata(n) { return formato.format(n); }

    /* ---------- Estado ---------- */
    var pedido = cargar();

    function agregar(nuevo) {
        var item = {
            producto: nuevo.mitades ? null : nuevo.producto,
            mitades: nuevo.mitades || null,
            cantidad: nuevo.cantidad || 1,
            nota: nuevo.nota || ''
        };
        if (!itemValido(item)) return;
        // Si ya está la misma variedad sin aclaración, se suma la cantidad
        var igual = pedido.items.filter(function (i) {
            return !i.nota && !item.nota && i.producto === item.producto &&
                String(i.mitades) === String(item.mitades);
        })[0];
        if (igual) igual.cantidad += item.cantidad;
        else { item.uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); pedido.items.push(item); }
        guardar();
        actualizarTodo();
        avisar('Agregaste ' + nombreItem(item));
    }

    /* ---------- Utilidades de DOM ---------- */
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

    /* ---------- Botón del pedido en el header y botón flotante ---------- */
    var nav = document.querySelector('.nav');
    var botonHeader = crear('button', 'nav__pedido');
    botonHeader.type = 'button';
    botonHeader.appendChild(icono('fa-solid fa-basket-shopping'));
    var contadorHeader = crear('span', 'nav__pedido-cantidad', '0');
    contadorHeader.setAttribute('aria-hidden', 'true');
    botonHeader.appendChild(contadorHeader);
    if (nav) nav.insertBefore(botonHeader, nav.querySelector('.nav__toggle'));

    var flotante = crear('button', 'pedido-flotante');
    flotante.type = 'button';
    flotante.hidden = true;
    flotante.appendChild(icono('fa-solid fa-basket-shopping'));
    var flotanteTexto = crear('span', 'pedido-flotante__texto');
    flotante.appendChild(flotanteTexto);
    document.body.appendChild(flotante);

    /* ---------- Aviso al agregar ---------- */
    var toast = crear('div', 'toast');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    var toastTexto = crear('span', 'toast__texto');
    var toastBoton = crear('button', 'toast__boton', 'Ver pedido');
    toastBoton.type = 'button';
    toast.appendChild(icono('fa-solid fa-circle-check'));
    toast.appendChild(toastTexto);
    toast.appendChild(toastBoton);
    document.body.appendChild(toast);
    var toastTimer;
    function avisar(texto) {
        toastTexto.textContent = texto;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 3200);
    }
    toastBoton.addEventListener('click', function () { toast.classList.remove('is-visible'); abrir(); });

    /* ---------- Panel del pedido ---------- */
    var raiz = crear('div', 'pedido');
    raiz.id = 'pedido';
    raiz.hidden = true;
    raiz.setAttribute('role', 'dialog');
    raiz.setAttribute('aria-modal', 'true');
    raiz.setAttribute('aria-labelledby', 'pedido-titulo');
    raiz.innerHTML =
        '<div class="pedido__fondo"></div>' +
        '<section class="pedido__panel">' +
            '<header class="pedido__cabecera">' +
                '<div>' +
                    '<h2 class="pedido__titulo" id="pedido-titulo"><i class="fa-solid fa-basket-shopping" aria-hidden="true"></i> Tu pedido</h2>' +
                    '<span class="estado-local estado-local--chico" data-estado-local></span>' +
                '</div>' +
                '<button class="pedido__cerrar" type="button" aria-label="Cerrar el pedido"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
            '</header>' +
            '<div class="pedido__cuerpo">' +
                '<div class="pedido__vacio">' +
                    '<i class="fa-solid fa-pizza-slice" aria-hidden="true"></i>' +
                    '<p><strong>Tu pedido está vacío.</strong> Elegí tus variedades en el menú y sumalas acá.</p>' +
                    '<a class="btn btn--rojo" href="menu.html"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Ir al menú</a>' +
                '</div>' +
                '<div class="pedido__contenido">' +
                    '<ul class="pedido__items"></ul>' +
                    '<a class="pedido__seguir" href="menu.html"><i class="fa-solid fa-plus" aria-hidden="true"></i> Agregar más variedades</a>' +
                    '<div class="pedido__resumen"></div>' +
                    '<form class="pedido__form" id="pedido-form" novalidate>' +
                        '<h3 class="pedido__subtitulo">Tus datos</h3>' +
                        '<label class="campo"><span class="campo__etiqueta">Tu nombre</span>' +
                            '<input name="nombre" autocomplete="name" required maxlength="60" placeholder="Ej. Laura">' +
                            '<span class="campo__error">Contanos tu nombre.</span></label>' +
                        '<fieldset class="campo campo--opciones"><legend class="campo__etiqueta">¿Cómo lo recibís?</legend>' +
                            '<label class="opcion-radio"><input type="radio" name="entrega" value="retiro" checked>' +
                                '<span><i class="fa-solid fa-store" aria-hidden="true"></i> Retiro en el local<small></small></span></label>' +
                            '<label class="opcion-radio" data-envio><input type="radio" name="entrega" value="envio">' +
                                '<span><i class="fa-solid fa-motorcycle" aria-hidden="true"></i> Envío a domicilio<small></small></span></label>' +
                        '</fieldset>' +
                        '<label class="campo" data-direccion hidden><span class="campo__etiqueta">Dirección de entrega</span>' +
                            '<input name="direccion" autocomplete="street-address" maxlength="120" placeholder="Calle, número, barrio">' +
                            '<span class="campo__error">Necesitamos la dirección para el envío.</span></label>' +
                        '<div class="campo-doble">' +
                            '<label class="campo"><span class="campo__etiqueta">¿Para cuándo?</span><select name="dia"></select></label>' +
                            '<label class="campo" data-hora><span class="campo__etiqueta">Horario</span><select name="hora"></select></label>' +
                        '</div>' +
                        '<label class="campo" data-pago hidden><span class="campo__etiqueta">Medio de pago</span><select name="pago"></select></label>' +
                        '<label class="campo"><span class="campo__etiqueta">Aclaraciones <small>(opcional)</small></span>' +
                            '<textarea name="aclaraciones" rows="2" maxlength="300" placeholder="Ej. timbre 2B, cortada en 8, etc."></textarea></label>' +
                    '</form>' +
                '</div>' +
            '</div>' +
            '<footer class="pedido__pie">' +
                '<div class="pedido__total"><span class="pedido__total-etiqueta"></span><strong class="pedido__total-valor"></strong></div>' +
                '<button class="btn btn--rojo btn--bloque pedido__enviar" type="submit" form="pedido-form">' +
                    '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Enviar pedido por WhatsApp</button>' +
                '<p class="pedido__enviado" hidden><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' +
                    '<span>¡Listo! Se abrió WhatsApp con tu pedido. <a class="pedido__reabrir" target="_blank" rel="noopener">¿No se abrió? Tocá acá</a>.</span></p>' +
                '<button class="pedido__vaciar" type="button"><i class="fa-regular fa-trash-can" aria-hidden="true"></i> Vaciar pedido</button>' +
            '</footer>' +
        '</section>';
    document.body.appendChild(raiz);

    var $p = function (sel) { return raiz.querySelector(sel); };
    var panel = $p('.pedido__panel');
    var lista = $p('.pedido__items');
    var form = $p('#pedido-form');
    var campos = {
        nombre: form.elements.nombre,
        direccion: form.elements.direccion,
        dia: form.elements.dia,
        hora: form.elements.hora,
        pago: form.elements.pago,
        aclaraciones: form.elements.aclaraciones
    };

    // Opciones de entrega y pago según js/negocio-datos.js
    $p('.opcion-radio small').textContent = NEG.direccion ? NEG.direccion : '';
    var envios = NEG.envios || { hay: true };
    if (!envios.hay) $p('[data-envio]').hidden = true;
    else $p('[data-envio] small').textContent = envios.texto || '';
    var medios = NEG.mediosDePago || [];
    if (medios.length) {
        $p('[data-pago]').hidden = false;
        medios.forEach(function (m) { campos.pago.appendChild(new Option(m, m)); });
    }

    /* ---------- Días y horarios disponibles ---------- */
    function llenarDias() {
        var h = QM.horario;
        var anterior = campos.dia.value;
        campos.dia.textContent = '';
        if (h && h.estado().abierto) campos.dia.appendChild(new Option('Lo antes posible', 'ya'));
        var dias = h ? h.proximosDias(8) : [];
        dias.forEach(function (d) {
            if (d.horas().length) campos.dia.appendChild(new Option(d.etiqueta, d.clave));
        });
        if (!campos.dia.options.length) campos.dia.appendChild(new Option('A coordinar', 'coordinar'));
        if (anterior && campos.dia.querySelector('option[value="' + anterior + '"]')) campos.dia.value = anterior;
        llenarHoras();
    }
    function diaElegido() {
        var h = QM.horario;
        if (!h) return null;
        return h.proximosDias(8).filter(function (d) { return d.clave === campos.dia.value; })[0] || null;
    }
    function llenarHoras() {
        var anterior = campos.hora.value;
        var d = diaElegido();
        campos.hora.textContent = '';
        $p('[data-hora]').hidden = !d;
        if (!d) return;
        d.horas().forEach(function (hh) { campos.hora.appendChild(new Option(hh + ' h', hh)); });
        if (anterior && campos.hora.querySelector('option[value="' + anterior + '"]')) campos.hora.value = anterior;
    }
    campos.dia.addEventListener('change', function () { llenarHoras(); guardarDatos(); });

    /* ---------- Datos del cliente: se recuerdan para el próximo pedido ---------- */
    function entrega() { return form.elements.entrega.value || 'retiro'; }
    function guardarDatos() {
        pedido.datos = {
            nombre: campos.nombre.value.trim(),
            entrega: entrega(),
            direccion: campos.direccion.value.trim(),
            pago: campos.pago.value,
            aclaraciones: campos.aclaraciones.value
        };
        guardar();
    }
    function restaurarDatos() {
        var d = pedido.datos || {};
        campos.nombre.value = d.nombre || '';
        campos.direccion.value = d.direccion || '';
        campos.aclaraciones.value = d.aclaraciones || '';
        if (d.pago && medios.indexOf(d.pago) > -1) campos.pago.value = d.pago;
        if (d.entrega === 'envio' && envios.hay) form.querySelector('input[value="envio"]').checked = true;
        mostrarDireccion();
    }
    function mostrarDireccion() {
        $p('[data-direccion]').hidden = entrega() !== 'envio';
    }
    form.addEventListener('change', function (e) {
        if (e.target.name === 'entrega') mostrarDireccion();
        guardarDatos();
    });
    form.addEventListener('input', function (e) {
        e.target.closest('.campo') && e.target.closest('.campo').classList.remove('is-error');
        guardarDatos();
    });

    /* ---------- Lista de variedades del pedido ---------- */
    function miniatura(item) {
        var caja = crear('span', 'item-pedido__img' + (item.mitades ? ' item-pedido__img--mitades' : ''));
        (item.mitades || [item.producto]).forEach(function (id) {
            var img = crear('img');
            img.src = productoDe(id).imagen;
            img.alt = '';
            img.width = 64; img.height = 64;
            img.loading = 'lazy';
            caja.appendChild(img);
        });
        return caja;
    }

    function pintarItems(calculo) {
        lista.textContent = '';
        calculo.lineas.forEach(function (linea) {
            var item = linea.item;
            var cat = categoriaDe(categoriaItem(item));
            var li = crear('li', 'item-pedido');

            li.appendChild(miniatura(item));
            var cuerpo = crear('div', 'item-pedido__cuerpo');
            cuerpo.appendChild(crear('span', 'item-pedido__categoria', cat.nombre));
            cuerpo.appendChild(crear('span', 'item-pedido__nombre', nombreItem(item)));
            cuerpo.appendChild(crear('span', 'item-pedido__precio' + (linea.unidad === null ? ' is-pendiente' : ''),
                linea.unidad === null ? 'Precio a confirmar' : plata(linea.unidad) + ' c/u · ' + plata(linea.subtotal)));

            var nota = crear('input', 'item-pedido__nota');
            nota.type = 'text';
            nota.maxLength = 80;
            nota.value = item.nota || '';
            nota.placeholder = 'Aclaración (ej. sin aceitunas)';
            nota.setAttribute('aria-label', 'Aclaración para ' + nombreItem(item));
            nota.addEventListener('input', function () { item.nota = nota.value; guardar(); });
            cuerpo.appendChild(nota);
            li.appendChild(cuerpo);

            var controles = crear('div', 'cantidad');
            var menos = crear('button', 'cantidad__boton');
            menos.type = 'button';
            menos.setAttribute('aria-label', item.cantidad > 1 ? 'Quitar una' : 'Sacar del pedido');
            menos.appendChild(icono(item.cantidad > 1 ? 'fa-solid fa-minus' : 'fa-regular fa-trash-can'));
            var valor = crear('span', 'cantidad__valor', String(item.cantidad));
            valor.setAttribute('aria-label', item.cantidad + ' unidades');
            var mas = crear('button', 'cantidad__boton');
            mas.type = 'button';
            mas.setAttribute('aria-label', 'Sumar una');
            mas.appendChild(icono('fa-solid fa-plus'));
            menos.addEventListener('click', function () { cambiarCantidad(item, -1, li); });
            mas.addEventListener('click', function () { cambiarCantidad(item, 1, li); });
            controles.appendChild(menos);
            controles.appendChild(valor);
            controles.appendChild(mas);
            li.appendChild(controles);

            lista.appendChild(li);
        });
    }

    function cambiarCantidad(item, paso, li) {
        var indice = Array.prototype.indexOf.call(lista.children, li);
        item.cantidad += paso;
        if (item.cantidad < 1) pedido.items.splice(pedido.items.indexOf(item), 1);
        guardar();
        actualizarTodo();
        // Mantiene el foco en la misma fila (o en la siguiente si se sacó)
        var fila = lista.children[Math.min(indice, lista.children.length - 1)];
        var destino = fila ? fila.querySelectorAll('.cantidad__boton')[paso > 0 ? 1 : 0] : $p('.pedido__seguir');
        if (destino) destino.focus();
    }

    function pintarResumen(calculo) {
        var resumen = $p('.pedido__resumen');
        resumen.textContent = '';
        Object.keys(calculo.porCategoria).forEach(function (id) {
            var fila = crear('p', 'pedido__resumen-fila');
            fila.appendChild(crear('span', null, categoriaDe(id).nombre));
            fila.appendChild(crear('span', null, calculo.porCategoria[id] + (calculo.porCategoria[id] === 1 ? ' unidad' : ' unidades')));
            resumen.appendChild(fila);
        });
        if (calculo.faltanPrecios) {
            resumen.appendChild(crear('p', 'pedido__resumen-nota',
                calculo.total > 0 ? 'Algunas variedades todavía no tienen precio: te confirmamos el total por WhatsApp.'
                    : 'Los precios están a definir: te confirmamos el total por WhatsApp.'));
        }
    }

    function pintarTotal(calculo) {
        $p('.pedido__total-etiqueta').textContent = calculo.unidades + (calculo.unidades === 1 ? ' unidad' : ' unidades');
        var valor = $p('.pedido__total-valor');
        if (!calculo.faltanPrecios) valor.textContent = 'Total ' + plata(calculo.total);
        else if (calculo.total > 0) valor.textContent = plata(calculo.total) + ' + a confirmar';
        else valor.textContent = 'Total a confirmar';
    }

    function actualizarTodo() {
        var calculo = calcular();
        var hay = pedido.items.length > 0;

        contadorHeader.textContent = String(calculo.unidades);
        botonHeader.classList.toggle('tiene-items', hay);
        botonHeader.setAttribute('aria-label', hay ? 'Ver tu pedido (' + calculo.unidades + (calculo.unidades === 1 ? ' unidad)' : ' unidades)') : 'Ver tu pedido (vacío)');
        flotante.hidden = !hay;
        flotanteTexto.textContent = 'Ver pedido · ' + calculo.unidades;

        raiz.classList.toggle('is-vacio', !hay);
        $p('.pedido__enviar').hidden = !hay;
        $p('.pedido__vaciar').hidden = !hay;
        $p('.pedido__total').hidden = !hay;
        $p('.pedido__enviado').hidden = true;
        pintarItems(calculo);
        pintarResumen(calculo);
        pintarTotal(calculo);
    }

    /* ---------- Mensaje de WhatsApp ---------- */
    function armarMensaje() {
        var calculo = calcular();
        var r = ['¡Hola, Qué Masa! 👋 Quiero hacer este pedido:', ''];

        // Agrupado por categoría, en el orden del menú
        CATEGORIAS.forEach(function (cat) {
            var lineas = calculo.lineas.filter(function (l) { return categoriaItem(l.item) === cat.id; });
            if (!lineas.length) return;
            r.push((EMOJI_CATEGORIA[cat.id] || '•') + ' *' + cat.nombre.toUpperCase() + '*');
            lineas.forEach(function (l) {
                var texto = '• ' + l.item.cantidad + ' × ' + nombreItem(l.item);
                if (l.subtotal !== null) texto += ' — ' + plata(l.subtotal);
                r.push(texto);
                if (l.item.nota && l.item.nota.trim()) r.push('   ↳ ' + l.item.nota.trim());
            });
            r.push('');
        });

        r.push('🧾 *Total: ' + calculo.unidades + (calculo.unidades === 1 ? ' unidad*' : ' unidades*'));
        if (!calculo.faltanPrecios) r.push('💲 *Total estimado: ' + plata(calculo.total) + '*');
        else if (calculo.total > 0) r.push('💲 Total parcial: ' + plata(calculo.total) + ' (+ variedades a confirmar)');
        else r.push('💲 Precio: a confirmar');
        r.push('');

        var d = pedido.datos;
        r.push('👤 *Nombre:* ' + d.nombre);
        if (d.entrega === 'envio') {
            r.push('🛵 *Entrega:* Envío a domicilio');
            r.push('📍 *Dirección:* ' + d.direccion);
        } else {
            r.push('🏠 *Entrega:* Retiro en el local' + (NEG.direccion ? ' (' + NEG.direccion + ')' : ''));
        }
        var dia = campos.dia.value;
        var cuando = dia === 'ya' ? 'Lo antes posible'
            : dia === 'coordinar' ? 'A coordinar'
            : campos.dia.options[campos.dia.selectedIndex].text + (campos.hora.value ? ', ' + campos.hora.value + ' h' : '');
        r.push('🕒 *Para:* ' + cuando);
        r.push('💳 *Pago:* ' + (d.pago || 'A coordinar'));
        if (d.aclaraciones && d.aclaraciones.trim()) r.push('📝 *Aclaraciones:* ' + d.aclaraciones.trim());
        r.push('');
        r.push('¡Gracias!');
        return r.join('\n');
    }

    function validar() {
        var errores = [];
        var nombre = campos.nombre.closest('.campo');
        nombre.classList.toggle('is-error', !campos.nombre.value.trim());
        if (!campos.nombre.value.trim()) errores.push(campos.nombre);
        var dir = campos.direccion.closest('.campo');
        var faltaDir = entrega() === 'envio' && !campos.direccion.value.trim();
        dir.classList.toggle('is-error', faltaDir);
        if (faltaDir) errores.push(campos.direccion);
        return errores;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!pedido.items.length) return;
        var errores = validar();
        if (errores.length) { errores[0].focus(); return; }
        guardarDatos();
        var url = QM.enlaceWhatsApp ? QM.enlaceWhatsApp(armarMensaje())
            : 'https://wa.me/' + (NEG.whatsapp || '5493816120182') + '?text=' + encodeURIComponent(armarMensaje());
        $p('.pedido__reabrir').href = url;
        $p('.pedido__enviado').hidden = false;
        window.open(url, '_blank', 'noopener');
    });

    $p('.pedido__vaciar').addEventListener('click', function () {
        if (!window.confirm('¿Vaciar el pedido?')) return;
        pedido.items = [];
        guardar();
        actualizarTodo();
        $p('.pedido__cerrar').focus();
    });

    /* ---------- Abrir y cerrar ---------- */
    var origenFoco = null;
    function abrir() {
        if (!raiz.hidden) return;
        origenFoco = document.activeElement;
        llenarDias();
        restaurarDatos();
        if (QM.horario) QM.horario.pintar();
        actualizarTodo();
        raiz.hidden = false;
        requestAnimationFrame(function () { raiz.classList.add('is-abierto'); });
        document.body.style.overflow = 'hidden';
        $p('.pedido__cerrar').focus({ preventScroll: true });
    }
    function cerrar() {
        if (raiz.hidden) return;
        raiz.classList.remove('is-abierto');
        document.body.style.overflow = '';
        setTimeout(function () { raiz.hidden = true; }, 350);
        if (origenFoco && origenFoco.focus) origenFoco.focus({ preventScroll: true });
    }
    $p('.pedido__cerrar').addEventListener('click', cerrar);
    $p('.pedido__fondo').addEventListener('click', cerrar);
    // En el menú, "Ir al menú" / "Agregar más" solo cierran el panel
    raiz.querySelectorAll('a[href="menu.html"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            if (!EN_MENU) return;
            e.preventDefault();
            cerrar();
            var carta = document.getElementById('carta');
            if (carta) carta.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    raiz.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { cerrar(); return; }
        if (e.key !== 'Tab') return;
        // El foco no sale del panel
        var focos = Array.prototype.filter.call(panel.querySelectorAll('a[href], button, input, select, textarea'), function (n) {
            return !n.disabled && n.offsetParent !== null;
        });
        if (!focos.length) return;
        var primero = focos[0], ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });
    botonHeader.addEventListener('click', abrir);
    flotante.addEventListener('click', abrir);
    document.querySelectorAll('[data-abrir-pedido]').forEach(function (b) {
        b.addEventListener('click', function (e) { e.preventDefault(); abrir(); });
    });
    if (location.hash === '#pedido') abrir();

    // Si se cambia el pedido en otra pestaña, se actualiza acá
    window.addEventListener('storage', function (e) {
        if (e.key !== CLAVE) return;
        pedido = cargar();
        actualizarTodo();
    });

    QM.pedido = { agregar: agregar, abrir: abrir, cerrar: cerrar, nombreCorto: nombreCorto };
    actualizarTodo();
})();
