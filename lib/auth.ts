/**
 * Supabase Auth Helpers (Client-side only)
 *
 * For server-side auth, use @/lib/auth-server
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

// Client-side Supabase client (singleton)
let supabaseInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export const createBrowserClient = () => {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseInstance;
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

// Alternative: Sign in with magic link (no PKCE - uses old token flow)
export async function signInWithMagicLinkLegacy(email: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        email,
        create_user: true,
        data: {},
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error sending magic link');
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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
