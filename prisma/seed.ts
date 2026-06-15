import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Clean up existing data (Transactional only)
    console.log('🧹 Cleaning up transactional data...');

    // Disconnect relations first to avoid Foreign Key constraints
    await prisma.project.updateMany({ data: { serviceId: null, estimateId: null } });
    await prisma.estimate.updateMany({ data: { serviceId: null } });

    // Delete transactional data
    await prisma.supportMessage.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.dailyLog.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.feedbackComment.deleteMany();
    await prisma.brief.deleteMany();
    await prisma.order.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.project.deleteMany();

    // NOT DELETING reference data: Services, SystemSettings, Coupons, MarketingBonuses

    // 2. Create Services (Idempotent)
    const services = [
        {
            title: 'Web Development Starter',
            title_id: 'Paket Pemula Web Development',
            slug: 'web-development-starter',
            description: 'Perfect for small businesses needing a professional online presence. Includes 5 pages, contact form, and mobile responsiveness.',
            description_id: 'Cocok untuk bisnis kecil yang membutuhkan kehadiran online profesional. Termasuk 5 halaman, formulir kontak, dan responsivitas seluler.',
            price: 1500,
            currency: 'USD',
            interval: 'one_time',
            features: ['5 Pages', 'Mobile Responsive', 'Contact Form', 'SEO Basic', '1 Month Support'],
            features_id: ['5 Halaman', 'Responsi Seluler', 'Formulir Kontak', 'SEO Dasar', 'Dukungan 1 Bulan'],
        },
        {
            title: 'E-Commerce Growth Plan',
            title_id: 'Paket Pertumbuhan E-Commerce',
            slug: 'e-commerce-growth-plan',
            description: 'Scale your online store with ongoing maintenance, priority support, and monthly performance optimizations.',
            description_id: 'Tingkatkan toko online Anda dengan pemeliharaan berkelanjutan, dukungan prioritas, dan optimasi performa bulanan.',
            price: 299,
            currency: 'USD',
            interval: 'monthly',
            features: ['Monthly Maintenance', 'Performance Tuning', 'Priority Support', 'Security Patches', 'Analytics Report'],
            features_id: ['Pemeliharaan Bulanan', 'Tuning Performa', 'Dukungan Prioritas', 'Patch Keamanan', 'Laporan Analitik'],
        },
        {
            title: 'Enterprise Support (Annual)',
            title_id: 'Dukungan Enterprise (Tahunan)',
            slug: 'enterprise-support-annual',
            description: 'Full-service dedicated support for large organizations needing guaranteed uptime and rapid response.',
            description_id: 'Dukungan penuh khusus untuk organisasi besar yang membutuhkan jaminan uptime dan respons cepat.',
            price: 50000000,
            currency: 'IDR',
            interval: 'yearly',
            features: ['24/7 Dedicated Support', 'Rapid Response Time', 'Server Monitoring', 'Legal Compliance', 'Quarterly Reviews'],
            features_id: ['Dukungan Khusus 24/7', 'Waktu Respons Cepat', 'Pemantauan Server', 'Kepatuhan Hukum', 'Tinjauan Kuartalan'],
        },
        {
            title: 'Custom Website Design',
            title_id: 'Desain Website Kustom',
            slug: 'custom-website-design',
            description: 'High-end custom website design tailored to your brand identity and business goals.',
            description_id: 'Desain website kustom kelas atas yang disesuaikan dengan identitas merek dan tujuan bisnis Anda.',
            price: 25000000,
            currency: 'IDR',
            interval: 'one_time',
            features: ['Custom UI/UX Design', 'High Performance', 'Interactive Elements', 'Brand Integration', 'Source Files Included'],
            features_id: ['Desain UI/UX Kustom', 'Performa Tinggi', 'Elemen Interaktif', 'Integrasi Merek', 'Termasuk File Sumber'],
        },
    ];

    for (const s of services) {
        const existing = await prisma.service.findFirst({ where: { title: s.title } });
        if (!existing) {
            const service = await prisma.service.create({
                data: s,
            });
            console.log(`Created service: ${service.title}`);
        } else {
            const service = await prisma.service.update({
                where: { id: existing.id },
                data: {
                    slug: s.slug,
                    title_id: s.title_id,
                    description_id: s.description_id,
                    features: s.features,
                    features_id: s.features_id,
                    price: s.price,
                    currency: s.currency,
                    interval: s.interval,
                }
            });
            console.log(`Updated service: ${service.title}`);
        }
    }

    // 3. Create Global Addons (Idempotent)
    console.log('🔌 Seeding global addons...');
    const globalAddons = [
        { name: 'Extra Page', name_id: 'Halaman Tambahan', price: 150, currency: 'USD', interval: 'one_time' },
        { name: 'Blog Setup', name_id: 'Setup Blog', price: 300, currency: 'USD', interval: 'one_time' },
        { name: 'WhatsApp Chat Widget', name_id: 'Widget Chat WhatsApp', price: 50, currency: 'USD', interval: 'one_time' },
        { name: 'Advanced Analytics', name_id: 'Analitik Lanjutan', price: 79, currency: 'USD', interval: 'monthly' },
        { name: 'Multi-language Support', name_id: 'Dukungan Multi-bahasa', price: 120, currency: 'USD', interval: 'one_time' },
        { name: 'Email Marketing Integration', name_id: 'Integrasi Email Marketing', price: 49, currency: 'USD', interval: 'monthly' },
        { name: 'Disaster Recovery', name_id: 'Pemulihan Bencana', price: 15000000, currency: 'IDR', interval: 'yearly' },
        { name: 'Penetration Testing', name_id: 'Pengujian Penetrasi', price: 10000000, currency: 'IDR', interval: 'yearly' },
        { name: 'Custom SLA Upgrade', name_id: 'Upgrade SLA Kustom', price: 20000000, currency: 'IDR', interval: 'yearly' },
        { name: 'Motion & Animation Pack', name_id: 'Paket Motion & Animasi', price: 5000000, currency: 'IDR', interval: 'one_time' },
        { name: 'CMS Integration', name_id: 'Integrasi CMS', price: 3500000, currency: 'IDR', interval: 'one_time' },
        { name: 'Logo & Branding Kit', name_id: 'Kit Logo & Branding', price: 7500000, currency: 'IDR', interval: 'one_time' }
    ];

    for (const addon of globalAddons) {
        const existing = await prisma.addon.findFirst({ where: { name: addon.name } });
        if (!existing) {
            await prisma.addon.create({ data: addon });
            console.log(`Created global addon: ${addon.name}`);
        } else {
            await prisma.addon.update({
                where: { id: existing.id },
                data: {
                    name_id: addon.name_id,
                    price: addon.price,
                    currency: addon.currency,
                    interval: addon.interval
                }
            });
            console.log(`Updated global addon: ${addon.name}`);
        }
    }








    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
// Force TS re-check
