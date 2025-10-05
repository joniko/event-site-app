# Especificación de Componentes de Posts

Documento de referencia para diseñar e implementar los 5 tipos de posts del feed.

---

## 1. TEXT_IMAGE - Post con Texto e Imagen

**Descripción**: Post básico con título, subtítulo opcional, texto y una imagen.

**Campos**:
- `title`: string (requerido)
- `subtitle`: string (opcional)
- `body.text`: string (opcional)
- `body.medias[0]`: { url: string, alt: string } (opcional)

**Diagrama ASCII**:
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │         [IMAGEN DESTACADA]          │ │
│ │                                     │ │
│ │         16:9 o 4:3 ratio            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Título del Post                   ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                         │
│ Subtítulo opcional en texto más         │
│ pequeño y con color gris                │
│                                         │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│                                         │
│ Texto del cuerpo del post que puede    │
│ ser de varias líneas. Usa line-clamp   │
│ para limitar a 3-4 líneas en el feed.  │
│                                         │
│ ┌─────────┐                             │
│ │ Ver más │                             │
│ └─────────┘                             │
│                                         │
│ 📅 Hace 2 horas                         │
└─────────────────────────────────────────┘
```

**Comportamiento**:
- Si no hay imagen, el texto ocupa todo el ancho
- Si no hay texto, solo muestra imagen + título/subtítulo
- Click en cualquier parte abre el detalle completo
- En detalle, muestra texto completo sin line-clamp

**Ejemplo de uso**:
```json
{
  "kind": "TEXT_IMAGE",
  "title": "Inauguración del evento",
  "subtitle": "Día 1 - 10:00 AM",
  "body": {
    "text": "¡Bienvenidos al evento más importante del año! Hoy daremos inicio...",
    "medias": [
      {
        "url": "https://example.com/image.jpg",
        "alt": "Foto del auditorio"
      }
    ]
  }
}
```

---

## 2. CAROUSEL - Carrusel de Imágenes

**Descripción**: Post con múltiples imágenes que se pueden deslizar.

**Campos**:
- `title`: string (requerido)
- `subtitle`: string (opcional)
- `body.text`: string (opcional)
- `body.medias`: Array<{ url: string, alt: string }> (2 o más imágenes)

**Diagrama ASCII**:
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ ◄                               ► │ │
│ │   [IMAGEN 1 de 5]                  │ │
│ │                                     │ │
│ │   Deslizable con touch o flechas   │ │
│ │                                     │ │
│ │         ● ○ ○ ○ ○                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Galería de fotos del evento       ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                         │
│ Los mejores momentos capturados         │
│                                         │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│                                         │
│ Descripción opcional del carrusel      │
│                                         │
│ 📸 5 fotos  📅 Hace 1 hora              │
└─────────────────────────────────────────┘
```

**Comportamiento**:
- Mínimo 2 imágenes para usar CAROUSEL
- Indicadores (dots) muestran posición actual
- Flechas en desktop, swipe en mobile
- Auto-play opcional (deshabilitado por defecto)
- Click en imagen abre lightbox/modal con imagen completa
- Navegación con teclado (← →) en desktop

**Ejemplo de uso**:
```json
{
  "kind": "CAROUSEL",
  "title": "Galería del primer día",
  "subtitle": "Inauguración 2024",
  "body": {
    "text": "Revive los mejores momentos de la inauguración",
    "medias": [
      { "url": "https://example.com/foto1.jpg", "alt": "Apertura" },
      { "url": "https://example.com/foto2.jpg", "alt": "Público" },
      { "url": "https://example.com/foto3.jpg", "alt": "Orador principal" },
      { "url": "https://example.com/foto4.jpg", "alt": "Panel" },
      { "url": "https://example.com/foto5.jpg", "alt": "Networking" }
    ]
  }
}
```

---

## 3. YOUTUBE - Video Embebido

**Descripción**: Post con video de YouTube embebido.

