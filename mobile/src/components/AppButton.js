import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
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
        styles.button,
        isSecondary ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={isSecondary ? colors.brand : colors.surface}
        />
      )}
      <Text style={[styles.label, isSecondary && styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: colors.brand,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryLabel: {
    color: colors.brand,
  },
});
