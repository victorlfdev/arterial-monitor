# Pressão Arterial Monitor

App React Native para monitoramento de pressão arterial com servidor Express + SQLite.

## Estrutura

```
arterial-monitor/
├── server/           # Backend Express + SQLite
├── mobile/           # App React Native (Expo)
├── data/             # Banco SQLite (criado automaticamente)
└── docker-compose.yml
```

## Server

### Executar localmente

```bash
cd server
npm install
npm run dev
```

API disponível em: `http://localhost:3001`

### Executar com Docker

```bash
docker-compose up -d
```

Banco SQLite salvo em `./data/readings.db`

## Mobile

### Executar no desenvolvimento

```bash
cd mobile
npm install
npx expo start
```

### Configurar URL do servidor

Edite `mobile/src/constants/server.js`:

```javascript
const SERVER_URL = 'http://SEU_IP:3001';
```

### Build APK

```bash
cd mobile
npx eas-cli build --platform android --profile production
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/readings` | Listar medições |
| `POST` | `/api/readings` | Criar medição |
| `PUT` | `/api/readings/:id` | Atualizar medição |
| `DELETE` | `/api/readings/:id` | Remover medição |
| `GET` | `/api/medications` | Listar medicamentos |
| `POST` | `/api/medications` | Criar medicamento |

## Funcionalidades

- Registro de pressão sistólica/diastólica
- Frequência cardíaca
- Medicamento utilizado
- Sintomas e notas opcionais
- Histórico com filtros
- Alarmes de lembrete
- Sincronização local/servidor
