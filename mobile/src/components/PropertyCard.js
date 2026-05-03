import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';
import { formatCurrency } from '../utils/format';

export default function PropertyCard({ property, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="home-outline" color={colors.brand} size={16} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {property.titulo}
          </Text>
          <Text style={styles.city} numberOfLines={1}>
            {property.cidade || 'Cidade nao informada'}
            {property.estado ? `, ${property.estado}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.facts}>
        <Fact icon="bed-outline" value={property.quartos || 0} />
        <Fact icon="water-outline" value={property.banheiros || 0} />
        <Fact icon="car-outline" value={property.vagas_garagem || 0} />
        <Fact icon="resize-outline" value={`${property.area || 0} m²`} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{formatCurrency(property.valor_aluguel)}</Text>
        <Ionicons name="chevron-forward" color={colors.brand} size={20} />
      </View>
    </Pressable>
  );
}

function Fact({ icon, value }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} color={colors.muted} size={15} />
      <Text style={styles.factText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    ...shadow,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E3F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  city: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  fact: {
    minWidth: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  factText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.brandDark,
    fontSize: 20,
    fontWeight: '900',
  },
});
