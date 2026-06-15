export interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    priceType?: string;
    currency?: string | null;
    interval: string;
    features: unknown;
    features_id?: unknown;
    addons?: unknown;
    addons_id?: unknown;
    image: string | null;
    slug?: string | null;
}

export type AddonType = { 
    id?: string;
    name: string; 
    name_id?: string | null;
    price: number; 
    currency?: string | null; 
    interval?: string 
};
