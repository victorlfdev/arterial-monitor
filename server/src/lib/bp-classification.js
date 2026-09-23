/**
 * Blood pressure classification per AHA/ACC 2017 & WHO 2021 guidelines.
 */

/**
 * Classify blood pressure reading.
 *
 * Normal:   < 120 AND < 80
 * Elevated: >= 120 AND < 130 AND < 80
 * High 1:   >= 130 AND < 140 OR >= 80 AND < 90
 * High 2:   >= 140 OR >= 90
 */
function classifyPressure(sys, dia) {
  if (sys < 120 && dia < 80) {
    return { label: 'Normal', color: 'green', key: 'normal' };
  }
  if (sys < 130 && dia < 80) {
    return { label: 'Elevada', color: 'orange', key: 'elevated' };
  }
  if (sys < 140 || dia < 90) {
    return { label: 'Alta 1', color: 'red', key: 'high1' };
  }
  return { label: 'Alta 2', color: 'darkred', key: 'high2' };
}

/** Return true when the reading meets the "High" (Stage 1+) threshold. */
function isHighReading(sys, dia) {
  return sys >= 130 || dia >= 80;
}

/** Return true when the reading meets the "Elevated" threshold. */
function isElevatedReading(sys, dia) {
  return (sys >= 120 && sys < 130) || (dia >= 80 && dia < 90);
}

/**
 * Map a pressure category key to the correct color token.
 * Both "high1" and "high2" map to `high`.
 */
function pressureColorToken(key, tokens) {
  if (key === 'normal') return tokens.normal;
  if (key === 'elevated') return tokens.elevated;
  return tokens.high;
}

module.exports = {
  classifyPressure,
  isHighReading,
  isElevatedReading,
  pressureColorToken,
};
