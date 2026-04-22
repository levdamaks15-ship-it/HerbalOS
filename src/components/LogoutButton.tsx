"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function LogoutButton({ slug }: { slug: string }) {
  const { logout } = useAuth();

  return (
    <Button 
      onClick={logout} 
      variant="ghost" 
      size="icon" 
      className="rounded-xl bg-red-50 text-red-500 hover:bg-red-100 h-10 w-10 transition-colors"
    >
      <LogOut size={18} />
    </Button>
  );
}
