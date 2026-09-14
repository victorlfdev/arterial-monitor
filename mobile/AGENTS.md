# PressãoViva — Mobile Project Context (Expo SDK 57)

## 1. Visão Geral

**PressãoViva** é um aplicativo mobile para monitoramento de pressão arterial em casa, destinado ao público brasileiro (idioma: Português do Brasil). O app permite que pacientes registrem medições de pressão sistólica/diastólica, frequência cardíaca, medicamentos e sintomas, com visualização histórica, gráficos e gamificação de consistência.

### Status das funcionalidades

- **Implementado**: registro de medições, histórico com filtros, gráficos de tendência, classificação de pressão, lembretes por push notifications, sincronização local/servidor, tracking de medicamentos, streaks de consistência (dias seguidos), challenges semanais
- **Em planejamento**: autenticação de usuários, gráfico de conexões sociais, visibilidade compartilhada de leituras, gamificação avançada (badges, conquistas)

### Propósito de negócio

Monitoramento domiciliar de hipertensão com gamificação para aumentar a consistência do paciente nas medições, facilitando o acompanhamento médico.

---

## 2. Stack Técnica

### Runtime & Framework

| Package | Versão | Notas |
|---------|--------|-------|
| expo | ~57.0.22 | SDK 57 |
| expo-router | ~57.0.21 | File-based routing + NativeTabs |
| react | 19.2.3 | |
| react-native | 0.86.3 | |
| typescript | ~6.0.3 | strict: true |

### Persistência & Sincronização

| Package | Versão | Uso |
|---------|--------|-----|
| expo-sqlite | ^57.0.3 | Banco local (bp-monitor.db) |
| zustand | ^5.0.15 | State management global |
| @react-native-async-storage/async-storage | 2.2.0 | Configurações locais (server URL) |

### UI & Visual

| Package | Versão | Uso |
|---------|--------|-----|
| @expo/vector-icons | ^15.1.1 | Ícones Material Design + SF Symbols |
| expo-linear-gradient | ~57.0.2 | Gradientes coral/teal |
| expo-glass-effect | ~57.0.3 | Efeitos glass |
| expo-symbols | ~57.0.3 | SF Symbols |
| @shopify/react-native-skia | 2.6.2 | Renderização GPU (se utilizada) |
| react-native-gifted-charts | ^1.4.78 | Gráficos de tendência |
| victory-native | ^42.0.1 | Gráficos alternativos |
| react-native-reanimated | ^4.5.1 | Animações nativas |
| react-native-gesture-handler | ~2.32.0 | Gestos |
| react-native-safe-area-context | ~5.7.0 | Safe area insets |
| react-native-screens | ~4.26.0 | Native stack screens |
| react-native-svg | 15.15.4 | SVG rendering |

### Utilitários

| Package | Versão | Uso |
|---------|--------|-----|
| date-fns | ^4.4.0 | Formatação de datas (pt-BR locale) |
| expo-notifications | ^57.0.18 | Push notifications / reminders |
| expo-linking | ~57.0.10 | Deep linking |
| expo-system-ui | ~57.0.4 | System UI control |
| expo-navigation-bar | ~57.0.2 | Android navigation bar |
| expo-status-bar | ~57.0.1 | Status bar control |
| expo-constants | ~57.0.18 | Env variables |
| expo-device | ~57.0.2 | Device info |
| expo-network | ^57.0.2 | Network status |
| expo-font | ~57.0.4 | Font loading |
| expo-image | ~57.0.5 | Image handling |
| expo-splash-screen | ~57.0.9 | Splash screen |
| expo-web-browser | ~57.0.3 | Web browsing |

### Dev Dependencies

| Package | Versão |
|---------|--------|
| jest | ^30.5.1 |
| jest-expo | ^57.0.5 |
| @testing-library/jest-native | ^5.4.3 |
| @testing-library/react-native | ^14.0.1 |
| eslint | ^9.0.0 |
| eslint-config-expo | ~57.0.2 |

### Dependências de Terceiros (compatibilidade SDK 57)

- `@react-native-async-storage/async-storage` — compatível com SDK 57
- `@shopify/react-native-skia` 2.6.2 — inclui assets WASM (`*.wasm`), configurado no metro.config.js
- `react-native-gifted-charts` — biblioteca de gráficos (não é package Expo SDK)
- `victory-native` — gráfico alternativo (não é package Expo SDK)

