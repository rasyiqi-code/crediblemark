import QRCode from "react-qr-code";

interface AuthenticityStickerProps {
    id: string;
}

/**
 * Stiker keaslian (authenticity sticker) dengan QR code untuk verifikasi dokumen.
 * Diekstrak dari `invoice-document.tsx` agar bisa digunakan di dokumen lain
 * yang membutuhkan verifikasi (misalnya: kwitansi, kontrak, dll).
 */
export function AuthenticitySticker({ id }: AuthenticityStickerProps) {
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "https://crediblemark.com");
    const verificationUrl = `${appUrl}/verify/${id}`;

    // Buat serial number numerik dari ID
    const serialNumber = id
        .split("")
        .map((char) => char.charCodeAt(0) % 10)
        .join("")
        .slice(0, 10);
    const formattedSerial = serialNumber.match(/.{1,5}/g)?.join(" ") || serialNumber;

    return (
        <div className="relative w-20 flex flex-col bg-white rounded-sm overflow-hidden rotate-[-1.5deg] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] border-r border-b border-zinc-200/50 transform hover:rotate-0 hover:scale-105 transition-all duration-300 print:rotate-[-1.5deg] print:shadow-none">
            {/* Satin Highlight Overlay (Physical Sticker Texture) */}
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20" />

            {/* Header: Bagian hitam */}
            <div className="relative bg-black py-1 px-1 text-center z-10">
                <span className="text-[6px] font-black text-[#D4AF37] tracking-[0.2em] uppercase leading-none block">
                    OFFICIAL
                </span>
            </div>

            {/* Middle: Area QR Code */}
            <div className="relative p-1.5 bg-white flex flex-col items-center z-10">
                <div className="relative bg-white rounded-xs mb-1">
                    <QRCode
                        value={verificationUrl}
                        size={48}
                        level="H"
                        fgColor="#000000"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                </div>
                {/* Serial Number */}
                <div className="font-mono text-[7px] text-black tracking-tighter font-bold leading-none">
                    {formattedSerial}
                </div>
            </div>

            {/* Footer: Metallic Section */}
            <div className="relative bg-[#F3F4F6] py-1 px-1 overflow-hidden text-center z-10">
                {/* Holographic Shimmer Effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                <div className="relative flex flex-col items-center">
                    <div className="text-black font-black text-[6px] uppercase tracking-tighter italic leading-none mb-0.5">
                        Scan To Verify
                    </div>
                    <div className="text-[5px] font-bold text-zinc-500 tracking-tight leading-none">
                        crediblemark.com
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite linear;
                }
            `}</style>
        </div>
    );
}
