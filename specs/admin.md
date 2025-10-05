# Admin Panel – Especificación técnica

> **Contexto**: Panel de administración (backoffice) para organizadores de conferencias/eventos. Permite gestionar todo el contenido de la app mediante un **sistema flexible de páginas con módulos**. **Permisos**: Requiere rol `ADMIN` o `EDITOR` en tabla `profiles`.

---

## 1) Concepto: Navegación Dinámica

### Filosofía: "Todo es una Página"

En vez de tener secciones hardcodeadas (Home, Programa, Entradas, etc.), el admin **crea páginas** y asigna un **tipo de módulo** a cada una:

```
Página (entity base):
  - Título, Slug, Orden, Visibilidad
  ↓
Tipo de Módulo:
  - FEED: Módulo de posts/noticias
  - PROGRAMA: Agenda con días/sesiones/filtros
  - ENTRADAS: Tickets de Fint con QR/PDF
  - STANDS: Grid de instituciones
  - CUSTOM: Bloques CMS libres (párrafos, imágenes, etc.)
```

**Ventajas**:
- ✅ Total flexibilidad: cada evento decide qué mostrar y en qué orden
- ✅ Activar/desactivar features sin código (ocultar Entradas si no uso Fint)
- ✅ Navegación se genera dinámicamente desde BD
- ✅ Multi-evento ready: cada tenant puede tener estructura diferente
- ✅ View-transitions funcionan igual (rutas: `/${page.slug}`)

---

## 2) Alcance del Admin (MVP)

### Secciones principales

1. **Dashboard**: Métricas básicas y resumen general
2. **Páginas**: Crear/gestionar páginas con módulos (FEED, PROGRAMA, ENTRADAS, STANDS, CUSTOM)
3. **Contenido por Módulo**:
   - **Posts** (para páginas tipo FEED)
   - **Programa** (días, tracks, salas, sesiones - para páginas tipo PROGRAMA)
   - **Stands** (instituciones - para páginas tipo STANDS)
   - **Entradas** (vista read-only + re-sync - para páginas tipo ENTRADAS)
4. **Newsletter**: Lista de suscriptores + export CSV

---

## 3) Estructura de rutas

### Admin (backoffice)

```
app/
  (admin)/
    layout.tsx              # Layout admin con sidebar/topbar
    dashboard/page.tsx      # Métricas básicas

    # Gestión de PÁGINAS (núcleo del sistema)
    paginas/
      page.tsx              # Lista de páginas con su tipo de módulo
      new/page.tsx          # Crear página (elegir tipo de módulo primero)
      [id]/page.tsx         # Editar página (formulario condicional según tipo)

    # Gestión de CONTENIDO por módulo
    posts/
      page.tsx              # Lista de posts (para módulos FEED)
      new/page.tsx          # Crear post
      [id]/page.tsx         # Editar post
    programa/
      page.tsx              # Gestión unificada: días, tracks, salas, sesiones
      sesiones/new/page.tsx # Crear sesión
      sesiones/[id]/page.tsx # Editar sesión
    stands/
      page.tsx              # Lista de stands (para módulos STANDS)
      new/page.tsx          # Crear stand
      [id]/page.tsx         # Editar stand
    entradas/page.tsx       # Vista read-only + re-sync (para módulos ENTRADAS)

    newsletter/page.tsx     # Lista emails + export CSV
```

### App pública (frontend dinámico)

```
app/
  (app)/
    layout.tsx              # Layout con navegación DINÁMICA
    [slug]/page.tsx         # Ruta dinámica que renderiza módulo según page.type
```

**Ejemplo de flujo**:
1. Admin crea página: `{ title: "Programa", slug: "programa", type: "PROGRAMA", order: 2 }`
2. Frontend consulta páginas visibles → genera nav
3. Usuario visita `/programa` → `[slug]/page.tsx` detecta `type: PROGRAMA` → renderiza componente `<ProgramaModule />`

---

## 4) Funcionalidades por sección

### 4.1 Dashboard

**Objetivo**: Vista rápida del estado del evento

