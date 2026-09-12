📋 Plano Completo — Medidor de Pressão Arterial
1. Arquitetura Geral
┌────────────────────────────────────────────────────────┐
│  CasaOS Server (Linux + Docker Compose)                │
│                                                        │
│  ┌──────────────────────┐     ┌─────────────────────┐ │
│  │   Express API        │────►│  SQLite             │ │
│  │   :3001              │     │  /casaos/apps/data/ │ │
│  │   REST endpoints     │     │  readings.db        │ │
│  └──────────────────────┘     └─────────────────────┘ │
└────────────────────────────────────────────────────────┘
            │ Tailscale IP :3001 (HTTPS opcional)
            │
┌──────────▼──────────────────────────────────────────┐
│  React Native (Expo) — Android APK                  │
│                                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────────┐  │
│  │  Home  │ │ Formul │ │Histórico│ │  Config     │  │
│  └────────┘ └────────┘ └────────┘ └─────────────┘  │
│                                                       │
│  Local: expo-sqlite (offline-first)                   │
│  Sync: fetch ao abrir / botão atualizar               │
│  Alarmes: expo-notifications                          │
└────────────────────────────────────────────────────────┘

  [FUTURO] Next.js Web → mesma API REST
2. Estrutura de Pastas
arterial-monitor/
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.js            # entry point (Express server)
│   │   ├── db/
│   │   │   ├── database.js     # SQLite init + migrations
│   │   │   └── seed.js         # medicamentos padrão
│   │   ├── routes/
│   │   │   ├── readings.js     # CRUD de medições
│   │   │   └── medications.js  # CRUD de medicamentos
│   │   └── middleware/
│   │       └── errorHandler.js
│   └── Dockerfile
│
├── mobile/
│   ├── package.json
│   ├── app.json                # config Expo
│   ├── eas.json                # config EAS Build
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.js
│   │   │   ├── NewReadingScreen.js
│   │   │   ├── HistoryScreen.js
│   │   │   └── SettingsScreen.js
│   │   ├── components/
│   │   │   ├── ReadingCard.js
│   │   │   ├── MeasurementForm.js
│   │   │   ├── SyncStatus.js
│   │   │   └── PressureChart.js
│   │   ├── services/
│   │   │   ├── api.js            # fetch wrapper (axios ou fetch)
│   │   │   ├── sync.js           # lógica sync local ↔ servidor
│   │   │   ├── localDB.js        # expo-sqlite operations
│   │   │   └── notifications.js  # alarmes locais
│   │   ├── navigation/
│   │   │   └── AppNavigator.js   # react-navigation stack
│   │   └── constants/
│   │       └── server.js         # SERVER_URL (Tailscale IP)
│   └── android/
│
├── docker-compose.yml
└── README.md
3. Backend — Express + SQLite
3.1 Dependências do Servidor
{
  "dependencies": {
    "express": "^4.18.0",
    "better-sqlite3": "^9.0.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
3.2 Modelo de Dados (SQLite)
CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Medicamentos padrão
INSERT INTO medications (name) VALUES
  ('Losartana'),
  ('Enalapril'),
  ('Atenolol'),
  ('Hidroclorotiazida'),
  ('Amlodipina'),
  ('Outro');

CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heart_rate INTEGER,
  medication_used INTEGER DEFAULT 0,  -- 0 = não, 1 = sim
  medication_name TEXT,
  symptoms TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_readings_created ON readings(created_at);
CREATE INDEX idx_readings_sync ON readings(updated_at);
3.3 Endpoints da API
Método	Endpoint	Descrição
GET	/api/readings	Lista todas (query: ?since=<ISO>&limit=100)
GET	/api/readings/:id	Detalhe de uma medição
POST	/api/readings	Cria nova medição
PUT	/api/readings/:id	Edita existente
DELETE	/api/readings/:id	Remove (soft delete: deleted_at)
GET	/api/medications	Lista medicamentos cadastrados
POST	/api/medications	Adiciona medicamento personalizado
Exemplo de resposta (GET /api/readings):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "systolic": 130,
      "diastolic": 85,
      "heart_rate": 72,
      "medication_used": 1,
      "medication_name": "Losartana",
      "symptoms": "Leve tontura",
      "notes": "Medido após café",
      "created_at": "2025-09-12T07:30:00",
      "updated_at": "2025-09-12T07:30:00"
    }
  ],
  "count": 1
}
4. Mobile — React Native (Expo)
4.1 Dependências do App
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@expo/vector-icons": "^14.0.0",
    "expo-sqlite": "~13.1.0",
    "expo-notifications": "~0.24.0",
    "expo-device": "~5.0.0",
    "expo-network": "~5.0.0",
    "victory-native": "^37.0.0",
    "react-native-svg": "14.1.0",
    "date-fns": "^3.0.0",
    "zustand": "^4.4.0"
  }
}
4.2 Telas do App
Tela 1: Home
┌──────────────────────────────┐
│  Pressão Arterial Monitor    │
│                              │
│  Última medição:             │
│  ┌────────────────────────┐  │
│  │  130/85 mmHg           │  │
│  │  72 bpm | 12/09 07:30  │  │
│  └────────────────────────┘  │
│                              │
│  Medicamento: Losartana ✓    │
│  Sintomas: Leve tontura      │
│                              │
│  [  +  NOVA MEDIÇÃO  ]  ← FAB│
│                              │
│  Configurações       │🔄 Sync│
└──────────────────────────────┘
- Card com última medição
- FAB para nova medição
- Botão sync manual
- Indicador de conexão
- Link para configurações
Tela 2: Nova Medição
┌──────────────────────────────┐
│  ← Nova Medição              │
│                              │
│  Pressão Sistólica           │
│  [____] mmHg                 │
│                              │
│  Pressão Diastólica          │
│  [____] mmHg                 │
│                              │
│  Frequência Cardíaca         │
│  [____] bpm                  │
│                              │
│  Medicamento no dia?         │
│  ○ Não  ● Sim                │
│                              │
│  Medicamento:                │
│  [Losartana ▼]               │
│                              │
│  Sintomas (opcional):        │
│  [_____________]             │
│                              │
│  Notas (opcional):           │
│  [_____________]             │
│                              │
│  [  SALVAR  ]                │
└──────────────────────────────┘
Tela 3: Histórico
┌──────────────────────────────┐
│  ← Histórico                 │
│                              │
│  [GRÁFICO DE PRESSÃO]       │
│  160 │    ╱╲                │
│      │   ╱  ╲╱╲              │
│  120 │╱╲╱    ╲╱  ╲           │
│      └──────┴──────┴──→ data │
│                              │
│  Filtro: [Últimas 7 dias ▼]│
│                              │
│  ──────────────────────────  │
│  130/85 | 72 bpm             │
│  12/09 07:30 | Losartana    │
│  ──────────────────────────  │
│  125/80 | 68 bpm             │
│  11/09 06:45 | Não           │
│  ──────────────────────────  │
│  135/90 | 75 bpm             │
│  10/09 07:00 | Atenolol      │
│                              │
│  Total: 47 medições          │
└──────────────────────────────┘
Tela 4: Configurações
┌──────────────────────────────┐
│  ← Configurações             │
│                              │
│  🔔 LEMBRETES               │
│  ┌────────────────────────┐  │
│  │ Medição Matinal         │  │
│  │ 07:00    ● Ativo/Off    │  │
│ └────────────────────────┘  │
│ ┌────────────────────────┐  │
│ │ Medição Vespertina      │  │
│ │ 19:00    ● Ativo/Off    │  │
│ └────────────────────────┘  │
│                              │
│  💊 MEDICAMENTOS            │
│  ┌────────────────────────┐  │
│  │ Losartana    [editar]  │  │
│  │ Atenolol     [editar]  │  │
│  │ + Adicionar            │  │
│  └────────────────────────┘  │
│                              │
│  🌐 SERVIDOR                │
│  URL: tailscale_ip:3001      │
│  [Testar Conexão]            │
│  Status: ● Conectado         │
│                              │
│  📤 EXPORTAR DADOS           │
│  [JSON]  [CSV]               │
│                              │
│  🗑️ LIMPAR DADOS LOCAIS     │
│  [Limpar]                    │
└──────────────────────────────┘
4.3 Estado Global (Zustand)
// store/useStore.js
export const useStore = create((set) => ({
  serverUrl: 'http://<tailscale_ip>:3001',
  readings: [],
  medications: [],
  isConnected: true,
  pendingSync: false,
  alarms: [],

  addReading: (reading) => set((state) => ({
    readings: [reading, ...state.readings],
  })),

  syncUp: async () => { /* POST local → servidor */ },
  syncDown: async () => { /* GET servidor → local */ },
  toggleAlarm: (id) => set((state) => ({ ... })),
  addMedication: (name) => set((state) => ({ ... })),
}));
5. Lógica de Sincronização
┌─────────────────────────────────────────────┐
│           FLUXO DE SYNCRONIZAÇÃO             │
│                                              │
│  1. App abre → verifica conexão (expo-network)│
│                                              │
│  2. Se conectado:                             │
│     a. Baixa dados recentes:                  │
│        GET /api/readings?since=last_sync      │
│                                              │
│     b. Envia dados pendentes (offline-only):  │
│        POST /api/readings (um por um)         │
│                                              │
│     c. Atualiza expo-sqlite local             │
│     d. Atualiza timestamp last_sync           │
│                                              │
│  3. Se offline:                               │
│     → Operações 100% locais                   │
│     → Dados salvos local com synced_at=NULL   │
│     → Sync automático ao reconectar           │
│                                              │
│  4. Botão manual "Atualizar" faz sync           │
└─────────────────────────────────────────────┘
Lógica de resolução de conflitos
- Server wins: Se o mesmo ID existe no servidor, usa versão do servidor
- Local wins (default): Se não existe no servidor, envia para o servidor
- Created_at é a fonte de verdade para ordenação
6. Alarmes Locais (expo-notifications)
// services/notifications.js
import * as Notifications from 'expo-notifications';

