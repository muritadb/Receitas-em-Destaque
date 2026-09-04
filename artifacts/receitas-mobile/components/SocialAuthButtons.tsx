import React, { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'facebook';

function GoogleMark() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" accessibilityLabel="Google">
      <Path fill="#4285F4" d="M21.35 12.1c0-.74-.07-1.45-.2-2.1H12v3.98h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.27Z" />
      <Path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z" />
      <Path fill="#FBBC05" d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.09.31-1.58V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.11l3.24-2.53Z" />
      <Path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.46 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z" />
    </Svg>
  );
}

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
          accessibilityRole="button"
          accessibilityLabel="Continuar com Google"
          style={({ pressed }) => [styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed || isBusy ? 0.65 : 1 }]}
        >
          <GoogleMark />
        </Pressable>
        <Pressable
          onPress={() => void continueWith('facebook')}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Continuar com Facebook"
          style={({ pressed }) => [styles.socialButton, styles.facebookButton, { backgroundColor: '#1877F2', opacity: pressed || isBusy ? 0.65 : 1 }]}
        >
          <Text style={styles.facebookMark}>f</Text>
        </Pressable>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 18 },
  buttons: { flexDirection: 'row', gap: 12 },
  socialButton: { width: 50, height: 50, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  facebookButton: { borderWidth: 0 },
  facebookMark: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 25, lineHeight: 25 },
  error: { color: '#c4473d', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 8 },
});