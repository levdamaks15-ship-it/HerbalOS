"use client";

import { Quiz } from "@/components/Quiz";
import { Scheduler } from "@/components/Scheduler";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const WORD_MAP: Record<string, string> = {
  cocktail: "Отлично! Давайте подберем ваш идеальный рацион и норму белка",
  collagen: "Готовы улучшить качество кожи и волос?",
  energy: "Хотите узнать, как просыпаться бодрым каждый день?",
};

import { onQuizCompleteAction } from "@/lib/actions/quiz";

interface QuizData {
  name?: string;
  email?: string;
  weight?: string;
  height?: string;
  goal?: string;
}

function QuizContent() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const [completed, setCompleted] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const word = searchParams.get("word");
  const name = searchParams.get("name");
  const overrideTitle = word ? WORD_MAP[word] : undefined;

  const expertName = "Эксперт Гербалайф";

  const handleComplete = async (data: QuizData) => {
    setQuizData(data);
    setCompleted(true);
  };

  const handleScheduleConfirm = async (date: string, time: string, password?: string) => {
    const w = parseFloat(quizData?.weight || "0");
    const h = parseFloat(quizData?.height || "1") / 100;
    const bmi = (w / (h * h)).toFixed(1);
    const water = (w * 0.03).toFixed(1);
    const finalName = quizData?.name || name || "Не указано";
    const email = quizData?.email || `${finalName.toLowerCase().replace(/\s+/g, '')}${Date.now()}@herbal.os`;

    const chatId = searchParams.get("chat_id");
    
    const result = await onQuizCompleteAction({
      name: finalName,
      email: email,
      weight: quizData?.weight || "0",
      height: quizData?.height || "0",
      goal: quizData?.goal || "Не указана",
      bmi,
      water,
      scheduledTime: `${date}, ${time}`,
      password: password,
      telegram_chat_id: chatId || undefined
    }, slug as string);

    if (result.success && password) {
      try {
        // Автоматически логиним клиента через Server Action (куки)
        const { loginAction } = await import("@/lib/actions/auth");
        await loginAction(email, password);
        
        // Редирект в личный кабинет
        window.location.href = `/${slug}/dashboard`;
      } catch (err) {
        console.error("Auto-login failed:", err);
        window.location.href = `/${slug}/login`;
      }
    } else {
      window.location.href = `/${slug}/login`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 px-2">
           <Link href={`/${slug}`}>
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-graphite/5 hover:bg-primary/5 transition-all group">
                <ChevronLeft size={16} className="text-graphite/40 group-hover:text-primary transition-colors" />
                <div className="flex items-center gap-2 font-black text-[10px] tracking-widest text-primary uppercase">
                   <ShieldCheck size={14} /> Herbal OS
                </div>
              </div>
           </Link>
           {!completed && (
             <div className="text-[10px] font-black text-graphite/40 uppercase tracking-[0.3em]">
                Wellness-тест организма
             </div>
           )}
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="px-2"
        >
          <Quiz 
            onComplete={handleComplete} 
            overrideTitle={overrideTitle}
            userName={name || undefined}
          />
        </motion.div>

        {completed && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 space-y-10"
          >
            <div className="text-center space-y-2">
               <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Финальный шаг</div>
               <h2 className="text-3xl font-black tracking-tight">Забронируйте время разбора</h2>
               <p className="text-sm font-medium text-graphite/40 max-w-sm mx-auto italic">Выберите удобное время для короткого созвона с экспертом для расшифровки ваших данных</p>
            </div>
            
            <div className="glass-card p-2 rounded-[40px] shadow-premium">
               <Scheduler expertName={expertName} onConfirm={handleScheduleConfirm} />
            </div>

            <div className="flex flex-col items-center gap-6 pt-12">
               <div className="flex items-center gap-3 text-[10px] font-black text-graphite/20 uppercase tracking-[0.2em] bg-graphite/5 px-6 py-3 rounded-full">
                  <ShieldCheck size={14} /> Данные переданы по защищенному протоколу
               </div>
               <p className="text-[10px] font-bold text-graphite/10 uppercase tracking-widest">© 2026 Healthy Network Ecosystem</p>
            </div>
          </motion.div>
        )}
      </div>
  );
}

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] p-6 pb-20 font-outfit">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="text-[10px] font-black text-graphite/20 uppercase tracking-widest">Анализируем данные...</div>
           </div>
        </div>
      }>
        <QuizContent />
      </Suspense>
    </main>
  );
}