---

## 3. Estrutura de Pastas

```
mobile/
├── app.json                           # Config Expo: nome "PressãoViva", slug, plugins
├── babel.config.js                    # Expo preset + reanimated plugin
├── metro.config.js                    # Expo metro config + WASM asset extension
├── tsconfig.json                      # strict: true, path alias @/* → ./src/*
├── package.json
│
├── src/
│   ├── app/                           # expo-router: rotas e screens
│   │   ├── _layout.tsx                # Root layout: NativeTabs (5 tabs) + ThemeProvider
│   │   │
│   │   ├── (home)/                    # Tab: Início
│   │   │   ├── index.tsx              # Home screen com medidas, streaks, família
│   │   │   ├── _layout.tsx            # Home layout
│   │   │   └── new-reading.tsx        # Formulário: nova medição / edição
│   │   │
│   │   ├── (graficos)/                # Tab: Gráficos
│   │   │   ├── index.tsx              # Gráficos de tendência
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── (conquistas)/              # Tab: Conquistas / gamificação
│   │   │   ├── index.tsx
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── (amigos)/                  # Tab: Família/Amigos (hardcoded)
│   │   │   ├── index.tsx
│   │   │   └── _layout.tsx
│   │   │
│   │   └── (profile)/                 # Tab: Perfil/Configurações
│   │       ├── index.tsx
│   │       └── _layout.tsx
│   │
│   ├── theme/                         # Design tokens
│   │   ├── index.ts                   # Re-export (colors, spacing, typography, radius, shadows, motion)
│   │   ├── colors.ts                  # Cores (iOS native + manual Android, claro/escuro via useColorScheme)
│   │   ├── spacing.ts                 # xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32
│   │   ├── radius.ts                  # Border radius tokens
│   │   ├── shadows.ts                 # Shadow definitions
│   │   ├── typography.ts              # Font sizes + weights (iOS-style: largeTitle, title, headline, body, etc.)
│   │   ├── motion.ts                  # Animação durations
│   │   └── fontScale.ts               # Acessibilidade: escala de fonte dinâmica
│   │
│   ├── store/
│   │   └── useAppStore.js             # Zustand: readings, medications, loading, syncing, sync state
│   │
│   ├── services/
│   │   ├── api.js                     # HTTP clients: getReadings, createReading, updateReading, deleteReading,
│   │   │                               # getMedications, createMedication, updateMedication, deleteMedication,
│   │   │                               # checkHealth — usa getServerUrl() para URL base
│   │   ├── localDB.js                 # expo-sqlite: CRUD local (bp-monitor.db)
│   │   │                               # Tabela readings com columns: id, server_id, systolic, diastolic,
│   │   │                               # heart_rate, medication_used, medication_name, symptoms, notes, arm,
│   │   │                               # created_at, updated_at, synced_at
│   │   │                               # Migrations inline via PRAGMA table_info checks
│   │   │                               # Validação de inputs: sys 20-500, dia 10-300, hr 20-300
│   │   ├── sync.js                    # fullSync, syncUp (local→servidor), syncDown (servidor→local)
│   │   │                               # Usa AsyncStorage para LAST_SYNC_KEY timestamp
│   │   └── notifications.js           # expo-notifications wrapper: requestPermissions, scheduleDailyAlarm, cancelAlarm
│   │
│   ├── lib/
│   │   └── bpClassification.ts        # Classificação AHA/ACC 2017: Normal, Elevada, Alta 1, Alta 2
│   │
│   ├── constants/
│   │   └── server.js                  # Server URL config com AsyncStorage + env var fallback
│   │                               # DEFAULT_SERVER_URL: "http://100.76.124.1:3001" (Tailscale IP)
│   │
│   └── components/
│       └── ui/                        # Componentes reusáveis
│           ├── badge.tsx              # Badge de categoria de pressão
│           ├── button.tsx             # Botão base
│           ├── card.tsx               # Card container
│           ├── chip.tsx               # Chip seletor
│           ├── Icon.tsx               # Ícone Material Design (name prop)
│           ├── empty-state-view.tsx   # Estado vazio com CTA
│           ├── feature-card.tsx       # Card de funcionalidades
│           ├── family-member-row.tsx  # Linha de membro da família
│           ├── gradient-button.tsx    # Botão com gradiente coral→teal
│           ├── home-loading-view.tsx  # Skeleton loading da home
│           ├── input.tsx              # Input base
│           ├── progress-day.tsx       # Dia do progresso (checkbox visual)
│           ├── reading-card.tsx       # Card de medição
│           ├── section.tsx            # Seção com título
│           ├── stats-panel.tsx        # Painel de estatísticas
│           └── week-challenge.tsx     # Challenge semanal (streak gamification)
│
├── assets/                            # Imagens (ícones, splash screen)
└── scripts/
    └── reset-project.js              # Script de reset do projeto
```

