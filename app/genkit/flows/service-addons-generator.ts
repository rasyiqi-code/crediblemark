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
3. PRICING:
   - Addon currency must be "${currency}". Price must be an ODD (charm pricing) number.
   - Pricing must be based on development complexity, effort, and the industry's target market (NOT tied to the base package price):
     * Low Complexity / Standard Setup (e.g. basic newsletter integration, WhatsApp click-to-chat setup): IDR 990k - 1.99M / USD 99 - 199.
     * Medium Complexity / Automated Flow & Integrations (e.g. Google Calendar live sync, recurring payment setup, analytics conversion tracking): IDR 1.99M - 3.49M / USD 199 - 349.
     * High Complexity / Client Portals & Dynamic Databases (e.g. Client Login Area, live inventory API sync with ERP, multi-role authorization): IDR 3.99M - 7.99M / USD 399 - 799.
     * Monthly Retainer / Maintenance: IDR 390k - 990k/month / USD 39 - 99/month.
   - Adjust these base ranges down for highly retail/micro markets (e.g. wedding websites) and up for enterprise/high-margin B2B industries (e.g. heavy machinery, custom corporate ERPs).

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
