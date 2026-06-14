import { prisma } from "@/lib/config/db";
import { getSystemSettings } from "@/lib/server/settings";

interface MidtransConfig {
    serverKey: string;
    clientKey: string;
    merchantId: string;
    isProduction: boolean;
    isActive: boolean;
}

export class PaymentGatewayService {
    async getMidtransConfig(): Promise<MidtransConfig> {
        const defaultConfig: MidtransConfig = {
            serverKey: "",
            clientKey: "",
            merchantId: "",
            isProduction: false,
            isActive: false
        };

        try {
            // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
            // 🎯 Why: Reduces direct database queries and utilizes Next.js unstable_cache
            // 📊 Impact: Faster configuration retrieval and lower database load
            const settings = await getSystemSettings(["midtrans_config"]);
            const setting = settings.find(s => s.key === "midtrans_config");

            if (setting?.value) {
                return JSON.parse(setting.value);
            }
        } catch (dbError) {
            console.error("[PaymentGateway] Database error fetching midtrans config:", dbError);
        }

        return defaultConfig;
    }

    /**
     * Save Midtrans configuration to database
     */
    async saveMidtransConfig(config: MidtransConfig) {
        await prisma.systemSetting.upsert({
            where: { key: "midtrans_config" },
            update: { value: JSON.stringify(config) },
            create: { key: "midtrans_config", value: JSON.stringify(config) }
        });
    }

    /**
     * Get individual activation status for all gateways
     */
    async getGatewayStatus(): Promise<{ midtrans: boolean }> {
        const midtrans = await this.getMidtransConfig();

        return {
            midtrans: midtrans.isActive && midtrans.serverKey !== "" && midtrans.clientKey !== ""
        };
    }

    /**
     * Check if at least one payment gateway is configured and active
     */
    async hasActiveGateway(): Promise<boolean> {
        const status = await this.getGatewayStatus();
        return status.midtrans;
    }
}

export const paymentGatewayService = new PaymentGatewayService();
