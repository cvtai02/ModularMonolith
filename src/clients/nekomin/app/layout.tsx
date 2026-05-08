import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";

import { ApiClientProvider } from "./components/api-client-provider";
import { NotificationCenter } from "./components/notification-center";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "vietnamese"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Nekomin — Sống chậm, sống đẹp",
  description: "Phụ kiện, detox & decor được chọn lọc cho lối sống có chủ ý.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApiClientProvider>
          <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
              <a href="/" className="font-serif text-lg font-medium tracking-tight">Nekomin</a>
              <NotificationCenter />
            </div>
          </header>
          {children}
        </ApiClientProvider>
      </body>
    </html>
  );
}
