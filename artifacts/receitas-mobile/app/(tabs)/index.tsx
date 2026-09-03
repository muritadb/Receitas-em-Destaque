import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categories, recipes, Recipe } from '@/data/recipes';
import { useColors } from '@/hooks/useColors';
import { useRecipes } from '@/context/RecipeContext';

function formatLikes(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace('.0', '')}k` : String(value);
}

function Avatar({ initials, size = 34 }: { initials: string; size?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accent }]}>
      <Text style={[styles.avatarText, { color: colors.accentForeground, fontSize: size * 0.31 }]}>{initials}</Text>
    </View>
  );
}

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const colors = useColors();
  const router = useRouter();
  const { likedIds, savedIds, toggleLike, toggleSaved } = useRecipes();
  const liked = likedIds.includes(recipe.id);
  const saved = savedIds.includes(recipe.id);

  return (
    <Pressable
      testID={`recipe-${recipe.id}`}
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
      style={({ pressed }) => [styles.recipeRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.94 : 1 }]}
    >
      <Image source={recipe.image} style={styles.rowImage} resizeMode="cover" />
      <View style={styles.rowContent}>
        <View style={styles.rowTopline}>
          <Text style={[styles.categoryLabel, { color: colors.primary }]}>{recipe.category}</Text>
          <Pressable
            testID={`save-${recipe.id}`}
            hitSlop={10}
            onPress={() => toggleSaved(recipe.id)}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: saved ? colors.accent : colors.secondary, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="bookmark" size={16} color={saved ? colors.accentForeground : colors.mutedForeground} />
          </Pressable>
        </View>
        <Text style={[styles.rowTitle, { color: colors.cardForeground }]} numberOfLines={2}>{recipe.title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>{recipe.subtitle}</Text>
        <View style={styles.rowMeta}>
          <View style={styles.authorLine}><Avatar initials={recipe.initials} size={22} /><Text style={[styles.authorName, { color: colors.mutedForeground }]}>{recipe.author}</Text></View>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{recipe.time}</Text>
          <Pressable
            testID={`like-${recipe.id}`}
            hitSlop={8}
            onPress={() => toggleLike(recipe.id)}
            style={styles.likeButton}
          >
            <Feather name="heart" size={15} color={liked ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.likeCount, { color: liked ? colors.primary : colors.mutedForeground }]}>{formatLikes(recipe.likes + (liked ? 1 : 0))}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const { likedIds, savedIds, toggleLike, toggleSaved } = useRecipes();
  const featured = recipes[0];
  const featuredLiked = likedIds.includes(featured.id);
  const featuredSaved = savedIds.includes(featured.id);

  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesSearch = !term || `${recipe.title} ${recipe.subtitle} ${recipe.author}`.toLowerCase().includes(term);
      const matchesCategory =
        activeCategory === 'Todas' ||
        (activeCategory === 'Mais curtidas' && recipe.likes >= 1800) ||
        recipe.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, search]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12, paddingBottom: insets.bottom + 106 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>BEM-VINDA À</Text>
            <Text style={[styles.brand, { color: colors.foreground }]}>Pitada<Text style={{ color: colors.primary }}>.</Text></Text>
          </View>
          <Pressable testID="profile-button" onPress={() => router.push('/profile')} style={({ pressed }) => [styles.profileButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.75 : 1 }]}>
            <Feather name="user" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <Text style={[styles.greeting, { color: colors.foreground }]}>O que vamos cozinhar hoje?</Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>Receitas testadas e amadas por quem gosta de comer bem.</Text>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={19} color={colors.mutedForeground} />
          <TextInput
            testID="search-input"
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar receitas, ingredientes..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          <Feather name="sliders" size={18} color={colors.mutedForeground} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <Pressable
                testID={`category-${category}`}
                key={category}
                onPress={() => setActiveCategory(category)}
                style={({ pressed }) => [styles.categoryChip, { backgroundColor: active ? colors.foreground : colors.secondary, opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={[styles.categoryText, { color: active ? colors.background : colors.secondaryForeground }]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>A receita da semana</Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>A favorita da comunidade</Text>
          </View>
          <Pressable testID="see-all" onPress={() => setActiveCategory('Mais curtidas')}><Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas</Text></Pressable>
        </View>

        <Pressable
          testID="featured-recipe"
          onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: featured.id } })}
          style={({ pressed }) => [styles.featuredCard, { opacity: pressed ? 0.96 : 1 }]}
        >
          <Image source={featured.image} style={styles.featuredImage} />
          <View style={styles.featuredShade} />
          <View style={styles.featuredBadge}><Feather name="award" size={13} color={colors.foreground} /><Text style={[styles.featuredBadgeText, { color: colors.foreground }]}>MAIS CURTIDA</Text></View>
          <View style={styles.featuredInfo}>
            <Text style={[styles.featuredTitle, { color: colors.card }]}>{featured.title}</Text>
            <View style={styles.featuredBottom}>
              <View style={styles.featuredAuthor}><Avatar initials={featured.initials} size={27} /><Text style={[styles.featuredAuthorText, { color: colors.card }]}>{featured.author}</Text></View>
              <Text style={[styles.featuredLikes, { color: colors.card }]}><Feather name="heart" size={13} color={colors.card} /> {formatLikes(featured.likes)} curtidas</Text>
            </View>
          </View>
          <Pressable
            testID="featured-save"
            onPress={(event) => { event.stopPropagation(); toggleSaved(featured.id); }}
            style={[styles.featuredSave, { backgroundColor: colors.card }]}
          >
            <Feather name="bookmark" size={18} color={featuredSaved ? colors.primary : colors.foreground} />
          </Pressable>
          <Pressable
            testID="featured-like"
            onPress={(event) => { event.stopPropagation(); toggleLike(featured.id); }}
            style={[styles.featuredLike, { backgroundColor: colors.primary }]}
          >
            <Feather name="heart" size={18} color={featuredLiked ? colors.card : colors.card} fill={featuredLiked ? colors.card : 'transparent'} />
          </Pressable>
        </Pressable>

        <View style={[styles.sectionHeading, styles.discoverHeading]}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Descubra novas ideias</Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>{filteredRecipes.length} receitas para experimentar</Text>
          </View>
          <Feather name="compass" size={20} color={colors.primary} />
        </View>

        {filteredRecipes.map((recipe) => <RecipeRow key={recipe.id} recipe={recipe} />)}
        {filteredRecipes.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={24} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nada por aqui ainda</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tente outro termo ou categoria.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.2, marginBottom: 1 },
  brand: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -1.2 },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.7, marginTop: 30 },
  intro: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 310 },
  profileButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  searchBox: { height: 52, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, marginTop: 22 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13 },
  categoryScroll: { gap: 8, paddingVertical: 20 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  categoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.4 },
  sectionCaption: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  featuredCard: { height: 250, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 28 },
  featuredImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  featuredShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17, 31, 25, 0.38)' },
  featuredBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(252,249,242,0.9)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  featuredBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1 },
  featuredInfo: { position: 'absolute', bottom: 17, left: 17, right: 17 },
  featuredTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.8, maxWidth: 245 },
  featuredBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 11 },
  featuredAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredAuthorText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  featuredLikes: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  featuredSave: { position: 'absolute', top: 16, right: 58, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  featuredLike: { position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  discoverHeading: { marginBottom: 15 },
  recipeRow: { minHeight: 138, borderRadius: 20, borderWidth: 1, padding: 9, flexDirection: 'row', marginBottom: 12 },
  rowImage: { width: 120, height: 118, borderRadius: 14 },
  rowContent: { flex: 1, paddingLeft: 12, paddingTop: 2, paddingBottom: 1, justifyContent: 'space-between' },
  rowTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase' },
  iconButton: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 20, marginTop: 2 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 15, marginTop: 3 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 9 },
  authorLine: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorName: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  likeButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold' },
  emptyState: { minHeight: 150, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
});
