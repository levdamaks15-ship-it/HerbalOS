"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import Link from "next/link";
import { loginAction, logoutAction } from "@/lib/actions/auth";

export default function ClientLoginPage() {
  const { slug } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Сначала принудительно выходим через серверный экшен
      await logoutAction();

      const result = await loginAction(email, password);
      
      if (result.success) {
        window.location.href = `/${slug}/dashboard`;
      } else {
        setError(result.error || "Неверный email или пароль.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Неверный email или пароль. Убедитесь, что вы уже прошли Wellness Quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] flex flex-col font-outfit relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -ml-64 -mb-64" />

      {/* Header */}
      <div className="p-8 flex items-center justify-between relative z-10">
        <Link href={`/${slug}`}>
          <Button variant="ghost" size="icon" className="rounded-2xl bg-white shadow-sm w-12 h-12">
            <ChevronLeft size={24} />
          </Button>
        </Link>
        <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Личный кабинет</div>
            <div className="text-sm font-black text-graphite">Клиентский доступ</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-10"
        >
          {/* Logo & Welcome */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-white shadow-premium text-primary mb-2">
              <User size={36} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-graphite">С возвращением!</h1>
            <p className="text-graphite/40 text-sm font-medium px-10 leading-relaxed">
              Войдите, чтобы продолжить свой путь к идеальной форме вместе с наставником.
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-none shadow-premium rounded-[40px] overflow-hidden bg-white">
            <CardContent className="p-10 space-y-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-graphite/20 group-focus-within:text-primary transition-colors">
                      <User size={20} />
                    </div>
                    <Input 
                      type="email"
                      placeholder="Ваш Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-14 h-16 rounded-3xl bg-graphite/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-graphite font-bold transition-all"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-graphite/20 group-focus-within:text-primary transition-colors">
                      <Lock size={20} />
                    </div>
                    <Input 
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-14 h-16 rounded-3xl bg-graphite/5 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-graphite font-bold transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black italic"
                  >
                    {error}
                  </motion.div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 rounded-3xl bg-primary hover:bg-primary-dark text-white font-black shadow-lg shadow-primary/30 transition-all active:scale-95 text-lg flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Войти в систему
                      <ArrowRight size={22} />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <p className="text-[11px] font-black text-graphite/20 uppercase tracking-widest">
                  Еще нет анкеты? 
                  <Link href={`/${slug}/quiz`} className="text-primary ml-2 hover:underline">
                    Пройти тест
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-6 px-4">
             <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                   <CheckCircle2 size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-graphite/30">Контроль веса</span>
             </div>
             <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                   <Sparkles size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-graphite/30">Советы эксперта</span>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="p-10 text-center opacity-20 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite">Protected by Herbalife OS</p>
      </div>
    </main>
  );
}
