"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Target, 
  Scale, 
  Camera, 
  Plus, 
  ChevronRight, 
  Settings,
  CheckCircle2,
  Image as ImageIcon,
  ChevronLeft,
  Droplets,
  Info,
  LayoutDashboard,
  Sparkles,
  Trophy as TrophyIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getClientLogs, createLogAction, DB_Log } from "@/lib/actions/logs";
import { getCurrentClientAction, DB_Client } from "@/lib/actions/clients";
import { useParams } from "next/navigation";
import { useTWA } from "@/components/TWAProvider";
import { LogModal } from "@/components/LogModal";
import { StorySubmission } from "@/components/StorySubmission";

const DEMO_LOGS: DB_Log[] = [
  {
     $id: "demo-1",
     $createdAt: new Date().toISOString(),
     type: "food",
     value: "Фото",
     note: "Зеленый коктейль и овсяноблин",
     client_id: "demo",
  },
  {
     $id: "demo-2",
     $createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
     type: "weight",
     value: "82.4",
     client_id: "demo",
  },
  {
     $id: "demo-3",
     $createdAt: new Date(Date.now() - 86400000).toISOString(),
     type: "food",
     value: "Фото",
     note: "Ужин: Салат с тунцом и авокадо",
     client_id: "demo",
  },
  {
     $id: "demo-4",
     $createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
     type: "weight",
     value: "82.9",
     client_id: "demo",
  },
  {
     $id: "demo-5",
     $createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
     type: "food",
     value: "Фото",
     note: "Обед: Запеченная индейка с киноа",
     client_id: "demo",
  },
  {
     $id: "demo-6",
     $createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
     type: "weight",
     value: "83.5",
     client_id: "demo",
  }
];

