
import { NextResponse } from "next/server";
import { getActiveTestimonials, getAllTestimonials } from "@/lib/server/testimonials";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const active = searchParams.get("active");

        // If active param is not present, return all (for admin), unless specifically requested
        // Logic: 
        // ?active=true -> public active only
        // ?active=false -> show all (admin view usually wants everything, or maybe strictly inactive?)
        // Let's stick to: ?active=true means ONLY active. ?active=false or missing means ALL for admin context usually.
        // Actually, "active=false" implies inactive only? 
        // Let's refine: 
        // Public fetch: ?active=true
        // Admin fetch: ?all=true  or no params = all.

        const onlyActive = active === "true";

        const testimonials = onlyActive 
            ? await getActiveTestimonials() 
            : await getAllTestimonials();

        const res = NextResponse.json({ success: true, data: testimonials });
        if (onlyActive) {
            res.headers.set("Cache-Control", "public, max-age=3600");
        }
        return res;
    } catch {
        return NextResponse.json({ success: false, error: "Failed to fetch testimonials" }, { status: 500 });
    }
}



