"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Calculator, Droplets, Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  type: "select" | "multi-select" | "input";
  title: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  inputType?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "gender",
    type: "select",
    title: "Ваш пол",
    options: [
      { value: "male", label: "Мужской" },
      { value: "female", label: "Женский" },
    ],
  },
  {
    id: "age",
    type: "input",
    title: "Сколько вам полных лет?",
    placeholder: "Например, 35",
    inputType: "number",
  },
  {
    id: "height",
    type: "input",
    title: "Ваш рост (см)",
    placeholder: "Например, 175",
    inputType: "number",
  },
  {
    id: "weight",
    type: "input",
    title: "Ваш текущий вес (кг)",
    placeholder: "Например, 85",
    inputType: "number",
  },
  {
    id: "goal",
    type: "select",
    title: "С какой целью обратились?",
    options: [
      { value: "lose", label: "Снижение веса" },
      { value: "gain", label: "Набор мышечной массы" },
      { value: "energy", label: "Больше энергии и бодрости" },
      { value: "skin", label: "Улучшение качества кожи" },
    ],
  },
  {
    id: "habits",
    type: "multi-select",
    title: "Ваши пищевые привычки",
    options: [
      { value: "sweets", label: "Люблю сладкое" },
      { value: "night_eat", label: "Ем на ночь" },
      { value: "low_water", label: "Пью мало воды" },
      { value: "stress", label: "Заедаю стресс" },
    ],
  },
  {
    id: "name",
    type: "input",
    title: "Как к вам обращаться?",
    placeholder: "Ваше имя",
    inputType: "text",
  },
  {
    id: "email",
    type: "input",
    title: "Ваш e-mail для связи",
    placeholder: "example@mail.com",
    inputType: "email",
  },
];

export function Quiz({ 
  onComplete, 
  overrideTitle, 
  userName 
}: { 
  onComplete: (data: any) => void;
  overrideTitle?: string;
  userName?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);

  // Load from localStorage to not lose data
  useEffect(() => {
    const saved = localStorage.getItem("quiz_progress");
    if (saved) {
      const { step: s, answers: a } = JSON.parse(saved);
      setStep(s);
      setAnswers(a);
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (!showResult) {
      localStorage.setItem("quiz_progress", JSON.stringify({ step, answers }));
    }
  }, [step, answers, showResult]);

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
      onComplete(answers);
      localStorage.removeItem("quiz_progress");
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const updateAnswer = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const isCurrentStepValid = () => {
    const current = QUESTIONS[step];
    const answer = answers[current.id];
    if (current.type === "multi-select") return answer?.length > 0;
    return answer !== undefined && answer !== "";
  };

  // Logic for calculations
  const calculateBMI = () => {
    const w = parseFloat(answers.weight);
    const h = parseFloat(answers.height) / 100;
    return (w / (h * h)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Дефицит веса", color: "text-blue-500" };
    if (bmi < 25) return { label: "Норма", color: "text-primary" };
    if (bmi < 30) return { label: "Избыточный вес", color: "text-amber-500" };
    return { label: "Ожирение", color: "text-red-500" };
  };

  if (showResult) {
    const bmi = parseFloat(calculateBMI());
    const category = getBMICategory(bmi);
    const water = (parseFloat(answers.weight) * 0.03).toFixed(1);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h2 className="text-2xl font-black text-center mb-8">Резюме вашего профиля</h2>
        <div className="grid gap-4">
          <Card className="border-none shadow-health">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Calculator size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-graphite/30 uppercase">Ваш ИМТ</div>
                <div className="text-xl font-black flex items-center gap-2">
                  {bmi} <span className={cn("text-sm font-bold", category.color)}>{category.label}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-health">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <Droplets size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-graphite/30 uppercase">Норма воды</div>
                <div className="text-xl font-black">{water} л / день</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-health bg-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Ваш статус</span>
              </div>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                Первый шаг сделан! Ваши данные проанализированы. Выберите удобное время для звонка, чтобы получить стратегию достижения цели.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  const currentQ = QUESTIONS[step];

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-8 overflow-hidden bg-graphite/5 h-1.5 rounded-full">
         <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
         />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={step}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="space-y-8"
        >
          <h2 className="text-3xl font-black leading-tight tracking-tight text-graphite">
            {step === 0 && userName ? `Здравствуйте, ${userName}! ` : ""}
            {step === 0 && overrideTitle ? overrideTitle : currentQ.title}
          </h2>

          <div className="space-y-3">
             {currentQ.type === "select" && currentQ.options?.map((opt) => (
               <Button
                  key={opt.value}
                  variant={answers[currentQ.id] === opt.value ? "default" : "outline"}
                  className="w-full justify-start h-16 text-lg"
                  onClick={() => {
                    updateAnswer(currentQ.id, opt.value);
                    setTimeout(handleNext, 300);
                  }}
               >
                  <div className="flex-1 text-left">{opt.label}</div>
                  {answers[currentQ.id] === opt.value && <CheckCircle2 size={20} />}
               </Button>
             ))}

             {currentQ.type === "multi-select" && currentQ.options?.map((opt) => {
                const currentAnswers = answers[currentQ.id] || [];
                const isActive = currentAnswers.includes(opt.value);
                return (
                  <Button
                    key={opt.value}
                    variant={isActive ? "default" : "outline"}
                    className="w-full justify-start h-16 text-lg"
                    onClick={() => {
                      const next = isActive 
                        ? currentAnswers.filter((v: string) => v !== opt.value)
                        : [...currentAnswers, opt.value];
                      updateAnswer(currentQ.id, next);
                    }}
                  >
                    <div className="flex-1 text-left">{opt.label}</div>
                    {isActive && <CheckCircle2 size={20} />}
                  </Button>
                );
             })}

             {currentQ.type === "input" && (
                <input 
                   type={currentQ.inputType}
                   className="w-full health-card p-6 text-2xl font-black border-none focus:ring-2 focus:ring-primary/20 outline-none"
                   placeholder={currentQ.placeholder}
                   autoFocus
                   value={answers[currentQ.id] || ""}
                   onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                />
             )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-12 pt-6 border-t border-graphite/5">
         <Button variant="ghost" onClick={handlePrev} disabled={step === 0}>
            <ChevronLeft className="mr-2" /> Назад
         </Button>
         
         {currentQ.type !== "select" && (
           <Button disabled={!isCurrentStepValid()} onClick={handleNext}>
              Далее <ChevronRight className="ml-2" />
           </Button>
         )}
      </div>
    </div>
  );
}
