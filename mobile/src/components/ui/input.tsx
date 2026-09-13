import React, { useMemo } from "react";
import { TextInput, TextInputProps, View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  suffix?: string;
  error?: string;
}

export function Input({ label, placeholder, suffix, error, style, ...rest }: InputProps) {
  const fontScale = useFontScale();
  const labelSize = useMemo(() => scaleFont(15, fontScale), [fontScale]);
  const inputSize = useMemo(() => scaleFont(16, fontScale), [fontScale]);
  const suffixSize = useMemo(() => scaleFont(14, fontScale), [fontScale]);
  const errorSize = useMemo(() => scaleFont(13, fontScale), [fontScale]);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { fontSize: labelSize }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error && { borderColor: colors.systemRed },
          style,
        ]}
      >
        <TextInput
          style={[styles.textInput, { fontSize: inputSize }]}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiaryLabel}
          {...rest}
        />
        {suffix && <Text style={[styles.suffix, { fontSize: suffixSize }]}>{suffix}</Text>}
      </View>
      {error && <Text style={[styles.error, { fontSize: errorSize }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontWeight: "600" as const,
    color: colors.secondaryLabel,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    flex: 1,
    color: colors.label,
    paddingVertical: spacing.md,
  },
  suffix: {
    color: colors.tertiaryLabel,
    marginLeft: spacing.sm,
  },
  error: {
    color: colors.systemRed,
    marginTop: spacing.xs,
  },
});
