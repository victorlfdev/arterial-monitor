RELATÓRIO COMPLETO DE ANÁLISE DO BANCO DE DADOS E APLICAÇÃO
1. ESQUEMA DO BANCO DE DADOS
Servidor (SQLite - readings.db)
Tabela medications
Campo	Tipo
id	INTEGER
name	TEXT
created_at	TEXT
Tabela readings
Campo	Tipo
id	INTEGER
systolic	INTEGER
diastolic	INTEGER
heart_rate	INTEGER
medication_used	INTEGER
medication_name	TEXT
symptoms	TEXT
notes	TEXT
arm	TEXT
created_at	TEXT
updated_at	TEXT
Índices: idx_readings_created (created_at), idx_readings_sync (updated_at)
Mobile (expo-sqlite - bp-monitor.db)
Tabela readings (versão local sincronizada)
Campo	Tipo
id	INTEGER
server_id	INTEGER
systolic	INTEGER
diastolic	INTEGER
heart_rate	INTEGER
medication_used	INTEGER
medication_name	TEXT
symptoms	TEXT
notes	TEXT
arm	TEXT
created_at	TEXT
updated_at	TEXT
synced_at	TEXT
Índices: idx_readings_synced (synced_at), idx_readings_server_id (server_id)
2. BUGS CRÍTICOS
BUG #1 — Falha silenciosa de validação de pressão (CRÍTICO para app de saúde)
Onde: server/src/routes/readings.js:82-84
Problema: A validação !systolic || !diastolic permite valores 0, que são fisiologicamente inválidos para medição de pressão arterial. Também não há validação de faixa (ex: 0-300 mmHg).
Impacto: Um usuário pode registrar "0/0" e o sistema aceita. Não há verificação se sistólica > diastólica.
Recomendação: Validar faixas reais: systolic >= 60 && systolic <= 300 && diastolic >= 30 && diastolic <= 200 && systolic > diastolic
BUG #2 — Condição de corrida na inicialização do banco (CRÍTICO em Docker)
Onde: server/src/db/database.js:16-92
Problema: A função getDb() usa initPromise para evitar múltiplas inicializações, mas se duas requisições chegarem simultaneamente antes do initPromise ser definido, ambas podem criar instâncias new sqlite3.Database(). Além disso, o db.serialize() dentro da callback do new Database() é redundante com a chamada db.serialize() subsequente — a segunda chamada em um banco já serializado pode causar erros.
Impacto: Em produção com carga simultânea, pode haver "database is locked" ou tabelas não criadas corretamente.
Recomendação: Usar mutex/semáforo na inicialização e remover db.serialize() duplo.
BUG #3 — Migração arm pode falhar silenciosamente em SQLite
Onde: server/src/db/database.js:65-72 e mobile/src/services/localDB.js:87
Problema: SQLite não suporta ALTER TABLE ADD COLUMN com IF NOT EXISTS nativo. Se a coluna já existir, o erro é capturado mas a mensagem "duplicate column" pode variar entre versões do SQLite. A verificação !err.includes('duplicate column') usa includes em string que pode conter mensagens diferentes.
Impacto: Migrações em versões diferentes do SQLite podem falhar sem aviso.
Recomendação: Verificar via PRAGMA table_info() antes de tentar ALTER TABLE.
BUG #4 — syncToLocal gera duplicatas por igualdade parcial
Onde: mobile/src/services/localDB.js:181-185
Problema: A fallback query para encontrar leitura existente usa systolic, diastolic, created_at como chave. Se dois registros tiverem os mesmos valores de pressão e serem do mesmo segundo (ex: duas medições rápidas), o sistema identifica o registro errado.
Impacto: Dados do servidor podem sobrescrever registros locais errados.
Recomendação: Usar server_id como chave primária exclusiva mesmo na fallback, ou adicionar um campo hash único.
BUG #5 — getAllReadings com dedupagem inconsistente
Onde: mobile/src/services/localDB.js:103-110
Problema: A dedupagem usa server_id como chave, mas se um registro local não tem server_id e outro tem server_id = null, ambos passam. Isso pode retornar registros duplicados.
Impacto: A UI pode mostrar a mesma medição duas vezes.
Recomendação: Normalizar para id local como chave única de dedupagem.
3. BUGS MODERADOS
BUG #6 — new-reading.tsx usa params de rota como strings
Onde: mobile/src/app/new-reading.tsx:43-50
Problema: params.systolic, params.diastolic, etc. são sempre strings no expo-router. O String(params.systolic || '') funciona para valores normais, mas params.medication_used === '1' e === 'true' é frágil se vier como número 1 ou booleano.
Impacto: Editar medições pode não preencher campos corretamente.
Recomendação: Usar JSON.parse() ou conversão explícita para todos os params.
BUG #7 — Botão de sincronização nas configurações não faz nada
Onde: mobile/src/app/settings.tsx:169-172
Problema: O <TouchableOpacity> do botão "Sincronizar agora" não tem onPress. O usuário clica e nada acontece.
Impacto: Funcionalidade aparente mas inoperante.
Recomendação: Adicionar onPress que chama fullSync() e atualiza lastSync.
BUG #8 — saveReading não previne valores zero/ negativos
Onde: mobile/src/services/localDB.js:148-172
Problema: O saveReading grava qualquer valor no banco local sem validação. Um systolic: 0 ou systolic: -50 é aceito.
Impacto: Dados corruptos no banco local que só seriam detectados no sync (se o servidor validar).
BUG #9 — updateReading no Zustand não aciona sync
Onde: mobile/src/store/useAppStore.js:112-117
Problema: A ação updateReading atualiza apenas o estado em memória, sem marcar synced_at = NULL. O addReading no entanto, seta synced_at: null corretamente.
Impacto: Atualizações locais não serão syncadas para o servidor.
Recomendação: Marcar registro como "não sincronizado" após edição local.
BUG #10 — deleteLocalReading e deleteLocalReadingByServerId não atualizam o Zustand
Onde: mobile/src/app/history.tsx:34-41
Problema: handleDelete chama deleteLocalReading(id) e deleteReading(id) separadamente. Se o deleteLocalReading falhar, o Zustand já foi atualizado, criando inconsistência.
Impacto: UI mostra registro removido mas ele ainda existe no banco local.
Recomendação: Inverter ordem: atualizar Zustand primeiro, depois banco local. Ou fazer transação.
4. BUGS LEVES / MELHORIAS
BUG #11 — API sem rate limiting
Onde: server/src/index.js
Problema: Nenhuma proteção contra requisições excessivas.
Impacto: Potencial DDoS ou uso excessivo de CPU do SQLite.
Recomendação: Adicionar express-rate-limit.
BUG #12 — API sem sanitização de entrada
Onde: Todas as rotas
Problema: Valores de symptoms, notes, medication_name não são sanitizados.
Impacto: Possibilidade de injection via campos de texto.
Recomendação: Sanitarizar strings antes de inserir no SQLite.
BUG #13 — SERVER_URL hard-coded
Onde: mobile/src/constants/server.js
Problema: IP do Tailscale hard-coded (100.76.124.1:3001). Não é configurável pelo usuário.
Impacto: Se o servidor mudar de IP, o app para de funcionar sem atualização.
Recomendação: Permitir configuração via Settings ou usar .env.
BUG #14 —  PressureChart filtra apenas últimas 24h
Onde: mobile/src/components/PressureChart.js:10-15
Problema: O gráfico só mostra dados das últimas 24 horas. Para um app de monitoramento de pressão, o usuário esperaria ver tendência de dias/semanas.
Recomendação: Permitir seleção de período (24h, 7 dias, 30 dias).
BUG #15 — scheduleDailyAlarm usa EVERY_DAY que pode não ser suportado
Onde: mobile/src/services/notifications.js:29-35
Problema: Notifications.SchedulableTriggerInputTypes.EVERY_DAY é um tipo específico do expo-notifications. Em versões antigas ou em plataformas específicas, pode não funcionar.
Impacto: Lembretes podem não ser agendados em alguns dispositivos.
Recomendação: Fallback para second/minute com intervalo de 24h (86400 segundos).
BUG #16 — seed.js não é executado automaticamente
Onde: server/src/db/seed.js
Problema: O seed é feito inline no database.js (linhas 75-85), mas seed.js é um arquivo separado que também faz seed. O package.json tem db:seed script mas não está claro se é chamado no deploy.
Recomendação: Unificar a lógica de seed e garantir execução no Docker entrypoint.
BUG #17 — updated_at usa DEFAULT (datetime('now')) que nunca se atualiza
Onde: server/src/db/database.js:48
Problema: A coluna updated_at tem DEFAULT (datetime('now')), mas isso só define o valor na criação. O UPDATE nas rotas (readings.js:124) atualiza manualmente com updated_at = datetime('now'), mas isso só acontece se o campo foi alterado.
Impacto: Em UPDATE parciais (quando updates.length === 0), o updated_at não é atualizado.
Recomendação: Garantir sempre o updated_at em UPDATEs, ou usar AFTER UPDATE trigger.
BUG #18 — readings.js:124 — update só executa se houver campos modificados
Onde: server/src/routes/readings.js:123-127
Problema: Se nenhuma coluna foi fornecida no body (updates.length === 0), o UPDATE não executa. O servidor retorna o registro original sem erro, o que pode confundir clientes.
Recomendação: Retornar 400 se nenhum campo para atualizar foi fornecido.
BUG #19 — Ausência de DATABASE_URL ou configuração de conexão
Onde: server/src/index.js
Problema: Não há variável DATABASE_URL no docker-compose. O DATA_DIR vem do ambiente com fallback para caminho relativo. Em containers Docker, isso pode criar arquivos em locais inesperados se o volume não estiver montado corretamente.
Recomendação: Adicionar DATA_DIR explícito ao docker-compose.
BUG #20 — useAppStore.fetchReadings não lida com deletados no servidor
Onde: mobile/src/store/useAppStore.js:40-46
Problema: Quando um registro foi deletado no servidor (por outro dispositivo), o fetchReadings remove a cópia local (deleteLocalReadingByServerId). Mas o Zustand também precisa ser atualizado. O Zustand já é atualizado no fim (set({ readings: unique })), mas o deleteLocalReadingByServerId é chamado antes do getAllReadings, criando um estado transitivo inconsistente.
Impacto: Em dispositivos lentos, pode haver flicker de dados.
5. POSSIBILIDADES E COBERTURA DE REQUISIÇÕES
O que o banco e as APIs cobrem (✅)
Requisição	Cobertura
Criar medição	✅ POST /api/readings
Listar medições	✅ GET /api/readings (com pagination)
Buscar medição por ID	✅ GET /api/readings/:id
Atualizar medição	✅ PUT /api/readings/:id (partial update)
Deletar medição	✅ DELETE /api/readings/:id
Listar medicamentos	✅ GET /api/medications
Criar medicamento	✅ POST /api/medications
Atualizar medicamento	✅ PUT /api/medications/:id
Deletar medicamento	✅ DELETE /api/medications/:id
Health check	✅ GET /health
Sync offline-first	✅ Server-side + localDB com server_id
Upload local→cloud	✅ syncUp
Download cloud→local	✅ syncDown
Lembretes (UI)	✅ Settings com time picker
Classificação de pressão	✅ Normal/Elevada/Alta
O que NÃO está coberto (⚠️)
Requisição
Filtrar medições por medicamento
Filtrar medições por braço
Agregar estatísticas (média, min, max)
Autenticação de usuário
Multi-usuário
Exportar dados (PDF, CSV)
Sincronização conflit-resolve
Soft delete
Validação de pressão sistólica > diastólica
Busca por data range
Ordenação por pressure level
6. ANÁLISE DE INTEGRIDADE DO BANCO DE DADOS
Problemas de integridade referencial
- Sem FK entre readings.medication_name e medications.name: O campo medication_name na tabela readings é um texto livre, não uma foreign key para medications.id. Isso significa:
- Se um medicamento é renomeado/deletado em medications, as readings que o referenciam por nome permanecem intactas (funciona, mas é redundante)
- Não há garantia de integridade referencial
- Se um usuário digita "Losartana" no formulário e "losartana" (minúscula), são valores diferentes
Problemas de consistência de dados
- medication_used vs medication_name: Se medication_used = 0 mas medication_name tem valor, é inconsistente. Se medication_used = 1 mas medication_name é null, também é inconsistente. Não há constraints para garantir isso.
Índices
- idx_readings_created (created_at) — ✅ Útil para ORDER BY
- idx_readings_sync (updated_at) — ✅ Útil para sync
- idx_readings_synced (synced_at) — ✅ Útil para sync local
- idx_readings_server_id (server_id) — ✅ Útil para sync local
- Falta índice em readings.systolic — Queries de filtragem por faixa de pressão seriam lentas em grandes volumes
7. RESUMO DE GRAVIDADE
Severidade	Quantidade
Crítico	5
Moderado	5
Leve/Melhoria	10
Total	20
Top 5 Bugs para corrigir prioritariamente:
1. Bug #1 — Falta de validação de faixa de pressão (segurança do paciente)
2. Bug #2 — Condição de corrida na inicialização do banco (estabilidade do servidor)
3. Bug #4 — Duplicatas em syncToLocal (integridade dos dados)
4. Bug #7 — Botão de sync inoperante nas configurações (UX)
5. Bug #9 — Atualizações locais não marcadas para sync (perda de dados)