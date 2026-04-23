"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  TrendingDown, 
  Target,
  ArrowLeft,
  Droplets,
  Leaf,
  Flame,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { DB_Post } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";
import { storageService } from "@/lib/appwrite/services/storage";

interface SuccessStoryModalProps {
  post: DB_Post | null;
  isOpen: boolean;
  onClose: () => void;
  expertSlug: string;
}

const PRODUCT_DATA: Record<string, { icon: React.ReactNode, color: string, image?: string }> = {
  "Коктейль Ф1": { 
     icon: <Droplets className="text-primary" />,
     color: "bg-primary/10",
     image: "/assets/product_formula1.png"
  },
  "Алоэ": { 
     icon: <Droplets className="text-blue-500" />,
     color: "bg-blue-50"
  },
  "Травяной напиток": { 
     icon: <Flame className="text-orange-500" />,
     color: "bg-orange-50"
  },
  "Овсяно-яблочный напиток": { 
     icon: <Leaf className="text-green-600" />,
     color: "bg-green-50"
  }
};

export function SuccessStoryModal({ post, isOpen, onClose, expertSlug }: SuccessStoryModalProps) {
  if (!post) return null;

  const getImageUrl = (id: string | undefined) => {
    if (!id) return undefined;
    if (id.startsWith("http") || id.startsWith("/")) return id;
    try {
      return storageService.getFilePreview(id);
    } catch (e) {
      return "/assets/placeholder.png";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-graphite/40 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            className="relative w-full max-w-4xl h-full sm:h-[90vh] bg-[#FDFCFB] sm:rounded-[48px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-0 inset-x-0 z-30 p-6 flex justify-between items-center pointer-events-none">
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-all"
                >
                   <ArrowLeft size={24} />
                </button>
                <div className="bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 pointer-events-auto">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">История успеха</span>
                </div>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-all font-black"
                >
                   <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
               {/* Hero Section: Comparison */}
               <div className="relative aspect-square sm:aspect-video w-full bg-graphite">
                  {post.imageBefore === post.imageAfter ? (
                     <div className="relative h-full w-full overflow-hidden group bg-linear-to-br from-primary/20 via-primary/5 to-white flex items-center justify-center">
                        {getImageUrl(post.imageAfter) ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={getImageUrl(post.imageAfter)!} alt="Transformation" className="w-full h-full object-cover transform transition-transform duration-[2s] group-hover:scale-105" />
                        ) : (
                           <Sparkles size={64} className="text-primary opacity-20" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-graphite via-transparent to-graphite/20 opacity-60" />
                     </div>
                  ) : (
                     <div className="absolute inset-0 grid grid-cols-2 gap-px bg-white/5">
                        <div className="relative overflow-hidden group">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={getImageUrl(post.imageBefore) || "/assets/placeholder.png"} alt="Before" className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-105" />
                           <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col items-center gap-4">
                              <div className="w-px h-24 bg-linear-to-b from-transparent via-white/50 to-transparent" />
                              <div className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-2xl text-[12px] font-black uppercase border border-white/10 tracking-widest">До</div>
                              <div className="w-px h-24 bg-linear-to-b from-transparent via-white/50 to-transparent" />
                           </div>
                        </div>
                        <div className="relative overflow-hidden group">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={getImageUrl(post.imageAfter)} alt="After" className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-105" />
                           <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center gap-4">
                              <div className="w-px h-24 bg-linear-to-b from-transparent via-primary/50 to-transparent" />
                              <div className="bg-primary text-white px-6 py-2 rounded-2xl text-[12px] font-black uppercase shadow-xl tracking-widest">После</div>
                              <div className="w-px h-24 bg-linear-to-b from-transparent via-primary/50 to-transparent" />
                           </div>
                        </div>
                     </div>
                  )}
                  
                  {/* Hero Content Overlay */}
                  <div className="absolute bottom-12 inset-x-8 sm:inset-x-16 space-y-4 z-20">
                     <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[0.9] italic max-w-2xl text-shadow-lg">{post.title}</h2>
                  </div>
               </div>

               <div className="p-8 sm:p-16 space-y-16">
                  {/* Stats Grid - Only for Result posts */}
                  {post.type === "result" && (
                    <div className="grid grid-cols-2 gap-6 sm:gap-12">
                       <div className="glass-card p-8 rounded-[40px] border-none shadow-sm relative overflow-hidden group">
                          <div className="relative z-10 space-y-2">
                             <div className="flex items-center gap-2 text-primary">
                                <TrendingDown size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Сброс веса</span>
                             </div>
                             <div className="text-5xl font-black italic tracking-tighter text-graphite group-hover:scale-110 transition-transform origin-left">{post.stats_weight}</div>
                          </div>
                          <TrendingDown className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5 -rotate-12" />
                       </div>
                       <div className="glass-card p-8 rounded-[40px] border-none shadow-sm relative overflow-hidden group">
                          <div className="relative z-10 space-y-2">
                             <div className="flex items-center gap-2 text-primary">
                                <Target size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Объемы ушли</span>
                             </div>
                             <div className="text-5xl font-black italic tracking-tighter text-graphite group-hover:scale-110 transition-transform origin-left">{post.stats_waist}</div>
                          </div>
                          <Target className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5 rotate-12" />
                       </div>
                    </div>
                  )}

                  {/* Story Text / Article Content */}
                  <div className="space-y-8 max-w-2xl">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">
                          {post.type === "result" ? "История героя" : "Текст публикации"}
                        </span>
                     </div>
                     
                     {post.excerpt && (
                        <p className="text-xl sm:text-2xl font-medium leading-relaxed text-graphite/80 italic first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-1 first-letter:float-left mb-12">
                           &ldquo;{post.excerpt}&rdquo;
                        </p>
                     )}

                     <div 
                        className="prose prose-sm sm:prose lg:prose-lg max-w-none text-graphite/90 font-medium 
                                   prose-headings:text-graphite prose-headings:font-black 
                                   prose-p:leading-relaxed prose-strong:text-primary"
                        dangerouslySetInnerHTML={{ __html: post.content }} 
                     />
                  </div>

                  {/* Products Section */}
                  {post.products && post.products.length > 0 && (
                     <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-px bg-graphite/10" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-graphite/30">Продукты успеха</span>
                            </div>
                        </div>
                        <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                           {post.products.map(productName => {
                              const data = PRODUCT_DATA[productName] || { icon: <Sparkles />, color: "bg-graphite/5" };
                              return (
                                <motion.div 
                                  key={productName}
                                  whileHover={{ y: -8 }}
                                  className="w-48 shrink-0 bg-white p-6 rounded-[32px] border border-graphite/5 shadow-premium flex flex-col items-center text-center gap-4 group"
                                >
                                   <div className={cn("w-32 h-32 rounded-3xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-110", data.color)}>
                                      {data.image ? (
                                         // eslint-disable-next-line @next/next/no-img-element
                                         <img src={data.image} alt={productName} className="w-full h-full object-cover" />
                                      ) : (
                                         <div className="scale-150">{data.icon}</div>
                                      )}
                                   </div>
                                   <div>
                                      <div className="text-sm font-black text-graphite line-clamp-2">{productName}</div>
                                   </div>
                                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary p-0 h-auto">Купить <ChevronRight size={12} /></Button>
                                   </div>
                                </motion.div>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Action Footer */}
            <div className="p-8 sm:p-12 bg-white/80 backdrop-blur-md border-t border-graphite/5 flex flex-col sm:flex-row items-center justify-between gap-8">
               <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Готовы начать свой путь?</div>
                  <div className="text-xl font-black text-graphite">Получите персональную программу</div>
               </div>
               <Button className="w-full sm:w-auto h-20 px-12 rounded-[28px] bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-4 text-lg font-black group overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                  Хочу такой же результат <ArrowRight size={24} />
               </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
