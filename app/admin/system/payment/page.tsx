import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import { CreditCard, Save, Building, User, CheckCircle2, XCircle } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { PaymentGatewayConfigForm } from "@/components/admin/payment-gateway-config-form";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getSystemSettings } from "@/lib/server/settings";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export default async function AdminPaymentPage() {
    // Fetch bank settings
    // ⚡ Bolt Optimization: Use getSystemSettings (which utilizes unstable_cache) instead of direct prisma query.
    // 🎯 Why: Reduces database load by caching frequently accessed payment settings.
    // 📊 Impact: Eliminates a database query on the payment settings page load.
    const settings = await getSystemSettings(['bank_name', 'bank_account', 'bank_holder', 'manual_payment_active']);

    // Fetch payment gateway configs
    const midtransConfig = await paymentGatewayService.getMidtransConfig();

    const getSetting = (key: string) => settings.find((s: { key: string; value: string }) => s.key === key)?.value || "";

    async function updateSettings(formData: FormData) {
        "use server";
        const bankName = formData.get("bank_name") as string;
        const bankAccount = formData.get("bank_account") as string;
        const bankHolder = formData.get("bank_holder") as string;
        const manualActive = formData.get("manual_payment_active") === "on";

        // Upsert each setting
        await prisma.systemSetting.upsert({ where: { key: "bank_name" }, update: { value: bankName }, create: { key: "bank_name", value: bankName } });
        await prisma.systemSetting.upsert({ where: { key: "bank_account" }, update: { value: bankAccount }, create: { key: "bank_account", value: bankAccount } });
        await prisma.systemSetting.upsert({ where: { key: "bank_holder" }, update: { value: bankHolder }, create: { key: "bank_holder", value: bankHolder } });
        await prisma.systemSetting.upsert({ where: { key: "manual_payment_active" }, update: { value: manualActive ? "true" : "false" }, create: { key: "manual_payment_active", value: manualActive ? "true" : "false" } });

        revalidatePath("/admin/system/payment");
    }

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter title="Payment Details" />

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <SystemNav />
                    </div>
                </div>

                {/* Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Bank Details Form */}
                    <div className="space-y-6">
                        <div className="pb-4 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-emerald-500" />
                                    Bank Account
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">Details displayed on client invoices.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                                {getSetting("manual_payment_active") === "true" ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Active</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Inactive</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <form action={updateSettings} className="space-y-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                            <Building className="w-3.5 h-3.5" />
                                            Bank Name
                                        </label>
                                        <Input
                                            name="bank_name"
                                            defaultValue={getSetting("bank_name")}
                                            placeholder="e.g. BCA"
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            Account Number
                                        </label>
                                        <Input
                                            name="bank_account"
                                            defaultValue={getSetting("bank_account")}
                                            placeholder="e.g. 1234567890"
                                            className="bg-black/20 border-white/10 text-zinc-200 font-mono focus-visible:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Account Holder Name
                                    </label>
                                    <Input
                                        name="bank_holder"
                                        defaultValue={getSetting("bank_holder")}
                                        placeholder="e.g. PT Crediblemark Indonesia"
                                        className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-emerald-500/20"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="manual_payment_active" className="text-sm font-medium text-white">Manual Transfer Status</Label>
                                        <p className="text-xs text-zinc-500">Enable this to show bank details on client invoices.</p>
                                    </div>
                                    <Switch
                                        id="manual_payment_active"
                                        name="manual_payment_active"
                                        defaultChecked={getSetting("manual_payment_active") === "true"}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <PaymentGatewayConfigForm
                        initialConfig={{
                            midtrans: midtransConfig
                        }}
                    />

                </div>
            </div>
        </div>
    );
}
