import {
  AdminSectionHeader,
  BackendGapNotice,
  ContractCard,
  EndpointList,
} from "@/components/admin/admin-page";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Categories"
        description="Category management is now a real page instead of a placeholder. The generated API types expose the write contracts clearly, but the current OpenAPI output does not include typed response bodies for category list/detail reads."
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <ContractCard
          title="CreateCategoryRequest"
          description="Fields extracted from the generated schema."
          fields={[
            { name: "name", type: "string", required: true },
            { name: "description", type: "string" },
            { name: "imageUrl", type: "string" },
            { name: "status", type: "CategoryStatus" },
            { name: "parentName", type: "string | null" },
            { name: "slug", type: "string" },
          ]}
        />

        <ContractCard
          title="UpdateCategoryRequest"
          description="Update shape currently available for form wiring."
          fields={[
            { name: "description", type: "string" },
            { name: "imageUrl", type: "string" },
            { name: "status", type: "CategoryStatus" },
            { name: "parentName", type: "string | null" },
            { name: "slug", type: "string" },
          ]}
        />
      </section>

      <EndpointList
        title="Available Endpoints"
        description="These routes are present in the schema and are ready to be wired once response typing is corrected."
        items={[
          { method: "GET", path: "/api/ProductCatalog/categories", note: "List categories, but generated response body is missing." },
          { method: "GET", path: "/api/ProductCatalog/categories/{name}", note: "Fetch one category by name, response body currently omitted in OpenAPI output." },
          { method: "PUT", path: "/api/ProductCatalog/categories/{name}", note: "Update an existing category using `UpdateCategoryRequest`." },
          { method: "DELETE", path: "/api/ProductCatalog/categories/{name}", note: "Remove an existing category." },
          { method: "POST", path: "/api/ProductCatalog/categories/add", note: "Create a category using `CreateCategoryRequest`." },
        ]}
      />

      <BackendGapNotice
        title="OpenAPI follow-up needed"
        description="Once the category endpoints return typed response content in the generated spec, we can switch this page from contract-driven to fully query-backed with tables and edit flows."
      />
    </div>
  );
}
