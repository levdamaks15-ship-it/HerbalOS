"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { storageService } from "@/lib/appwrite/services/storage";
import { submitStoryAction } from "@/lib/actions/posts";

interface StorySubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  expertSlug: string;
  clientId: string;
}

export function StorySubmission({ isOpen, onClose, expertSlug, clientId }: StorySubmissionProps) {
  const [step, setStep] = useState(1);
  const [imageBefore, setImageBefore] = useState<File | null>(null);
  const [imageAfter, setImageAfter] = useState<File | null>(null);
  const [previewBefore, setPreviewBefore] = useState<string | null>(null);
  const [previewAfter, setPreviewAfter] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [statsWeight, setStatsWeight] = useState("");
  const [statsWaist, setStatsWaist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputBefore = useRef<HTMLInputElement>(null);
  const fileInputAfter = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "before") {
        setImageBefore(file);
        setPreviewBefore(reader.result as string);
      } else {
        setImageAfter(file);
        setPreviewAfter(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageBefore || !imageAfter || !title || !story) return;

    setIsSubmitting(true);
    try {
      // 1. Upload images
      const idBefore = await storageService.uploadFile(imageBefore);
      const idAfter = await storageService.uploadFile(imageAfter);

      const urlBefore = storageService.getFilePreview(idBefore);
      const urlAfter = storageService.getFilePreview(idAfter);

      // 2. Submit story
      await submitStoryAction({
        title,
        excerpt: story,
        imageBefore: urlBefore,
        imageAfter: urlAfter,
        stats_weight: statsWeight,
        stats_waist: statsWaist,
        expert: expertSlug,
        client_id: clientId,
        category: "Результаты",
        type: "result",
        author: "Client",
        isPremium: false,
      });

      alert("Ваша история отправлена наставнику! Она появится в ленте после проверки.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Ошибка при отправке истории. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-graphite/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-8 flex items-center justify-between border-b border-graphite/5">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Поделиться успехом</h2>
                    <p className="text-[10px] font-black text-graphite/30 uppercase mt-0.5">Шаг {step} из 2</p>
                  </div>
               </div>
               <button onClick={onClose} className="w-10 h-10 rounded-full bg-graphite/5 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {step === 1 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => fileInputBefore.current?.click()}
                      className="aspect-square rounded-[32px] border-2 border-dashed border-graphite/10 bg-graphite/2 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden group"
                    >
                      {previewBefore ? (
                        <div className="relative w-full h-full">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={previewBefore} className="w-full h-full object-cover" alt="Before" />
                           <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase">До</div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-graphite/20 group-hover:text-primary transition-colors">
                            <ImagePlus size={24} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-graphite/30">Фото ДО</span>
                        </>
                      )}
                      <input type="file" ref={fileInputBefore} hidden accept="image/*" onChange={(e) => handleImageChange(e, "before")} />
                    </div>

                    <div 
                      onClick={() => fileInputAfter.current?.click()}
                      className="aspect-square rounded-[32px] border-2 border-dashed border-graphite/10 bg-graphite/2 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden group"
                    >
                      {previewAfter ? (
                        <div className="relative w-full h-full">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={previewAfter} className="w-full h-full object-cover" alt="After" />
                           <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase">После</div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-graphite/20 group-hover:text-primary transition-colors">
                            <ImagePlus size={24} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-graphite/30">Фото ПОСЛЕ</span>
                        </>
                      )}
                      <input type="file" ref={fileInputAfter} hidden accept="image/*" onChange={(e) => handleImageChange(e, "after")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-graphite/30 ml-4">Сброс веса (кг)</label>
                       <input 
                         type="text" 
                         placeholder="-12.4 кг" 
                         className="w-full h-14 rounded-2xl bg-graphite/5 px-6 font-bold outline-none border border-transparent focus:border-primary/20 transition-all"
                         value={statsWeight}
                         onChange={(e) => setStatsWeight(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-graphite/30 ml-4">Ушло объемов (см)</label>
                       <input 
                         type="text" 
                         placeholder="-15 см" 
                         className="w-full h-14 rounded-2xl bg-graphite/5 px-6 font-bold outline-none border border-transparent focus:border-primary/20 transition-all"
                         value={statsWaist}
                         onChange={(e) => setStatsWaist(e.target.value)}
                       />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-graphite/30 ml-4">Заголовок истории</label>
                      <input 
                        type="text" 
                        placeholder="Мой путь к здоровью" 
                        className="w-full h-14 rounded-2xl bg-graphite/5 px-6 font-bold outline-none border border-transparent focus:border-primary/20 transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-graphite/30 ml-4">Как это было? (Текст истории)</label>
                      <textarea 
                        placeholder="Опишите свои ощущения, трудности и радости..." 
                        className="w-full h-40 rounded-[32px] bg-graphite/5 p-8 font-medium outline-none border border-transparent focus:border-primary/20 transition-all resize-none leading-relaxed"
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                      />
                   </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-graphite/5 flex gap-4">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1 h-16 rounded-3xl font-black uppercase tracking-widest border-graphite/10"
                >
                  Назад
                </Button>
              )}
              <Button 
                disabled={isSubmitting || (step === 1 && (!previewBefore || !previewAfter)) || (step === 2 && (!title || !story))}
                onClick={() => step === 1 ? setStep(2) : handleSubmit()}
                className="flex-2 h-16 rounded-3xl font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
              >
                {isSubmitting ? (
                  <>Отправка... <Loader2 className="animate-spin" size={20} /></>
                ) : step === 1 ? (
                  <>Далее <Send size={20} /></>
                ) : (
                  <>Опубликовать <Sparkles size={20} /></>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
