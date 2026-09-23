const { classifyPressure, isHighReading, isElevatedReading, pressureColorToken } = require('../lib/bp-classification');

describe('classifyPressure', () => {
  it('returns Normal for readings below 120/80', () => {
    expect(classifyPressure(110, 70)).toEqual({ label: 'Normal', color: 'green', key: 'normal' });
    expect(classifyPressure(100, 60)).toEqual({ label: 'Normal', color: 'green', key: 'normal' });
    expect(classifyPressure(119, 79)).toEqual({ label: 'Normal', color: 'green', key: 'normal' });
  });

  it('returns Elevated for systolic 120-129 and diastolic < 80', () => {
    expect(classifyPressure(120, 70)).toEqual({ label: 'Elevada', color: 'orange', key: 'elevated' });
    expect(classifyPressure(129, 79)).toEqual({ label: 'Elevada', color: 'orange', key: 'elevated' });
    expect(classifyPressure(120, 79)).toEqual({ label: 'Elevada', color: 'orange', key: 'elevated' });
  });

  it('returns High 1 for systolic 130-139 or diastolic 80-89', () => {
    expect(classifyPressure(130, 80)).toEqual({ label: 'Alta 1', color: 'red', key: 'high1' });
    expect(classifyPressure(139, 89)).toEqual({ label: 'Alta 1', color: 'red', key: 'high1' });
    expect(classifyPressure(130, 70)).toEqual({ label: 'Alta 1', color: 'red', key: 'high1' });
    expect(classifyPressure(120, 85)).toEqual({ label: 'Alta 1', color: 'red', key: 'high1' });
  });

  it('returns High 2 for systolic >= 140 or diastolic >= 90', () => {
    expect(classifyPressure(140, 90)).toEqual({ label: 'Alta 2', color: 'darkred', key: 'high2' });
    expect(classifyPressure(180, 110)).toEqual({ label: 'Alta 2', color: 'darkred', key: 'high2' });
    expect(classifyPressure(145, 95)).toEqual({ label: 'Alta 2', color: 'darkred', key: 'high2' });
    expect(classifyPressure(150, 95)).toEqual({ label: 'Alta 2', color: 'darkred', key: 'high2' });
  });
});

describe('isHighReading', () => {
  it('returns true for Stage 1+ readings', () => {
    expect(isHighReading(130, 80)).toBe(true);
    expect(isHighReading(130, 70)).toBe(true);
    expect(isHighReading(120, 85)).toBe(true);
  });

  it('returns false for normal and elevated readings', () => {
    expect(isHighReading(110, 70)).toBe(false);
    expect(isHighReading(120, 75)).toBe(false);
  });
});

describe('isElevatedReading', () => {
  it('returns true for elevated readings', () => {
    expect(isElevatedReading(120, 75)).toBe(true);
    expect(isElevatedReading(129, 85)).toBe(true);
  });

  it('returns false for non-elevated readings', () => {
    expect(isElevatedReading(110, 70)).toBe(false);
    expect(isElevatedReading(130, 80)).toBe(true);
  });
});

describe('pressureColorToken', () => {
  const tokens = { normal: 'green', elevated: 'orange', high: 'red' };

  it('maps normal to normal token', () => {
    expect(pressureColorToken('normal', tokens)).toBe('green');
  });

  it('maps elevated to elevated token', () => {
    expect(pressureColorToken('elevated', tokens)).toBe('orange');
  });

  it('maps high1 and high2 to high token', () => {
    expect(pressureColorToken('high1', tokens)).toBe('red');
    expect(pressureColorToken('high2', tokens)).toBe('red');
  });
});
