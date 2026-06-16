import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent Cross-Site Scripting (XSS) attacks.
 * Safe to use in both Server Components and Client Components in Next.js.
 * 
 * @param html Original dirty HTML string
 * @returns Cleaned and safe HTML string
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return "";
    
    if (typeof window === 'undefined') {
        // Di server, lakukan pembersihan tag script dan atribut inline event handler
        // tanpa memuat jsdom (yang menyebabkan error ESM/bundling di Vercel)
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, "");
    }
    
    // Di client, gunakan dompurify secara aman
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true }
    });
}
