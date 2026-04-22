"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  AlertCircle, 
  Search, 
  Filter, 
  TrendingDown, 
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Plus,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  CheckCircle,
  LogOut,
  Newspaper,
  Lock,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getClients, DB_Client } from "@/lib/actions/clients";
import { 
  getPosts, 
  DB_Post, 
  approvePostAction, 
  deletePostAction 
} from "@/lib/actions/posts";
import { useParams, useRouter } from "next/navigation";
import { ClientDetail } from "@/components/ClientDetail";
import { authService } from "@/lib/appwrite/services/auth";

export default function AdminPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"risk" | "all" | "content">("risk");
  const [clients, setClients] = useState<DB_Client[]>([]);
  const [posts, setPosts] = useState<DB_Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<DB_Client | null>(null);

  useEffect(() => {
    async function checkSession() {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
      }
    }
    checkSession();
  }, []);

  const DEMO_CLIENTS: DB_Client[] = React.useMemo(() => [
    {
       $id: "cl-1",
       name: "Александр П.",
       goal: "Сброс веса / Рельеф",
       weight_start: 112,
       weight_current: 104.5,
       progress: -7.5,
       status: "active",
       lastActive: "2ч назад",
       expert: slug as string
    },
    {
       $id: "cl-2",
       name: "Светлана И.",
       goal: "Детокс / Энергия",
       weight_start: 78,
       weight_current: 77.8,
       progress: -0.2,
       status: "at_risk",
       lastActive: "2 дня назад",
       expert: slug as string
    },
    {
       $id: "cl-3",
       name: "Иван Г.",
       goal: "Набор массы",
       weight_start: 68,
       weight_current: 72.4,
       progress: 4.4,
       status: "active",
       lastActive: "15м назад",
       expert: slug as string
    },
    {
       $id: "cl-4",
       name: "Марина О.",
       goal: "Подготовка к марафону",
       weight_start: 95,
       weight_current: 94.8,
       progress: -0.2,
       status: "at_risk",
       lastActive: "3 дня назад",
       expert: slug as string
    },
    {
       $id: "cl-5",
       name: "Константин Д.",
       goal: "Здоровье 50+",
       weight_start: 88,
       weight_current: 82.1,
       progress: -5.9,
       status: "active",
       lastActive: "1ч назад",
       expert: slug as string
    }
  ], [slug]);

  useEffect(() => {
    async function loadAdminData() {
      if (!slug) return;
      const [clientsData, postsData] = await Promise.all([
        getClients(slug as string),
        getPosts(slug as string, true) // Include pending for admin
      ]);
      setClients(clientsData.length > 0 ? clientsData : DEMO_CLIENTS);
      setPosts(postsData);
      setIsLoading(false);
    }
    loadAdminData();
  }, [slug, DEMO_CLIENTS]);

  const handleApprove = async (post: DB_Post) => {
    try {
      await approvePostAction(post.$id, post);
      // Refresh list
      const updatedPosts = await getPosts(slug as string, true);
      setPosts(updatedPosts);
    } catch {
      alert("Ошибка при одобрении");
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Удалить этот пост?")) return;
    try {
      await deletePostAction(postId);
      setPosts(prev => prev.filter(p => p.$id !== postId));
    } catch {
      alert("Ошибка при удалении");
    }
  };

  const activeCount = clients.length;
  const atRiskCount = clients.filter(c => c.status === "at_risk").length;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
       await authService.login(email, password);
       setIsAuthenticated(true);
    } catch {
       alert("Ошибка авторизации. Проверьте данные.");
    } finally {
       setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    router.push(`/${slug}`);
  };

  const riskClients = clients.filter(c => c.status === "at_risk");
  const displayClients = activeTab === "risk" ? riskClients : clients;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-accent-bg flex items-center justify-center p-6 text-graphite font-outfit">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-sm"
        >
           <Card className="glass-card border-none p-10 text-center space-y-8 rounded-[48px]">
              <div className="w-20 h-20 bg-primary/20 rounded-[32px] flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary/10">
                 <Lock size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase ">Admin <span className="text-primary italic">Terminal</span></h1>
                <p className="text-[10px] text-graphite/30 font-black uppercase  mt-2">Вход для эксперта ({slug})</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Email эксперта" 
                    className="w-full h-14 rounded-3xl px-6 text-center text-md outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-graphite/5 bg-white/30 backdrop-blur-sm font-bold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input 
                    type="password" 
                    placeholder="Пароль" 
                    className="w-full h-16 rounded-3xl px-6 text-center text-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-graphite/5 bg-white/50 backdrop-blur-sm font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button disabled={isAuthLoading} className="w-full h-16 rounded-3xl text-md font-black gap-2 shadow-xl shadow-primary/20">
                     {isAuthLoading ? "Проверка..." : "Войти в систему"} <ArrowRight size={20} />
                  </Button>
              </form>
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-graphite/20 uppercase ">
                 <ShieldCheck size={12} /> Protected by Herbal OS
              </div>
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => router.push(`/${slug}`)} 
                className="w-full text-[10px] font-black uppercase text-graphite/30 hover:text-graphite/50 h-8"
              >
                Вернуться на главную
              </Button>
           </Card>
        </motion.div>
      </main>
    );
  }

  const renderCurrentView = () => {
    if (activeTab === "content") {
      return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-3xl font-black">Издательство</h2>
                 <p className="text-xs font-bold text-graphite/30 uppercase mt-1">Контент-план и публикации</p>
              </div>
              <Button className="rounded-2xl h-14 px-8 text-md font-black gap-3 shadow-xl shadow-primary/20">
                 <Plus size={20} /> Создать пост
              </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-none p-8 overflow-hidden relative group">
                 <div className="text-[10px] font-black text-graphite/30 uppercase mb-2">Публикаций</div>
                 <div className="text-3xl font-black">{isLoading ? "..." : activeCount}</div>
                 <BookOpen size={64} className="absolute -right-4 -bottom-4 text-primary/5 -rotate-12" />
              </Card>
              <Card className="glass-card border-none p-8 overflow-hidden relative group">
                 <div className="text-[10px] font-black text-primary uppercase mb-2">Охват (24ч)</div>
                 <div className="text-4xl font-black text-primary">8.4k</div>
                 <TrendingUp size={64} className="absolute -right-4 -bottom-4 text-primary/5 rotate-12" />
              </Card>
           </div>

           <Card className="glass-card border-none overflow-hidden rounded-[32px]">
              <div className="overflow-x-auto">
                 {isLoading ? (
                    <div className="p-8 text-center opacity-30 italic">Загрузка...</div>
                 ) : (
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-graphite/2 border-b border-graphite/5">
                             <th className="p-6 text-[10px] font-black uppercase text-graphite/40">Обложка</th>
                             <th className="p-6 text-[10px] font-black uppercase text-graphite/40">Заголовок</th>
                             <th className="p-6 text-[10px] font-black uppercase text-graphite/40">Категория</th>
                             <th className="p-6 text-[10px] font-black uppercase text-graphite/40">Статус</th>
                             <th className="p-6 text-[10px] font-black uppercase text-graphite/40 text-right">Действие</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-graphite/5">
                          {posts.map(post => (
                             <tr key={post.$id} className="hover:bg-primary/2 transition-all group">
                                <td className="p-6">
                                   <div className="w-16 h-12 rounded-xl bg-graphite/5 flex items-center justify-center text-graphite/20">
                                      <ImageIcon size={20} />
                                   </div>
                                </td>
                                <td className="p-6 font-black text-sm">{post.title}</td>
                                <td className="p-6">
                                   <span className="text-[10px] font-black uppercase px-3 py-1 bg-primary/10 text-primary rounded-full">{post.type}</span>
                                </td>
                                <td className="p-6">
                                   {post.status === "pending" ? (
                                     <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500">
                                       <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> На проверке
                                     </span>
                                   ) : (
                                     <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-green-500">
                                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Опубликовано
                                     </span>
                                   )}
                                </td>
                                <td className="p-6">
                                   <div className="flex justify-end gap-2 text-[10px] font-black uppercase">
                                      {post.status === "pending" && (
                                        <Button 
                                          size="sm"
                                          onClick={() => handleApprove(post)}
                                          className="rounded-xl bg-green-500 hover:bg-green-600 text-white gap-2 h-9 px-4"
                                        >
                                          <CheckCircle size={14} /> Одобрить
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(post.$id)}
                                        className="rounded-xl w-9 h-9 hover:bg-red-50 hover:text-red-500"
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 )}
              </div>
           </Card>
        </div>
      );
    }

    return (
      <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* ABSOLUTE TOP: Search & Filters */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite/30" size={16} />
               <input 
                 type="text" 
                 placeholder="Поиск по имени или цели..." 
                 className="bg-white border border-graphite/5 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none w-full"
               />
            </div>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-graphite/10 bg-white gap-2 font-black text-[10px] uppercase shrink-0">
               <Filter size={14} /> Фильтр
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-none p-8 overflow-hidden relative group">
               <div className="text-[10px] font-black text-graphite/30 uppercase mb-2">Активных клиентов</div>
               <div className="text-4xl font-black">{isLoading ? "..." : activeCount}</div>
               <Users className="absolute -right-4 -bottom-4 w-20 h-20 text-primary/5 rotate-12" />
            </Card>
            <Card className="glass-card border-none p-8 border-l-4 border-l-red-500 overflow-hidden relative">
               <div className="text-[10px] font-black text-red-400 uppercase mb-2">В зоне риска</div>
               <div className="text-3xl font-black text-red-500">{isLoading ? "..." : atRiskCount}</div>
               <AlertCircle className="absolute -right-4 -bottom-4 w-20 h-20 text-red-500/5 rotate-12" />
            </Card>
            <Card className="glass-card border-none p-8 overflow-hidden relative">
               <div className="text-[10px] font-black text-graphite/30 uppercase mb-2">Средний сброс</div>
               <div className="text-4xl font-black text-primary">-3.4 <span className="text-lg">кг</span></div>
               <TrendingDown className="absolute -right-4 -bottom-4 w-20 h-20 text-primary/5 rotate-12" />
            </Card>
            <Card className="glass-card border-none p-8 overflow-hidden relative group">
               <div className="text-[10px] font-black text-graphite/30 uppercase mb-2">Общая цель эксперта</div>
               <div className="text-4xl font-black text-primary">150 <span className="text-lg">кг</span></div>
               <TrendingDown className="absolute -right-4 -bottom-4 w-20 h-20 text-primary/5 rotate-12" />
            </Card>
         </div>

         <div className="space-y-6">
            <div className="flex gap-6 border-b border-graphite/5 w-fit">
               <button 
                 onClick={() => setActiveTab("risk")}
                 className={cn(
                   "text-[10px] font-black uppercase  pb-4 transition-all relative px-2",
                   activeTab === "risk" ? "text-red-500" : "text-graphite/30"
                 )}
               >
                  Группа риска
                  {activeTab === "risk" && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-1 bg-red-500" />}
               </button>
               <button 
                 onClick={() => setActiveTab("all")}
                 className={cn(
                   "text-[10px] font-black uppercase  pb-4 transition-all relative px-2",
                   activeTab === "all" ? "text-primary" : "text-graphite/30"
                 )}
               >
                  Все клиенты
                  {activeTab === "all" && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-1 bg-primary" />}
               </button>
            </div>

            <div className="grid gap-6">
               {isLoading ? (
                  <div className="p-8 text-center opacity-30 italic">Загрузка данных...</div>
               ) : displayClients.map(client => (
                 <motion.div 
                    key={client.$id} 
                    layout 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedClient(client)}
                 >
                    <Card className={cn(
                       "health-card border-none overflow-hidden group cursor-pointer",
                       client.status === "at_risk" && "border-l-[6px] border-l-red-500"
                    )}>
                       <CardContent className="p-2 flex flex-col md:flex-row items-stretch md:items-center">
                          <div className="p-6 flex-1 flex items-center gap-6">
                             <div className="w-16 h-16 rounded-[24px] bg-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                                {client.name.split(' ').map(n => n[0]).join('')}
                             </div>
                             <div className="space-y-1">
                                <div className="text-xl font-black">{client.name}</div>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-black text-graphite/30 uppercase">{client.goal}</span>
                                   <span className="w-1.5 h-1.5 rounded-full bg-graphite/10" />
                                   <span className={cn(
                                      "text-[10px] font-black uppercase",
                                      client.status === "at_risk" ? "text-red-500" : "text-green-500"
                                   )}>Активность: {client.lastActive}</span>
                                </div>
                             </div>
                          </div>

                          <div className="p-6 md:px-12 bg-graphite/1 flex items-center gap-12 text-center border-y md:border-y-0 md:border-x border-graphite/5">
                             <div className="space-y-1">
                                <div className="text-[9px] font-black text-graphite/30 uppercase">Вес</div>
                                <div className="text-lg font-black">{client.weight_current} кг</div>
                             </div>
                             <div className="space-y-1">
                                <div className="text-[9px] font-black text-graphite/30 uppercase">Динамика</div>
                                <div className={cn(
                                   "text-lg font-black flex items-center gap-1 justify-center",
                                   client.progress < 0 ? "text-primary" : "text-red-500"
                                )}>
                                   {client.progress < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                   {Math.abs(client.progress)} кг
                                </div>
                             </div>
                          </div>

                          <div className="p-6 flex items-center justify-start gap-3 px-6">
                             <Button className="rounded-2xl h-14 px-8 font-black text-xs uppercase group-hover:bg-primary transition-all shadow-md">
                                Подробнее <ChevronRight size={18} className="ml-1" />
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                 </motion.div>
               ))}
            </div>
         </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-accent-bg flex text-graphite font-outfit">
       {/* Sidebar (Desktop) */}
       <div className="hidden md:flex w-24 flex-col items-center py-10 border-r border-graphite/5 bg-white shrink-0 sticky top-0 h-screen z-20">
          <div className="w-12 h-12 bg-primary rounded-2xl mb-16 flex items-center justify-center text-white font-black italic shadow-xl shadow-primary/20 cursor-pointer hover:scale-110 transition-transform">H</div>
          <div className="flex flex-col gap-10">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveTab("risk")}
                className={cn("w-14 h-14 rounded-2xl transition-all shadow-sm", (activeTab === "risk" || activeTab === "all") ? "bg-primary text-white shadow-primary/20" : "text-graphite/20 hover:text-primary")}
             >
                <Users size={28} />
             </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveTab("content")}
                className={cn("w-14 h-14 rounded-2xl transition-all shadow-sm", activeTab === "content" ? "bg-primary text-white shadow-primary/20" : "text-graphite/20 hover:text-primary")}
             >
                <Newspaper size={28} />
             </Button>
          </div>
          <div className="mt-auto">
             <Button onClick={handleLogout} variant="ghost" size="icon" title="Выйти" className="w-14 h-14 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                <LogOut size={24} />
             </Button>
          </div>
       </div>

       {/* Sub-components */}
       <ClientDetail 
         client={selectedClient} 
         isOpen={!!selectedClient} 
         onClose={() => setSelectedClient(null)} 
       />

       {/* Content Area */}
       <div className="flex-1 flex flex-col min-w-0 bg-[#FDFCFB]">
          <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-graphite/5 px-10 flex items-center justify-between z-10 sticky top-0">
             <div className="flex items-center gap-6">
                <Link href={`/${slug}`} className="hover:opacity-70 transition-opacity">
                   <h2 className="text-2xl font-black italic text-primary">Herbal OS</h2>
                </Link>
                <div className="h-8 w-[2px] bg-graphite/5 rounded-full" />
                <div>
                   <div className="text-sm font-black ">Эксперт Гербалайф</div>
                   <div className="text-[10px] font-black text-graphite/30 uppercase ">{activeTab === "content" ? "Media Publisher" : "Business Control"}</div>
                </div>
             </div>
             <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                   <div className="text-[9px] font-black text-primary uppercase  mb-0.5">Session Active</div>
                   <div className="text-sm font-black">Expert Terminal</div>
                </div>
                <div className="w-12 h-12 rounded-[20px] bg-primary/10 border-2 border-white shadow-xl flex items-center justify-center text-primary">
                   <ShieldCheck size={24} />
                </div>
                <Button 
                   onClick={handleLogout}
                   variant="ghost" 
                   size="icon" 
                   className="md:hidden w-12 h-12 rounded-[20px] bg-red-50 text-red-500 hover:bg-red-100 transition-all ml-2"
                >
                   <LogOut size={24} />
                </Button>
             </div>
          </header>

          <AnimatePresence mode="wait">
             {renderCurrentView()}
          </AnimatePresence>
       </div>
    </main>
  );
}
