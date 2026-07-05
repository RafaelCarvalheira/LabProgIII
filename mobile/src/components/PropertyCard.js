import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
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
          <Ionicons name="business-outline" color={colors.brand} size={16} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>{property.titulo}</Text>
          <Text style={styles.city} numberOfLines={1}>
            {property.cidade || 'Cidade não informada'}
            {property.estado ? `, ${property.estado}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.facts}>
        <Fact icon="bed-outline"    value={property.quartos || 0} />
        <Fact icon="water-outline"  value={property.banheiros || 0} />
        <Fact icon="car-outline"    value={property.vagas_garagem || 0} />
        <Fact icon="resize-outline" value={`${property.area || 0} m²`} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{formatCurrency(property.valor_aluguel)}</Text>
        <Ionicons name="chevron-forward" color={colors.brand} size={18} />
      </View>
    </Pressable>
  );
}

function Fact({ icon, value }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} color={colors.muted} size={14} />
      <Text style={styles.factText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  title: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  city: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  factText: {
    color: colors.mutedLight,
    fontSize: 12,
    fontWeight: '700',
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
    color: colors.accent,
    fontSize: 19,
    fontWeight: '900',
  },
});
