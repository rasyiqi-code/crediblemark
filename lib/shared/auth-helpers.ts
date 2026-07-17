                            
import { hexclaveServerApp } from "@/lib/config/hexclave";

export async function getCurrentUser() {
    try {
        return await hexclaveServerApp.getUser();
    } catch (error: any) {
        if (error && error.message && error.message.includes("Dynamic server usage")) {
            // Abaikan log saat NextJS static analysis build time mencoba merender statis
        } else {
            console.error("[Auth Helper] Gagal mengambil data user:", error);
        }
        return null;
    }
}

/**
 * Permission Checks
 * Based on Stack Auth Documentation:
 * Use user.getPermission(key) for global check.
 * Use user.getPermission(team, key) for team-scoped check.
 */

import { prisma } from "@/lib/config/db";

export async function hasPermission(permission: string) {
    const user = await getCurrentUser();
    if (!user) return false;

    // 1. Env Var Bypass (God Mode)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID; // From .env

    if (adminEmails.includes(user.primaryEmail || '') || user.id === superAdminId) return true;

    // 2. Check Local Database Permission (NEW)
    const localPerm = await prisma.userPermission.findUnique({
        where: {
            userId_key: {
                userId: user.id,
                key: permission
            }
        }
    });
    if (localPerm) return true;

    // 3. Check Project Permission (Global Level)
    const projectPerm = await user.getPermission(permission);
    if (projectPerm) return true;

    // 3. Check Team Permission (Team Level)
    if (user.selectedTeam) {
        const teamPerm = await user.getPermission(user.selectedTeam, permission);
        if (teamPerm) return true;
    }

    return false;
}

// Global Admin Check (for sidebar visibility & page protection)
export async function isAdmin() {
    const user = await getCurrentUser();
    if (!user) return false;

    // Check specific capabilities first (granular)
    if (await hasPermission("manage_projects") ||
        await hasPermission("manage_billing") ||
        await hasPermission("manage_keys")) {
        return true;
    }

    // Fallback: Check for 'team_admin' specifically in the active team
    if (user.selectedTeam) {
        if (await user.getPermission(user.selectedTeam, "team_admin")) return true;
    }

    return false;
}

// Granular Checks Helpers
export async function canManageProjects() { return await hasPermission("manage_projects"); }
export async function canManageBilling() { return await hasPermission("manage_billing"); }
export async function canManageKeys() { return await hasPermission("manage_keys"); }
