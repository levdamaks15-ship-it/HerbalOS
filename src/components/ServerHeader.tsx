import React from "react";
import Link from "next/link";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getCurrentClientAction } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, LogOut, Home } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export async function ServerHeader({ slug }: { slug: string }) {
  const user = await getCurrentUserAction();
  const clientProfile = user ? await getCurrentClientAction() : null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-graphite/5 px-4 h-16 flex items-center justify-between gap-2">
      <Link href={`/${slug}`} className="hover:opacity-70 transition-opacity">
        <div className="text-xl sm:text-2xl font-black italic text-primary shrink-0">HOS</div>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {user ? (
          <>
            <div className="hidden xs:flex flex-col items-end mr-2 text-right">
              <span className="text-[9px] font-black text-primary uppercase">Вы вошли как</span>
              <span className="text-xs font-black text-graphite truncate max-w-[120px]">
                {clientProfile?.name || user.name || "Пользователь"}
              </span>
            </div>

            {clientProfile ? (
              <Button asChild className="rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase h-10 px-3 sm:px-5 shadow-lg shadow-primary/20">
                <Link href={`/${slug}/dashboard`}>Мой дневник</Link>
              </Button>
            ) : (
              <Button asChild className="rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase h-10 px-3 sm:px-5 shadow-lg shadow-primary/20">
                <Link href={`/${slug}/admin`}>Админ-панель</Link>
              </Button>
            )}

            <LogoutButton slug={slug} />
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase gap-2 bg-graphite/5 hover:bg-graphite/10 px-3 h-10">
              <Link href={`/${slug}/dashboard`}>
                <User size={16} className="text-primary shrink-0" />
                <span className="hidden xs:inline-block">Мой дневник</span>
              </Link>
            </Button>
            <Button asChild className="rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase h-10 px-3 sm:px-5 shadow-lg shadow-primary/20 flex items-center gap-2">
              <Link href={`/${slug}/admin`}>
                <LayoutDashboard size={16} className="shrink-0" />
                <span className="hidden xs:inline-block">Наставник</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
