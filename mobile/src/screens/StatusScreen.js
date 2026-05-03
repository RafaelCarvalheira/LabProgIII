import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, API_URL } from '../api/client';
import AppButton from '../components/AppButton';
import InfoCard from '../components/InfoCard';
import { colors } from '../theme';

export default function StatusScreen() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    load();
  }, [load]);

  const connected = status?.status === 'ok';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.kicker}>RCP Data Imob</Text>
      <Text style={styles.title}>MVP mobile conectado à API</Text>
      <Text style={styles.subtitle}>
        Esta tela executa uma requisição real em JSON para validar a URL do
        backend antes do fluxo de reserva.
      </Text>

      <View style={styles.panel}>
        <View style={styles.statusRow}>
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
            size={28}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.cards}>
          <InfoCard title="Serviço" value={status?.servico || '-'} />
          <InfoCard title="Banco" value={status?.banco || '-'} tone={connected ? 'success' : 'default'} />
        </View>

        <AppButton
          label={loading ? 'Atualizando...' : 'Testar conexão'}
          icon="refresh-outline"
          onPress={load}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 64,
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: colors.ink,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  panel: {
    marginTop: 24,
    gap: 16,
  },
  statusRow: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOk: {
    backgroundColor: colors.success,
  },
  dotFail: {
    backgroundColor: colors.danger,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  statusCopy: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  error: {
    color: colors.danger,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F3C5C5',
    padding: 12,
    borderRadius: 8,
  },
});
