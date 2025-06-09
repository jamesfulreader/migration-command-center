import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    // Avoid rate-limiting the blocked page itself to prevent a redirect loop.
    if (request.nextUrl.pathname === "/blocked") {
        return NextResponse.next();
    }

    // 1. Create the response object that will be returned at the end.
    // This is the single source of truth for the outgoing response.
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. Create the Supabase client using the non-deprecated `getAll`/`setAll` methods.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    // This function is simple: it just returns all cookies from the incoming request.
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // This function is more complex. It needs to:
                    // a) Update the cookies on the incoming request object for downstream server components.
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    // b) Create a new response object with the updated cookies to send back to the browser.
                    response = NextResponse.next({
                        request,
                    });
                    // c) Apply the cookies to the new response object.
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    // 3. Get a unique identifier for the user (user ID or IP address).
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const identifier = token?.sub ?? ip;

    try {
        // 4. Call the RPC function.
        const { data: isRateLimited, error } = await supabase.rpc<string, boolean>(
            "is_rate_limited",
            {
                identifier_text: identifier,
                window_interval: "10 seconds",
                max_requests: 5,
            },
        );

        if (error) {
            console.error("Rate limit function error:", error);
            // If the function fails, it's safer to let the request through.
            return response;
        }

        // If the function returns `true`, the user IS rate-limited.
        if (isRateLimited) {
            const url = request.nextUrl.clone();
            url.pathname = "/blocked";
            return NextResponse.redirect(url);
        }
    } catch (e) {
        console.error("Error calling rate limiter:", e);
    }

    // 5. Return the final response object. This object has been updated
    // by the `setAll` method if any cookies were changed.
    return response;
}

// The matcher config remains the same.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};