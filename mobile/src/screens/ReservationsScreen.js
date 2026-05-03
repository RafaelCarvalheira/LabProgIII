import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function ReservationsScreen() {
  const [locacoes, setLocacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setLocacoes(await api.get('/locacoes'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.title}>Reservas recentes</Text>
      <Text style={styles.subtitle}>
        Listagem de locações recebida da mesma API do backend.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading && !locacoes.length ? <ActivityIndicator color={colors.brand} /> : null}

      {locacoes.map((locacao) => (
        <View key={locacao.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {locacao.imovel_titulo}
            </Text>
            <Text style={styles.status}>{locacao.status || 'pendente'}</Text>
          </View>
          <Text style={styles.client}>{locacao.cliente_nome}</Text>
          <Text style={styles.dates}>
            {formatDate(locacao.data_inicio)} até {formatDate(locacao.data_fim)}
          </Text>
          <Text style={styles.value}>{formatCurrency(locacao.valor_mensal)} / mês</Text>
        </View>
      ))}
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
    paddingBottom: 36,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },
  error: {
    color: colors.danger,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F3C5C5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  status: {
    color: colors.brandDark,
    backgroundColor: '#F0FAF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  client: {
    color: colors.muted,
    marginTop: 8,
  },
  dates: {
    color: colors.ink,
    fontWeight: '700',
    marginTop: 8,
  },
  value: {
    color: colors.brandDark,
    fontWeight: '900',
    fontSize: 18,
    marginTop: 10,
  },
});