**Campos**:
- `title`: string (requerido)
- `subtitle`: string (opcional)
- `body.text`: string (opcional)
- `body.youtubeId`: string (requerido) - ID del video de YouTube

**Diagrama ASCII**:
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │    ┌─────────────────────┐          │ │
│ │    │                     │          │ │
│ │    │   THUMBNAIL de      │          │ │
│ │    │   YouTube           │          │ │
│ │    │                     │          │ │
│ │    │        ▶            │          │ │
│ │    │                     │          │ │
│ │    └─────────────────────┘          │ │
│ │                                     │ │
│ │  [Click para cargar YouTube]       │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🎥 Conferencia magistral           ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                         │
│ Dr. Juan Pérez - Keynote Speaker        │
│                                         │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│                                         │
│ Descripción del video y su contenido   │
│                                         │
│ ⏱️ 45 min  📅 Hace 3 horas              │
└─────────────────────────────────────────┘
```

**Comportamiento**:
- **Lazy load**: Mostrar solo thumbnail inicialmente
- Botón "Cargar video" para activar el iframe
- Evita cargar YouTube automáticamente (privacidad + performance)
- Una vez cargado, iframe responsive 16:9
- Opción "Abrir en YouTube" para app nativa

**Aspectos técnicos**:
```html
<!-- Thumbnail inicial (lite-youtube o similar) -->
<div class="youtube-preview" data-id="VIDEO_ID">
  <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" />
  <button>▶ Cargar video</button>
</div>

<!-- Después de click -->
<iframe
  src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

**Ejemplo de uso**:
```json
{
  "kind": "YOUTUBE",
  "title": "Conferencia: El futuro de la tecnología",
  "subtitle": "Dr. Juan Pérez - Keynote",
  "body": {
    "text": "No te pierdas esta charla magistral sobre tendencias tecnológicas",
    "youtubeId": "dQw4w9WgXcQ"
  }
}
```

---

## 4. SPOTIFY - Embed de Audio/Podcast

**Descripción**: Post con reproductor de Spotify embebido (canción, álbum, playlist, podcast).

**Campos**:
- `title`: string (requerido)
- `subtitle`: string (opcional)
- `body.text`: string (opcional)
- `body.spotifyId`: string (requerido) - URI de Spotify (track/album/playlist/episode)

**Diagrama ASCII**:
```
┌─────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🎵 Playlist oficial del evento     ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                         │
│ Música seleccionada para el evento      │
│                                         │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │   ┌───────────────────────────┐    │ │
│ │   │                           │    │ │
│ │   │  [SPOTIFY EMBED PLAYER]   │    │ │
│ │   │                           │    │ │
│ │   │  ▶ ⏸ ⏭  ────●────  🔊    │    │ │
│ │   │                           │    │ │
│ │   │  "Conferencia Vibes 2024" │    │ │
│ │   │                           │    │ │
│ │   └───────────────────────────┘    │ │
│ │                                     │ │
│ │   [Click para activar]             │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🎧 Playlist  📅 Actualizado hoy         │
└─────────────────────────────────────────┘
```

**Comportamiento**:
- Similar a YouTube: lazy load con botón activador
- Soporta: `track`, `album`, `playlist`, `episode`, `show`
- Iframe responsive, altura fija según tipo:
  - Track: 80px (compacto)
  - Album/Playlist: 380px (con lista)
  - Episode/Show: 232px (podcast)
- Opción "Abrir en Spotify"

