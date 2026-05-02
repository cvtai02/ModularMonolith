import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams } from "./path-type-helpers";

// -- API Types --
type InventoryPaths = paths; // do not export this

type InitializeProductInventoryOperation =
    InventoryPaths["/api/Inventory/products/{productId}/initialize"]["post"];

export type InitializeProductInventoryParams =
    PathParams<InitializeProductInventoryOperation>;
export type InitializeProductInventoryRequest =
    JsonRequestBody<InitializeProductInventoryOperation>;
// 200 OK
export type InitializeProductInventoryResponse =
    JsonResponse<InitializeProductInventoryOperation>;

export type ImportVariantInventoryRequest = {
    referenceId?: string | null;
    note?: string | null;
    rows: ImportVariantInventoryRowRequest[];
};

export type ImportVariantInventoryRowRequest = {
    variantId: number;
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
    variantId: number;
    status: string;
    message: string;
    previousQuantity: number;
    newQuantity: number;
};
