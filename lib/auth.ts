/**
 * Supabase Auth Helpers (Client-side only)
 *
 * For server-side auth, use @/lib/auth-server
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

// Client-side Supabase client
export const createBrowserClient = () => {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            if (name && value) {
              acc.push({ name, value: decodeURIComponent(value) });
            }
            return acc;
          }, [] as { name: string; value: string }[]);
          return cookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = [];
            cookieOptions.push(`path=${options?.path || '/'}`);
            if (options?.maxAge) cookieOptions.push(`max-age=${options.maxAge}`);
            if (options?.domain) cookieOptions.push(`domain=${options.domain}`);
            if (options?.sameSite) cookieOptions.push(`samesite=${options.sameSite}`);
            if (options?.secure) cookieOptions.push('secure');

            document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions.join('; ')}`;
          });
        },
      },
    }
  );
};

// Get current user from session
export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Check if user has admin role
export async function isAdmin() {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Check role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'ADMIN' || profile?.role === 'EDITOR';
}

// Sign in with magic link
export async function signInWithMagicLink(email: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) throw error;
}

// Sign in with Google
export async function signInWithGoogle() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (error) throw error;
}

// Sign out
export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
