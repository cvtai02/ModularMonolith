import { AdminSectionHeader, BackendGapNotice, EndpointList } from "@/components/admin/admin-page";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Settings"
        description="Settings is now a real route component in the admin shell. The current generated admin schema does not expose application settings endpoints yet."
      />
      <EndpointList
        title="Current API Coverage"
        description="No typed settings endpoints are available in the generated schema."
        items={[
          { method: "GET", path: "Not yet generated", note: "Application configuration, staff preferences, and branding settings APIs are still missing from OpenAPI output." },
        ]}
      />
      <BackendGapNotice
        title="Safe interim state"
        description="This keeps the admin navigation complete without inventing settings forms that cannot persist yet."
      />
    </div>
  );
}
