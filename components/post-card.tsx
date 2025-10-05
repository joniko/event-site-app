'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export type PostKind = 'TEXT_IMAGE' | 'CAROUSEL' | 'YOUTUBE' | 'SPOTIFY' | 'LINK';

export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  kind: PostKind;
  text?: string;
  medias?: Array<{ url: string; alt: string }>;
  youtubeId?: string;
  spotifyId?: string;
  linkUrl?: string;
  linkLabel?: string;
  pinned?: boolean;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadFullEmbed, setLoadFullEmbed] = useState(false);

  const nextSlide = () => {
    if (post.medias) {
      setCurrentSlide((prev) => (prev + 1) % post.medias!.length);
    }
  };

  const prevSlide = () => {
    if (post.medias) {
      setCurrentSlide((prev) => (prev - 1 + post.medias!.length) % post.medias!.length);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {post.pinned && (
        <div className="bg-blue-600 text-white text-xs font-medium px-4 py-1">
          📌 Destacado
        </div>
      )}

      <div className="p-4">
        <h2 className="text-xl font-bold mb-1">{post.title}</h2>
        {post.subtitle && (
          <p className="text-sm text-gray-600 mb-3">{post.subtitle}</p>
        )}
        {post.text && (
          <p className="text-gray-700 mb-4 whitespace-pre-line">{post.text}</p>
        )}
      </div>

      {/* TEXT_IMAGE variant */}
      {post.kind === 'TEXT_IMAGE' && post.medias && post.medias.length > 0 && (
        <div className="relative w-full aspect-video bg-gray-100">
          <Image
            src={post.medias[0].url}
            alt={post.medias[0].alt || post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* CAROUSEL variant */}
      {post.kind === 'CAROUSEL' && post.medias && post.medias.length > 0 && (
        <div className="relative">
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={post.medias[currentSlide].url}
              alt={post.medias[currentSlide].alt || `${post.title} - slide ${currentSlide + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {post.medias.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {post.medias.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Ir a slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* YOUTUBE variant */}
      {post.kind === 'YOUTUBE' && post.youtubeId && (
        <div className="relative w-full aspect-video bg-gray-900">
          {!loadFullEmbed ? (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setLoadFullEmbed(true)}>
              <Image
                src={`https://img.youtube.com/vi/${post.youtubeId}/maxresdefault.jpg`}
                alt={`${post.title} - YouTube thumbnail`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Click para cargar video
              </div>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${post.youtubeId}`}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      )}

      {/* SPOTIFY variant */}
      {post.kind === 'SPOTIFY' && post.spotifyId && (
        <div className="p-4 bg-gray-50">
          {!loadFullEmbed ? (
            <button
              onClick={() => setLoadFullEmbed(true)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Cargar reproductor de Spotify
            </button>
          ) : (
            <iframe
              src={`https://open.spotify.com/embed/${post.spotifyId}`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={post.title}
              className="rounded-lg"
            />
          )}
        </div>
      )}

      {/* LINK variant */}
      {post.kind === 'LINK' && post.linkUrl && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
          >
            {post.medias && post.medias.length > 0 ? (
              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={post.medias[0].url}
                  alt={post.medias[0].alt || 'Link icon'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition truncate">
                {post.linkLabel || 'Ver más'}
              </p>
              <p className="text-xs text-gray-500 truncate">{post.linkUrl}</p>
            </div>

            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" />
          </a>
        </div>
      )}
    </article>
  );
}

// Loading skeleton
export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="w-full aspect-video bg-gray-200" />
    </div>
  );
}
