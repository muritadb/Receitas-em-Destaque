import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { and, eq } from "drizzle-orm";
import { db, recipesTable } from "@workspace/db";
import {
  CreateRecipeBody,
  DeleteRecipeParams,
  GetRecipeParams,
  ListRecipesQueryParams,
  UpdateRecipeBody,
  UpdateRecipeParams,
  ToggleRecipeLikeParams,
  ToggleRecipeSaveParams,
} from "@workspace/api-zod";
import { getUserId, requireUser } from "../lib/auth";
import { changeLike, changeSave, ensureUser, findRecipe, listRecipeRows, serializeRecipe } from "../lib/recipe-service";

const router: IRouter = Router();

router.get("/recipes", async (req, res): Promise<void> => {
  const parsed = ListRecipesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getUserId(req);
  if (parsed.data.mine && !userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const rows = await listRecipeRows({ ...parsed.data, userId });
  res.json(await Promise.all(rows.map((recipe) => serializeRecipe(recipe, userId))));
});

router.post("/recipes", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureUser(userId);
  const [recipe] = await db.insert(recipesTable).values({ ...parsed.data, authorId: userId }).returning();
  res.status(201).json(await serializeRecipe(recipe, userId));
});

router.get("/recipes/:id", async (req, res): Promise<void> => {
  const params = GetRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const recipe = await findRecipe(params.data.id);
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.json(await serializeRecipe(recipe, getUserId(req)));
});

router.patch("/recipes/:id", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const params = UpdateRecipeParams.safeParse(req.params);
  const parsed = UpdateRecipeBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const recipe = await findRecipe(params.data.id);
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  if (recipe.authorId !== userId) {
    res.status(403).json({ error: "Recipe ownership required" });
    return;
  }
  const [updated] = await db.update(recipesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(recipesTable.id, recipe.id)).returning();
  res.json(await serializeRecipe(updated, userId));
});

router.delete("/recipes/:id", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const params = DeleteRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const recipe = await findRecipe(params.data.id);
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  if (recipe.authorId !== userId) {
    res.status(403).json({ error: "Recipe ownership required" });
    return;
  }
  await db.delete(recipesTable).where(eq(recipesTable.id, recipe.id));
  res.sendStatus(204);
});

router.post("/recipes/:id/like", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const params = ToggleRecipeLikeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await findRecipe(params.data.id))) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.json({ active: await changeLike(params.data.id, userId) });
});

router.post("/recipes/:id/save", async (req, res): Promise<void> => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const params = ToggleRecipeSaveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await findRecipe(params.data.id))) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.json({ active: await changeSave(params.data.id, userId) });
});

export default router;