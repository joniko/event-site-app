# App de Conferencias – Especificación técnica para desarrollo (MVP)

> **Contexto**: App web para conferencias/eventos. MVP sin "favoritos". Rol de usuario: **Asistente**. Rol de backoffice: **Organizador**. Secciones: **Home/Feed**, **Programa+Plenarias** (con mapa embebido), **Entradas** (sync Fint), **Stands/Organización**, **Páginas personalizadas** (en menú "Más"), **Newsletter**. **NOTA**: Encuestas y Q&A quedan fuera del MVP inicial (V1.1). Soporte para multi-evento en mente (V1.1: tenant_id en DB para separar datos por conferencia). **Base del proyecto**: Template nextjs-pwa (Next.js 15 + Tailwind v4 + Serwist para PWA) ✅ ya clonado. View Transitions integradas con next-view-transitions ✅. **Integración Fint**: Usar endpoint GET /api/v1/event/ticket/email/{email} para fetch de tickets por email del usuario (autenticado con x-api-key). Sync vía webhook (configurado en dashboard Fint, payload a /api/tickets/sync) o manual.

---

## 1) Stack y lineamientos

* **Frontend**: Next.js 15 (App Router, RSC, basado en nextjs-pwa template ✅), React 19, TypeScript.
* **UI**: TailwindCSS v4.0 + shadcn/ui (Radix). Iconos: lucide-react. Toasts: sonner. Drawer mobile: vaul.
* **PWA**: Serwist para service worker (offline support, caching), Web App Manifest para add-to-home-screen.
* **View Transitions**: next-view-transitions ✅ ya integrado para animaciones suaves entre rutas.
* **ORM**: **Drizzle ORM** para type-safety con Supabase Postgres. Migrations con drizzle-kit.
* **Estado**: Server Components + server actions; client components sólo donde sea necesario.
* **Testing**: Tests críticos en Semana 9 (auth flow, Fint fetch, admin CRUD básico) con Playwright.
* **Auth + DB**: **Supabase** (Postgres administrado + Supabase Auth + Storage). Soporte para multi-tenant: campo `tenant_id` en tablas clave (policies RLS filtran por eso en V1.1).

  * Auth: magic link + Google.
  * DB: Postgres con **RLS** habilitado + Drizzle ORM para queries type-safe.
  * Storage: bucket `public` para imágenes/archivos simples.
* **Analítica**: Vercel Analytics + eventos custom.
* **Error Tracking**: Sentry para monitoreo de errores en producción.
* **Deploy**: Vercel. Variables en Project Settings. CI/CD: Vercel Git para deploys auto.
* **Accesibilidad**: Radix + labels, `aria-*`.
* **SEO**: Next Metadata API + OG.

---

## 2) Estructura de proyecto (propuesta)

> **Nota**: Template nextjs-pwa ✅ ya clonado. ViewTransitions ✅ ya integrado. Usar Drizzle ORM para DB.

```
app/
  (auth)/
    login/page.tsx          # Magic link + Google
    callback/page.tsx       # OAuth callback
  (app)/                    # Rutas principales de la app (con ViewTransitions)
    layout.tsx              # Layout con <ViewTransitions> + nav tabs
    page.tsx                # Home/Feed
    programa/
      page.tsx              # Lista por día + mapa
      [sessionId]/page.tsx  # Detalle de sesión (con materiales si es plenaria)
    entradas/page.tsx       # Tickets Fint del usuario
    stands/
      page.tsx              # Grid de stands
      [id]/page.tsx         # Detalle de stand
    mas/
      page.tsx              # Lista de páginas personalizadas
      [slug]/page.tsx       # Página CMS-lite
  (admin)/                  # Backoffice separado
    layout.tsx              # Layout admin con sidebar
    dashboard/page.tsx      # Métricas básicas
    posts/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    programa/
      dias/page.tsx
      sesiones/page.tsx
    stands/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    paginas/
      page.tsx
      new/page.tsx
      [id]/page.tsx
  api/
    posts/route.ts
    posts/[id]/route.ts
    agenda/route.ts
    sesiones/[id]/route.ts
    stands/route.ts
    stands/[id]/route.ts
    paginas/route.ts
    paginas/[slug]/route.ts
    tickets/
      sync/route.ts         # webhook-sync Fint (POST, valida secret)
      route.ts              # GET tickets del usuario (fetch a Fint por email)
    newsletter/
      subscribe/route.ts    # POST email subscription
lib/
  auth.ts                   # Supabase auth helpers
  db/
    index.ts                # Drizzle client + connection
    schema.ts               # Drizzle schema definitions
    queries.ts              # Reusable queries
  validators/               # Zod schemas
    post.ts
    session.ts
    stand.ts
    page.ts
    ticket.ts
  analytics.ts              # Vercel Analytics helpers
  fint.ts                   # Fint API client (fetch con retry logic)
  utils.ts                  # Helpers generales
components/
  ui/*                      # shadcn components
  post-card.tsx
  session-card.tsx
  stand-card.tsx
  ticket-card.tsx
  map-embed.tsx
  link-pill.tsx
  page-blocks/*             # Bloques para páginas personalizadas
  error-boundary.tsx
  skeletons/                # Loading states
drizzle/
  migrations/               # SQL migrations generadas por drizzle-kit
  meta/
public/
  manifest.json             # PWA manifest (del template)
  icons/                    # PWA icons
  sw.js                     # Service worker via Serwist (generado)
```

