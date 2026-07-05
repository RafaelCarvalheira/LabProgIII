import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property, dataInicio, dataFim } = route.params;
  const categories = Array.isArray(property.categorias) ? property.categorias : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(99,102,241,0.2)', 'rgba(20,184,166,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBox}
        >
          <Ionicons name="business-outline" color={colors.brand} size={28} />
        </LinearGradient>
        <Text style={styles.title}>{property.titulo}</Text>
        <Text style={styles.location}>
          {property.endereco || 'Endereço não informado'}
          {property.cidade ? ` · ${property.cidade}` : ''}
          {property.estado ? `/${property.estado}` : ''}
        </Text>
      </View>

      {/* Price panel */}
      <View style={styles.pricePanel}>
        <Text style={styles.priceLabel}>VALOR MENSAL</Text>
        <Text style={styles.price}>{formatCurrency(property.valor_aluguel)}</Text>
        <Text style={styles.period}>
          {formatDate(dataInicio)} → {formatDate(dataFim)}
        </Text>
      </View>

      {/* Métricas */}
      <View style={styles.grid}>
        <Metric icon="bed-outline"    label="Quartos"   value={property.quartos || 0} />
        <Metric icon="water-outline"  label="Banheiros" value={property.banheiros || 0} />
        <Metric icon="car-outline"    label="Vagas"     value={property.vagas_garagem || 0} />
        <Metric icon="resize-outline" label="Área"      value={`${property.area || 0} m²`} />
      </View>

      {/* Descrição */}
      {property.descricao ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.body}>{property.descricao}</Text>
        </View>
      ) : null}

      {/* Categorias */}
      {categories.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.tags}>
            {categories.map((category) => (
              <View key={category.id} style={styles.tag}>
                <Ionicons name="pricetag-outline" color={colors.accent} size={13} />
                <Text style={styles.tagText}>{category.nome}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <AppButton
        label="Reservar este imóvel"
        icon="checkmark-circle-outline"
        onPress={() => navigation.navigate('Reserva', { property, dataInicio, dataFim })}
      />
    </ScrollView>
  );
}

function Metric({ icon, label, value }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} color={colors.brand} size={18} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 36 },

  header: { gap: 10 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  location: { color: colors.muted, fontSize: 13, lineHeight: 19 },

  pricePanel: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.2)',
    padding: 18,
  },
  priceLabel: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  price: {
    color: colors.accent,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
  },
  period: { color: colors.muted, marginTop: 5, fontSize: 13 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: {
    width: '47.8%',
    minHeight: 88,
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  metricValue: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },

  section: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderColor: 'rgba(20,184,166,0.25)',
    borderWidth: 1,
    backgroundColor: colors.accentLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
});
