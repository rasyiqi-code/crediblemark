
import { z } from "zod";
export interface TeamMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    applicationStatus?: string;
}

export interface ProjectFile {
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
}

export interface ProjectBrief {
    id: string;
    content: string;
    createdAt: Date;
}

export interface FeedbackComment {
    id: string;
    content: string;
    role: string;
    createdAt: Date;
    imageUrl?: string | null;
}

export interface FeedbackItem {
    id: string;
    content: string;
    type: string;
    imageUrl?: string | null;
    status: string;
    createdAt: Date;
    comments: FeedbackComment[];
}

export interface DailyLog {
    id: string;
    content: string;
    mood: string;
    images?: string[];
    projectId?: string;
    createdAt: Date;
}

// Zod Schemas for JSON fields
export const ScreenItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    hours: z.number().min(0),
});

export const ApiItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    hours: z.number().min(0),
});

export const EstimateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    summary: z.string(),
    screens: z.array(ScreenItemSchema),
    apis: z.array(ApiItemSchema),
    totalHours: z.number(),
    totalCost: z.number(),
    complexity: z.string(),
});

// TypeScript Interfaces inferred from Zod
export type ScreenItem = z.infer<typeof ScreenItemSchema>;
export type ApiItem = z.infer<typeof ApiItemSchema>;
export type EstimateData = z.infer<typeof EstimateSchema>;

// Basic shared types
export interface Bonus {
    id?: string;
    title: string;
    description?: string | null;
    value?: string | null;
    icon?: string | null;
    isActive?: boolean;
    appliesTo?: string[];
}

export interface Coupon {
    id?: string;
    code: string;
    discountType: 'percentage' | 'fixed' | string;
    discountValue: number;
    isActive?: boolean;
    appliesTo?: string[];
}

export interface ServiceAddon {
    id?: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    interval?: string;
}

export interface InvoiceItem {
    title: string;
    description: string;
    hours: number;
}

// Extended Interface for Prisma Result (including sub-items)
// Note: Prisma returns 'JsonValue' for Json fields, so we need to cast them in UI components
export interface ExtendedEstimate {
    id: string;
    title: string;
    summary: string;
    screens: ScreenItem[];
    apis: ApiItem[];
    totalHours: number;
    totalCost: number;
    complexity: string;
    status: string;
    createdAt: Date;
    serviceId?: string | null;
    service?: {
        title: string;
        slug?: string | null;
        description: string;
        price: number;
        currency?: string | null;
        features: unknown;
        features_id?: unknown;
        image: string | null;
        interval: string;
        priceType: string;
        addons?: unknown;
        addons_id?: unknown;
    } | null;
    project?: {
        id: string;
        title: string;
        status: string;
    } | null;
}

export interface ExtendedProject {
    id: string;
    title: string;
    clientName: string | null;
    invoiceId: string | null;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    serviceId: string | null;
    estimateId: string | null;
    repoOwner: string | null;
    repoName: string | null;
    deployUrl: string | null;
    service: {
        title: string;
        description: string;
        price: number;
        currency?: string | null;
        features: unknown;
        features_id?: unknown;
        image: string | null;
        interval: string;
        addons?: unknown;
        addons_id?: unknown;
    } | null;
    briefs: ProjectBrief[];
    feedback: FeedbackItem[];
    dailyLogs: DailyLog[];
    repoUrl: string | null;
    spec?: string | null;
    previewUrl?: string | null;
    developerId?: string | null;
    files?: ProjectFile[];
    subscriptionEndsAt?: Date | null;
    subscriptionStatus?: string | null;
    estimate?: ExtendedEstimate | null;
    bounty?: number | null;
    paymentStatus?: string | null;
    paidAmount?: number | null;
    totalAmount?: number | null;
}

export interface StackUser {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    profileImageUrl?: string | null;
    signedUpAt?: number | string | Date;
    createdAt?: number | string | Date;
    lastActiveAt?: number | string | Date;
}