**Aspectos técnicos**:
```typescript
// Spotify URI puede ser:
// spotify:track:6rqhFgbbKwnb9MLmUQDhG6
// spotify:album:4aawyAB9vmqN3uQ7FjRGTy
// spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
// spotify:episode:512ojhOuo1ktJprKbVcKyQ

// Convertir a embed URL:
const embedUrl = `https://open.spotify.com/embed/${spotifyId.replace('spotify:', '').replace(':', '/')}`
```

**Ejemplo de uso**:
```json
{
  "kind": "SPOTIFY",
  "title": "Podcast: Detrás de escenas",
  "subtitle": "Episodio especial",
  "body": {
    "text": "Escucha la entrevista exclusiva con los organizadores",
    "spotifyId": "spotify:episode:512ojhOuo1ktJprKbVcKyQ"
  }
}
```

---

## 5. LINK - Link Pill (Botón/CTA)

**Descripción**: Post con botón de acción externa (link a web, documento, registro, etc.).

**Campos**:
- `title`: string (requerido)
- `subtitle`: string (opcional)
- `body.text`: string (opcional)
- `body.linkUrl`: string (requerido) - URL destino
- `body.linkLabel`: string (requerido) - Texto del botón
- `body.medias[0]`: { url: string, alt: string } (opcional) - Imagen/icono

**Diagrama ASCII**:
```
┌─────────────────────────────────────────┐
│ ┌───┐                                   │
│ │ 📋│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ │   │  ┃ Regístrate al workshop    ┃  │
│ └───┘  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                         │
│        Taller de desarrollo web          │
│                                         │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│                                         │
│ Aprende las últimas tecnologías con    │
│ expertos de la industria. Cupos        │
│ limitados - inscríbete ahora.          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │   🔗  Inscribirme al taller  →     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🔗 Link  📅 Publicado hace 2 días       │
└─────────────────────────────────────────┘
```

**Comportamiento**:
- Botón destacado con icono y flecha
- Validar URL (https://)
- Abrir en nueva pestaña si es externo
- Tracking de clicks (analytics)
- Icono opcional a la izquierda (emoji o imagen pequeña)
- Hover states y active states

**Variantes visuales**:

**Con imagen grande**:
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │     [IMAGEN/BANNER DEL LINK]        │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Descarga el programa completo      ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                         │
│ PDF con todas las sesiones y horarios  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   📄  Descargar PDF (2.5 MB)  →    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🔗 Documento  📅 Hace 1 día             │
└─────────────────────────────────────────┘
```

**Ejemplo de uso**:
```json
{
  "kind": "LINK",
  "title": "Formulario de registro",
  "subtitle": "Workshops del día 2",
  "body": {
    "text": "Inscríbete a los talleres prácticos. Cupos limitados.",
    "linkUrl": "https://forms.google.com/registro",
    "linkLabel": "Completar registro",
    "medias": [
      {
        "url": "https://example.com/workshop-banner.jpg",
        "alt": "Banner del workshop"
      }
    ]
  }
}
```

---

## Componentes Comunes

### Header de Post (todos los tipos)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Título del Post (font-bold)       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Subtítulo (text-sm text-gray-600)
```

### Footer de Post (todos los tipos)
```
📅 Hace 2 horas  |  ❤️ 24  |  💬 8 comentarios
```

### Badge para Posts Pineados
```
┌─────────────────────────────────────────┐
│ 📌 DESTACADO                            │
│ ┌─────────────────────────────────────┐ │
│ │ ... contenido del post ...          │ │
```

---

## Reglas de Validación

### TEXT_IMAGE
- ✅ `title` requerido
- ✅ Al menos uno de: `body.text` o `body.medias[0]`
- ⚠️ Warning si no hay contenido en body

### CAROUSEL
- ✅ `title` requerido
- ✅ `body.medias` mínimo 2 imágenes
- ⚠️ Máximo recomendado: 10 imágenes (performance)

### YOUTUBE
- ✅ `title` requerido
- ✅ `body.youtubeId` requerido y válido (11 caracteres)
- ✅ Formato: `[A-Za-z0-9_-]{11}`

### SPOTIFY
- ✅ `title` requerido
- ✅ `body.spotifyId` requerido
- ✅ Formato: `spotify:(track|album|playlist|episode|show):[A-Za-z0-9]+`

### LINK
- ✅ `title` requerido
- ✅ `body.linkUrl` requerido y válida (URL format)
- ✅ `body.linkLabel` requerido
- ✅ URL debe empezar con `https://` o `http://`

