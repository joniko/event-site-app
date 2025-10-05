/**
 * Supabase Auth Server Helpers
 *
 * For use in API routes and Server Components only
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from './db';
import { profiles } from './db/schema';
import { eq } from 'drizzle-orm';

// Server-side Supabase client (for API routes and server components)
export const createServerClient = async () => {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// Get current user from server
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Check if user has admin/editor role
export async function isAdminOrEditor() {
  const user = await getCurrentUser();
  if (!user) return false;

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    return profile?.role === 'ADMIN' || profile?.role === 'EDITOR';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

// Get user profile with role
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}
