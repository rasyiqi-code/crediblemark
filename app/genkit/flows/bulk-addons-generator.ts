import { z } from "genkit";
import { ai, getActiveAIConfig } from "../ai";

const bulkAddonsInputSchema = z.object({
    prompt: z.string().optional(),
    currency: z.enum(["USD", "IDR"]),
    existingAddons: z.array(z.string()).optional(),
    count: z.number().optional()
});

const bulkAddonsOutputSchema = z.object({
    addons: z.array(z.object({
        name: z.string(),
        name_id: z.string(),
        price: z.number(),
        interval: z.enum(["one_time", "monthly", "yearly"]),
        currency: z.enum(["USD", "IDR"])
    }))
});

export const bulkAddonsGeneratorFlow = ai.defineFlow(
    {
        name: "bulkAddonsGeneratorFlow",
        inputSchema: bulkAddonsInputSchema,
        outputSchema: bulkAddonsOutputSchema,
    },
    async (input) => {
        const { apiKey, model } = await getActiveAIConfig();
        const promptText = input.prompt?.trim() || "Layanan IT kustom, optimasi, keamanan, dan pemasaran digital";
        const currency = input.currency;
        const existingAddons = input.existingAddons || [];
        const count = input.count || 10;

        // Rentang harga murni berdasarkan tingkat kerumitan addon
        const pricingRangeRule = `Determine the pricing of each addon based on its technical complexity:
- **Low Complexity** (misal: widget sederhana, tracking pixel, form kontak dasar, integrasi sosmed):
  * Rentang Harga: IDR 190,000 - 490,000 / USD 19 - 49.
- **Medium Complexity** (misal: sistem multi-bahasa, kalender/booking, integrasi WhatsApp gateway/API kustom):
  * Rentang Harga: IDR 490,000 - 1,490,000 / USD 49 - 149.
- **High Complexity** (misal: payment gateway penuh, chatbot AI kustom 24/7, sinkronisasi CRM, sistem membership/loyalitas, dashboard penjualan/laporan):
  * Rentang Harga: IDR 1,490,000 - 3,990,000 / USD 149 - 399.

Pastikan setiap harga menggunakan angka psikologis (charm pricing) yang realistis (misal: akhiran 90rb, 95rb, 99rb untuk IDR, atau .99 / .95 untuk USD).`;

        // Susun teks daftar addon yang sudah ada untuk instruksi larangan duplikasi
        const existingAddonsText = existingAddons.length > 0 
            ? `Daftar addon yang sudah ada di database saat ini:\n${existingAddons.map(name => `- "${name}"`).join("\n")}\n\nPENTING: Kamu DILARANG KERAS menghasilkan addon baru yang memiliki nama, fungsi, atau nilai manfaat yang mirip/identik dengan daftar addon di atas untuk menghindari duplikasi!`
            : "Tidak ada addon yang sudah ada saat ini.";

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.85 // Temperatur lebih tinggi agar variasi ide lebih kaya
            },
            prompt: `
Role: Senior Product Manager & Growth Specialist.
Task: Generate exactly ${count} unique, highly professional, and realistic service addons.

Input Details:
- User Prompt / Focus Theme: "${promptText}"
- Target Currency: ${currency}
- Existing Addons:
${existingAddonsText}

Rules:
1. QUANTITY: Hasilkan TEPAT ${count} addon dalam array. Tidak boleh kurang atau lebih.
2. UNIQUENESS & TECHNICAL DIFFERENTIATION (CRITICAL):
   - Kamu HARUS memastikan tidak ada addon yang dihasilkan menduplikasi, mirip, atau memiliki fungsi yang tumpang tindih dengan daftar addon yang sudah ada saat ini.
   - Setiap dari ${count} addon yang dihasilkan HARUS memiliki area fokus teknis (job description) yang terisolasi dan spesifik.
   - Distribusikan addon ke dalam domain teknis yang berbeda agar tidak terjadi bentrokan area jobdisc, misalnya:
     * Keamanan/Security (e.g., Security Hardening, SSL, & Firewall Setup)
     * Analitik/Tracking (e.g., Google Analytics 4 & Event Tracking Setup)
     * Komunikasi/Notifikasi (e.g., WhatsApp Gateway API Integration)
     * Kecepatan/Kinerja (e.g., Caching, Core Web Vitals, & CDN Optimization)
     * SEO/Metadata (e.g., Advanced Schema Markup & Sitemap Automation)
     * Interaksi/Fungsionalitas User (e.g., Interactive Booking & Appointment Calendar)
     * Otomasi/AI (e.g., Customer Support AI Chatbot Integration)
     * Backup/Pemeliharaan (e.g., Automated Daily Cloud Backup System)
     * Integrasi CRM/Email Marketing (e.g., Mailchimp Newsletter Synchronization)
     * E-commerce/Keuangan (e.g., PDF Invoice Auto-generator & Tax Rules Setup)
   - DILARANG KERAS membuat dua addon yang melakukan pekerjaan sejenis dalam paket rilis yang sama (misalnya: tidak boleh ada "Facebook Pixel Setup" dan "TikTok Pixel Setup" terpisah; gabungkan ke "Multi-Platform Pixel Setup" atau pilih salah satu saja).
3. LANGUAGE:
   - "name": Nama addon dalam Bahasa Inggris (misal: "Google Analytics 4 & Custom Dashboards Setup").
   - "name_id": Terjemahan nama addon dalam Bahasa Indonesia (misal: "Setup Google Analytics 4 & Dashboard Kustom").
4. PRICING & INTERVAL:
   - Mata uang HARUS "${currency}".
   - ${pricingRangeRule}
   - Tentukan interval yang paling sesuai: 'one_time' (setup/integrasi), 'monthly' atau 'yearly' (langganan pemeliharaan berkala).
5. SCHEMA MATCHING:
   - Output harus sesuai skema JSON persis. Hanya output JSON.

Format Output: Raw JSON matching the schema. No markdown wrappers, no explanations.
            `,
            output: {
                schema: bulkAddonsOutputSchema
            }
        });

        if (!output) {
            throw new Error("Gagal menghasilkan draf addon massal");
        }

        return output;
    }
);
