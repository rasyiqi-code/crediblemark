import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

// OPTIMASI M3: Definisikan schema Zod sekali sebagai konstanta modul agar tidak diduplikasi di RAM
const serviceOutputSchema = z.object({
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    title_id: z.string(),
    description_id: z.string(),
    features_id: z.array(z.string()),
    recommended_price: z.number(),
    discount: z.number().nullable().optional(),
    priceType: z.enum(['FIXED', 'STARTING_AT']),
    currency: z.enum(['USD', 'IDR']),
    interval: z.enum(['one_time', 'monthly', 'yearly']),
    addons: z.array(z.object({
        name: z.string(),
        name_id: z.string(),
        price: z.number(),
        interval: z.enum(['one_time', 'monthly', 'yearly']),
        currency: z.enum(['USD', 'IDR'])
    }))
});

export const serviceGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceGeneratorFlow',
        inputSchema: z.string(),
        outputSchema: serviceOutputSchema,
    },
    async (prompt) => {
        const { apiKey, model } = await getActiveAIConfig();

        // Sanitize prompt to prevent basic prompt injection
        const sanitizedPrompt = prompt
            .replace(/[\\"\n\r]/g, ' ')
            .trim();

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { apiKey },
            prompt: `
You are an expert product manager and copywriter for a digital agency.
Your task is to generate a comprehensive service offering (base package and add-ons) based on a rough description provided by the user.

Input Description: "${sanitizedPrompt}"

=== GENERAL RULES ===
1. ILLUSTRATIVE EXAMPLES ONLY (CRITICAL):
   - All examples provided in this prompt (such as website/package names, features, before/after translations, and add-on concepts) are strictly illustrative to guide your output's tone and structure.
   - You MUST NOT copy these specific examples literally into your output unless they are explicitly requested in the user's input. Always generate original, customized content tailored directly to the input.

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
   - You MUST NEVER offer 'Custom Domain', 'Web Hosting', 'Server VPS', or 'Professional Email' anywhere in the base service or add-ons. The agency does NOT provide domain or hosting services.
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

4. BASE PRICING & INTERVAL (NICHE-SPECIFIC, ANCHOR PRICING, & DISCOUNT STRATEGY):
   - "priceType": MUST be exactly "FIXED" or "STARTING_AT" (uppercase, no other values).
   - "currency": MUST be exactly "USD" or "IDR" (uppercase, no other values).
     * If the input is in Indonesian or mentions 'Rp', 'Rupiah', 'Juta', or large numbers (> 10000), set currency to 'IDR'.
   
   - PSYCHOLOGICAL ANCHOR PRICING STRATEGY (CRITICAL):
     * Klien harus merasa mendapatkan diskon besar (sekitar 2.5 hingga 3 kali lipat lebih murah) untuk menunjukkan profesionalitas premium agensi sambil tetap menjaga harga akhir yang terjangkau.
     * Pertama, tentukan target Harga Akhir Konsumen (Consumer Price) yang sesuai dengan kerumitan proyek:
       - Indonesia (IDR):
         * Low Complexity / UKM / Landing Page: Harga Akhir Konsumen IDR 2,500,000 s.d. IDR 6,000,000.
         * Medium Complexity / Standard Company Profile / SME E-commerce: Harga Akhir Konsumen IDR 7,000,000 s.d. IDR 15,000,000.
         * High Complexity / Custom System / SaaS / Enterprise Portal: Harga Akhir Konsumen IDR 18,000,000 s.d. IDR 50,000,000+.
       - Global (USD):
         * Low Complexity: Harga Akhir Konsumen USD 250 s.d. USD 600.
         * Medium Complexity: Harga Akhir Konsumen USD 800 s.d. USD 1,800.
         * High Complexity: Harga Akhir Konsumen USD 2,000 s.d. USD 6,000+.
     * Kedua, tentukan "discount" (diskon) berupa angka bulat antara 50 hingga 70 (misal: 60 untuk diskon 60%). Jangan pernah gunakan 0 kecuali tidak ada promo.
     * Ketiga, hitung "recommended_price" (Harga Asli/Anchor Price) agar bernilai tinggi dengan rumus:
       recommended_price = Harga Akhir Konsumen / (1 - (discount / 100))
     * Contoh: Jika target Harga Akhir Konsumen adalah IDR 5,000,000 dan diskon 60%:
       recommended_price = 5,000,000 / 0.4 = IDR 12,500,000.
     * Bulatkan "recommended_price" secara bersih (misal: 12500000 atau 6000000, tanpa desimal, tanpa koma, dan tanpa simbol mata uang).
     * Dengan begini, harga asli terlihat sangat mahal/premium (menunjukkan kualitas agensi profesional kelas atas), namun harga diskon yang diberikan ke konsumen terasa 3 kali lipat lebih murah.
   
   - "interval": MUST be exactly one of: "one_time", "monthly", or "yearly" (no other values).
     * Project development -> "one_time".
     * Support, retainer, or monthly maintenance -> "monthly".
     * Annual support -> "yearly".
   - "discount": A plain integer from 50 to 70. NEVER use null.

5. ADD-ONS ("addons") — (NICHE-SPECIFIC & LOGICAL MARKET PRICING):
   - Generate 2-4 highly specific, high-value add-ons. 
   - NICHE OPPORTUNITY MATCHING (CRITICAL):
     * Do NOT generate generic add-ons (like 'Basic SEO' or 'Extra Pages') unless they are highly tailored to the niche.
     * Analyze the specific niche/industry of the requested website and brainstorm industry-specific upsells that present high-value business opportunities.
     * Niche Examples:
       - For Car Dealerships: 'Simulasi Kredit & Angsuran Interaktif' (One-time), 'WhatsApp Auto-routing for Test Drive Booking' (Monthly).
       - For Clinics/Dentists: 'Sistem Reservasi Jadwal Dokter Real-time' (One-time), 'Integrasi Whatsapp Reminder Jadwal Pasien' (Monthly).
       - For Hotels/Villas: 'OTA Channel Manager Integration (Sync with Traveloka, Booking.com)' (Monthly), 'Sistem Reservasi Kamar & Manajemen Deposit' (One-time).
       - For E-Commerce: 'Integrasi Kurir Lokal Otomatis & Cek Resi (RajaOngkir/Biteship)' (One-time), 'Inventory Sync & Multi-Warehouse Setup' (One-time).
       - For Professional Services (Lawyers/Consultants): 'Online Consultation Booking & Invoice Automation' (One-time).
   
   - LOGICAL & ACCURATE MARKET PRICING (CRITICAL):
     * Do NOT use a rigid percentage formula of the base price. Pricing must reflect real-world market rates for digital agency services while remaining highly attractive and affordable (upsell-friendly).
     * Add-on prices must match the base service currency (USD or IDR).
     * Real-World Price Ranges (Indonesia - IDR):
       - One-Time Features (e.g., Credit calculator, Custom API, Payment Setup): IDR 500,000 to IDR 3,500,000 (depending on complexity).
       - Monthly Services (e.g., WhatsApp integration maintenance, Monthly content updates, Technical support retainer): IDR 250,000 to IDR 1,200,000 per month (making it highly affordable for businesses).
       - Yearly Services: IDR 2,000,000 to IDR 8,000,000 per year.
     * Real-World Price Ranges (Global - USD):
       - One-Time Features: USD 50 to USD 350.
       - Monthly Services: USD 25 to USD 120 per month.
       - Yearly Services: USD 200 to USD 800 per year.
     * Round all prices cleanly (e.g., IDR 350,000, IDR 1,500,000, or USD 49, USD 120).
     * Ensure every add-on has all 5 fields: "name" (string), "name_id" (string in Indonesian), "price" (number), "interval" ("one_time", "monthly", "yearly"), and "currency" ("USD" or "IDR").

=== REQUIRED JSON OUTPUT FORMAT ===
You MUST return ONLY a raw JSON object with NO markdown, NO explanation, NO code block wrappers. The JSON must exactly match this structure:

{
  "title": "string (English package name)",
  "title_id": "string (Indonesian package name)",
  "description": "string (HTML formatted, English)",
  "description_id": "string (HTML formatted, Indonesian)",
  "features": ["string", "string", "..."],
  "features_id": ["string dalam bahasa Indonesia", "..."],
  "recommended_price": 0,
  "discount": 0,
  "priceType": "FIXED",
  "currency": "USD",
  "interval": "one_time",
  "addons": [
    {
      "name": "string",
      "name_id": "string dalam bahasa Indonesia",
      "price": 0,
      "interval": "one_time",
      "currency": "USD"
    }
  ]
}

CRITICAL CONSTRAINTS — ANY VIOLATION WILL CAUSE A SYSTEM ERROR:
- "features" and "features_id" must be arrays of plain strings, NOT objects.
- "interval" values must be exactly: "one_time", "monthly", or "yearly".
- "currency" values must be exactly: "USD" or "IDR".
- "priceType" must be exactly: "FIXED" or "STARTING_AT".
- "recommended_price" and "price" must be plain numbers, NOT strings.
- "discount" must be a plain integer (50–70), NOT null or omitted.
- Every addon must have all 5 fields: name, name_id, price, interval, currency.
- Do NOT add any extra fields not listed in the schema above.
- Output ONLY the JSON object. No text before or after.
            `,
            output: {
                schema: serviceOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate service content");
        }
        return output;
    }
);

