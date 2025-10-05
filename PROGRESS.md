# 📊 Progress Tracker - App de Conferencias

Estado actual del desarrollo del MVP (9 semanas)

## ✅ Completado

### Setup Base (Semana 1) - 70% Complete
- [x] Template nextjs-pwa clonado
- [x] View Transitions integradas (next-view-transitions)
- [x] Drizzle ORM configurado
- [x] Schema completo definido
- [x] Supabase helpers (auth, client)
- [x] Fint API integration (production-ready con retry logic)
- [x] Estructura de carpetas completa
- [x] Auth pages (Login con Magic Link + Google)
- [x] Auth callback handler
- [x] Admin dashboard básico
- [x] SQL setup script (RLS, triggers, policies)
- [x] SQL seed script (datos de prueba)
- [x] Documentación completa (README, SETUP, CHANGELOG)
- [x] Build exitoso
- [x] Git inicializado con commits
- [ ] Supabase proyecto creado (pendiente: usuario)
- [ ] Variables de entorno configuradas (pendiente: usuario)
- [ ] Tablas migradas a Supabase (pendiente: usuario)
- [ ] Deploy inicial a Vercel (pendiente)

## 📋 Pendiente

### Semana 1 (Restante)
- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Ejecutar migrations/setup SQL
- [ ] Probar autenticación (Magic Link + Google)
- [ ] Deploy a Vercel
- [ ] Configurar Google OAuth en producción

### Semana 2: Home/Feed
- [ ] Componente PostCard (5 variantes)
  - [ ] TEXT_IMAGE
  - [ ] CAROUSEL
  - [ ] YOUTUBE
  - [ ] SPOTIFY
  - [ ] LINK
- [ ] Feed page con lista de posts
- [ ] Filtros (por tipo, pinned)
- [ ] Paginación
- [ ] Admin: CRUD Posts
  - [ ] Lista de posts
  - [ ] Crear post
  - [ ] Editar post
  - [ ] Pin/Unpin
  - [ ] Publicar/Ocultar
- [ ] Skeleton loaders

### Semana 3: Programa
- [ ] Event days selector
- [ ] Lista de sesiones por día
- [ ] Filtros (track, room, búsqueda)
- [ ] SessionCard component
- [ ] Admin: CRUD Días
- [ ] Admin: CRUD Tracks
- [ ] Admin: CRUD Rooms
- [ ] Admin: CRUD Sesiones
- [ ] Validación de solapes (sala/horario)

### Semana 4: Detalle Sesión + Mapa
- [ ] Página detalle de sesión
- [ ] Badge "Plenaria"
- [ ] Botón materiales (si es plenaria)
- [ ] Speaker info card
- [ ] MapEmbed component (iframe o imagen)
- [ ] Integración con Google Maps (opcional)
- [ ] Acceso al mapa desde Programa

### Semana 5: Entradas (Fint)
- [ ] API route: GET /api/tickets
- [ ] Fetch tickets por email del usuario
- [ ] TicketCard component (QR + PDF)
- [ ] Lista de tickets del usuario
- [ ] Estado vacío (sin tickets)
- [ ] Admin: Vista de tickets sincronizados
- [ ] Admin: Botón "Re-sync"
- [ ] Webhook route: POST /api/tickets/sync
- [ ] Test con ngrok/staging

### Semana 6: Stands
- [ ] StandCard component
- [ ] Grid de stands
- [ ] Filtros por tipo
- [ ] Página detalle de stand
- [ ] Admin: CRUD Stands
  - [ ] Lista
  - [ ] Crear
  - [ ] Editar
  - [ ] Subir logo

### Semana 7: Páginas Personalizadas
- [ ] PageRenderer component
- [ ] Bloques:
  - [ ] Paragraph
  - [ ] Image
  - [ ] Link
  - [ ] List
  - [ ] Embed (YouTube/Maps)
  - [ ] Accordion
  - [ ] Grid de imágenes
