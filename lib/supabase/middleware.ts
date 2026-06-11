import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  // 1. Initialize the response object ONCE
  const response = NextResponse.next({
    request,
  });

  if (!hasSupabaseConfig) {
    return response;
  }

  const supabase = createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 2. Loop through and assign values directly. 
          // NEVER re-create the NextResponse instance inside this forEach block.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  // 3. Optimize execution: Only validate auth against Supabase if hitting a protected path
  if (pathname.startsWith('/admin')) {
    const isAuthRoute = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/reset-password');

    if (!isAuthRoute) {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          const loginUrl = new URL('/admin/login', request.url);
          loginUrl.searchParams.set('next', pathname); 
          return NextResponse.redirect(loginUrl);
        }
      } catch (error) {
        console.error("Supabase auth check failed or timed out:", error);
        // Fallback safety barrier
        return NextResponse.redirect(new URL('/admin/login?error=timeout', request.url));
      }
    }
  }

  return response;
}