---

## 3) Modelado funcional (MVP)

> **Nota**: orientar el diseño a PRD. El schema de DB puede ajustarse, pero dejamos referencias para acelerar el desarrollo. Soporte para multi-tenant: agregar `tenant_id` uuid en tablas.

### 3.1 Home/Feed

* **Tipos de post**: Texto+imagen, Carrusel imágenes, YouTube, Spotify, Link pill (icono/imagen + URL).
* **Requisitos**: listado paginado por fecha desc., pin de destacados, tarjeta responsive. Búsqueda global (fuse.js client o pg_trgm en DB).
* **Acc. Criteria**:

  * Dado un post publicado, cuando entro a Home, lo veo con su título, subtítulo, media y CTA si es link.
  * Si es YouTube/Spotify, se renderiza embed responsivo "lite" (sin cookies) por default; botón "Cargar completo".
  * Si está “pineado”, aparece arriba del feed.

### 3.2 Programa + Plenarias (con mapa)

* Vista por **día** (1–3). Filtrar por track/sala/búsqueda. Grid alternativa por tracks.
* **Sesión**: título, descripción, horario, sala, (opcional) orador, flag **Plenaria**.
* **Plenaria**: resaltar tarjeta + botón a **Materiales** (link/archivo embebido).
* **Mapa**: componente `map-embed` (iframe de Google Maps o imagen con hotspots simple en MVP; opcional: Places API para búsqueda de salas). Accesible desde la vista de Programa.
* **Acc. Criteria**:

  * Puedo cambiar de día y ver sesiones ordenadas por hora.
  * Las plenarias se distinguen visualmente; si hay `materialsUrl`, aparece un acceso claro.
  * El mapa es visible desde Programa (pestaña/accordion/botón fijo).
  * En admin, warning visual si nueva sesión solapa con otra por sala/horario.

### 3.3 Entradas (Fint)

* Mostrar tickets del usuario (si está logueado) con **QR**, **estado**, **nombre del evento**, **PDF** (opcional).
* Fetch en `/api/my/tickets`: obtener email de usuario (de Supabase session), llamar GET https://api.fint.app/api/v1/event/ticket/email/{email} con header `x-api-key`. Cachear en DB si sync activo.
* Sync por webhook (POST a `/api/tickets/sync`, validar `FINT_WEBHOOK_SECRET` en header) o tarea manual (botón en admin llama endpoint batch o por email). Upsert en DB por `external_id` (ticket.id o purchase.reference).
* **Acc. Criteria**:

  * Si el usuario tiene tickets sincronizados/fetch, los ve listados con QR/PDF.
  * Si no tiene, mostrar estado vacío con link a “¿Cómo conseguir entradas?” (configurable).
  * Sync manual refresca lista con toast de progreso.

### 3.4 Stands / Organización

* Grid de instituciones (institutos, carreras, programas, cursos, sponsors, otros).
* Card con logo, nombre, breve descripción, links.
* Detalle con imágenes/links ampliados.
* **Acc. Criteria**:

  * Puedo filtrar por tipo (chips). Puedo abrir el detalle.

### 3.5 Páginas personalizadas (menú "Más")

* CRUD de páginas desde Admin: título, slug, contenido por bloques:

  * Párrafo, Imagen, Link, Lista, Embed simple (YouTube/Maps/HTML seguro), Accordion, Grid de imágenes.
* Orden en menú “Más”, visibilidad (pública / requiere login).
* **Acc. Criteria**:

  * Al tocar **Más**, veo listado de páginas definidas y “Participar” (drawer si >5 páginas).
  * Al abrir una página, renderiza los bloques en orden.

