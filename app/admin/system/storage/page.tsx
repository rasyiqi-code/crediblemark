import { prisma } from "@/lib/config/db";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { revalidatePath, revalidateTag } from "next/cache";
import { Cloud } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { getSystemSettings } from "@/lib/server/settings";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export default async function AdminStoragePage() {
    // Fetch settings
    const settings = await getSystemSettings(['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_public_domain', 'r2_bucket_name', 'cloudflare_account_id', 'cloudflare_api_token']);

    const getSetting = (key: string) => settings.find((s: { key: string; value: string }) => s.key === key)?.value || "";

    async function updateSettings(formData: FormData) {
        "use server";

        const r2BucketName = formData.get("r2_bucket_name") as string;
        const r2Endpoint = formData.get("r2_endpoint") as string;
        const r2AccessKeyId = formData.get("r2_access_key_id") as string;
        const r2SecretAccessKey = formData.get("r2_secret_access_key") as string;
        const r2PublicDomain = formData.get("r2_public_domain") as string;
        const cfAccountId = formData.get("cloudflare_account_id") as string;
        const cfApiToken = formData.get("cloudflare_api_token") as string;

        if (r2BucketName) await prisma.systemSetting.upsert({ where: { key: "r2_bucket_name" }, update: { value: r2BucketName }, create: { key: "r2_bucket_name", value: r2BucketName } });
        if (r2Endpoint) await prisma.systemSetting.upsert({ where: { key: "r2_endpoint" }, update: { value: r2Endpoint }, create: { key: "r2_endpoint", value: r2Endpoint } });
        if (r2AccessKeyId) await prisma.systemSetting.upsert({ where: { key: "r2_access_key_id" }, update: { value: r2AccessKeyId }, create: { key: "r2_access_key_id", value: r2AccessKeyId } });
        if (r2SecretAccessKey) await prisma.systemSetting.upsert({ where: { key: "r2_secret_access_key" }, update: { value: r2SecretAccessKey }, create: { key: "r2_secret_access_key", value: r2SecretAccessKey } });
        if (r2PublicDomain) await prisma.systemSetting.upsert({ where: { key: "r2_public_domain" }, update: { value: r2PublicDomain }, create: { key: "r2_public_domain", value: r2PublicDomain } });
        if (cfAccountId) await prisma.systemSetting.upsert({ where: { key: "cloudflare_account_id" }, update: { value: cfAccountId }, create: { key: "cloudflare_account_id", value: cfAccountId } });
        if (cfApiToken) await prisma.systemSetting.upsert({ where: { key: "cloudflare_api_token" }, update: { value: cfApiToken }, create: { key: "cloudflare_api_token", value: cfApiToken } });
        
        revalidateTag("system-settings", "max");
        revalidatePath("/admin/system/storage");
    }

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter title="Cloud Storage" />

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="space-y-6">
                        <div className="pb-4 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Cloud className="w-4 h-4 text-blue-500" />
                                    R2 Configuration
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">Connection details for Cloudflare R2 bucket.</p>
                            </div>
                        </div>

                        <div>
                            <form action={updateSettings} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">R2 Endpoint</label>
                                    <Input
                                        name="r2_endpoint"
                                        defaultValue={getSetting("r2_endpoint")}
                                        placeholder="https://<accountid>.r2.cloudflarestorage.com"
                                        className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Bucket Name</label>
                                    <Input
                                        name="r2_bucket_name"
                                        defaultValue={getSetting("r2_bucket_name")}
                                        placeholder="agency-os-assets"
                                        className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Access Key ID</label>
                                        <Input
                                            name="r2_access_key_id"
                                            defaultValue={getSetting("r2_access_key_id")}
                                            type="password"
                                            className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Secret Access Key</label>
                                        <Input
                                            name="r2_secret_access_key"
                                            defaultValue={getSetting("r2_secret_access_key")}
                                            type="password"
                                            className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Public Domain</label>
                                    <Input
                                        name="r2_public_domain"
                                        defaultValue={getSetting("r2_public_domain")}
                                        placeholder="https://pub-....r2.dev"
                                        className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                                    />
                                    <p className="text-[10px] text-zinc-500">Used to serve files publicly. Make sure it is accessible.</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <SubmitButton className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                                        Save Configuration
                                    </SubmitButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5 mt-6">
                        <div className="pb-4 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Cloud className="w-4 h-4 text-orange-500" />
                                    Cloudflare Browser Rendering
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">Credentials for bypassing X-Frame-Options.</p>
                            </div>
                        </div>

                        <div>
                            <form action={updateSettings} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Cloudflare Account ID</label>
                                    <Input
                                        name="cloudflare_account_id"
                                        defaultValue={getSetting("cloudflare_account_id")}
                                        placeholder="Enter your Cloudflare Account ID"
                                        className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-orange-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Cloudflare API Token</label>
                                    <Input
                                        name="cloudflare_api_token"
                                        defaultValue={getSetting("cloudflare_api_token")}
                                        type="password"
                                        placeholder="Enter your Browser Rendering API Token"
                                        className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-orange-500/20"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <SubmitButton className="bg-orange-600 hover:bg-orange-500 text-white font-medium">
                                        Save Rendering Settings
                                    </SubmitButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
