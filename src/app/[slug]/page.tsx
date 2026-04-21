"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EcosystemHub } from "@/components/EcosystemHub";
import { FloatingTelegram } from "@/components/FloatingTelegram";
import { ResultsShowcase } from "@/components/ResultsShowcase";

// Мы переходим на динамические данные из getPosts()
export default function ExpertPortalPage() {
  const { slug } = useParams();
  const expertName = "Эксперт Гербалайф";

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-graphite overflow-x-hidden font-outfit selection:bg-primary/20">
      <FloatingTelegram />
      {/* Search/Header Sticky Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-graphite/5 px-4 h-16 flex items-center justify-between gap-2">
         <Link href={`/${slug}`} className="hover:opacity-70 transition-opacity">
            <div className="text-xl sm:text-2xl font-black italic text-primary shrink-0">HOS</div>
         </Link>
         <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" className="rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase  gap-2 bg-graphite/5 hover:bg-graphite/10 px-3 h-10">
               <Link href={`/${slug}/dashboard`}>
                  <User size={16} className="text-primary shrink-0" /> 
                  <span className="hidden xs:inline-block">Партнер</span>
               </Link>
            </Button>
            <Button asChild className="rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase  h-10 px-3 sm:px-5 shadow-lg shadow-primary/20 flex items-center gap-2">
               <Link href={`/${slug}/admin`}>
                  <LayoutDashboard size={16} className="shrink-0" />
                  <span className="hidden xs:inline-block">Наставник</span>
               </Link>
            </Button>
         </div>
      </header>

      <main className="max-w-3xl mx-auto pb-12">
        {/* Profile Card / Bio */}
        <section className="p-6 pb-6">
           <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 text-center md:text-left">
              <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 rounded-[40px] bg-primary/10 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden"
                  >
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src="/assets/expert.png" alt="Expert" className="w-full h-full object-cover" />
                  </motion.div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={18} />
                 </div>
              </div>
              <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                    <h1 className="text-3xl md:text-4xl font-black leading-none">{expertName}</h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase  rounded-full w-fit mx-auto md:mx-0">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Наставник
                    </span>
                 </div>
                  <p className="text-sm font-bold text-graphite/30 uppercase tracking-normal mb-4">Эксперт по питанию и трансформации</p>
                  <p className="text-base leading-relaxed text-graphite/70 font-medium max-w-xl italic">
                     &ldquo;Ваше здоровье — это моя профессия. Основываясь на моем <b>30-летнем опыте</b>, мы не просто считаем калории, а строим фундамент для долгой и активной жизни.&rdquo;
                  </p>
               </div>
            </div>
         </section>

        {/* Unified Service Hub */}
        <div className="px-4 sm:px-0">
            <EcosystemHub slug={slug as string} />
         </div>

        {/* Interactive Results Showcase */}
        <ResultsShowcase slug={slug as string} />

        <footer className="mt-8 text-center border-t border-graphite/5 pt-8 px-6">
           <div className="text-primary text-2xl font-black italic  mb-4">Herbal OS</div>
           <p className="text-[10px] font-bold text-graphite/30 uppercase  mb-8">Professional Expert Portal • 2024</p>
        </footer>
      </main>
    </div>
  );
}