// Schema de notificação
const schema = {
  trigger: {
    type: 'notification.CronTrigger',  // ou periodicInApp
    second: 0,
    minute: 0,
    hour: 7,  // exemplo: 07:00
    dayOfWeek: 0,  // todos os dias
  },
  content: {
    title: '⏰ Hora da medição!',
    body: 'Registre sua pressão arterial no app',
    sound: 'default',
  },
  identifier: 'medicao-matinal',
};

// Habilitar notificações
async function scheduleNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Hora da medição!',
      body: 'Registre sua pressão arterial',
    },
    trigger: {
      weekday: NotificationPickerInput.WEEKDAY.LOCAL,
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });
}
7. Deploy
7.1 Docker Compose (CasaOS)
version: "3"
services:
  bp-api:
    build: ./server
    container_name: bp-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data          # persistência SQLite
    environment:
      - NODE_ENV=production
    networks:
      - casaos

networks:
  casaos:
    external: true
7.2 Dockerfile (Server)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["node", "src/index.js"]
7.3 Build APK (EAS Build)
# No projeto mobile/
npx eas-cli build --platform android --profile production
# Ou desenvolvimento:
npx expo run:android
eas.json:
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
8. Gráficos (victory-native)
// components/PressureChart.js
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';

export default function PressureChart({ readings }) {
  const systolicData = readings.map(r => ({
    x: new Date(r.created_at),
    y: r.systolic,
  }));

  return (
    <VictoryChart domainPadding={30} height={200}>
      <VictoryLine
        data={systolicData}
        style={{ data: { stroke: '#e74c3c', strokeWidth: 2 } }}
      />
      <VictoryAxis
        dependentAxis
        tickData={[100, 120, 140, 160]}
        title="mmHg"
      />
    </VictoryChart>
  );
}
9. Checklist de Implementação
- 1. Criar estrutura do servidor (Express + SQLite)
- 2. Implementar endpoints CRUD de medições
- 3. Implementar endpoints de medicamentos
- 4. Criar Dockerfile + docker-compose.yml
- 5. Testar server localmente
- 6. Criar estrutura do projeto Expo
- 7. Configurar navegação (react-navigation)
- 8. Implementar HomeScreen
- 9. Implementar NewReadingScreen (formulário)
- 10. Implementar HistoryScreen (lista + gráfico)
- 11. Implementar SettingsScreen (alarmes, meds)
- 12. Configurar expo-sqlite (banco local)
- 13. Implementar serviço de sync (local ↔ servidor)
- 14. Configurar expo-notifications (alarmes)
- 15. Testar sync completo
- 16. Build APK (EAS Build)
- 17. Testar APK no celular
- 18. Futuro Web version (Next.js)
10. Estimativa de Tempo
Fase	Estimativa
Server (API + SQLite)	2-3h
Mobile (telas + navegação)	3-4h
Sync + banco local	2-3h
Alarmes + notificações	1-2h
Gráficos + UI polish	2-3h
Build + testes APK	1-2h
Total estimado	11-17h
O plano está completo e pronto para implementação. Alguma alteração ou dúvida antes de começar?