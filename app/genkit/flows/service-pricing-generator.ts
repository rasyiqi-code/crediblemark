import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

const servicePricingInputSchema = z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    description_id: z.string(),
    features: z.array(z.string()),
    features_id: z.array(z.string()),
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

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { 
                apiKey,
                maxOutputTokens: 4096,
                temperature: 0.7
            },
            prompt: `
You are an expert product manager and pricing strategist for a digital agency.
Your task is to analyze the service title, description, and features provided below, and generate an optimal pricing configuration (priceType, recommended_price, discount, currency, interval).

Service Content Analysis:
- Title: "${sanitizedTitle}"
- Description: "${sanitizedDesc}"
- Features: "${sanitizedFeatures}"

=== BASE PRICING & INTERVAL RULES ===
- "priceType": MUST be exactly "FIXED" or "STARTING_AT" (uppercase, no other values).
- "currency": MUST be exactly "USD" or "IDR" (uppercase, no other values).
  * If the title or description is in Indonesian or mentions 'Rp', 'Rupiah', 'Juta', or large numbers, set currency to 'IDR'.
  
- PSYCHOLOGICAL ANCHOR & CHARM PRICING STRATEGY (CRITICAL):
  * Klien harus merasa mendapatkan diskon besar (sekitar 2.5 hingga 3 kali lipat lebih murah, bahkan bisa sampai diskon 89% untuk mencocokkan anggaran pasar target) untuk menunjukkan profesionalitas premium agensi sambil tetap menjaga harga akhir yang terjangkau.
  * TAHAP 1: Klasifikasikan Target Skala Bisnis (Business Scale Classification) dari judul/deskripsi layanan ke dalam salah satu dari 5 level berikut:
    1. Ultra Mikro (UMi): Profil mesjid lokal, warung kelontong rumahan, pedagang kaki lima, komunitas sosial kecil nirlaba.
    2. Mikro: Bengkel motor lokal independen, barbershop lokal, laundry kiloan, kos-kosan, klinik/praktek mandiri kecil, UKM mikro perorangan.
    3. Kecil: Cafe lokal, toko bahan bangunan, sekolah swasta lokal, CV lokal, klinik spesialis mandiri, dealer motor bekas.
    4. Menengah (SME): Hotel/villa butik, e-commerce regional, perusahaan distributor, pabrik manufaktur lokal.
    5. Besar (Enterprise): Portal korporasi multinasional, SaaS/platform kustom kompleks, marketplace multi-vendor.
  * TAHAP 2: Berdasarkan hasil klasifikasi skala bisnis tersebut, tetapkan target Harga Akhir Konsumen (Consumer Price) yang menggunakan strategi Charm Pricing (angka ganjil berakhiran 990,000 atau 950,000 atau 490,000 atau 450,000):
    - Indonesia (IDR) - HARUS berakhiran ganjil (JANGAN gunakan angka genap bulat seperti 3,000,000 atau 10,000,000):
      * Ultra Mikro (UMi): Harga Akhir Konsumen IDR 1,450,000 s.d. IDR 1,950,000.
      * Mikro: Harga Akhir Konsumen IDR 2,450,000 s.d. IDR 3,450,000.
      * Kecil: Harga Akhir Konsumen IDR 3,950,000 s.d. IDR 8,950,000.
      * Menengah (SME): Harga Akhir Konsumen IDR 9,950,000 s.d. IDR 19,950,000.
      * Besar (Enterprise): Harga Akhir Konsumen IDR 24,950,000 s.d. IDR 49,990,000+.
    - Global (USD) - HARUS berakhiran angka 9 atau 7 atau 5 di digit terakhir (JANGAN gunakan angka genap bulat seperti 300 atau 1000):
      * Ultra Mikro (UMi): Harga Akhir Konsumen USD 149 s.d. USD 199.
      * Mikro: Harga Akhir Konsumen USD 249 s.d. USD 349.
      * Kecil: Harga Akhir Konsumen USD 399 s.d. USD 899.
      * Menengah (SME): Harga Akhir Konsumen USD 999 s.d. USD 1,999.
      * Besar (Enterprise): Harga Akhir Konsumen USD 2,499 s.d. USD 5,999+.
  * TAHAP 3: Tentukan "discount" (diskon) berupa angka bulat GANJIL antara 51 hingga 89 (misal: 53, 55, 59, 65, 75, 85, 89). JANGAN PERNAH gunakan diskon genap (seperti 50, 60, 70, 80, 90).
  * TAHAP 4: Hitung "recommended_price" (Harga Asli/Anchor Price) dengan rumus:
    recommended_price = Harga Akhir Konsumen / (1 - (discount / 100))
  * Bulatkan "recommended_price" secara cerdas agar tetap menggunakan angka ganjil/menarik (Charm Pricing) di digit signifikan (misalnya dibulatkan menjadi IDR 12,190,000 atau IDR 12,250,000, tanpa desimal, tanpa koma, dan tanpa simbol mata uang).
  * Dengan begini, harga asli terlihat sangat mahal/premium (menunjukkan kualitas agensi profesional kelas atas), namun harga diskon ganjil yang diberikan ke konsumen terasa jauh lebih murah dan berakhir dengan angka psikologis yang menarik.

- "interval": MUST be exactly one of: "one_time", "monthly", or "yearly" (no other values).
  * Project development -> "one_time".
  * Support, retainer, or monthly maintenance -> "monthly".
  * Annual support -> "yearly".

=== REQUIRED JSON OUTPUT FORMAT ===
You MUST return ONLY a raw JSON object with NO markdown, NO explanation, NO code block wrappers. The JSON must exactly match this structure:

{
  "priceType": "FIXED",
  "currency": "IDR",
  "recommended_price": 12190000,
  "discount": 75,
  "interval": "one_time"
}
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
