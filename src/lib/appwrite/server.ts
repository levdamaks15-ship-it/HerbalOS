import { Client, Account, Databases, Storage } from "node-appwrite";

export async function createSessionClient() {
  const { cookies } = await import("next/headers");
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

  const session = (await cookies()).get("appwrite-session");
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!apiKey || !projectId) {
    console.error("❌ CRITICAL: Missing APPWRITE_API_KEY or PROJECT_ID in environment variables!");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId!)
    .setKey(apiKey!);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}
