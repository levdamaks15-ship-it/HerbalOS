"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  ArrowRight, 
  Heart, 
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getPosts, DB_Post } from "@/lib/actions/posts";
import { SuccessStoryModal } from "@/components/SuccessStoryModal";

const FALLBACK_POSTS: Partial<DB_Post>[] = [
  {
    $id: "demo-1",
    title: "5 секретов идеального завтрака с Herbalife",
    excerpt: "Как начать день правильно, чтобы энергии хватило до самого вечера? Разбираем состав и пользу коктейля Формула 1.",
    image: "/assets/breakfast.png",
    category: "Питание",
    type: "standard",
    date: "Сегодня",
    likes: 124,
    isPremium: true,
    author: "Expert",
    comments: 12,
    expert: "vadim",
    status: "published"
  },
  {
    $id: "demo-2",
    title: "Результат Кирилла: -12кг за 3 месяца",
    excerpt: "История невероятной трансформации и изменения привычек питания под руководством эксперта.",
    imageBefore: "/assets/transformation.png",
    imageAfter: "/assets/transformation.png",
    category: "Результаты",
    type: "result",
    stats_weight: "-12.4 кг",
    stats_waist: "-15 см",
    date: "Вчера",
    likes: 450,
    author: "Expert",
    comments: 48,
    expert: "vadim",
    status: "published",
    products: ["Коктейль Ф1", "Алоэ", "Травяной напиток"]
  }
];

const CATEGORIES = ["Все", "Питание", "Рецепты", "Результаты", "Статьи"];

