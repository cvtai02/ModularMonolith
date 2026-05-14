"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SidebarGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (/^\/blog\/.+/.test(pathname)) return null;
  return <>{children}</>;
}
