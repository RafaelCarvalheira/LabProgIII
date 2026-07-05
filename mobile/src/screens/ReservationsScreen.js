import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

const STATUS_COLORS = {
  confirmada: { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)', text: '#14B8A6' },
  pendente:   { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
  cancelada:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)', text: '#EF4444' },
};

export default function ReservationsScreen() {
  const [locacoes, setLocacoes] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.brand} />}
    >
      <Text style={styles.kicker}>Minhas locações</Text>
      <Text style={styles.title}>Reservas recentes</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && !locacoes.length ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
      ) : null}

      {!loading && !locacoes.length && !error ? (
        <View style={styles.empty}>
          <Ionicons name="key-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>Nenhuma locação encontrada</Text>
        </View>
      ) : null}

      {locacoes.map((loc) => {
        const s = STATUS_COLORS[loc.status] || STATUS_COLORS.pendente;
        return (
          <View key={loc.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {loc.imovel_titulo}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                <Text style={[styles.statusText, { color: s.text }]}>
                  {loc.status || 'pendente'}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={13} color={colors.muted} />
              <Text style={styles.client}>{loc.cliente_nome}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.muted} />
              <Text style={styles.dates}>
                {formatDate(loc.data_inicio)} → {formatDate(loc.data_fim)}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.value}>{formatCurrency(loc.valor_mensal)}<Text style={styles.valueSuffix}> /mês</Text></Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 36 },

  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', marginTop: 6, marginBottom: 20 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.danger, fontSize: 13 },

  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: colors.muted, fontSize: 15 },

  card: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    gap: 10,
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
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  client: { color: colors.muted, fontSize: 13 },
  dates:  { color: colors.mutedLight, fontSize: 13, fontWeight: '600' },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  value: { color: colors.accent, fontWeight: '900', fontSize: 19 },
  valueSuffix: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});