**Métricas a mostrar**:
- Total de posts (publicados/borradores)
- Total de sesiones
- Total de stands
- Total de tickets sincronizados
- Total de suscriptores newsletter
- Última sincronización de tickets (timestamp)

**Acc. Criteria**:
- Métricas se actualizan en tiempo real o con revalidación corta
- Cards con números destacados y pequeño gráfico de tendencia (opcional V2)
- Links rápidos a cada sección

---

### 4.2 Páginas (núcleo del sistema)

**Objetivo**: Crear y gestionar páginas con diferentes tipos de módulos

**Flujo de creación**:

1. **Elegir tipo de módulo** (paso 1):
   - `FEED`: Página con lista de posts/noticias
   - `PROGRAMA`: Página con agenda (días, sesiones, filtros)
   - `ENTRADAS`: Página con tickets de Fint (QR/PDF)
   - `STANDS`: Página con grid de instituciones
   - `CUSTOM`: Página con bloques CMS libres

2. **Configurar página** (paso 2):
   - Título (ej: "Programa del Evento")
   - Slug (auto-generado, editable - ej: "programa")
   - Icono (select de lucide-react icons para la navegación)
   - Visibilidad (PUBLIC | AUTH)
   - Orden (número para posición en navegación)
   - **Configuración específica del módulo** (condicional por tipo):
     - Si `CUSTOM`: Editor de bloques
     - Si `FEED`: Configuración de filtros (mostrar pinned primero, cantidad por página, etc.)
     - Si `PROGRAMA`: Configuración de vista por defecto (por día, por track, etc.)
     - Resto de módulos: sin config adicional

**Vista de lista** (tabla principal):
- Columnas: Icono, Título, Slug, Tipo de Módulo, Orden, Visibilidad, Acciones
- Badge visual por tipo (FEED=azul, PROGRAMA=verde, ENTRADAS=amarillo, STANDS=morado, CUSTOM=gris)
- Drag & drop para reordenar (actualiza campo `order`)
- Búsqueda por título
- Filtro por tipo y visibilidad
- Toggle rápido de visibilidad (show/hide) sin entrar al editor

**Validaciones**:
- Título requerido
- Slug único y válido (lowercase, guiones, sin espacios, sin caracteres especiales)
- Solo puede haber **una página de cada tipo de módulo** (FEED, PROGRAMA, ENTRADAS, STANDS) activa
  - Excepción: CUSTOM permite múltiples páginas
- Orden debe ser único (auto-ajustar si hay conflicto)

**Acc. Criteria**:
- Puedo crear página eligiendo primero el tipo de módulo
- Formulario cambia dinámicamente según tipo elegido
- Puedo reordenar páginas con drag & drop
- Slug se auto-genera pero es editable
- Preview de cómo se verá la navegación con las páginas actuales
- Al guardar, revalida navegación de la app pública
- Validación clara si intento crear segunda página de mismo tipo de módulo

**Ejemplo de setup típico**:
```
1. Home (FEED) - slug: "/" - orden: 1
2. Programa (PROGRAMA) - slug: "programa" - orden: 2
3. Stands (STANDS) - slug: "stands" - orden: 3
4. Entradas (ENTRADAS) - slug: "entradas" - orden: 4
5. Información (CUSTOM) - slug: "info" - orden: 5
6. FAQ (CUSTOM) - slug: "faq" - orden: 6
```

---

### 4.3 Posts (contenido para módulo FEED)

**Objetivo**: Gestionar contenido del feed principal

**Tipos de post soportados**:
1. `TEXT_IMAGE`: Texto + imagen única
2. `CAROUSEL`: Carrusel de imágenes
3. `YOUTUBE`: Embed de YouTube
4. `SPOTIFY`: Embed de Spotify
5. `LINK`: Link pill con CTA

