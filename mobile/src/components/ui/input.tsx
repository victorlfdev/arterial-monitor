import React, { useMemo } from "react";
import { TextInput, TextInputProps, View, Text, StyleSheet } from "react-native";
import { useAppColors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  suffix?: string;
  error?: string;
}

export function Input({ label, placeholder, suffix, error, style, ...rest }: InputProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const labelSize = useMemo(() => scaleFont(15, fontScale), [fontScale]);
  const inputSize = useMemo(() => scaleFont(16, fontScale), [fontScale]);
  const suffixSize = useMemo(() => scaleFont(14, fontScale), [fontScale]);
  const errorSize = useMemo(() => scaleFont(13, fontScale), [fontScale]);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { fontSize: labelSize, color: colors.secondaryLabel }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.systemBackground,
            borderColor: colors.separator,
          },
          error && { borderColor: colors.systemRed },
          style,
        ]}
      >
        <TextInput
          style={[styles.textInput, { fontSize: inputSize, color: colors.label }]}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiaryLabel}
          {...rest}
        />
        {suffix && <Text style={[styles.suffix, { fontSize: suffixSize, color: colors.tertiaryLabel }]}>{suffix}</Text>}
      </View>
      {error && <Text style={[styles.error, { fontSize: errorSize, color: colors.systemRed }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontWeight: "600" as const,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  suffix: {
    marginLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
  },
});
