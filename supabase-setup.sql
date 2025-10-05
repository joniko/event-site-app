-- ============================================
-- Supabase Setup SQL
-- ============================================
-- Ejecutar este SQL en el SQL Editor de Supabase
-- después de crear las tablas con Drizzle

-- ============================================
-- 1. Helper function para obtener el rol del usuario actual
-- ============================================
CREATE OR REPLACE FUNCTION public.current_role() 
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()), 
    'USER'
  );
$$;

-- ============================================
-- 2. Trigger para updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_days_updated_at 
  BEFORE UPDATE ON event_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at 
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stands_updated_at 
  BEFORE UPDATE ON stands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at 
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Foreign Key para profiles -> auth.users
-- ============================================
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin" ON public.profiles
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- POSTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_read_public" ON public.posts
  FOR SELECT USING (published = true);

CREATE POLICY "posts_write_admin" ON public.posts
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- EVENT DAYS
ALTER TABLE public.event_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "days_read" ON public.event_days
  FOR SELECT USING (true);

CREATE POLICY "days_write_admin" ON public.event_days
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- TRACKS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracks_read" ON public.tracks
  FOR SELECT USING (true);

CREATE POLICY "tracks_write_admin" ON public.tracks
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- ROOMS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_read" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "rooms_write_admin" ON public.rooms
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- SESSIONS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_read" ON public.sessions
  FOR SELECT USING (true);

CREATE POLICY "sessions_write_admin" ON public.sessions
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- STANDS
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stands_read" ON public.stands
  FOR SELECT USING (true);

CREATE POLICY "stands_write_admin" ON public.stands
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- PAGES
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_read" ON public.pages
  FOR SELECT USING (
    visible = 'PUBLIC' OR auth.role() = 'authenticated'
  );

CREATE POLICY "pages_write_admin" ON public.pages
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- NEWSLETTER SUBS
ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs_insert" ON public.newsletter_subs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "subs_read_admin" ON public.newsletter_subs
  FOR SELECT USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- TICKETS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "my_tickets_read" ON public.tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tickets_admin" ON public.tickets
  FOR ALL USING (public.current_role() IN ('ADMIN', 'EDITOR'));

-- ============================================
-- 5. Trigger para crear profile automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. Storage bucket para imágenes (opcional)
-- ============================================
-- Ejecutar en el dashboard de Storage:
-- 1. Crear bucket "public" con acceso público
-- 2. Configurar policies para upload (solo autenticados)

-- ============================================
-- Setup completo! 🎉
-- ============================================
-- Próximos pasos:
-- 1. Configurar Google OAuth en Authentication > Providers
-- 2. Configurar Magic Link en Authentication > Email Templates
-- 3. Crear bucket "public" en Storage (si necesitas subir imágenes)
-- 4. Seed data inicial (ver siguiente archivo)
