const { sanitizeString, sanitizeInput, sanitizeMedicationInput, validateReading } = require('./validations');

describe('sanitizeString', () => {
  it('returns the same string if no HTML characters', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
  });

  it('escapes HTML special characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('escapes double quotes and ampersands', () => {
    expect(sanitizeString('Tom & "Jerry"')).toBe('Tom &amp; &quot;Jerry&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeString("it's a test")).toBe('it&#x27;s a test');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitizeString(123)).toBe(123);
    expect(sanitizeString(null)).toBe(null);
    expect(sanitizeString(undefined)).toBe(undefined);
    expect(sanitizeString({})).toEqual({});
  });

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('handles multiple HTML characters', () => {
    expect(sanitizeString('<div class="test" onclick="hack()">Hello</div>')).toBe('&lt;div class=&quot;test&quot; onclick=&quot;hack()&quot;&gt;Hello&lt;/div&gt;');
  });
});

describe('sanitizeInput', () => {
  it('sanitizes string fields in the body', () => {
    const body = {
      systolic: 120,
      diastolic: 80,
      symptoms: '<p>Pain</p>',
      notes: '<div>Notes</div>',
      medication_name: "Tom & 'Jerry'",
      arm: 'left',
    };
    const result = sanitizeInput(body);
    expect(result.symptoms).toBe('&lt;p&gt;Pain&lt;/p&gt;');
    expect(result.notes).toBe('&lt;div&gt;Notes&lt;/div&gt;');
    expect(result.medication_name).toBe('Tom &amp; &#x27;Jerry&#x27;');
    expect(result.arm).toBe('left');
    expect(result.systolic).toBe(120);
  });

  it('handles empty body', () => {
    expect(sanitizeInput({})).toEqual({});
  });

  it('spreads all other fields unchanged', () => {
    const body = {
      systolic: 120,
      diastolic: 80,
      heart_rate: 72,
      medication_used: 1,
    };
    const result = sanitizeInput(body);
    expect(result.systolic).toBe(120);
    expect(result.diastolic).toBe(80);
    expect(result.heart_rate).toBe(72);
    expect(result.medication_used).toBe(1);
  });

  it('handles undefined string fields gracefully', () => {
    const body = {
      systolic: 120,
      diastolic: 80,
    };
    const result = sanitizeInput(body);
    expect(result.symptoms).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });
});

describe('sanitizeMedicationInput', () => {
  it('sanitizes medication name', () => {
    expect(sanitizeMedicationInput({ name: '<script>alert("xss")</script>' })).toMatchObject({
      name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    });
  });

  it('leaves valid name unchanged', () => {
    expect(sanitizeMedicationInput({ name: 'Losartana 50mg' })).toEqual({ name: 'Losartana 50mg' });
  });
});

describe('validateReading', () => {
  describe('valid readings', () => {
    it('accepts normal blood pressure', () => {
      expect(validateReading({ systolic: 120, diastolic: 80 })).toEqual({ valid: true });
    });

    it('accepts high blood pressure', () => {
      expect(validateReading({ systolic: 160, diastolic: 100 })).toEqual({ valid: true });
    });

    it('accepts optional heart_rate within range', () => {
      expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 72 })).toEqual({ valid: true });
    });

    it('accepts missing optional fields', () => {
      expect(validateReading({ systolic: 120, diastolic: 80 })).toEqual({ valid: true });
    });

    it('accepts edge values at boundaries', () => {
      expect(validateReading({ systolic: 21, diastolic: 20, heart_rate: 20 })).toEqual({ valid: true });
      expect(validateReading({ systolic: 600, diastolic: 400, heart_rate: 300 })).toEqual({ valid: true });
    });

    it('accepts heart_rate at boundaries', () => {
      expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 20 })).toEqual({ valid: true });
      expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 300 })).toEqual({ valid: true });
    });
  });

  describe('invalid readings', () => {
    it('rejects missing systolic', () => {
      const res = validateReading({ diastolic: 80 });
      expect(res.valid).toBe(false);
    });

    it('rejects missing diastolic', () => {
      const res = validateReading({ systolic: 120 });
      expect(res.valid).toBe(false);
    });

    it('rejects systolic <= diastolic', () => {
      expect(validateReading({ systolic: 80, diastolic: 120 }).valid).toBe(false);
      expect(validateReading({ systolic: 80, diastolic: 80 }).valid).toBe(false);
    });

    it('rejects values below minimum', () => {
      expect(validateReading({ systolic: 19, diastolic: 10 }).valid).toBe(false);
      expect(validateReading({ systolic: 120, diastolic: 19 }).valid).toBe(false);
      expect(validateReading({ systolic: 0, diastolic: 0 }).valid).toBe(false);
    });

    it('rejects values above maximum', () => {
      expect(validateReading({ systolic: 601, diastolic: 100 }).valid).toBe(false);
      expect(validateReading({ systolic: 120, diastolic: 401 }).valid).toBe(false);
    });

    it('rejects invalid heart_rate', () => {
      expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 19 }).valid).toBe(false);
      expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: 301 }).valid).toBe(false);
      expect(validateReading({ systolic: 120, diastolic: 80, heart_rate: -5 }).valid).toBe(false);
    });

    it('rejects non-integer values', () => {
      expect(validateReading({ systolic: 120.5, diastolic: 80 }).valid).toBe(false);
    });
  });
});
