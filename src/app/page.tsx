'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient, signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import { PostCard, PostCardSkeleton } from '@/components/post-card';
import { mockPosts } from '@/lib/mock-data';
import TopBar from '@/components/TopBar';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title="Conferencia 2025"
        subtitle={user ? user.email : undefined}
        largeTitle={true}
        actions={user ? [
          {
            label: 'Mi perfil',
            onClick: () => router.push('/profile'),
          },
          {
            label: 'Configuración',
            onClick: () => router.push('/settings'),
          },
          {
            label: 'Cerrar sesión',
            onClick: handleSignOut,
            variant: 'danger',
          },
        ] : []}
      />

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Empty state if no posts */}
        {mockPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay publicaciones disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
