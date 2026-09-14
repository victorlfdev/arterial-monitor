const { classifyPressure, isHighReading, isElevatedReading, pressureColorToken } = require('./bpClassification');

describe('classifyPressure', () => {
  describe('Normal (< 120 and < 80)', () => {
    it('classifies 110/70 as Normal', () => {
      expect(classifyPressure(110, 70)).toEqual({
        label: 'Normal',
        color: 'green',
        key: 'normal',
      });
    });

    it('classifies 119/79 as Normal', () => {
      expect(classifyPressure(119, 79)).toEqual({
        label: 'Normal',
        color: 'green',
        key: 'normal',
      });
    });

    it('classifies 100/60 as Normal', () => {
      expect(classifyPressure(100, 60)).toEqual({
        label: 'Normal',
        color: 'green',
        key: 'normal',
      });
    });
  });

  describe('Elevated (>= 120 and < 130 and < 80)', () => {
    it('classifies 120/75 as Elevated', () => {
      expect(classifyPressure(120, 75)).toEqual({
        label: 'Elevada',
        color: 'orange',
        key: 'elevated',
      });
    });

    it('classifies 129/70 as Elevated', () => {
      expect(classifyPressure(129, 70)).toEqual({
        label: 'Elevada',
        color: 'orange',
        key: 'elevated',
      });
    });
  });

  describe('High 1 (>= 130 and < 140 OR >= 80 and < 90)', () => {
    it('classifies 130/75 as Alta 1 (systolic)', () => {
      expect(classifyPressure(130, 75)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });

    it('classifies 125/85 as Alta 1 (diastolic)', () => {
      expect(classifyPressure(125, 85)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });

    it('classifies 135/85 as Alta 1', () => {
      expect(classifyPressure(135, 85)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });

    it('classifies 139/89 as Alta 1', () => {
      expect(classifyPressure(139, 89)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });
  });

  describe('High 2 (>= 140 OR >= 90)', () => {
    it('classifies 140/90 as Alta 2', () => {
      expect(classifyPressure(140, 90)).toEqual({
        label: 'Alta 2',
        color: 'darkred',
        key: 'high2',
      });
    });

    it('classifies 180/110 as Alta 2', () => {
      expect(classifyPressure(180, 110)).toEqual({
        label: 'Alta 2',
        color: 'darkred',
        key: 'high2',
      });
    });

    it('classifies 150/85 as Alta 1 (diastolic is 80-89, so High 1 via OR)', () => {
      expect(classifyPressure(150, 85)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });

    it('classifies 125/95 as Alta 1 (systolic < 140, so High 1 via OR)', () => {
      expect(classifyPressure(125, 95)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });

    it('classifies 145/70 as Alta 1 (diastolic < 90, so High 1 via OR)', () => {
      expect(classifyPressure(145, 70)).toEqual({
        label: 'Alta 1',
        color: 'red',
        key: 'high1',
      });
    });

    it('classifies 145/90 as Alta 2 (both >= thresholds)', () => {
      expect(classifyPressure(145, 90)).toEqual({
        label: 'Alta 2',
        color: 'darkred',
        key: 'high2',
      });
    });
  });
});

describe('isHighReading', () => {
  it('returns false for normal readings', () => {
    expect(isHighReading(110, 70)).toBe(false);
    expect(isHighReading(119, 79)).toBe(false);
  });

  it('returns false for elevated readings', () => {
    expect(isHighReading(120, 75)).toBe(false);
    expect(isHighReading(129, 79)).toBe(false);
  });

  it('returns true for high 1 readings', () => {
    expect(isHighReading(130, 75)).toBe(true);
    expect(isHighReading(125, 85)).toBe(true);
  });

  it('returns true for high 2 readings', () => {
    expect(isHighReading(140, 90)).toBe(true);
    expect(isHighReading(180, 110)).toBe(true);
  });
});

describe('isElevatedReading', () => {
  it('returns false for normal readings', () => {
    expect(isElevatedReading(110, 70)).toBe(false);
  });

  it('returns true for elevated readings', () => {
    expect(isElevatedReading(120, 75)).toBe(true);
    expect(isElevatedReading(129, 79)).toBe(true);
  });

  it('returns false for high readings', () => {
    expect(isElevatedReading(130, 75)).toBe(false);
    expect(isElevatedReading(140, 90)).toBe(false);
  });

  it('returns true for elevated diastolic (80-89)', () => {
    expect(isElevatedReading(110, 80)).toBe(true);
    expect(isElevatedReading(119, 89)).toBe(true);
  });
});

describe('pressureColorToken', () => {
  const tokens = {
    normal: '#06D6A0',
    elevated: '#FFD166',
    high: '#EF476F',
  };

  it('maps normal to green', () => {
    expect(pressureColorToken('normal', tokens)).toBe(tokens.normal);
  });

  it('maps elevated to orange', () => {
    expect(pressureColorToken('elevated', tokens)).toBe(tokens.elevated);
  });

  it('maps high1 to high token', () => {
    expect(pressureColorToken('high1', tokens)).toBe(tokens.high);
  });

  it('maps high2 to high token', () => {
    expect(pressureColorToken('high2', tokens)).toBe(tokens.high);
  });
});
