# ElectroIsla — tienda online v7.2 Supabase

Esta versión conserva las funciones de v7.1 y añade conexión con Supabase.

## Conservado
- Alimentos y Electrodomésticos.
- Catálogo, filtros y carrito.
- Pedidos por WhatsApp al +53 52017110.
- Panel para agregar, editar, ocultar y eliminar productos.
- Fotos desde la galería de Android con vista previa.
- Unidades y presentaciones, incluida lb, ½ lb y "Otra...".
- USD, CUP y EUR.
- Precio normal y precio de descuento.

## Supabase
- Los productos se leen desde `public.products`.
- El primer inicio del panel conserva el catálogo local y lo sube a Supabase si la tabla está vacía.
- Los cambios del panel se guardan en Supabase y en el almacenamiento local.
- La tienda pública usa Supabase y conserva el catálogo local como respaldo si no puede conectarse.
- Realtime actualiza catálogo cuando hay cambios.
- El panel usa Supabase Auth con correo y contraseña; ya no depende de una clave hardcodeada.

## Seguridad pendiente antes de publicar como producción
La tabla actual permite escritura a usuarios autenticados. Como solo debe existir el administrador, conviene desactivar nuevos registros y/o restringir las políticas a un usuario administrador antes de una publicación pública definitiva.

## Imágenes
Esta etapa mantiene las imágenes como datos dentro del campo `image` para no romper el funcionamiento existente. La siguiente mejora recomendada es migrarlas a Supabase Storage para reducir el tamaño de la base de datos.
