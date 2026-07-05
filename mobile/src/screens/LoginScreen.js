import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState('');

  async function handleLogin() {
    setErro('');
    if (!email || !senha) { setErro('Preencha email e senha.'); return; }
    setLoading(true);
    try {
      const data = await api.login(email.toLowerCase().trim(), senha);
      await login(data.token, data.usuario);
    } catch (err) {
      setErro(err.message || 'Erro ao conectar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo ─────────────────────────────── */}
        <View style={styles.logoArea}>
          {/* Monograma RCP com gradiente */}
          <LinearGradient
            colors={['#6366F1', '#4F46E5', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.monogram}
          >
            <Text style={styles.monogramText}>RCP</Text>
          </LinearGradient>

          {/* Nome do produto */}
          <View style={styles.logoTextRow}>
            <Text style={styles.logoBrand}>RCP</Text>
            <Text style={styles.logoName}> Data Imob</Text>
          </View>
          <Text style={styles.logoTagline}>Gestão Imobiliária</Text>
        </View>

        {/* ── Card glass ───────────────────────── */}
        <View style={styles.card}>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={17} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>SENHA</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={senha}
                onChangeText={setSenha}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPass}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={17}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          {/* Erro */}
          {erro ? (
            <View style={styles.errBox}>
              <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
              <Text style={styles.errText}>{erro}</Text>
            </View>
          ) : null}

          {/* Botão */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [styles.btnWrap, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5', '#14B8A6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.btn, loading && { opacity: 0.6 }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                    <Text style={styles.btnLabel}>Entrar</Text>
                  </>
                )
              }
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.footer}>Acesso restrito · v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // Logo
  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  monogram: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monogramText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoBrand: {
    color: colors.brand,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  logoName: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  logoTagline: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 20,
    padding: 24,
    gap: 18,
  },

  // Fields
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 4,
  },

  // Erro
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 10,
    padding: 12,
  },
  errText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
  },

  // Botão
  btnWrap: {
    marginTop: 4,
  },
  btn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    color: 'rgba(100,116,139,0.5)',
    fontSize: 11,
    marginTop: 28,
  },
});
