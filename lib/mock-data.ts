import type { Post } from '@/components/post-card';

export const mockPosts: Post[] = [
  {
    id: '1',
    title: '¡Bienvenidos a la Conferencia 2025!',
    subtitle: 'Tres días de aprendizaje, networking y experiencias inolvidables',
    kind: 'TEXT_IMAGE',
    text: 'Nos complace darles la bienvenida a nuestra conferencia anual. Este año contamos con más de 50 ponentes internacionales, talleres prácticos y espacios de networking.\n\n¡Prepárense para una experiencia increíble!',
    medias: [
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        alt: 'Conferencia principal',
      },
    ],
    pinned: true,
  },
  {
    id: '2',
    title: 'Galería del evento',
    subtitle: 'Algunos momentos destacados de días anteriores',
    kind: 'CAROUSEL',
    medias: [
      {
        url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
        alt: 'Networking entre asistentes',
      },
      {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
        alt: 'Ponencia principal',
      },
      {
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
        alt: 'Panel de discusión',
      },
      {
        url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
        alt: 'Área de stands',
      },
    ],
  },
  {
    id: '3',
    title: 'Keynote: El Futuro de la Tecnología',
    subtitle: 'Conferencia magistral de nuestra keynote speaker',
    kind: 'YOUTUBE',
    text: 'No te pierdas esta inspiradora charla sobre las tendencias tecnológicas que definirán la próxima década.',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: 'Playlist Oficial del Evento',
    subtitle: 'La música que nos acompaña durante la conferencia',
    kind: 'SPOTIFY',
    text: 'Disfruta de nuestra selección musical especialmente curada para crear el ambiente perfecto.',
    spotifyId: 'playlist/37i9dQZF1DXcBWIGoYBM5M',
  },
  {
    id: '5',
    title: 'Registro de Asistentes',
    subtitle: 'Completa tu registro para acceder a todas las actividades',
    kind: 'LINK',
    linkUrl: 'https://forms.gle/example',
    linkLabel: 'Completar registro ahora',
    medias: [
      {
        url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=100&h=100&fit=crop',
        alt: 'Icono de registro',
      },
    ],
  },
  {
    id: '6',
    title: 'Talleres Prácticos Disponibles',
    subtitle: 'Inscríbete en los talleres de tu interés',
    kind: 'TEXT_IMAGE',
    text: 'Este año ofrecemos 12 talleres prácticos en diferentes áreas:\n\n• Desarrollo Web Moderno\n• Inteligencia Artificial\n• UX/UI Design\n• Cloud Computing\n• Blockchain\n• Y más...',
    medias: [
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
        alt: 'Taller en progreso',
      },
    ],
  },
  {
    id: '7',
    title: 'Mapa del Evento',
    subtitle: 'Encuentra tu camino en el venue',
    kind: 'LINK',
    linkUrl: 'https://maps.google.com',
    linkLabel: 'Ver mapa interactivo',
  },
  {
    id: '8',
    title: 'Networking Coffee Break',
    subtitle: 'Momentos para conectar con otros profesionales',
    kind: 'TEXT_IMAGE',
    text: 'Aprovecha los coffee breaks programados para conocer a otros asistentes, speakers y sponsors.\n\nHorarios:\n• 10:30 - 11:00 AM\n• 3:30 - 4:00 PM',
    medias: [
      {
        url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
        alt: 'Coffee break',
      },
    ],
  },
];
