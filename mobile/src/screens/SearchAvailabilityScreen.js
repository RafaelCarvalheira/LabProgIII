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
  const [dataFim, setDataFim] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  function openDetails(property) {
    navigation.navigate('DetalheImovel', {
      property,
      dataInicio,
      dataFim,
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Funcionalidade F1</Text>
          <Text style={styles.title}>Buscar imóvel disponível</Text>
          <Text style={styles.subtitle}>
            Consulte a API pelo período desejado e avance para criar uma
            reserva com cliente e valor mensal.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data inicial</Text>
            <TextInput
              value={dataInicio}
              onChangeText={setDataInicio}
              placeholder="2026-05-10"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data final</Text>
            <TextInput
              value={dataFim}
              onChangeText={setDataFim}
              placeholder="2026-06-10"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              style={styles.input}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" color={colors.danger} size={18} />
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
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : null}

        {searched ? (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {results.length
                ? `${results.length} imóvel(is) entre ${formatDate(dataInicio)} e ${formatDate(dataFim)}`
                : 'Nenhum imóvel disponível no período'}
            </Text>

            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => openDetails(property)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  hero: {
    paddingTop: 8,
    paddingBottom: 10,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFF1F1',
    borderColor: '#F3C5C5',
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    lineHeight: 19,
  },
  loader: {
    marginVertical: 24,
  },
  results: {
    marginTop: 22,
  },
  resultsTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
});
