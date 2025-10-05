-- ============================================
-- SETUP COMPLETO DE BD PARA ADMIN PANEL
-- ============================================
-- Ejecutar este archivo COMPLETO en Supabase SQL Editor
-- Este script crea todas las tablas, RLS policies, triggers y funciones necesarias
-- ============================================

-- ============================================
-- 1. CREAR TABLAS
-- ============================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'EDITOR', 'ADMIN')),
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PAGES (Sistema de páginas con módulos - ACTUALIZADO)
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('FEED', 'PROGRAMA', 'ENTRADAS', 'STANDS', 'CUSTOM')),
  icon text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL UNIQUE,
  config jsonb DEFAULT '{}'::jsonb,
  blocks jsonb,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  kind text NOT NULL CHECK (kind IN ('TEXT_IMAGE', 'CAROUSEL', 'YOUTUBE', 'SPOTIFY', 'LINK')),
  body jsonb,
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- EVENT DAYS
CREATE TABLE IF NOT EXISTS public.event_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  position integer NOT NULL DEFAULT 0,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- TRACKS
CREATE TABLE IF NOT EXISTS public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid REFERENCES public.event_days(id) ON DELETE CASCADE,
  name text NOT NULL,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  abstract text,
  day_id uuid REFERENCES public.event_days(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.tracks(id),
  room_id uuid REFERENCES public.rooms(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_plenary boolean NOT NULL DEFAULT false,
  materials_url text,
  speaker jsonb,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- STANDS
CREATE TABLE IF NOT EXISTS public.stands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  logo_url text,
  links jsonb,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- NEWSLETTER SUBS
CREATE TABLE IF NOT EXISTS public.newsletter_subs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  terms_accepted boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  status text NOT NULL,
  qr_url text,
  pdf_url text,
  event_name text,
  purchased_at timestamptz,
  user_email text NOT NULL,
  first_name text,
  last_name text,
  amount text,
  reference text,
  user_id uuid REFERENCES public.profiles(id),
  raw_data jsonb,
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 2. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pages_visible ON public.pages(visible);
CREATE INDEX IF NOT EXISTS idx_pages_order ON public.pages("order");
CREATE INDEX IF NOT EXISTS idx_pages_type ON public.pages(type);

-- Constraint: solo una página de cada tipo (excepto CUSTOM)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_unique_type
  ON public.pages(type)
  WHERE type != 'CUSTOM' AND visible = true;

-- ============================================
-- 3. FUNCIONES HELPER
-- ============================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'USER'
  );
$$;

-- Función para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Función para crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Triggers para updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.pages;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.event_days;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.event_days
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tracks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.rooms;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.sessions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.stands;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stands
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tickets;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para crear profile automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
CREATE POLICY "profiles_admin" ON public.profiles
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- PAGES
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pages_read_public" ON public.pages;
CREATE POLICY "pages_read_public" ON public.pages
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "pages_write_admin" ON public.pages;
CREATE POLICY "pages_write_admin" ON public.pages
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- POSTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_read_public" ON public.posts;
CREATE POLICY "posts_read_public" ON public.posts
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "posts_write_admin" ON public.posts;
CREATE POLICY "posts_write_admin" ON public.posts
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- EVENT DAYS
ALTER TABLE public.event_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_days_read" ON public.event_days;
CREATE POLICY "event_days_read" ON public.event_days
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_days_write_admin" ON public.event_days;
CREATE POLICY "event_days_write_admin" ON public.event_days
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- TRACKS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracks_read" ON public.tracks;
CREATE POLICY "tracks_read" ON public.tracks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "tracks_write_admin" ON public.tracks;
CREATE POLICY "tracks_write_admin" ON public.tracks
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- ROOMS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_read" ON public.rooms;
CREATE POLICY "rooms_read" ON public.rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "rooms_write_admin" ON public.rooms;
CREATE POLICY "rooms_write_admin" ON public.rooms
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- SESSIONS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_read" ON public.sessions;
CREATE POLICY "sessions_read" ON public.sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sessions_write_admin" ON public.sessions;
CREATE POLICY "sessions_write_admin" ON public.sessions
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- STANDS
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stands_read" ON public.stands;
CREATE POLICY "stands_read" ON public.stands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "stands_write_admin" ON public.stands;
CREATE POLICY "stands_write_admin" ON public.stands
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- NEWSLETTER SUBS
ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_subs_insert" ON public.newsletter_subs;
CREATE POLICY "newsletter_subs_insert" ON public.newsletter_subs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_subs_read_admin" ON public.newsletter_subs;
CREATE POLICY "newsletter_subs_read_admin" ON public.newsletter_subs
  FOR SELECT USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- TICKETS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_read_own" ON public.tickets;
CREATE POLICY "tickets_read_own" ON public.tickets
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "tickets_admin" ON public.tickets;
CREATE POLICY "tickets_admin" ON public.tickets
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- ============================================
-- 6. SEED DATA INICIAL (para testing)
-- ============================================

-- Página de ejemplo (Home/Feed)
INSERT INTO public.pages (title, slug, type, icon, visible, "order", config)
VALUES
  ('Inicio', 'home', 'FEED', 'Home', true, 1, '{"itemsPerPage": 10, "showPinnedFirst": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================
-- Verificar que todas las tablas se crearon con RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pages', 'posts', 'event_days', 'tracks', 'rooms', 'sessions', 'stands', 'newsletter_subs', 'tickets')
ORDER BY tablename;

-- ============================================
-- SETUP COMPLETO! 🎉
-- ============================================
-- Próximos pasos:
-- 1. Configurar Google OAuth en Authentication > Providers (si lo necesitas)
-- 2. Crear bucket "public" en Storage para imágenes (opcional)
-- 3. Crear tu primer usuario ADMIN manualmente:
--    UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'tu-email@example.com';
