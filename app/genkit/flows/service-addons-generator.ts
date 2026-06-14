import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const serviceAddonsInputSchema = z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    description_id: z.string(),
    features: z.array(z.string()),
    features_id: z.array(z.string()),
    recommended_price: z.number(),
    discount: z.number(),
    currency: z.enum(['USD', 'IDR']),
    priceType: z.enum(['FIXED', 'STARTING_AT']),
    interval: z.enum(['one_time', 'monthly', 'yearly']),
});

const serviceAddonsOutputSchema = z.object({
    addons: z.array(z.object({
        name: z.string(),
        name_id: z.string(),
        price: z.number(),
        interval: z.enum(['one_time', 'monthly', 'yearly']),
        currency: z.enum(['USD', 'IDR'])
    }))
});

export const serviceAddonsGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceAddonsGeneratorFlow',
        inputSchema: serviceAddonsInputSchema,
        outputSchema: serviceAddonsOutputSchema,
    },
    async (input) => {
        const { apiKey, model } = await getActiveAIConfig();

        const sanitizedTitle = input.title.trim();
        const sanitizedDesc = input.description.trim();
        const basePrice = input.recommended_price;
        const discount = input.discount;
        const currency = input.currency;
        const interval = input.interval;

        // Hitung harga konsumen untuk referensi skala bisnis
        const consumerPrice = discount > 0 ? basePrice * (1 - (discount / 100)) : basePrice;

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.7
            },
            prompt: `
You are an expert product manager and upsell strategist for a digital agency.
Your task is to analyze the service details and pricing provided below, and generate a list of highly specific, high-value add-ons that fit this offering.

Service Profile:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Base Price (Original): ${currency} ${basePrice}
- Discount: ${discount}% (Consumer Price: ${currency} ${consumerPrice})
- Interval: ${interval}

=== ADD-ONS GENERATION RULES ===
1. Quantity: Generate between 2 to 4 highly specific add-ons.
2. SCOPE SEGREGATION (CRITICAL):
   - Keep the base package features simple and essential.
   - Add-ons should represent advanced, specialized, or extra features (such as online reservation/booking, custom integrations, analytics dashboard, performance optimizations, or monthly maintenance/retainer).
3. BUSINESS SCALE ADD-ON PRICING (CRITICAL):
   - Harga add-on ("price") wajib disesuaikan secara logis dengan skala bisnis (dilihat dari Consumer Price ${currency} ${consumerPrice}) agar terjangkau dan disetujui klien:
     * Indonesia (IDR):
       - Jika Consumer Price < 2 Juta (Ultra Mikro):
         * One-Time Add-ons: IDR 249,000 s.d. IDR 490,000.
         * Monthly Add-ons: IDR 49,000 s.d. IDR 149,000.
       - Jika Consumer Price 2 Juta - 3.5 Juta (Mikro):
         * One-Time Add-ons: IDR 490,000 s.d. IDR 990,000.
         * Monthly Add-ons: IDR 99,000 s.d. IDR 290,000.
       - Jika Consumer Price 3.5 Juta - 9 Juta (Kecil):
         * One-Time Add-ons: IDR 990,000 s.d. IDR 1,990,000.
         * Monthly Add-ons: IDR 190,000 s.d. IDR 490,000.
       - Jika Consumer Price 9 Juta - 20 Juta (Menengah/SME):
         * One-Time Add-ons: IDR 1,990,000 s.d. IDR 3,990,000.
         * Monthly Add-ons: IDR 390,000 s.d. IDR 790,000.
       - Jika Consumer Price > 20 Juta (Besar/Enterprise):
         * One-Time Add-ons: IDR 3,990,000 s.d. IDR 7,950,000.
         * Monthly Add-ons: IDR 490,000 s.d. IDR 990,000.
     * Global (USD):
       - Jika Consumer Price < USD 200: One-Time max USD 49, Monthly max USD 15.
       - Jika Consumer Price USD 200 - USD 350: One-Time max USD 99, Monthly max USD 29.
       - Jika Consumer Price USD 350 - USD 900: One-Time max USD 199, Monthly max USD 49.
       - Jika Consumer Price USD 900 - USD 2000: One-Time max USD 399, Monthly max USD 79.
       - Jika Consumer Price > USD 2000: One-Time max USD 799, Monthly max USD 99.

   - "currency" untuk addons harus sama dengan currency dasar: "${currency}".
   - "price" untuk addons harus berupa angka CHARM/ganjil. JANGAN gunakan angka genap bulat.

4. ADD-ON NAME SPECIFICITY (CRITICAL — MANDATORY):
   - "name" and "name_id" MUST be specific and self-explanatory. Include details such as deliverables, scope, target integrations, or realistic frequency directly in the name.
   - NEVER use short generic names (e.g. avoid plain "SEO" or "Maintenance").
   - DO NOT invent arbitrary system/capacity limits on the client's business operations (such as limiting the number of physical inventory units, showroom items, products, or database entries). Our agency does NOT sell hosting, servers, or domains.
   - Quotas/limits MUST ONLY apply to the agency's service deliverables (e.g., "3 Articles/Month", "Up to 3 API setups", "4 hours of support/month", "2 custom page designs").
   - Good examples:
     * "SEO Content Writing - 3 Articles/Month (500-800 Words Each)"
     * "WhatsApp API Setup & Integration (Up to 3 Custom Event Triggers)"
     * "Monthly Performance Support - 4 Hours/Month Support Retainer"
     * "Custom Lead Capture Form with CRM Auto-Sync (HubSpot/Zoho)"
     * "Konten Blog SEO - 3 Artikel/Bulan (600-800 Kata)"

=== REQUIRED JSON OUTPUT FORMAT ===
You MUST return ONLY a raw JSON object with NO markdown, NO explanation, NO code block wrappers. The JSON must exactly match this structure:

{
  "addons": [
    {
      "name": "string (specific: include quantity/frequency/scope)",
      "name_id": "string (spesifik dalam bahasa Indonesia)",
      "price": 0,
      "interval": "one_time",
      "currency": "USD"
    }
  ]
}
            `,
            output: {
                schema: serviceAddonsOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate service addons");
        }

        return output;
    }
);