**Campos del formulario**:
- Título (required, max 100 chars)
- Subtítulo (optional, max 200 chars)
- Tipo de post (select: TEXT_IMAGE | CAROUSEL | YOUTUBE | SPOTIFY | LINK)
- **Condicionales por tipo**:
  - `TEXT_IMAGE`: textarea texto + upload imagen
  - `CAROUSEL`: multi-upload imágenes (mín 2, máx 10)
  - `YOUTUBE`: input YouTube ID o URL (extraer ID automáticamente)
  - `SPOTIFY`: input Spotify ID o URL embed
  - `LINK`: URL destino + label CTA + imagen/icono opcional
- Pinned (checkbox: aparece destacado arriba del feed)
- Publicado (checkbox: visible en app o borrador)

**Vista de lista**:
- Tabla con columnas: Thumbnail, Título, Tipo, Estado (Publicado/Borrador), Pinned, Fecha creación, Acciones
- Búsqueda por título
- Filtros: Tipo, Estado (publicado/borrador), Pinned
- Ordenar por: Fecha (desc/asc), Título
- Paginación (20 items por página)

**Validaciones** (zod):
- Título requerido
- Si tipo = YOUTUBE: validar formato YouTube ID/URL
- Si tipo = SPOTIFY: validar formato Spotify embed URL
- Si tipo = LINK: URL válida requerida
- Si tipo = CAROUSEL: mínimo 2 imágenes

**Acc. Criteria**:
- Puedo crear, editar y eliminar posts
- Preview en tiempo real del post según tipo
- Upload de imágenes a Supabase Storage (bucket `public`)
- Toast de confirmación al guardar/eliminar
- Revalidación automática de `/` al publicar/editar

---

### 4.4 Programa (contenido para módulo PROGRAMA)

**Objetivo**: Organizar la agenda del evento por días, tracks y salas

#### 4.4.1 Gestión de Días

**Campos**:
- Fecha (date picker)
- Posición/orden (number, para ordenar tabs en app)

**Vista**:
- Lista simple ordenada por posición
- CRUD inline o modal
- Máximo 3 días (validación soft, warning si >3)

#### 4.4.2 Gestión de Tracks

**Campos**:
- Nombre (ej: "General", "Tecnología", "Negocios")

**Vista**:
- Lista simple con CRUD inline

#### 4.4.3 Gestión de Salas/Rooms

**Campos**:
- Nombre (ej: "Auditorio", "Sala A")
- Día asociado (select de días creados)

**Vista**:
- Agrupadas por día
- CRUD inline

#### 4.4.4 Gestión de Sesiones

**Campos del formulario**:
- Título (required, max 150 chars)
- Abstract/Descripción (textarea, max 500 chars)
- Día (select)
- Track (select, opcional)
- Sala (select, filtrada por día seleccionado)
- Hora inicio (datetime)
- Hora fin (datetime)
- **Es Plenaria** (checkbox)
  - Si es plenaria: mostrar campo "URL Materiales" (opcional)
- Orador (opcional):
  - Nombre
  - Título/Cargo
  - Avatar URL (upload o URL)

**Vista de lista**:
- Tabla con: Título, Día, Hora, Sala, Track, Es Plenaria, Acciones
- Filtros: Día, Track, Sala, Solo Plenarias
- Búsqueda por título
- Ordenar por: Hora inicio, Título

**Validaciones** (zod):
- Hora fin > Hora inicio
- **Warning si solapa** con otra sesión en misma sala/horario (validación al guardar):
  - Mostrar modal: "La sesión solapa con [Título sesión] en [Sala] de [hora] a [hora]. ¿Continuar?"
  - Permitir guardar pero con warning visual en lista

**Acc. Criteria**:
- Puedo crear/editar/eliminar sesiones
- Detecto solapes automáticamente y muestro warning
- Las plenarias tienen badge visual distintivo
- Vista calendario/timeline opcional (V2)
- Revalidación de `/programa` al guardar

---

### 4.5 Stands (contenido para módulo STANDS)

**Objetivo**: Gestionar instituciones/organizaciones participantes

**Tipos de stand**:
- Instituto
- Carrera
- Programa
- Curso
- Sponsor
- Otro

