import {
  AdminSectionHeader,
  BackendGapNotice,
  ContractCard,
  EndpointList,
} from "@/components/admin/admin-page";

export default function ContentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Contents"
        description="This page covers the content-related contracts already generated into `api-types.ts`: blog posts, menus, and meta objects. The route now exists in the router and navigation so content admins have a dedicated workspace."
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <ContractCard
          title="Blog Post"
          description="Create and update request shape from the generated API types."
          fields={[
            { name: "title", type: "string", required: true },
            { name: "content", type: "string", required: true },
            { name: "author", type: "string", required: true },
            { name: "status", type: "BlogPostStatus" },
          ]}
        />

        <ContractCard
          title="Menu"
          description="Menu request contracts available today."
          fields={[
            { name: "name", type: "string", required: true },
            { name: "handle", type: "string", required: true },
            { name: "items", type: "unknown[]" },
          ]}
        />

        <ContractCard
          title="Meta Object"
          description="Structured content metadata that can back storefront sections."
          fields={[
            { name: "key", type: "string", required: true },
            { name: "value", type: "string", required: true },
            { name: "type", type: "string", required: true },
          ]}
        />
      </section>

      <EndpointList
        title="Content Endpoints"
        description="All content routes surfaced from the generated OpenAPI types."
        items={[
          { method: "GET", path: "/api/Content/BlogPost", note: "List blog posts, but current schema omits the response payload type." },
          { method: "POST", path: "/api/Content/BlogPost", note: "Create a blog post from `CreateBlogPostRequest`." },
          { method: "PUT", path: "/api/Content/BlogPost/{title}", note: "Update a blog post by title." },
          { method: "GET", path: "/api/Content/Menu", note: "List menus, response typing still missing from OpenAPI output." },
          { method: "POST", path: "/api/Content/Menu", note: "Create a menu from `CreateMenuRequest`." },
          { method: "GET", path: "/api/Content/MetaObject", note: "List meta objects, response typing still missing from OpenAPI output." },
          { method: "POST", path: "/api/Content/MetaObject", note: "Create a meta object from `CreateMetaObjectRequest`." },
        ]}
      />

      <BackendGapNotice
        title="Why this page is contract-first"
        description="The content module already has useful request DTOs, but its read responses are not typed in the generated schema yet. This page makes the domain visible now and keeps the next API integration step obvious."
      />
    </div>
  );
}
