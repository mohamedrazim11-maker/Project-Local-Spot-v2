import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
    // 1. Fallback strings to prevent application crashes if env variables fail to load
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // If environment variables are entirely missing, bypass middleware to prevent a dead-page crash
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Middleware warning: Supabase environment variables are missing.");
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. Initialize the Server-Side Client Safely
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    // 3. Retrieve user session data 
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Protection Guardrails
    // Guard A: Kick unauthenticated users out of the dashboard back to /login
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Guard B: Redirect authenticated users away from /login straight into the dashboard
    if (user && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

// 5. Route Matcher Rules
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};