**Campos del formulario**:
- Nombre (required, max 100 chars)
- Tipo (select de tipos arriba)
- Descripción breve (textarea, max 300 chars)
- Logo (upload imagen)
- Links (array dinámico):
  - Label (ej: "Sitio web", "Instagram")
  - URL

**Vista de lista**:
- Grid de cards con logo, nombre, tipo
- Filtros por tipo
- Búsqueda por nombre
- Ordenar por: Nombre, Fecha creación

**Validaciones**:
- Nombre requerido
- Al menos 1 link (opcional pero recomendado)
- URLs válidas

**Acc. Criteria**:
- CRUD completo
- Preview del card como se verá en app
- Upload de logos a Supabase Storage
- Revalidación de `/stands` al guardar

---

### 4.6 Bloques CMS (para páginas tipo CUSTOM)

**Objetivo**: Editor de bloques para páginas personalizadas e informativas

**Contexto**: Solo aplica a páginas con `type: CUSTOM`. Permite crear páginas ricas con múltiples tipos de contenido.

#### Tipos de bloques disponibles:

1. **Párrafo**
   - Texto (rich text simple: negrita, cursiva, links)

2. **Imagen**
   - URL imagen (upload)
   - Alt text
   - Caption (opcional)

3. **Link/Button**
   - Label
   - URL (puede ser interna `/programa` o externa)
   - Estilo (primary/secondary)

4. **Lista**
   - Tipo (bullets/números)
   - Items (array de textos)

5. **Accordion**
   - Items (array):
     - Título
     - Contenido (texto)

6. **Grid de imágenes**
   - Columnas (2/3/4)
   - Imágenes (array):
     - URL
     - Alt text

7. **Embed** (YouTube/Maps)
   - Tipo (youtube/maps)
   - URL/ID
   - Alto (opcional)

**Editor de bloques**:
- Drag & drop para reordenar bloques
- Botón "Agregar bloque" con select de tipo
- Preview live del bloque al editar
- Botón eliminar por bloque

**Validaciones**:
- Al menos 1 bloque en páginas tipo CUSTOM
- Embeds: solo orígenes permitidos (YouTube, Google Maps)

**Acc. Criteria**:
- Editor de bloques intuitivo con drag & drop
- Preview live mientras edito
- Al guardar página CUSTOM, revalida su ruta dinámica

---

### 4.7 Entradas (vista admin para módulo ENTRADAS)

**Objetivo**: Vista read-only de tickets sincronizados + control de sync

**Vista principal**:
- Tabla con: Email usuario, Nombre, Evento, Estado, Fecha compra, Reference
- Búsqueda por email o reference
- Filtro por estado (paid, cancelled, etc.)
- Ordenar por fecha compra (desc)
- Paginación

**Acciones**:
- **Botón "Re-sync Tickets"**:
  - Llama a `/api/tickets/sync` (POST) con payload simulado o trigger batch fetch
  - Muestra toast con progreso
  - Actualiza tabla al completar
- **Ver detalle** (modal): Muestra QR, PDF, raw_data JSON

**Información mostrada**:
- Total de tickets sincronizados
- Última sincronización (timestamp)
- Breakdown por estado (X pagados, Y cancelados, etc.)

**Acc. Criteria**:
- Solo lectura (no editar/eliminar manualmente)
- Re-sync funciona correctamente y muestra feedback
- Puedo ver raw_data de Fint para debug

---

### 4.8 Newsletter

**Objetivo**: Gestionar suscriptores del newsletter

**Vista principal**:
- Tabla: Email, Aceptó términos, Fecha suscripción
- Búsqueda por email
- Ordenar por fecha (desc/asc)
- Paginación

**Acciones**:
- **Export CSV**: Botón que genera y descarga CSV con todos los emails
- **Eliminar suscriptor** (opcional, con confirmación)

**Información mostrada**:
- Total de suscriptores
- Nuevos suscriptores últimos 7 días (opcional)

**Acc. Criteria**:
- Solo lectura (suscripciones se hacen desde la app pública)
- Export CSV funciona y genera archivo válido
- Opcional: integración con proveedor de email (V2)

---

## 5) Navegación Dinámica en App Pública

