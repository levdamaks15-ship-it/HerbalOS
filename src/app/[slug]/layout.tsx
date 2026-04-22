import React from "react";
import { ServerHeader } from "@/components/ServerHeader";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getCurrentClientAction } from "@/lib/actions/clients";

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
  
  // Получаем данные прямо здесь, в корне
  const user = await getCurrentUserAction();
  const clientProfile = user ? await getCurrentClientAction() : null;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Передаем данные напрямую, чтобы шапка не гадала */}
      <HeaderWrapper>
        <ServerHeader slug={slug} initialUser={user} initialProfile={clientProfile} />
      </HeaderWrapper>
      <main>
        {children}
      </main>
    </div>
  );
}
