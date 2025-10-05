-- ============================================
-- Seed Data para desarrollo
-- ============================================
-- Ejecutar después de supabase-setup.sql

-- ============================================
-- 1. Posts de ejemplo
-- ============================================
INSERT INTO public.posts (title, subtitle, kind, body, pinned, published) VALUES
('¡Bienvenidos a la conferencia!', 'Nos alegra tenerte aquí', 'TEXT_IMAGE', 
 '{"text": "Estamos emocionados de dar inicio a este evento. Prepárate para días llenos de aprendizaje y networking.", "medias": [{"url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", "alt": "Conferencia"}]}'::jsonb,
 true, true),

('Agenda del día 1', 'Revisa el programa completo', 'LINK',
 '{"linkUrl": "/programa", "linkLabel": "Ver programa completo"}'::jsonb,
 false, true),

('Keynote: El futuro de la tecnología', 'No te pierdas esta charla magistral', 'YOUTUBE',
 '{"youtubeId": "dQw4w9WgXcQ", "text": "Una mirada profunda al futuro de la innovación tecnológica."}'::jsonb,
 false, true),

('Galería de fotos del evento', 'Revive los mejores momentos', 'CAROUSEL',
 '{"medias": [
   {"url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", "alt": "Momento 1"},
   {"url": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800", "alt": "Momento 2"},
   {"url": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800", "alt": "Momento 3"}
 ]}'::jsonb,
 false, true),

('Playlist oficial del evento', 'Música para acompañar tu experiencia', 'SPOTIFY',
 '{"spotifyId": "37i9dQZF1DXcBWIGoYBM5M"}'::jsonb,
 false, true);

-- ============================================
-- 2. Días del evento
-- ============================================
INSERT INTO public.event_days (date, position) VALUES
('2025-11-15', 1),
('2025-11-16', 2),
('2025-11-17', 3);

-- ============================================
-- 3. Tracks
-- ============================================
INSERT INTO public.tracks (name) VALUES
('Tecnología'),
('Negocios'),
('Diseño'),
('Marketing');

-- ============================================
-- 4. Rooms (para el primer día)
-- ============================================
WITH first_day AS (
  SELECT id FROM public.event_days WHERE position = 1 LIMIT 1
)
INSERT INTO public.rooms (day_id, name)
SELECT id, unnest(ARRAY['Auditorio Principal', 'Sala A', 'Sala B', 'Sala C'])
FROM first_day;

-- ============================================
-- 5. Sesiones de ejemplo
-- ============================================
WITH 
  first_day AS (SELECT id FROM public.event_days WHERE position = 1 LIMIT 1),
  tech_track AS (SELECT id FROM public.tracks WHERE name = 'Tecnología' LIMIT 1),
  main_room AS (SELECT id FROM public.rooms WHERE name = 'Auditorio Principal' LIMIT 1)
INSERT INTO public.sessions (
  title, abstract, day_id, track_id, room_id, 
  starts_at, ends_at, is_plenary, materials_url, speaker
)
SELECT 
  'Apertura del evento',
  'Palabras de bienvenida y presentación del programa',
  first_day.id,
  tech_track.id,
  main_room.id,
  '2025-11-15 09:00:00+00',
  '2025-11-15 10:00:00+00',
  true,
  'https://example.com/materiales/apertura.pdf',
  '{"name": "Dr. Juan Pérez", "title": "Director del evento", "avatarUrl": "https://i.pravatar.cc/150?img=12"}'::jsonb
FROM first_day, tech_track, main_room;

WITH 
  first_day AS (SELECT id FROM public.event_days WHERE position = 1 LIMIT 1),
  tech_track AS (SELECT id FROM public.tracks WHERE name = 'Tecnología' LIMIT 1),
  sala_a AS (SELECT id FROM public.rooms WHERE name = 'Sala A' LIMIT 1)
INSERT INTO public.sessions (
  title, abstract, day_id, track_id, room_id, 
  starts_at, ends_at, is_plenary, speaker
)
SELECT 
  'Introducción a Next.js 15',
  'Aprende las nuevas features de Next.js 15 y cómo aprovecharlas en tus proyectos',
  first_day.id,
  tech_track.id,
  sala_a.id,
  '2025-11-15 10:30:00+00',
  '2025-11-15 11:30:00+00',
  false,
  '{"name": "María García", "title": "Senior Developer", "avatarUrl": "https://i.pravatar.cc/150?img=5"}'::jsonb
