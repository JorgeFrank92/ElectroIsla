# ElectroIsla — tienda online

Primera versión funcional y gratuita de la tienda.

## Incluye
- Dos categorías: Alimentos y Electrodomésticos.
- Catálogo responsive para móvil y PC.
- Carrito.
- Formulario de pedido.
- Generación automática del mensaje de WhatsApp al +53 52017110.
- Panel de administración para agregar, editar, ocultar y eliminar productos.
- Persistencia local para prototipo.

## Importante sobre esta primera versión
El panel de administración usa `localStorage` y la clave de demostración `admin123`. Esto sirve para probar la interfaz, pero **no debe considerarse seguridad real** si la página se publica para clientes.

Para una versión de producción, la siguiente etapa es conectar el catálogo y el panel a Supabase (plan gratuito): base de datos + autenticación + almacenamiento de imágenes. Así los cambios que hagas desde el teléfono quedan guardados en la nube y no dependen del navegador.

## Publicación gratuita
Puedes publicar `index.html`, `styles.css` y `app.js` con GitHub Pages. El panel `admin.html` y `admin.js` puede publicarse junto con ellos, pero para producción debe usar autenticación y base de datos.

## WhatsApp
El número está configurado como `+53 52017110` en `app.js`.


## v4 - Fotos desde Android
El panel permite seleccionar una imagen con el selector de archivos del Android, comprimirla y guardarla en el producto mediante almacenamiento local.


## Versión 6
- Mantiene las dos opciones de imagen: URL o galería del Android.
- La galería usa FileReader y muestra una vista previa real antes de guardar.
- La URL también tiene vista previa.
- Se evita mezclar URL y archivo al cambiar de opción.
