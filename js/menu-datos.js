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
     atributos      → marcas con ícono: 'picante', 'vegetariana', 'mas-pedida', 'nueva'
                      (se ven en el menú y también se pueden buscar: "vegetariana")
     escalas        → (opcional) precio por unidad según la cantidad, ver PRECIOS POR CANTIDAD

   Las categorías sin productos no se muestran en el menú.
   ========================================================================== */

/* PRECIOS POR CANTIDAD (armador de pedido)
   --------------------------------------------------------------------------
   El total del pedido se calcula solo: cantidad × precio por unidad.
   Para que el precio cambie según cuántas se piden, cargá "escalas" en la
   categoría (vale para todas sus variedades) o en una variedad puntual:

       escalas: [
           { desde: 1,  precio: 6000 },   // de 1 a 2 unidades: $6.000 c/u
           { desde: 3,  precio: 5500 },   // de 3 a 5 unidades: $5.500 c/u
           { desde: 6,  precio: 5000 }    // 6 o más: $5.000 c/u
       ]

   La cantidad que cuenta es el total de esa categoría en el pedido
   (ej. 2 muzzas + 1 mitad y mitad = 3 pizzas). Mitad y mitad se cobra
   al precio de la mitad más cara.
   Sin escalas, se usa precioMenor. Si no hay precio, el total queda "a confirmar".
   ========================================================================== */

/* mitades: true → esa categoría se puede pedir "mitad y mitad" (dos sabores en una
   misma prepizza). Para habilitarlo también en pizzetas, poné mitades: true ahí. */
window.QM_CATEGORIAS = [
    { id: 'pizzas',    nombre: 'Pizzas caseras', icono: 'fa-pizza-slice', mitades: true, escalas: [] },
    { id: 'pizzetas',  nombre: 'Pizzetas',       icono: 'fa-circle-dot', escalas: [] },
    { id: 'focaccias', nombre: 'Focaccias',      icono: 'fa-bread-slice', escalas: [] }
];

/* Marcas con ícono que se pueden poner en "atributos" de cada variedad */
window.QM_ATRIBUTOS = {
    'picante':     { nombre: 'Picante',      icono: 'fa-pepper-hot' },
    'vegetariana': { nombre: 'Vegetariana',  icono: 'fa-leaf' },
    'mas-pedida':  { nombre: 'La más pedida', icono: 'fa-star' },
    'nueva':       { nombre: 'Nueva',        icono: 'fa-certificate' }
};

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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: []
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
        etiqueta: null,
        atributos: []
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: []
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
        etiqueta: null,
        atributos: ['picante']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: []
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
        etiqueta: null,
        atributos: []
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: []
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
        etiqueta: null,
        atributos: ['picante']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: ['vegetariana']
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
        etiqueta: null,
        atributos: ['vegetariana']
    }
];
