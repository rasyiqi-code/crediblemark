import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const services = await prisma.service.findMany();
    const settings = await prisma.systemSetting.findMany();
    console.log("=== SERVICES ===");
    console.log(JSON.stringify(services, null, 2));
    console.log("=== SETTINGS ===");
    console.log(JSON.stringify(settings, null, 2));
}

main().catch(console.error).finally(() => pool.end());
