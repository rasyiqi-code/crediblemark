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
    targetBusinessScale: z.string().optional(),
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
        const requestedScale = input.targetBusinessScale || 'AUTO';

        const scaleLabels: Record<string, string> = {
            'ULTRA_MICRO': 'Ultra Mikro (UMi)',
            'MICRO': 'Mikro',
            'SMALL': 'Kecil',
            'MEDIUM': 'Menengah (SME)',
            'ENTERPRISE': 'Besar (Enterprise)',
            'AUTO': 'Deteksi Otomatis (Insting AI)'
        };
        const activeScaleLabel = scaleLabels[requestedScale] || scaleLabels['AUTO'];

        // Hitung harga konsumen untuk referensi skala bisnis
        const consumerPrice = discount > 0 ? basePrice * (1 - (discount / 100)) : basePrice;

        // Aturan penentuan harga addon berdasarkan infrastruktur & kompleksitas fitur kustom secara realistis
        let addonsPricingRule = "";
        
        // Aturan umum penentuan harga domain (selalu murah & realistis di semua skala bisnis)
        const domainRule = `- Domain Registration: IDR 149,000 - 245,000/year (USD 10 - 20/year) (interval: yearly). (Sangat penting: ini biaya domain standar di pasaran, jangan dipasang mahal meskipun skala bisnisnya besar).`;

        // Aturan penentuan harga custom addon berdasarkan kompleksitas teknis (bukan harga jasa utama)
        const customComplexityRule = `- Custom Functional/Business Addons (Harganya HARUS didasarkan murni pada kompleksitas teknis fiturnya, BUKAN berdasarkan harga layanan utama):
  * Low Complexity (misal: widget sederhana, link sosmed, tracking pixel, form kontak dasar): IDR 190,000 - 490,000 / USD 19 - 49.
  * Medium Complexity (misal: integrasi WhatsApp gateway, multi-bahasa, kalender/booking, filter pencarian kustom): IDR 490,000 - 1,490,000 / USD 49 - 149.
  * High Complexity (misal: payment gateway, AI chatbot kustom 24/7, sinkronisasi CRM, sistem membership/poin loyalitas, dashboard penjualan): IDR 1,490,000 - 3,990,000 / USD 149 - 399.`;

        if (requestedScale === "ULTRA_MICRO" || requestedScale === "MICRO") {
            addonsPricingRule = `The target business scale is \`ULTRA_MICRO\` / \`MICRO\`. You MUST strictly select the pricing of the addons from these ranges:
- Hosting: IDR 35,000 - 75,000/month OR IDR 350,000 - 750,000/year (USD 3 - 7/month OR USD 30 - 70/year).
${domainRule}
- Maintenance & Support: IDR 99,000 - 195,000/month (USD 9 - 19/month).
${customComplexityRule}`;
        } else if (requestedScale === "SMALL" || requestedScale === "MEDIUM") {
            addonsPricingRule = `The target business scale is \`SMALL\` / \`MEDIUM\` (SME). You MUST strictly select the pricing of the addons from these ranges:
- Hosting: IDR 75,000 - 195,000/month OR IDR 750,000 - 1,950,000/year (USD 7 - 19/month OR USD 70 - 190/year).
${domainRule}
- Maintenance & Support: IDR 190,000 - 490,000/month (USD 19 - 49/month).
${customComplexityRule}`;
        } else if (requestedScale === "ENTERPRISE") {
            addonsPricingRule = `The target business scale is \`ENTERPRISE\`. You MUST strictly select the pricing of the addons from these ranges:
- Hosting (VPS/Cloud Enterprise): IDR 195,000 - 495,000/month OR IDR 1,950,000 - 4,950,000/year (USD 19 - 49/month OR USD 190 - 490/year).
${domainRule}
- Maintenance & Support: IDR 490,000 - 990,000/month (USD 49 - 99/month).
${customComplexityRule}`;
        } else {
            addonsPricingRule = `Determine a realistic price for the addons matching a standard business scale.
- Hosting: IDR 35k - 495k/month OR IDR 350k - 4.95M/year (USD 3 - 49/month OR USD 30 - 490/year).
${domainRule}
- Maintenance & Support: IDR 99k - 990k/month (USD 9 - 99/month).
${customComplexityRule}`;
        }

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.7
            },
            prompt: `
Role: Expert Product Manager, Business Strategist, & Upsell Expert.
Task: Generate 7-10 specific, highly valuable, and essential add-ons for the service below (including 4 mandatory infrastructure add-ons and 3-6 custom functional/business add-ons).

Service Profile:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Base Price: ${currency} ${basePrice} (Consumer Price: ${currency} ${consumerPrice})
- Interval: ${interval}
- Target Business Scale: \`${activeScaleLabel}\`

Rules:
1. MANDATORY ADD-ONS REQUIREMENT (CRITICAL):
   You MUST always include the following four standard add-ons in the output array, listed separately (NEVER combine hosting and domain into a single add-on):
   - **Maintenance & Support**: Services to monitor uptime, fix bugs, and perform minor adjustments. Interval should be 'monthly' or 'yearly'. (English name: "Premium Maintenance & Support", Indonesian name_id: "Pemeliharaan & Dukungan Premium").
   - **Web/Cloud Hosting / Dedicated VPS**: Server allocation and infrastructure setup. Interval should be 'monthly' or 'yearly'.
     * If the service context implies a modern dynamic app, SaaS, custom database, Node.js, Next.js, or API platform: Use English name: "Dedicated VPS / Managed Cloud App Hosting (Node.js/Next.js Ready)" and Indonesian name_id: "VPS Dedicated / Cloud App Hosting Terkelola (Node.js/Next.js Ready)". Ensure the implied scope includes database setup and cloud storage allocation.
     * If the service context implies a static page, simple CMS, local profile, or wedding invitation: Use English name: "High-Speed Shared Cloud Hosting (Database Included)" and Indonesian name_id: "Hosting Cloud Shared Cepat (Termasuk Database)".
   - **Domain Registration**: Domain name acquisition (.com, .id, etc.). Interval MUST be 'yearly'. (English name: "Domain Name Registration", Indonesian name_id: "Pendaftaran Nama Domain").
   - **All-in-One Managed Website Care (Hosting, Domain, & Maintenance)**: Full yearly managed care. We fully manage their domain, hosting (or VPS), and routine maintenance (including system updates). Interval MUST be 'yearly'. (English name: "All-in-One Managed Website Care (Hosting, Domain, & Maintenance)", Indonesian name_id: "Layanan Kelola Website All-in-One (Hosting, Domain, & Pemeliharaan)").

2. ALL-IN-ONE PRICING FORMULA (ADD-ON #4):
   - The price for "All-in-One Managed Website Care" MUST be calculated as a yearly cost:
     * Step A: Convert any monthly costs to yearly costs (e.g. Hosting_Yearly = Hosting_Monthly * 12; Maintenance_Yearly = Maintenance_Monthly * 12).
     * Step B: Sum the yearly components: Total_Base_Yearly = Hosting_Yearly + Domain_Yearly + Maintenance_Yearly.
     * Step C: Apply a 10% bundling discount to reward the client: All_In_One_Price_Yearly = Total_Base_Yearly * 0.9.
   - Example mathematical logic:
     If the generated Hosting is IDR 250,000/monthly (Yearly = IDR 3,000,000), Domain is IDR 250,000/yearly, and Maintenance is IDR 500,000/monthly (Yearly = IDR 6,000,000):
     * Total Base Yearly = 3,000,000 (hosting) + 250,000 (domain) + 6,000,000 (maintenance) = IDR 9,250,000.
     * All-in-One price (with 10% discount) = 9,250,000 * 0.9 = IDR 8,325,000.
     * Final charm rounded price: IDR 8,290,000/yearly or IDR 8,350,000/yearly.
   - CRITICAL: The yearly All-in-One price MUST be a large yearly sum matching the calculated sum of the components. Typical ranges: IDR 1.5M - 3.5M for \`UMi\`/\`Mikro\`, IDR 3M - 6M for \`Small\`/\`Medium\`, and IDR 6M - 15M for \`Enterprise\`. Never output low monthly-like numbers (like IDR 200k) for the yearly price!

3. CUSTOM FUNCTIONAL & BUSINESS ADD-ONS (MANDATORY 3-6 ITEMS):
   In addition to the four mandatory infrastructure add-ons above, you MUST generate 3-6 custom, highly valuable, and essential business/functional add-ons tailored specifically to the service's industry context. These add-ons must solve practical business pain points, drive revenue, or automate operations for the client.
   - Good examples:
     * **WhatsApp Integration & CRM**: English name: "WhatsApp Gateway Integration & Automated Notifications", Indonesian name_id: "Integrasi Gateway WhatsApp & Notifikasi Otomatis".
     * **Payment Gateway Integration**: English name: "Multi-Payment Gateway Integration (Midtrans/Xendit)", Indonesian name_id: "Integrasi Payment Gateway Multi-Metode (Midtrans/Xendit)".
     * **Shipping/Logistics Auto-Sync**: English name: "Automated Shipping & Courier Cost Calculator", Indonesian name_id: "Kalkulator Ongkos Kirim & Ekspedisi Otomatis".
     * **AI-Powered Customer Assistant**: English name: "Custom 24/7 AI Customer Support Chatbot", Indonesian name_id: "Chatbot AI Asisten Layanan Pelanggan 24/7".
     * **Membership & Loyalty Program**: English name: "Customer Loyalty, Points, & Membership System", Indonesian name_id: "Sistem Membership, Poin Loyalitas, & Voucher Diskon".
     * **Analytics Dashboard**: English name: "Interactive Business Intelligence & Sales Analytics Dashboard", Indonesian name_id: "Dashboard Analisis Penjualan & Laporan Kinerja Interaktif".
   - Avoid generic/useless features. Every generated custom addon must be highly relevant and feel indispensable.

4. NO CMS CAPACITY RESTRICTIONS:
   - Never limit database/CMS features (e.g. DO NOT limit products, categories, or image uploads). The client must have unlimited CMS capability.
   - Limit/quota fields MUST only apply to our manual deliverables (e.g. "3 Articles/Month", "Up to 3 Custom APIs Setup", "4 Hours/Month Support").

5. PRICING & TARGET BUSINESS SCALE ADJUSTMENT:
   - Addon currency must be "${currency}".
   - ${addonsPricingRule}
   - CRITICAL: DO NOT use the Base Price of the main service to scale or determine the price of custom addons. Addon prices must be determined solely by their technical complexity as specified above, regardless of the main service price.
   - Ensure addon pricing uses charm pricing numbers (e.g. ending in 90k, 95k, 99k for IDR, or .99 / .95 for USD).

6. STRICT SCHEMA ADHERENCE:
   - Your output MUST match the output schema EXACTLY.
   - For each addon, you MUST include:
     * "name": Name of the addon in English.
     * "name_id": Name of the addon translated to Indonesian.
     * "price": The calculated price (number).
     * "interval": The interval ('one_time', 'monthly', or 'yearly').
     * "currency": The currency ('USD' or 'IDR').
   - DO NOT add extra properties inside the addon objects (like "id", "description", "category", "complexity").
   - DO NOT add extra properties at the root level of the JSON (like "target_business_scale", "discount"). Only output the "addons" array at the root level.

Format Output: Raw JSON matching the schema. No markdown wrappers, no explanations.
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

