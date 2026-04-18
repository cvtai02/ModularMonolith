import { AdminSectionHeader, BackendGapNotice, EndpointList } from "@/components/admin/admin-page";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Orders"
        description="Order operations now have a dedicated route page. The current generated OpenAPI types do not expose an orders module yet, so this section documents the gap instead of pretending the backend exists."
      />
      <EndpointList
        title="Current API Coverage"
        description="No order endpoints were found in the generated admin schema."
        items={[
          { method: "GET", path: "Not yet generated", note: "Add order list and detail endpoints to the OpenAPI document to make this page query-backed." },
        ]}
      />
      <BackendGapNotice
        title="Recommended backend addition"
        description="Expose order list, detail, and fulfillment update endpoints in the backend, regenerate `api-types.ts`, and this page can become a live operations queue quickly."
      />
    </div>
  );
}
