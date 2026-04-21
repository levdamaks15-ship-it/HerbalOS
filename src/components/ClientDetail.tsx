"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageCircle, 
  EyeOff, 
  Eye, 
  TrendingDown,
  ShieldCheck,
  Target,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getClientLogs, DB_Log } from "@/lib/actions/logs";
import { DB_Client } from "@/lib/actions/clients";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";

const DEMO_MEAL_PHOTO = "/assets/meal.png";

type ClientDetailProps = {
  client: DB_Client | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ClientDetail({ client, isOpen, onClose }: ClientDetailProps) {
  const [incognito, setIncognito] = useState(true);
  const [clientLogs, setClientLogs] = useState<DB_Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MOCK_DETAIL_LOGS: DB_Log[] = React.useMemo(() => {
    if (!client) return [];
    const now = new Date();
    return [
      {
         $id: "m-1",
         $createdAt: now.toISOString(),
         type: "weight",
         client_id: client.$id,
         value: String(client.weight_current),
         note: "Утреннее взвешивание, идем по плану",
      },
      {
         $id: "m-2",
         $createdAt: new Date(now.getTime() - 86400000).toISOString(),
         type: "food",
         client_id: client.$id,
         value: "Фото",
         note: "Обед: Куриная грудка, брокколи и немного бурого риса. Чувствую прилив сил!",
      },
      {
         $id: "m-3",
         $createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
         type: "weight",
         client_id: client.$id,
         value: String(client.weight_current + 0.8),
         note: "Контроль веса",
      },
      {
         $id: "m-4",
         $createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
         type: "food",
         client_id: client.$id,
         value: "Фото",
         note: "Завтрак: Овсянка на воде с ягодами и протеиновым коктейлем",
      }
    ];
  }, [client]);

  React.useEffect(() => {
    async function loadClientData() {
      if (!client?.$id || !isOpen) return;
      setIsLoading(true);
      const logs = await getClientLogs(client.$id);
      setClientLogs(logs.length > 0 ? logs : MOCK_DETAIL_LOGS);
      setIsLoading(false);
    }
    loadClientData();
  }, [client, isOpen, MOCK_DETAIL_LOGS]);

  if (!client) return null;

  // Формируем данные для графика на основе логов веса
  const weightHistory = clientLogs
    .filter(l => l.type === 'weight')
    .map(l => ({
      date: new Date(l.$createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      weight: parseFloat(l.value)
    }))
    .reverse(); // От старых к новым

  // Если данных мало, добавим начальный вес
  if (weightHistory.length === 0) {
    weightHistory.push({ date: 'Старт', weight: client.weight_start });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-graphite/40 backdrop-blur-sm z-100"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-xl bg-accent-bg shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-101 overflow-y-auto font-outfit"
          >
            {/* Header Area */}
            <div className="p-8 pb-6 flex items-center justify-between sticky top-0 bg-accent-bg/80 backdrop-blur-xl z-10 border-b border-graphite/5">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary/20 rounded-[28px] flex items-center justify-center text-primary font-black text-2xl shadow-inner border-2 border-white">
                     {client.name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black ">{client.name}</h2>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase  bg-primary/10 px-2.5 py-1 rounded-full">
                          <ShieldCheck size={12} /> Pro Client
                       </div>
                       <span className="text-[10px] font-black text-graphite/30 uppercase ">Активен {client.lastActive}</span>
                    </div>
                  </div>
               </div>
               <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl shadow-sm border border-graphite/5 transition-all">
                  <X size={24} />
               </button>
            </div>

            <div className="p-8 space-y-12">
               {/* Quick Stats Grid */}
               <div className="grid grid-cols-2 gap-6">
                  <Card className="glass-card border-none p-6 rounded-[32px] relative overflow-hidden group">
                     <div className="text-[10px] font-black text-graphite/30 uppercase  mb-2">Общий сброс</div>
                     <div className="text-3xl font-black text-primary flex items-end gap-1 italic">
                        <TrendingDown size={28} className="mb-1" /> {Math.abs(client.weight_start - client.weight_current).toFixed(1)} <span className="text-sm text-primary/40 not-italic ml-1">кг</span>
                     </div>
                     <Scale size={48} className="absolute -right-4 -bottom-4 text-primary/5 -rotate-12 transition-transform group-hover:scale-110" />
                  </Card>
                  <Card className="glass-card border-none p-6 rounded-[32px] relative overflow-hidden group">
                     <div className="text-[10px] font-black text-graphite/30 uppercase  mb-2">Цель курса</div>
                     <div className="text-2xl font-black text-graphite italic">{client.goal}</div>
                     <Target size={48} className="absolute -right-4 -bottom-4 text-graphite/3 rotate-12 transition-transform group-hover:scale-110" />
                  </Card>
               </div>

               {/* Weight Chart Block */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <div>
                        <h3 className="text-sm font-black uppercase  text-graphite">Динамика веса</h3>
                        <p className="text-[10px] font-bold text-graphite/30 uppercase mt-0.5 ">История замеров за апрель</p>
                     </div>
                     <div className="flex flex-col items-end">
                        <div className="text-xs font-black text-primary italic">-350г <span className="text-[10px] not-italic text-graphite/30 font-bold ml-1">/ за неделю</span></div>
                     </div>
                  </div>
                  <Card className="glass-card border-none p-8 pb-4 rounded-[40px]">
                     <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={weightHistory}>
                              <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#7BC143" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#7BC143" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 900, fill: '#A3A3A3'}} 
                                dy={15} 
                              />
                              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                              <Tooltip 
                                contentStyle={{ 
                                  borderRadius: '24px', 
                                  border: 'none', 
                                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                                  fontSize: '14px', 
                                  fontWeight: 900,
                                  padding: '12px 20px'
                                }}
                                cursor={{ stroke: '#7BC143', strokeWidth: 2, strokeDasharray: '4 4' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#7BC143" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorWeight)" 
                                animationDuration={2000}
                              />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </div>

               {/* Timeline Logs */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-sm font-black uppercase  text-graphite">Хроника активности</h3>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "rounded-xl px-4 text-[10px] font-black uppercase  gap-2 transition-all",
                          incognito ? "bg-amber-50 text-amber-600" : "bg-primary/10 text-primary"
                        )}
                        onClick={() => setIncognito(!incognito)}
                     >
                        {incognito ? <EyeOff size={14} /> : <Eye size={14} />} {incognito ? "Инкогнито: ON" : "Инкогнито: OFF"}
                     </Button>
                  </div>

                  <div className="space-y-10 relative">
                     {/* Clean Vertical Path */}
                     <div className="absolute left-6 top-2 bottom-0 w-1 bg-graphite/5 rounded-full" />

                     {isLoading ? (
                        <div className="p-8 text-center opacity-30 italic">Загрузка истории...</div>
                     ) : clientLogs.length === 0 ? (
                        <div className="p-8 text-center text-graphite/20 font-medium italic">Записей нет</div>
                     ) : clientLogs.map((log) => (
                        <div key={log.$id} className="relative pl-16">
                           <div className={cn(
                             "absolute left-3 top-2 w-7 h-7 rounded-full border-[6px] border-accent-bg flex items-center justify-center z-10 shadow-sm",
                             log.type === 'food' ? "bg-amber-400" : "bg-primary"
                           )}>
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className={cn(
                                    "text-[11px] font-black uppercase ",
                                    log.type === 'food' ? "text-amber-600" : "text-primary"
                                 )}>
                                    {log.type === 'food' ? "Дневник питания" : "Контроль веса"}
                                 </span>
                                 <span className="text-[10px] font-bold text-graphite/20 bg-graphite/5 px-3 py-1 rounded-full uppercase ">
                                    {new Date(log.$createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>

                              <Card className="health-card border-none overflow-hidden rounded-[32px] hover:shadow-lg transition-all">
                                 <CardContent className="p-0">
                                    {log.type === 'food' && (
                                      <div className="relative overflow-hidden aspect-video bg-graphite/5 group">
                                         {/* eslint-disable-next-line @next/next/no-img-element */}
                                         <img 
                                           src={log.photo || DEMO_MEAL_PHOTO} 
                                           className={cn("w-full h-full object-cover transition-all duration-1000 group-hover:scale-105", incognito && "blur-2xl scale-125")} 
                                           alt="Meal" 
                                         />
                                         {incognito && (
                                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-graphite/10 backdrop-blur-sm">
                                              <EyeOff size={32} className="text-white/40 mb-2" />
                                              <div className="text-[10px] font-black text-white/60 uppercase ">Защищено экспертом</div>
                                           </div>
                                         )}
                                      </div>
                                    )}
                                    <div className="p-6">
                                       {log.type === 'weight' && (
                                          <div className="text-3xl font-black mb-2 italic">{log.value} <span className="text-sm text-graphite/20 not-italic">кг</span></div>
                                       )}
                                       <p className="text-sm font-bold text-graphite/60 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                                          «{log.note || (log.type === 'weight' ? "Замер веса" : "Фотоотчет")}»
                                       </p>
                                    </div>
                                 </CardContent>
                              </Card>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Footer Action */}
               <div className="sticky bottom-0 pt-6 pb-4 bg-linear-to-t from-accent-bg via-accent-bg to-transparent">
                  <Button className="w-full h-20 text-md font-black uppercase  rounded-[28px] gap-4 shadow-[0_20px_40px_rgba(123,193,67,0.3)] hover:scale-[1.02] transition-all">
                     <MessageCircle size={28} className="fill-white/10" /> Написать клиенту в Telegram
                  </Button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
