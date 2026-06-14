import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const serviceAddonsInputSchema = z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    description_id: z.string(),
    features: z.array(z.string()),
    features_id: z.array(z.string()),
    recommended_price: z.number(),
    discount: z.number(),
    currency: z.enum(['USD', 'IDR']),
    priceType: z.enum(['FIXED', 'STARTING_AT']),
    interval: z.enum(['one_time', 'monthly', 'yearly']),
});

const serviceAddonsOutputSchema = z.object({
    addons: z.array(z.object({
        name: z.string(),
        name_id: z.string(),
        price: z.number(),
        interval: z.enum(['one_time', 'monthly', 'yearly']),
        currency: z.enum(['USD', 'IDR'])
    }))
});

export const serviceAddonsGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceAddonsGeneratorFlow',
        inputSchema: serviceAddonsInputSchema,
        outputSchema: serviceAddonsOutputSchema,
    },
    async (input) => {
        const { apiKey, model } = await getActiveAIConfig();

        const sanitizedTitle = input.title.trim();
        const sanitizedDesc = input.description.trim();
        const basePrice = input.recommended_price;
        const discount = input.discount;
        const currency = input.currency;
        const interval = input.interval;

        // Hitung harga konsumen untuk referensi skala bisnis
        const consumerPrice = discount > 0 ? basePrice * (1 - (discount / 100)) : basePrice;

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.7
            },
            prompt: `
You are an expert product manager and upsell strategist for a digital agency.
Your task is to analyze the service details and pricing provided below, and generate a list of highly specific, high-value add-ons that fit this offering.

Service Profile:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Base Price (Original): ${currency} ${basePrice}
- Discount: ${discount}% (Consumer Price: ${currency} ${consumerPrice})
- Interval: ${interval}

=== ADD-ONS GENERATION RULES ===
1. Quantity: Generate between 2 to 4 highly specific, high-value add-ons.
2. SCOPE SEGREGATION & BUSINESS LOGIC COMPLEXITY (CRITICAL):
   The separation between "Standard Features" (assumed to be in the base service) and "Add-on Features" (advanced) must be based on the Complexity of Business Logic, categorized by these 3 parameters:

   a. Customization Scale (Default Flow vs. Business-Specific Flow):
      - Standard: Uses template, default, or plug-and-play flow (e.g., standard e-commerce cart, basic payment checkout, standard landing pages).
      - Add-on: Business-specific conditional logic (e.g., Dynamic Pricing based on B2B login role, branching multi-step custom forms).

   b. Data Management (1-Way Input vs. Interactive Relational/Multi-Way):
      - Standard: One-way static data collection (e.g., booking form that just sends an email, testimonial slider managed by admin, simple portfolio upload).
      - Add-on: Real-time, interactive, relational processing (e.g., Client Login Portal for invoice downloads, real-time Live Inventory API Sync with warehouse, automated calendar slot booking/blocking upon payment).

   c. Operational Execution (Manual Human Admin Tasks vs. Automated System Engine):
      - Standard: Requires manual staff work behind the scenes (e.g., client requests a quote, and an admin manually calculates and emails the PDF).
      - Add-on: Full end-to-end automation by the system (e.g., an automated quote calculator that calculates, renders, and emails a detailed PDF breakdown instantly).

3. MATRIX GUIDELINE (STANDARD VS. ADD-ON):
   Use this mapping to decide what goes into Add-ons (DO NOT suggest features from the 'Standard' column as add-ons):
   - E-Commerce & Payments:
     * Standard: Catalog, Cart, Checkout, Payment Gateway Integration (QRIS, VA).
     * Add-on: Recurring Billing/Subscription, Tiered B2B Pricing, Multi-Currency.
   - Booking & Reservations:
     * Standard: Form with date picker, WhatsApp order button.
     * Add-on: Real-time Calendar sync (Google Calendar), Seat/spot picker, Auto-blocking slots.
   - Content & Marketing:
     * Standard: Landing Page, Blog, Portfolio Gallery, Lead Magnet Pop-up.
     * Add-on: Paywall/locked content, Dynamic Lead Magnet/Quiz Generator, User-Generated Content directories.
   - Communication & Support:
     * Standard: Contact form, Floating Chat/WA button, basic FAQ.
     * Add-on: Automated Helpdesk/Ticketing, Live status tracking, AI Chatbot assistant.
   - Tech Infrastructure:
     * Standard: Mobile Responsive, SSL, Google Analytics/Meta Pixel.
     * Add-on: Client Login Portal, Complex third-party API Integrations (Logistics GPS, Live Market Price).

4. BUSINESS SCALE ADD-ON PRICING (CRITICAL):
   - Harga add-on ("price") wajib disesuaikan secara logis dengan skala bisnis (dilihat dari Consumer Price ${currency} ${consumerPrice}) agar terjangkau dan disetujui klien:
     * Indonesia (IDR):
       - Jika Consumer Price < 2 Juta (Ultra Mikro):
         * One-Time Add-ons: IDR 249,000 s.d. IDR 490,000.
         * Monthly Add-ons: IDR 49,000 s.d. IDR 149,000.
       - Jika Consumer Price 2 Juta - 3.5 Juta (Mikro):
         * One-Time Add-ons: IDR 490,000 s.d. IDR 990,000.
         * Monthly Add-ons: IDR 99,000 s.d. IDR 290,000.
       - Jika Consumer Price 3.5 Juta - 9 Juta (Kecil):
         * One-Time Add-ons: IDR 990,000 s.d. IDR 1,990,000.
         * Monthly Add-ons: IDR 190,000 s.d. IDR 490,000.
       - Jika Consumer Price 9 Juta - 20 Juta (Menengah/SME):
         * One-Time Add-ons: IDR 1,990,000 s.d. IDR 3,990,000.
         * Monthly Add-ons: IDR 390,000 s.d. IDR 790,000.
       - Jika Consumer Price > 20 Juta (Besar/Enterprise):
         * One-Time Add-ons: IDR 3,990,000 s.d. IDR 7,950,000.
         * Monthly Add-ons: IDR 490,000 s.d. IDR 990,000.
     * Global (USD):
       - Jika Consumer Price < USD 200: One-Time max USD 49, Monthly max USD 15.
       - Jika Consumer Price USD 200 - USD 350: One-Time max USD 99, Monthly max USD 29.
       - Jika Consumer Price USD 350 - USD 900: One-Time max USD 199, Monthly max USD 49.
       - Jika Consumer Price USD 900 - USD 2000: One-Time max USD 399, Monthly max USD 79.
       - Jika Consumer Price > USD 2000: One-Time max USD 799, Monthly max USD 99.

   - "currency" untuk addons harus sama dengan currency dasar: "${currency}".
   - "price" untuk addons harus berupa angka CHARM/ganjil. JANGAN gunakan angka genap bulat.

5. ADD-ON NAME SPECIFICITY & VALUE (CRITICAL — MANDATORY):
   - Add-ons MUST represent high-value additions (e.g. third-party API integrations, copywriting/content creation service, dedicated custom design pages, ongoing monthly maintenance, or priority support).
   - NEVER limit standard CMS/Admin Dashboard capabilities. Clients must have UNLIMITED access to create categories, upload products/items, add database records, create menus, or manage dynamic content.
   - ABSOLUTELY DO NOT use restrictions like "Up to X Categories", "Max X Pages", "Up to X Images", "Limit X Products" in add-on names. These make the offer look bad and have zero value.
   - Quotas/limits MUST ONLY apply to the agency's manual service deliverables (e.g. "3 Articles/Month", "Up to 3 API integrations set up", "4 hours of support/month").
   - "name" and "name_id" must be specific and self-explanatory.
   - Good examples:
     * "SEO Content Writing - 3 Articles/Month (500-800 Words Each)"
     * "WhatsApp API Setup & Integration (Up to 3 Custom Event Triggers)"
     * "Monthly Performance Support - 4 Hours/Month Support Retainer"
     * "Custom Lead Capture Form with CRM Auto-Sync (HubSpot/Zoho)"
     * "Konten Blog SEO - 3 Artikel/Bulan (600-800 Kata)"

=== REQUIRED JSON OUTPUT FORMAT ===
You MUST return ONLY a raw JSON object with NO markdown, NO explanation, NO code block wrappers. The JSON must exactly match this structure:

{
  "addons": [
    {
      "name": "string (specific: include quantity/frequency/scope)",
      "name_id": "string (spesifik dalam bahasa Indonesia)",
      "price": 0,
      "interval": "one_time",
      "currency": "USD"
    }
  ]
}
            `,
            output: {
                schema: serviceAddonsOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate service addons");
        }

        return output;
    }
);
