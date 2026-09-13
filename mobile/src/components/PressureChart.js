import React, { useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useAppColors } from '../theme/colors';
import { useFontScale, scaleFont } from '../theme/fontScale';

const PressureChart = ({ readings }) => {
  const fontScale = useFontScale();
  const fs = (base) => scaleFont(base, fontScale);
  const colors = useAppColors();
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const PERIODS = [
    { label: '24h', hours: 24 },
    { label: '7d', hours: 7 * 24 },
    { label: '30d', hours: 30 * 24 },
    { label: 'Tudo', hours: Infinity },
  ];

  const chartData = useMemo(() => {
    const now = new Date();
    const period = PERIODS.find(p => p.label === selectedPeriod);
    const cutoffMs = period.hours === Infinity ? 0 : period.hours * 60 * 60 * 1000;
    const cutoffDate = cutoffMs === 0 ? new Date(0) : new Date(now.getTime() - cutoffMs);

    return readings
      .filter((r) => {
        const date = new Date(r.created_at);
        return date >= cutoffDate && date <= now;
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [readings, selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasData = chartData.length > 0;
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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
      description: 'Pressão baixa. Pode causar tontura se associada a sintomas.',
      color: colors.systemBlue,
    }
  ];

  const { sysData, diaData, minMax, count } = useMemo(() => {
    if (!hasData || chartData.length === 0) return { sysData: [], diaData: [], minMax: { min: 0, max: 120 }, count: 0 };

    const sysValues = chartData.map((r) => r.systolic);
    const diaValues = chartData.map((r) => r.diastolic);
    const allValues = [...sysValues, ...diaValues];
    
    const maxVal = Math.ceil(Math.max(...allValues, 120) / 20) * 20;
    const minVal = Math.max(0, Math.floor(Math.min(...allValues, 80) / 20) * 20);

    const getCategory = (sys, dia) => {
      if (sys < 90 || dia < 60) return colors.systemBlue;
      if (sys < 120 && dia < 80) return colors.pressureNormal;
      if (sys < 140 && dia < 90) return colors.pressureElevated;
      return colors.pressureHigh;
    };

    const sysData = chartData.map((r) => ({
      label: new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: r.systolic,
      dataPointColor: getCategory(r.systolic, r.diastolic),
      dataPointValueColor: getCategory(r.systolic, r.diastolic),
    }));

    const diaData = chartData.map((r) => ({
      value: r.diastolic,
      dataPointColor: getCategory(r.systolic, r.diastolic),
    }));

    return { sysData, diaData, minMax: { min: minVal, max: maxVal }, count: chartData.length };
  }, [hasData, chartData, colors]);

  const pointerLabelComponent = (items) => {
    if (!items || !items.length) return null;
    
    const sysValue = items[0]?.value || 0;
    const timeLabel = items[0]?.label || '';
    const diaValue = items[1]?.value || 0;
    
    const getCategoryInfo = (sys, dia) => {
      if (sys < 90 || dia < 60) return { text: 'Hipotensão', color: colors.systemBlue };
      if (sys < 120 && dia < 80) return { text: 'Ótima/Normal', color: colors.pressureNormal };
      if (sys < 140 && dia < 90) return { text: 'Elevada', color: colors.pressureElevated };
      return { text: 'Hipertensão', color: colors.pressureHigh };
    };

    const category = getCategoryInfo(sysValue, diaValue);
    
    return (
      <View style={{ 
        backgroundColor: 'rgba(0,0,0,0.85)', 
        padding: 10, 
        borderRadius: 8,
        minWidth: 120,
        marginBottom: 45
      }}>
        <Text style={{ color: colors.onTint, fontSize: fs(12), fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
          {timeLabel}
        </Text>
        <Text style={{ color: category.color, fontSize: fs(14), fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
          {category.text}
        </Text>
        <Text style={{ color: colors.onTint, fontSize: fs(13), fontWeight: 'bold', textAlign: 'center' }}>
          {sysValue}/{diaValue} mmHg
        </Text>
      </View>
    );
  };

  const periodLabel = PERIODS.find(p => p.label === selectedPeriod)?.label || '24h';

  if (!hasData) {
    return (
      <View style={{ margin: 16, padding: 20, backgroundColor: colors.systemBackground, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text type="subtitle" style={{ marginBottom: 16, color: colors.label }}>
          Evolução Pressão Arterial
        </Text>
        <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.tertiaryLabel, textAlign: 'center' }}>
            Nenhuma medição nas últimas {periodLabel === 'Tudo' ? '' : periodLabel}
          </Text>
        </View>
      </View>
    );
  }

  const chartWidth = Math.max(350, count * 65 + 40);

  return (
    <View style={{ margin: 16, padding: 20, backgroundColor: colors.systemBackground, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
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
                backgroundColor: selectedPeriod === period.label ? colors.systemBlue : colors.tertiarySystemBackground,
                minHeight: 44,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{
                fontSize: fs(12),
                color: selectedPeriod === period.label ? colors.onTint : colors.secondaryLabel,
                fontWeight: selectedPeriod === period.label ? 'bold' : '500',
              }}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <LineChart
        data={sysData}
        data2={diaData}
        width={chartWidth}
        height={250}
        spacing={50}
        yAxisLabelWidth={35}
        noOfSections={5}
        maxValue={minMax.max + 20}
        mostNegativeValue={Math.max(0, minMax.min - 20)}
        stepValue={20}
        xAxisLabelTextColor={colors.secondaryLabel}
        yAxisLabelTextColor={colors.secondaryLabel}
        xAxisTextStyle={{ color: colors.secondaryLabel, fontSize: fs(10) }}
        yAxisTextStyle={{ color: colors.secondaryLabel, fontSize: fs(10) }}
        xAxisColor={colors.separator}
        yAxisColor={colors.separator}
        rulesColor={colors.separator}
        hideRules={false}
        thickness={3}
        thickness2={3}
        color={colors.pressureHigh}
        color2={colors.systemBlue}
        hideDataPoints={false}
        dataPointRadius={5}
        initialSpacing={20}
        endSpacing={20}
        pointerConfig={{
          pointerStripColor: "rgba(100,100,100,0.4)",
          pointerStripWidth: 2,
          pointerStripHeight: 1,
          pointerStripUptoDataPoint: false,
          pointerVanishDelay: 0,
          activatePointersInstantlyOnTouch: true,
          activatePointersOnLongPress: true,
          activatePointersDelay: 300,
          pointerLabelComponent: pointerLabelComponent,
          shiftPointerLabelX: 0,
          shiftPointerLabelY: -50,
          pointerLabelWidth: 120,
          pointerLabelHeight: 70,
          autoAdjustPointerLabelPosition: true,
          pointer1Color: colors.pressureHigh,
          pointer2Color: colors.systemBlue,
          hidePointer1: false,
          hidePointer2: false,
          pointerEvents: 'auto',
        }}
      />

      <TouchableOpacity
        onPress={() => setShowCategoryModal(true)}
        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, minHeight: 44, borderRadius: 8 }}
      >
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.systemBlue, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colors.onTint, fontSize: fs(12), fontWeight: 'bold' }}>i</Text>
        </View>
        <Text style={{ fontSize: fs(12), color: colors.systemBlue, fontWeight: '500' }}>
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
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={{ width: '85%', maxHeight: '70%', backgroundColor: colors.systemBackground, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: fs(18), fontWeight: 'bold', color: colors.label }}>
                Classificação da Pressão Arterial
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={{ fontSize: fs(24), color: colors.secondaryLabel }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat, index) => (
                <View key={index} style={{ marginBottom: 16, padding: 12, backgroundColor: colors.tertiarySystemBackground, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: cat.color }}>
                  <Text style={{ fontSize: fs(15), fontWeight: 'bold', color: cat.color, marginBottom: 4 }}>
                    {cat.name}
                  </Text>
                  <Text style={{ fontSize: fs(13), fontWeight: '600', color: colors.secondaryLabel, marginBottom: 4 }}>
                    {cat.range}
                  </Text>
                  <Text style={{ fontSize: fs(13), color: colors.secondaryLabel }}>
                    {cat.description}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={{ backgroundColor: colors.systemBlue, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}
            >
              <Text style={{ color: colors.onTint, fontSize: fs(15), fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PressureChart;
