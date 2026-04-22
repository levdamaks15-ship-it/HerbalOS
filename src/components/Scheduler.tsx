"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2, MessageCircle, AlertCircle, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SchedulerProps = {
  expertName: string;
  onConfirm: (date: string, time: string, password?: string) => void;
};

export function Scheduler({ expertName, onConfirm }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Генерируем дефицит (от 2 до 5)
  const spots = useMemo(() => Math.floor(Math.random() * (5 - 2 + 1)) + 2, []);

  // Генерируем даты на 7 дней вперед
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  // Генерируем временные слоты
  const timeSlots = ["10:00", "11:30", "14:00", "16:30", "18:00", "19:30"];

  const handleConfirm = () => {
    if (selectedDate && selectedTime && agreed && password.length >= 8) {
      const formattedDate = selectedDate.toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' });
      onConfirm(formattedDate, selectedTime, password);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Дефицит */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-800"
      >
        <AlertCircle size={20} className="shrink-0" />
        <p className="text-xs font-bold leading-tight">
          На этой неделе {expertName} берет только 5 новых человек на разбор. <span className="underline">Осталось мест: {spots}</span>
        </p>
      </motion.div>

      {/* Выбор даты */}
      <div>
        <div className="text-[10px] font-bold text-graphite/30 uppercase tracking-[0.2em] mb-4 px-2">1. Выберите дату</div>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {dates.map((date, i) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95",
                  isSelected 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white border-graphite/5 hover:border-primary/30"
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase tracking-tighter opacity-60", isSelected && "opacity-100")}>
                  {date.toLocaleDateString("ru-RU", { weekday: 'short' })}
                </span>
                <span className="text-lg font-black">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Выбор времени */}
      <motion.div 
        animate={{ opacity: selectedDate ? 1 : 0.3 }}
        className={cn(!selectedDate && "pointer-events-none")}
      >
        <div className="text-[10px] font-bold text-graphite/30 uppercase tracking-[0.2em] mb-4 px-2">2. Выберите время</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeSlots.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95",
                  isSelected 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white border-graphite/5 hover:border-primary/30"
                )}
              >
                <Clock size={16} className={cn(isSelected ? "text-white" : "text-primary")} />
                <span className="font-bold">{time}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Выбор пароля */}
      <motion.div 
        animate={{ opacity: selectedTime ? 1 : 0.3 }}
        className={cn(!selectedTime && "pointer-events-none")}
      >
        <div className="text-[10px] font-bold text-graphite/30 uppercase tracking-[0.2em] mb-4 px-2">3. Личный кабинет</div>
        <div className="glass-card p-6 rounded-[32px] space-y-4 border-primary/10">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Sparkles size={20} className="animate-pulse" />
            <p className="text-sm font-black italic">Создайте свой ключ к переменам</p>
          </div>
          <p className="text-[11px] text-graphite/40 leading-relaxed">
            Придумайте пароль (минимум 8 символов). Он станет вашим ключом к личному кабинету, где мы будем вместе следить за каждым вашим успехом.
          </p>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-graphite/20 group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type="password"
              placeholder="Придумайте пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 h-14 rounded-2xl bg-graphite/5 border-none focus:ring-2 focus:ring-primary/20 outline-none font-bold text-graphite placeholder:text-graphite/20 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Обязательства и Кнопка */}
      <Card className="border-none shadow-health bg-white overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-1">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20 accent-primary" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
            </div>
            <span className="text-sm text-graphite/60 leading-snug group-hover:text-graphite transition-colors">
              Я готов(а) выделить 30 минут без отвлечений на созвон, чтобы детально разобрать свое питание.
            </span>
          </label>

          <Button 
            className="w-full h-16 text-lg shadow-xl shadow-primary/20"
            disabled={!selectedDate || !selectedTime || !agreed || password.length < 8}
            onClick={handleConfirm}
          >
            Подтвердить и создать кабинет <MessageCircle className="ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