### Cómo funciona

**1. Componente de navegación consulta páginas activas:**

```typescript
// components/app-navigation.tsx
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function AppNavigation() {
  const activePages = await db.query.pages.findMany({
    where: eq(pages.visible, true),
    orderBy: pages.order
  });

  return (
    <nav>
      {activePages.map(page => (
        <Link
          key={page.id}
          href={`/${page.slug}`}
          className="nav-item"
        >
          <Icon name={page.icon} />
          <span>{page.title}</span>
        </Link>
      ))}
    </nav>
  );
}
```

**2. Ruta dinámica renderiza módulo según tipo:**

```typescript
// app/(app)/[slug]/page.tsx
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

// Módulos
import FeedModule from '@/components/modules/feed';
import ProgramaModule from '@/components/modules/programa';
import EntradasModule from '@/components/modules/entradas';
import StandsModule from '@/components/modules/stands';
import CustomModule from '@/components/modules/custom';

export default async function DynamicPage({
  params
}: {
  params: { slug: string }
}) {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, params.slug)
  });

  if (!page) notFound();

  // Renderizar módulo según tipo
  switch (page.type) {
    case 'FEED':
      return <FeedModule page={page} />;
    case 'PROGRAMA':
      return <ProgramaModule page={page} />;
    case 'ENTRADAS':
      return <EntradasModule page={page} />;
    case 'STANDS':
      return <StandsModule page={page} />;
    case 'CUSTOM':
      return <CustomModule page={page} />;
    default:
      notFound();
  }
}
```

**3. Generación estática de rutas:**

```typescript
// app/(app)/[slug]/page.tsx
export async function generateStaticParams() {
  const activePages = await db.query.pages.findMany({
    where: eq(pages.visible, true)
  });

  return activePages.map(page => ({
    slug: page.slug
  }));
}
```

---

## 6) Layout y Navegación del Admin

### Layout Desktop

```
┌─────────────────────────────────────────────────┐
│  TopBar: Logo + Título Admin + User Menu        │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │  Content Area                        │
│          │                                       │
│ • Dash   │  [Página actual]                     │
│ • Posts  │                                       │
│ • Prog   │                                       │
│ • Stands │                                       │
│ • Págs   │                                       │
│ • Ticket │                                       │
│ • News   │                                       │
│          │                                       │
│ [Logout] │                                       │
└──────────┴──────────────────────────────────────┘
```

### Layout Mobile

- **TopBar** fijo con título sección + menu hamburger
- **Sidebar** como drawer (vaul) al tocar hamburger
- Content area ocupa full width

### Componentes de navegación

- **Sidebar**: Lista de links con iconos (lucide-react)
  - Dashboard (LayoutDashboard)
  - Páginas (Layout) ← **núcleo del sistema**
  - Posts (FileText)
  - Programa (Calendar)
  - Stands (Building2)
  - Entradas (Ticket)
  - Newsletter (Mail)
- **User Menu** (dropdown en TopBar):
  - Nombre + email del admin
  - "Ver app" → link a `/` (app pública, primera página visible)
  - "Configuración" (V2)
  - "Cerrar sesión"

---

## 7) Schema de BD (actualizado con páginas dinámicas)

### Tabla `pages` (actualizada)

```sql
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null check (type in ('FEED','PROGRAMA','ENTRADAS','STANDS','CUSTOM')),
  icon text not null,  -- Nombre del icono de lucide-react (ej: 'Home', 'Calendar')
  visible boolean default true,  -- PUBLIC en spec anterior (simplificado a boolean)
  "order" int not null unique,
  config jsonb default '{}'::jsonb,  -- Configuración específica por tipo de módulo
  blocks jsonb,  -- Solo para type=CUSTOM (array de bloques)
  tenant_id uuid default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.pages enable row level security;

-- Lectura pública de páginas visibles
create policy "pages_read_public" on public.pages
  for select using (visible = true);

-- Admins pueden todo
create policy "pages_write_admin" on public.pages
  for all using (public.current_role() in ('ADMIN','EDITOR'));

-- Índices
create index idx_pages_visible on public.pages(visible);
create index idx_pages_order on public.pages("order");
create index idx_pages_type on public.pages(type);

-- Constraint: solo una página de cada tipo (excepto CUSTOM)
create unique index idx_pages_unique_type
  on public.pages(type)
  where type != 'CUSTOM' and visible = true;
```

