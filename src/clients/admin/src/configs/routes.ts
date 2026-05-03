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
  productEdit: (id: number | string) => `/products/${id}/edit`,
  productCategory: "/products/category",
  productCollections: "/products/collections",
  collectionNew: "/products/collections/new",
  collectionEdit: (id: number | string) => `/products/collections/${id}/edit`,
  productInventory: "/products/inventory",
  productPurchaseOrders: "/products/purchase-orders",

  // Content
  content: "/content",
  contentFiles: "/content/files",
  contentMenus: "/content/menus",
  contentBlogs: "/content/blogs",
  contentMetaobjects: "/content/metaobjects",
  contentBlogNew: "/content/blogs/new",
  contentBlogEdit: (id: number | string) => `/content/blogs/${id}/edit`,
  contentBlogCollections: "/content/blog-collections",
  contentBlogCollectionNew: "/content/blog-collections/new",
  contentBlogCollectionEdit: (id: number | string) => `/content/blog-collections/${id}/edit`,

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
  orderDetail: (id: number | string) => `/orders/${id}`,
  orderCreate: "/orders/new",
  settings: "/settings",

  // Legacy — kept to avoid breaking existing references
  categories: "/categories",
  contents: "/contents",
  inventory: "/inventory",
  promotions: "/promotions",
  reviews: "/reviews",
} as const;
