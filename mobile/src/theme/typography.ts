import { TextStyle } from "react-native";
import { colors } from "./colors";

export const baseTypeSizes = {
  largeTitle: 34,
  title: 22,
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  caption1: 12,
  caption2: 13,
  pressureLarge: 52,
  pressureMedium: 32,
  pressureSmall: 16,
  unit: 14,
} as const;

export const baseWeights = {
  largeTitle: 700,
  title: 600,
  headline: 600,
  body: 400,
  callout: 400,
  subhead: 400,
  footnote: 400,
  caption1: 400,
  caption2: 600,
  pressureLarge: 700,
  pressureMedium: 700,
  pressureSmall: 500,
  unit: 400,
} as const;

export const type = {
  largeTitle: { fontSize: baseTypeSizes.largeTitle, fontWeight: "700" as const, color: colors.label },
  title: { fontSize: baseTypeSizes.title, fontWeight: "600" as const, color: colors.label },
  headline: { fontSize: baseTypeSizes.headline, fontWeight: "600" as const, color: colors.label },
  body: { fontSize: baseTypeSizes.body, fontWeight: "400" as const, color: colors.label },
  callout: { fontSize: baseTypeSizes.callout, fontWeight: "400" as const, color: colors.label },
  subhead: { fontSize: baseTypeSizes.subhead, fontWeight: "400" as const, color: colors.secondaryLabel },
  footnote: { fontSize: baseTypeSizes.footnote, fontWeight: "400" as const, color: colors.secondaryLabel },
  caption1: { fontSize: baseTypeSizes.caption1, fontWeight: "400" as const, color: colors.tertiaryLabel },
  caption2: { fontSize: baseTypeSizes.caption2, fontWeight: "600" as const, color: colors.secondaryLabel },
  pressureLarge: { fontSize: baseTypeSizes.pressureLarge, fontWeight: "700" as const, letterSpacing: 1 },
  pressureMedium: { fontSize: baseTypeSizes.pressureMedium, fontWeight: "700" as const },
  pressureSmall: { fontSize: baseTypeSizes.pressureSmall, fontWeight: "500" as const },
  unit: { fontSize: baseTypeSizes.unit, fontWeight: "400" as const, color: colors.tertiaryLabel },
} as const satisfies Record<string, TextStyle>;
