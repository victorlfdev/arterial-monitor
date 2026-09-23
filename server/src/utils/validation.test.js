const { sanitizeString, sanitizeInput, sanitizeMedicationInput, validateReading, validateReadingUpdate } = require('../utils/validation');

describe('sanitizeString', () => {
  it('escapes HTML special characters', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(sanitizeString('a&b')).toBe('a&amp;b');
    expect(sanitizeString('quote: "test"')).toBe('quote: &quot;test&quot;');
    expect(sanitizeString("it's")).toBe('it&#x27;s');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitizeString(null)).toBeNull();
    expect(sanitizeString(undefined)).toBeUndefined();
    expect(sanitizeString(123)).toBe(123);
    expect(sanitizeString('plain text')).toBe('plain text');
  });
});

describe('sanitizeInput', () => {
  it('sanitizes reading input fields', () => {
    const input = {
      systolic: 120,
      diastolic: 80,
      symptoms: '<b>headache</b>',
      notes: 'test & more',
      medication_name: 'Amlodipina',
      arm: 'left',
    };
    const result = sanitizeInput(input);
    expect(result.symptoms).toBe('&lt;b&gt;headache&lt;/b&gt;');
    expect(result.notes).toBe('test &amp; more');
    expect(result.systolic).toBe(120);
    expect(result.diastolic).toBe(80);
  });
});

describe('sanitizeMedicationInput', () => {
  it('sanitizes medication name', () => {
    const input = { name: '<script>' };
    const result = sanitizeMedicationInput(input);
    expect(result.name).toBe('&lt;script&gt;');
  });

  it('passes through valid names', () => {
    const input = { name: 'Amlodipina' };
    const result = sanitizeMedicationInput(input);
    expect(result.name).toBe('Amlodipina');
  });
});

describe('validateReading', () => {
  it('rejects missing systolic', () => {
    expect(validateReading({ diastolic: 80 })).toEqual({ valid: false, error: expect.any(String) });
  });

  it('rejects missing diastolic', () => {
    expect(validateReading({ systolic: 120 })).toEqual({ valid: false, error: expect.any(String) });
  });

  it('rejects non-integer values', () => {
    expect(validateReading({ systolic: 120.5, diastolic: 80 })).toEqual({ valid: false, error: expect.any(String) });
    expect(validateReading({ systolic: '120', diastolic: 80 }).valid).toBe(false);
  });

  it('rejects values below minimum', () => {
    expect(validateReading({ systolic: 10, diastolic: 5 }).valid).toBe(false);
    expect(validateReading({ systolic: 20, diastolic: 10 }).valid).toBe(false);
  });

  it('rejects values above maximum', () => {
    expect(validateReading({ systolic: 700, diastolic: 200 }).valid).toBe(false);
    expect(validateReading({ systolic: 120, diastolic: 450 }).valid).toBe(false);
  });

  it('rejects systolic <= diastolic', () => {
    expect(validateReading({ systolic: 120, diastolic: 120 }).valid).toBe(false);
    expect(validateReading({ systolic: 80, diastolic: 120 }).valid).toBe(false);
  });

  it('accepts valid readings', () => {
    const result = validateReading({ systolic: 120, diastolic: 80 });
    expect(result.valid).toBe(true);
  });

  it('validates heart_rate bounds when provided', () => {
    expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 500 }).valid).toBe(false);
    expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: -1 }).valid).toBe(false);
    expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 60 }).valid).toBe(true);
    expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 300 }).valid).toBe(true);
  });
});

describe('validateReadingUpdate', () => {
  const existing = { systolic: 130, diastolic: 85 };

  it('uses existing values when fields not provided', () => {
    const result = validateReadingUpdate({}, existing);
    expect(result.valid).toBe(true);
  });

  it('validates partial updates', () => {
    expect(validateReadingUpdate({ systolic: 150 }, existing).valid).toBe(true);
    expect(validateReadingUpdate({ diastolic: 95 }, existing).valid).toBe(true);
    expect(validateReadingUpdate({ systolic: 80, diastolic: 85 }, existing).valid).toBe(false);
  });
});
