"use server";
 
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
 
export interface DB_Post {
  $id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
  isPremium: boolean;
  type: "standard" | "result";
  image?: string;
  imageBefore?: string;
  imageAfter?: string;
  stats_weight?: string;
  stats_waist?: string;
  expert: string;
  status: "published" | "pending";
  client_id?: string;
  products?: string[];
}
 
export async function getPosts(expertSlug: string, includePending = false) {
  try {
    const { databases } = await createAdminClient();
    const queries = [
      Query.equal("expert", expertSlug),
      Query.orderDesc("$createdAt")
    ];
 
    if (!includePending) {
      queries.push(Query.equal("status", "published"));
    }
 
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.timeline,
      queries
    );
 
    return JSON.parse(JSON.stringify(response.documents)) as DB_Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
 
export async function submitStoryAction(data: Omit<DB_Post, "$id" | "likes" | "comments" | "date" | "status">) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.timeline,
      "unique()",
      {
        ...data,
        status: "pending",
        likes: 0,
        comments: 0,
        date: "Будет опубликовано",
        isPremium: false,
      }
    );
 
    // Уведомление эксперта о новой истории
    const { telegramService } = await import("@/lib/telegram/service");
    await telegramService.sendStoryModerationNotification({
      clientName: data.author,
      title: data.title,
      stats_weight: data.stats_weight,
      stats_waist: data.stats_waist
    }, data.expert);
 
    return response as unknown as DB_Post;
  } catch (error) {
    console.error("Error submitting story:", error);
    throw error;
  }
}
 
export async function approvePostAction(postId: string, data: Partial<DB_Post>) {
  try {
    const { databases } = await createAdminClient();
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !key.startsWith('$') && !['likes', 'comments'].includes(key))
    );
 
    const response = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.timeline,
      postId,
      {
        ...updateData,
        status: "published",
        date: "Сегодня",
      }
    );
    return response as unknown as DB_Post;
  } catch (error) {
    console.error("Error approving post:", error);
    throw error;
  }
}
 
export async function deletePostAction(postId: string) {
  try {
    const { databases } = await createAdminClient();
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.timeline,
      postId
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
