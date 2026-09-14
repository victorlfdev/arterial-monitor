const {
  classifyPressure,
  isHighReading,
  isElevatedReading,
  pressureColorToken,
} = require('../bpClassification');

describe('classifyPressure', () => {
  it('classifies normal pressure', () => {
    const result = classifyPressure(110, 70);
    expect(result.label).toBe('Normal');
    expect(result.color).toBe('green');
    expect(result.key).toBe('normal');
  });

  it('classifies elevated pressure', () => {
    const result = classifyPressure(125, 75);
    expect(result.label).toBe('Elevada');
    expect(result.color).toBe('orange');
    expect(result.key).toBe('elevated');
  });

  it('classifies high1 by systolic', () => {
    const result = classifyPressure(135, 75);
    expect(result.label).toBe('Alta 1');
    expect(result.color).toBe('red');
    expect(result.key).toBe('high1');
  });

  it('classifies high1 by diastolic', () => {
    const result = classifyPressure(115, 85);
    expect(result.label).toBe('Alta 1');
    expect(result.color).toBe('red');
    expect(result.key).toBe('high1');
  });

  it('classifies high2 pressure', () => {
    const result = classifyPressure(150, 95);
    expect(result.label).toBe('Alta 2');
    expect(result.color).toBe('darkred');
    expect(result.key).toBe('high2');
  });

  it('classifies boundary normal (119/79)', () => {
    const result = classifyPressure(119, 79);
    expect(result.key).toBe('normal');
  });

  it('classifies boundary elevated (120/79)', () => {
    const result = classifyPressure(120, 79);
    expect(result.key).toBe('elevated');
  });

  it('classifies boundary high1 systolic (130/79)', () => {
    const result = classifyPressure(130, 79);
    expect(result.key).toBe('high1');
  });

  it('classifies boundary high1 diastolic (129/80)', () => {
    const result = classifyPressure(129, 80);
    expect(result.key).toBe('high1');
  });

  it('classifies boundary high2 (140/90)', () => {
    const result = classifyPressure(140, 90);
    expect(result.key).toBe('high2');
  });

  it('handles very low values', () => {
    const result = classifyPressure(60, 40);
    expect(result.key).toBe('normal');
  });

  it('handles very high values', () => {
    const result = classifyPressure(220, 130);
    expect(result.key).toBe('high2');
  });
});

describe('isHighReading', () => {
  it('returns true for high1', () => {
    expect(isHighReading(135, 85)).toBe(true);
  });

  it('returns true for high2', () => {
    expect(isHighReading(150, 95)).toBe(true);
  });

  it('returns false for normal', () => {
    expect(isHighReading(110, 70)).toBe(false);
  });

  it('returns false for elevated', () => {
    expect(isHighReading(125, 75)).toBe(false);
  });

  it('returns true when diastolic >= 80 but systolic normal', () => {
    expect(isHighReading(115, 85)).toBe(true);
  });
});

describe('isElevatedReading', () => {
  it('returns true for elevated systolic', () => {
    expect(isElevatedReading(125, 75)).toBe(true);
  });

  it('returns true for elevated diastolic range (80-89)', () => {
    expect(isElevatedReading(115, 85)).toBe(true);
  });

  it('returns false for normal', () => {
    expect(isElevatedReading(110, 70)).toBe(false);
  });

  it('returns false for high1 by systolic (130+)', () => {
    expect(isElevatedReading(135, 75)).toBe(false);
  });

  it('returns false for high2', () => {
    expect(isElevatedReading(150, 95)).toBe(false);
  });
});

describe('pressureColorToken', () => {
  const tokens = {
    normal: '#22c55e',
    elevated: '#f59e0b',
    high: '#ef4444',
  };

  it('returns normal color for normal key', () => {
    expect(pressureColorToken('normal', tokens)).toBe(tokens.normal);
  });

  it('returns elevated color for elevated key', () => {
    expect(pressureColorToken('elevated', tokens)).toBe(tokens.elevated);
  });

  it('returns high color for high1 key', () => {
    expect(pressureColorToken('high1', tokens)).toBe(tokens.high);
  });

  it('returns high color for high2 key', () => {
    expect(pressureColorToken('high2', tokens)).toBe(tokens.high);
  });
});
