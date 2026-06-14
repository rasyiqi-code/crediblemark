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
Role: Expert Product Manager & Upsell Strategist.
Task: Generate 4-6 specific, high-value add-ons for the service below.

Service Profile:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Base Price: ${currency} ${basePrice} (Consumer Price: ${currency} ${consumerPrice})
- Interval: ${interval}

Rules:
1. MANDATORY ADD-ONS REQUIREMENT (CRITICAL):
   You MUST always include the following three standard add-ons in the output array, listed separately (NEVER combine hosting and domain into a single add-on):
   - **Maintenance & Support**: Services to monitor uptime, fix bugs, and perform minor adjustments. Interval should be 'monthly' or 'yearly'. (English name: "Premium Maintenance & Support", Indonesian name_id: "Pemeliharaan & Dukungan Premium").
   - **Web/Cloud Hosting**: Server allocation and infrastructure setup. Interval should be 'monthly' or 'yearly'. (English name: "High-Performance Cloud Hosting", Indonesian name_id: "Hosting Cloud Performa Tinggi").
   - **Domain Registration**: Domain name acquisition (.com, .id, etc.). Interval MUST be 'yearly'. (English name: "Domain Name Registration", Indonesian name_id: "Pendaftaran Nama Domain").

2. CUSTOM FUNCTIONAL ADD-ONS:
   In addition to the three mandatory add-ons above, you MUST generate 1-3 custom functional add-ons tailored specifically to the service's industry context (e.g. B2B Tiered Pricing, live API integrations, booking systems, custom client portals, AI chatbots).

3. NO CMS CAPACITY RESTRICTIONS:
   - Never limit database/CMS features (e.g. DO NOT limit products, categories, or image uploads). The client must have unlimited CMS capability.
   - Limit/quota fields MUST only apply to our manual deliverables (e.g. "3 Articles/Month", "Up to 3 Custom APIs Setup", "4 Hours/Month Support").

4. PRICING & TARGET BUSINESS SCALE ADJUSTMENT:
   - Addon currency must be "${currency}".
   - First, identify the Target Business Scale of the service based on its title, description, and base/consumer price.
   - Scale the pricing of the addons to match the client's business scale:

     * **For Ultra Mikro (UMi)** (informal/individual target market):
       - Hosting: IDR 49k - 95k/month OR IDR 490k - 950k/year (USD 5 - 9/month OR USD 49 - 95/year).
       - Domain: IDR 149k - 245k/year (USD 15 - 25/year) (interval: yearly).
       - Maintenance: IDR 99k - 195k/month (USD 9 - 19/month).
       - Custom Low/Med/High Complexity Addons: IDR 290k - 990k / USD 29 - 99.

     * **For Usaha Mikro** (small businesses with 1-5 employees):
       - Hosting: IDR 95k - 195k/month OR IDR 950k - 1.95M/year (USD 9 - 19/month OR USD 95 - 195/year).
       - Domain: IDR 149k - 245k/year (USD 15 - 25/year) (interval: yearly).
       - Maintenance: IDR 190k - 390k/month (USD 19 - 39/month).
       - Custom Low/Med/High Complexity Addons: IDR 490k - 1.99M / USD 49 - 199.

     * **For Usaha Kecil** (growing local businesses with 6-19 employees):
       - Hosting: IDR 195k - 395k/month OR IDR 1.95M - 3.95M/year (USD 19 - 39/month OR USD 195 - 395/year).
       - Domain: IDR 245k - 395k/year (USD 25 - 39/year) (interval: yearly).
       - Maintenance: IDR 390k - 990k/month (USD 39 - 99/month).
       - Custom Low/Med/High Complexity Addons: IDR 990k - 4.95M / USD 99 - 495.

     * **For Usaha Menengah (SME)** (regional companies with 20-99 employees):
       - Hosting: IDR 490k - 990k/month OR IDR 4.9M - 9.9M/year (USD 49 - 99/month OR USD 499 - 990/year).
       - Domain: IDR 390k - 590k/year (USD 39 - 59/year) (interval: yearly).
       - Maintenance: IDR 990k - 1.95M/month (USD 99 - 195/month).
       - Custom Low/Med/High Complexity Addons: IDR 1.99M - 9.95M / USD 199 - 995.

     * **For Besar/Enterprise** (national corporates or tech platforms):
       - Hosting: IDR 1.49M - 3.49M/month OR IDR 14.9M - 34.9M/year (USD 149 - 349/month OR USD 1,490 - 3,490/year).
       - Domain: IDR 590k - 1.49M/year (USD 59 - 149/year) (interval: yearly).
       - Maintenance: IDR 1.95M - 4.95M/month (USD 195 - 495/month).
       - Custom Low/Med/High Complexity Addons: IDR 3.95M - 19.95M+ / USD 399 - 1,995+.

   - Ensure addon pricing uses charm pricing numbers (e.g. ending in 90k, 95k, 99k for IDR, or .99 / .95 for USD).

5. STRICT SCHEMA ADHERENCE:
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
