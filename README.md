# 🎪 App de Conferencias

> App web para conferencias y eventos construida con Next.js 15, React 19, Drizzle ORM y Supabase.

## ✨ Features

- 🏠 **Home/Feed**: Posts con múltiples formatos (texto, imágenes, carrusel, YouTube, Spotify, links)
- 📅 **Programa**: Agenda por días con sesiones, tracks, salas y plenarias con materiales
- 🎫 **Entradas**: Integración con Fint API para gestión de tickets con QR
- 🏢 **Stands**: Grid de instituciones, sponsors y organizaciones
- 📄 **Páginas Personalizadas**: CMS lite con bloques editables
- 📧 **Newsletter**: Captura de emails con validación
- 🔐 **Auth**: Magic link + Google OAuth via Supabase
- 📱 **PWA**: Offline support con Serwist
- ✨ **View Transitions**: Animaciones suaves entre rutas
- 🎨 **UI Moderna**: TailwindCSS v4 + shadcn/ui + Radix

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router, RSC)
- **React**: 19
- **TypeScript**: 5
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui (Radix)
- **Database**: Supabase (Postgres)
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **PWA**: Serwist
- **View Transitions**: next-view-transitions
- **Validation**: Zod
- **Toasts**: sonner
- **Drawer**: vaul

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm o pnpm
- Cuenta de Supabase
- API Key de Fint (opcional, para tickets)

### Installation

1. **Clonar el repositorio**
```bash
git clone https://github.com/yourusername/conferencia-app.git
cd conferencia-app
```

2. **Instalar dependencias**
```bash
npm install --legacy-peer-deps
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Fint API (opcional)
FINT_API_BASE_URL=https://api.fint.app/api/v1
FINT_API_KEY=your-api-key
FINT_WEBHOOK_SECRET=your-webhook-secret
```

4. **Setup Supabase**

Crea las tablas ejecutando el SQL del archivo `specs/general.md` (Anexo A) en el SQL Editor de Supabase.

O usa Drizzle para generar y aplicar migrations:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
app/
  (auth)/           # Rutas de autenticación
  (app)/            # App principal (Home, Programa, Entradas, Stands, Más)
  (admin)/          # Backoffice para organizadores
  api/              # API Routes
lib/
  db/
    schema.ts       # Drizzle schema
    index.ts        # DB client
  auth.ts           # Supabase auth helpers
  fint.ts           # Fint API integration
  utils.ts          # Utilidades generales
  validators/       # Zod schemas
components/
  ui/               # shadcn components
  post-card.tsx
  session-card.tsx
  stand-card.tsx
  ticket-card.tsx
  ...
drizzle/
  migrations/       # SQL migrations
```

## 🗄️ Database Schema

El proyecto usa **Drizzle ORM** con Supabase Postgres. Schema principal:

- `profiles` - Usuarios con roles (USER, EDITOR, ADMIN)
- `posts` - Posts del feed (5 tipos)
- `event_days` - Días del evento
- `tracks` - Tracks/ejes temáticos
- `rooms` - Salas
- `sessions` - Sesiones del programa
- `stands` - Stands/organizaciones
- `pages` - Páginas personalizadas (CMS)
- `newsletter_subs` - Suscripciones newsletter
- `tickets` - Tickets de Fint (sincronizados)

Ver schema completo en `lib/db/schema.ts`.

## 🔐 Autenticación

Supabase Auth con dos métodos:

1. **Magic Link**: Email sin contraseña
2. **Google OAuth**: Sign in con Google

Roles:
- `USER`: Usuario regular (asistente)
- `EDITOR`: Puede crear/editar contenido
- `ADMIN`: Acceso completo al backoffice

## 🎫 Integración Fint

La app se integra con [Fint](https://fint.app) para gestión de tickets:

- **Fetch por email**: `GET /api/v1/event/ticket/email/{email}`
- **Webhook sync**: `POST /api/tickets/sync`
- **Features**: QR codes, PDFs, estados, cache

Ver implementación en `lib/fint.ts`.

## 📱 PWA

La app es una Progressive Web App con:

- ✅ Offline support (Serwist)
- ✅ Add to Home Screen
- ✅ App Manifest
- ✅ Service Worker
- ✅ Cache strategies

## 🎨 UI Components

Basado en [shadcn/ui](https://ui.shadcn.com/) con Radix UI:

```bash
# Agregar componentes
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## 🧪 Testing

```bash
# Tests críticos (Semana 9)
npm run test          # Unit tests
npm run test:e2e      # Playwright E2E
```

## 📦 Build & Deploy

```bash
# Build production
npm run build

# Start production server
npm start
```

### Deploy en Vercel

1. Push a GitHub
2. Conecta el repo en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático en cada push

## 📖 Documentación

- [Especificación completa](./specs/general.md)
- [Changelog](./specs/CHANGELOG.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Supabase Docs](https://supabase.com/docs)

## 🗓️ Roadmap

### MVP (9 semanas) ✅
- [x] Setup base + Drizzle + Supabase
- [ ] Auth (Magic Link + Google)
- [ ] Home/Feed (5 variantes)
- [ ] Programa + Plenarias + Mapa
- [ ] Entradas (Fint integration)
- [ ] Stands
- [ ] Páginas personalizadas
- [ ] Newsletter
- [ ] Admin backoffice
- [ ] Tests críticos

### V1.1 (Futuro)
- [ ] Encuestas (Polls)
- [ ] Q&A con voting
- [ ] Multi-tenant (tenant_id)
- [ ] Supabase Realtime
- [ ] Notificaciones push

## 🤝 Contributing

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 License

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@yourusername](https://github.com/yourusername)

---

⭐️ Si este proyecto te fue útil, dale una estrella en GitHub!