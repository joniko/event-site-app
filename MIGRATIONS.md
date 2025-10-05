# Guía de Migraciones con Supabase CLI

## Setup Inicial

### 1. Instalar Supabase CLI
```bash
# Ya instalado en tu sistema
which supabase
```

### 2. Autenticarse
```bash
# Obtén tu token en: https://supabase.com/dashboard/account/tokens
supabase login --token <tu-access-token>

# O agrega a .env.local:
SUPABASE_ACCESS_TOKEN=<tu-access-token>
```

### 3. Vincular el proyecto
```bash
supabase link --project-ref xxbvdwxxmqfpmzeufswm
```

## Workflow de Migraciones

### Crear una nueva migración
```bash
# Genera un archivo de migración vacío
supabase migration new nombre-de-la-migracion

# Ejemplo:
supabase migration new add-user-preferences
```

Esto crea un archivo en `supabase/migrations/YYYYMMDDHHMMSS_nombre-de-la-migracion.sql`

### Editar la migración
Abre el archivo generado y escribe tu SQL:
```sql
-- supabase/migrations/20250105120000_add-user-preferences.sql

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
```

### Aplicar migraciones
```bash
# Aplica todas las migraciones pendientes
supabase db push

# Ver el estado de las migraciones
supabase migration list
```

### Revertir una migración
```bash
# Crea una nueva migración que revierte los cambios
supabase migration new revert-add-user-preferences

# Luego escribe el SQL de reversión manualmente
```

## Sincronizar con Drizzle

Después de aplicar migraciones con Supabase CLI, actualiza tu schema de Drizzle:

```bash
# 1. Actualiza lib/db/schema.ts con las nuevas tablas

# 2. Genera tipos de Drizzle (opcional)
npm run db:generate

# 3. No necesitas db:push porque ya aplicaste con Supabase CLI
```

## Migraciones Existentes

Las tablas actuales fueron creadas manualmente. Para trackearlas:

```bash
# 1. Crea una migración inicial
supabase migration new initial-schema

# 2. Copia el contenido de supabase-create-tables.sql al archivo generado

# 3. Aplica (esto marcará la migración como aplicada sin ejecutarla de nuevo)
supabase db push
```

## Comandos Útiles

```bash
# Ver el estado del proyecto
supabase status

# Ver logs de la base de datos
supabase db logs

# Resetear la base de datos local (si usas Supabase local)
supabase db reset

# Generar tipos TypeScript desde la DB
supabase gen types typescript --project-id xxbvdwxxmqfpmzeufswm > lib/db/database.types.ts
```

## Ventajas de Supabase CLI vs Drizzle Kit

### Supabase CLI ✅
- Funciona perfectamente con Supabase (obviamente)
- Soporta Connection Pooler
- Integración nativa con RLS, triggers, functions
- Historial de migraciones en Supabase Dashboard
- Genera tipos TypeScript automáticamente

### Drizzle Kit ❌
- No funciona bien con Supabase Pooler
- Requiere conexión directa (puerto 5432)
- Problemas con "Tenant or user not found"
- Mejor para bases de datos self-hosted

## Recomendación Final

**Para este proyecto**:
1. **Migraciones**: Usa `supabase migration` + `supabase db push`
2. **Queries en código**: Usa Drizzle ORM (ya configurado)
3. **Tipos**: Genera con `supabase gen types` o mantén `lib/db/schema.ts`

Esto te da lo mejor de ambos mundos:
- Migraciones confiables con Supabase CLI
- Queries type-safe con Drizzle ORM
