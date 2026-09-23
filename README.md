# Arterial Monitor

**PressãoViva** — Monitoramento de pressão arterial domiciliar com gamificação para aumentar a consistência do paciente nas medições.

## Visão Geral

Sistema completo para monitoramento de hipertensão em casa, composto por uma API REST para armazenamento de dados e um aplicativo mobile para registro e acompanhamento de medições.

## Stack

| Componente | Tecnologia |
|------------|------------|
| Mobile | Expo SDK 57, React Native 0.86, TypeScript |
| Backend | Node.js 20+, Express, SQLite |
| Deploy | Docker Compose |

## Estrutura do Projeto

```
arterial-monitor/
├── mobile/          # App Expo (PressãoViva)
├── server/          # API REST (bp-api)
├── data/            # Banco SQLite (readings.db)
├── reports/         # Testes e relatórios
└── docker-compose.yml
```

## Configuração do Servidor

### Via Docker (Recomendado)

```bash
docker compose up -d
```

A API estará disponível em `http://localhost:3001`.

### Localmente

```bash
cd server
npm install
npm start
```

## Configuração do Mobile

```bash
cd mobile
npm install
npm start
```

### Plataformas

```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## URL do Servidor

O app mobile conecta-se ao servidor por padrão em `http://100.109.39.19:3001` (Tailscale IP). Para alterar:

1. **Variável de ambiente**: `EXPO_PUBLIC_SERVER_URL` no build
2. **AsyncStorage**: chave `@pressao_arterial_server_url` (persistente no device)

## Funcionalidades

- Registro de medições de pressão sistólica/diastólica e frequência cardíaca
- Classificação AHA/ACC 2017 (Normal, Elevada, Alta 1, Alta 2)
- Gráficos de tendência
- Lembretes por push notifications
- Tracking de medicamentos
- Gamificação: streaks e challenges semanais
- Sincronização local/servidor (offline-first)

## Testes

```bash
# Server
cd server && npm test

# Mobile
cd mobile && npm test
```

## Licença

MIT
