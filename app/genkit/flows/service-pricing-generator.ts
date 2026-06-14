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
4. TARGET BUSINESS SCALE PROFILING:
   Analyze the service context, industry, and complexity to identify the target client's business scale:
   - **Ultra Mikro (UMi)**:
     * Profile: Informal, self-run businesses, or individuals (e.g. food stall/warung kelontong kecil, street vendors, local mosque/masjid, personal portfolio, digital wedding invitation).
     * Budget Constraint: Extremely price sensitive. High pricing is completely unaffordable.
     * Target Consumer Price Range (One-time payment): IDR 1,450,000 - IDR 2,450,000 (or USD 149 - 245).
   - **Usaha Mikro**:
     * Profile: Micro-scale sole proprietorship/small shop with 1-5 employees (e.g. local barbershop, local laundry, kost-kostan, independent medical clinic, small local cafe).
     * Target Consumer Price Range (One-time payment): IDR 2,450,000 - IDR 3,950,000 (or USD 245 - 395).
   - **Usaha Kecil**:
     * Profile: Growing local business with structured operations and 6-19 employees (e.g. popular local cafe with multiple branches, local private school, builder shop, clothing distro/boutique).
     * Target Consumer Price Range (One-time payment): IDR 3,950,000 - IDR 9,950,000 (or USD 395 - 995).
   - **Usaha Menengah (SME)**:
     * Profile: Regional structured companies with 20-99 employees. Requires dynamic operations, payment gateway integration, or booking/inventory management (e.g. regional car showroom/dealer, small factory, province distributor).
     * Target Consumer Price Range (One-time payment): IDR 9,950,000 - IDR 24,950,000 (or USD 995 - 2,495).
   - **Besar/Enterprise**:
     * Profile: Corporates, national brands, SaaS platform, ERP, heavy machinery B2B, large scale exporters, staff >= 100.
     * Value Perception: High price represents premium quality. Cheap pricing devalues the brand.
     * Target Consumer Price Range (One-time payment): IDR 24,950,000 - IDR 49,990,000+ (or USD 2,495 - 5,999+).

5. EXPLICIT BUSINESS SCALE OVERRIDE (MANDATORY):
   If the parameter "Requested Business Scale" is provided below and is NOT "AUTO", you MUST bypass your instinctual profiling. You are FORCED to select the final Consumer Price from the exact range corresponding to that scale:
   - "Requested Business Scale" parameter value: "${requestedScale}"
   - Mapping rules if NOT "AUTO":
     * If "ULTRA_MICRO": Strictly use the range IDR 1,450,000 - 2,450,000 (or USD 149 - 245).
     * If "MICRO": Strictly use the range IDR 2,450,000 - 3,950,000 (or USD 245 - 395).
     * If "SMALL": Strictly use the range IDR 3,950,000 - 9,950,000 (or USD 395 - 995).
     * If "MEDIUM": Strictly use the range IDR 9,950,000 - 24,950,000 (or USD 995 - 2,495).
     * If "ENTERPRISE": Strictly use the range IDR 24,950,000 - 49,990,000+ (or USD 2,495 - 5,999+).

6. CHARM PRICING & ANCHOR PRICE CALCULATION:
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

