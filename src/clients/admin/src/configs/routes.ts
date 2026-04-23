// Absolute routes — single source of truth for all navigation in the admin client.
export const ROUTES = {
  root: "/",
  notAuthorized: "/403",
  signin: "/signin",
  signup: "/signup",
  dashboard: "/dashboard",

  // Products
  products: "/products",
  productNew: "/products/new",
  productDetail: (id: number | string) => `/products/${id}`,
  productCategory: "/products/category",
  productCollections: "/products/collections",
  productInventory: "/products/inventory",
  productPurchaseOrders: "/products/purchase-orders",

  // Content
  content: "/content",
  contentFiles: "/content/files",
  contentMenus: "/content/menus",
  contentBlogs: "/content/blogs",
  contentMetaobjects: "/content/metaobjects",

  // Customers
  customers: "/customers",

  // Marketing
  marketing: "/marketing",
  marketingCampaigns: "/marketing/campaigns",
  marketingAttribution: "/marketing/attribution",
  marketingAutomation: "/marketing/automation",

  // Promotion
  promotion: "/promotion",

  // Analytics
  analytics: "/analytics",
  analyticsReports: "/analytics/reports",
  analyticsLive: "/analytics/live",

  // Orders & Settings
  orders: "/orders",
  settings: "/settings",

  // Legacy — kept to avoid breaking existing references
  categories: "/categories",
  contents: "/contents",
  inventory: "/inventory",
  promotions: "/promotions",
  reviews: "/reviews",
} as const;