### Otras tablas (sin cambios)

Las tablas de `posts`, `sessions`, `stands`, `tickets`, `newsletter_subs` se mantienen igual (ver spec general.md).

---

## 8) Permisos y Roles

### Roles soportados

- `USER`: Solo acceso a app pública
- `EDITOR`: Acceso a admin (puede crear/editar contenido)
- `ADMIN`: Acceso total (incluye eliminar y gestionar otros admins - V2)

### Implementación

```typescript
// En middleware o layout admin
const user = await getCurrentUser();
const profile = await db.query.profiles.findFirst({
  where: eq(profiles.id, user.id)
});

if (!profile || !['ADMIN', 'EDITOR'].includes(profile.role)) {
  redirect('/login?error=unauthorized');
}
```

### RLS Policies (Supabase)

Todas las tablas de contenido tienen policy:
```sql
create policy "content_write_admin" on public.[table]
  for all using (public.current_role() in ('ADMIN','EDITOR'));
```

---

## 9) Validaciones y Reglas de Negocio

### Validaciones con Zod

Cada entidad tiene schema en `lib/validators/`:

**Ejemplo: `lib/validators/post.ts`**

```typescript
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  kind: z.enum(['TEXT_IMAGE', 'CAROUSEL', 'YOUTUBE', 'SPOTIFY', 'LINK']),
  body: z.object({
    text: z.string().optional(),
    medias: z.array(z.object({
      url: z.string().url(),
      alt: z.string()
    })).optional(),
    youtubeId: z.string().optional(),
    spotifyId: z.string().optional(),
    linkUrl: z.string().url().optional(),
    linkLabel: z.string().optional()
  }),
  pinned: z.boolean().default(false),
  published: z.boolean().default(true)
}).refine((data) => {
  // Validaciones condicionales según tipo
  if (data.kind === 'YOUTUBE' && !data.body.youtubeId) {
    return false;
  }
  if (data.kind === 'CAROUSEL' && (!data.body.medias || data.body.medias.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Invalid post body for selected type"
});
```

### Reglas de negocio

1. **Páginas** (NUEVO):
   - Solo puede haber **una página activa por tipo** de módulo (excepto CUSTOM que permite múltiples)
   - Slug único y válido (regex: `^[a-z0-9-]+$`)
   - Orden único (auto-ajustar si hay conflicto)
   - Al cambiar visibilidad/orden, revalidar navegación de app pública
   - Validación en backend: no permitir crear segunda página FEED/PROGRAMA/ENTRADAS/STANDS si ya existe una visible

2. **Posts**:
   - Solo 1 post puede estar pinned a la vez (opcional: auto-unpin otros al pin nuevo)
   - Borradores no son visibles en app pública
   - Solo aplican a páginas tipo FEED

3. **Sesiones**:
   - Warning (no error) si solapa con otra en misma sala
   - Plenarias siempre destacadas visualmente en app
   - Solo aplican a páginas tipo PROGRAMA

4. **Stands**:
   - Solo aplican a páginas tipo STANDS

5. **Tickets**:
   - No editar/eliminar manualmente (solo via sync)
   - Re-sync: upsert por `external_id` (no duplicar)
   - Solo se muestran si existe página tipo ENTRADAS visible

---

## 10) Upload de archivos

### Supabase Storage

**Bucket**: `public` (accesible sin auth para lectura)

**Estructura de carpetas**:
```
public/
  posts/
    {postId}/
      image-1.jpg
      image-2.jpg
  stands/
    {standId}/
      logo.png
  pages/
    {pageId}/
      block-1.jpg
  speakers/
    {speakerId}/
      avatar.jpg
```

### Implementación

**Helper `lib/storage.ts`**:

