# Arterial Monitor — IA Project Context

## 1. Visão Geral

**Pressão Arterial Monitor** é um aplicativo mobile + backend para monitoramento de pressão arterial em casa. O propósito é permitir que pacientes registrem medições de pressão sistólica/diastólica, frequência cardíaca, medicamentos e sintomas, com visualização histórica, gráficos e gamificação de consistência.

O produto tem uma dimensão social (ainda em planejamento): conexão entre familiares e amigos para acompanhamento mútuo e desafios de consistência. O app é destinado ao público brasileiro (português do Brasil).

### Status atual das funcionalidades

- **Implementado**: registro de medições, histórico com filtros, gráficos, classificação de pressão arterial (Normal/Elevada/Alta 1/Alta 2), lembretes por push notifications, sincronização local/servidor, tracking de medicamentos, streaks de consistência
- **Em planejamento**: autenticação de usuários, gráfico de conexões sociais, visibilidade compartilhada de leituras, gamificação avançada (badges, conquistas), sync em tempo real

---

## 2. Stack Técnica

### Mobile (React Native + Expo)

| Package | Versão |
|---------|--------|
| expo | ~57.0.22 |
| expo-router | ~57.0.21 |
| react-native | 0.86.3 |
| react | 19.2.3 |
| typescript | ~6.0.3 |
| zustand | ^5.0.15 |
| expo-sqlite | ^57.0.3 |
| expo-notifications | ^57.0.18 |
| @shopify/react-native-skia | 2.6.2 |
| react-native-gifted-charts | ^1.4.78 |
| victory-native | ^42.0.1 |
| react-native-reanimated | ^4.5.1 |
| @expo/ui | ~57.0.18 |
| date-fns | ^4.4.0 |
| @react-native-async-storage/async-storage | 2.2.0 |

### Backend (Express.js + SQLite)

| Package | Versão |
|---------|--------|
| express | ^4.18.2 |
| sqlite3 | ^5.1.7 |
| cors | ^2.8.5 |
| morgan | ^1.10.0 |
| dotenv | ^16.3.1 |
| nodemon (dev) | ^3.0.2 |

### Runtime

- Node.js 20 (Docker `node:20-alpine`)
- Docker Compose para o backend

---

## 3. Estrutura de Pastas

