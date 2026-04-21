import { redirect } from "next/navigation";

export default function Home() {
  // Автоматический редирект на основного эксперта
  redirect("/vadim");
}
