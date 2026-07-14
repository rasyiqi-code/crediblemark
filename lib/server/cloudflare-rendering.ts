import { getSettingValue } from "@/lib/server/settings";

/**
 * Ensures a URL has a protocol (defaults to https if missing).
 */
function ensureAbsoluteUrl(url: string): string {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

/**
 * Enhances HTML by rewriting links to be absolute and proxying fonts.
 */
export function enhanceHtml(html: string, url: string, localBaseUrl?: string): string {
    try {
        const absoluteUrl = ensureAbsoluteUrl(url);
        const urlObj = new URL(absoluteUrl);
        
        // Basic validation: must have a hostname with a dot or be localhost
        if (!urlObj.hostname || (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost')) {
            throw new Error("Invalid hostname");
        }

        const origin = urlObj.origin;
        const baseUrl = absoluteUrl.split('?')[0].split('#')[0];
        
        // Correct baseDir calculation: if no path or just /, it's origin + /
        // Otherwise it's the directory of the current file
        let baseDir = origin + "/";
        if (urlObj.pathname !== "/" && urlObj.pathname !== "") {
            baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        }
        
        let enhancedHtml = html;

        // Add <base> tag and Luxury Scrollbar CSS
        const scrollbarCss = `
        <style>
            ::-webkit-scrollbar { width: 5px; height: 5px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
            :hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
            ::-webkit-scrollbar-thumb:hover { background: rgba(234, 211, 8, 0.5) !important; }
            html, body { scrollbar-width: thin; scrollbar-color: transparent transparent; }
            :hover { scrollbar-color: rgba(255, 255, 255, 0.1) transparent; }
            @media (max-width: 768px) {
                ::-webkit-scrollbar { display: none; }
                html, body { scrollbar-width: none; -ms-overflow-style: none; }
            }
        </style>`;

        if (!enhancedHtml.includes("<base") && enhancedHtml.includes("<head>")) {
            enhancedHtml = enhancedHtml.replace("<head>", `<head><base href="${baseDir}">${scrollbarCss}`);
        } else if (enhancedHtml.includes("<head>")) {
            enhancedHtml = enhancedHtml.replace("<head>", `<head>${scrollbarCss}`);
        }

        // Konfigurasi AssetProxy - HARUS berupa URL lokal absolut untuk mengabaikan tag <base>
        const isDev = process.env.NODE_ENV === 'development';
        const isTest = process.env.NODE_ENV === 'test';
        let defaultLocalBase = isDev ? 'http://localhost:3000' : (isTest ? "" : (process.env.NEXT_PUBLIC_APP_URL || ""));
        if (defaultLocalBase.endsWith('/')) {
            defaultLocalBase = defaultLocalBase.slice(0, -1);
        }

        let cleanedLocalBaseUrl = localBaseUrl;
        if (cleanedLocalBaseUrl && cleanedLocalBaseUrl.endsWith('/')) {
            cleanedLocalBaseUrl = cleanedLocalBaseUrl.slice(0, -1);
        }

        const proxyUrl = cleanedLocalBaseUrl 
            ? `${cleanedLocalBaseUrl}/api/proxy/asset?url=` 
            : (defaultLocalBase ? `${defaultLocalBase}/api/proxy/asset?url=` : `/api/proxy/asset?url=`);
        
        // OPTIMASI H9: Gabungkan 3 operasi regex replace terpisah menjadi single pass replacement untuk menghemat memori & CPU
        const combinedRegex = /(?:(href|src)="\/([^/][^"]+\.(?:woff2?|ttf|otf)(?:\?[^"]*)?)"|(href|src)="(https?:\/\/[^"]+\.(?:woff2?|ttf|otf)(?:\?[^"]*)?)"|url\(['"]?([^'")]+\.(?:woff2?|ttf|otf)(?:\?[^"]*)?)(?=['"]?\)))/g;
        
        enhancedHtml = enhancedHtml.replace(combinedRegex, (match, attrRel, pathRel, attrAbs, urlAbs, pathUrl) => {
            if (attrRel && pathRel) {
                // 1. Rewrite relative fonts to be absolute Local Proxy URLs
                return `${attrRel}="${proxyUrl}${origin}/${pathRel}"`;
            }
            if (attrAbs && urlAbs) {
                // 2. Bungkus font eksternal absolut dalam Proxy absolut
                if (urlAbs.includes("/api/proxy")) {
                    return match;
                }
                return `${attrAbs}="${proxyUrl}${urlAbs}"`;
            }
            if (pathUrl) {
                // 3. Rewrite url() patterns in internal <style> blocks
                const absoluteFontUrl = pathUrl.startsWith('http') 
                    ? pathUrl 
                    : (pathUrl.startsWith('/') ? `${origin}${pathUrl}` : `${baseDir}${pathUrl}`);
                return `url("${proxyUrl}${absoluteFontUrl}"`;
            }
            return match;
        });

        return enhancedHtml;
    } catch (e) {
        console.warn("[CloudflareProxy] Link rewriting failed", e);
        return html;
    }
}

export async function fetchRenderedHtml(url: string, localBaseUrl?: string): Promise<string> {
    const accountId = await getSettingValue("cloudflare_account_id");
    const apiToken = await getSettingValue("cloudflare_api_token");

    const absoluteUrl = ensureAbsoluteUrl(url);

    if (!accountId || !apiToken) {
        console.warn("[CloudflareProxy] Kredensial tidak ditemukan (cloudflare_account_id, cloudflare_api_token) di pengaturan sistem. Menggunakan raw HTML fetch.");
        return await fetchRawHtml(url, localBaseUrl);
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/content`;

    try {
        console.log(`[CloudflareProxy] Fetching via Browser Rendering: ${absoluteUrl}`);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: absoluteUrl,
                gotoOptions: {
                    waitUntil: "networkidle2",
                }
            }),
        });

        if (!response.ok) {
            // Handle 429 specifically and silently fallback
            if (response.status === 429) {
                console.warn(`[CloudflareProxy] Rate limit reached for ${absoluteUrl}, falling back to raw fetch.`);
                return await fetchRawHtml(absoluteUrl, localBaseUrl);
            }

            const errorText = await response.text();
            console.error(`[CloudflareProxy] Status: ${response.status}, Error: ${errorText}`);
            throw new Error(`Cloudflare Browser Rendering failed (${response.status}): ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        let html = "";
        
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.success && data.result) {
                html = typeof data.result === 'string' ? data.result : (data.result.content || "");
            } else {
                console.error(`[CloudflareProxy] API Error: ${JSON.stringify(data.errors)}`);
                throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
            }
        } else {
            html = await response.text();
        }

        return enhanceHtml(html, url, localBaseUrl);
    } catch (error) {
        console.error("[CloudflareProxy] Rendering Error:", error);
        // Fallback to simple fetch for any other top-level error (e.g. network timeout)
        return await fetchRawHtml(url, localBaseUrl);
    }
}

/**
 * Fallback: Fetches raw HTML without JavaScript execution.
 * Still applies the rewriter for absolute links and font proxying.
 */
async function fetchRawHtml(url: string, localBaseUrl?: string): Promise<string> {
    try {
        console.log(`[CloudflareProxy] Fetching Raw HTML (Fallback): ${url}`);
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            // Removed next.revalidate as it's already wrapped in unstable_cache in actions.ts
            // and can cause confusing double-caching behavior/logs
        });
        
        if (!response.ok) {
            // Log as warning instead of error for 404s - it's a handled fallback
            console.warn(`[CloudflareProxy] Raw fetch status ${response.status} for ${url}`);
            if (response.status === 404) {
                return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { background: #050505; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                        .c { padding: 40px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); }
                        h1 { color: #ead308; }
                    </style>
                </head>
                <body>
                    <div class="c">
                        <h1>Situs Tidak Ditemukan</h1>
                        <p>Konten di <b>${url}</b> saat ini tidak tersedia (404).</p>
                        <a href="/" style="color: #ead308;">Kembali ke Beranda</a>
                    </div>
                </body>
                </html>`;
            }
            throw new Error(`Status ${response.status}`);
        }
        
        const html = await response.text();
        return enhanceHtml(html, url, localBaseUrl);
    } catch (e) {
        console.warn("[CloudflareProxy] Fallback fetch failed (handled):", e instanceof Error ? e.message : String(e));
        // Premium Smart Redirect Page
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    background: #050505; 
                    color: white; 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                    overflow: hidden;
                }
                .container {
                    padding: 40px;
                    border-radius: 32px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(20px);
                    max-width: 400px;
                }
                h1 { font-size: 20px; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 10px; }
                p { font-size: 13px; color: #71717a; margin-bottom: 25px; line-height: 1.6; }
                .btn {
                    background: #ead308;
                    color: black;
                    padding: 12px 28px;
                    border-radius: 100px;
                    text-decoration: none;
                    font-size: 12px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    transition: all 0.3s;
                    display: inline-block;
                }
                .btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(234,211,8,0.3); }
                .loader {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(234,211,8,0.1);
                    border-top: 3px solid #ead308;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
            <script>
                // Smart Redirect: Escape the frame and go to the source if preview fails
                // Disabled in development to prevent annoying redirects while debugging
                const isDev = ${process.env.NODE_ENV === 'development'};
                if (!isDev) {
                    setTimeout(() => {
                        try {
                            window.top.location.href = "${url}";
                        } catch (e) {
                            window.location.href = "${url}";
                        }
                    }, 3000);
                }
            </script>
        </head>
        <body>
            <div class="container">
                <div class="loader"></div>
                <h1>PREVIEW SECURING...</h1>
                <p>Establishing a direct connection to<br/><span style="color: #ead308; font-family: monospace;">${url}</span></p>
                <a href="${url}" target="_blank" class="btn">Launch Site</a>
            </div>
        </body>
        </html>`;
    }
}
/**
 * Checks if a URL allows being displayed in an iframe.
 * Returns true if it's blocked by X-Frame-Options or CSP.
 */
export async function isFrameBlocked(url: string): Promise<boolean> {
    try {
        const absoluteUrl = ensureAbsoluteUrl(url);
        const response = await fetch(absoluteUrl, { 
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 86400 } // Cache this check for 24 hours
        });

        const xFrameOptions = response.headers.get('x-frame-options')?.toLowerCase();
        const csp = response.headers.get('content-security-policy')?.toLowerCase();

        // Check X-Frame-Options
        if (xFrameOptions === 'deny' || xFrameOptions === 'sameorigin') {
            return true;
        }

        // Check CSP frame-ancestors
        if (csp && (csp.includes('frame-ancestors \'none\'') || csp.includes('frame-ancestors \'self\''))) {
            return true;
        }

        return false;
    } catch {
        // If we can't even HEAD the site, it might be heavily protected, safer to proxy
        return true;
    }
}
