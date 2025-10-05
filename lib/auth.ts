/**
 * Supabase Auth Helpers
 * 
 * Utilities for authentication with Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
export const createBrowserClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server-side Supabase client (for API routes and server components)
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
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
      emailRedirectTo: `${window.location.origin}/auth/callback`,
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