export default function MediaPage() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState("Все");
  const [posts, setPosts] = useState<DB_Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<DB_Post | null>(null);
  const expertName = "Эксперт Гербалайф";

  useEffect(() => {
    async function loadPosts() {
      if (!slug) return;
      try {
        const data = await getPosts(slug as string);
        setPosts(data || []);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, [slug]);

  const displayPosts = (posts.length > 0 ? posts : FALLBACK_POSTS) as DB_Post[];
  const filteredPosts = activeCategory === "Все" 
    ? displayPosts 
    : displayPosts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-graphite font-outfit">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-graphite/5 px-6 h-20 flex items-center justify-between">
         <Link href={`/${slug}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-graphite/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
               <ArrowLeft size={20} />
            </div>
            <span className="text-sm font-black uppercase tracking-widest hidden sm:block">Назад в Хаб</span>
         </Link>
         <div className="text-2xl font-black italic tracking-tighter text-primary absolute left-1/2 -translate-x-1/2">
            Media <span className="text-graphite">Hub</span>
         </div>
         <div className="text-right hidden md:block">
            <div className="text-[10px] font-black text-graphite/30 uppercase tracking-widest">Эксперт</div>
            <div className="text-sm font-black">{expertName}</div>
         </div>
      </header>

      <main className="max-w-4xl mx-auto py-12">
        <div className="px-6 mb-12">
           <h1 className="text-4xl font-black tracking-tight mb-4">Лента эксперта</h1>
           <p className="text-sm font-medium text-graphite/50 max-w-lg leading-relaxed">
              Полезные статьи, проверенные рецепты и реальные истории трансформации наших участников.
           </p>
        </div>

        {/* Categories */}
        <div className="px-6 mb-12 flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {CATEGORIES.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border",
                 activeCategory === cat 
                  ? "bg-graphite text-white shadow-lg border-graphite" 
                  : "bg-white text-graphite/40 border-graphite/5 hover:bg-graphite/5"
               )}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Posts */}
        <section className="px-6 space-y-16 pb-24">
           {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-4 opacity-50">
                 <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                 <div className="text-[10px] font-black uppercase tracking-widest">Загрузка ленты...</div>
              </div>
           ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-graphite/30 text-sm font-medium italic">
                 Постов в этой категории пока нет
              </div>
           ) : filteredPosts.map((post, i) => {
              const isResult = post.type === "result";
              
              return (
                <motion.div 
                  key={post.$id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                   {isResult ? (
                     <Card className="border-none bg-graphite text-white rounded-[48px] overflow-hidden shadow-2xl relative group cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <CardContent className="p-0">
                           <div className="flex flex-col">
                              <div className="relative aspect-square sm:aspect-video bg-white/5 overflow-hidden">
                                 {post.imageBefore === post.imageAfter ? (
                                    <div className="relative h-full w-full">
                                       {/* eslint-disable-next-line @next/next/no-img-element */}
                                       <img src={post.imageAfter} alt="Transformation" className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-linear-to-t from-graphite via-transparent to-transparent opacity-60" />
                                    </div>
                                 ) : (
                                    <div className="grid grid-cols-2 h-full gap-px bg-white/10">
                                       <div className="relative overflow-hidden">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={post.imageBefore} alt="Before" className="w-full h-full object-cover object-center" />
                                          <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border border-white/10">До</div>
                                       </div>
                                       <div className="relative overflow-hidden">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={post.imageAfter} alt="After" className="w-full h-full object-cover object-center" />
                                          <div className="absolute top-6 right-6 bg-primary text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">После</div>
                                       </div>
                                    </div>
                                 )}

                                 {/* Floating Stats Badge */}
                                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/95 backdrop-blur-xl p-3 sm:p-6 rounded-[28px] shadow-2xl border border-white z-20 min-w-[240px] justify-around">
                                    <div className="text-center">
                                       <div className="text-[8px] font-black uppercase text-graphite/40 mb-0.5">Вес</div>
                                       <div className="text-lg sm:text-2xl font-black text-primary italic leading-none">{post.stats_weight}</div>
                                    </div>
                                    <div className="w-px h-8 bg-graphite/10" />
                                    <div className="text-center">
                                       <div className="text-[8px] font-black uppercase text-graphite/40 mb-0.5">Объемы</div>
                                       <div className="text-lg sm:text-2xl font-black text-primary italic leading-none">{post.stats_waist}</div>
                                    </div>
                                 </div>
                              </div>
                              <div className="p-8 sm:p-12 text-center">
                                 <h3 className="text-2xl sm:text-3xl font-black mb-3 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                                 <p className="text-sm sm:text-base font-medium text-white/40 leading-relaxed mb-6 italic max-w-xl mx-auto">&ldquo;{post.excerpt}&rdquo;</p>
                                 <Button 
                                   onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                                   className="w-full h-20 rounded-[28px] bg-white text-graphite hover:bg-primary hover:text-white transition-all font-black gap-3 text-md transform group-hover:translate-y-[-4px] shadow-xl"
                                 >
                                    Читать историю успеха <ArrowRight size={20} />
                                 </Button>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                   ) : (
                     <Card className="border-none bg-transparent overflow-hidden group cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <CardContent className="p-0 space-y-6">
                           <div className="relative rounded-[40px] overflow-hidden aspect-16/10 shadow-2xl">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                               <div className="absolute top-8 left-8 flex gap-3">
                                  <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight text-graphite shadow-sm">{post.category}</span>
                                  {post.isPremium && (
                                    <span className="bg-primary text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-1 shadow-lg shadow-primary/20"><Sparkles size={12} /> Эксклюзив</span>
                                  )}
                               </div>
                              <div className="absolute inset-0 bg-linear-to-t from-graphite/40 via-transparent to-transparent opacity-60" />
                           </div>
    
                           <div className="px-4 space-y-3">
                              <div className="flex items-center gap-4 text-[11px] font-black text-graphite/30 uppercase tracking-[0.2em]">
                                 <span>{post.date}</span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                 <div className="flex items-center gap-1.5 text-primary"><Heart size={12} className="fill-current" /> {post.likes}</div>
                              </div>
                              <h3 className="text-3xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                              <p className="text-base font-medium text-graphite/50 leading-relaxed line-clamp-3">{post.excerpt}</p>
                           </div>
                        </CardContent>
                     </Card>
                   )}
                </motion.div>
              );
           })}
        </section>
      </main>

      <footer className="py-12 text-center border-t border-graphite/5 bg-white">
         <div className="text-primary text-2xl font-black italic tracking-tighter mb-4">Herbal OS</div>
         <p className="text-[10px] font-bold text-graphite/30 uppercase tracking-[0.3em]">Professional Expert Portal • 2024</p>
      </footer>

      <SuccessStoryModal 
        isOpen={!!selectedPost}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        expertSlug={slug as string}
      />
    </div>
  );
}
