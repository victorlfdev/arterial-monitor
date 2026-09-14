/**
 * Input sanitization functions extracted from route handlers.
 * Used to prevent XSS attacks by escaping HTML special characters.
 */

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>&"']/g, (char) => {
    const escapes = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
    return escapes[char];
  });
}

function sanitizeInput(body) {
  return {
    ...body,
    symptoms: sanitizeString(body.symptoms),
    notes: sanitizeString(body.notes),
    medication_name: sanitizeString(body.medication_name),
    arm: sanitizeString(body.arm),
  };
}

function sanitizeMedicationInput(body) {
  return {
    ...body,
    name: sanitizeString(body.name),
  };
}

/**
 * Validate blood pressure reading values.
 * Returns { valid: true } or { valid: false, error: string }.
 */
function validateReading(body) {
  const { systolic, diastolic, heart_rate } = body;

  if (systolic === undefined || diastolic === undefined) {
    return { valid: false, error: 'Systolic and diastolic pressure are required and must be positive values' };
  }

  if (!Number.isInteger(systolic) || !Number.isInteger(diastolic)) {
    return { valid: false, error: 'Systolic and diastolic pressure must be integers' };
  }

  if (systolic < 20 || diastolic < 20) {
    return { valid: false, error: 'Pressure values are too low to be physiologically possible' };
  }

  if (systolic > 600 || diastolic > 400) {
    return { valid: false, error: 'Pressure values are outside realistic physiological range' };
  }

  if (systolic <= diastolic) {
    return { valid: false, error: 'Systolic pressure must be greater than diastolic pressure' };
  }

  if (heart_rate !== undefined && (!Number.isInteger(heart_rate) || heart_rate < 20 || heart_rate > 300)) {
    return { valid: false, error: 'Heart rate must be an integer between 20 and 300' };
  }

  return { valid: true };
}

/**
 * Validate reading updates (allows partial updates).
 */
function validateReadingUpdate(body, existing) {
  const sys = body.systolic !== undefined ? body.systolic : existing.systolic;
  const dia = body.diastolic !== undefined ? body.diastolic : existing.diastolic;

  if (sys < 20 || dia < 20) {
    return { valid: false, error: 'Systolic and diastolic pressure must be positive values' };
  }

  if (sys > 600 || dia > 400) {
    return { valid: false, error: 'Pressure values are outside realistic physiological range' };
  }

  if (sys <= dia) {
    return { valid: false, error: 'Systolic pressure must be greater than diastolic pressure' };
  }

  return { valid: true };
}

module.exports = {
  sanitizeString,
  sanitizeInput,
  sanitizeMedicationInput,
  validateReading,
  validateReadingUpdate,
};
