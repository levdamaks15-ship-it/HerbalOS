"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Скрываем общую шапку на страницах админки и логина
  if (pathname.endsWith("/admin") || pathname.endsWith("/login")) {
    return null;
  }
  
  return <>{children}</>;
}
