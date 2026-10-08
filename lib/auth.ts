import { getIronSession, webCookies } from "iron-session";
import { cookies } from "next/headers";
import { defaultSession, sessionOptions } from "@/lib/session";
import type { SessionData } from "@/lib/types";

async function readSession(request?: Request) {
  if (request) {
    return getIronSession<SessionData>(webCookies(request, new Headers()), sessionOptions);
  }
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getSession(request?: Request): Promise<SessionData> {
  const session = await readSession(request);
  const data: SessionData = {
    isAdmin: session.isAdmin === true,
  };
  return data;
}

export async function requireAdmin(request: Request): Promise<SessionData> {
  const session = await getSession(request);
  if (!session.isAdmin) {
    throw new Error("Unauthorized");
  }
  return session;
}

export { defaultSession };
