import { getDbPortfolios } from "@/lib/portfolios/actions";
import { PortfolioManager } from "@/components/admin/portfolio/portfolio-manager";

export default async function AdminPortfolioPage() {
    const portfolios = await getDbPortfolios();

    return (
        <div className="relative min-h-screen">
            {/* Premium Background Elements */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                <PortfolioManager initialData={portfolios} />
            </div>
        </div>
    );
}