```
arterial-monitor/
├── server/                      # Backend Express + SQLite
│   ├── src/
│   │   ├── index.js             # Entry point, middleware, roteamento
│   │   ├── db/
│   │   │   ├── database.js      # Conexão SQLite, DDL, migrations inline
│   │   │   └── seed.js          # Seed inicial de medicamentos
│   │   ├── routes/
│   │   │   ├── readings.js      # CRUD + stats de medições
│   │   │   └── medications.js   # CRUD de medicamentos
│   ├── package.json
│   └── Dockerfile
├── mobile/                      # App React Native (Expo)
│   ├── src/
│   │   ├── app/                 # expo-router: rotas e screens
│   │   │   ├── _layout.tsx      # Root layout com NativeTabs (5 tabs)
│   │   │   ├── (home)/          # Tab: Início
│   │   │   │   ├── index.tsx    # Home screen
│   │   │   │   ├── _layout.tsx
│   │   │   │   └── new-reading.tsx  # Formulário de nova medição
│   │   │   ├── (graficos)/      # Tab: Gráficos
│   │   │   ├── (conquistas)/    # Tab: Conquistas
│   │   │   ├── (amigos)/        # Tab: Amigos/Família
│   │   │   └── (profile)/       # Tab: Perfil/Configurações
│   │   ├── theme/               # Design tokens
│   │   │   ├── index.ts         # Re-export
│   │   │   ├── colors.ts        # Cores (claro/escuro)
│   │   │   ├── spacing.ts       # 4, 8, 12, 16, 20, 24, 32
│   │   │   ├── radius.ts        # 6, 10, 14, 20, 9999
│   │   │   ├── typography.ts    # Fontes/famílias
│   │   │   ├── shadows.ts       # Sombras
│   │   │   ├── motion.ts        # Durações de animação
│   │   │   └── fontScale.ts     # Acessibilidade de fonte
│   │   ├── store/
│   │   │   └── useAppStore.js   # Zustand: estado global (readings, meds, sync)
│   │   ├── services/
│   │   │   ├── api.js           # Clientes HTTP da API REST
│   │   │   ├── localDB.js       # expo-sqlite: CRUD local, migrations
│   │   │   ├── sync.js          # fullSync (up/down)
│   │   │   └── notifications.js # expo-notifications reminders
│   │   ├── lib/
│   │   │   └── bpClassification.ts  # Classificação de pressão (AHA/ACC)
│   │   ├── constants/
│   │   │   └── server.js        # Server URL config + storage
│   │   └── components/
│   │       └── ui/              # Componentes reusáveis de UI
│   │           ├── badge.tsx
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── chip.tsx
│   │           ├── Icon.tsx
│   │           ├── empty-state-view.tsx
│   │           ├── feature-card.tsx
│   │           ├── family-member-row.tsx
│   │           ├── gradient-button.tsx
│   │           ├── home-loading-view.tsx
│   │           ├── input.tsx
│   │           ├── progress-day.tsx
│   │           ├── reading-card.tsx
│   │           ├── section.tsx
│   │           ├── stats-panel.tsx
│   │           └── week-challenge.tsx
│   ├── assets/                  # Imagens (ícones, logos)
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   ├── metro.config.js
│   └── eslint.config.js
├── data/                        # Banco SQLite (criado automaticamente, gitignored)
│   └── readings.db
├── docker-compose.yml           # Deploy do backend
├── PRODUCT.md                   # Especificação do produto
├── README.md                    # Guia de uso
└── AGENTS.md                    # Este arquivo
```

---

## 4. Comandos Essenciais

### Backend (`server/`)

```bash
# Executar localmente (dev com hot-reload)
cd server
npm install
npm run dev

# Executar em produção
npm start

# Seed do banco (inserir medicamentos padrão)
npm run db:seed

# Executar com Docker
docker-compose up -d
```

API disponível em `http://localhost:3001`

### Mobile (`mobile/`)

```bash
# Executar no desenvolvimento (Expo Go)
cd mobile
npm install
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios

# Web
npx expo start --web

# Lint
npm run lint
```

### Build de produção (Android APK)

```bash
cd mobile
npx eas-cli build --platform android --profile production
```

### Configuração do servidor

A URL do servidor é configurável nas configurações do app ou via variável de ambiente `EXPO_PUBLIC_SERVER_URL`. O valor padrão é `http://100.76.124.1:3001` (Tailscale IP).

---

## 5. Convenções de Código

### Mobile

- **Nomes de arquivos**: `kebab-case` para componentes e screens (`badge.tsx`, `new-reading.tsx`)
- **Nomes de componentes**: `PascalCase` (ex: `GradientButton`, `FamilyMemberRow`)
- **TypeScript**: `strict: true`, paths alias `@/*` → `./src/*`
- **Arquivos `.tsx`** para componentes React, `.js` para lógica/store/services
- **Tema**: tokens estáticos (`spacing`, `radius`, `motion`) + hook `useAppColors()` que retorna cores adaptativas (claro/escuro)
- **Fontes**: `scaleFont(base, fontScale)` para acessibilidade
- **StyleSheet.create()** dentro de componentes com `createStyles(colors)` pattern
- **Zustand** para estado global (`useAppStore`)
- **Expo Router** com file-based routing: grupos entre parênteses `(home)`, rotas sem parênteses são layouts

### Backend

- **CommonJS** (`require`), sem TypeScript
- **Promise wrappers** para callbacks do sqlite3: `runQuery`, `getSingle`, `runInsert`
- **Sanitização** de input com escape HTML (`sanitizeString`, `sanitizeInput`)
- **Padrão de resposta**: `{ success: true/false, data?: ..., error?: ..., count?: ... }`
- **Middleware de rate limiting** customizado em memória (por IP)
- **Migrations inline**: `PRAGMA table_info` checks no init do banco

