import { Feather } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListRecipes } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function MyRecipesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: recipes, isLoading } = useListRecipes({ mine: true });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.secondary }]}><Feather name="arrow-left" size={19} color={colors.foreground} /></Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Minhas receitas</Text>
          <Pressable onPress={() => router.push('/create-recipe' as Href)} style={[styles.add, { backgroundColor: colors.primary }]}><Feather name="plus" size={18} color={colors.card} /></Pressable>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Edite, ajuste ou retire o que você compartilhou.</Text>
        {isLoading ? <Text style={[styles.empty, { color: colors.mutedForeground }]}>Carregando...</Text> : recipes?.length ? recipes.map((recipe) => (
          <View key={recipe.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardCopy}><Text style={[styles.category, { color: colors.primary }]}>{recipe.category}</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>{recipe.title}</Text><Text style={[styles.meta, { color: colors.mutedForeground }]}>{recipe.likes} curtidas · {recipe.timeMinutes} min</Text></View>
            <Pressable onPress={() => router.push({ pathname: '/create-recipe', params: { id: String(recipe.id) } })} style={[styles.edit, { backgroundColor: colors.secondary }]}><Feather name="edit-2" size={16} color={colors.foreground} /></Pressable>
          </View>
        )) : <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="book-open" size={24} color={colors.primary} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Você ainda não publicou</Text><Text style={[styles.empty, { color: colors.mutedForeground }]}>Compartilhe uma receita para ela aparecer aqui.</Text><Pressable onPress={() => router.push('/create-recipe' as Href)} style={[styles.publish, { backgroundColor: colors.foreground }]}><Text style={[styles.publishText, { color: colors.background }]}>Publicar receita</Text></Pressable></View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  back: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.6 },
  add: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 10, marginBottom: 20 },
  card: { minHeight: 92, borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  cardCopy: { flex: 1 },
  category: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 5 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 5 },
  edit: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { minHeight: 250, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 25 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 14 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  publish: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: 16, marginTop: 18 },
  publishText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});