import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Meredam MaxListenersExceededWarning dari Next.js dev server HMR / worker threads
if (typeof process !== 'undefined' && typeof process.setMaxListeners === 'function') {
    process.setMaxListeners(20);
}

const isDev = process.env.NODE_ENV === 'development'
const isServerless = !!process.env.VERCEL

const globalForPrisma = globalThis as unknown as {
    prisma_v8: PrismaClient | undefined
    pg_pool_v8: Pool | undefined
    pg_adapter_v8: PrismaPg | undefined
}

// Konfigurasi pool koneksi: Serverless Vercel membutuhkan ukuran pool sangat kecil (maksimal 2)
// untuk menghindari pool exhaustion karena banyaknya container asinkron yang terisolasi.
const parsedPoolSize = process.env.DATABASE_POOL_SIZE
    ? parseInt(process.env.DATABASE_POOL_SIZE, 10)
    : NaN;

const poolMax = (!isNaN(parsedPoolSize) && parsedPoolSize > 0)
    ? parsedPoolSize
    : (isDev ? 10 : (isServerless ? 2 : 5));

const idleTimeout = isServerless ? 10000 : 30000; // 10 detik di serverless agar cepat membebaskan koneksi
const connectionTimeout = 30000; // 30 detik untuk memberikan toleransi cold start Neon DB baik di local maupun serverless

const pool = globalForPrisma.pg_pool_v8 ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax,
    idleTimeoutMillis: idleTimeout,
    connectionTimeoutMillis: connectionTimeout,
    // Aktifkan SSL jika remote DB membutuhkannya (biasanya untuk Render/AWS/Neon dsb.)
    // ssl: { rejectUnauthorized: false }
})

if (isDev || isServerless) {
    globalForPrisma.pg_pool_v8 = pool
}

const adapter = globalForPrisma.pg_adapter_v8 ?? new PrismaPg(pool)

if (isDev || isServerless) {
    globalForPrisma.pg_adapter_v8 = adapter
}

const prismaClientSingleton = () => {
    return new PrismaClient({ 
        adapter,
        log: (isDev || isServerless) ? ['error', 'warn'] : ['error'],
    })
}

export const prisma = globalForPrisma.prisma_v8 ?? prismaClientSingleton()

if (isDev || isServerless) {
    globalForPrisma.prisma_v8 = prisma
}


