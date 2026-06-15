import { Prisma } from "@prisma/client";

declare module "@prisma/client" {
    interface PrismaClient {
        addon: Prisma.AddonDelegate;
    }
}
