import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getUser().
  // A simple mistake could make it very hard to debug issues with users being
  // randomly logged out.

  // IMPORTANT: DO NOT REPLACE getUser() with getSession(). getUser() sends a
  // request to the Supabase Auth server to revalidate the Auth token.
  // getSession() does not, and the data it returns may be stale.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/forgot-password') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/waitlist') &&
    pathname !== '/'
  ) {
    // No user and trying to access protected route — redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/forgot-password'))
  ) {
    // User is logged in but on auth pages — redirect to app
    const url = request.nextUrl.clone();
    url.pathname = '/output';
    return NextResponse.redirect(url);
  }

  // Onboarding gate — only active once NEXT_PUBLIC_ONBOARDING_GATE=true
  if (user && process.env.NEXT_PUBLIC_ONBOARDING_GATE === 'true') {
    const onboardingDone = request.cookies.get('output-onboarding-done')?.value === '1';

    if (
      !onboardingDone &&
      !pathname.startsWith('/onboarding') &&
      !pathname.startsWith('/auth') &&
      pathname !== '/'
    ) {
      // Authenticated user hasn't completed onboarding — send to wizard
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    if (onboardingDone && pathname.startsWith('/onboarding')) {
      // Already onboarded — redirect away from onboarding
      const url = request.nextUrl.clone();
      url.pathname = '/output';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
