import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import AppButton from '../components/AppButton';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function ReservationScreen({ route, navigation }) {
  const { property, dataInicio, dataFim } = route.params;
  const [clientes, setClientes]           = useState([]);
  const [clienteId, setClienteId]         = useState(null);
  const [valorMensal, setValorMensal]     = useState(String(property.valor_aluguel || ''));
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  useEffect(() => {
    let alive = true;
    api.get('/clientes')
      .then((data) => { if (alive) setClientes(data); })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoadingClientes(false); });
    return () => { alive = false; };
  }, []);

  async function confirmReservation() {
    if (!clienteId) { setError('Selecione um cliente para continuar.'); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/locacoes', {
        imovel_id: property.id,
        cliente_id: clienteId,
        data_inicio: dataInicio,
        data_fim: dataFim,
        valor_mensal: Number(valorMensal) || 0,
      });
      setSuccess('Reserva criada com sucesso!');
      setTimeout(() => navigation.navigate('BuscarDisponibilidade'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Resumo */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>{property.titulo}</Text>
        <Text style={styles.summaryMeta}>
          {formatDate(dataInicio)} → {formatDate(dataFim)}
        </Text>
        <Text style={styles.summaryPrice}>{formatCurrency(valorMensal)}</Text>
      </View>

      {/* Seleção de cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecionar cliente</Text>
        {loadingClientes ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <View style={styles.clientList}>
            {clientes.map((cliente) => {
              const selected = cliente.id === clienteId;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={cliente.id}
                  onPress={() => setClienteId(cliente.id)}
                  style={[styles.client, selected && styles.clientSelected]}
                >
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    color={selected ? colors.brand : colors.muted}
                    size={20}
                  />
                  <View style={styles.clientTextWrap}>
                    <Text style={styles.clientName}>{cliente.nome}</Text>
                    <Text style={styles.clientMeta}>{cliente.email || cliente.telefone || 'Sem contato'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Valor mensal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valor mensal</Text>
        <TextInput
          value={valorMensal}
          onChangeText={setValorMensal}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
      </View>

      {error ? (
        <View style={styles.feedbackError}>
          <Ionicons name="alert-circle-outline" color={colors.danger} size={16} />
          <Text style={styles.feedbackErrorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.feedbackSuccess}>
          <Ionicons name="checkmark-circle-outline" color={colors.success} size={16} />
          <Text style={styles.feedbackSuccessText}>{success}</Text>
        </View>
      ) : null}

      <AppButton
        label={saving ? 'Confirmando...' : 'Confirmar reserva'}
        icon="save-outline"
        onPress={confirmReservation}
        disabled={saving || loadingClientes}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 36 },

  summary: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.2)',
    padding: 18,
  },
  summaryTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '900' },
  summaryMeta:  { color: colors.muted, marginTop: 8, fontSize: 13 },
  summaryPrice: { color: colors.accent, fontSize: 26, fontWeight: '900', marginTop: 10 },

  section: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 12 },

  clientList: { gap: 10 },
  client: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  clientSelected: {
    borderColor: 'rgba(99,102,241,0.4)',
    backgroundColor: colors.brandLight,
  },
  clientTextWrap: { flex: 1 },
  clientName: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  clientMeta: { color: colors.muted, marginTop: 2, fontSize: 12 },

  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.ink,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: '800',
  },

  feedbackError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.dangerMuted,
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderRadius: 12,
  },
  feedbackErrorText: { color: colors.danger, flex: 1, fontSize: 13 },

  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.successMuted,
    borderColor: 'rgba(16,185,129,0.25)',
    borderWidth: 1,
    borderRadius: 12,
  },
  feedbackSuccessText: { color: colors.success, flex: 1, fontWeight: '700', fontSize: 13 },
});
