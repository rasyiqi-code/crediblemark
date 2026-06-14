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
Role: Expert Product Manager & Upsell Strategist.
Task: Generate 5-7 specific, high-value add-ons for the service below.

Service Profile:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Base Price: ${currency} ${basePrice} (Consumer Price: ${currency} ${consumerPrice})
- Interval: ${interval}

Rules:
1. MANDATORY ADD-ONS REQUIREMENT (CRITICAL):
   You MUST always include the following four standard add-ons in the output array, listed separately (NEVER combine hosting and domain into a single add-on):
   - **Maintenance & Support**: Services to monitor uptime, fix bugs, and perform minor adjustments. Interval should be 'monthly' or 'yearly'. (English name: "Premium Maintenance & Support", Indonesian name_id: "Pemeliharaan & Dukungan Premium").
   - **Web/Cloud Hosting / Dedicated VPS**: Server allocation and infrastructure setup. Interval should be 'monthly' or 'yearly'.
     * If the service context implies a modern dynamic app, SaaS, custom database, Node.js, Next.js, or API platform: Use English name: "Dedicated VPS / Managed Cloud App Hosting (Node.js/Next.js Ready)" and Indonesian name_id: "VPS Dedicated / Cloud App Hosting Terkelola (Node.js/Next.js Ready)". Ensure the implied scope includes database setup and cloud storage allocation.
     * If the service context implies a static page, simple CMS, local profile, or wedding invitation: Use English name: "High-Speed Shared Cloud Hosting (Database Included)" and Indonesian name_id: "Hosting Cloud Shared Cepat (Termasuk Database)".
   - **Domain Registration**: Domain name acquisition (.com, .id, etc.). Interval MUST be 'yearly'. (English name: "Domain Name Registration", Indonesian name_id: "Pendaftaran Nama Domain").
   - **All-in-One Managed Website Care (Hosting, Domain, Maintenance, & Upgrades)**: Full yearly managed care. We fully manage their domain, hosting (or VPS), and routine maintenance, and include periodic minor feature upgrades (not creating new features from scratch). Interval MUST be 'yearly'. (English name: "All-in-One Managed Website Care (Hosting, Domain, Maintenance, & Upgrades)", Indonesian name_id: "Layanan Kelola Website All-in-One (Hosting, Domain, Pemeliharaan, & Upgrade)").