```typescript
import { createBrowserClient } from '@/lib/auth';

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
```

**Uso en formulario**:

```typescript
// En componente de upload
const handleUpload = async (file: File) => {
  const path = `posts/${postId}/${file.name}`;
  const url = await uploadFile('public', path, file);
  // Guardar url en estado del formulario
};
```

---

## 11) Server Actions

Todas las mutaciones usan server actions en vez de API routes (donde sea posible).

**Ejemplo: `app/(admin)/posts/actions.ts`**

```typescript
'use server'

import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { createPostSchema } from '@/lib/validators/post';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-server';
import { eq } from 'drizzle-orm';

export async function createPost(formData: FormData) {
  // 1. Verificar permisos
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: { message: 'Unauthorized' } };
  }

  // 2. Validar input
  const rawData = Object.fromEntries(formData);
  const validated = createPostSchema.safeParse(rawData);

  if (!validated.success) {
    return { ok: false, error: { message: validated.error.message } };
  }

  // 3. Insertar en DB
  try {
    const [newPost] = await db.insert(posts)
      .values(validated.data)
      .returning();

    // 4. Revalidar cache
    revalidatePath('/');
    revalidatePath('/admin/posts');

    return { ok: true, data: newPost };
  } catch (error) {
    return { ok: false, error: { message: 'Failed to create post' } };
  }
}

export async function updatePost(id: string, formData: FormData) {
  // Similar a createPost pero con update
}

export async function deletePost(id: string) {
  // Verificar permisos + delete + revalidate
}
```

---

## 12) UI/UX Guidelines

### Componentes shadcn/ui a usar

- `<Button>`: Acciones primarias/secundarias
- `<Input>`, `<Textarea>`: Formularios
- `<Select>`: Dropdowns
- `<Checkbox>`, `<Switch>`: Toggles
- `<Table>`: Listas tabulares
- `<Dialog>`: Modals de confirmación
- `<Drawer>`: Sidebar mobile
- `<Tabs>`: Navegación dentro de sección (ej: Días/Tracks/Salas en Programa)
- `<Badge>`: Estados (Publicado, Borrador, Plenaria)
- `<Skeleton>`: Loading states
- `<toast>` (sonner): Feedback de acciones

### Feedback de acciones

- **Success**: Toast verde con mensaje claro ("Post creado exitosamente")
- **Error**: Toast rojo con mensaje de error
- **Loading**: Botón disabled con spinner + texto "Guardando..."
- **Confirmaciones**: Dialog para acciones destructivas (eliminar)

### Responsive

- Desktop (≥1024px): Sidebar fijo + content area
- Tablet (768-1023px): Sidebar colapsable
- Mobile (<768px): Sidebar como drawer + topbar con hamburger

### Dark mode

- Soportar dark mode via Tailwind (`dark:` classes)
- Toggle en user menu (V2)

---

## 13) Testing (Admin)

### Tests críticos (Playwright)

1. **Auth flow**:
   - Login como ADMIN → acceso permitido
   - Login como USER → redirect a app
   - Sin login → redirect a /login

2. **Páginas (NUEVO - CRÍTICO)**:
   - Crear página tipo FEED → aparece en lista admin
   - Crear página tipo PROGRAMA → aparece en navegación de app pública
   - Reordenar páginas → orden se actualiza en navegación
   - Ocultar página → desaparece de navegación
   - Intentar crear segunda página FEED → error de validación
   - Crear múltiples páginas CUSTOM → permitido

3. **Posts CRUD**:
   - Crear post TEXT_IMAGE → aparece en lista
   - Editar post → cambios se guardan
   - Pin post → aparece destacado en app
   - Eliminar post → desaparece de lista

4. **Sesiones**:
   - Crear sesión → aparece en programa
   - Solape de horarios → warning visible
   - Marcar como plenaria → badge visible

5. **Upload de imágenes**:
   - Upload logo stand → URL válida guardada
   - Preview de imagen visible

