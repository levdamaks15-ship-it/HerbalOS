"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Scale, AlertTriangle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "weight" | "food";
  lastWeight?: number;
  onSave: (data: any) => Promise<void>;
};

export function LogModal({ isOpen, onClose, type, lastWeight, onSave }: ModalProps) {
  const [value, setValue] = useState<string>("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWeightSubmit = async () => {
    const currentWeight = parseFloat(value);
    if (!currentWeight) return;

    // Валидация веса (разница > 2кг)
    if (lastWeight && Math.abs(currentWeight - lastWeight) > 2 && !showWarning) {
      setShowWarning(true);
      return;
    }

    setLoading(true);
    try {
      await onSave({ type: "weight", value: currentWeight, timestamp: new Date().toISOString() });
      resetAndClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ 
        type: "food", 
        comment, 
        photos, 
        timestamp: new Date().toISOString() 
      });
      resetAndClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const resetAndClose = () => {
    setValue("");
    setComment("");
    setPhotos([]);
    setPreviews([]);
    setShowWarning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-graphite/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    type === "weight" ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"
                  )}>
                    {type === "weight" ? <Scale size={20} /> : <Camera size={20} />}
                  </div>
                  <h2 className="text-xl font-black">{type === "weight" ? "Взвешивание" : "Моя тарелка"}</h2>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-graphite/5 rounded-full transition-colors">
                  <X size={20} className="text-graphite/30" />
               </button>
            </div>

            {type === "weight" ? (
              <div className="space-y-6">
                <div className="relative">
                   <input 
                      type="number"
                      step="0.1"
                      autoFocus
                      className="w-full text-5xl font-black text-center py-8 outline-none placeholder:text-graphite/5"
                      placeholder="00.0"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        setShowWarning(false);
                      }}
                   />
                   <div className="text-center text-sm font-bold text-graphite/20 -mt-2">Килограмм</div>
                </div>

                {showWarning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-800"
                  >
                    <AlertTriangle size={20} className="shrink-0" />
                    <div className="text-xs font-bold leading-tight">
                       Большая разница с прошлым весом ({lastWeight} кг). Вы уверены в точности данных?
                    </div>
                  </motion.div>
                )}

                <Button 
                   className="w-full h-16 text-lg rounded-2xl"
                   disabled={!value || loading}
                   onClick={handleWeightSubmit}
                >
                  {loading ? <Loader2 className="animate-spin" /> : showWarning ? "Да, всё верно" : "Зафиксировать"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Photo Previews */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-graphite/10 flex flex-col items-center justify-center text-graphite/30 hover:border-primary/30 hover:text-primary transition-all"
                   >
                      <Plus size={24} />
                      <span className="text-[10px] font-bold uppercase mt-1">Фото</span>
                   </button>
                   {previews.map((src, i) => (
                     <div key={i} className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative group">
                        <img src={src} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          className="absolute top-1 right-1 bg-graphite/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setPreviews(prev => prev.filter((_, idx) => idx !== i));
                            setPhotos(prev => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          <X size={12} />
                        </button>
                     </div>
                   ))}
                </div>
                <input 
                   type="file" 
                   multiple 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleFileChange}
                />

                <textarea
                  className="w-full h-32 p-4 rounded-2xl bg-graphite/5 border-none outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium resize-none"
                  placeholder="Что в тарелке? (Напр: курица, рис, овощи)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <Button 
                   className="w-full h-16 text-lg rounded-2xl"
                   disabled={(photos.length === 0 && !comment) || loading}
                   onClick={handleFoodSubmit}
                >
                   {loading ? <Loader2 className="animate-spin" /> : "Поделиться едой"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