2. ALL-IN-ONE PRICING FORMULA (ADD-ON #4):
   - The price for "All-in-One Managed Website Care" MUST be calculated as a yearly cost:
     * Step A: Convert any monthly costs to yearly costs (e.g. Hosting_Yearly = Hosting_Monthly * 12; Maintenance_Yearly = Maintenance_Monthly * 12).
     * Step B: Sum the yearly components: Total_Base_Yearly = Hosting_Yearly + Domain_Yearly + Maintenance_Yearly.
     * Step C: Apply the 20% upgrade overhead: All_In_One_Price_Yearly = Total_Base_Yearly * 1.2.
   - Example mathematical logic:
     If the generated Hosting is IDR 250,000/monthly (Yearly = IDR 3,000,000), Domain is IDR 250,000/yearly, and Maintenance is IDR 500,000/monthly (Yearly = IDR 6,000,000):
     * Total Base Yearly = 3,000,000 (hosting) + 250,000 (domain) + 6,000,000 (maintenance) = IDR 9,250,000.
     * All-in-One price = 9,250,000 * 1.2 = IDR 11,100,000.
     * Final charm rounded price: IDR 10,990,000/yearly or IDR 11,150,000/yearly.
   - CRITICAL: The yearly All-in-One price MUST be a large yearly sum (typically IDR 2.5M - 4.5M for UMi, IDR 4M - 8M for Mikro, IDR 8M - 19M for Small, IDR 20M - 49M for SME, and IDR 50M - 199M for Enterprise). Never output low monthly-like numbers (such as IDR 7,799,000) for Enterprise All-in-One yearly packages!

3. CUSTOM FUNCTIONAL ADD-ONS:
   In addition to the four mandatory add-ons above, you MUST generate 1-3 custom functional add-ons tailored specifically to the service's industry context (e.g. B2B Tiered Pricing, live API integrations, booking systems, custom client portals, AI chatbots).

4. NO CMS CAPACITY RESTRICTIONS:
   - Never limit database/CMS features (e.g. DO NOT limit products, categories, or image uploads). The client must have unlimited CMS capability.
   - Limit/quota fields MUST only apply to our manual deliverables (e.g. "3 Articles/Month", "Up to 3 Custom APIs Setup", "4 Hours/Month Support").

5. EXPLICIT BUSINESS SCALE OVERRIDE (MANDATORY):
   If the parameter "Requested Business Scale" is provided below and is NOT "AUTO", you MUST bypass your instinctual profiling. You are FORCED to select the addon pricing ranges from the exact scale corresponding to that value:
   - "Requested Business Scale" parameter value: "${requestedScale}"

6. PRICING & TARGET BUSINESS SCALE ADJUSTMENT:
   - Addon currency must be "${currency}".
   - Scale the pricing of the addons to match the client's business scale (either calculated by instinct or forced by the Requested Business Scale override):

     * **For Ultra Mikro (UMi)** (informal/individual target market):
       - Hosting: IDR 49k - 149k/month OR IDR 490k - 1.49M/year (USD 5 - 15/month OR USD 49 - 149/year).
       - Domain: IDR 149k - 245k/year (USD 15 - 25/year) (interval: yearly).
       - Maintenance: IDR 99k - 195k/month (USD 9 - 19/month).
       - All-in-One Managed Care (Yearly): IDR 2,190,000 - 4,490,000/year (USD 219 - 449/year).
       - Custom Low/Med/High Complexity Addons: IDR 290k - 990k / USD 29 - 99.

     * **For Usaha Mikro** (small businesses with 1-5 employees):
       - Hosting: IDR 149k - 245k/month OR IDR 1.49M - 2.45M/year (USD 15 - 25/month OR USD 149 - 245/year).
       - Domain: IDR 149k - 245k/year (USD 15 - 25/year) (interval: yearly).
       - Maintenance: IDR 190k - 390k/month (USD 19 - 39/month).
       - All-in-One Managed Care (Yearly): IDR 3,990,000 - 8,990,000/year (USD 399 - 899/year).
       - Custom Low/Med/High Complexity Addons: IDR 490k - 1.99M / USD 49 - 199.

     * **For Usaha Kecil** (growing local businesses with 6-19 employees):
       - Hosting: IDR 245k - 495k/month OR IDR 2.45M - 4.95M/year (USD 25 - 49/month OR USD 245 - 495/year).
       - Domain: IDR 245k - 395k/year (USD 25 - 39/year) (interval: yearly).
       - Maintenance: IDR 390k - 990k/month (USD 39 - 99/month).
       - All-in-One Managed Care (Yearly): IDR 8,990,000 - 19,990,000/year (USD 899 - 1,990/year).
       - Custom Low/Med/High Complexity Addons: IDR 990k - 4.95M / USD 99 - 495.

     * **For Usaha Menengah (SME)** (regional companies with 20-99 employees):
       - Hosting: IDR 495k - 990k/month OR IDR 4.95M - 9.9M/year (USD 49 - 99/month OR USD 495 - 990/year).
       - Domain: IDR 390k - 590k/year (USD 39 - 59/year) (interval: yearly).
       - Maintenance: IDR 990k - 1.95M/month (USD 99 - 195/month).
       - All-in-One Managed Care (Yearly): IDR 19,990,000 - 49,990,000/year (USD 1,999 - 4,999/year).
       - Custom Low/Med/High Complexity Addons: IDR 1.99M - 9.95M / USD 199 - 995.

     * **For Besar/Enterprise** (national corporates or tech platforms):
       - Hosting: IDR 1.49M - 3.49M/month OR IDR 14.9M - 34.9M/year (USD 149 - 349/month OR USD 1,490 - 3,490/year).
       - Domain: IDR 590k - 1.49M/year (USD 59 - 149/year) (interval: yearly).
       - Maintenance: IDR 1.95M - 4.95M/month (USD 195 - 495/month).
       - All-in-One Managed Care (Yearly): IDR 49,990,000 - 199,990,000/year (USD 4,999 - 19,990/year).
       - Custom Low/Med/High Complexity Addons: IDR 3.95M - 19.95M+ / USD 399 - 1,995+.

   - Ensure addon pricing uses charm pricing numbers (e.g. ending in 90k, 95k, 99k for IDR, or .99 / .95 for USD).

7. STRICT SCHEMA ADHERENCE:
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