---

## 4. Comandos Essenciais

### Execução & Desenvolvimento

```bash
cd mobile

# Instalação
npm install

# Rodar no Expo Go (QR code)
npm start
# ou npx expo start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Lint
npm run lint
```

### Testes

```bash
# Rodar testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Build de Produção (Android APK via EAS)

```bash
npx eas-cli build --platform android --profile production
```

### Desenvolvimento Builds (para testar native code)

```bash
# Instalar expo-dev-client
npx expo install expo-dev-client

# Build local (Android)
npx expo run:android

# Build local (iOS)
npx expo run:ios

# Com device físico (adicionar --device)
npx expo run:android --device
npx expo run:ios --device

# Rebuild após mudança em native code
npx expo prebuild --clean
```

### Configuração do Servidor

A URL do servidor é configurável via:
1. **Variável de ambiente**: `EXPO_PUBLIC_SERVER_URL` no build
2. **AsyncStorage**: chave `@pressao_arterial_server_url` (persistente no device)
3. **Fallback**: `http://100.76.124.1:3001` (Tailscale IP padrão)

---

## 5. Convenções de Código

### Nomenclatura

- **Arquivos**: `kebab-case` (ex: `reading-card.tsx`, `new-reading.tsx`, `bpClassification.ts`)
- **Componentes**: `PascalCase` (ex: `GradientButton`, `FamilyMemberRow`, `WeekChallenge`)
- **Funções**: `camelCase` (ex: `classifyPressure`, `fullSync`, `getServerUrl`)
- **Variáveis constantes**: `UPPER_SNAKE_CASE` (ex: `DEFAULT_SERVER_URL`, `LAST_SYNC_KEY`)

### TypeScript

- `strict: true` no tsconfig.json
- Path alias: `@/*` → `./src/*` (ex: `@/theme/colors`, `@/services/localDB`)
- Extensões: `.ts` para TypeScript puro, `.tsx` para componentes React

### Styling

- `StyleSheet.create()` dentro de funções com `createStyles(colors)` pattern (recebe `useAppColors()` como argumento)
- Cores adaptativas (claro/escuro) via `useAppColors()` hook
- Fonte escalável via `scaleFont(base, fontScale)` para acessibilidade
- Design tokens de spacing: `spacing.xs` (4), `spacing.sm` (8), `spacing.md` (12), `spacing.lg` (16), etc.
- Layouts com Flexbox (React Native padrão)

### Componentes de UI

