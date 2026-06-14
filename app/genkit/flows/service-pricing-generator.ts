import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const servicePricingInputSchema = z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    description_id: z.string(),
    features: z.array(z.string()),
    features_id: z.array(z.string()),
    targetBusinessScale: z.string().optional(),
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
        const requestedScale = input.targetBusinessScale || 'AUTO';
        console.log("=== servicePricingGeneratorFlow Input Scale ===", requestedScale);

        let pricingRule = "";
        if (requestedScale === "ULTRA_MICRO") {
            pricingRule = "You MUST strictly select a Consumer Price between IDR 1,450,000 - 2,450,000 (or USD 149 - 245) because the target market is Ultra Mikro (UMi).";
        } else if (requestedScale === "MICRO") {
            pricingRule = "You MUST strictly select a Consumer Price between IDR 2,450,000 - 3,950,000 (or USD 245 - 395) because the target market is Usaha Mikro.";
        } else if (requestedScale === "SMALL") {
            pricingRule = "You MUST strictly select a Consumer Price between IDR 3,950,000 - 9,950,000 (or USD 395 - 995) because the target market is Usaha Kecil.";
        } else if (requestedScale === "MEDIUM") {
            pricingRule = "You MUST strictly select a Consumer Price between IDR 9,950,000 - 24,950,000 (or USD 995 - 2,495) because the target market is Usaha Menengah (SME).";
        } else if (requestedScale === "ENTERPRISE") {
            pricingRule = "You MUST strictly select a Consumer Price between IDR 24,950,000 - 49,990,000+ (or USD 2,495 - 5,999+) because the target market is Besar/Enterprise.";
        } else {
            pricingRule = `Analyze the service context, industry, and complexity to identify the target client's business scale and use the corresponding range:
    - **Ultra Mikro (UMi)**: Target Consumer Price Range (One-time payment): IDR 1,450,000 - IDR 2,450,000 (or USD 149 - 245).
    - **Usaha Mikro**: Target Consumer Price Range (One-time payment): IDR 2,450,000 - IDR 3,950,000 (or USD 245 - 395).
    - **Usaha Kecil**: Target Consumer Price Range (One-time payment): IDR 3,950,000 - IDR 9,950,000 (or USD 395 - 995).
    - **Usaha Menengah (SME)**: Target Consumer Price Range (One-time payment): IDR 9,950,000 - IDR 24,950,000 (or USD 995 - 2,495).
    - **Besar/Enterprise**: Target Consumer Price Range (One-time payment): IDR 24,950,000 - IDR 49,990,000+ (or USD 2,495 - 5,999+).`;
        }

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

Rules for Pricing Instinct and Strategy:
1. CURRENCY: 'IDR' if title/description has Indonesian words, references Indonesian places, or uses IDR/Rp symbols; otherwise 'USD'.
2. PRICE TYPE: 'FIXED' or 'STARTING_AT'.
3. INTERVAL: Always set 'interval' to 'one_time'. ALL service packages generated must be one-time payments.
4. TARGET BUSINESS SCALE & PRICE RANGE:
   ${pricingRule}

5. CHARM PRICING & ANCHOR PRICE CALCULATION:
   - Determine "Consumer Price" (the final price the client actually pays after discount) within the chosen range above.
   - Choose a "discount" percentage as an ODD integer between 51 and 89 (e.g. 53, 55, 59, 65, 75, 85, 89). No even discount numbers.
   - Calculate "recommended_price" (Anchor Price) as: Consumer Price / (1 - (discount / 100)).
   - Round both final prices cleanly:
     * For IDR, final Consumer Price and recommended_price must end in 000, 50000, 90000, 95000, or 99000 (e.g., IDR 1,450,000, IDR 3,450,000, IDR 8,950,000).
     * For USD, final Consumer Price and recommended_price must end in .99, .95, or 9 (e.g. USD 149, USD 349, USD 899).
     * Ensure recommended_price > Consumer Price.

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