- [ ] Menú "Más" con lista de páginas
- [ ] Drawer mobile (vaul)
- [ ] Admin: CRUD Páginas
  - [ ] Lista
  - [ ] Crear con bloques
  - [ ] Editar
  - [ ] Ordenar
  - [ ] Visibilidad (PUBLIC/AUTH)

### Semana 8: Newsletter + Webhook Fint
- [ ] NewsletterInput component
- [ ] API route: POST /api/newsletter/subscribe
- [ ] Validación email + términos
- [ ] Admin: Lista de suscriptores
- [ ] Admin: Export CSV
- [ ] Webhook Fint completo
- [ ] Validación de signature
- [ ] Upsert tickets por external_id
- [ ] Test end-to-end

### Semana 9: Tests + Optimizaciones
- [ ] Tests críticos (Playwright)
  - [ ] Auth flow
  - [ ] Fint fetch
  - [ ] Admin CRUD básico
- [ ] Accessibility audit
- [ ] Performance optimizations
- [ ] Analítica (Vercel Analytics)
- [ ] Error tracking (Sentry)
- [ ] PWA offline test
- [ ] Deploy final
- [ ] Documentación final

## 📦 Componentes Creados

### Core
- [x] `lib/db/schema.ts` - Drizzle schema completo
- [x] `lib/db/index.ts` - DB client
- [x] `lib/auth.ts` - Supabase auth helpers
- [x] `lib/fint.ts` - Fint API client (production-ready)
- [x] `lib/utils.ts` - Utilidades generales

### Pages
- [x] `src/app/(app)/page.tsx` - Home placeholder
- [x] `src/app/(auth)/login/page.tsx` - Login completo
- [x] `src/app/(auth)/callback/page.tsx` - OAuth callback
- [x] `src/app/(admin)/dashboard/page.tsx` - Dashboard básico

### Layouts
- [x] `src/app/layout.tsx` - Root layout con ViewTransitions
- [x] `src/app/(app)/layout.tsx` - App layout
- [x] `src/app/(auth)/layout.tsx` - Auth layout
- [x] `src/app/(admin)/layout.tsx` - Admin layout

### Pendientes
- [ ] PostCard (5 variantes)
- [ ] SessionCard
- [ ] StandCard
- [ ] TicketCard
- [ ] NewsletterInput
- [ ] MapEmbed
- [ ] PageRenderer
- [ ] Navigation tabs
- [ ] Admin sidebar
- [ ] Skeletons

## 📊 Estadísticas

- **Commits**: 6
- **Archivos creados**: 20+
- **Líneas de código**: ~3,000
- **Dependencias instaladas**: 15+
- **Build status**: ✅ Passing
- **Tests**: 0/10 (Semana 9)

## 🎯 Próximo Milestone

**Semana 1 - Completar Setup**
1. Usuario crea proyecto Supabase
2. Configura variables de entorno
3. Ejecuta migrations
4. Prueba auth
5. Deploy a Vercel

**Semana 2 - Home/Feed**
1. Implementar PostCard
2. Feed con posts
3. Admin CRUD Posts

## 📝 Notas

### Decisiones técnicas tomadas:
- ✅ Drizzle ORM sobre Prisma (mejor para Supabase)
- ✅ sonner para toasts (mejor UX)
- ✅ vaul para drawer mobile
- ✅ Encuestas y Q&A fuera del MVP (V1.1)
- ✅ Rate limiting simple sin Redis
- ✅ Fint integration production-ready con retry logic

### Pendientes de decisión:
- [ ] Librería de componentes para admin (shadcn completo?)
- [ ] Estrategia de caching (ISR vs on-demand)
- [ ] Manejo de imágenes (Supabase Storage vs CDN externo)

---

**Última actualización**: 2025-10-05
**Estado general**: 🟢 On track (Semana 1 - 70%)
