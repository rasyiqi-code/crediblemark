import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface MidtransMetadata {
    bank?: string;
    va_numbers?: { bank: string; va_number: string }[];
    permata_va_number?: string;
    acquirer?: string;
    store?: string;
}

export function formatPaymentMethod(type: string | null | undefined, metadata?: Record<string, unknown> | null) {
    if (!type) return "Unknown";
    const lowerType = type.toLowerCase();

    const m = metadata as MidtransMetadata | null;

    if (lowerType === 'bank_transfer') {
        if (m?.bank) return `${m.bank.toUpperCase()} VA`;
        if (m?.va_numbers?.[0]?.bank) {
            return `${m.va_numbers[0].bank.toUpperCase()} VA`;
        }
        if (m?.permata_va_number) return 'PERMATA VA';
        return 'BANK TRANSFER';
    }

    if (lowerType === 'qris') {
        const acquirer = m?.acquirer === 'gopay' ? 'GOPAY' : m?.acquirer?.toUpperCase();
        return acquirer ? `QRIS (${acquirer})` : 'QRIS';
    }

    if (lowerType === 'echannel') return 'MANDIRI BILL';
    if (lowerType === 'cstore') return `C-STORE (${m?.store?.toUpperCase() || 'ALFAMART/INDOMARET'})`;

    return type.replace(/_/g, ' ').toUpperCase();
}

export function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')        // Trim - from start of text
        .replace(/-+$/, '');       // Trim - from end of text
}

/**
 * Membersihkan ringkasan estimasi atau deskripsi proyek dari teks add-ons yang ditambahkan
 * selama proses checkout agar tidak tampil mentah atau rusak di UI.
 */
export function cleanSummaryText(summary: string | null | undefined): string {
    if (!summary) return "";
    
    const addonsMarker = "Add-ons Selected at Checkout:";
    let clean = summary;
    const markerIndex = clean.toLowerCase().indexOf(addonsMarker.toLowerCase());
    if (markerIndex !== -1) {
        clean = clean.substring(0, markerIndex);
    }
    
    return clean
        .replace(/\n*---\s*Selected Add-ons\s*---\n*/gi, '')
        .replace(/\n*-\s*\+\s*.+/g, '') // Hapus baris daftar addon yang diawali "- +"
        .replace(/\n*\+\s*.+/g, '')     // Hapus baris addon yang diawali "+"
        .replace(/\n*-\s*$/gm, '')      // Hapus baris yang hanya berisi tanda hubung "-" di akhir baris
        .trim();
}

/**
 * Menghasilkan seed angka harian yang unik (YYYYMMDD) berdasarkan waktu saat ini.
 */
export function getDailyRandomSeed(): number {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return parseInt(`${yyyy}${mm}${dd}`, 10);
}

/**
 * Mengocok array menggunakan algoritma Fisher-Yates.
 * Jika parameter `seed` diberikan, pengocokan akan pseudo-random (deterministic berdasarkan seed).
 */
export function shuffleArray<T>(array: T[], seed?: number): T[] {
    const shuffled = [...array];
    if (seed !== undefined) {
        let currentSeed = seed;
        const seededRandom = () => {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
        };
        for (let i = shuffled.length - 1; i > 0; i--) {
            const rand = seededRandom();
            const j = Math.floor(rand * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    } else {
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    }
    return shuffled;
}

/**
 * Menyalin teks ke clipboard browser dan menampilkan toast notifikasi.
 * Gunakan fungsi ini sebagai pengganti `navigator.clipboard.writeText` lokal
 * di setiap komponen agar tidak perlu mengimpor toast berulang.
 *
 * @param text  - Teks yang akan disalin
 * @param label - Label yang ditampilkan di toast (cth: "ID", "Invoice ID")
 * @param toast - Referensi fungsi toast dari `sonner` (opsional jika tidak perlu notifikasi)
 */
export async function copyToClipboard(
    text: string,
    label: string,
    toastFn?: (msg: string) => void
): Promise<void> {
    await navigator.clipboard.writeText(text);
    if (toastFn) {
        toastFn(`${label} copied`);
    }
}
