# 🚀 Setup Guide - App de Conferencias

Guía paso a paso para configurar el proyecto desde cero.

## 📋 Prerequisitos

- Node.js 18+ instalado
- Cuenta de [Supabase](https://supabase.com) (gratis)
- Cuenta de [Fint](https://fint.app) (opcional, para tickets)
- Git instalado

## 🔧 Paso 1: Clonar e instalar

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/nextjs-pwa.git
cd nextjs-pwa

# Instalar dependencias
npm install --legacy-peer-deps
```

## 🗄️ Paso 2: Configurar Supabase

### 2.1 Crear proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Completa:
   - **Name**: `conferencias-app` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala!)
   - **Region**: Elige la más cercana
4. Click "Create new project" (tarda ~2 minutos)

### 2.2 Obtener credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ mantener secreta)

3. Ve a **Settings** → **Database**
4. Copia el **Connection string** (URI mode)
   - Formato: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña de DB

### 2.3 Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp env.example .env.local
```

Edita `.env.local` con tus valores:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Database
DATABASE_URL=postgresql://postgres:tu-password@db.xxx.supabase.co:5432/postgres

# Fint (opcional por ahora)
FINT_API_BASE_URL=https://api.fint.app/api/v1
FINT_API_KEY=
FINT_WEBHOOK_SECRET=

# PWA
NEXT_PUBLIC_PWA_ENABLED=true
```

### 2.4 Crear tablas en Supabase

**Opción A: Usando Drizzle (recomendado)**

```bash
# Generar migration
npm run db:generate

# Aplicar a Supabase
npm run db:push
```

**Opción B: SQL directo**

1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido de `supabase-setup.sql`
3. Click "Run"

### 2.5 Configurar RLS y triggers

En el **SQL Editor** de Supabase:

1. Copia y pega el contenido de `supabase-setup.sql`
2. Click "Run"
3. Verifica que no haya errores

### 2.6 Seed data inicial (opcional)

Para tener datos de prueba:

1. En **SQL Editor**
2. Copia y pega `supabase-seed.sql`
3. Click "Run"

Esto creará:
- ✅ 5 posts de ejemplo
- ✅ 3 días de evento
- ✅ 4 tracks
- ✅ Salas
- ✅ 2 sesiones de ejemplo
- ✅ 4 stands
- ✅ 3 páginas personalizadas

## 🔐 Paso 3: Configurar autenticación

### 3.1 Magic Link (Email)

1. Ve a **Authentication** → **Providers**
2. **Email** ya está habilitado por defecto
3. Opcional: Personaliza el template en **Email Templates**

### 3.2 Google OAuth

1. Ve a **Authentication** → **Providers**
2. Habilita **Google**
3. Necesitas crear credenciales en Google Cloud:

#### Crear OAuth en Google Cloud:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo (o usa uno existente)
3. Ve a **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Tipo: **Web application**
6. **Authorized redirect URIs**: 
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Reemplaza con tu Project URL de Supabase)
7. Copia **Client ID** y **Client Secret**
8. Pégalos en Supabase (Authentication → Providers → Google)
9. Click **Save**

## 📱 Paso 4: Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Rutas disponibles:

- `/` - Home (feed de posts)
- `/auth/login` - Login
- `/dashboard` - Admin dashboard
- `/programa` - Programa (próximamente)
- `/entradas` - Tickets (próximamente)
- `/stands` - Stands (próximamente)

## 🎫 Paso 5: Configurar Fint (Opcional)

Si quieres integrar tickets de Fint:

### 5.1 Obtener API Key

1. Ve a [Fint Dashboard](https://dashboard.fint.app)
2. **Settings** → **API Keys**
3. Crea una nueva API Key
4. Cópiala a `.env.local`:
   ```bash
   FINT_API_KEY=tu-api-key-aqui
   ```

### 5.2 Configurar Webhook

1. En Fint Dashboard → **Webhooks**
2. Crea un nuevo webhook:
   - **URL**: `https://tu-dominio.vercel.app/api/tickets/sync`
   - **Events**: Selecciona eventos de tickets
3. Copia el **Webhook Secret**
4. Agrégalo a `.env.local`:
   ```bash
   FINT_WEBHOOK_SECRET=tu-webhook-secret
   ```

## 🧪 Paso 6: Probar la autenticación

### Probar Magic Link:

1. Ve a `/auth/login`
2. Ingresa tu email
3. Click "Enviar link mágico"
4. Revisa tu email
5. Click en el link
6. Deberías ser redirigido a `/` autenticado

### Probar Google:

1. Ve a `/auth/login`
2. Click "Continuar con Google"
3. Selecciona tu cuenta
4. Autoriza la app
5. Deberías ser redirigido a `/` autenticado

## 🎨 Paso 7: Verificar datos seed

Si ejecutaste el seed SQL:

1. Ve a Supabase → **Table Editor**
2. Verifica que las tablas tengan datos:
   - `posts` → 5 posts
   - `event_days` → 3 días
   - `sessions` → 2 sesiones
   - `stands` → 4 stands
   - `pages` → 3 páginas

## 🚀 Paso 8: Deploy a Vercel

### 8.1 Conectar repositorio

1. Ve a [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Framework: **Next.js** (detectado automáticamente)

### 8.2 Configurar variables de entorno

En Vercel → **Settings** → **Environment Variables**, agrega:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
FINT_API_BASE_URL=...
FINT_API_KEY=...
FINT_WEBHOOK_SECRET=...
NEXT_PUBLIC_PWA_ENABLED=true
```

### 8.3 Deploy

1. Click "Deploy"
2. Espera ~2 minutos
3. Tu app estará en `https://tu-proyecto.vercel.app`

### 8.4 Actualizar Google OAuth

Si configuraste Google OAuth:

1. Ve a Google Cloud Console
2. Edita tu OAuth client
3. Agrega a **Authorized redirect URIs**:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```

## ✅ Checklist final

- [ ] Proyecto Supabase creado
- [ ] Variables de entorno configuradas
- [ ] Tablas creadas (Drizzle o SQL)
- [ ] RLS y triggers configurados
- [ ] Seed data ejecutado (opcional)
- [ ] Magic Link funcionando
- [ ] Google OAuth configurado (opcional)
- [ ] App corriendo en `localhost:3000`
- [ ] Deploy en Vercel (opcional)

## 🐛 Troubleshooting

### Error: "Failed to compile" con Drizzle

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: "Database connection failed"

- Verifica que `DATABASE_URL` esté correcta
- Asegúrate de reemplazar `[YOUR-PASSWORD]` con tu contraseña real
- Verifica que el proyecto de Supabase esté activo

### Error: "Auth error" al hacer login

- Verifica `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Asegúrate de que el redirect URI en Google OAuth coincida
- Revisa los logs en Supabase → **Authentication** → **Logs**

### PWA no funciona en desarrollo

- PWA requiere HTTPS
- En producción (Vercel) funcionará automáticamente
- Para probar en local, usa `ngrok` o similar

## 📚 Próximos pasos

Ahora que tienes el setup básico:

1. **Semana 2**: Implementar Feed/Home con posts
2. **Semana 3**: Programa con sesiones
3. **Semana 4**: Detalle de sesiones + Mapa
4. **Semana 5**: Integración completa con Fint
5. **Semana 6**: Stands
6. **Semana 7**: Páginas personalizadas
7. **Semana 8**: Newsletter
8. **Semana 9**: Tests y optimizaciones

## 🆘 ¿Necesitas ayuda?

- 📖 [Documentación Next.js](https://nextjs.org/docs)
- 📖 [Documentación Supabase](https://supabase.com/docs)
- 📖 [Documentación Drizzle](https://orm.drizzle.team)
- 📖 [Documentación Fint](https://docs.fint.app)

---

¡Listo! Tu app de conferencias está configurada y lista para desarrollo 🎉
