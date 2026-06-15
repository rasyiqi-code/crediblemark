import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
import { getTranslations } from "next-intl/server";
import { AddonListClient } from "@/components/admin/addons/addon-list-client";
import { CreateAddonDialog } from "@/components/admin/addons/create-addon-dialog";
import { Puzzle } from "lucide-react";

export default async function AddonsPage() {
    // Strict Access Control: Hanya Administrator yang dapat mengakses manajemen addon
    if (!await isAdmin()) redirect('/dashboard');

    const addons = await prisma.addon.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const t = await getTranslations("Admin.Addons");

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter
                title={
                    <span className="flex items-center gap-3">
                        <span className="hidden sm:inline">{t("management")}</span>
                        <span className="sm:hidden">Add-ons</span>
                        <Puzzle className="w-6 h-6 text-zinc-600 hidden sm:inline-block" />
                    </span>
                }
                actions={
                    <CreateAddonDialog />
                }
            />

            <div className="w-full space-y-2">
                <AddonListClient addons={addons} />
            </div>
        </div>
    );
}
