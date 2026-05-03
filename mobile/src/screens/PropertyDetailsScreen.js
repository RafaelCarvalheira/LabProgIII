import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property, dataInicio, dataFim } = route.params;
  const categories = Array.isArray(property.categorias) ? property.categorias : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="business-outline" color={colors.brand} size={30} />
        </View>
        <Text style={styles.title}>{property.titulo}</Text>
        <Text style={styles.location}>
          {property.endereco || 'Endereço não informado'}
          {property.cidade ? ` · ${property.cidade}` : ''}
          {property.estado ? `/${property.estado}` : ''}
        </Text>
      </View>

      <View style={styles.pricePanel}>
        <Text style={styles.priceLabel}>Valor mensal</Text>
        <Text style={styles.price}>{formatCurrency(property.valor_aluguel)}</Text>
        <Text style={styles.period}>
          {formatDate(dataInicio)} até {formatDate(dataFim)}
        </Text>
      </View>

      <View style={styles.grid}>
        <Metric icon="bed-outline" label="Quartos" value={property.quartos || 0} />
        <Metric icon="water-outline" label="Banheiros" value={property.banheiros || 0} />
        <Metric icon="car-outline" label="Vagas" value={property.vagas_garagem || 0} />
        <Metric icon="resize-outline" label="Área" value={`${property.area || 0} m²`} />
      </View>

      {property.descricao ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.body}>{property.descricao}</Text>
        </View>
      ) : null}

      {categories.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.tags}>
            {categories.map((category) => (
              <View key={category.id} style={styles.tag}>
                <Ionicons name="pricetag-outline" color={colors.brand} size={14} />
                <Text style={styles.tagText}>{category.nome}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <AppButton
        label="Reservar este imóvel"
        icon="checkmark-circle-outline"
        onPress={() =>
          navigation.navigate('Reserva', {
            property,
            dataInicio,
            dataFim,
          })
        }
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 9,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#E3F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900',
  },
  location: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  pricePanel: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  priceLabel: {
    color: colors.muted,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  price: {
    color: colors.brandDark,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 5,
  },
  period: {
    color: colors.muted,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '47.8%',
    minHeight: 94,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    gap: 4,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderColor: '#B7DCCF',
    borderWidth: 1,
    backgroundColor: '#F0FAF5',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tagText: {
    color: colors.brandDark,
    fontWeight: '800',
  },
});
