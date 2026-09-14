import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  CartesianChart,
  Line,
  Scatter,
  useChartPressState,
} from 'victory-native';
import { useAppColors } from '../theme/colors';
import { useFontScale, scaleFont } from '../theme/fontScale';

const getNow = () => Date.now();

const CATEGORY_COLORS = {
  hypo: '#2EC4B6',
  normal: '#06D6A0',
  elevated: '#FFD166',
  high: '#EF476F',
};

const CATEGORY_LABELS = {
  hypo: 'Hipotensão',
  normal: 'Ótima/Normal',
  elevated: 'Elevada',
  high: 'Hipertensão',
};

const PressureChart = ({ readings }) => {
  const fontScale = useFontScale();
  const colors = useAppColors();
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const PERIODS = [
    { label: '24h', hours: 24 },
    { label: '7d', hours: 7 * 24 },
    { label: '30d', hours: 30 * 24 },
    { label: 'Tudo', hours: Infinity },
  ];

  const { state, isActive } = useChartPressState({
    x: 0,
    y: { sys: 0, dia: 0 },
  });

  const { chartData, count, hasData } = useMemo(() => {
    if (!readings || readings.length === 0) {
      return { chartData: [], count: 0, hasData: false };
    }

    const now = getNow();
    const period = PERIODS.find((p) => p.label === selectedPeriod);
    const cutoffMs =
      period.hours === Infinity ? 0 : period.hours * 60 * 60 * 1000;
    const cutoffDate =
      cutoffMs === 0 ? 0 : now - cutoffMs;

    const filtered = readings
      .filter((r) => {
        const ts = new Date(r.created_at).getTime();
        return (cutoffMs === 0 ? true : ts >= cutoffDate) && ts <= now;
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const mapped = filtered.map((r) => {
      const sys = r.systolic;
      const dia = r.diastolic;
      let category = 'high';
      if (sys < 90 || dia < 60) category = 'hypo';
      else if (sys < 120 && dia < 80) category = 'normal';
      else if (sys < 140 && dia < 90) category = 'elevated';

      return {
        timestamp: new Date(r.created_at).getTime(),
        sys,
        dia,
        category,
      };
    });

    return { chartData: mapped, count: mapped.length, hasData: mapped.length > 0 };
  }, [readings, selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const tooltipContent = useMemo(() => {
    if (!isActive) return null;

    const xValue = state.x.value;
    if (typeof xValue !== 'number' || !chartData.length) return null;

    let closest = chartData[0];
    let minDist = Math.abs(chartData[0].timestamp - xValue);

    for (let i = 1; i < chartData.length; i++) {
      const dist = Math.abs(chartData[i].timestamp - xValue);
      if (dist < minDist) {
        minDist = dist;
        closest = chartData[i];
      }
    }

    const date = new Date(closest.timestamp);
    const timeLabel = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      timeLabel,
      sys: closest.sys,
      dia: closest.dia,
      category: CATEGORY_LABELS[closest.category],
      color: CATEGORY_COLORS[closest.category],
    };
  }, [isActive, state.x.value, chartData]);

  const chartWidth = Math.max(350, (count * 65 || 1) + 40);

  const categories = [
    {
      name: 'Ótima/Normal',
      range: 'Abaixo de 120/80 mmHg',
      description: 'Valores ideais para a saúde cardiovascular.',
      color: colors.pressureNormal,
    },
    {
      name: 'Elevada / Pré-hipertensão',
      range: '120-139 / 80-89 mmHg',
      description: 'Atenção: risco de desenvolver hipertensão.',
      color: colors.pressureElevated,
    },
    {
      name: 'Hipertensão',
      range: 'Igual ou acima de 140/90 mmHg',
      description: 'Pressão alta. Procure orientação médica.',
      color: colors.pressureHigh,
    },
    {
      name: 'Hipotensão',
      range: 'Abaixo de 90/60 mmHg',
      description:
        'Pressão baixa. Pode causar tontura se associada a sintomas.',
      color: CATEGORY_COLORS.hypo,
    },
  ];

  if (!hasData) {
    const periodLabel = PERIODS.find((p) => p.label === selectedPeriod)?.label || '24h';
    return (
      <View
        style={{
          margin: 16,
          padding: 20,
          backgroundColor: colors.systemBackground,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text
          type="subtitle"
          style={{ marginBottom: 16, color: colors.label }}
        >
          Evolução Pressão Arterial
        </Text>
        <View
          style={{
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.tertiaryLabel, textAlign: 'center' }}>
            Nenhuma medição nas últimas {periodLabel === 'Tudo' ? '' : periodLabel}
          </Text>
        </View>
      </View>
    );
  }

  const yAxisMax = Math.ceil(
    Math.max(...chartData.map((r) => Math.max(r.sys, r.dia), 120)) / 20
  ) * 20 + 20;

  return (
    <View
      style={{
        margin: 16,
        padding: 20,
        backgroundColor: colors.systemBackground,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text type="subtitle" style={{ color: colors.label }}>
          Evolução Pressão Arterial
        </Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.label}
              onPress={() => setSelectedPeriod(period.label)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor:
                  selectedPeriod === period.label
                    ? colors.systemBlue
                    : colors.tertiarySystemBackground,
                minHeight: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: Math.max(1, scaleFont(12, fontScale)),
                  color:
                    selectedPeriod === period.label
                      ? colors.onTint
                      : colors.secondaryLabel,
                  fontWeight:
                    selectedPeriod === period.label ? 'bold' : '500',
                }}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ width: chartWidth, height: 250 }}>
        <CartesianChart
          data={chartData}
          xKey="timestamp"
          yKeys={['sys', 'dia']}
          domain={{ y: [0, yAxisMax] }}
          axisOptions={{
            tickCount: { x: Math.min(count, 6), y: 5 },
            formatXLabel: (timestamp) => {
              if (timestamp === undefined || timestamp === null) return '';
              const date = new Date(timestamp);
              return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });
            },
            formatYLabel: (value) => {
              if (value === undefined || value === null) return '';
              return `${value}`;
            },
            labelColor: colors.secondaryLabel,
            lineColor: colors.separator,
            lineWidth: { grid: { x: 0, y: 1 }, frame: 0 },
            labelOffset: { x: 4, y: -4 },
            axisSide: { x: 'bottom', y: 'left' },
            labelPosition: { x: 'outset', y: 'outset' },
          }}
          chartPressState={state}
        >
          {({ points }) => (
            <>
              <Line
                points={points.sys}
                color={CATEGORY_COLORS.high}
                strokeWidth={3}
                curveType="natural"
              />
              <Line
                points={points.dia}
                color={CATEGORY_COLORS.hypo}
                strokeWidth={3}
                curveType="natural"
              />
              {chartData.map((d, i) => (
                <Scatter
                  key={i}
                  points={[{ x: d.timestamp, y: d.sys }]}
                  color={CATEGORY_COLORS[d.category]}
                  radius={5}
                />
              ))}
            </>
          )}
        </CartesianChart>
      </View>

      {isActive && tooltipContent && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 20,
            left: chartWidth / 2 - 60,
            backgroundColor: 'rgba(0,0,0,0.85)',
            padding: 10,
            borderRadius: 8,
            minWidth: 120,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onTint,
              fontSize: Math.max(1, scaleFont(12, fontScale)),
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          >
            {tooltipContent.timeLabel}
          </Text>
          <Text
            style={{
              color: tooltipContent.color,
              fontSize: Math.max(1, scaleFont(14, fontScale)),
              fontWeight: 'bold',
              marginBottom: 4,
            }}
          >
            {tooltipContent.category}
          </Text>
          <Text
            style={{
              color: colors.onTint,
              fontSize: Math.max(1, scaleFont(13, fontScale)),
              fontWeight: 'bold',
            }}
          >
            {tooltipContent.sys}/{tooltipContent.dia} mmHg
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowCategoryModal(true)}
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          minHeight: 44,
          borderRadius: 8,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.systemBlue,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onTint,
              fontSize: Math.max(1, scaleFont(12, fontScale)),
              fontWeight: 'bold',
            }}
          >
            i
          </Text>
        </View>
        <Text
          style={{
            fontSize: Math.max(1, scaleFont(12, fontScale)),
            color: colors.systemBlue,
            fontWeight: '500',
          }}
        >
          Clique para ver a classificação das cores
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showCategoryModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View
            style={{
              width: '85%',
              maxHeight: '70%',
              backgroundColor: colors.systemBackground,
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: Math.max(1, scaleFont(18, fontScale)),
                  fontWeight: 'bold',
                  color: colors.label,
                }}
              >
                Classificação da Pressão Arterial
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text
                  style={{
                    fontSize: Math.max(1, scaleFont(24, fontScale)),
                    color: colors.secondaryLabel,
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: colors.tertiarySystemBackground,
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: cat.color,
                  }}
                >
                  <Text
                    style={{
                      fontSize: Math.max(1, scaleFont(15, fontScale)),
                      fontWeight: 'bold',
                      color: cat.color,
                      marginBottom: 4,
                    }}
                  >
                    {cat.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: Math.max(1, scaleFont(13, fontScale)),
                      fontWeight: '600',
                      color: colors.secondaryLabel,
                      marginBottom: 4,
                    }}
                  >
                    {cat.range}
                  </Text>
                  <Text
                    style={{
                      fontSize: Math.max(1, scaleFont(13, fontScale)),
                      color: colors.secondaryLabel,
                    }}
                  >
                    {cat.description}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={{
                backgroundColor: colors.systemBlue,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  color: colors.onTint,
                  fontSize: Math.max(1, scaleFont(15, fontScale)),
                  fontWeight: 'bold',
                }}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PressureChart;
