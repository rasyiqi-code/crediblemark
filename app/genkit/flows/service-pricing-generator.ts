import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const servicePricingInputSchema = z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    description_id: z.string(),
    features: z.array(z.string()),
    features_id: z.array(z.string()),
});

const servicePricingOutputSchema = z.object({
    priceType: z.enum(['FIXED', 'STARTING_AT']),
    currency: z.enum(['USD', 'IDR']),
    recommended_price: z.number(),
    discount: z.number(),
    interval: z.enum(['one_time', 'monthly', 'yearly']),
});

export const servicePricingGeneratorFlow = ai.defineFlow(
    {
        name: 'servicePricingGeneratorFlow',
        inputSchema: servicePricingInputSchema,
        outputSchema: servicePricingOutputSchema,
    },
    async (input) => {
        const { apiKey, model } = await getActiveAIConfig();

        const sanitizedTitle = input.title.trim();
        const sanitizedDesc = input.description.trim();
        const sanitizedFeatures = input.features.join(', ');

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.7
            },
            prompt: `
Role: Expert Product Manager & Pricing Strategist.
Task: Determine optimal pricing (priceType, recommended_price, discount, currency, interval) for the service details below.

Service details:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Features: "${sanitizedFeatures}"

Rules:
1. CURRENCY: 'IDR' if title/description has Indonesian words or currency symbols; otherwise 'USD'.
2. PRICE TYPE: 'FIXED' or 'STARTING_AT'.
3. INTERVAL: 'one_time' for project builds; 'monthly'/'yearly' for retainers/support.
4. CHARM PRICING STRATEGY:
   - Target Business Scale Definitions & Prices (based on complexity/scope of the title and description):
     * Ultra Micro (IDR 1.45M - 1.95M / USD 149 - 199): Informal, self-run (e.g. tiny stalls, street vendors). Assets <= IDR 50M, annual revenue <= IDR 300M. Site: 100% static, no DB.
     * Micro (IDR 2.45M - 3.45M / USD 249 - 349): Micro-scale sole proprietorship (e.g. barbershop, laundry, kost, independent clinic). Staff: 1-5. Assets <= IDR 50M, annual revenue <= IDR 300M. Site: basic forms, WA link.
     * Small (IDR 3.95M - 8.95M / USD 399 - 899): Growing local business (e.g. local cafe, local school, builder shop). Staff: 6-19. Assets IDR 50M-500M, annual revenue IDR 300M-2.5B. Site: standard catalog, booking.
     * Medium/SME (IDR 9.95M - 19.95M / USD 999 - 1,999): Regional companies. Staff: 20-99. Assets IDR 500M-10B, annual revenue IDR 2.5B-50B. Site: payment gateway, dynamic operations.
     * Large/Enterprise (IDR 24.95M - 49.99M+ / USD 2,499 - 5,999+): Corporates/tech platforms. Staff >= 100. Assets > IDR 10B, annual revenue > IDR 50B. Site: full automation, SaaS, ERP, multi-role.
   - Determine "discount" as an ODD integer between 51 and 89 (e.g. 53, 55, 59, 65, 75, 85, 89). No even discount numbers.
   - Calculate "recommended_price" (Anchor Price) as: Consumer Price / (1 - (discount / 100)).
   - Round "recommended_price" cleanly (e.g. 79950000) using charm pricing numbers. No decimals.

Format Output: Raw JSON matching the schema. No markdown wrappers, no explanations.
            `,
            output: {
                schema: servicePricingOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate service pricing");
        }

        return output;
    }
);