- Ícones: componente `Icon` do projeto com `name` prop (Material Design) + `@expo/vector-icons`
- Cores de pressão: `pressureNormal` (verde #06D6A0), `pressureElevated` (amarelo #FFD166), `pressureHigh` (vermelho #EF476F)
- Gradientes: `coral (#FF6B6B)` → `teal (#2EC4B6)`
- Componentes reusáveis em `src/components/ui/`
- Componentes de tela no respectivo grupo de rota `src/app/<grupo>/`

### Expo Router

- **Grupos de rotas**: parênteses `(home)`, `(graficos)`, `(conquistas)`, `(amigos)`, `(profile)` — shared layout
- **NativeTabs**: 5 tabs com `NativeTabs.Trigger` (importado de `expo-router/unstable-native-tabs`)
- **Ícones**: `sf` para SF Symbols (iOS), `md` para Material Design (Android)
- **SafeAreaView**: `useSafeAreaInsets()` de `react-native-safe-area-context`

### State Management

- **Zustand** (useAppStore): readings, medications, loading, syncing, isConnected, lastSync
- Store atualizada por operações de CRUD do localDB (dupla fonte: memória + SQLite)

### Classificação de Pressão (`bpClassification.ts`)

```
┌──────────┬──────────────────┬──────────────────┐
│ Normal   │ < 120            │ < 80             │
│ Elevada  │ ≥ 120 e < 130    │ < 80             │
│ Alta 1   │ ≥ 130 e < 140    │ OR ≥ 80 e < 90   │
│ Alta 2   │ ≥ 140            │ OR ≥ 90          │
└──────────┴──────────────────┴──────────────────┘
```

Baseada em AHA/ACC 2017. Tipos: `PressureCategory = "normal" | "elevated" | "high1" | "high2"`

### Idioma

- Todo texto de UI em **Português (Brasil)**
- `date-fns` com `ptBR` locale

---

## 6. Decisões de Design Importantes

### Offline-first

- Leituras sempre salvas localmente (`expo-sqlite`) primeiro, depois sync com servidor
- `server_id` liga registros locais ao ID do servidor
- Validação de inputs no `localDB.js`: sys 20-500, dia 10-300, hr 20-300, sys > dia

### Sincronização Bidirecional

- `syncUp()` — envia leituras locais não sincronizadas (`synced_at IS NULL`) para o servidor
- `syncDown()` — busca leituras do servidor desde último sync (timestamp via AsyncStorage)
- `fullSync()` — executa ambos sequencialmente

### Migrations Inline

- Mobile: `PRAGMA table_info` checks em `initializeDB()` — verifica colunas faltantes e cria/adiciona
- Exemplo: adição da coluna `arm` feita inline se não existir
- **Não apagar nem modificar o `initializeDB()` manualmente** — ele preserva dados existentes via backup table

### Layout de Navegação

- 5 tabs no `NativeTabs` (home, gráficos, conquistas, amigos, perfil)
- Grupos entre parênteses `(grupo)` para shared layout
- `NativeTabs.Trigger` com `Icon` (sf/md) + `Label` em português

### Banco de Dados Local

- Nome do arquivo: `bp-monitor.db`
- Tabela `readings` com 14 colunas
- Índices: `idx_readings_synced` (synced_at), `idx_readings_server_id` (server_id)
- Duplicatas removidas por `server_id` ou `id`

### Sem Autenticação

- Sem sistema de login
- Dados locais no device do usuário
- Camada social (família/amigos) hardcoded com dados fictícios

### Server URL

- Default: `http://100.76.124.1:3001` (Tailscale IP)
- Configurável via `EXPO_PUBLIC_SERVER_URL` env var ou AsyncStorage
- Backend: Express + SQLite em Docker Compose, porta 3001

---

## 7. Cuidados Especiais

### Não editar

- **`node_modules/`**
- **`ios/`**, **`android/`** — generated pelo CNG (Continuous Native Generation)
- **`.expo/`** — cache do Expo
- **Arquivos nativos gerados automaticamente**

### Dependências sensíveis

- **`expo` (~57.0.22)** — não fazer upgrade sem verificar compatibilidade
- **`expo-router` (~57.0.21)** — file-based routing breaking changes
- **`@shopify/react-native-skia` 2.6.2** — WASM dependency (configurado no metro.config.js)
- **`react-native-gifted-charts`**, **`victory-native`** — bibliotecas de gráficos com native code

### Variáveis de ambiente

- `EXPO_PUBLIC_SERVER_URL` (mobile) — URL do servidor no build

### Performance

- Dispositivos antigos: evitar animações pesadas ou efeitos GPU-intensivos
- Usar `useMemo`/`useCallback` para evitar re-renders desnecessários
- `StyleSheet.create` para styles estáticos dentro de funções `createStyles(colors)`

### SDK 57 Requirements

- **Android**: API 7+ (compileSdk/targetSdk 36)
- **iOS**: 16.4+ (Xcode 26.4+)
- **Node.js**: 22.13.x+
- **React Native**: 0.86.3
- **React**: 19.2.3

---

## 8. Documentação Expo SDK 57.0.0

### Referências Oficiais (SDK 57)

Antes de escrever código, consulte a documentação versionada:

- **SDK Reference**: https://docs.expo.dev/versions/v57.0.0/
- **Universal UI**: https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/
- **Development Builds**: https://docs.expo.dev/develop/development-builds/introduction/

### Expo SDK Packages Usados Neste Projeto

#### expo-sqlite (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/sqlite.md
- **API**: `SQLite.openDatabaseAsync()`, `db.runAsync()`, `db.getAllAsync()`, `db.execAsync()`
- **Uso no projeto**: `localDB.js` — `getDB()` abre `bp-monitor.db`, todas as queries usam `Async` suffix

#### expo-notifications (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/notifications.md
- **API**: `requestPermissionsAsync()`, `scheduleNotificationAsync()`, `cancelNotificationAsync()`, `cancelAllScheduledNotificationsAsync()`
- **Trigger types**: `SchedulableTriggerInputTypes.EVERY_DAY` ou fallback para `type: 'second', seconds: 86400`
- **Uso no projeto**: `notifications.js` — wrapper com lazy import (`await import('expo-notifications')`)

#### expo-router (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/router.md
- **Navigation**: `useRouter()` de `expo-router`, `useLocalSearchParams()`
- **Linking**: `router.push()`, `router.back()`, `router.dismiss()`, `router.canGoBack()`
- **NativeTabs**: `NativeTabs` + `NativeTabs.Trigger` (importado de `expo-router/unstable-native-tabs`)
- **Themes**: `ThemeProvider`, `DefaultTheme`, `DarkTheme` de `expo-router/react-navigation`
- **Color**: `Color.ios.*` para cores nativas iOS (label, secondaryLabel, separator, systemBackground, etc.)

#### expo-linear-gradient (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/linear-gradient.md
- **Uso**: Gradiente coral → teal em botões e divisórias

#### expo-safe-area-context (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context.md
- **API**: `SafeAreaView` com `edges`, `useSafeAreaInsets()`

#### expo-linking (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/linking.md
- **Uso**: Deep linking (scheme: `pressaoarterial` no app.json)

#### expo-navigation-bar (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/navigation-bar.md
- **Uso**: Controlar estilo da navigation bar Android no root layout

#### expo-system-ui (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/system-ui.md

#### expo-splash-screen (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen.md

#### expo-status-bar (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/status-bar.md

#### expo-dev-client (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/dev-client.md
- **Propósito**: Permite development builds com custom native code
- **Instalação**: `npx expo install expo-dev-client`

#### expo-glass-effect (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect.md

#### expo-symbols (SDK 57)

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/symbols.md

### Universal UI (@expo/ui)

#### Visão Geral

- **Docs**: https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/
- **Package**: `@expo/ui` (~57.0.18 instalado)
- **Plataformas**: Android (Jetpack Compose), iOS (SwiftUI), Web (JS)
- **Padrão**: `Host` wrapper obrigatório para todos os componentes universal

#### Components disponíveis (Universal)

| Component | Descrição |
|-----------|-----------|
| `BottomSheet` | Modal sheet deslizante do fundo |
| `Button` | Botão com variantes visuais |
| `Checkbox` | Toggle checked/unchecked |
| `Collapsible` | Header expansível com conteúdo toggle |
| `Column` | Layout vertical |
| `FieldGroup` | Container scrollable de rows estilo settings |
| `Host` | Wrapper obrigatório para conteúdo universal |
| `Icon` | Ícone nativo (SF Symbol iOS, Material Symbol Android) |
| `List` | Container virtualizado de rows |
| `Picker` | Seleção única (menu/wheel) |
| `Row` | Layout horizontal |
| `ScrollView` | Scroll vertical ou horizontal |
| `Slider` | Controle de valor contínuo/step |
| `Spacer` | Espaçamento entre siblings |
| `Switch` | Toggle on/off |
| `Text` | Texto estilizado |
| `TextInput` | Input text (nativo) |
| `RNHostView` | Hospedar React Native views dentro de @expo/ui |

#### Quando usar Universal vs. swift-ui/jetpack-compose direto

- **Universal**: uma árvore de componentes para Android, iOS e web
- **swift-ui / jetpack-compose direto**: quando precisa de controls, modifiers ou comportamento específico da plataforma

#### Drop-in Replacements (SDK 57)

- **BottomSheet**: substituto para @gorhom/bottom-sheet
- **DateTimePicker**: wrapper para date/time picker
- **Menu**: menu dropdown
- **Picker**: @react-native-picker/picker wrapper
- **SegmentedControl**: controle segmentado
- **Slider**: @react-native-community/slider wrapper

### Development Builds

#### Por que Development Builds?

- **Expo Go**: limitado a SDK packages, sem native code customizado
- **Development Build**: seu próprio Expo Go com qualquer biblioteca nativa e config customizada
- **Recomendado**: para app stores (TestFlight, Google Play), production builds

#### Métodos de Build

| Método | Requisitos | Comandos |
|--------|------------|----------|
| **Local** | Android Studio + Xcode | `npx expo run:android`, `npx expo run:ios` |
| **EAS Cloud** | Expo account, eas-cli | `eas build --platform android --profile development` |
| **EAS Local** | Native toolchain + eas-cli | `eas build --platform android --profile development --local` |

#### Fluxo de Desenvolvimento

```bash
# 1. Instalar expo-dev-client
npx expo install expo-dev-client

# 2. Build (primeira vez — gera ios/ android/)
npx expo run:android          # ou: npx expo run:ios

# 3. Após mudar JS/TS apenas, reiniciar servidor
npx expo start

# 4. Após mudar native code ou app.json
npx expo prebuild --clean
npx expo run:android          # rebuild
```

#### Quando Rebuild

Rebuildar o native app quando:
- Instalar/atualizar biblioteca com código nativo
- Alterar `app.json` (config)
- Fazer upgrade do SDK version

### Configuration Files

#### app.json

```jsonc
{
  "expo": {
    "name": "PressãoViva",
    "slug": "pressao-arterial",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",  // claro/escuro automático
    "plugins": ["expo-router", "expo-sqlite", "expo-notifications"]
  }
}
```

#### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['expo'],
    plugins: ['react-native-reanimated/plugin'],  // obrigatório para reanimated
  };
};
```

#### metro.config.js

```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');  // WASM para @shopify/react-native-skia
module.exports = config;
```

### Versionamento & Upgrade

#### Relação Expo SDK ↔ React Native

| Expo SDK | React Native | React |
|----------|-------------|-------|
| 57.0.0 | 0.86 | 19.2.3 |
| 56.0.0 | 0.85 | 19.2.3 |
| 55.0.0 | 0.83 | 19.2.0 |

#### Pre-release Versions

- **Canary**: `expo@canary` — snapshot do main branch (instável)
- **Beta**: `expo@beta` — mais estável, testar antes do release

#### Upgrade Strategy

- Cada Expo SDK release alinha com uma React Native release
- Não fazer downgrade de React Native com Expo SDK
- Usar `patch-package` ou pré-release para fixes não cherrypicked

---

## 9. Banco de Dados (Local + Servidor)

### Tabela: readings

```sql
CREATE TABLE readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id INTEGER UNIQUE,
  systolic INTEGER NOT NULL,          -- 20-500 mmHg
  diastolic INTEGER NOT NULL,         -- 10-300 mmHg
  heart_rate INTEGER,                 -- 20-300 bpm
  medication_used INTEGER DEFAULT 0,  -- 0 ou 1
  medication_name TEXT,
  symptoms TEXT,
  notes TEXT,
  arm TEXT,                           -- "left" ou "right"
  created_at TEXT NOT NULL,           -- ISO 8601
  updated_at TEXT NOT NULL,           -- ISO 8601
  synced_at TEXT                      -- ISO 8601 ou NULL
);

CREATE INDEX idx_readings_synced ON readings(synced_at);
CREATE INDEX idx_readings_server_id ON readings(server_id);
```

### Sincronização

| Função | Direção | Descrição |
|--------|---------|-----------|
| `syncUp()` | Local → Servidor | Envia leituras com `synced_at IS NULL` e `server_id IS NULL` |
| `syncDown()` | Servidor → Local | Busca desde último timestamp (AsyncStorage) |
| `fullSync()` | Ambos | Executa syncUp + syncDown sequencialmente |
| `markSynced()` | Local | Atualiza `synced_at` e `server_id` |

---

## 10. Testes

```bash
# Testes com Jest + Jest Expo
npm test

# Watch mode (alterações automáticas)
npm run test:watch

# Coverage report
npm run test:coverage
```

- **Runner**: Jest com `jest-expo` preset
- **Testing Library**: `@testing-library/react-native` + `@testing-library/jest-native`
- **Mock fetch**: `whatwg-fetch` para polyfill em testes
