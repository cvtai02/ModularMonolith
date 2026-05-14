import type { Metadata } from "next";
import { Be_Vietnam_Pro, Great_Vibes, Lora } from "next/font/google";
import "./globals.css";

import { ApiClientProvider } from "./components/api-client-provider";
import { NavigationProgress } from "./components/navigation-progress";
import { LandingSidebar } from "./components/landing-sidebar";
import { SidebarGuard } from "./components/sidebar-guard";
import { ProductCatalogClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "vietnamese"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nekomin — Sống chậm, sống đẹp",
  description: "Phụ kiện, detox & decor được chọn lọc cho lối sống có chủ ý.",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalogClient = new ProductCatalogClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
  const [categoriesRes, collectionsRes] = await Promise.all([
    catalogClient.listCustomerCategory({ pageSize: 50 }).catch(() => null),
    catalogClient.listCustomerCollection({ pageSize: 50 }).catch(() => null),
  ]);
  const categories = categoriesRes?.items ?? [];
  const collections = collectionsRes?.items ?? [];

  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${lora.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavigationProgress />
        <SidebarGuard>
          <LandingSidebar categories={categories} collections={collections} />
        </SidebarGuard>
        <ApiClientProvider>
{children}
        </ApiClientProvider>
      </body>
    </html>
  );
}
