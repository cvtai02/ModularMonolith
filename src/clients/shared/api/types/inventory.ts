export type InitializeProductInventoryParams = {
    productId: string;
};

export type DeleteProductInventoryResponse = void;

export type InitializeProductInventoryRequest = {
    trackInventory?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    variants?: VariantInventoryConfig[];
};

export type VariantInventoryConfig = {
    variantId: string;
    useProductInventory?: boolean;
    trackInventory?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    quantity?: number;
};

export type InitializeProductInventoryResponse = {
    productId: string;
    trackInventory: boolean;
    allowBackorder: boolean;
    lowStockThreshold: number;
    variants: VariantInventoryResponse[];
};

export type VariantInventoryResponse = {
    variantId: string;
    useProductInventory: boolean;
    trackInventory: boolean;
    allowBackorder: boolean;
    lowStockThreshold: number;
    quantity: number;
    reserved: number;
    available: number;
};

export type ImportVariantInventoryRequest = {
    referenceId?: string | null;
    note?: string | null;
    rows: ImportVariantInventoryRowRequest[];
};

export type ImportVariantInventoryRowRequest = {
    variantId: string;
    quantity: number;
};

export type ImportVariantInventoryResponse = {
    totalCount: number;
    appliedCount: number;
    skippedCount: number;
    failedCount: number;
    rows: ImportVariantInventoryRowResponse[];
};

export type ImportVariantInventoryRowResponse = {
    variantId: string;
    status: string;
    message: string;
    previousQuantity: number;
    newQuantity: number;
};
