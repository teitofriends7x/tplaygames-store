# Autenticación y cuentas

## Experiencia implementada

- El ícono de cuenta abre `/login` sin sesión y `/mi-cuenta` con sesión.
- Login y registro por email usan Supabase Auth; la aplicación nunca guarda contraseñas.
- Google usa `supabase.auth.signInWithOAuth({ provider: "google" })` con PKCE.
- `/auth/callback` intercambia el código por sesión, garantiza el perfil y acepta solo destinos internos.
- `src/proxy.ts` valida la sesión y renueva cookies con headers privados de caché.
- Recuperación: `/recuperar-contrasena` -> email -> `/auth/callback` -> `/actualizar-contrasena`.
- Las rutas anteriores con sufijo `-password` redirigen a las rutas canónicas en español.
- Los mensajes de Supabase se traducen a textos comerciales; no se muestran variables, stack traces ni instrucciones internas.

Sin variables de Supabase, los formularios siguen visibles y explican de forma comercial que el acceso no está disponible. Comprar y seguir pedidos como invitado continúa funcionando.

## Perfil automático

La migración `0004_standard_auth_flow.sql`:

- crea `profiles` al dar de alta un usuario por email o Google;
- importa nombre, apellido, teléfono y avatar desde metadata cuando existen;
- conserva roles existentes;
- permite que cada usuario inserte únicamente su propio perfil;
- completa perfiles faltantes de usuarios ya existentes.

## Pedidos de usuario

El checkout valida la sesión en servidor. Con usuario autenticado:

- fuerza el email verificado de la cuenta;
- guarda `orders.user_id` con `user.id`;
- conserva el snapshot histórico del cliente;
- muestra el pedido en `/mi-cuenta` sin solicitar número ni código.

El formulario precarga nombre, apellido, teléfono y dirección guardados. El servidor vuelve a validar stock, cupón y precio final.

## Compras invitadas

El checkout ofrece explícitamente iniciar sesión, crear una cuenta o continuar como invitado. Un pedido invitado guarda email y número público y se consulta en `/seguimiento`.

Después de crear una cuenta con el mismo email y verificarlo, el cliente puede vincular los pedidos. El historial normal consulta solo `user_id`; las compras invitadas no aparecen silenciosamente antes de la vinculación.

## Google OAuth

1. En Google Cloud, crear una credencial OAuth de tipo `Web application`.
2. Agregar como Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://tu-dominio.com`
   - el dominio de staging/Vercel que se vaya a probar.
3. Agregar como Authorized redirect URI la URL que muestra Supabase en Auth > Providers > Google, normalmente:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copiar Client ID y Client Secret en Supabase Auth > Providers > Google y activar el proveedor.
5. En Supabase Auth > URL Configuration:
   - Site URL: el valor productivo de `NEXT_PUBLIC_SITE_URL`;
   - Redirect URLs: `http://localhost:3000/auth/callback`, la URL de staging y `https://tu-dominio.com/auth/callback`.

El Client Secret de Google no se carga en variables públicas de Next.js.

## Variables requeridas

- `NEXT_PUBLIC_SITE_URL`: origen canónico, sin path final.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública/anon del proyecto.
- `SUPABASE_SERVICE_ROLE_KEY`: solo servidor; persistencia operativa y administración.

## Pruebas con credenciales

Antes de producción, ejecutar manualmente con un proyecto Supabase configurado:

1. registro con confirmación de email habilitada y deshabilitada;
2. login por email, recarga y reapertura del navegador;
3. Google OAuth desde localhost, staging y dominio final;
4. recuperación y cambio de contraseña;
5. checkout autenticado y aparición inmediata del pedido en `/mi-cuenta`;
6. checkout invitado, seguimiento y vinculación posterior;
7. logout y protección de endpoints de cuenta;
8. visibilidad de Panel administrador solo para rol `admin`.

La suite local cubre el cliente Supabase con mocks de contrato, redirects seguros, UI pública, checkout invitado y regresiones. Los emails y consentimientos OAuth reales requieren las credenciales externas.