---

## Estilos Consistentes

### Colores
- **Background card**: `bg-white dark:bg-gray-800`
- **Border**: `border border-gray-200 dark:border-gray-700`
- **Título**: `text-gray-900 dark:text-gray-100`
- **Subtítulo**: `text-gray-600 dark:text-gray-400`
- **Texto**: `text-gray-700 dark:text-gray-300`
- **Accents**: `text-blue-600 dark:text-blue-400`

### Espaciado
- **Padding card**: `p-6`
- **Gap entre elementos**: `space-y-4`
- **Rounded corners**: `rounded-lg`

### Tipografía
- **Título**: `text-xl font-bold`
- **Subtítulo**: `text-sm text-gray-600`
- **Body text**: `text-base`
- **Metadata**: `text-xs text-gray-500`

### Interactividad
- **Hover**: `hover:shadow-lg transition-shadow`
- **Active**: `active:scale-[0.99] transition-transform`
- **Focus**: `focus:ring-2 focus:ring-blue-500 focus:outline-none`

---

## Orden de Renderizado

1. **Badge de destacado** (si `pinned: true`)
2. **Imagen/Media** (según tipo)
3. **Header** (título + subtítulo)
4. **Divider** (línea sutil)
5. **Body text** (si existe)
6. **CTA/Acción** (según tipo)
7. **Footer** (metadata: fecha, likes, comments)

---

## Accesibilidad

- ✅ Usar `<article>` para cada post
- ✅ Heading hierarchy correcta (`h2` para título)
- ✅ Alt text descriptivo en imágenes
- ✅ ARIA labels en botones interactivos
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus visible en todos los elementos interactivos
- ✅ Color contrast ratio mínimo 4.5:1

---

## Performance

- ✅ Lazy load de imágenes (`loading="lazy"`)
- ✅ Thumbnails de YouTube en vez de iframe inicial
- ✅ Placeholders mientras carga contenido
- ✅ Optimizar imágenes (WebP, dimensiones correctas)
- ✅ Limitar texto con `line-clamp` en vista de lista

---

## Ejemplo de PostCard Component

```tsx
interface PostCardProps {
  post: {
    id: string;
    title: string;
    subtitle?: string;
    kind: 'TEXT_IMAGE' | 'CAROUSEL' | 'YOUTUBE' | 'SPOTIFY' | 'LINK';
    body: {
      text?: string;
      medias?: Array<{ url: string; alt: string }>;
      youtubeId?: string;
      spotifyId?: string;
      linkUrl?: string;
      linkLabel?: string;
    };
    pinned: boolean;
    createdAt: string;
  };
  onClick?: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {post.pinned && <PinnedBadge />}

      <MediaSection kind={post.kind} body={post.body} />

      <div className="p-6 space-y-4">
        <header>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {post.title}
          </h2>
          {post.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {post.subtitle}
            </p>
          )}
        </header>

        {post.body.text && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700" />
            <p className="text-base text-gray-700 dark:text-gray-300 line-clamp-3">
              {post.body.text}
            </p>
          </>
        )}

        <ActionSection kind={post.kind} body={post.body} />

        <footer className="text-xs text-gray-500 dark:text-gray-500">
          📅 {formatRelativeTime(post.createdAt)}
        </footer>
      </div>
    </article>
  );
}
```

---

## Notas Finales

- **Consistencia** es clave: todos los posts deben sentirse parte del mismo sistema
- **Mobile-first**: diseñar primero para mobile, luego adaptar a desktop
- **Progresive enhancement**: funcionalidad básica sin JS, mejoras con JS
- **Analytics**: trackear interacciones (clicks, reproducciones, tiempo de vista)
