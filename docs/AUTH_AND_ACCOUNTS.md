# Autenticación y cuentas

## Flujo

- Registro y login usan Supabase Auth desde componentes cliente.
- Recuperación de contraseña redirige a `/auth/callback?next=/actualizar-password`.
- `/auth/callback` intercambia el código con Supabase y redirige al destino
  indicado.
- `/mi-cuenta` consume `/api/account`, `/api/account/orders` y
  `/api/account/link-guest-orders`.

## Datos de cuenta

El perfil editable guarda:

- nombre;
- apellido;
- teléfono;
- dirección principal;
- ciudad;
- provincia;
- código postal;
- notas de entrega.

La dirección se guarda en `addresses`. El perfil se guarda en `profiles`.

## Pedidos de usuario

El checkout consulta la sesión Supabase en servidor. Si existe usuario:

- `orders.user_id` recibe el `user.id`;
- el snapshot de cliente conserva los datos históricos;
- el pedido aparece en `/mi-cuenta` y `/mis-pedidos`.

Si no existe usuario, el pedido queda como invitado con `guest_email`.

## Vinculación de invitados

Un usuario autenticado puede buscar pedidos invitados con su mismo email. La
vinculación exige email verificado y confirmación explícita desde UI.

La función `link_guest_orders_to_user(p_user_id, p_email)` actualiza solo
pedidos sin `user_id` y registra auditoría.

## Carrito y favoritos

Al iniciar sesión, el navegador llama a `/api/account/sync`:

- fusiona carrito local sin perder cantidades;
- fusiona favoritos sin duplicados;
- persiste favoritos en Supabase cuando los IDs son UUID válidos.

El carrito sigue revalidándose en servidor durante checkout; el cliente nunca
define precios finales.

## Pendientes

- Configurar Supabase Auth real.
- Definir políticas comerciales de datos personales.
- Revisar textos legales con profesional antes de producción.
