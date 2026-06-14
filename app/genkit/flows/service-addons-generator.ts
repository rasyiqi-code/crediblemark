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
Task: Generate 2-4 specific, high-value add-ons for the service below.

Service Profile:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Base Price: ${currency} ${basePrice} (Consumer Price: ${currency} ${consumerPrice})
- Interval: ${interval}

Rules:
1. STANDARD VS ADD-ON SEPARATION:
   Add-ons must be advanced features defined by business logic complexity:
   - Customization: Custom conditional flows (e.g. B2B Tiered Pricing, branching forms). NOT standard carts or landing pages.
   - Data Management: Interactive/relational (e.g. client portals, live inventory API sync). NOT static input forms.
   - Automation: Full system-driven workflows replacing human tasks (e.g. auto-generated quote PDFs emailed).
   - MATRIX:
     * Payments: Add-on (Recurring billing, B2B tiered, Multi-currency) | Standard (Catalog, cart, basic payment gateways).
     * Booking: Add-on (Google Calendar sync, seat picker, auto-block slots) | Standard (Static date picker, WhatsApp button).
     * Content: Add-on (Paywalls, quiz generators, UGC directories) | Standard (Landing pages, blog, simple portfolio).
     * Support/System: Add-on (AI Chatbots, Helpdesks, Client Portals, GPS tracking) | Standard (FAQ, WhatsApp floating chat, responsive design, SSL, basic analytics).
2. NO CMS CAPACITY RESTRICTIONS:
   - Never limit database/CMS features (e.g. DO NOT limit products, categories, or image uploads). The client must have unlimited CMS capability.
   - Limit/quota fields MUST only apply to our manual deliverables (e.g. "3 Articles/Month", "Up to 3 Custom APIs Setup", "4 Hours/Month Support").
3. PRICING & TARGET BUSINESS SCALE ADJUSTMENT:
   - Addon currency must be "${currency}".
   - First, identify the Target Business Scale of the service based on its title, description, and base/consumer price.
   - Scale the pricing of the addons to match the client's business scale:

     * **For Ultra Mikro (UMi)** (informal/individual target market):
       - Low Complexity: IDR 290k - 490k / USD 29 - 49.
       - Medium Complexity: IDR 490k - 890k / USD 49 - 89.
       - High Complexity: IDR 890k - 1,490,000 / USD 89 - 149.
       - Monthly Retainer: IDR 99k - 199k / USD 9 - 19.

     * **For Usaha Mikro** (small businesses with 1-5 employees):
       - Low Complexity: IDR 490k - 890k / USD 49 - 89.
       - Medium Complexity: IDR 890k - 1,490,000 / USD 89 - 149.
       - High Complexity: IDR 1,490,000 - 2,450,000 / USD 149 - 245.
       - Monthly Retainer: IDR 190k - 390k / USD 19 - 39.

     * **For Usaha Kecil** (growing local businesses with 6-19 employees):
       - Low Complexity: IDR 990k - 1,990,000 / USD 99 - 199.
       - Medium Complexity: IDR 1,990,000 - 3,490,000 / USD 199 - 349.
       - High Complexity: IDR 3,990,000 - 6,990,000 / USD 399 - 699.
       - Monthly Retainer: IDR 390k - 990k / USD 39 - 99.

     * **For Usaha Menengah (SME)** (regional companies with 20-99 employees):
       - Low Complexity: IDR 1,990,000 - 3,490,000 / USD 199 - 349.
       - Medium Complexity: IDR 3,490,000 - 5,990,000 / USD 349 - 599.
       - High Complexity: IDR 5,990,000 - 9,950,000 / USD 599 - 995.
       - Monthly Retainer: IDR 990k - 1,990,000 / USD 99 - 199.

     * **For Besar/Enterprise** (national corporates or tech platforms):
       - Low Complexity: IDR 3,950,000 - 6,950,000 / USD 399 - 699.
       - Medium Complexity: IDR 6,950,000 - 11,950,000 / USD 699 - 1,195.
       - High Complexity: IDR 11,950,000 - 19,950,000+ / USD 1,195 - 1,995+.
       - Monthly Retainer: IDR 1,950,000 - 4,950,000 / USD 195 - 495.

   - Ensure addon pricing uses charm pricing numbers (e.g. ending in 90k, 95k, 99k for IDR, or .99 / .95 for USD).

4. STRICT SCHEMA ADHERENCE:
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
