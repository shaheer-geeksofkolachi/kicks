import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { defaultSession, sessionOptions } from "@/lib/session";
import type { SessionData } from "@/lib/types";

export async function getSession(): Promise<SessionData> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isAdmin) {
    session.isAdmin = defaultSession.isAdmin;
  }
  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isAdmin) {
    throw new Error("Unauthorized");
  }
  return session;
}
