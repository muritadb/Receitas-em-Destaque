import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListRecipesQueryKey,
  useCreateRecipe,
  useDeleteRecipe,
  useUpdateRecipe,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useRecipes } from '@/context/RecipeContext';

export default function CreateRecipeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { recipes } = useRecipes();
  const queryClient = useQueryClient();
  const existing = useMemo(() => (id ? recipes.find((recipe) => recipe.id === id) : undefined), [id, recipes]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Rápidas');
  const [timeMinutes, setTimeMinutes] = useState('20');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [servings, setServings] = useState('2 porções');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setSubtitle(existing.subtitle);
    setCategory(existing.category);
    setTimeMinutes(existing.time.replace(/\D/g, '') || '20');
    setDifficulty(existing.difficulty);
    setServings(existing.servings);
    setIngredientsText(existing.ingredients.join('\n'));
    setStepsText(existing.steps.join('\n'));
  }, [existing]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
    router.replace('/');
  };

  const createMutation = useCreateRecipe({ mutation: { onSuccess: invalidate } });
  const updateMutation = useUpdateRecipe({ mutation: { onSuccess: invalidate } });
  const deleteMutation = useDeleteRecipe({ mutation: { onSuccess: invalidate } });
  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const submit = () => {
    const ingredients = ingredientsText.split('\n').map((item) => item.trim()).filter(Boolean);
    const steps = stepsText.split('\n').map((item) => item.trim()).filter(Boolean);
    const minutes = Number(timeMinutes);
    if (!title.trim() || !subtitle.trim() || !category.trim() || !Number.isInteger(minutes) || minutes < 1 || ingredients.length === 0 || steps.length === 0) {
      Alert.alert('Revise os campos', 'Preencha título, descrição, tempo, ingredientes e etapas.');
      return;
    }
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      category: category.trim(),
      timeMinutes: minutes,
      difficulty: difficulty.trim() || 'Fácil',
      servings: servings.trim() || '1 porção',
      ingredients,
      steps,
      imageUrl: imageUrl.trim() || null,
    };
    if (existing) {
      updateMutation.mutate({ id: Number(existing.id), data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Excluir receita?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate({ id: Number(existing.id) }) },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.secondary }]}><Feather name="arrow-left" size={19} color={colors.foreground} /></Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>{existing ? 'Editar receita' : 'Compartilhe uma receita'}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Uma boa receita começa com detalhes simples e claros.</Text>
        <Field label="Nome da receita" value={title} onChangeText={setTitle} placeholder="Ex.: Arroz cremoso de forno" colors={colors} />
        <Field label="Descrição curta" value={subtitle} onChangeText={setSubtitle} placeholder="Conte por que essa receita é especial" colors={colors} />
        <View style={styles.row}>
          <View style={styles.half}><Field label="Categoria" value={category} onChangeText={setCategory} placeholder="Rápidas" colors={colors} /></View>
          <View style={styles.half}><Field label="Tempo (min)" value={timeMinutes} onChangeText={setTimeMinutes} keyboardType="number-pad" placeholder="20" colors={colors} /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}><Field label="Dificuldade" value={difficulty} onChangeText={setDifficulty} placeholder="Fácil" colors={colors} /></View>
          <View style={styles.half}><Field label="Rendimento" value={servings} onChangeText={setServings} placeholder="2 porções" colors={colors} /></View>
        </View>
        <Field label="Ingredientes" value={ingredientsText} onChangeText={setIngredientsText} placeholder="Um ingrediente por linha" multiline colors={colors} />
        <Field label="Modo de preparo" value={stepsText} onChangeText={setStepsText} placeholder="Uma etapa por linha" multiline colors={colors} />
        <Field label="URL da imagem (opcional)" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" colors={colors} />
        <Pressable onPress={submit} disabled={isBusy} style={[styles.submit, { backgroundColor: colors.primary, opacity: isBusy ? 0.55 : 1 }]}><Text style={styles.submitText}>{existing ? 'Salvar alterações' : 'Publicar receita'}</Text></Pressable>
        {existing && <Pressable onPress={remove} disabled={isBusy} style={styles.delete}><Text style={[styles.deleteText, { color: colors.destructive }]}>Excluir receita</Text></Pressable>}
      </ScrollView>
    </View>
  );
}

function Field({ label, colors, multiline, ...props }: { label: string; colors: ReturnType<typeof useColors>; multiline?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput {...props} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.multiline, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} placeholderTextColor={colors.mutedForeground} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 10 },
  back: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.6 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 14 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginBottom: 7 },
  input: { minHeight: 49, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 13 },
  multiline: { minHeight: 112, paddingTop: 13 },
  submit: { minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  submitText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  delete: { alignItems: 'center', paddingVertical: 18 },
  deleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});