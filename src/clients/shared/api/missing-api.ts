// This file is auto update by Claude
// Define Missing API when develop UI without backend ready.
// Remove definitions here when backend API is ready and type can be imported from api-types.ts

// Content Module - Menus (response schema not emitted to OpenAPI)
export interface MenuResponse {
    name: string;
    description?: string;
    url: string;
    parentName?: string | null;
    submenuNames?: string[];
}
