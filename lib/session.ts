import type { SessionOptions } from "iron-session";
import type { SessionData } from "@/lib/types";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "",
  cookieName: "kicksplosion_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export const defaultSession: SessionData = {
  isAdmin: false,
};
