/**
 * Blood pressure classification per AHA/ACC 2017 & WHO 2021 guidelines.
 *
 * ┌──────────┬──────────────────┬──────────────────┐
 * │ Category │ Systolic         │ Diastolic        │
 * ├──────────┼──────────────────┼──────────────────┤
 * │ Normal   │ < 120            │ AND < 80         │
 * │ Elevated │ ≥ 120 AND < 130  │ AND < 80         │
 * │ High 1   │ ≥ 130 AND < 140  │ OR ≥ 80 AND < 90 │
 * │ High 2   │ ≥ 140            │ OR ≥ 90          │
 * └──────────┴──────────────────┴──────────────────┘
 *
 * Source:
 *   - 2017 ACC/AHA/AAFP Alert: "Blood Pressure Is Low, Not Optimal"
 *     (systolic < 120 and diastolic < 80 = normal)
 *   - 2021 WHO Guidelines for hypertension (Section 10.3):
 *     "Stage 1: clinic BP 140/90–159/104 mmHg … Stage 2: clinic BP
 *      ≥ 160/110 mmHg"  (WHO aligns Stage 1 at ≥ 140/90 for clinical
 *      diagnosis; AHA is stricter at ≥ 130/80.  The app targets
 *      self-monitored readings where AHA thresholds are more
 *      appropriate for early warning.)
 *
 * We adopt the stricter AHA thresholds so users see "Elevada" at
 * 120–129/ < 80 and "Alta 1" at 130–139 or 80–89, giving earlier
 * warnings than the clinical 140/90 diagnosis line.
 */

export type PressureCategory = "normal" | "elevated" | "high1" | "high2";

export interface PressureResult {
  label: string;
  color: "green" | "orange" | "red" | "darkred";
  /** AHA category key (lowercase) */
  key: PressureCategory;
}

export function classifyPressure(sys: number, dia: number): PressureResult {
  if (sys < 120 && dia < 80) {
    return { label: "Normal", color: "green", key: "normal" };
  }
  if (sys < 130 && dia < 80) {
    return { label: "Elevada", color: "orange", key: "elevated" };
  }
  if (sys < 140 || dia < 90) {
    return { label: "Alta 1", color: "red", key: "high1" };
  }
  return { label: "Alta 2", color: "darkred", key: "high2" };
}

/** Return true when the reading meets the "High" (Stage 1+) threshold. */
export function isHighReading(sys: number, dia: number): boolean {
  return sys >= 130 || dia >= 80;
}

/** Return true when the reading meets the "Elevated" threshold. */
export function isElevatedReading(sys: number, dia: number): boolean {
  return (sys >= 120 && sys < 130) || (dia >= 80 && dia < 90);
}

export interface PressureColorTokens {
  normal: string;
  elevated: string;
  high: string;
}

/**
 * Map a pressure category key to the correct color token.
 * Both "high1" and "high2" map to `high` — the distinction is only in the label.
 */
export function pressureColorToken(
  key: PressureCategory,
  tokens: PressureColorTokens
): string {
  if (key === "normal") return tokens.normal;
  if (key === "elevated") return tokens.elevated;
  return tokens.high;
}
