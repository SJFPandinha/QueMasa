# QueMasa

Sitio web de **¡Qué Masa!** — pizzas caseras, pizzetas y focaccias listas para hornear.
Alsina 948, San Miguel de Tucumán · WhatsApp 381 612-0182 · Instagram [@quemasa.takeawayy](https://www.instagram.com/quemasa.takeawayy/)

Sitio estático (HTML, CSS y JavaScript sin frameworks). Se abre directamente con `index.html`
o se puede publicar en cualquier hosting estático (por ejemplo, GitHub Pages).

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Inicio: presentación, productos, cómo comprar, ventas por mayor y menor, galería y contacto (QR + mapa) |
| `menu.html` | Menú interactivo: carrusel de variedades, ficha deslizable (mantener presionada la foto), pizza mitad y mitad e ingredientes |
| `precios.html` | Lista de precios por menor y por mayor |

| `404.html` | Página para direcciones que no existen |

## Estructura

```
css/style.css        Estilos (los colores de marca están en :root, al principio)
css/iconos.css       Íconos (Font Awesome reducido, con las fuentes en assets/fonts/)
js/negocio-datos.js  ⭐ Datos del negocio: horarios, horneado, pagos, envíos, promos, opiniones, Instagram
js/menu-datos.js     ⭐ Datos del menú: variedades, ingredientes, fotos, precios y precios por cantidad
js/main.js           Funciones comunes: menú, WhatsApp, horarios (abierto/cerrado), promos, animaciones, visor, ficha
js/pedido.js         Armador de pedido (carrito) → un único mensaje de WhatsApp
js/inicio.js         Inicio: guía de horneado, opiniones e Instagram
js/menu.js           Menú interactivo
js/mitades.js        Pizza mitad y mitad (dos sabores en una prepizza)
js/precios.js        Lista de precios y formulario para revendedores
assets/img/          Imágenes (logo, favicon, QR, fotos)
assets/img/menu/     Fotos de cada variedad del menú
sitemap.xml, robots.txt   Para Google
```

## Armador de pedido
En el menú, cada variedad tiene **Agregar al pedido** (también la mitad y mitad y el botón **+** del listado).
El pedido queda guardado en el navegador del cliente. En el panel completa nombre, retiro o envío,
día y horario (solo los días y horas de atención) y se arma un mensaje de WhatsApp en lista vertical,
agrupado por categoría, con cantidades, aclaraciones de cada pizza y total.

El total se calcula con `escalas` (precio por unidad según la cantidad) o con `precioMenor`;
ver "PRECIOS POR CANTIDAD" al principio de `js/menu-datos.js`.

## Íconos
Si se usa un ícono nuevo de Font Awesome (`fa-algo`), hay que volver a generar `css/iconos.css`
y `assets/fonts/` (solo trae los íconos que usa el sitio).

## Cómo actualizar el contenido

### Variedades, ingredientes y precios
Todo se edita en **`js/menu-datos.js`**. Cada variedad tiene:

- `ingredientes`: lista de ingredientes.
- `precioMenor` y `precioMayor`: número sin signo ni puntos (ej. `8500` → se muestra **$ 8.500**). `null` = "A definir".
- `aDefinir`: poner en `false` cuando la variedad tenga precio e ingredientes finales.
- `fotoDeEjemplo`: poner en `false` cuando la foto sea propia (desaparece el aviso de "fotos de referencia").

El menú y la lista de precios se actualizan solos con esos datos.

### Mitad y mitad
En `QM_CATEGORIAS` (al principio de `js/menu-datos.js`), las categorías con `mitades: true`
se pueden pedir con dos sabores en una misma prepizza. Hoy está activado solo para las pizzas.

### Fotos
Las fotos actuales son **de referencia**. Para reemplazarlas, guardá tu foto con el mismo nombre
de archivo en `assets/img/` o `assets/img/menu/` (recomendado: `.webp`, al menos 1000 px de ancho).

### Códigos QR
`assets/img/qr-whatsapp.svg` y `assets/img/qr-instagram.svg`. Si cambia el número de WhatsApp
o el usuario de Instagram, hay que volver a generarlos.

## Pendiente

- Fotos propias de productos, preparación y local.
- Precios por menor y por mayor (y precios por cantidad), y condiciones de venta por mayor.
- Lista completa de ingredientes de cada variedad.
- Medios de pago, zonas de envío y conservación (heladera / freezer) en `js/negocio-datos.js`.
- Activar Web Analytics en el panel de Vercel y dar de alta el negocio en Google Business.
