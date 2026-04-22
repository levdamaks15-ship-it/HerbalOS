"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Newspaper, 
  Target, 
  ArrowUpRight,
  Lock,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HubCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  variant?: "primary" | "dark" | "glass";
  isLocked?: boolean;
  onClick?: () => void;
  className?: string;
}

const HubCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  badge, 
  variant = "glass", 
  isLocked,
  onClick,
  className 
}: HubCardProps) => {
  const CardWrapper = isLocked ? "div" : Link;

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative p-6 rounded-[32px] overflow-hidden group cursor-pointer transition-all duration-500",
        variant === "glass" && "glass-card",
        variant === "primary" && "bg-primary text-white shadow-lg shadow-primary/20",
        variant === "dark" && "bg-graphite text-white shadow-2xl",
        isLocked && "opacity-80 grayscale-[0.5] cursor-not-allowed",
        className
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      <CardWrapper href={href} className="block h-full">
        {/* Gradient Overlay for primary/dark */}
        {(variant === "primary" || variant === "dark") && (
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-50" />
        )}

        {/* Badge */}
        {badge && (
          <div className={cn(
            "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase  z-10",
            variant === "glass" ? "bg-primary/10 text-primary" : "bg-white/20 text-white"
          )}>
            {badge}
          </div>
        )}

        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110",
          variant === "glass" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-graphite shadow-xl"
        )}>
          {isLocked ? <Lock size={20} /> : <Icon size={24} />}
        </div>

        {/* Text content */}
        <div className="relative z-10 space-y-3">
          <h3 className={cn(
            "text-2xl font-black  leading-tight group-hover:text-primary transition-colors",
            (variant === "primary" || variant === "dark") && "group-hover:text-white"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-base font-medium leading-relaxed",
            variant === "glass" ? "text-graphite/60" : "text-white/80"
          )}>
            {description}
          </p>
        </div>

        {/* Footer/Link */}
        <div className="mt-8 flex items-center justify-between relative z-10">
          <div className={cn(
            "text-[10px] font-black uppercase  flex items-center gap-2",
            variant === "glass" ? "text-primary" : "text-white"
          )}>
            {isLocked ? "Доступ ограничен" : "Открыть"} 
            {!isLocked && <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          </div>
          
          {variant === "glass" && (
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/5 to-transparent flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight size={16} />
            </div>
          )}
        </div>
      </CardWrapper>

      {/* Decorative pulse for important cards */}
      {title === "Smart Quiz Funnel" && (
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse-subtle" />
      )}
    </motion.div>
  );
};

export function EcosystemHub({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col gap-6 px-6 mb-12">
      {/* Media Hub */}
      <HubCard 
        title="Медиа-канал эксперта"
        description="Эксклюзивная лента контента, профессиональные статьи и реальные истории трансформации ваших тел под моим руководством."
        icon={Newspaper}
        href={`/${slug}/media`}
        badge="Свежее"
      />

      {/* Wellness-тест */}
      <HubCard 
        title="Wellness-тест"
        description="Пройдите профессиональное тестирование: расчет ИМТ и персональный анализ ключевых параметров вашего тела за 2 минуты."
        icon={Target}
        href={`/${slug}/quiz`}
        badge="Бесплатно"
        variant="primary"
      />

      {/* Library/Knowledge Base */}
      <HubCard 
        title="Библиотека эксперта"
        description="Более 50 эксклюзивных видео-уроков, авторских гайдов по питанию и архива рецептов для быстрого достижения результата."
        icon={BookOpen}
        href="#"
        badge="Обучение"
      />
    </div>
  );
}
