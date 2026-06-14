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
   
   - PSYCHOLOGICAL ANCHOR & CHARM PRICING STRATEGY (CRITICAL):
     * Klien harus merasa mendapatkan diskon besar (sekitar 2.5 hingga 3 kali lipat lebih murah, bahkan bisa sampai diskon 89% untuk mencocokkan anggaran pasar target) untuk menunjukkan profesionalitas premium agensi sambil tetap menjaga harga akhir yang terjangkau.
     * Pertama, tentukan target Harga Akhir Konsumen (Consumer Price) yang menggunakan strategi Charm Pricing (angka ganjil/tidak bulat mulus) sesuai kerumitan proyek:
       - Indonesia (IDR) - HARUS berakhiran 990,000 atau 950,000 atau 490,000 atau 450,000 (JANGAN gunakan angka genap bulat seperti 3,000,000 atau 10,000,000):
         * Low Complexity / UKM / Landing Page: Harga Akhir Konsumen IDR 2,450,000 s.d. IDR 5,990,000.
         * Medium Complexity / Standard Company Profile / SME E-commerce: Harga Akhir Konsumen IDR 6,950,000 s.d. IDR 14,990,000.
         * High Complexity / Custom System / SaaS / Enterprise Portal: Harga Akhir Konsumen IDR 17,950,000 s.d. IDR 49,990,000.
       - Global (USD) - HARUS berakhiran angka 9 atau 7 atau 5 di digit terakhir (JANGAN gunakan angka genap bulat seperti 300 atau 1000):
         * Low Complexity: Harga Akhir Konsumen USD 249 s.d. USD 599.
         * Medium Complexity: Harga Akhir Konsumen USD 799 s.d. USD 1,799.
         * High Complexity: Harga Akhir Konsumen USD 1,999 s.d. USD 5,999.
     * Kedua, tentukan "discount" (diskon) berupa angka bulat GANJIL antara 51 hingga 89 (misal: 53, 55, 59, 65, 75, 85, 89). JANGAN PERNAH gunakan diskon genap (seperti 50, 60, 70, 80, 90).
     * Ketiga, hitung "recommended_price" (Harga Asli/Anchor Price) dengan rumus:
       recommended_price = Harga Akhir Konsumen / (1 - (discount / 100))
     * Contoh: Jika target Harga Akhir Konsumen adalah IDR 4,990,000 dan diskon ganjil 59%:
       recommended_price = 4,990,000 / 0.41 = IDR 12,170,731.
     * Bulatkan "recommended_price" secara cerdas agar tetap menggunakan angka ganjil/menarik (Charm Pricing) di digit signifikan (misalnya dibulatkan menjadi IDR 12,190,000 atau IDR 12,250,000, tanpa desimal, tanpa koma, dan tanpa simbol mata uang).
     * Dengan begini, harga asli terlihat sangat mahal/premium (menunjukkan kualitas agensi profesional kelas atas), namun harga diskon ganjil yang diberikan ke konsumen terasa jauh lebih murah dan berakhir dengan angka psikologis yang menarik.
   
   - "interval": MUST be exactly one of: "one_time", "monthly", or "yearly" (no other values).
     * Project development -> "one_time".
     * Support, retainer, or monthly maintenance -> "monthly".
     * Annual support -> "yearly".
   - "discount": A plain ODD integer from 51 to 89 (e.g., 53, 55, 59, 75, 85, 89). NEVER use null or even integers.

5. ADD-ONS ("addons") — (NICHE-SPECIFIC, LOGICAL MARKET, & CHARM PRICING):
   - Generate as many highly specific, high-value add-ons as relevant to capture niche opportunities (no maximum limit, minimum 2-3).
   - SCOPE SEGREGATION (CRITICAL):
     * If the service requested is a simple or basic marketing website (e.g., Mosque/Mesjid, local brick-and-mortar stores, local building supplies/toko bangunan, small UKM):
       - Keep the base package strictly limited to basic and essential features (e.g., simple profile pages, contact info, basic photo gallery).
       - Move ALL advanced, specialized, or extra features (such as online reservation/booking, custom member portal, online donation system, advanced interactive calculator, custom API integrations, dynamic inventory management) into separate Add-ons.
       - This ensures the base package remains highly affordable for tight budgets, while securing upsell opportunities via add-ons.
   - NICHE OPPORTUNITY MATCHING (CRITICAL):
     * Do NOT generate generic add-ons (like 'Basic SEO' or 'Extra Pages') unless they are highly tailored to the niche.
     * Analyze the specific niche/industry of the requested website and brainstorm industry-specific upsells that present high-value business opportunities.
     * Niche Examples:
       - For Car Dealerships: 'Simulasi Kredit & Angsuran Interaktif' (One-time), 'WhatsApp Auto-routing for Test Drive Booking' (Monthly).
       - For Clinics/Dentists: 'Sistem Reservasi Jadwal Dokter Real-time' (One-time), 'Integrasi Whatsapp Reminder Jadwal Pasien' (Monthly).
       - For Hotels/Villas: 'OTA Channel Manager Integration (Sync with Traveloka, Booking.com)' (Monthly), 'Sistem Reservasi Kamar & Manajemen Deposit' (One-time).
       - For E-Commerce: 'Integrasi Kurir Lokal Otomatis & Cek Resi (RajaOngkir/Biteship)' (One-time), 'Inventory Sync & Multi-Warehouse Setup' (One-time).
       - For Professional Services (Lawyers/Consultants): 'Online Consultation Booking & Invoice Automation' (One-time).
   
   - LOGICAL, ACCURATE MARKET, & CHARM PRICING (CRITICAL):
     * Do NOT use a rigid percentage formula of the base price. Pricing must reflect real-world market rates for digital agency services while remaining highly attractive, affordable, and ended in charm numbers (odd digits).
     * Add-on prices must match the base service currency (USD or IDR).
     * Real-World Price Ranges (Indonesia - IDR) — STRICTLY ADHERE TO THESE LIMITS & USE ODD/CHARM ENDINGS (e.g., ending in 90,000, 50,000, 490,000, etc. NEVER use round even numbers like 500,000 or 1,000,000):
       - One-Time Features: IDR 490,000 to IDR 2,950,000 (One-time setup fee).
       - Monthly Services: IDR 249,000 to IDR 790,000 per month (NEVER exceed IDR 990,000/month as recurring fee, otherwise clients will reject it).
       - Yearly Services: IDR 1,950,000 to IDR 7,990,000 per year.
     * Real-World Price Ranges (Global - USD) — STRICTLY ADHERE TO THESE LIMITS & USE ODD/CHARM ENDINGS (e.g., ending in 9, 7, or 5 like 49, 79, 95. JANGAN gunakan nominal genap bulat seperti 50 or 100):
       - One-Time Features: USD 49 to USD 299.
       - Monthly Services: USD 25 to USD 79 per month (NEVER exceed USD 99/month as recurring fee).
       - Yearly Services: USD 199 to USD 799 per year.
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
- "discount" must be a plain ODD integer (51–89), NOT null or omitted.
- Every addon must have all 5 fields: name, name_id, price, interval, currency.
- If an addon has "monthly" interval, its price MUST NOT exceed 990000 IDR (or 99 USD).
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

