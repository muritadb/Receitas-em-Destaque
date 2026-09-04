import React, { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'facebook';

export function SocialAuthButtons() {
  const colors = useColors();
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const continueWith = useCallback(async (provider: Provider) => {
    setActiveProvider(provider);
    setErrorMessage('');

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_facebook',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (!createdSessionId || !setActive) {
        setErrorMessage('A autenticação precisa de mais informações para continuar.');
        return;
      }

      await setActive({
        session: createdSessionId,
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setErrorMessage('Sua conta precisa concluir uma etapa adicional.');
            return;
          }
          router.replace(decorateUrl('/') as never);
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrorMessage(message || 'Não foi possível entrar agora. Tente novamente.');
    } finally {
      setActiveProvider(null);
    }
  }, [router, startSSOFlow]);

  const isBusy = activeProvider !== null;

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Pressable
          onPress={() => void continueWith('google')}
          disabled={isBusy}
          style={({ pressed }) => [styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed || isBusy ? 0.65 : 1 }]}
        >
          <View style={[styles.googleMark, { borderColor: colors.primary }]}><Text style={[styles.googleText, { color: colors.primary }]}>G</Text></View>
          <Text style={[styles.socialText, { color: colors.foreground }]}>{activeProvider === 'google' ? 'Abrindo Google...' : 'Continuar com Google'}</Text>
        </Pressable>
        <Pressable
          onPress={() => void continueWith('facebook')}
          disabled={isBusy}
          style={({ pressed }) => [styles.socialButton, { backgroundColor: '#1877F2', opacity: pressed || isBusy ? 0.65 : 1 }]}
        >
          <Text style={styles.facebookMark}>f</Text>
          <Text style={styles.facebookText}>{activeProvider === 'facebook' ? 'Abrindo Facebook...' : 'Continuar com Facebook'}</Text>
        </Pressable>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <View style={styles.divider}><View style={[styles.line, { backgroundColor: colors.border }]} /><Text style={[styles.dividerText, { color: colors.mutedForeground }]}>ou use seu e-mail</Text><View style={[styles.line, { backgroundColor: colors.border }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 2 },
  buttons: { gap: 10 },
  socialButton: { minHeight: 50, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  socialText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  googleMark: { width: 23, height: 23, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  googleText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  facebookMark: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 25, lineHeight: 25 },
  facebookText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  error: { color: '#c4473d', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 5 },
  line: { flex: 1, height: 1 },
  dividerText: { fontFamily: 'Inter_400Regular', fontSize: 11 },
});