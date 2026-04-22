"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { cookies } from "next/headers";

export async function loginAction(email: string, pass: string) {
  try {
    const { account } = await createAdminClient();
    
    // Создаем сессию на сервере
    const session = await account.createEmailPasswordSession(email, pass);

    // Сохраняем сессию в защищенную куку
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
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
