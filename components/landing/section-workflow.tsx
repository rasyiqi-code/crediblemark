import { WorkflowContent } from "@/components/landing/workflow-content";

export async function Workflow() {
    return (
        <section id="workflow" className="py-16 bg-black border-y border-white/5 relative overflow-hidden">
            {/* Pola background diagonal lines yang dinamis dengan mask yang lebih tajam */}
            <div className="absolute inset-0 z-0 opacity-[0.04] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_60%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_60%)] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 10px)`
                }}
            />

            <div className="relative z-10">
                <WorkflowContent />
            </div>
        </section>
    );
}
