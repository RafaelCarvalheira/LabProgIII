import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, API_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import InfoCard from '../components/InfoCard';
import { colors } from '../theme';

export default function StatusScreen() {
  const { user, isAdmin, logout } = useAuth();
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStatus(await api.get('/status'));
    } catch (err) {
      setStatus(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const connected = status?.status === 'ok';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.brand} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>RCP Data Imob</Text>
          <Text style={styles.title}>Conexão API</Text>
        </View>
        {/* Badge de papel */}
        <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
          <Ionicons
            name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
            size={14}
            color={isAdmin ? colors.brand : colors.muted}
          />
          <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
            {isAdmin ? 'Admin' : 'Cliente'}
          </Text>
        </View>
      </View>

      {/* User info */}
      {user && (
        <View style={styles.userCard}>
          <Ionicons name="person-circle-outline" size={32} color={colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.nome}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <AppButton
            label="Sair"
            icon="log-out-outline"
            variant="secondary"
            onPress={logout}
          />
        </View>
      )}

      {/* Status da API */}
      <View style={styles.panel}>
        <View style={[styles.statusRow, connected && styles.statusRowOk]}>
          <View style={[styles.dot, connected ? styles.dotOk : styles.dotFail]} />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>
              {connected ? 'API online' : 'API indisponível'}
            </Text>
            <Text style={styles.statusCopy}>{API_URL}</Text>
          </View>
          <Ionicons
            name={connected ? 'checkmark-circle' : 'alert-circle'}
            color={connected ? colors.success : colors.danger}
            size={26}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.cards}>
          <InfoCard title="Serviço" value={status?.servico || '–'} />
          <InfoCard title="Banco"   value={status?.banco   || '–'} tone={connected ? 'success' : 'default'} />
        </View>

        <AppButton
          label={loading ? 'Verificando...' : 'Testar conexão'}
          icon="refresh-outline"
          onPress={load}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 36 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.brandLight,
    borderColor: 'rgba(99,102,241,0.25)',
  },
  roleText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  roleTextAdmin: { color: colors.brand },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  userName: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  userEmail: { color: colors.muted, fontSize: 12, marginTop: 2 },

  panel: { gap: 14 },
  statusRow: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusRowOk: { borderColor: 'rgba(20,184,166,0.2)' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOk:   { backgroundColor: colors.success },
  dotFail: { backgroundColor: colors.danger },
  statusTextWrap: { flex: 1 },
  statusTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  statusCopy:  { color: colors.muted, fontSize: 11, marginTop: 3 },
  cards: { flexDirection: 'row', gap: 12 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
});