### 3.6 Newsletter (email capture)

* Input simple en Home/Participar para dejar email + checkbox "Acepto términos" (link a página configurable).
* Persistencia mínima en DB o export CSV; V2: integración con proveedor (Resend/ConvertKit).
* **Acc. Criteria**: email válido, feedback de éxito, evitar duplicados.

---

## 4) Admin (MVP)

* **Permisos**: role `ADMIN` o `EDITOR` para backoffice.
* **Secciones**:

  * Dashboard: métricas básicas (#posts, #sesiones, #stands, #tickets sync, #newsletter subs).
  * Posts: listado, crear, editar, pin, (publicado/oculto).
  * Programa: días/salas/tracks, sesiones (flag "Plenaria", `materialsUrl`). Validar solapes por sala/horario.
  * Stands: CRUD con tipo, links, logo.
  * Páginas: CRUD, bloques, orden y visibilidad.
  * Entradas: read-only (lista tickets sync) + botón "Re-sync" (llama a /api/tickets/sync con payload simulado o batch fetch).
  * Newsletter: read-only (lista emails) + export CSV.
* **Acc. Criteria**:

  * Todo CRUD con formularios validados (zod) y toasts de feedback (sonner).
  * Listas con búsqueda y paginación simple.

---

## 5) API Contracts (JSON) – resumen

> Todas las rutas debajo de `/api/*`. Respuestas con `{ ok: boolean, data?, error: { message?: string }? }`.

### 5.1 Posts

* `GET /api/posts?kind&pin&page` → `{ data: Post[] }`
* `POST /api/posts` (admin) → crear post.
* `PATCH /api/posts/:id` (admin)

**Post**

```json
{
  "id": "string",
  "title": "string",
  "subtitle": "string|null",
  "kind": "TEXT_IMAGE|CAROUSEL|YOUTUBE|SPOTIFY|LINK",
  "text": "string|null",
  "medias": [{"url":"https://...","alt":""}],
  "youtubeId": "string|null",
  "spotifyId": "string|null",
  "linkUrl": "https://...",
  "linkLabel": "string|null",
  "pinned": true
}
```

### 5.2 Programa

* `GET /api/agenda?day=YYYY-MM-DD&track=&room=&q=` → `{ data: SessionLite[] }`
* `GET /api/sesiones/:id` → `{ data: SessionDetail }`

**SessionDetail**

```json
{
  "id":"s1",
  "title":"Apertura",
  "abstract":"...",
  "day":"2025-10-05",
  "track":"General",
  "room":"Auditorio",
  "startsAt":"2025-10-05T10:00:00Z",
  "endsAt":"2025-10-05T11:00:00Z",
  "isPlenary": true,
  "materialsUrl": "https://...",
  "speaker": { "name":"opcional", "title":"opcional", "avatarUrl":"opcional" }
}
```

### 5.3 Stands

* `GET /api/stands?type=` → `{ data: Stand[] }`
* `GET /api/stands/:id` → `{ data: Stand }`

### 5.4 Páginas personalizadas

* `GET /api/paginas` → `{ data: PageMeta[] }`
* `GET /api/paginas/:slug` → `{ data: PageDetail }`
* `POST /api/paginas` (admin)
* `PATCH /api/paginas/:id` (admin)

**PageDetail**

```json
{
  "id":"p1",
  "title":"Información",
  "slug":"informacion",
  "blocks":[
    {"type":"paragraph","text":"Bienvenidos..."},
    {"type":"image","url":"https://...","alt":""},
    {"type":"link","label":"Ver programa","url":"/programa"},
    {"type":"accordion","items":[...]},
    {"type":"grid","images":[...]}
  ],
  "visible":"PUBLIC|AUTH",
  "order": 10
}
```

### 5.5 Newsletter

* `POST /api/newsletter/subscribe` → body `{ email: string, termsAccepted: boolean }`

### 5.6 Tickets Fint

* `POST /api/tickets/sync` (webhook/cron, valida secret): body con payload Fint (ej. {ticket: {...}, purchase: {...}}), upsert por `externalId` (ticket.id).
* `GET /api/my/tickets` (autenticado): fetch por email de user a Fint API, mapear a Ticket[] (cache opcional en DB).

**Ticket** (mapeado de Fint response)

```json
{
  "id": "string",  // DB id
  "externalId": "string",  // ticket.id o purchase.reference
  "status": "string",  // ej. "paid"
  "qrUrl": "string|null",
  "pdfUrl": "string|null",
  "eventName": "string",  // purchase.eventPage.name
  "purchasedAt": "2025-09-01T12:00:00Z",  // purchase.createdAt
  "userEmail": "string",
  "firstName": "string|null",
  "lastName": "string|null",
  "amount": "string",
  "reference": "string"
}
```

---

## 6) UX y componentes clave

* **PostCard** (5 variantes), **SessionCard** (estado plenaria), **StandCard**, **TicketCard** (con QR/PDF viewer), **NewsletterInput**, **MapEmbed**, **PageRenderer** (bloques), **ErrorBoundary**.
* **Navegación**: 
  * **Mobile**: Bottom nav con 5 tabs (**Home**, **Programa**, **Entradas**, **Stands**, **Más**)
  * **Desktop**: Top nav horizontal con todas las opciones visibles
  * **Más**: Lista de páginas personalizadas (drawer con vaul en mobile)
* **Transiciones**: Suaves entre rutas via next-view-transitions ✅.
* **Estados vacíos**: Consistentes, con CTA y ilustraciones.
* **Cargas**: `Skeleton` por componente (ej. `SessionCard.Skeleton`) y transiciones sutiles.
* **Toasts**: sonner para feedback de acciones.

---

## 7) Seguridad y cumplimiento

* **RLS ON en todas las tablas**. Policies mínimas:

  * Lectura pública para contenidos públicos (posts, programa, stands, páginas `PUBLIC`).
  * Lectura/propiedad para datos del usuario (tickets por `user_id`).
  * Escritura de administración restringida a `role = 'ADMIN' | 'EDITOR'` (guardado en JWT o en tabla `profiles`). Filtrar por `tenant_id` en V1.1.
* **Validación** en backend con **zod** para endpoints y server actions.
* **Rate limiting** para Fint calls: cache en memoria + retry logic con backoff exponencial en lib/fint.ts.
* **CORS** restringido.
* **Sanitización** de embeds y QR/PDF URLs.

**Nota**: Para admin desde el frontend, usar **Service Role Key sólo en Edge Functions** o en rutas del backend (NUNCA en el cliente). FINT_API_KEY server-only.

---

## 8) Analítica (eventos sugeridos)

* `user_session_start`
* `feed_post_view`, `feed_link_click`
* `program_day_change`, `session_open`, `plenary_materials_open`
* `ticket_view`, `ticket_qr_show`, `ticket_pdf_download`
* `stand_open`, `stand_link_click`
* `page_open`
* `newsletter_subscribe`

---

## 9) Performance

* RSC + caching segmentado (ISR para feed y stands, `revalidate: 300`). `revalidateTag` al publicar desde admin. Para tickets: cache fetch en session (revalidatePath en sync).
* Imágenes con `next/image` donde aplique.
* Evitar JS extra en páginas informativas.
* PWA: Offline support via Serwist (cache assets, API responses); basic caching strategies.

---

## 10) Plan de entrega (MVP revisado)

**Semana 1**: Setup base (Drizzle ORM + Supabase), auth (magic link + Google), layout con navegación, deploy inicial.
**Semana 2**: Home/Feed (listar posts con 5 variantes) + Admin Posts. Seeding mock data.
**Semana 3**: Programa (lista por día + filtros) + Admin Programa (días/tracks/rooms/sesiones).
**Semana 4**: Detalle de sesión + Plenarias (con materiales) + Mapa embed básico.
**Semana 5**: Entradas Fint (GET /api/tickets con fetch real + cache) + Admin view tickets.
**Semana 6**: Stands (grid + detalle + filtros) + Admin Stands.
**Semana 7**: Páginas personalizadas (bloques CMS) + Admin Páginas + menú "Más".
**Semana 8**: Newsletter (capture + admin list/export) + Webhook Fint (POST /api/tickets/sync).
**Semana 9**: Tests críticos (Playwright), accesibilidad audit, analítica, optimizaciones, deploy final.

---

## 11) Variables de entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # sólo en server/edge

# Database (Drizzle)
DATABASE_URL=  # Supabase connection string

# Fint
FINT_API_BASE_URL=https://api.fint.app/api/v1
FINT_API_KEY=  # x-api-key para GET tickets
FINT_WEBHOOK_SECRET=  # Para validar POST /tickets/sync

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Sentry (opcional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# PWA
NEXT_PUBLIC_PWA_ENABLED=true
```

---

## 12) Criterios de aceptación (alto nivel - MVP)

1. Un usuario anónimo puede navegar Home, Programa, Stands, Páginas públicas.
2. Un usuario logueado puede ver sus **Entradas** (fetch real-time de Fint o sync DB).
3. Un organizador puede **crear/editar**: posts, programa (con plenarias y materiales), stands, páginas personalizadas; trigger re-sync tickets; ver newsletter subs.
4. El mapa es accesible desde Programa en todo momento.
5. El menú "Más" lista las páginas personalizadas creadas en el admin.
6. Newsletter captura y almacena emails sin duplicados y con validación.
7. App funciona offline (PWA basics: cache views, no API calls).
8. Transiciones entre tabs/rutas son suaves y animadas (next-view-transitions ✅).
9. Todo el código es type-safe con TypeScript + Drizzle ORM.

---

## 13) Snippets de referencia

### ViewTransitions en layout.tsx (✅ implementado)

```tsx
import { ViewTransitions } from 'next-view-transitions';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ViewTransitions>
  );
}
```

### Drizzle schema example

```ts
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  kind: text('kind').notNull(), // TEXT_IMAGE | CAROUSEL | YOUTUBE | SPOTIFY | LINK
  body: jsonb('body').$type<{ medias?: Array<{url: string, alt: string}>, youtubeId?: string }>(),
  pinned: boolean('pinned').default(false),
  published: boolean('published').default(true),
  tenantId: uuid('tenant_id').notNull().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Fetch tickets en lib/fint.ts (con retry logic)

