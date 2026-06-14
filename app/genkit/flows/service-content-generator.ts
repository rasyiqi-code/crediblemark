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
Role: Expert Digital Agency Product Manager, SEO Specialist, & Copywriter.
Task: Generate a comprehensive service package (title, description, and features/deliverables) in English and Indonesian.

Input Description: "${sanitizedPrompt}"

Constraints:
1. NO DOMAIN/HOSTING: Absolutely do not offer custom domains, hosting, VPS, or professional emails. We only build software/designs.
2. TONE & VALUE: Write in a persuasive, business-oriented tone for non-tech founders. Frame technical tasks as business outcomes/benefits.
   - Poor: "Next.js SSR Optimization & PostgreSQL Database indexing"
   - Good: "Halaman website super cepat guna mengoptimalkan konversi penjualan."
3. BILINGUAL: Translate all "_id" fields into natural, polite Indonesian (not machine translation).
4. ABSOLUTE SEO BAN: DILARANG KERAS menggunakan kata-kata berikut pada properti "title" dan "title_id":
   - "Paket", "Package", "Plan", "Tier", "Starter", "Growth", "Scale-Up", "Pro", "Premium", "Basic", "Advanced", "Enterprise"
   - "Pertumbuhan Bisnis", "Digital Bisnis", "Bisnis Digital"
   Judul harus 100% SEO-friendly, merepresentasikan kata kunci pencarian bernilai tinggi yang diketik target pelanggan di mesin pencari (search intent).

Field Rules:
1. Property "title" (String): Catchy, high-intent English search-optimized title focusing on the actual service (e.g. "Custom E-Commerce Website Development for Fashion Brands", "Professional Web Design for Medical Clinics", "Automated Booking System & Web Development").
2. Property "title_id" (String): Highly SEO-friendly and search-optimized Indonesian title. Must use direct search terms like "Jasa Pembuatan Website [Niche]", "Jasa Pembuatan Aplikasi [Niche]", "Jasa Desain Website Landing Page [Niche]", "Jasa Pembuatan Toko Online [Niche]", "Pembuatan Sistem [Niche] Berbasis Web" or similar. Avoid generic/stiff/abstract structures. Example: Use "Jasa Pembuatan Website Laundry & Cuci Sepatu" instead of "Paket Digital Jasa Laundry".
3. Property "description" (String) and "description_id" (String): 3-5 engaging, SEO-friendly paragraphs using basic HTML (<p>, <ul>, <li>, <strong>). Do not use markdown inside descriptions.
4. Property "features" (Array of Strings) and "features_id" (Array of Strings): Flat array of 8-12 high-value deliverables. Each item must be a plain string.

Format Output: Raw JSON matching the schema. You MUST include all required properties ("title", "title_id", "description", "description_id", "features", "features_id"). No markdown wrappers, no explanations.
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
