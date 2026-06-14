/**
 * Shared Payment & Order Types
 * Replaces `any` types across the codebase with proper TypeScript definitions
 */

import type { Prisma } from "@prisma/client";

// ============================================
// Payment Metadata Types
// ============================================

/**
 * Midtrans payment metadata structure
 */
export interface MidtransPaymentMetadata {
    transaction_id?: string;
    transaction_status?: string;
    payment_type?: string;
    bank?: string;
    va_number?: string;
    gross_amount?: string;
    order_id?: string;
    fraud_status?: string;
    status_code?: string;
    signature_key?: string;
    [key: string]: Prisma.JsonValue | undefined;
}

/**
 * Combined payment metadata (can be either Midtrans or other format)
 */
export type PaymentMetadata = MidtransPaymentMetadata | Prisma.JsonValue;

// ============================================
// Bank Details Types
// ============================================

export interface BankDetails {
    bank_name?: string;
    bank_account?: string;
    bank_holder?: string;
}

// ============================================
// Attachment Types
// ============================================

export interface MessageAttachment {
    name: string;
    url: string;
    type: string;
    size?: number;
}

// ============================================
// Exchange Rates Types
// ============================================

export interface ExchangeRates {
    base: string;
    rates: {
        IDR: number;
        [key: string]: number | undefined;
    };
    lastUpdated: number;
}

// ============================================
// Midtrans Window Type
// ============================================

declare global {
    interface Window {
        snap: {
            pay(
                token: string,
                options?: {
                    onSuccess?: (result: MidtransPaymentResult) => void;
                    onPending?: (result: MidtransPaymentResult) => void;
                    onError?: (result: MidtransPaymentResult) => void;
                    onClose?: () => void;
                }
            ): void;
            embed(
                token: string,
                options: {
                    embedId: string;
                    onSuccess?: (result: MidtransPaymentResult) => void;
                    onPending?: (result: MidtransPaymentResult) => void;
                    onError?: (result: MidtransPaymentResult) => void;
                    onClose?: () => void;
                }
            ): void;
            hide(): void;
        };
    }
}

export interface MidtransPaymentResult {
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_status: string;
    fraud_status?: string;
    status_code: string;
    status_message: string;
}

// ============================================
// Payment Method Types
// ============================================

export interface PaymentMethod {
    id: string;
    name: string;
    type: "bank_transfer" | "credit_card" | "ewallet";
    icon?: string;
    enabled?: boolean;
}

// ============================================
// Midtrans Charge Parameter
// ============================================

export interface MidtransChargeParameter {
    payment_type: string;
    transaction_details: {
        order_id: string;
        gross_amount: number;
    };
    customer_details?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        billing_address?: Record<string, string>;
        shipping_address?: Record<string, string>;
    };
    item_details?: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
        merchant_name?: string;
    }>;
    // Payment type specific options
    qris?: { acquirer?: string };
    shopeepay?: { callback_url?: string };
    bank_transfer?: { bank: string; va_number?: string };
    echannel?: { bill_info1?: string; bill_info2?: string };
    cstore?: { store: string; message?: string };
    gopay?: Record<string, unknown>;
}

// ============================================
// Order with Relations Type
// ============================================

export interface OrderWithProject {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    snapToken?: string | null;
    transactionId?: string | null;
    paymentType?: string | null;
    paymentMetadata: PaymentMetadata;
    userId: string;
    projectId?: string | null;
    project?: {
        id: string;
        title: string;
        clientName: string;
        service?: {
            id: string;
            title: string;
        } | null;
    } | null;
}

// ============================================
// Midtrans Payment Data (API Response)
// ============================================

/**
 * Midtrans payment response data - returned from /api/payment/midtrans/charge
 */
export interface MidtransPaymentData {
    payment_type: string;
    transaction_status: string;
    status_code: string;
    order_id?: string;
    gross_amount?: string;
    // Virtual Account
    va_numbers?: Array<{
        bank: string;
        va_number: string;
    }>;
    permata_va_number?: string;
    // Mandiri Bill
    biller_code?: string;
    bill_key?: string;
    // QRIS/GoPay
    actions?: Array<{
        name: string;
        method: string;
        url: string;
    }>;
    // CStore
    store?: string;
    payment_code?: string;
}

/**
 * Selected payment method from PaymentSelector
 */
export interface SelectedPaymentMethod {
    id: string;
    type: string;
    bank?: string;
    label?: string;
}

// ============================================
// System Integration Types (for OAuth providers)
// ============================================

/**
 * SystemIntegration model - represents OAuth integrations like GitHub/Vercel
 */
export interface SystemIntegration {
    id: string;
    provider: 'github' | 'vercel' | string;
    accessToken: string;
    refreshToken?: string | null;
    accountName?: string | null;
    accountId?: string | null;
    isActive: boolean;
    metadata?: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Type for accessing SystemIntegration model on PrismaClient
 * Use: (prisma as PrismaWithIntegration).systemIntegration
 */
export interface PrismaWithIntegration {
    systemIntegration: {
        findMany(): Promise<SystemIntegration[]>;
        findUnique(args: { where: { provider: string; isActive?: boolean } }): Promise<SystemIntegration | null>;
        upsert(args: {
            where: { provider: string };
            update: Partial<SystemIntegration>;
            create: Omit<SystemIntegration, 'id' | 'createdAt' | 'updatedAt'>;
        }): Promise<SystemIntegration>;
        deleteMany(args: { where: { provider: string } }): Promise<{ count: number }>;
    };
}


// ============================================
// Invoice Order Types
// ============================================

/**
 * Order with full project includes for invoice pages
 */
export interface InvoiceOrder {
    id: string;
    amount: number;
    status: string;
    type: string; // Added type field from Prisma
    userId: string | null;
    projectId: string | null;
    snapToken: string | null;
    transactionId: string | null;
    paymentType: string | null;
    currency: string;
    exchangeRate: number;
    paymentMetadata: MidtransPaymentData | null;
    createdAt: Date;
    updatedAt: Date;
    project: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        userId: string;
        clientName: string | null;
        files: unknown;
        createdAt: Date;
        updatedAt: Date;
        service: {
            id: string;
            title: string;
            description?: string | null;
            price: number;
            currency: string;
        } | null;
        estimate: {
            id: string;
            screens: unknown;
            apis: unknown;
            service: unknown;
        } | null;
    } | null;
}

// ============================================
// Enriched Project Types
// ============================================

/**
 * Project from Prisma with optional clientName enrichment
 */
export interface EnrichedProjectInput {
    id: string;
    title: string;
    status: string;
    userId: string;
    clientName: string | null;
    description?: string | null;
    service?: { id: string; title: string } | null;
    createdAt: Date;
    updatedAt: Date;
}
