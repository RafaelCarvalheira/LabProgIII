import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function InfoCard({ title, value, tone = 'default' }) {
  const isSuccess = tone === 'success';
  return (
    <View style={[styles.card, isSuccess && styles.successCard]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, isSuccess && styles.successValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 86,
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
  },
  successCard: {
    borderColor: 'rgba(20,184,166,0.25)',
    backgroundColor: 'rgba(20,184,166,0.06)',
  },
  title: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  successValue: {
    color: colors.accent,
  },
});
