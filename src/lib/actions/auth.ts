"use server";

import { authService } from "@/lib/appwrite/services/auth";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { cookies } from "next/headers";

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    
    console.log("DEBUG: getCurrentUserAction - session cookie exists:", !!session);
    
    if (!session?.value) return null;

    const { account } = await createSessionClient();
    const user = await account.get();
    
    console.log("DEBUG: getCurrentUserAction - user found:", user.name);
    return user;
  } catch (error: any) {
    console.log("DEBUG: getCurrentUserAction - error:", error.message);
    return null;
  }
}

export async function loginAction(email: string, pass: string) {
  try {
    const { account } = await createAdminClient();
    
    // Создаем сессию на сервере
    const session = await account.createEmailPasswordSession(email, pass);

    // Сохраняем сессию в защищенную куку
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  } catch (error: any) {
    console.error("loginAction error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function logoutAction() {
  (await cookies()).delete("appwrite-session");
}
