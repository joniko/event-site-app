-- ============================================
-- MIGRACIÓN: Actualizar tabla PAGES
-- ============================================
-- Este script actualiza la tabla pages existente al nuevo schema
-- con soporte para sistema de módulos dinámicos
-- ============================================

-- 1. Agregar nuevas columnas a la tabla pages
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}'::jsonb;

-- 2. Modificar columna visible (de text a boolean)
-- Primero verificar si existe como text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'pages'
    AND column_name = 'visible'
    AND data_type = 'text'
  ) THEN
    -- Convertir valores existentes
    UPDATE public.pages SET visible =
      CASE
        WHEN visible = 'PUBLIC' THEN 'true'
        ELSE 'false'
      END;

    -- Cambiar tipo de columna
    ALTER TABLE public.pages
      ALTER COLUMN visible TYPE boolean
      USING (visible::boolean);
  END IF;
END $$;

-- 3. Hacer columnas NOT NULL (después de agregar valores default)
-- Primero actualizar filas existentes con valores por defecto
UPDATE public.pages
SET
  type = 'CUSTOM',
  icon = 'FileText'
WHERE type IS NULL;

-- Ahora hacer NOT NULL
ALTER TABLE public.pages
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN icon SET NOT NULL;

-- 4. Agregar constraints de tipo
ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_type_check;

ALTER TABLE public.pages
  ADD CONSTRAINT pages_type_check
  CHECK (type IN ('FEED', 'PROGRAMA', 'ENTRADAS', 'STANDS', 'CUSTOM'));

-- 5. Agregar constraint UNIQUE a la columna order (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pages_order_unique'
  ) THEN
    ALTER TABLE public.pages
      ADD CONSTRAINT pages_order_unique UNIQUE ("order");
  END IF;
END $$;

-- 6. Crear índices necesarios
CREATE INDEX IF NOT EXISTS idx_pages_visible ON public.pages(visible);
CREATE INDEX IF NOT EXISTS idx_pages_order ON public.pages("order");
CREATE INDEX IF NOT EXISTS idx_pages_type ON public.pages(type);

-- 7. Constraint: solo una página de cada tipo (excepto CUSTOM)
DROP INDEX IF EXISTS idx_pages_unique_type;
CREATE UNIQUE INDEX idx_pages_unique_type
  ON public.pages(type)
  WHERE type != 'CUSTOM' AND visible = true;

-- 8. Hacer columna blocks nullable (solo para type=CUSTOM)
ALTER TABLE public.pages
  ALTER COLUMN blocks DROP NOT NULL;

-- 9. Actualizar RLS policy de pages para usar visible boolean
DROP POLICY IF EXISTS "pages_read" ON public.pages;
CREATE POLICY "pages_read_public" ON public.pages
  FOR SELECT USING (visible = true);

-- 10. Verificar cambios
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pages'
ORDER BY ordinal_position;

-- ============================================
-- MIGRACIÓN COMPLETADA! ✅
-- ============================================
-- La tabla pages ahora tiene:
-- - type: FEED | PROGRAMA | ENTRADAS | STANDS | CUSTOM (NOT NULL)
-- - icon: nombre del icono de lucide-react (NOT NULL)
-- - visible: boolean (en vez de text PUBLIC/AUTH)
-- - order: integer UNIQUE
-- - config: jsonb (configuración por módulo)
-- - blocks: jsonb nullable (solo para CUSTOM)
-- - Constraint: solo una página por tipo (excepto CUSTOM)
-- ============================================
