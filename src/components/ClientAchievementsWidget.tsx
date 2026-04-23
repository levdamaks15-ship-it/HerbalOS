"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DB_Client } from "@/lib/actions/clients";
import { getClientLogs, createLogAction, DB_Log } from "@/lib/actions/logs";
import { LogModal } from "@/components/LogModal";
import { cn } from "@/lib/utils";

export function ClientAchievementsWidget({ client, slug }: { client: DB_Client, slug: string }) {
  const [logs, setLogs] = useState<DB_Log[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getClientLogs(client.$id).then((data) => {
      setLogs(data);
      setIsLoading(false);
    });
  }, [client.$id]);

  const weightLogs = logs.filter(l => l.type === 'weight');
  const currentWeight = weightLogs.length > 0 ? parseFloat(weightLogs[0].value) : client.weight_current || client.weight_start || 80;
  const startWeight = client.weight_start || 85;
  // Если цели нет, предположим, что цель = начальный вес - 10кг для демонстрации
  const targetWeight = startWeight - 10;
  
  const totalToLose = startWeight - targetWeight;
  const lostSoFar = startWeight - currentWeight;
  const progressPercent = Math.max(0, Math.min(Math.round((lostSoFar / totalToLose) * 100), 100));

  const hasLoggedToday = logs.some(l => {
    const today = new Date().toDateString();
    return new Date(l.$createdAt).toDateString() === today;
  });

  const handleSaveLog = async (data: { type: string; value?: number; comment?: string; photos?: File[]; timestamp: string }) => {
    const result = await createLogAction(
      client.$id,
      client.name,
      data.type as "weight" | "food",
      data.value ? String(data.value) : (data.comment || "Фото"),
      data.comment,
      slug
    );

    if (result.success && result.data) {
      setLogs(prev => [result.data as unknown as DB_Log, ...prev]);
    }
  };

  return (
    <div className="px-6 mb-12">
      <LogModal 
        isOpen={isModalOpen}
        type="weight"
        onClose={() => setIsModalOpen(false)}
        lastWeight={currentWeight}
        onSave={handleSaveLog}
      />

      <Card className="border-none shadow-premium bg-white rounded-[40px] overflow-hidden relative group">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-8 text-graphite relative z-10">
            <div>
               <div className="text-[10px] font-black text-graphite/30 uppercase mb-1">Мой прогресс</div>
               <h3 className="text-2xl font-black">{client.name}</h3>
            </div>
            <motion.div 
              animate={hasLoggedToday ? { scale: [1, 1.1, 1] } : {}}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm",
                hasLoggedToday ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-graphite/5 text-graphite/20"
              )}
            >
              <Flame size={16} className={cn(hasLoggedToday ? "fill-orange-500" : "fill-none")} />
              <span className="text-xs font-black">{hasLoggedToday ? "Огонь!" : "Ждем отчет"}</span>
            </motion.div>
          </div>

          <div className="flex justify-between items-end mb-6 text-graphite relative z-10">
            <div className="space-y-1">
               <div className="text-[10px] font-black text-graphite/30 uppercase">Текущий вес</div>
               <div className="text-4xl font-black italic">
                 {isLoading ? "..." : currentWeight}
                 <span className="text-xl text-graphite/20 ml-1">кг</span>
               </div>
            </div>
            <div className="text-right space-y-1">
               <div className="text-[10px] font-black text-primary uppercase">Цель</div>
               <div className="text-xl font-black text-primary">{targetWeight} кг</div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase text-graphite/40">
                  <span>Сброшено: {lostSoFar.toFixed(1)} кг</span>
                  <span>{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-graphite/5 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-linear-to-r from-primary to-primary-dark rounded-full shadow-[0_0_15px_rgba(123,193,67,0.4)]"
                  />
              </div>
            </div>

            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2 text-sm"
            >
              <Scale size={18} />
              Внести вес
            </Button>
          </div>
        </CardContent>
        <Target className="absolute -right-10 -bottom-10 w-48 h-48 text-graphite/3 rotate-12 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
      </Card>
    </div>
  );
}
