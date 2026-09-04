import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

export function getUserId(req: Request): string | null {
  return getAuth(req).userId ?? null;
}

export function requireUser(req: Request, res: Response): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return userId;
}