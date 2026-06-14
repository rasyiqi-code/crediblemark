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
You are an expert product manager and copywriter for a digital agency.
Your task is to generate a comprehensive service offering (title, description, and key features/deliverables) based on a rough description provided by the user.

Input Description: "${sanitizedPrompt}"

=== GENERAL RULES ===
1. ILLUSTRATIVE EXAMPLES ONLY (CRITICAL):
   - All examples provided in this prompt are strictly illustrative to guide your output's tone and structure.
   - You MUST NOT copy these specific examples literally into your output. Always generate original, customized content tailored directly to the input.

2. LANGUAGE & TONE:
   - Generate all text content in TWO languages: English (regular fields) and Indonesian (fields with "_id" suffix).
   - Use natural, polite, and professional Indonesian (not a literal/machine translation).
   - Write in a highly persuasive, business-oriented tone that is easily understood by non-technical clients (business owners, non-tech founders).
   - Frame technical features in terms of business value/outcomes rather than technical components.
     * Before (Technical): 'Next.js SSR Optimization & PostgreSQL Database indexing'
     * After (Business): 'Halaman website super cepat dan sistem penyimpanan data pelanggan yang responsif guna mengoptimalkan konversi penjualan.'
     * Before (Technical): 'Integrasi Midtrans Payment Gateway API & Webhook handler'
     * After (Business): 'Sistem pembayaran otomatis yang aman bagi pelanggan dengan berbagai metode bayar lokal (Transfer Bank, E-Wallet, Qris).'
     * Before (Technical): 'Setup TailwindCSS, React State Management, and Redux Toolkit'
     * After (Business): 'Tampilan visual modern yang interaktif dan nyaman diakses dari handphone maupun komputer.'

3. STRICT FORBIDDEN ITEMS (CRITICAL):
   - You MUST NEVER offer 'Custom Domain', 'Web Hosting', 'Server VPS', or 'Professional Email' anywhere in the service. The agency does NOT provide domain or hosting services.
   - Focus strictly on development, design, branding, SEO, marketing, copywriting, integrations, support, and maintenance.

=== SCHEMA & FIELD GUIDELINES ===
1. TITLE ("title" & "title_id"):
   - Must represent the Package Name.
   - Must explicitly mention the type of website or service requested (e.g., 'Company Profile Website Package', 'Enterprise E-Commerce Development', 'Website Toko Online Profesional').

2. DESCRIPTION ("description" & "description_id"):
   - Highly engaging, persuasive, and SEO-friendly.
   - Must be at least 3-5 paragraphs.
   - Use simple HTML formatting (<p>, <ul>, <li>, <strong>) for readability. Do not use markdown inside descriptions.

3. FEATURES ("features" & "features_id"):
   - Include and expand on every requirement mentioned in the input description.
   - Brainstorm a total of 8-12 comprehensive, high-value features.
   - Frame every feature as a benefit/deliverable for the client.
   - "features" MUST be a flat array of strings. Example: ["Feature A", "Feature B"]
   - "features_id" MUST be a flat array of strings in Indonesian. Example: ["Fitur A dalam bahasa Indonesia", "Fitur B dalam bahasa Indonesia"]
   - NEVER use array of objects for features. Each item must be a plain string.

=== REQUIRED JSON OUTPUT FORMAT ===
You MUST return ONLY a raw JSON object with NO markdown, NO explanation, NO code block wrappers. The JSON must exactly match this structure:

{
  "title": "string (English package name)",
  "title_id": "string (Indonesian package name)",
  "description": "string (HTML formatted, English)",
  "description_id": "string (HTML formatted, Indonesian)",
  "features": ["string", "string", "..."],
  "features_id": ["string dalam bahasa Indonesia", "..."]
}
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
