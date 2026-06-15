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
2. UNIQUENESS (CRITICAL):
   - Kamu HARUS memastikan tidak ada addon yang dihasilkan menduplikasi atau mirip dengan daftar addon yang sudah ada saat ini.
   - Pikirkan ide addon layanan kreatif yang relevan (optimasi kecepatan, SEO booster, setup analitik, integrasi platform kustom, audit keamanan, dll).
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
