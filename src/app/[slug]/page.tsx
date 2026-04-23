"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles
} from "lucide-react";
import { useParams } from "next/navigation";
import { EcosystemHub } from "@/components/EcosystemHub";
import { FloatingTelegram } from "@/components/FloatingTelegram";
import { ResultsShowcase } from "@/components/ResultsShowcase";
import { useAuth } from "@/components/AuthProvider";
import { getExpertAction, DB_Expert } from "@/lib/actions/experts";
import { storageService } from "@/lib/appwrite/services/storage";
import Image from "next/image";

import { ClientAchievementsWidget } from "@/components/ClientAchievementsWidget";

export default function ExpertPortalPage() {
  const { slug } = useParams();
  const { logout, user, clientProfile, isLoading } = useAuth();
  const [expert, setExpert] = React.useState<DB_Expert | null>(null);

  React.useEffect(() => {
    getExpertAction(slug as string).then(setExpert);
  }, [slug]);

  const expertName = expert?.name || "Эксперт Гербалайф";
  const expertDescription = expert?.description || "Ваше здоровье — это моя профессия. Основываясь на моем 30-летнем опыте, мы не просто считаем калории, а строим фундамент для долгой и активной жизни.";
  const expertPhoto = expert?.photo ? (expert.photo.startsWith("http") ? expert.photo : storageService.getFilePreview(expert.photo)) : "/assets/expert.png";

  const isExpert = user && !clientProfile;
  const isClient = user && clientProfile;

  return (
    <div className="min-h-screen text-graphite overflow-x-hidden font-outfit selection:bg-primary/20">
      <FloatingTelegram />
      {/* Шапка теперь в layout.tsx */}

      <main className="max-w-3xl mx-auto pb-12 pt-6">
        {/* Profile Card / Bio - Скрываем для эксперта */}
        {!isExpert && !isLoading && (
          <section className="p-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 text-center md:text-left">
                <div className="relative">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-32 h-32 rounded-[40px] bg-primary/10 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden relative"
                    >
                       <Image 
                         src={expertPhoto} 
                         alt={expertName} 
                         fill
                         className="object-cover" 
                         unoptimized
                       />
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
                       &ldquo;{expertDescription}&rdquo;
                    </p>
                 </div>
              </div>
           </section>
        )}

        {/* Client Achievements Widget */}
        {isClient && clientProfile && !isLoading && (
          <ClientAchievementsWidget client={clientProfile} slug={slug as string} />
        )}

        {/* Unified Service Hub */}
        <div className="px-4 sm:px-0">
            <EcosystemHub slug={slug as string} />
         </div>

        {/* Interactive Results Showcase - Скрываем для клиентов (они видят свои результаты) */}
        {!isClient && !isLoading && (
          <ResultsShowcase slug={slug as string} />
        )}

        <footer className="mt-8 text-center border-t border-graphite/5 pt-8 px-6">
           <div className="text-primary text-2xl font-black italic  mb-4 cursor-pointer" onClick={() => logout()}>Herbal OS</div>
           <p className="text-[10px] font-bold text-graphite/30 uppercase  mb-8">Professional Expert Portal • 2026</p>
        </footer>
      </main>
    </div>
  );
}
