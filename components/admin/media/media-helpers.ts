export const SYSTEM_FOLDERS = ["objects"];

export const FOLDER_LABELS: Record<string, string> = {
    "logos": "Logo & Branding",
    "marketing": "Materi Marketing",
    "products": "Gambar Produk",
    "projects": "Aset Proyek",
    "proofs": "Bukti Pembayaran",
    "services": "Gambar Layanan",
    "tickets": "Lampiran Tiket",
    "uploads": "Unggahan User",
};

export function getFolderLabel(folderName: string): string {
    return FOLDER_LABELS[folderName.toLowerCase()] || folderName.charAt(0).toUpperCase() + folderName.slice(1);
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