```ts
export async function fetchTicketsByEmail(email: string, retries = 3): Promise<Ticket[]> {
  const url = `${process.env.FINT_API_BASE_URL}/event/ticket/email/${encodeURIComponent(email)}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'x-api-key': process.env.FINT_API_KEY! },
      next: { revalidate: 300 }, // Cache 5 min
    });
    
    if (response.status === 429 && retries > 0) {
      // Rate limit - retry con backoff
      await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries)));
      return fetchTicketsByEmail(email, retries - 1);
    }
    
    if (!response.ok) {
      throw new Error(`Fint API error: ${response.status}`);
    }
    
    const data: FintTicket[] = await response.json();
    return data.map(mapToTicket);
  } catch (error) {
    console.error('Fint fetch error:', error);
    throw error;
  }
}
```

### Server Action example con Drizzle

```ts
'use server'
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export async function createPost(data: CreatePostInput) {
  const validated = createPostSchema.parse(data);
  
  const [newPost] = await db.insert(posts).values(validated).returning();
  
  revalidatePath('/');
  return { ok: true, data: newPost };
}
```

---

## 14) Riesgos y mitigaciones

* **Embeds**: Limitar orígenes (YouTube/Spotify/Maps) y sanitizar HTML.
* **Tickets Fint**: 
  * Webhook → Route handler en `/api/tickets/sync` que upsertea por `external_id`
  * Guardar `raw_data` jsonb para trazabilidad
  * Test temprano en staging con ngrok/mock payloads
  * Fallback: fetch manual por emails registrados
  * Rate limiting: cache + retry con backoff exponencial
* **Multi-tenant**: Preparar `tenant_id` en schema Drizzle, pero no activar hasta V1.1.
* **PWA**: Verificar HTTPS en dev. Test offline en Chrome DevTools.
* **View Transitions**: ✅ Ya implementado con next-view-transitions. Fallback automático a navegación normal en browsers sin soporte.
* **Type Safety**: Drizzle ORM genera tipos automáticamente desde schema. Usar zod para validación de inputs.

---

## 15) Definiciones "Ready"

* ✅ Template nextjs-pwa clonado
* ✅ View Transitions integradas (next-view-transitions)
* ✅ Build inicial exitoso
* 🔄 Diseño de UI base acordado
* 🔄 Copys iniciales para estados vacíos y CTAs
* 🔄 **Proyecto Supabase creado**, RLS habilitado, buckets creados
* 🔄 Drizzle ORM configurado con schema inicial
* 🔄 Tablas migradas con drizzle-kit. Mock data seeded
* 🔄 Endpoint de Fint (webhook configurado en dashboard Fint a /api/tickets/sync; API key testeado)

---

## Anexo A — Schema Drizzle + RLS (Supabase)

> **Nota**: Usar Drizzle ORM para definir el schema. Las tablas se crean con `drizzle-kit push` o migrations. RLS se configura manualmente en Supabase después de crear las tablas. Incluye `tenant_id` para V1.1. **Encuestas y Q&A removidas del MVP** (quedan para V1.1).

```sql
-- Perfiles con rol
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,  -- Para Fint fetch
  role text default 'USER' check (role in ('USER','EDITOR','ADMIN')),
  tenant_id uuid default gen_random_uuid(),  -- Para multi-tenant
  created_at timestamptz default now()
);

