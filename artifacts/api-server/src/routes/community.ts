import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, followsTable } from "@workspace/db";
import { GetCurrentUserResponse, GetUserProfileParams, ToggleUserFollowParams } from "@workspace/api-zod";
import { requireUser, getUserId } from "../lib/auth";
import { ensureUser, findUser, serializeUser } from "../lib/recipe-service";

const router: IRouter = Router();

router.get("/me", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const user = await ensureUser(userId);
  res.json(GetCurrentUserResponse.parse(await serializeUser(user, userId)));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const user = await findUser(params.data.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(await serializeUser(user, getUserId(req)));
});

router.post("/users/:id/follow", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const params = ToggleUserFollowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (params.data.id === userId) {
    res.status(400).json({ error: "You cannot follow yourself" });
    return;
  }
  if (!(await findUser(params.data.id))) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await ensureUser(userId);
  const existing = await db.select({ followerId: followsTable.followerId }).from(followsTable).where(and(eq(followsTable.followerId, userId), eq(followsTable.followingId, params.data.id))).limit(1);
  if (existing.length > 0) {
    await db.delete(followsTable).where(and(eq(followsTable.followerId, userId), eq(followsTable.followingId, params.data.id)));
    res.json({ active: false });
    return;
  }
  await db.insert(followsTable).values({ followerId: userId, followingId: params.data.id });
  res.json({ active: true });
});

export default router;