import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  category: text("category").notNull(),
  timeMinutes: integer("time_minutes").notNull(),
  difficulty: text("difficulty").notNull(),
  servings: text("servings").notNull(),
  ingredients: text("ingredients").array().notNull().default(sql`ARRAY[]::text[]`),
  steps: text("steps").array().notNull().default(sql`ARRAY[]::text[]`),
  imageUrl: text("image_url"),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const recipeLikesTable = pgTable(
  "recipe_likes",
  {
    recipeId: integer("recipe_id").notNull().references(() => recipesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.userId] })],
);

export const recipeSavesTable = pgTable(
  "recipe_saves",
  {
    recipeId: integer("recipe_id").notNull().references(() => recipesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.userId] })],
);

export const followsTable = pgTable(
  "follows",
  {
    followerId: text("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    followingId: text("following_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followingId] })],
);

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({
  id: true,
  authorId: true,
  likesCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;
export type RecipeLike = typeof recipeLikesTable.$inferSelect;
export type RecipeSave = typeof recipeSavesTable.$inferSelect;
export type Follow = typeof followsTable.$inferSelect;