-- Helper: current user's role
create or replace function public.current_role() returns text language sql stable as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'USER');
$$;

-- POSTS
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  kind text not null check (kind in ('TEXT_IMAGE','CAROUSEL','YOUTUBE','SPOTIFY','LINK')),
  body jsonb default '{}'::jsonb, -- medias, ids, urls
  pinned boolean default false,
  published boolean default true,
  tenant_id uuid default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table public.posts enable row level security;
create policy "posts_read_public" on public.posts for select using (published = true);
create policy "posts_write_admin" on public.posts for all using (public.current_role() in ('ADMIN','EDITOR')); 

-- EVENT DAYS
create table public.event_days (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  position int default 0,
  tenant_id uuid default gen_random_uuid()
);
alter table public.event_days enable row level security;
create policy "days_read" on public.event_days for select using (true);
create policy "days_write_admin" on public.event_days for all using (public.current_role() in ('ADMIN','EDITOR'));

-- ROOMS
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references public.event_days(id) on delete cascade,
  name text not null,
  tenant_id uuid default gen_random_uuid()
);
alter table public.rooms enable row level security;
create policy "rooms_read" on public.rooms for select using (true);
create policy "rooms_write_admin" on public.rooms for all using (public.current_role() in ('ADMIN','EDITOR'));

