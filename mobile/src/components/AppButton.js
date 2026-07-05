import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function AppButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
}) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {isSecondary ? (
        <View style={styles.secondary}>
          {icon && <Ionicons name={icon} size={17} color={colors.brand} />}
          <Text style={styles.secondaryLabel}>{label}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={['#6366F1', '#4F46E5', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primary}
        >
          {icon && <Ionicons name={icon} size={17} color="#fff" />}
          <Text style={styles.primaryLabel}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88,
  },
  primary: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondary: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    borderRadius: 14,
  },
  secondaryLabel: {
    color: colors.brand,
    fontWeight: '800',
    fontSize: 15,
  },
});