6. **Navegación dinámica**:
   - Crear página "Programa" → ruta `/programa` accesible
   - Visitar `/programa` → renderiza módulo PROGRAMA correctamente
   - Cambiar slug de página → redirect funciona

---

## 14) Métricas y Analytics (Admin)

### Eventos custom a trackear

- `admin_page_created` (con tipo de módulo)
- `admin_page_reordered`
- `admin_page_visibility_toggled`
- `admin_post_created`
- `admin_post_published`
- `admin_session_created`
- `admin_overlap_warning_shown`
- `admin_tickets_resynced`
- `admin_newsletter_exported`

### Implementación

```typescript
import { track } from '@vercel/analytics';

// Al crear post
track('admin_post_created', {
  postType: post.kind,
  published: post.published
});
```

---

## 15) Roadmap Admin (Post-MVP)

### V1.1

- **Multi-tenant**: Filtrado por `tenant_id` en todas las queries
- **Gestión de usuarios**: CRUD de admins/editores
- **Configuración del evento**: Nombre, logo, colores, redes sociales
- **Encuestas**: CRUD de encuestas con resultados
- **Q&A**: Moderación de preguntas para sesiones

### V2

- **Calendario visual** para sesiones (drag & drop)
- **Rich text editor** mejorado (TipTap o similar)
- **Notificaciones push**: Enviar notificaciones a usuarios de la app
- **Reportes**: Gráficos de engagement, asistencia, etc.
- **Integración email**: Enviar newsletters desde admin (Resend/ConvertKit)

---

## 16) Criterios de Aceptación (Admin MVP)

### Sistema de Páginas (NUEVO - CRÍTICO)

1. ✅ Puedo crear páginas eligiendo tipo de módulo (FEED, PROGRAMA, ENTRADAS, STANDS, CUSTOM)
2. ✅ Solo puedo tener una página activa por tipo (excepto CUSTOM)
3. ✅ Puedo reordenar páginas con drag & drop
4. ✅ Al cambiar visibilidad/orden, la navegación de la app se actualiza automáticamente
5. ✅ Slug se auto-genera pero es editable con validación
6. ✅ Preview de navegación muestra cómo se verá en la app

### Contenido por Módulo

7. ✅ Solo usuarios con rol `ADMIN` o `EDITOR` pueden acceder
8. ✅ Dashboard muestra métricas actualizadas en tiempo real
9. ✅ Puedo crear, editar, eliminar y buscar posts de los 5 tipos (para módulo FEED)
10. ✅ Puedo gestionar días, tracks, salas y sesiones del programa (para módulo PROGRAMA)
11. ✅ Detección de solapes en sesiones con warning visual
12. ✅ Puedo crear/editar stands con upload de logos (para módulo STANDS)
13. ✅ Puedo crear bloques CMS con drag & drop (para páginas tipo CUSTOM)
14. ✅ Vista read-only de tickets con botón re-sync funcional (módulo ENTRADAS)
15. ✅ Lista de suscriptores newsletter con export CSV

### UX General

16. ✅ Todos los formularios validan con zod y muestran errores claros
17. ✅ Feedback inmediato con toasts en todas las acciones
18. ✅ Responsive en mobile/tablet/desktop
19. ✅ Upload de imágenes a Supabase Storage funciona correctamente

### App Pública

20. ✅ Navegación se genera dinámicamente desde páginas visibles
21. ✅ Ruta `/${slug}` renderiza módulo correcto según tipo de página
22. ✅ View-transitions funcionan entre páginas dinámicas
23. ✅ Si no hay página tipo FEED visible, la primera página visible es la home

---

## 17) Referencias de código

### Estructura típica de página admin

```typescript
// app/(admin)/posts/page.tsx
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import PostsTable from './posts-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PostsPage() {
  const allPosts = await db.select().from(posts).orderBy(posts.createdAt);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/new">Crear Post</Link>
        </Button>
      </div>

      <PostsTable data={allPosts} />
    </div>
  );
}
```

### Server action típico

```typescript
'use server'
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath('/admin/posts');
  revalidatePath('/');
  return { ok: true };
}
```

---

**Última actualización**: 2025-10-05
