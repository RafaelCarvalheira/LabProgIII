import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import AppButton from '../components/AppButton';
import PropertyCard from '../components/PropertyCard';
import { colors } from '../theme';
import { formatDate, isISODate, todayISO } from '../utils/format';

export default function SearchAvailabilityScreen({ navigation }) {
  const [dataInicio, setDataInicio] = useState(todayISO());
  const [dataFim, setDataFim]       = useState('');
  const [results, setResults]       = useState([]);
  const [searched, setSearched]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  async function handleSearch() {
    if (!isISODate(dataInicio) || !isISODate(dataFim)) {
      setError('Use datas no formato AAAA-MM-DD.');
      return;
    }
    if (dataFim < dataInicio) {
      setError('A data final deve ser posterior à data inicial.');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const data = await api.get(
        `/imoveis/disponibilidade?data_inicio=${dataInicio}&data_fim=${dataFim}`
      );
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Disponibilidade</Text>
          <Text style={styles.title}>Buscar imóvel</Text>
          <Text style={styles.subtitle}>
            Escolha o período e encontre imóveis disponíveis para reserva.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DATA INICIAL</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={16} color={colors.muted} style={{ marginRight: 10 }} />
              <TextInput
                value={dataInicio}
                onChangeText={setDataInicio}
                placeholder="2026-05-10"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DATA FINAL</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={16} color={colors.muted} style={{ marginRight: 10 }} />
              <TextInput
                value={dataFim}
                onChangeText={setDataFim}
                placeholder="2026-06-10"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
                style={styles.input}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" color={colors.danger} size={16} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <AppButton
            label={loading ? 'Buscando...' : 'Buscar disponíveis'}
            icon="search-outline"
            onPress={handleSearch}
            disabled={loading}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginVertical: 24 }} />
        ) : null}

        {searched ? (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {results.length
                ? `${results.length} imóvel(is) disponível(is)`
                : 'Nenhum imóvel disponível no período'}
            </Text>
            {results.length > 0 && (
              <Text style={styles.resultsPeriod}>
                {formatDate(dataInicio)} → {formatDate(dataFim)}
              </Text>
            )}
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => navigation.navigate('DetalheImovel', { property, dataInicio, dataFim })}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },

  hero: { paddingTop: 8, paddingBottom: 6 },
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
    marginTop: 6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  form: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    gap: 14,
  },
  inputGroup: { gap: 6 },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.dangerMuted,
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderRadius: 12,
  },
  errorText: { color: colors.danger, flex: 1, lineHeight: 18, fontSize: 13 },

  results: { marginTop: 24 },
  resultsTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  resultsPeriod: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 14,
  },
});
