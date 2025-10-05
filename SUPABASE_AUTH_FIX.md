# Fix: Magic Link Authentication Error

## Problema
```
AuthApiError: invalid request: both auth code and code verifier should be non-empty
```

## Causa
El callback no estaba manejando correctamente el flujo de Magic Link. Supabase envía diferentes parámetros según el método de autenticación:
- **Magic Link**: `token_hash` y `type`
- **OAuth (Google)**: `code`

## Solución Implementada

### 1. Actualizado `src/app/callback/page.tsx`
Ahora detecta y maneja correctamente ambos flujos:
- ✅ Magic Link: usa `verifyOtp()` con `token_hash` y `type`
- ✅ OAuth: usa `exchangeCodeForSession()` con `code`

### 2. Configuración Requerida en Supabase

**IMPORTANTE**: Debes configurar las Redirect URLs en Supabase Dashboard.

#### Paso 1: Ve a tu proyecto en Supabase
https://supabase.coxm/dashboard/project/xxbvdwxxmqfpmzeufswm/auth/url-configuration

#### Paso 2: Agrega estas URLs en "Redirect URLs"
```
http://localhost:3000/callback
https://tu-dominio.vercel.app/callback
```

#### Paso 3: Configura "Site URL"
```
http://localhost:3000
```
(En producción, cámbialo a tu dominio real)

### 3. Verificar Variables de Entorno

Asegúrate de que tu `.env.local` tenga:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxbvdwxxmqfpmzeufswm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Y en Vercel (para producción):
- Agrega las mismas variables en: Settings → Environment Variables

## Testing

### Localhost
1. Ejecuta `npm run dev`
2. Ve a http://localhost:3000/login
3. Ingresa tu email
4. Revisa tu bandeja de entrada
5. Haz clic en el magic link
6. Deberías ser redirigido a `/callback` y luego a `/`

### Producción
1. Despliega a Vercel: `git push`
2. Actualiza "Site URL" en Supabase a tu dominio de producción
3. Agrega la URL de callback de producción en "Redirect URLs"
4. Prueba el flujo completo

## Debugging

Si sigue sin funcionar, verifica en la consola del navegador:
```javascript
// Abre DevTools → Console y pega esto:
const params = new URLSearchParams(window.location.search);
console.log('URL params:', {
  token_hash: params.get('token_hash'),
  type: params.get('type'),
  code: params.get('code'),
  error: params.get('error'),
  error_description: params.get('error_description')
});
```

Esto te mostrará qué parámetros está enviando Supabase.

## Notas Adicionales

### Diferencias entre flujos:

**Magic Link URL (correcto)**:
```
http://localhost:3000/callback?token_hash=abc123&type=email
```

**OAuth URL (correcto)**:
```
http://localhost:3000/callback?code=xyz789
```

**URL con error (incorrecto)**:
```
http://localhost:3000/callback?error=access_denied&error_description=...
```

### Configuración de Email Templates (Opcional)

Si quieres personalizar el email del magic link:
1. Ve a: Authentication → Email Templates
2. Edita "Magic Link"
3. Asegúrate de que el link use: `{{ .ConfirmationURL }}`

## Checklist de Verificación

- [ ] Actualizado `src/app/callback/page.tsx` ✅ (ya hecho)
- [ ] Agregado `http://localhost:3000/callback` en Supabase Redirect URLs
- [ ] Agregado `https://tu-dominio.vercel.app/callback` en Supabase Redirect URLs
- [ ] Configurado "Site URL" en Supabase
- [ ] Variables de entorno correctas en `.env.local`
- [ ] Variables de entorno correctas en Vercel
- [ ] Probado en localhost
- [ ] Probado en producción
