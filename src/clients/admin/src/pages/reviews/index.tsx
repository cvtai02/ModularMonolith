import { AdminSectionHeader, BackendGapNotice, EndpointList } from "@/components/admin/admin-page";

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Reviews"
        description="Reviews moderation now has a route-backed page. The generated API schema does not currently include review endpoints, so this section stays focused on integration readiness."
      />
      <EndpointList
        title="Current API Coverage"
        description="No review moderation endpoints were found in the generated schema."
        items={[
          { method: "GET", path: "Not yet generated", note: "Add review list, approval, and response APIs to support a real moderation workflow." },
        ]}
      />
      <BackendGapNotice
        title="Why this matters"
        description="Keeping the page in place now helps the navigation stay complete, while making the missing backend contract explicit for the next implementation pass."
      />
    </div>
  );
}
