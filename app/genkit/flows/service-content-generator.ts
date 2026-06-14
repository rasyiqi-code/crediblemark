import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const serviceContentOutputSchema = z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    description_id: z.string(),
    features: z.array(z.string()),
    features_id: z.array(z.string()),
});

export const serviceContentGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceContentGeneratorFlow',
        inputSchema: z.string(),
        outputSchema: serviceContentOutputSchema,
    },
    async (prompt) => {
        const { apiKey, model } = await getActiveAIConfig();

        const sanitizedPrompt = prompt
            .replace(/[\\"\n\r]/g, ' ')
            .trim();

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.7
            },
            prompt: `
Role: Expert Digital Agency Product Manager & Copywriter.
Task: Generate a comprehensive service package (title, description, and features/deliverables) in English and Indonesian.

Input Description: "${sanitizedPrompt}"

Constraints:
1. NO DOMAIN/HOSTING: Absolutely do not offer custom domains, hosting, VPS, or professional emails. We only build software/designs.
2. TONE & VALUE: Write in a persuasive, business-oriented tone for non-tech founders. Frame technical tasks as business outcomes/benefits.
   - Poor: "Next.js SSR Optimization & PostgreSQL Database indexing"
   - Good: "Halaman website super cepat guna mengoptimalkan konversi penjualan."
3. BILINGUAL: Translate all "_id" fields into natural, polite Indonesian (not machine translation).

Field Rules:
- Title ("title", "title_id"): Explicit package name (e.g. "Professional E-Commerce Development" / "Website Toko Online Profesional").
- Description ("description", "description_id"): 3-5 engaging, SEO-friendly paragraphs using basic HTML (<p>, <ul>, <li>, <strong>). Do not use markdown inside descriptions.
- Features ("features", "features_id"): Flat array of 8-12 high-value deliverables. Each item must be a plain string.

Format Output: Raw JSON matching the schema. No markdown wrappers, no explanations.
            `,
            output: {
                schema: serviceContentOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate service content");
        }

        return output;
    }
);