export default function DashboardPage() {
  const { slug } = useParams();
  const { user } = useTWA();
  const [modalType, setModalType] = useState<"weight" | "food" | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [logs, setLogs] = useState<DB_Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "settings">("dashboard");
  const [reminders, setReminders] = useState({ breakfast: true, dinner: true, water: false });

  const [clientData, setClientData] = useState<any>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // 1. Пытаемся получить данные текущего залогиненного клиента
        const currentClient = await getCurrentClientAction();
        
        if (currentClient) {
          setClientData(currentClient);
          // 2. Загружаем логи этого клиента
          const data = await getClientLogs(currentClient.$id);
          setLogs(data.length > 0 ? data : DEMO_LOGS);
        } else {
          // Если не залогинен, проверяем TWA или показываем демо
          const clientId = user?.id ? String(user.id) : "demo-client-123";
          const data = await getClientLogs(clientId);
          setLogs(data.length > 0 ? data : DEMO_LOGS);
        }
      } catch (e) {
        console.error("Dashboard: Error loading data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug, user]);

  const weightLogs = logs.filter(l => l.type === 'weight');
  const currentWeight = weightLogs.length > 0 ? parseFloat(weightLogs[0].value) : 82.4;
  const startWeight = 85.0;
  const targetWeight = 75.0;
  const streak = 7;

  const totalToLose = startWeight - targetWeight;
  const lostSoFar = startWeight - currentWeight;
  const progressPercent = Math.min(Math.round((lostSoFar / totalToLose) * 100), 100);

  const hasLoggedToday = logs.some(l => {
    const today = new Date().toDateString();
    return new Date(l.$createdAt).toDateString() === today;
  });
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const currentDayIdx = (new Date().getDay() + 6) % 7;

  const handleSaveLog = async (data: { type: "weight" | "food"; value?: number; comment?: string; timestamp: string }) => {
    const effectiveUserId = user?.id ? String(user.id) : "demo-client-123";
    const clientName = user?.first_name || "Марафонец";
    
    const result = await createLogAction(
      effectiveUserId,
      clientName,
      data.type as "weight" | "food",
      data.value ? String(data.value) : (data.comment || "Фото"),
      data.comment,
      slug as string
    );

    if (result.success && result.data) {
      setLogs(prev => [result.data as unknown as DB_Log, ...prev]);
    }
  };

  const toggleReminder = (key: keyof typeof reminders) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="min-h-screen pb-44 bg-[#FDFCFB] font-outfit">
      <LogModal 
        isOpen={!!modalType}
        type={modalType || "weight"}
        onClose={() => setModalType(null)}
        lastWeight={currentWeight}
        onSave={handleSaveLog}
      />

      <StorySubmission 
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        expertSlug={slug as string}
        clientId={String(user?.id || "demo")}
      />

      <AnimatePresence mode="wait">
        {activeView === "dashboard" ? (
          <motion.div 
            key="dash"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                   {user?.photo_url ? (
                     <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <LayoutDashboard size={28} className="text-primary" />
                   )}
                </div>
                <div>
                  <div className="text-[10px] font-black text-graphite/30 uppercase mb-0.5">Личный кабинет</div>
                  <div className="text-xl font-black">{user?.first_name || "Участник"}</div>
                </div>
              </div>
              
              <motion.div 
                animate={hasLoggedToday ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-sm",
                  hasLoggedToday ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-graphite/5 text-graphite/20"
                )}
              >
                <Flame size={20} className={cn(hasLoggedToday ? "fill-orange-500" : "fill-none")} />
                <span className="text-sm font-black">{streak}</span>
              </motion.div>
            </div>

            <div className="px-6 space-y-8">
              <div className="glass-card p-5 rounded-[32px] flex justify-between items-center relative overflow-hidden">
                {weekDays.map((day, idx) => {
                    const isToday = idx === currentDayIdx;
                    const isActive = (idx < currentDayIdx) || (isToday && hasLoggedToday);
                    return (
                      <div key={day} className="flex flex-col items-center gap-2 relative z-10">
                        <span className={cn("text-[10px] font-black uppercase", isToday ? "text-primary" : "text-graphite/30")}>
                            {day}
                        </span>
                        <div className={cn(
                          "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-500",
                          isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-graphite/5 text-graphite/20",
                          isToday && !hasLoggedToday && "border-2 border-dashed border-primary/30 bg-transparent animate-pulse"
                        )}>
                            {isActive ? <CheckCircle2 size={18} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                      </div>
                    );
                })}
              </div>

              <Card className="border-none shadow-premium bg-white rounded-[40px] overflow-hidden relative">
                <CardContent className="p-10">
                  <div className="flex justify-between items-end mb-10 text-graphite">
                    <div className="space-y-2">
                       <div className="text-[10px] font-black text-graphite/30 uppercase">Текущий вес</div>
                       <div className="text-5xl font-black italic">{currentWeight}<span className="text-2xl text-graphite/20 ml-2">кг</span></div>
                    </div>
                    <div className="text-right space-y-2">
                       <div className="text-[10px] font-black text-primary uppercase">Цель</div>
                       <div className="text-2xl font-black text-primary">{targetWeight} кг</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-graphite/40">
                        <span>Прогресс: {lostSoFar.toFixed(1)} кг</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="h-4 w-full bg-graphite/5 rounded-full overflow-hidden p-1">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className="h-full bg-linear-to-r from-primary to-primary-dark rounded-full shadow-[0_0_15px_rgba(123,193,67,0.4)]"
                        />
                    </div>
                  </div>
                </CardContent>
                <Target className="absolute -right-6 -top-6 w-32 h-32 text-graphite/3 rotate-12 pointer-events-none" />
              </Card>

              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsStoryOpen(true)}
                className="relative p-8 rounded-[38px] bg-linear-to-br from-primary/10 via-white to-primary/5 border border-primary/20 shadow-xl shadow-primary/5 cursor-pointer overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative z-10 flex items-center justify-between text-graphite">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase text-primary">Ваш результат важен</span>
                      </div>
                      <h4 className="text-xl font-black">Поделиться историей?</h4>
                      <p className="text-[11px] font-medium text-graphite/40 leading-relaxed max-w-[180px]">Интересно всем: как вы добились таких крутых перемен!</p>
                    </div>
                    <div className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                      <Plus size={28} />
                    </div>
                </div>
              </motion.div>
              
              {hasLoggedToday && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-primary/5 rounded-[24px] flex items-center gap-4 text-primary border border-primary/10"
                >
                  <TrophyIcon size={24} className="shrink-0" />
                  <span className="text-xs font-black leading-tight italic">«Ваша дисциплина вдохновляет! Только вперед к намеченной цели.»</span>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button 
                    onClick={() => setModalType("weight")}
                    className="h-24 rounded-[32px] flex-col gap-2 border-none shadow-health bg-white text-graphite hover:bg-white active:scale-95 transition-all group" 
                    variant="outline"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Scale size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase">Вес</span>
                </Button>
                <Button 
                    onClick={() => setModalType("food")}
                    className="h-24 rounded-[32px] flex-col gap-2 border-none shadow-health bg-primary text-white active:scale-95 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Camera size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase">Тарелка</span>
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2 text-graphite">
                    <h3 className="text-[10px] font-black uppercase text-graphite/30">История дня</h3>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary">Смотреть всё</Button>
                </div>
                
                <div className="space-y-4">
                    {isLoading ? (
                       <div className="p-12 text-center opacity-30 italic text-graphite">Загрузка...</div>
                    ) : logs.length === 0 ? (
                      <div className="text-center py-12 glass-card rounded-[32px] border-dashed border-2 border-graphite/5">
                        <div className="text-lg font-black text-graphite/10 uppercase italic text-center w-full">Записей пока нет</div>
                      </div>
                    ) : (
                      logs.map((log, i) => (
                        <Card key={log.$id || i} className="border-none shadow-health-sm bg-white/80 backdrop-blur-sm rounded-[24px] hover:shadow-md transition-all cursor-pointer">
                          <CardContent className="p-5 flex items-center gap-5 text-graphite">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                log.type === "food" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                              )}>
                                {log.type === "food" ? <Camera size={22} /> : <Scale size={22} />}
                              </div>
                              <div className="flex-1">
                                <div className="text-[10px] font-black text-graphite/20 uppercase mb-1">
                                   {new Date(log.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div className="text-sm font-black">
                                  {log.type === "food" ? log.note || "Фото тарелки" : `Вес зафиксирован: ${log.value} кг`}
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-graphite/5 flex items-center justify-center text-graphite/20">
                                 <ChevronRight size={18} />
                              </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 space-y-10 text-graphite"
          >
             <div className="flex items-center gap-5">
                <Button variant="ghost" size="icon" onClick={() => setActiveView("dashboard")} className="rounded-[20px] bg-white shadow-sm w-12 h-12">
                   <ChevronLeft />
                </Button>
                <div>
                   <div className="text-[10px] font-black text-graphite/30 uppercase mb-0.5">Настройки</div>
                   <h2 className="text-2xl font-black">Сервисы бота</h2>
                </div>
             </div>

             <div className="space-y-8">
                <Card className="border-none shadow-premium overflow-hidden rounded-[40px]">
                   <div className="divide-y divide-graphite/5">
                    <ReminderRow 
                      icon={<ImageIcon size={24} />} 
                      title="Пора завтракать!" 
                      time="08:30" 
                      active={reminders.breakfast} 
                      onToggle={() => toggleReminder('breakfast')}
                      color="amber"
                    />
                    <ReminderRow 
                      icon={<Droplets size={24} />} 
                      title="Норма воды" 
                      time="Каждые 3 часа" 
                      active={reminders.water} 
                      onToggle={() => toggleReminder('water')}
                      color="blue"
                    />
                    <ReminderRow 
                      icon={<Camera size={24} />} 
                      title="Вечерний отчет" 
                      time="20:30" 
                      active={reminders.dinner} 
                      onToggle={() => toggleReminder('dinner')}
                      color="primary"
                    />
                   </div>
                </Card>

                <div className="p-6 bg-primary/5 rounded-[32px] flex items-start gap-5 border border-primary/10">
                   <Info size={24} className="text-primary shrink-0" />
                   <p className="text-xs font-bold leading-relaxed text-primary/70 italic">
                      «Напоминания помогают сформировать правильные привычки за первые 10 дней. Это ваш ключ к результату!»
                   </p>
                </div>

                <div className="pt-6 text-center">
                   <Button variant="outline" className="w-full h-16 rounded-[24px] border-graphite/5 bg-white text-[10px] font-black uppercase text-graphite/20">
                      VERSION 1.0.4-BETA • HN OS
                   </Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 inset-x-0 flex justify-center pointer-events-none z-50">
         <motion.button 
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => setModalType("food")}
           className="w-16 h-16 bg-primary rounded-[24px] shadow-[0_15px_30px_rgba(123,193,67,0.4)] flex items-center justify-center text-white pointer-events-auto border-4 border-white active:scale-95 transition-all"
         >
            <Plus size={32} strokeWidth={3} />
         </motion.button>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/70 backdrop-blur-2xl border-t border-graphite/5 px-10 pt-4 pb-10 flex justify-between items-center z-40">
        <button 
           onClick={() => setActiveView("dashboard")}
           className={cn("flex flex-col items-center gap-1.5 transition-all", activeView === "dashboard" ? "text-primary" : "text-graphite/20")}
        >
          <div className={cn("p-2 rounded-2xl", activeView === "dashboard" && "bg-primary/10 shadow-inner")}>
             <LayoutDashboard size={24} strokeWidth={activeView === "dashboard" ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-black uppercase">Огоньки</span>
        </button>
        
        <div className="w-16" />
        
        <button 
           onClick={() => setActiveView("settings")}
           className={cn("flex flex-col items-center gap-1.5 transition-all", activeView === "settings" ? "text-primary" : "text-graphite/20")}
        >
          <div className={cn("p-2 rounded-2xl", activeView === "settings" && "bg-primary/10 shadow-inner")}>
             <Settings size={24} strokeWidth={activeView === "settings" ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-black uppercase">Настройки</span>
        </button>
      </div>
    </main>
  );
}

interface ReminderRowProps {
  icon: React.ReactElement;
  title: string;
  time: string;
  active: boolean;
  onToggle: () => void;
  color: "amber" | "blue" | "primary";
}

function ReminderRow({ icon, title, time, active, onToggle, color }: ReminderRowProps) {
  return (
    <div className="p-6 flex items-center justify-between bg-white hover:bg-graphite/1 transition-all text-graphite">
       <div className="flex items-center gap-5">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            color === "amber" && "bg-amber-50 text-amber-500",
            color === "blue" && "bg-blue-50 text-blue-500",
            color === "primary" && "bg-primary/10 text-primary",
          )}>
            {icon}
          </div>
          <div>
             <div className="text-sm font-black">{title}</div>
             <div className="text-[10px] font-black text-graphite/30 uppercase mt-0.5">{time}</div>
          </div>
       </div>
       <button 
         onClick={onToggle} 
         className={cn(
           "w-14 h-8 rounded-full transition-all relative p-1",
           active ? "bg-primary shadow-[0_0_10_rgba(123,193,67,0.3)]" : "bg-graphite/10"
         )}
       >
          <motion.div 
            animate={{ x: active ? 24 : 0 }}
            className="w-6 h-6 rounded-full bg-white shadow-sm" 
          />
       </button>
    </div>
  );
}
