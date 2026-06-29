import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User as DbUser } from "@prisma/client";

// The single innovator/admin is identified by email (env-configured).
export function isInnovatorEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === process.env.INNOVATOR_EMAIL?.toLowerCase();
}

// Current Supabase auth user (or null). Use in Server Components / Route Handlers.
export async function getAuthUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Ensures a row exists in our public `User` table mirroring the Supabase auth
// user, then returns it. Call after login / on protected pages.
export async function getCurrentUser(): Promise<DbUser | null> {
  const authUser = await getAuthUser();
  if (!authUser?.email) return null;

  const provider =
    authUser.app_metadata?.provider === "google" ? "google" : "email";

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: { email: authUser.email },
    create: {
      id: authUser.id,
      email: authUser.email,
      fullName: (authUser.user_metadata?.full_name as string) ?? null,
      authProvider: provider,
    },
  });

  return user;
}

export async function isInnovator(): Promise<boolean> {
  const authUser = await getAuthUser();
  return isInnovatorEmail(authUser?.email);
}
