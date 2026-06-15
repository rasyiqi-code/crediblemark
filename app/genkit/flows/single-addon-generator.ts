import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const singleAddonInputSchema = z.object({
    prompt: z.string(),
    currency: z.enum(['USD', 'IDR']),
    targetBusinessScale: z.string().optional(),
    isEn: z.boolean().optional(),
});

const singleAddonOutputSchema = z.object({
    name: z.string(),
    price: z.number(),
    interval: z.enum(['one_time', 'monthly', 'yearly']),
    currency: z.enum(['USD', 'IDR'])
});

export const singleAddonGeneratorFlow = ai.defineFlow(
    {
        name: 'singleAddonGeneratorFlow',
        inputSchema: singleAddonInputSchema,
        outputSchema: singleAddonOutputSchema,
    },
    async (input) => {
        const { apiKey, model } = await getActiveAIConfig();

        const promptText = input.prompt.trim();
        const currency = input.currency;
        const requestedScale = input.targetBusinessScale || 'AUTO';
        const isEn = input.isEn ?? false;

        let pricingRangeRule = "";
        if (requestedScale === "ULTRA_MICRO") {
            pricingRangeRule = `The target business scale is \`ULTRA_MICRO\` (\`UMi\`). Select the pricing of this custom addon from range: IDR 290,000 - 990,000 / USD 29 - 99.`;
        } else if (requestedScale === "MICRO") {
            pricingRangeRule = `The target business scale is \`MICRO\` (\`Mikro\`). Select the pricing of this custom addon from range: IDR 490,000 - 1,990,000 / USD 49 - 199.`;
        } else if (requestedScale === "SMALL") {
            pricingRangeRule = `The target business scale is \`SMALL\` (\`Kecil\`). Select the pricing of this custom addon from range: IDR 990,000 - 4,950,000 / USD 99 - 495.`;
        } else if (requestedScale === "MEDIUM") {
            pricingRangeRule = `The target business scale is \`MEDIUM\` (\`SME\`). Select the pricing of this custom addon from range: IDR 1,990,000 - 9,950,000 / USD 199 - 995.`;
        } else if (requestedScale === "ENTERPRISE") {
            pricingRangeRule = `The target business scale is \`ENTERPRISE\`. Select the pricing of this custom addon from range: IDR 3,950,000 - 19,950,000+ / USD 399 - 1,995+.`;
        } else {
            pricingRangeRule = `Determine a reasonable price for this custom addon matching a standard business scale. Minimum price: IDR 290,000 / USD 29. Maximum price: IDR 19,950,000 / USD 1,995.`;
        }

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 1024,
                temperature: 0.7
            },
            prompt: `
Role: Expert Product Manager and Pricing Specialist.
Task: Generate a single professional service addon based on the user's idea/input.

Input Details:
- User Idea/Prompt: "${promptText}"
- Currency: ${currency}
- Target Business Scale: \`${requestedScale}\`
- Output Language: ${isEn ? 'English' : 'Indonesian'}

Rules:
1. ADDON NAME:
   - Create a professional, clear, and high-value name for the addon.
   - The name MUST be written in ${isEn ? 'English (e.g. "Payment Gateway Integration")' : 'Indonesian (e.g. "Integrasi Payment Gateway")'}.
   
2. PRICING & INTERVAL:
   - Currency MUST be "${currency}".
   - ${pricingRangeRule}
   - Ensure the price uses charm pricing numbers (e.g. ending in 90k, 95k, 99k for IDR, or .99 / .95 for USD).
   - Select the most appropriate interval for this addon: 'one_time' (for setup/integration), 'monthly' or 'yearly' (for ongoing subscription/support).

Format Output: Raw JSON matching the schema. No markdown wrappers, no explanations.
            `,
            output: {
                schema: singleAddonOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate custom addon");
        }

        return output;
    }
);
