import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipes } from '@/data/recipes';
import { useColors } from '@/hooks/useColors';
import { useRecipes } from '@/context/RecipeContext';

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { savedIds, toggleSaved } = useRecipes();
  const savedRecipes = recipes.filter((recipe) => savedIds.includes(recipe.id));

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12, paddingBottom: insets.bottom + 105 }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SUA COLEÇÃO</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Receitas salvas</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Aquelas ideias que você quer fazer em breve.</Text>
        {savedRecipes.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}><Feather name="bookmark" size={23} color={colors.accentForeground} /></View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sua coleção está vazia</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Toque no marcador de qualquer receita para guardar uma ideia.</Text>
            <Pressable testID="discover-button" onPress={() => router.replace('/')} style={[styles.action, { backgroundColor: colors.foreground }]}>
              <Text style={[styles.actionText, { color: colors.background }]}>Explorar receitas</Text>
            </Pressable>
          </View>
        ) : (
          savedRecipes.map((recipe) => (
            <Pressable key={recipe.id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={recipe.image} style={styles.image} resizeMode="cover" />
              <View style={styles.cardBody}>
                <Text style={[styles.category, { color: colors.primary }]}>{recipe.category}</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{recipe.title}</Text>
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>{recipe.time} · {recipe.difficulty}</Text>
              </View>
              <Pressable testID={`remove-saved-${recipe.id}`} onPress={() => toggleSaved(recipe.id)} hitSlop={10} style={[styles.remove, { backgroundColor: colors.secondary }]}>
                <Feather name="bookmark" size={16} color={colors.primary} />
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -1 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 25, maxWidth: 290 },
  empty: { minHeight: 330, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8, maxWidth: 245 },
  action: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 13, marginTop: 22 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  card: { minHeight: 116, borderWidth: 1, borderRadius: 19, padding: 9, flexDirection: 'row', marginBottom: 12, position: 'relative' },
  image: { width: 98, height: 98, borderRadius: 13 },
  cardBody: { flex: 1, padding: 7, paddingRight: 30 },
  category: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 7 },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 7 },
  remove: { position: 'absolute', right: 12, top: 12, width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
