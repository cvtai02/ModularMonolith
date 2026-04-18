import { AdminSectionHeader, BackendGapNotice, EndpointList } from "@/components/admin/admin-page";

export default function PromotionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Promotions"
        description="Promotions now render through a dedicated page component. No promotion-related endpoints are currently present in the generated admin API types."
      />
      <EndpointList
        title="Current API Coverage"
        description="This module needs backend API exposure before frontend query integration."
        items={[
          { method: "GET", path: "Not yet generated", note: "Discount rules, campaigns, and coupon endpoints are missing from the current OpenAPI schema." },
        ]}
      />
      <BackendGapNotice
        title="Good next slice"
        description="Once discount and campaign APIs are added, this page can grow into campaign cards, redemption metrics, and code management flows."
      />
    </div>
  );
}
