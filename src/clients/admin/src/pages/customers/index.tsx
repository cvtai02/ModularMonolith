import { AdminSectionHeader, BackendGapNotice, EndpointList } from "@/components/admin/admin-page";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Customers"
        description="Customer management now has a concrete page in the app shell. The generated admin API types currently do not include customer read or management endpoints."
      />
      <EndpointList
        title="Current API Coverage"
        description="No customer endpoints were found in the generated schema."
        items={[
          { method: "GET", path: "Not yet generated", note: "Add customer list, detail, and segmentation APIs before wiring TanStack Query here." },
        ]}
      />
      <BackendGapNotice
        title="Why this page stays informational"
        description="I avoided adding fake grids or mock customer data here so the UI remains honest about what the backend can support today."
      />
    </div>
  );
}
