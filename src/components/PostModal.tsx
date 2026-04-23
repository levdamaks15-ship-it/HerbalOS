"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Plus,
  Edit3,
  ChevronRight,
  TrendingDown,
  Layout
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";
import { storageService } from "@/lib/appwrite/services/storage";
import { submitStoryAction, updatePostAction, DB_Post } from "@/lib/actions/posts";
import { useParams } from "next/navigation";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: DB_Post;
}

export function PostModal({ isOpen, onClose, onSuccess, initialData }: PostModalProps) {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Питание",
    type: (initialData?.type as "standard" | "result") || "standard",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    image: initialData?.image || "",
    imageBefore: initialData?.imageBefore || "",
    imageAfter: initialData?.imageAfter || "",
    stats_weight: initialData?.stats_weight || "",
    stats_waist: initialData?.stats_waist || "",
    author: initialData?.author || "Эксперт Гербалайф",
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>(() => {
    if (!initialData) return {};
    const initialPreviews: { [key: string]: string } = {};
    ["image", "imageBefore", "imageAfter"].forEach(key => {
      const val = initialData[key as keyof DB_Post];
      if (val && typeof val === 'string') {
        initialPreviews[key] = val.startsWith("http") || val.startsWith("/") 
          ? val 
          : storageService.getFilePreview(val);
      }
    });
    return initialPreviews;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);


  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (prev) => {
      setPreviews(v => ({ ...v, [field]: prev.target?.result as string }));
    };
    reader.readAsDataURL(file);

    // Upload to Appwrite
    try {
      setIsLoading(true);
      const fileId = await storageService.uploadFile(file);
      setFormData(v => ({ ...v, [field]: fileId }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Ошибка при загрузке изображения");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("Заполните заголовок и содержание");
      return;
    }

    setIsLoading(true);
    try {
      if (initialData) {
        await updatePostAction(initialData.$id, {
          ...formData,
          expert: slug as string,
        });
      } else {
        await submitStoryAction({
          ...formData,
          expert: slug as string,
          status: "published",
          isPremium: false,
          date: "Сегодня",
          likes: 0,
          comments: 0
        });
      }
      onSuccess();
      onClose();
      // Reset
      setFormData({
        title: "",
        category: "Питание",
        type: "standard",
        content: "",
        excerpt: "",
        image: "",
        imageBefore: "",
        imageAfter: "",
        stats_weight: "",
        stats_waist: "",
        author: "Эксперт Гербалайф",
      });
      setPreviews({});
      setStep(1);
    } catch (error) {
      const err = error as Error;
      console.error("Submit failed", err);
      alert("Ошибка при сохранении поста: " + (err.message || "Неизвестная ошибка"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10">
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
            className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
          {/* Header */}
          <div className="p-8 border-b border-graphite/5 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
             <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  initialData ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                )}>
                   {initialData ? <Edit3 size={24} /> : <Plus size={24} />}
                </div>
                <div>
                   <h2 className="text-2xl font-black uppercase tracking-tight">
                    {initialData ? "Редактирование" : "Новая"} <span className={cn("italic", initialData ? "text-amber-600" : "text-primary")}>{initialData ? "публикации" : "публикация"}</span>
                   </h2>
                   <p className="text-[10px] font-black text-graphite/30 uppercase">
                    {initialData ? "Изменение существующего контента" : `Шаг ${step} из 2 • ${formData.type === 'result' ? 'Результат клиента' : 'Обычный пост'}`}
                   </p>
                </div>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-full bg-graphite/5 flex items-center justify-center text-graphite/40 hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             {step === 1 ? (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Заголовок статьи</label>
                        <input 
                          type="text" 
                          placeholder="Заголовок..."
                          value={formData.title}
                          onChange={e => setFormData(v => ({ ...v, title: e.target.value }))}
                          className="w-full h-16 rounded-3xl px-8 text-lg font-black bg-graphite/2 border border-graphite/5 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Категория</label>
                        <select 
                          value={formData.category}
                          onChange={e => setFormData(v => ({ ...v, category: e.target.value }))}
                          className="w-full h-16 rounded-3xl px-8 text-md font-black bg-graphite/2 border border-graphite/5 outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                        >
                           <option>Питание</option>
                           <option>Результаты</option>
                           <option>Продукты</option>
                           <option>Психология</option>
                           <option>Марафоны</option>
                        </select>
                     </div>
                  </div>

                  {/* Post Type Selector */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Тип контента</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                           onClick={() => setFormData(v => ({ ...v, type: "standard" }))}
                           className={cn(
                             "p-8 rounded-[40px] border-2 transition-all flex flex-col items-center text-center gap-4 group relative overflow-hidden",
                             formData.type === "standard" ? "border-primary bg-primary/5" : "border-graphite/5 hover:border-primary/10"
                           )}
                         >
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", formData.type === "standard" ? "bg-primary text-white" : "bg-graphite/5 text-graphite/40 group-hover:bg-primary/10 group-hover:text-primary")}>
                               <Layout size={28} />
                            </div>
                            <div className="space-y-1">
                               <div className="font-black text-sm uppercase tracking-tight">Стандартный пост</div>
                               <div className="text-[10px] font-bold text-graphite/40 uppercase tracking-wide leading-tight">Статья, рецепт, совет эксперта</div>
                            </div>
                         </button>
                        <button 
                           onClick={() => setFormData(v => ({ ...v, type: "result" }))}
                           className={cn(
                             "p-8 rounded-[40px] border-2 transition-all flex flex-col items-center text-center gap-4 group relative overflow-hidden",
                             formData.type === "result" ? "border-primary bg-primary/5" : "border-graphite/5 hover:border-primary/10"
                           )}
                         >
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", formData.type === "result" ? "bg-primary text-white" : "bg-graphite/5 text-graphite/40 group-hover:bg-primary/10 group-hover:text-primary")}>
                               <TrendingDown size={28} />
                            </div>
                            <div className="space-y-1">
                               <div className="font-black text-sm uppercase tracking-tight">Результат клиента</div>
                               <div className="text-[10px] font-bold text-graphite/40 uppercase tracking-wide leading-tight">История успеха и трансформация</div>
                            </div>
                         </button>
                     </div>
                  </div>

                  {/* Main Cover Image */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Обложка поста</label>
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                           "relative h-64 rounded-[40px] border-2 border-dashed border-graphite/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-graphite/2 hover:border-primary/30 transition-all overflow-hidden group",
                           previews.image && "border-none"
                        )}
                     >
                        {previews.image ? (
                           <>
                              <Image 
                                src={previews.image} 
                                fill
                                className="absolute inset-0 object-cover transition-transform group-hover:scale-105 duration-700" 
                                alt="Cover" 
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                    <Upload size={24} />
                                 </div>
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="w-16 h-16 bg-graphite/5 rounded-3xl flex items-center justify-center text-graphite/20">
                                 <ImageIcon size={32} />
                              </div>
                              <div className="text-center">
                                 <div className="font-black text-sm uppercase">Загрузить фото</div>
                                 <div className="text-[10px] font-bold text-graphite/30 uppercase mt-1">PNG, JPG до 10MB</div>
                              </div>
                           </>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'image')} />
                     </div>
                  </div>

                  {/* Result Specific Fields */}
                  {formData.type === "result" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Фото ДО</label>
                          <div 
                             onClick={() => beforeInputRef.current?.click()}
                             className="h-48 rounded-3xl border-2 border-dashed border-graphite/10 flex items-center justify-center cursor-pointer hover:bg-graphite/2 transition-all overflow-hidden relative"
                          >
                             {previews.imageBefore ? (
                               <Image src={previews.imageBefore} fill className="object-cover" alt="Before progress" unoptimized />
                             ) : (
                               <Plus className="text-graphite/20" />
                             )}
                             <input ref={beforeInputRef} type="file" className="hidden" onChange={e => handleFileChange(e, 'imageBefore')} />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Фото ПОСЛЕ</label>
                          <div 
                             onClick={() => afterInputRef.current?.click()}
                             className="h-48 rounded-3xl border-2 border-dashed border-graphite/10 flex items-center justify-center cursor-pointer hover:bg-graphite/2 transition-all overflow-hidden relative"
                          >
                             {previews.imageAfter ? (
                               <Image src={previews.imageAfter} fill className="object-cover" alt="After progress" unoptimized />
                             ) : (
                               <Plus className="text-graphite/20" />
                             )}
                             <input ref={afterInputRef} type="file" className="hidden" onChange={e => handleFileChange(e, 'imageAfter')} />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Вес (результат)</label>
                          <input 
                            type="text" 
                            placeholder="-15 кг"
                            value={formData.stats_weight}
                            onChange={e => setFormData(v => ({ ...v, stats_weight: e.target.value }))}
                            className="w-full h-14 rounded-2xl px-6 font-bold bg-graphite/2 border border-graphite/5 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Объемы (результат)</label>
                          <input 
                            type="text" 
                            placeholder="-20 см в талии"
                            value={formData.stats_waist}
                            onChange={e => setFormData(v => ({ ...v, stats_waist: e.target.value }))}
                            className="w-full h-14 rounded-2xl px-6 font-bold bg-graphite/2 border border-graphite/5 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                       </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                  <label className="text-[10px] font-black uppercase text-graphite/30 ml-2">Текст публикации</label>
                  <RichTextEditor 
                     content={formData.content} 
                     onChange={content => setFormData(v => ({ ...v, content }))}
                     placeholder="Расскажите историю успеха или поделитесь полезным советом..."
                  />
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-start gap-4">
                     <AlertCircle className="text-primary shrink-0" size={20} />
                     <p className="text-[10px] font-bold text-graphite/60 uppercase leading-relaxed">
                        Совет: используйте заголовки и списки для лучшей читаемости. Короткие абзацы удерживают внимание пользователя дольше.
                     </p>
                  </div>
               </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-graphite/5 bg-white flex items-center justify-between shrink-0 z-10 sticky bottom-0">
             {step === 1 ? (
                <>
                   <div className="hidden sm:block text-[10px] font-black text-graphite/20 uppercase">
                      Все данные сохраняются автоматически
                   </div>
                   <Button 
                     onClick={() => setStep(2)}
                     disabled={!formData.title}
                     className="h-16 px-10 rounded-3xl font-black gap-3 text-md shadow-xl shadow-primary/20"
                   >
                      Далее <ChevronRight size={20} />
                   </Button>
                </>
             ) : (
                <>
                   <Button 
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="h-16 px-8 rounded-3xl font-black text-graphite/40 hover:text-graphite hover:bg-graphite/5"
                   >
                      Назад
                   </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading || !formData.content}
                      className={cn(
                        "h-16 px-12 rounded-3xl font-black gap-3 text-md shadow-xl transition-all",
                        initialData 
                          ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" 
                          : "bg-primary hover:bg-primary-dark shadow-primary/20"
                      )}
                    >
                       {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                       {isLoading ? (initialData ? "Сохранение..." : "Публикация...") : (initialData ? "Сохранить изменения" : "Опубликовать")}
                    </Button>
                </>
             )}
          </div>
        </motion.div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EAEAEA;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D5FF3F;
        }
       `}</style>
        </>
       )}
    </AnimatePresence>
  );
}
