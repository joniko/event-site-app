# Changelog - Especificación MVP

## 2025-10-05 - Revisión y simplificación del MVP

### ✅ Cambios Implementados

#### Stack actualizado:
- ❌ **Removido**: Prisma ORM
- ✅ **Agregado**: **Drizzle ORM** para type-safety con Supabase
- ✅ **Agregado**: sonner para toasts (mejor UX que shadcn default)
- ✅ **Agregado**: vaul para drawer mobile
- ✅ **Agregado**: Sentry para error tracking (opcional)
- ✅ React 19 (actualizado desde React 18)

#### Scope del MVP reducido:
- ❌ **Removido del MVP**: Encuestas (Polls)
- ❌ **Removido del MVP**: Q&A con voting
- 📅 **Movido a V1.1**: Encuestas y Q&A (requieren rate limiting complejo)

**Razón**: Evitar dependencias de Vercel KV o Upstash Redis para rate limiting. Simplificar MVP inicial.

#### Estructura de proyecto mejorada:
```
app/
  (auth)/          # Login y callbacks
  (app)/           # ✅ Rutas principales (antes era (public)/)
  (admin)/         # ✅ Backoffice separado (antes era admin/)
  api/
```

**Mejora**: Mejor separación de concerns entre app pública y admin.

#### Testing simplificado:
- ❌ **Removido**: Tests extensivos en todas las semanas
- ✅ **Simplificado**: Tests críticos solo en Semana 9
  - Auth flow
  - Fint fetch
  - Admin CRUD básico
  - Playwright para E2E

**Razón**: Priorizar features sobre testing exhaustivo en MVP.

#### Rate Limiting simplificado:
- ❌ **Removido**: Upstash Redis
- ❌ **Removido**: Vercel KV
- ✅ **Simplificado**: Cache en memoria + retry logic con backoff exponencial para Fint API

#### Navegación mejorada:
- **Mobile**: Bottom nav con 5 tabs fijos
- **Desktop**: Top nav horizontal
- **Más**: Solo para páginas personalizadas (no incluye "Participar" ya que no hay polls/Q&A en MVP)

### 📋 Plan de entrega actualizado (9 semanas):

**Semana 1**: Setup (Drizzle + Supabase) + Auth + Layout + Deploy
**Semana 2**: Home/Feed (5 variantes) + Admin Posts
**Semana 3**: Programa (lista + filtros) + Admin Programa
**Semana 4**: Detalle sesión + Plenarias + Mapa
**Semana 5**: Entradas Fint (fetch + cache) + Admin view
**Semana 6**: Stands (grid + detalle) + Admin
**Semana 7**: Páginas personalizadas (CMS) + menú "Más"
**Semana 8**: Newsletter + Webhook Fint
**Semana 9**: Tests + Accesibilidad + Deploy final

### 🎯 Criterios de aceptación actualizados:

1. ✅ Usuario anónimo: Home, Programa, Stands, Páginas públicas
2. ✅ Usuario logueado: Ver Entradas (Fint)
3. ✅ Organizador: CRUD posts, programa, stands, páginas; re-sync tickets; ver newsletter
4. ✅ Mapa accesible desde Programa
5. ✅ Menú "Más" con páginas personalizadas
6. ✅ Newsletter con validación
7. ✅ PWA offline support
8. ✅ View Transitions suaves (next-view-transitions)
9. ✅ Type-safe con TypeScript + Drizzle ORM

### 📦 Dependencias a instalar:

```bash
npm install drizzle-orm @supabase/supabase-js sonner vaul zod
npm install -D drizzle-kit @sentry/nextjs
```

### 🔄 Próximos pasos:

1. Instalar Drizzle ORM y dependencias
2. Configurar Supabase proyecto
3. Crear schema Drizzle inicial
4. Setup estructura de carpetas
5. Implementar auth básico

---

## Estado actual del proyecto:

✅ Template nextjs-pwa clonado
✅ View Transitions integradas (next-view-transitions)
✅ Build inicial exitoso
✅ Git inicializado con commit
✅ Spec actualizado y documentado

🔄 Pendiente: Configuración de Drizzle + Supabase
