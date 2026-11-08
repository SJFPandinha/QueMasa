/* ==========================================================================
   ¡Qué Masa! — Datos del menú
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CAMBIAR EL MENÚ.

   Variedades actuales:
     - Pizzas caseras: 8 variedades.
     - Pizzetas: las mismas 8 variedades que las pizzas.
     - Focaccias: romero, tomate cherry y aceituna, cebolla y aceituna.
   Los precios (por menor y por mayor) y la lista completa de ingredientes
   todavía están A DEFINIR.
   Las fotos son de referencia hasta tener fotos propias.
   (Las pizzetas usan por ahora la misma foto que la pizza de su variedad;
    cuando tengas fotos propias de pizzetas, cambiá su "imagen".)

   Campos de cada producto:
     id             → identificador único, sin espacios ni tildes
     categoria      → "pizzas", "focaccias" o "pizzetas" (ver CATEGORIAS)
     nombre         → nombre que se muestra
     descripcion    → texto corto (dejalo en '' si todavía no hay)
     ingredientes   → lista de ingredientes; si está vacía se muestra "A definir"
     imagen         → ruta de la foto (recomendado: 1000 × 750 px, .webp o .jpg)
     precioMenor    → precio por menor: número (ej. 8500) o null
     precioMayor    → precio por mayor: número (ej. 7000) o null
                      (los dos se muestran en precios.html; el menú muestra el precio por menor)
     aDefinir       → true: muestra "Precio a definir" e "Ingredientes a confirmar".
                      Ponelo en false cuando la variedad tenga precio e ingredientes finales.
     fotoDeEjemplo  → true mientras la foto sea de referencia (muestra un aviso en la página)
     etiqueta       → texto destacado opcional (ej. "Nueva", "La más pedida") o null

   Las categorías sin productos no se muestran en el menú.
   ========================================================================== */

window.QM_CATEGORIAS = [
    { id: 'pizzas',    nombre: 'Pizzas caseras', icono: 'fa-pizza-slice' },
    { id: 'pizzetas',  nombre: 'Pizzetas',       icono: 'fa-circle-dot' },
    { id: 'focaccias', nombre: 'Focaccias',      icono: 'fa-bread-slice' }
];

window.QM_MENU = [
    /* ---------- Pizzas caseras ---------- */
    {
        id: 'pizza-muzza-comun',
        categoria: 'pizzas',
        nombre: 'Muzza común',
        descripcion: '',
        ingredientes: ['Muzzarella'],
        imagen: 'assets/img/menu/muzza-comun.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-doble-muzza',
        categoria: 'pizzas',
        nombre: 'Doble muzza',
        descripcion: '',
        ingredientes: ['Doble muzzarella'],
        imagen: 'assets/img/menu/doble-muzza.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-morron-huevo',
        categoria: 'pizzas',
        nombre: 'Morrón y huevo',
        descripcion: '',
        ingredientes: ['Morrón', 'Huevo'],
        imagen: 'assets/img/menu/morron-huevo.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-jamon-aceitunas',
        categoria: 'pizzas',
        nombre: 'Jamón y aceitunas',
        descripcion: '',
        ingredientes: ['Jamón', 'Aceitunas'],
        imagen: 'assets/img/menu/jamon-aceitunas.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-salame-aceitunas',
        categoria: 'pizzas',
        nombre: 'Salame y aceitunas',
        descripcion: '',
        ingredientes: ['Salame', 'Aceitunas'],
        imagen: 'assets/img/menu/salame-aceitunas.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-tomate',
        categoria: 'pizzas',
        nombre: 'Con tomate',
        descripcion: '',
        ingredientes: ['Tomate'],
        imagen: 'assets/img/menu/tomate.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-jamon-morron',
        categoria: 'pizzas',
        nombre: 'Jamón y morrón',
        descripcion: '',
        ingredientes: ['Jamón', 'Morrón'],
        imagen: 'assets/img/menu/jamon-morron.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizza-picante',
        categoria: 'pizzas',
        nombre: 'Pizza picante',
        descripcion: '',
        ingredientes: [],
        imagen: 'assets/img/menu/picante.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },

    /* ---------- Pizzetas (mismas variedades que las pizzas) ---------- */
    {
        id: 'pizzeta-muzza-comun',
        categoria: 'pizzetas',
        nombre: 'Muzza común',
        descripcion: '',
        ingredientes: ['Muzzarella'],
        imagen: 'assets/img/menu/muzza-comun.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-doble-muzza',
        categoria: 'pizzetas',
        nombre: 'Doble muzza',
        descripcion: '',
        ingredientes: ['Doble muzzarella'],
        imagen: 'assets/img/menu/doble-muzza.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-morron-huevo',
        categoria: 'pizzetas',
        nombre: 'Morrón y huevo',
        descripcion: '',
        ingredientes: ['Morrón', 'Huevo'],
        imagen: 'assets/img/menu/morron-huevo.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-jamon-aceitunas',
        categoria: 'pizzetas',
        nombre: 'Jamón y aceitunas',
        descripcion: '',
        ingredientes: ['Jamón', 'Aceitunas'],
        imagen: 'assets/img/menu/jamon-aceitunas.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-salame-aceitunas',
        categoria: 'pizzetas',
        nombre: 'Salame y aceitunas',
        descripcion: '',
        ingredientes: ['Salame', 'Aceitunas'],
        imagen: 'assets/img/menu/salame-aceitunas.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-tomate',
        categoria: 'pizzetas',
        nombre: 'Con tomate',
        descripcion: '',
        ingredientes: ['Tomate'],
        imagen: 'assets/img/menu/tomate.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-jamon-morron',
        categoria: 'pizzetas',
        nombre: 'Jamón y morrón',
        descripcion: '',
        ingredientes: ['Jamón', 'Morrón'],
        imagen: 'assets/img/menu/jamon-morron.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'pizzeta-picante',
        categoria: 'pizzetas',
        nombre: 'Pizzeta picante',
        descripcion: '',
        ingredientes: [],
        imagen: 'assets/img/menu/picante.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },

    /* ---------- Focaccias ---------- */
    {
        id: 'focaccia-romero',
        categoria: 'focaccias',
        nombre: 'Focaccia de romero',
        descripcion: '',
        ingredientes: ['Romero'],
        imagen: 'assets/img/menu/focaccia-romero.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'focaccia-tomate-cherry-aceituna',
        categoria: 'focaccias',
        nombre: 'Focaccia de tomate cherry y aceituna',
        descripcion: '',
        ingredientes: ['Tomate cherry', 'Aceitunas'],
        imagen: 'assets/img/menu/focaccia-tomate-cherry-aceituna.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    },
    {
        id: 'focaccia-cebolla-aceituna',
        categoria: 'focaccias',
        nombre: 'Focaccia de cebolla y aceituna',
        descripcion: '',
        ingredientes: ['Cebolla', 'Aceitunas'],
        imagen: 'assets/img/menu/focaccia-cebolla-aceituna.webp',
        precioMenor: null,
        precioMayor: null,
        aDefinir: true,
        fotoDeEjemplo: true,
        etiqueta: null
    }
];
