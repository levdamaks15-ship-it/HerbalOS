"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Gift, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTWA } from "./TWAProvider";

interface FloatingTelegramProps {
  className?: string;
}

export const FloatingTelegram = ({ className }: FloatingTelegramProps) => {
  const { user } = useTWA();
  const [isVisible, setIsVisible] = React.useState(false);
  const botUsername = "hnexpert_bot"; 
  const startParam = user?.id ? `client_${user.id}` : "";
  const botLink = `https://t.me/${botUsername}${startParam ? `?start=${startParam}` : ""}`;

  React.useEffect(() => {
    // Check if dismissed previously
    const isDismissed = localStorage.getItem("telegram_gift_dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000); // Delay appearance
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem("telegram_gift_dismissed", "true");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={cn("fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3", className)}
      >
        {/* Animated Lead Magnet Tooltip */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: [0, -5, 0] }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{ 
                opacity: { duration: 0.2 },
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
              }}
              className="bg-white px-5 py-3 rounded-[24px] shadow-2xl border border-primary/10 flex items-center gap-3 whitespace-nowrap mb-1 relative group"
            >
               <button 
                 onClick={handleDismiss}
                 className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-graphite/5 rounded-full flex items-center justify-center text-graphite/40 hover:text-graphite transition-colors shadow-sm"
               >
                 <Plus size={14} className="rotate-45" />
               </button>

               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Gift size={16} />
               </div>
               <div className="flex flex-col pr-2">
                  <span className="text-[10px] font-black uppercase text-graphite/40 leading-none mb-1">Ваш подарок</span>
                  <span className="text-sm font-black text-graphite tracking-tight">Забрать PDF-план</span>
               </div>
               <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.a
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          href={botLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-[#26A5E4] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#26A5E4]/40 border-4 border-white relative group"
        >
          <Send size={28} className="fill-current -translate-x-0.5 translate-y-0.5" />
          
          {/* Pulsing indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
};
