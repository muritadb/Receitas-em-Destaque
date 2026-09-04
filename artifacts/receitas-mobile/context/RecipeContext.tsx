import React, { createContext, useContext, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import type { ImageSourcePropType } from 'react-native';
import {
  getListRecipesQueryKey,
  useListRecipes,
  useToggleRecipeLike,
  useToggleRecipeSave,
} from '@workspace/api-client-react';
import type { Recipe as ApiRecipe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Recipe } from '@/data/recipes';

type RecipeContextValue = {
  recipes: Recipe[];
  likedIds: string[];
  savedIds: string[];
  toggleLike: (id: string) => void;
  toggleSaved: (id: string) => void;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
};

const RecipeContext = createContext<RecipeContextValue | null>(null);

const localImages: Record<string, ImageSourcePropType> = {
  'asset://recipe-pasta': require('@/assets/images/recipe-pasta.jpg'),
  'asset://recipe-bowl': require('@/assets/images/recipe-bowl.jpg'),
  'asset://recipe-cake': require('@/assets/images/recipe-cake.jpg'),
};

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function imageFor(url: string | null): ImageSourcePropType {
  if (url && localImages[url]) return localImages[url];
  if (url) return { uri: url };
  return localImages['asset://recipe-bowl'];
}

function mapRecipe(recipe: ApiRecipe): Recipe {
  return {
    id: String(recipe.id),
    title: recipe.title,
    subtitle: recipe.subtitle,
    author: recipe.author.displayName,
    initials: initialsFor(recipe.author.displayName),
    category: recipe.category,
    time: `${recipe.timeMinutes} min`,
    difficulty: recipe.difficulty,
    likes: recipe.likes,
    servings: recipe.servings,
    image: imageFor(recipe.imageUrl),
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    liked: recipe.liked,
    saved: recipe.saved,
    authorId: recipe.author.id,
  };
}

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const query = useListRecipes();
  const likeMutation = useToggleRecipeLike({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
      },
    },
  });
  const saveMutation = useToggleRecipeSave({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
      },
    },
  });

  const recipes = useMemo(() => (query.data ?? []).map(mapRecipe), [query.data]);
  const likedIds = useMemo(() => recipes.filter((recipe) => recipe.liked).map((recipe) => recipe.id), [recipes]);
  const savedIds = useMemo(() => recipes.filter((recipe) => recipe.saved).map((recipe) => recipe.id), [recipes]);

  const toggleLike = (id: string) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    likeMutation.mutate({ id: numericId });
  };

  const toggleSaved = (id: string) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveMutation.mutate({ id: numericId });
  };

  const value = useMemo(
    () => ({
      recipes,
      likedIds,
      savedIds,
      toggleLike,
      toggleSaved,
      isReady: !query.isLoading,
      isLoading: query.isLoading,
      error: query.error instanceof Error ? query.error : null,
    }),
    [recipes, likedIds, savedIds, query.isLoading, query.error],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used inside RecipeProvider');
  return context;
}