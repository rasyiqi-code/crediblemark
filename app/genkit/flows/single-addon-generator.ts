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

        // Menentukan aturan harga berdasarkan kompleksitas teknis dari addon yang diminta
        const pricingRangeRule = `Determine the pricing of this custom addon based on its technical complexity:
- **Low Complexity** (misal: widget sederhana, link sosial media, form kontak dasar, setup tracking pixel):
  * Rentang Harga: IDR 190,000 - 490,000 / USD 19 - 49.
- **Medium Complexity** (misal: integrasi WhatsApp gateway/API kustom, sistem multi-bahasa, kalender/sistem booking, filter pencarian kustom):
  * Rentang Harga: IDR 490,000 - 1,490,000 / USD 49 - 149.
- **High Complexity** (misal: integrasi payment gateway penuh, chatbot AI kustom 24/7, sinkronisasi CRM lanjutan, sistem membership/poin loyalitas, dashboard analitik penjualan):
  * Rentang Harga: IDR 1,490,000 - 3,990,000 / USD 149 - 399.

Pilih harga realistis yang sesuai dengan kategori kompleksitas tersebut. Jangan menaikkan harga secara tidak wajar.`;

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
1. ADDON NAME & FOCUS (CRITICAL):
   - Create a professional, clear, and high-value name for the addon.
   - The name MUST be written in ${isEn ? 'English (e.g. "Payment Gateway Integration")' : 'Indonesian (e.g. "Integrasi Payment Gateway")'}.
   - Batasi ruang lingkup teknis (job description) addon ini HANYA pada satu fokus tugas spesifik yang diminta. Dilarang keras mencampurkan beberapa tanggung jawab teknis yang berbeda ke dalam satu addon (misal: jika ide user tentang integrasi WhatsApp, fokus hanya pada gateway chat/komunikasi tersebut, jangan mencampurkan setup analitik, backup, atau optimasi SEO).
   
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
