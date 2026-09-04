import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRecipes } from '@/context/RecipeContext';
import { useClerk } from '@clerk/expo';
import { useGetCurrentUser } from '@workspace/api-client-react';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { likedIds, savedIds } = useRecipes();
  const { signOut } = useClerk();
  const { data: profile } = useGetCurrentUser();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12, paddingBottom: insets.bottom + 105 }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SEU CANTINHO</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Perfil</Text>
        <View style={[styles.profileCard, { backgroundColor: colors.foreground }]}>
          <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}><Text style={[styles.bigAvatarText, { color: colors.card }]}>DB</Text></View>
          <Text style={[styles.name, { color: colors.card }]}>{profile?.displayName ?? 'Cozinheiro(a) Pitada'}</Text>
          <Text style={[styles.handle, { color: colors.accent }]}>@{profile?.username ?? 'seu_perfil'}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={[styles.statNumber, { color: colors.card }]}>{profile?.recipesCount ?? 0}</Text><Text style={[styles.statLabel, { color: colors.accent }]}>receitas</Text></View>
            <View style={[styles.statDivider, { backgroundColor: colors.accent }]} />
            <View style={styles.stat}><Text style={[styles.statNumber, { color: colors.card }]}>{profile?.followersCount ?? 0}</Text><Text style={[styles.statLabel, { color: colors.accent }]}>seguidores</Text></View>
            <View style={[styles.statDivider, { backgroundColor: colors.accent }]} />
            <View style={styles.stat}><Text style={[styles.statNumber, { color: colors.card }]}>{savedIds.length + likedIds.length}</Text><Text style={[styles.statLabel, { color: colors.accent }]}>ações</Text></View>
          </View>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mais do Pitada</Text>
        {['Minhas receitas', 'Sobre a comunidade', 'Preferências', 'Ajuda e suporte'].map((item, index) => (
          <Pressable key={item} onPress={() => item === 'Minhas receitas' ? router.push('/my-recipes' as Href) : undefined} style={({ pressed }) => [styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}><Feather name={index === 0 ? 'book-open' : index === 1 ? 'users' : index === 2 ? 'sliders' : 'help-circle'} size={17} color={colors.foreground} /></View>
            <Text style={[styles.menuText, { color: colors.foreground }]}>{item}</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
        <Pressable onPress={() => void signOut()} style={[styles.signOut, { borderColor: colors.border }]}>
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -1, marginBottom: 22 },
  profileCard: { minHeight: 230, borderRadius: 25, alignItems: 'center', justifyContent: 'center', padding: 22, marginBottom: 29 },
  bigAvatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  bigAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 21 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  handle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 22, gap: 22 },
  stat: { alignItems: 'center', minWidth: 58 },
  statNumber: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 31, opacity: 0.35 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, marginBottom: 14 },
  menuItem: { minHeight: 62, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 10 },
  menuIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, marginLeft: 12 },
  signOut: { minHeight: 54, borderWidth: 1, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 },
  signOutText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
