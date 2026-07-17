import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache memori untuk menyimpan hasil deteksi geolokasi IP klien guna menghindari pemanggilan API eksternal berulang kali
const ipCache = new Map<string, { countryCode: string; expiry: number }>();
const CACHE_TTL = 3600 * 1000; // Cache berlaku selama 1 jam
const MAX_CACHE_SIZE = 1000; // Batas ukuran cache untuk mencegah pemborosan memori RAM (memory leak)

export default async function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") || "";

    // 0. Validasi host untuk local development (mencegah akses subdomain tidak sah di lokal)
    const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname.includes("[::1]");
    if (isLocal) {
        const cleanHost = hostname.replace(/:\d+$/, ""); // Hapus port
        if (cleanHost !== "localhost" && cleanHost !== "127.0.0.1" && cleanHost !== "[::1]") {
            return new NextResponse("Not Found", { status: 404 });
        }
    }

    const pathname = request.nextUrl.pathname;

    // 1. Identify Locale and Clean Path
    const locales = ['en', 'id'];
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    let locale = 'en'; // Default fallback
    let cleanPathname = pathname;

    if (pathnameHasLocale) {
        const pathLocale = pathname.split('/')[1];
        if (locales.includes(pathLocale)) {
            locale = pathLocale;
            cleanPathname = pathname.replace(`/${locale}`, '') || '/';
        }
    }

    // 2. Auth Check (Dashboard) - Check on CLEAN pathname to cover /id/dashboard etc.
    if (cleanPathname.startsWith("/dashboard")) {
        // Melakukan dynamic import hexclaveServerApp hanya ketika mengakses dashboard.
        // Ini mempercepat cold start dan mengurangi penggunaan memori untuk request non-dashboard.
        const { hexclaveServerApp } = await import("@/lib/config/hexclave");
        const user = await hexclaveServerApp.getUser().catch(() => null);
        if (!user) {
            return NextResponse.redirect(new URL("/handler/sign-in", request.url));
        }
    }

    // 3. Logic for paths WITHOUT locale (e.g. /, /squad)
    if (!pathnameHasLocale) {
        // Detect preference: Cookie > Browser > Geo > IP-API Fallback > Default
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
        const acceptLanguage = request.headers.get('accept-language');
        let geoCountry = (request as NextRequest & { geo?: { country?: string } }).geo?.country || request.headers.get('x-vercel-ip-country');

        // Skip IP-API in development or for localhost to speed up rendering
        const isDev = process.env.NODE_ENV === 'development';
        const isLocalhost = request.headers.get('host')?.includes('localhost');

        // Fallback ke IP-API jika informasi geo tidak ada (untuk lingkungan non-Vercel)
        if (!geoCountry && !isDev && !isLocalhost) {
            try {
                const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || (request as NextRequest & { ip?: string }).ip;
                if (ip && ip !== '127.0.0.1' && ip !== '::1') {
                    // Periksa apakah data lokasi IP sudah tersimpan di cache memori
                    const cachedGeo = ipCache.get(ip);
                    if (cachedGeo && cachedGeo.expiry > Date.now()) {
                        geoCountry = cachedGeo.countryCode;
                    } else {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 500);

                        try {
                            const ipRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
                                signal: controller.signal
                            });

                            if (ipRes.ok) {
                                const data = await ipRes.json();
                                if (data.countryCode) {
                                    const code: string = data.countryCode;
                                    geoCountry = code;
                                    // Batasi ukuran cache sebelum menyimpan entri baru untuk mencegah kebocoran memori (memory leak)
                                    if (ipCache.size >= MAX_CACHE_SIZE) {
                                        // 1. Bersihkan semua entri yang sudah expired terlebih dahulu
                                        const now = Date.now();
                                        for (const [key, val] of ipCache.entries()) {
                                            if (val.expiry <= now) {
                                                ipCache.delete(key);
                                            }
                                        }
                                        
                                        // 2. Jika masih penuh, hapus entri tertua (FIFO)
                                        if (ipCache.size >= MAX_CACHE_SIZE) {
                                            const oldestKey = ipCache.keys().next().value;
                                            if (oldestKey !== undefined) {
                                                ipCache.delete(oldestKey);
                                            }
                                        }
                                    }
                                    ipCache.set(ip, {
                                        countryCode: code,
                                        expiry: Date.now() + CACHE_TTL
                                    });
                                }
                            }
                        } finally {
                            clearTimeout(timeoutId);
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    console.warn('[Middleware] IP-API request timed out (500ms)');
                } else {
                    console.error('[Middleware] IP-API error:', err instanceof Error ? err.message : String(err));
                }
            }
        }

        let targetLocale = 'en';
        let browserLocale = null;

        if (acceptLanguage) {
            const preferredLocales = acceptLanguage
                .split(',')
                .map(lang => lang.split(';')[0].trim().slice(0, 2).toLowerCase());
            browserLocale = preferredLocales.find(lang => locales.includes(lang));
        }

        if (cookieLocale && locales.includes(cookieLocale)) {
            targetLocale = cookieLocale;
        } else if (browserLocale) {
            targetLocale = browserLocale;
        } else if (geoCountry === 'ID') {
            targetLocale = 'id';
        }

        // Redirect to localized path
        const url = new URL(`/${targetLocale}${pathname === '/' ? '' : pathname}`, request.url);
        request.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });
        return NextResponse.redirect(url);
    }

    // 4. Logic for paths WITH locale (Rewrite to clean path)
    const url = new URL(cleanPathname, request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const response = NextResponse.rewrite(url);
    response.headers.set('x-next-intl-locale', locale);
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' }); // Functionally redundant if only reading, but good for enforcing consistency

    return response;
}

export const config = {
    // Removed 'squad' from exclusions to allow localization
    matcher: ['/((?!api|admin|static|.*\\..*|_next|handler|genkit|test).*)']
};
