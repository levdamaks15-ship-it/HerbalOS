import React from "react";
import { ServerHeader } from "@/components/ServerHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExpertLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Серверная шапка - всегда знает статус авторизации */}
      <ServerHeader slug={slug} />
      <main>
        {children}
      </main>
    </div>
  );
}
