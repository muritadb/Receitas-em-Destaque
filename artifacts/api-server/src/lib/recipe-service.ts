import {
  db,
  followsTable,
  recipeLikesTable,
  recipeSavesTable,
  recipesTable,
  usersTable,
} from "@workspace/db";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Recipe, User } from "@workspace/db";

export async function ensureUser(userId: string): Promise<User> {
  await db.insert(usersTable).values({ id: userId, username: userId }).onConflictDoNothing({ target: usersTable.id });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) throw new Error("Unable to create user profile");
  return user;
}

async function authorProfile(authorId: string, viewerId: string | null) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authorId)).limit(1);
  const [{ followers }] = await db.select({ followers: count() }).from(followsTable).where(eq(followsTable.followingId, authorId));
  const isFollowing = viewerId
    ? Boolean((await db.select({ followerId: followsTable.followerId }).from(followsTable).where(and(eq(followsTable.followerId, viewerId), eq(followsTable.followingId, authorId))).limit(1))[0])
    : false;
  return {
    id: authorId,
    displayName: user?.displayName ?? "Cozinheiro(a) Pitada",
    username: user?.username ?? authorId,
    avatarUrl: user?.avatarUrl ?? null,
    bio: user?.bio ?? "",
    followersCount: Number(followers),
    isFollowing,
  };
}

export async function serializeRecipe(recipe: Recipe, viewerId: string | null) {
  const [liked, saved, author] = await Promise.all([
    viewerId ? db.select({ recipeId: recipeLikesTable.recipeId }).from(recipeLikesTable).where(and(eq(recipeLikesTable.recipeId, recipe.id), eq(recipeLikesTable.userId, viewerId))).limit(1) : [],
    viewerId ? db.select({ recipeId: recipeSavesTable.recipeId }).from(recipeSavesTable).where(and(eq(recipeSavesTable.recipeId, recipe.id), eq(recipeSavesTable.userId, viewerId))).limit(1) : [],
    authorProfile(recipe.authorId, viewerId),
  ]);
  return {
    id: recipe.id,
    title: recipe.title,
    subtitle: recipe.subtitle,
    category: recipe.category,
    timeMinutes: recipe.timeMinutes,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    likes: recipe.likesCount,
    liked: liked.length > 0,
    saved: saved.length > 0,
    imageUrl: recipe.imageUrl,
    author,
    createdAt: recipe.createdAt,
  };
}

export async function listRecipeRows(filters: { search?: string; category?: string; mine?: boolean; userId?: string | null }) {
  const conditions = [];
  if (filters.category && filters.category !== "Todas" && filters.category !== "Mais curtidas") {
    conditions.push(eq(recipesTable.category, filters.category));
  }
  if (filters.search) {
    conditions.push(or(ilike(recipesTable.title, `%${filters.search}%`), ilike(recipesTable.subtitle, `%${filters.search}%`), ilike(recipesTable.category, `%${filters.search}%`)));
  }
  if (filters.mine && filters.userId) conditions.push(eq(recipesTable.authorId, filters.userId));
  return db.select().from(recipesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(filters.category === "Mais curtidas" ? desc(recipesTable.likesCount) : desc(recipesTable.createdAt));
}

export async function findRecipe(id: number) {
  const [recipe] = await db.select().from(recipesTable).where(eq(recipesTable.id, id)).limit(1);
  return recipe;
}

export async function findUser(id: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return user;
}

export async function serializeUser(user: User, viewerId: string | null) {
  const [[{ followers }], [{ following }], [{ recipes }]] = await Promise.all([
    db.select({ followers: count() }).from(followsTable).where(eq(followsTable.followingId, user.id)),
    db.select({ following: count() }).from(followsTable).where(eq(followsTable.followerId, user.id)),
    db.select({ recipes: count() }).from(recipesTable).where(eq(recipesTable.authorId, user.id)),
  ]);
  const isFollowing = viewerId
    ? Boolean((await db.select({ followerId: followsTable.followerId }).from(followsTable).where(and(eq(followsTable.followerId, viewerId), eq(followsTable.followingId, user.id))).limit(1))[0])
    : false;
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followersCount: Number(followers),
    followingCount: Number(following),
    recipesCount: Number(recipes),
    isFollowing,
  };
}

export async function changeLike(recipeId: number, userId: string) {
  await ensureUser(userId);
  const existing = await db.select({ recipeId: recipeLikesTable.recipeId }).from(recipeLikesTable).where(and(eq(recipeLikesTable.recipeId, recipeId), eq(recipeLikesTable.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(recipeLikesTable).where(and(eq(recipeLikesTable.recipeId, recipeId), eq(recipeLikesTable.userId, userId)));
    await db.update(recipesTable).set({ likesCount: sql`${recipesTable.likesCount} - 1` }).where(eq(recipesTable.id, recipeId));
    return false;
  }
  await db.insert(recipeLikesTable).values({ recipeId, userId });
  await db.update(recipesTable).set({ likesCount: sql`${recipesTable.likesCount} + 1` }).where(eq(recipesTable.id, recipeId));
  return true;
}

export async function changeSave(recipeId: number, userId: string) {
  await ensureUser(userId);
  const existing = await db.select({ recipeId: recipeSavesTable.recipeId }).from(recipeSavesTable).where(and(eq(recipeSavesTable.recipeId, recipeId), eq(recipeSavesTable.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(recipeSavesTable).where(and(eq(recipeSavesTable.recipeId, recipeId), eq(recipeSavesTable.userId, userId)));
    return false;
  }
  await db.insert(recipeSavesTable).values({ recipeId, userId });
  return true;
}