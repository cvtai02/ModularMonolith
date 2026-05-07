import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";

import { ApiClientProvider } from "./components/api-client-provider";

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
          {children}
        </ApiClientProvider>
      </body>
    </html>
  );
}