-- TRACKS
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tenant_id uuid default gen_random_uuid()
);
alter table public.tracks enable row level security;
create policy "tracks_read" on public.tracks for select using (true);
create policy "tracks_write_admin" on public.tracks for all using (public.current_role() in ('ADMIN','EDITOR'));

-- SESSIONS
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  abstract text,
  day_id uuid references public.event_days(id) on delete cascade,
  track_id uuid references public.tracks(id),
  room_id uuid references public.rooms(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_plenary boolean default false,
  materials_url text,
  speaker jsonb,  -- {name, title, avatarUrl}
  tenant_id uuid default gen_random_uuid(),
  created_at timestamptz default now()
);
alter table public.sessions enable row level security;
create policy "sessions_read" on public.sessions for select using (true);
create policy "sessions_write_admin" on public.sessions for all using (public.current_role() in ('ADMIN','EDITOR'));

-- STANDS
create table public.stands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,  -- instituto, carrera, etc.
  description text,
  logo_url text,
  links jsonb,  -- [{label, url}]
  tenant_id uuid default gen_random_uuid()
);
alter table public.stands enable row level security;
create policy "stands_read" on public.stands for select using (true);
create policy "stands_write_admin" on public.stands for all using (public.current_role() in ('ADMIN','EDITOR'));

-- PAGES
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  blocks jsonb not null,
  visible text default 'PUBLIC' check (visible in ('PUBLIC','AUTH')),
  order int default 0,
  tenant_id uuid default gen_random_uuid()
);
alter table public.pages enable row level security;
create policy "pages_read" on public.pages for select using (visible = 'PUBLIC' or auth.role() = 'authenticated');
create policy "pages_write_admin" on public.pages for all using (public.current_role() in ('ADMIN','EDITOR'));

-- NEWSLETTER SUBS
create table public.newsletter_subs (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  terms_accepted boolean not null,
  created_at timestamptz default now()
);
alter table public.newsletter_subs enable row level security;
create policy "subs_insert" on public.newsletter_subs for insert using (true);
create policy "subs_read_admin" on public.newsletter_subs for select using (public.current_role() in ('ADMIN','EDITOR'));

-- TICKETS (ajustado para Fint)
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,  -- ticket.id de Fint
  status text not null,  -- ej. "paid", "cancelled"
  qr_url text,
  pdf_url text,
  event_name text,  -- purchase.eventPage.name
  purchased_at timestamptz,
  user_email text not null,
  first_name text,
  last_name text,
  amount text,
  reference text,
  user_id uuid references auth.users(id),
  raw_data jsonb,  -- Full Fint payload para trazabilidad
  tenant_id uuid default gen_random_uuid()
);
alter table public.tickets enable row level security;
create policy "my_tickets_read" on public.tickets for select using (user_id = auth.uid());
create policy "tickets_admin" on public.tickets for all using (public.current_role() in ('ADMIN','EDITOR'));
```