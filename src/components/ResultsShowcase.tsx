"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Scale, 
  Timer, 
  Ruler, 
  Trophy,
  History
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultCase {
  id: string;
  name: string;
  loss: string;
  duration: string;
  waist?: string;
  quote: string;
  imageBefore: string;
  imageAfter: string;
}

const TEST_CASES: ResultCase[] = [
  {
    id: "1",
    name: "Мария С.",
    loss: "-16кг",
    duration: "3 месяца",
    waist: "-18см",
    quote: "Результаты превзошли все мои ожидания. Невероятная легкость и энергия каждый день!",
    imageBefore: "/assets/transformation.png", // Заглушка
    imageAfter: "/assets/transformation.png",  // Заглушка
  },
  {
    id: "2",
    name: "Дмитрий В.",
    loss: "-22кг",
    duration: "5 месяцев",
    waist: "-24см",
    quote: "Я вернулся в ту форму, которая была у меня в 20 лет. Система наставника работает на 100%.",
    imageBefore: "/assets/transformation.png",
    imageAfter: "/assets/transformation.png",
  },
  {
    id: "3",
    name: "Елена К.",
    loss: "-12кг",
    duration: "2 месяца",
    waist: "-12см",
    quote: "Никаких жестких диет, только правильный подход и поддержка. Жизнь заиграла новыми красками.",
    imageBefore: "/assets/transformation.png",
    imageAfter: "/assets/transformation.png",
  }
];

const CaseCard = ({ item, slug }: { item: ResultCase; slug: string }) => {
  const [showAfter, setShowAfter] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-[260px] shrink-0 bg-white/3 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative snap-center"
    >
      {/* Image Section */}
      <div className="relative h-[260px] cursor-pointer overflow-hidden" onClick={() => setShowAfter(!showAfter)}>
        <AnimatePresence mode="wait">
          <motion.img
            key={showAfter ? "after" : "before"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={showAfter ? item.imageAfter : item.imageBefore}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            alt={item.name}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-linear-to-t from-[#121418] via-transparent to-transparent z-10" />
        
        {/* Compact Toggle */}
        <div className="absolute top-4 left-4 z-20 flex bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10">
           <div className={cn(
             "px-3 py-1 rounded-full text-[9px] font-black uppercase  transition-all",
             !showAfter ? "bg-white text-black" : "text-white/40"
           )}>До</div>
           <div className={cn(
             "px-3 py-1 rounded-full text-[9px] font-black uppercase  transition-all",
             showAfter ? "bg-primary text-white" : "text-white/40"
           )}>После</div>
        </div>

        {/* Small Result Badge */}
        <div className="absolute bottom-4 right-4 z-20">
           <div className="bg-primary/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
              <span className="text-xs font-black ">{item.loss}</span>
           </div>
        </div>

        {/* Name & Quick Stats */}
        <div className="absolute inset-x-0 bottom-0 p-5 z-20">
           <h4 className="text-lg font-bold text-white mb-1">{item.name}</h4>
           <div className="flex gap-3">
              <div className="flex items-center gap-1 text-white/50 text-[9px] font-bold uppercase tracking-wider">
                 <Timer size={10} className="text-primary" /> {item.duration}
              </div>
              {item.waist && (
                <div className="flex items-center gap-1 text-white/50 text-[9px] font-bold uppercase tracking-wider">
                   <Ruler size={10} className="text-primary" /> {item.waist}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Quote & Action */}
      <div className="p-5 space-y-4">
         <p className="text-[11px] font-medium text-white/50 italic leading-relaxed line-clamp-2">
            &ldquo;{item.quote}&rdquo;
         </p>
         
         <Button asChild variant="ghost" className="w-full h-10 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/5 text-primary font-black text-[10px] uppercase  transition-all">
            <Link href={`/${slug}/quiz?ref=${item.id}`}>
               Хочу так же <ArrowRight size={14} className="ml-1" />
            </Link>
         </Button>
      </div>
    </motion.div>
  );
};

export function ResultsShowcase({ slug }: { slug: string }) {
  return (
    <section className="mt-4 bg-[#121418] text-white py-10 px-6 rounded-[40px] mx-4 sm:mx-6 shadow-3xl relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md mb-12 relative z-10">
        <h2 className="inline-flex items-center gap-2 text-[10px] font-black uppercase  text-primary mb-4">
          <History size={14} /> Истории успеха
        </h2>
        <h3 className="text-3xl sm:text-4xl font-black leading-tight">
          Результаты <br /> <span className="text-primary">марафонцев</span>
        </h3>
        <p className="text-sm text-white/40 mt-4 font-medium leading-relaxed">
          Реальные трансформации людей, которые доверились системе и получили новую версию себя.
        </p>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-6 pt-2 px-6 snap-x snap-mandatory relative z-10 -mx-6 touch-pan-x select-none">
        {TEST_CASES.map((item) => (
          <div key={item.id} className="snap-start shrink-0">
            <CaseCard item={item} slug={slug} />
          </div>
        ))}
        
        {/* Final "Your story here" card */}
        <div className="shrink-0 snap-start">
          <div className="w-[260px] h-full min-h-[380px] rounded-[32px] bg-primary/3 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-6 text-center gap-4">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Trophy size={32} />
             </div>
             <div>
                <h4 className="text-lg font-bold mb-1">Ваш результат</h4>
                <p className="text-[11px] text-white/40 font-medium leading-relaxed">Готовы начать трансформацию?</p>
             </div>
             <Button asChild variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-white font-bold h-10 px-6 text-[10px]">
                <Link href={`/${slug}/quiz`}>
                   Начать
                </Link>
             </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8 text-white/20 text-[10px] font-black uppercase ">
         <span>350+ успешных кейсов</span>
         <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Stats
         </span>
      </div>
    </section>
  );
}
