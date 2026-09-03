import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';

type RecipeContextValue = {
  likedIds: string[];
  savedIds: string[];
  toggleLike: (id: string) => void;
  toggleSaved: (id: string) => void;
  isReady: boolean;
};

const RecipeContext = createContext<RecipeContextValue | null>(null);
const LIKES_KEY = '@pitada/likes';
const SAVED_KEY = '@pitada/saved';

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function restore() {
      const [storedLikes, storedSaved] = await Promise.all([
        AsyncStorage.getItem(LIKES_KEY),
        AsyncStorage.getItem(SAVED_KEY),
      ]);

      try {
        if (storedLikes) setLikedIds(JSON.parse(storedLikes) as string[]);
        if (storedSaved) setSavedIds(JSON.parse(storedSaved) as string[]);
      } finally {
        setIsReady(true);
      }
    }

    void restore();
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      void AsyncStorage.setItem(LIKES_KEY, JSON.stringify(next));
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  };

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      void AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  };

  const value = useMemo(
    () => ({ likedIds, savedIds, toggleLike, toggleSaved, isReady }),
    [likedIds, savedIds, isReady],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used inside RecipeProvider');
  return context;
}
