# Autenticación y cuentas

## Proveedor

Clerk gestiona registro, login, Google, email, recuperación, cierre de sesión y
persistencia de sesión. Supabase Auth ya no participa del runtime. Supabase se
conserva como PostgreSQL y Storage para pedidos, comprobantes y operación.

`ClerkProvider` vive en el layout raíz y `src/proxy.ts` protege `/mi-cuenta`,
`/mis-pedidos` y `/admin`. Las pantallas oficiales `<SignIn>` y `<SignUp>` usan
rutas catch-all y una apariencia oscura adaptada a T.PlayGames.

## Variables

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/mi-cuenta
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/mi-cuenta
```

`CLERK_SECRET_KEY` es exclusivamente de servidor. Nunca debe usar el prefijo
`NEXT_PUBLIC_`, imprimirse en logs ni enviarse al navegador.

## Configuración simple de Clerk y Vercel

1. Entrar a [Clerk Dashboard](https://dashboard.clerk.com/) y crear una aplicación.
2. En **SSO connections / Social connections**, habilitar Google. En desarrollo,
   usar la conexión simplificada administrada por Clerk; no hace falta crear un
   proyecto manual en Google Cloud.
3. En **API keys**, copiar únicamente la Publishable key y la Secret key.
4. En Vercel, abrir el proyecto que sirve el dominio público y crear
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` para Production y
   Preview. Agregar también las seis variables de ruta del bloque anterior.
5. Guardar y ejecutar **Redeploy** del último commit. Un deployment anterior no
   incorpora variables agregadas después del build.
6. Probar `/registro`, `/login`, recuperación, recarga de sesión y logout.

En producción, Clerk puede solicitar una conexión OAuth personalizada según el
plan o la configuración elegida. Seguir entonces el asistente del Dashboard sin
copiar secretos de Google al proyecto Next.js.

## Roles

Los roles válidos son `customer`, `operator` y `admin`. El servidor lee
`publicMetadata.role` directamente desde Clerk mediante `currentUser()`; no
confía en un valor enviado por el cliente.

Para asignar el primer administrador:

1. Registrarse normalmente en la tienda.
2. En Clerk Dashboard, abrir **Users** y seleccionar el usuario.
3. Abrir **Metadata**.
4. En **Public metadata**, guardar:

```json
{ "role": "admin" }
```

5. Cerrar sesión y volver a ingresar para refrescar la sesión.

Usar `{ "role": "operator" }` para operadores. Si falta la metadata o contiene
otro valor, la aplicación aplica `customer`.

## Pedidos y compatibilidad

La migración `0005_clerk_auth_compatibility.sql` agrega de forma no destructiva:

- `orders.clerk_user_id` para compras nuevas autenticadas;
- `clerk_profiles` para datos de contacto y envío;
- `clerk_favorites` para favoritos sincronizados;
- identificadores Clerk separados en eventos, auditoría y comprobantes;
- `link_guest_orders_to_clerk_user()` para vincular por email verificado.

`orders.user_id` y las tablas anteriores no se eliminan: conservan pedidos
históricos creados con Supabase Auth. Al vincular una cuenta Clerk se busca el
email normalizado en `guest_email` o en el snapshot histórico, incluso si el
pedido conserva un `user_id` legacy.

En checkout autenticado, el servidor toma el ID y el email de Clerk y vuelve a
validar stock, cupón y precio. Las compras invitadas siguen disponibles y se
consultan por email más número de pedido.

## Verificación manual con credenciales

1. Registro con Google.
2. Registro con email y verificación.
3. Login, recarga, reapertura del navegador y logout.
4. Recuperación de contraseña.
5. Compra autenticada visible en `/mi-cuenta`.
6. Compra invitada y vinculación posterior por email verificado.
7. Usuario `customer` rechazado en `/admin`.
8. Usuarios `operator` y `admin` habilitados según metadata.

Los consentimientos OAuth y emails reales no pueden automatizarse sin una
aplicación Clerk y cuentas de prueba externas.
