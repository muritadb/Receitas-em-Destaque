import React, { useState } from 'react';
import { Link, useRouter, type Href } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const isBusy = fetchStatus === 'fetching';

  const finish = async () => {
    await signIn.finalize({ navigate: () => router.replace('/') });
  };

  const submit = async () => {
    const { error } = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (error) return;
    if (signIn.status === 'complete') {
      await finish();
    } else if (signIn.status === 'needs_client_trust') {
      const factor = signIn.supportedSecondFactors.find((item) => item.strategy === 'email_code');
      if (factor) await signIn.mfa.sendEmailCode();
    }
  };

  const verify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === 'complete') await finish();
  };

  const needsCode = signIn.status === 'needs_client_trust';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>PITADA.</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{needsCode ? 'Confirme seu acesso' : 'Que bom ter você aqui'}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {needsCode ? 'Digite o código enviado para o seu e-mail.' : 'Entre para salvar receitas e compartilhar as suas.'}
        </Text>
        {needsCode ? (
          <>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} value={code} onChangeText={setCode} placeholder="Código de verificação" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" />
            {errors.fields.code && <Text style={styles.error}>{errors.fields.code.message}</Text>}
            <Pressable onPress={() => void verify()} disabled={!code || isBusy} style={[styles.button, { backgroundColor: colors.primary, opacity: !code || isBusy ? 0.5 : 1 }]}><Text style={styles.buttonText}>Verificar e entrar</Text></Pressable>
            <Pressable onPress={() => void signIn.mfa.sendEmailCode()}><Text style={[styles.link, { color: colors.primary }]}>Enviar outro código</Text></Pressable>
          </>
        ) : (
          <>
            <SocialAuthButtons />
            <Text style={[styles.label, { color: colors.foreground }]}>E-mail</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} placeholder="voce@email.com" placeholderTextColor={colors.mutedForeground} />
            {errors.fields.identifier && <Text style={styles.error}>{errors.fields.identifier.message}</Text>}
            <Text style={[styles.label, { color: colors.foreground }]}>Senha</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} secureTextEntry value={password} onChangeText={setPassword} placeholder="Sua senha" placeholderTextColor={colors.mutedForeground} />
            {errors.fields.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}
            <Pressable onPress={() => void submit()} disabled={!emailAddress || !password || isBusy} style={[styles.button, { backgroundColor: colors.primary, opacity: !emailAddress || !password || isBusy ? 0.5 : 1 }]}><Text style={styles.buttonText}>Entrar</Text></Pressable>
            <View style={styles.footer}><Text style={{ color: colors.mutedForeground }}>Ainda não tem conta? </Text><Link href={'/(auth)/sign-up' as Href}><Text style={[styles.link, { color: colors.primary }]}>Criar agora</Text></Link></View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2.5, marginBottom: 13 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, lineHeight: 35, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 9, marginBottom: 28 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginBottom: 7, marginTop: 14 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 14 },
  button: { minHeight: 53, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  buttonText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textAlign: 'center', marginTop: 18 },
  error: { color: '#c4473d', fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 6 },
});