### UI / Componentes

- Ícones: `@expo/vector-icons` (Material Design `name` prop no componente `Icon`)
- Cores de pressão: `pressureNormal` (verde), `pressureElevated` (amarelo), `pressureHigh` (vermelho)
- Gradientes: `coral (#FF6B6B)` → `teal (#2EC4B6)`
- Componentes de UI ficam em `src/components/ui/` — criar aqui quando o componente for reutilizável
- Componentes de tela ficam no respectivo grupo de rota `src/app/<grupo>/`

### Classificação de Pressão (`bpClassification.ts`)

- Baseada em AHA/ACC 2017: Normal (<120/<80), Elevada (120-129/<80), Alta 1 (130-139 ou 80-89), Alta 2 (≥140 ou ≥90)
- Funções: `classifyPressure(sys, dia)`, `isHighReading(sys, dia)`, `isElevatedReading(sys, dia)`

---

## 6. Decisões de Design Importantes

1. **Offline-first**: leituras são sempre salvas localmente (`expo-sqlite`) primeiro, depois sync com servidor. `server_id` liga registros locais ao ID do servidor.

2. **Sincronização bidirecional**: `syncUp` (local → servidor) e `syncDown` (servidor → local). `fullSync()` executa ambos. `synced_at` marca leituras sincronizadas.

3. **Migrations inline**: tanto mobile quanto backend verificam e criam colunas/índices faltantes no init do banco. Isso significa que mudar o schema exige adicionar verificadores no `initializeDB()` (mobile) ou `getDb()` (backend).

4. **Duas fontes de verdade**: Zustand store (estado em memória) + expo-sqlite (persistência local) + servidor (persistência cloud). O store é atualizado pelas operações de CRUD do localDB.

5. **Layout de navegação**: 5 tabs no `NativeTabs` (home, gráficos, conquistas, amigos, perfil). Grupos entre parênteses `(grupo)` para shared layout.

6. **Database schema não deve ser corrompido**: conforme PRODUCT.md, constraints críticas incluem integridade do schema, funcionalidade das rotas API existentes e preservação de sessões ativas.

7. **Idioma**: todo texto de UI está em Português (Brasil). Não traduzir para inglês.

8. **Sem autenticação**: não há sistema de login. A camada social (família/amigos) ainda é estática/hardcoded.

---

## 7. Cuidados Especiais

### Não editar

- **`node_modules/`** em ambos `server/` e `mobile/`
- **`data/readings.db`** — banco SQLite gerado automaticamente, não commitado no git
- **`.expo/`**, **`dist/`**, **`web-build/`** — outputs do Expo
- **Arquivos gerados nativamente** (`ios/`, `android/` no mobile) — managed workflow do Expo

### Dependências sensíveis

- **`expo` (~57.0.22)** — não fazer upgrade sem verificar compatibilidade com todos os packages expo-*. Verificar docs em `https://docs.expo.dev/versions/v57.0.0/`
- **`@shopify/react-native-skia`** e **`victory-native`** — dependências nativas complexas
- **`react-native-gifted-charts`** — biblioteca de gráficos, pode ter breaking changes

### Variáveis de ambiente

- `DATA_DIR` (server): diretório do banco SQLite (padrão: `data/`)
- `PORT` (server): porta do servidor (padrão: 3001)
- `NODE_ENV` (server): `production` ou `development`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`: rate limiting
- `EXPO_PUBLIC_SERVER_URL` (mobile): URL do servidor no build

### Performance

- O app roda em dispositivos antigos: evitar animações pesadas ou efeitos GPU-intensivos
- Usar `useMemo`/`useCallback` para evitar re-renders desnecessários
- `StyleSheet.create` para styles estáticos

### Deploy

- Backend roda em VPS com Tailscale networking (porta 3001)
- App distribuído via EAS Build para iOS e Android stores
- Docker Compose para rodar backend localmente ou em containers
