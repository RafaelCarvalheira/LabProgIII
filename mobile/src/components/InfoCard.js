import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';

export default function InfoCard({ title, value, tone = 'default' }) {
  return (
    <View style={[styles.card, tone === 'success' && styles.success]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, tone === 'success' && styles.successText]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 86,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow,
  },
  success: {
    borderColor: '#B7DCCF',
    backgroundColor: '#F0FAF5',
  },
  title: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 8,
  },
  successText: {
    color: colors.success,
  },
});
