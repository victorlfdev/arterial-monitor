import React, { useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const PressureChart = ({ readings }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return readings
      .filter((r) => {
        const date = new Date(r.created_at);
        return date >= twentyFourHoursAgo && date <= now;
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [readings]);

  const hasData = chartData.length > 0;
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = [
    {
      name: 'Ótima/Normal',
      range: 'Abaixo de 120/80 mmHg',
      description: 'Valores ideais para a saúde cardiovascular.',
      color: '#4caf50'
    },
    {
      name: 'Elevada / Pré-hipertensão',
      range: '120-139 / 80-89 mmHg',
      description: 'Atenção: risco de desenvolver hipertensão.',
      color: '#ff9800'
    },
    {
      name: 'Hipertensão',
      range: 'Igual ou acima de 140/90 mmHg',
      description: 'Pressão alta. Procure orientação médica.',
      color: '#f44336'
    },
    {
      name: 'Hipotensão',
      range: 'Abaixo de 90/60 mmHg',
      description: 'Pressão baixa. Pode causar tontura se associada a sintomas.',
      color: '#2196f3'
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
      if (sys < 90 || dia < 60) return '#2196f3';
      if (sys < 120 && dia < 80) return '#4caf50';
      if (sys < 140 && dia < 90) return '#ff9800';
      return '#f44336';
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
  }, [hasData, chartData]);

  const pointerLabelComponent = (items) => {
    if (!items || !items.length) return null;
    
    const sysValue = items[0]?.value || 0;
    const timeLabel = items[0]?.label || '';
    const diaValue = items[1]?.value || 0;
    
    const getCategoryInfo = (sys, dia) => {
      if (sys < 90 || dia < 60) return { text: 'Hipotensão', color: '#2196f3' };
      if (sys < 120 && dia < 80) return { text: 'Ótima/Normal', color: '#4caf50' };
      if (sys < 140 && dia < 90) return { text: 'Elevada', color: '#ff9800' };
      return { text: 'Hipertensão', color: '#f44336' };
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
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
          {timeLabel}
        </Text>
        <Text style={{ color: category.color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
          {category.text}
        </Text>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
          {sysValue}/{diaValue} mmHg
        </Text>
      </View>
    );
  };

  if (!hasData) {
    return (
      <View style={{ margin: 16, padding: 20, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text type="subtitle" style={{ marginBottom: 16, color: '#333' }}>
          Evolução Pressão Arterial
        </Text>
        <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#999', textAlign: 'center' }}>
            Nenhuma medição nas últimas 24 horas
          </Text>
        </View>
      </View>
    );
  }

  const chartWidth = Math.max(350, count * 65 + 40);

  return (
    <View style={{ margin: 16, padding: 20, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="subtitle" style={{ color: '#333' }}>
          Evolução Pressão Arterial
        </Text>
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
        xAxisLabelTextColor="#666"
        yAxisLabelTextColor="#666"
        xAxisTextStyle={{ color: '#666', fontSize: 10 }}
        yAxisTextStyle={{ color: '#666', fontSize: 10 }}
        xAxisColor="#ccc"
        yAxisColor="#ccc"
        rulesColor="#e0e0e0"
        hideRules={false}
        thickness={3}
        thickness2={3}
        color="#f44336"
        color2="#2196f3"
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
          pointer1Color: "#f44336",
          pointer2Color: "#2196f3",
          hidePointer1: false,
          hidePointer2: false,
          pointerEvents: 'auto',
        }}
      />

      <TouchableOpacity
        onPress={() => setShowCategoryModal(true)}
        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 8 }}
      >
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#1976d2', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>i</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#1976d2', fontWeight: '500' }}>
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
          <View style={{ width: '85%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                Classificação da Pressão Arterial
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={{ fontSize: 24, color: '#666' }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat, index) => (
                <View key={index} style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: cat.color }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: cat.color, marginBottom: 4 }}>
                    {cat.name}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 }}>
                    {cat.range}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#666' }}>
                    {cat.description}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={{ backgroundColor: '#1976d2', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PressureChart;