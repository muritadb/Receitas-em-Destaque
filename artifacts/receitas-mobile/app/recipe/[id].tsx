import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecipe } from '@/data/recipes';
import { useColors } from '@/hooks/useColors';
import { useRecipes } from '@/context/RecipeContext';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRecipe(id);
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { likedIds, savedIds, toggleLike, toggleSaved } = useRecipes();

  if (!recipe) {
    return <View style={[styles.missing, { backgroundColor: colors.background }]}><Text style={[styles.missingText, { color: colors.foreground }]}>Receita não encontrada.</Text></View>;
  }

  const liked = likedIds.includes(recipe.id);
  const saved = savedIds.includes(recipe.id);

  const shareRecipe = async () => {
    await Share.share({ message: `Olha essa receita no Pitada: ${recipe.title} — ${recipe.subtitle}` });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.hero}>
          <Image source={recipe.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroShade} />
          <Pressable testID="back-button" onPress={() => router.back()} style={[styles.topButton, { backgroundColor: colors.card }]}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={styles.heroActions}>
            <Pressable testID="share-button" onPress={() => void shareRecipe()} style={[styles.topButton, { backgroundColor: colors.card }]}>
              <Feather name="share-2" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable testID="detail-save" onPress={() => toggleSaved(recipe.id)} style={[styles.topButton, { backgroundColor: saved ? colors.primary : colors.card }]}>
              <Feather name="bookmark" size={18} color={saved ? colors.card : colors.foreground} />
            </Pressable>
          </View>
          <View style={styles.heroText}><Text style={[styles.heroCategory, { color: colors.card }]}>{recipe.category}</Text><Text style={[styles.heroTitle, { color: colors.card }]}>{recipe.title}</Text></View>
        </View>
        <View style={styles.detailContent}>
          <View style={styles.authorRow}><View style={[styles.detailAvatar, { backgroundColor: colors.accent }]}><Text style={[styles.detailAvatarText, { color: colors.accentForeground }]}>{recipe.initials}</Text></View><View><Text style={[styles.authorName, { color: colors.foreground }]}>{recipe.author}</Text><Text style={[styles.authorCaption, { color: colors.mutedForeground }]}>Receita compartilhada pela comunidade</Text></View></View>
          <View style={styles.infoRow}>
            <View style={[styles.infoItem, { backgroundColor: colors.secondary }]}><Feather name="clock" size={16} color={colors.primary} /><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>TEMPO</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{recipe.time}</Text></View>
            <View style={[styles.infoItem, { backgroundColor: colors.secondary }]}><Feather name="bar-chart-2" size={16} color={colors.primary} /><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>NÍVEL</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{recipe.difficulty}</Text></View>
            <View style={[styles.infoItem, { backgroundColor: colors.secondary }]}><Feather name="users" size={16} color={colors.primary} /><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>RENDE</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{recipe.servings}</Text></View>
          </View>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingredientes</Text><Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>tudo à mão?</Text></View>
          <View style={[styles.ingredientCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{recipe.ingredients.map((ingredient) => <View key={ingredient} style={styles.ingredientRow}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><Text style={[styles.ingredientText, { color: colors.foreground }]}>{ingredient}</Text></View>)}</View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 27 }]}>Modo de preparo</Text>
          <View style={styles.steps}>{recipe.steps.map((step, index) => <View key={step} style={styles.step}><View style={[styles.stepNumber, { backgroundColor: colors.foreground }]}><Text style={[styles.stepNumberText, { color: colors.background }]}>{index + 1}</Text></View><Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text></View>)}</View>
          <Pressable testID="detail-like" onPress={() => toggleLike(recipe.id)} style={[styles.likeCta, { backgroundColor: liked ? colors.primary : colors.foreground }]}><Feather name="heart" size={18} color={colors.card} fill={liked ? colors.card : 'transparent'} /><Text style={[styles.likeCtaText, { color: colors.card }]}>{liked ? 'Você curtiu esta receita' : 'Curtir esta receita'}</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { height: 355, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17, 31, 25, 0.34)' },
  topButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroActions: { position: 'absolute', top: 16, right: 17, flexDirection: 'row', gap: 8 },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 25 },
  heroCategory: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  detailContent: { paddingHorizontal: 20, paddingTop: 22 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  detailAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  authorName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  authorCaption: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 23 },
  infoItem: { flex: 1, minHeight: 82, borderRadius: 15, padding: 11 },
  infoLabel: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.8, marginTop: 8 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.4 },
  sectionHint: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  ingredientCard: { borderWidth: 1, borderRadius: 18, padding: 15 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 11 },
  ingredientText: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },
  steps: { marginTop: 18, gap: 18 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, paddingTop: 2 },
  likeCta: { height: 53, borderRadius: 18, marginTop: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  likeCtaText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});