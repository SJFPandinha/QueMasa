/* ==========================================================================
   ¡Qué Masa! — Datos del negocio
   --------------------------------------------------------------------------
   Horarios, guía de horneado, medios de pago, envíos, promociones,
   opiniones e Instagram. Todo lo que se muestra en el sitio sale de acá.
   (El menú y los precios están en js/menu-datos.js)
   ========================================================================== */
window.QM_NEGOCIO = {
    nombre: '¡Qué Masa!',
    whatsapp: '5493816120182',
    telefonoVisible: '381 612-0182',
    direccion: 'Alsina 948',
    ciudad: 'San Miguel de Tucumán',
    instagram: 'quemasa.takeawayy',

    /* ---------- Horarios ----------
       Día de la semana: 0 = domingo, 1 = lunes … 6 = sábado.
       Cada día lleva una lista de franjas ['desde', 'hasta'] (formato 24 h).
       Un día sin franjas (o que no está) = cerrado. */
    zonaHoraria: 'America/Argentina/Tucuman',
    horarios: {
        4: [['10:00', '23:00']], // jueves
        5: [['10:00', '23:00']], // viernes
        6: [['10:00', '23:00']], // sábado
        0: [['10:00', '23:00']]  // domingo
    },

    /* ---------- Guía de horneado (página de inicio y ficha de cada variedad) ----------
       La clave es el id de la categoría de js/menu-datos.js. */
    horneado: {
        pizzas:    { temperatura: '220 a 250 °C', tiempo: '5 a 10 min' },
        pizzetas:  { temperatura: '220 a 250 °C', tiempo: '5 a 10 min' },
        focaccias: { temperatura: '220 a 250 °C', tiempo: '5 a 10 min' }
    },
    pasosHorneado: [
        'Precalentá el horno al máximo (220 a 250 °C) unos 10 minutos.',
        'Poné la pizza en la parte media del horno, directo sobre la rejilla o en una placa.',
        'Horneala de 5 a 10 minutos, hasta que el queso se derrita y la base quede dorada y crocante.',
        'Sacala, dejala reposar un minuto y a disfrutar.'
    ],
    consejosHorneado: [
        { icono: 'fa-fire-flame-simple', titulo: 'Horno a gas', texto: 'Usá la parte media o baja: el calor viene de abajo y la base queda más crocante.' },
        { icono: 'fa-plug', titulo: 'Horno eléctrico', texto: 'Si tiene grill, prendelo los últimos minutos para dorar el queso.' },
        { icono: 'fa-eye', titulo: 'Mirala de cerca', texto: 'Cada horno es distinto: a partir de los 5 minutos, fijate cómo va.' }
    ],

    /* Conservación: completá los textos cuando los tengas (null = no se muestra) */
    conservacion: {
        heladera: null,   // ej. 'Hasta 3 días, bien tapada.'
        freezer: null,    // ej. 'Hasta 30 días.'
        congelada: null   // ej. 'Horneala directo, sin descongelar, sumando 3 o 4 minutos.'
    },

    /* ---------- Pedidos ----------
       mediosDePago: lista de opciones; vacía = "a coordinar por WhatsApp".
       ej. ['Efectivo', 'Transferencia', 'Mercado Pago'] */
    mediosDePago: [],
    envios: {
        hay: true,                       // false = solo retiro en el local
        texto: 'Consultá si llegamos a tu zona.'
    },

    /* ---------- Promociones ----------
       activa: true para mostrarla (en el inicio y en el menú).
       desde / hasta: fechas opcionales 'AAAA-MM-DD' (la promo se muestra solo en ese rango). */
    promos: [
        {
            activa: false,
            etiqueta: 'Promo',
            titulo: 'Combo familiar',
            texto: '3 pizzas caseras a precio especial. Consultanos por WhatsApp.',
            desde: null,
            hasta: null
        }
    ],

    /* ---------- Opiniones de clientes ----------
       SOLO opiniones reales (copiadas de Instagram o WhatsApp, con permiso).
       { nombre: 'Laura', texto: '…', estrellas: 5, origen: 'Instagram' }
       Siempre se muestra al final una invitación a dejar la opinión por WhatsApp o Instagram. */
    resenas: [],

    /* ---------- Instagram ----------
       Publicaciones destacadas: { imagen: 'assets/img/instagram/1.webp', enlace: 'https://www.instagram.com/p/…' }
       Mientras esté vacía, se muestra solo la tarjeta para seguir la cuenta. */
    publicacionesInstagram: []
};