FROM first_day, tech_track, sala_a;

-- ============================================
-- 6. Stands
-- ============================================
INSERT INTO public.stands (name, type, description, logo_url, links) VALUES
('Universidad Tecnológica', 'instituto', 
 'Conoce nuestros programas de grado y posgrado en tecnología e innovación',
 'https://ui-avatars.com/api/?name=UT&size=200&background=0D8ABC&color=fff',
 '[{"label": "Sitio web", "url": "https://example.com"}, {"label": "Admisiones", "url": "https://example.com/admisiones"}]'::jsonb),

('Tech Corp', 'sponsor', 
 'Líder en soluciones tecnológicas empresariales',
 'https://ui-avatars.com/api/?name=TC&size=200&background=FF6B6B&color=fff',
 '[{"label": "Sitio web", "url": "https://example.com"}, {"label": "Careers", "url": "https://example.com/careers"}]'::jsonb),

('Carrera de Ingeniería en Sistemas', 'carrera',
 'Formamos profesionales preparados para los desafíos del futuro digital',
 'https://ui-avatars.com/api/?name=IS&size=200&background=4ECDC4&color=fff',
 '[{"label": "Plan de estudios", "url": "https://example.com"}]'::jsonb),

('Programa de Innovación', 'programa',
 'Impulsa tu startup con nuestro programa de aceleración',
 'https://ui-avatars.com/api/?name=PI&size=200&background=95E1D3&color=333',
 '[{"label": "Aplicar", "url": "https://example.com/apply"}]'::jsonb);

-- ============================================
-- 7. Páginas personalizadas
-- ============================================
INSERT INTO public.pages (title, slug, blocks, visible, "order") VALUES
('Información del evento', 'informacion',
 '[
   {"type": "paragraph", "text": "Bienvenido a nuestra conferencia anual. Este es un espacio para el aprendizaje, la innovación y el networking."},
   {"type": "image", "url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200", "alt": "Evento"},
   {"type": "paragraph", "text": "Durante tres días, expertos de la industria compartirán sus conocimientos y experiencias."},
   {"type": "link", "label": "Ver programa completo", "url": "/programa"}
 ]'::jsonb,
 'PUBLIC', 1),

('Términos de Servicio', 'terminos',
 '[
   {"type": "paragraph", "text": "Última actualización: Octubre 2025"},
   {"type": "paragraph", "text": "Al utilizar esta aplicación, aceptas los siguientes términos y condiciones..."},
   {"type": "accordion", "items": [
     {"title": "1. Uso de la plataforma", "content": "La plataforma está diseñada para facilitar tu experiencia en el evento."},
     {"title": "2. Privacidad de datos", "content": "Respetamos tu privacidad y protegemos tus datos personales."},
     {"title": "3. Código de conducta", "content": "Esperamos que todos los asistentes mantengan un comportamiento respetuoso."}
   ]}
 ]'::jsonb,
 'PUBLIC', 10),

('Cómo llegar', 'como-llegar',
 '[
   {"type": "paragraph", "text": "El evento se realizará en el Centro de Convenciones Principal."},
   {"type": "embed", "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168878939097!2d-58.38375908477044!3d-34.60373098045943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf7e1f4b7d%3A0x7e8c8e6f8e7f8e7f!2sObelisco!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"},
   {"type": "paragraph", "text": "Dirección: Av. Principal 1234, Ciudad"},
   {"type": "list", "items": [
     {"title": "En auto", "content": "Estacionamiento disponible en el subsuelo"},
     {"title": "En transporte público", "content": "Líneas de colectivo: 10, 37, 60"},
     {"title": "En taxi/Uber", "content": "Ingreso por calle lateral"}
   ]}
 ]'::jsonb,
 'PUBLIC', 2);

-- ============================================
-- Seed completo! 🎉
-- ============================================
-- Ahora puedes:
-- 1. Ver los posts en el feed
-- 2. Explorar el programa
-- 3. Visitar los stands
-- 4. Leer las páginas personalizadas
