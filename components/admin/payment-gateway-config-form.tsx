"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, EyeOff, Loader2, CreditCard, Store } from "lucide-react";
import { toast } from "sonner";
import { savePaymentConfig } from "@/app/actions/system-admin";

interface PaymentGatewayConfig {
    midtrans?: {
        serverKey: string;
        clientKey: string;
        merchantId: string;
        isProduction: boolean;
        isActive: boolean;
    };
}

export function PaymentGatewayConfigForm({ initialConfig }: { initialConfig: PaymentGatewayConfig }) {
    const [midtransConfig, setMidtransConfig] = useState(initialConfig.midtrans || {
        serverKey: '',
        clientKey: '',
        merchantId: '',
        isProduction: false,
        isActive: false
    });

    const [showMidtransKeys, setShowMidtransKeys] = useState(false);
    const [savingMidtrans, setSavingMidtrans] = useState(false);

    const handleSaveMidtrans = async () => {
        setSavingMidtrans(true);
        try {
            await savePaymentConfig("midtrans", midtransConfig);
            toast.success("Midtrans configuration saved successfully");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save Midtrans configuration");
        } finally {
            setSavingMidtrans(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Midtrans Configuration */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            Midtrans Payment Gateway
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Configure Midtrans API credentials and mode.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                                Server Key
                                <button
                                    type="button"
                                    onClick={() => setShowMidtransKeys(!showMidtransKeys)}
                                    className="text-zinc-500 hover:text-zinc-300"
                                >
                                    {showMidtransKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </label>
                            <Input
                                type={showMidtransKeys ? "text" : "password"}
                                value={midtransConfig.serverKey}
                                onChange={(e) => setMidtransConfig({ ...midtransConfig, serverKey: e.target.value })}
                                placeholder="Mid-server-xxxxx"
                                className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Client Key</label>
                            <Input
                                type={showMidtransKeys ? "text" : "password"}
                                value={midtransConfig.clientKey}
                                onChange={(e) => setMidtransConfig({ ...midtransConfig, clientKey: e.target.value })}
                                placeholder="Mid-client-xxxxx"
                                className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Merchant ID</label>
                        <Input
                            value={midtransConfig.merchantId}
                            onChange={(e) => setMidtransConfig({ ...midtransConfig, merchantId: e.target.value })}
                            placeholder="G123456789"
                            className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-blue-500/20"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-white/5">
                        <div>
                            <p className="text-sm font-medium text-white">Active Status</p>
                            <p className="text-xs text-zinc-500">Enable or disable Midtrans as a payment option</p>
                        </div>
                        <Switch
                            checked={midtransConfig.isActive}
                            onCheckedChange={(checked) => setMidtransConfig({ ...midtransConfig, isActive: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-white/5">
                        <div>
                            <p className="text-sm font-medium text-white">Production Mode</p>
                            <p className="text-xs text-zinc-500">Enable for live transactions (disable for sandbox)</p>
                        </div>
                        <Switch
                            checked={midtransConfig.isProduction}
                            onCheckedChange={(checked) => setMidtransConfig({ ...midtransConfig, isProduction: checked })}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button
                            onClick={handleSaveMidtrans}
                            disabled={savingMidtrans || !midtransConfig.serverKey || !midtransConfig.clientKey || !midtransConfig.merchantId}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
                        >
                            {savingMidtrans ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Midtrans Config
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
