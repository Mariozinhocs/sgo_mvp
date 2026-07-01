# Memória de Projeto – SGO (Sistema de Gestão de Operações)

Este arquivo serve como repositório central de conhecimento, arquitetura, regras de negócio e histórico de alterações do SGO (MVP). **Sempre atualize este arquivo ao concluir qualquer tarefa relevante no projeto.**

---

## 1. Visão Geral do Projeto
O SGO é um sistema focado no gerenciamento operacional de equipes e escalas de trabalho. Esta versão é um **MVP (Minimum Viable Product)** funcional que roda inteiramente no cliente (Frontend), simulando o comportamento de persistência de dados no navegador (`localStorage`) e possuindo suporte offline via PWA (Progressive Web App).

---

## 2. Tecnologias & Arquitetura
- **Core**: HTML5 sem frameworks pesados, garantindo carregamento rápido e controle total.
- **Estilização**: Vanilla CSS puro, estruturado com variáveis customizadas para temas (Light/Dark).
- **Lógica e Persistência**: JavaScript Vanilla ES6 no Frontend. Backend intermediário em PHP estruturado em APIs REST JSON, com persistência real em banco de dados **MySQL** via conexão segura PDO.
- **Capacidades Offline (PWA)**:
  - [manifest.json](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/manifest.json) configurando o aplicativo para instalação em telas iniciais de celulares/desktops.
  - [service-worker.js](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/service-worker.js) cacheando arquivos essenciais para acesso sem conexão com a internet.

---

## 3. Mapeamento de Arquivos Principais
- [index.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/index.html): Interface de login. Controla temas, valida credenciais mockadas e captura a geolocalização do dispositivo do usuário antes de redirecioná-lo para a tela do operador.
- [operador.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/operador.html): Painel do Operador de Turno. Possui abas de:
  - **Perfil**: Alteração de senha local.
  - **Ponto**: Registro eletrônico de entrada (Check-in), intervalo e saída (Checkout).
  - **Escala**: Visualização mensal dos turnos.
  - **Mensagens**: Interface local para envio de texto e fotos (anexos utilizando câmera do celular) para a gestão.
- [gestor.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/gestor.html): Painel do Gestor. Permite monitorar:
  - **Dashboard**: KPIs gerais de postos, operadores, equipes ativas e pendências.
  - **Postos e Equipes**: Filtro e visualização detalhada.
  - **Escalas**: Sub-abas de Planejamento (gerador e editor de postos com regras de jornada), Disponibilidade (registro de indisponibilidade de operadores e editor de dados de operadores), Trocas e Histórico de alterações.
  - **Mensagens**: Interface mockada de comunicações recebidas dos operadores.
- [users.json](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/users.json): Configuração inicial de usuários de teste administrativa.
- [service-worker.js](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/service-worker.js): Registro de service worker e estratégias de cache para modo offline.
- [database.sql](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/database.sql): Script de modelagem relacional de tabelas e inserção de dados mock iniciais de postos/usuários para o MySQL.
- [db.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/db.php): Inicializador de conexão segura do PHP com o MySQL usando PDO.
- [db_config.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/db_config.php): Credenciais confidenciais do banco de dados (ignorado via Git).
- [api/login.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/login.php): Endpoint de autenticação dinâmica integrado à tabela `usuarios` do banco de dados.
- [api/obter_operadores.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/obter_operadores.php): Endpoint PHP para listar todos os usuários da tabela `usuarios`.
- [api/salvar_operador.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/salvar_operador.php): Endpoint PHP para criar novos usuários (com hash bcrypt de senha) ou atualizar registros de usuários existentes no MySQL.
- [ftp_config.json](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/ftp_config.json): Configuração oculta com credenciais do servidor FTP de homologação (ignorado via Git).
- [deploy-staging.ps1](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/deploy-staging.ps1): Script automatizado no PowerShell para envio em lote de arquivos e pastas recursivas para o servidor via FTP.

---

## 4. Histórico de Alterações (Últimas Primeiro)

### [2026-06-29]
- **Restauração e Rollback Geral para 25/06/2026**:
  - Reversão completa do código-fonte local e em staging para o commit `d5555d64`.
  - Restauração total da base de dados MySQL no servidor de homologação a partir do dump `backup_20260625/banco_backup_20260625.sql`.
  - Exclusão dos scripts temporários de banco de dados após a execução por segurança.
  - Correção de erro de sintaxe JavaScript em gestor.html (linha 1615) que causava erro de Unexpected token e bloqueava a execução do painel do gestor.
  - Correção do caminho do favicon.ico no cache do service-worker.js (movido para a pasta icons/) corrigindo a falha de registro do PWA.


### [2026-06-26]
- **MVP Fase 2 - Gestão Avançada de Postos, UX e PWA**:
  - **Ativação PWA (App Mobile)**: Registrados o `manifest.json` e `service-worker.js` em todos os HTMLs (`index.html`, `gestor.html`, `operador.html`). Atualizados meta tags do iOS e modificado `short_name` para 'SGO'. Criado `icones_utilizados.txt` para documentar assets de ícones nativos (192x192 e 512x512).
  - **Exclusão de Postos**: Implementada a funcionalidade segura de exclusão via backend (`api/excluir_posto.php`), com atualização imediata da lista e do mapa operacional.
  - **Diálogos Modais Customizados**: O uso de `window.alert` e `window.confirm` foi universalmente substituído no Gestor pelos modais flutuantes `sgoAlert` e `sgoConfirm`, refinando a estética da plataforma. O botão OK foi centralizado para maior harmonia.
  - **Mapa Operacional Interativo**: Removidas hardcodes legadas de coordenadas. O Leaflet agora plota postos a partir das colunas reais de latitude/longitude. Inserido no topo do mapa um filtro Dropdown de Cidades que executa reenquadramento inteligente dinâmico das marcações (`fitBounds`).
  - **Navegação em Pílulas (Pills)**: Ajustado CSS do painel do Gestor (`.top-tabs`) com `flex: 1` para que acompanhem toda a largura da tela, espelhando a UX do operador.
  - **Jornada de Trabalho Específica**: Alterada a regra de negócio para permitir jornadas híbridas no mesmo Posto. O cadastro do Operador ganhou um dropdown para escolher uma Jornada Específica, sobrescrevendo a regra global do Posto.
  - **Camadas e Perfis**: Corrigido `z-index` do modal de edição (para sobrepor à lista de usuários) e adicionado botão "Editar" de acesso rápido dentro do modal de visualização de perfil.

### [2026-06-23]
- **Backup e Ponto de Restauração**:
  - Criado e executado o script remoto temporário (`api/criar_backup.php`) para fazer o backup completo da hospedagem. O processo realizou o dump estruturado da base de dados MySQL (`banco_backup_20260623.sql`) e empacotou todos os arquivos em um arquivo ZIP recursivo, movendo tudo para a pasta `/backup_20260623/` no FTP.
  - Criados scripts utilitários locais no diretório de rascunho (`scratch/run_backup.ps1` e `scratch/delete_backup.ps1`) para disparar a execução e posterior remoção dos arquivos temporários de backup de forma segura.
  - Excluídos arquivos antigos desnecessários (como `sgo_mvp_update.zip`) do servidor de hospedagem para otimizar espaço de armazenamento.
- **Correções do Teste Beta, Ativação de Funcionalidades e Persistência do Ponto**:
  - **Captura Direta da Câmera no Ponto (PC/Mobile)**: Refatorado o fluxo no [operador.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/operador.html) para disparar preview de webcam com modal interativo e captura direta via Canvas em vez de delegar ao input file no PC. Mantido seletor de arquivos de imagem apenas como fallback de segurança.
  - **Login e Webcam (3.A.1)**: Atualizado o fluxo de login no [index.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/index.html) para solicitar permissão da webcam usando `getUserMedia` logo após a geolocalização, liberando a câmera em seguida, garantindo permissões antecipadas.
  - **Identificação do Usuário no Login (3.A.4)**: Corrigido o payload de login no [api/login.php](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/api/login.php) para retornar o campo `id` do usuário. Isso corrige o erro de mensagens sem remetente no frontend.
  - **Ajustes Estéticos do Gestor (3.B.1)**: Renomeada a aba "Dashboard" para "**Início**" no menu de navegação, e o primeiro botão interno do cardápio foi batizado como "**Dashboard**".
  - **Ocultação de Sub-abas (3.B.1)**: Ajustada a função `showDashboardSubPanel` para manter a barra superior de abas (`dashboardSubtabs`) oculta ao entrar em painéis, exibindo apenas o botão "Voltar".
  - **Cores de Status e Contraste do Mapa (3.B.1)**: Atualizado o Mapa no [gestor.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/gestor.html) para usar cores específicas de status nos marcadores: OK (verde: `#22c55e`), Atenção (laranja: `#f59e0b`), Alerta (vermelho: `#ef4444`) e Inativo (cinza: `#64748b`). Aplicado filtro CSS premium de inversão e contraste no contêiner do Leaflet (`.leaflet-container`) no modo escuro e revertido nos ícones para preservar cores reais de status.
  - **Sincronização em Tempo Real (3.B.1)**: Criados os endpoints [api/salvar_ponto.php](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/api/salvar_ponto.php) e [api/obter_pontos_hoje.php](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/api/obter_pontos_hoje.php) para persistência real e recuperação de batidas de ponto dos operadores com imagens base64 no banco de dados. Atualizada a função `renderEscalaHoje()` do gestor para buscar as marcações em tempo real do banco de dados em vez do cache local.
  - **Null-Safety do Script e Auto-Seeding (3.B.2/3.B.3)**: Corrigido listener de `btnHistoricoPosto` nulo que travava a execução do script e impedia o redirecionamento e carregamento de listas no Gestor. Adicionado auto-seeding nos endpoints [api/obter_postos.php](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/api/obter_postos.php) e [api/obter_operadores.php](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/api/obter_operadores.php) caso o banco de dados esteja zerado.
- **Reestruturação e Mapa no Painel do Gestor (Dashboard, Postos, Equipes)**:
  - Reformuladas as abas Dashboard, Postos e Equipes do painel [gestor.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/gestor.html) com o padrão visual de "cardápio" (botões grandes), mantendo a identidade das abas de mensagens e operadores.
  - Integrado mapa operacional interativo na aba Dashboard usando a biblioteca Leaflet. O mapa consome coordenadas geográficas e altera dinamicamente o tema visual (CartoDB Light ou Dark) conforme o modo de cor do sistema.
  - Ajustados os redirecionamentos dos KPIs de Dashboard para abrir diretamente os sub-painéis de listagem de postos, equipes e operadores.
  - Corrigido o bug da variável `raw` indefinida no método `renderEscalaHoje()`.

### [2026-06-22]
- **Correção de Erro de Sintaxe no Painel do Operador**:
  - Removido um bloco incorreto `} catch(e) {} })();` no final da tag `<script>` em [operador.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/operador.html), resolvendo o erro de JavaScript que bloqueava a execução de todo o script e impedia o funcionamento da interface após o login.

### [2026-06-20]
- **Unificação das Funcionalidades de Escala na Aba de Operadores**:
  - Removido a aba principal "Escalas" da barra de navegação superior (`top-tabs`) do painel do gestor.
  - Integrado a funcionalidade de escalas como um novo botão de cardápio ("Escalas") dentro do menu de **Gestão de Operadores** em [gestor.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/gestor.html).
  - Convertido a antiga seção de escala (`tab-escalas`) em um modal sobreposto de largura total (`modalEscalas`) para alinhar com o restante do fluxo de modais da gestão de operadores.
  - Corrigido bug de aninhamento de tags HTML (div de fechamento ausente no container `#modalEscalas`) que causava a ocultação acidental de todas as abas subsequentes (como "Operadores" e "Mensagens").
- **Correção Visual no Painel do Gestor**:
  - Correção na folha de estilos de [gestor.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/gestor.html), adicionando as classes CSS `.modal-backdrop` e `.modal-card` que estavam ausentes, o que causava a exibição indevida do modal "Foto do Ponto" e do botão "Fechar" diretamente na tela inicial do painel.
- **Visualização de Perfil e Histórico de Carreira**:
  - Implementado o modal de visualização de perfil (`modalVisualizarPerfil`) com abas para dados gerais do operador e histórico de carreira.
  - Desenvolvida a lógica de geração de linha do tempo de carreira (`gerarLinhaDoTempoCarreira`) de forma dinâmica e determinística com base nos dados do operador (data de admissão calculada a partir da matrícula, treinamentos, qualificações registradas e períodos de férias).
  - Adicionado o botão "Visualizar" ao lado do botão "Editar" nos resultados da busca do modal de consulta de operadores.
  - Alterado o evento de clique na linha da tabela de operadores (`tbodyOperadores`) na lista completa para abrir diretamente o perfil em modo somente visualização (`visualizarPerfilDesdeConsulta`), enquanto o botão "Editar" de cada linha permanece de forma exclusiva abrindo a edição do cadastro.
- **Correção de Camadas (Z-Index) da Barra de Ações em Lote**:
  - Relocado o elemento HTML da barra de ações em lote (`batchEditBar`) para o final da tag `<body>` e configurado seu `z-index` para `30000` para garantir que fique sobreposto ao modal de lista completa e seja interativo.
- **Reestruturação da Tela de Operadores no Painel do Gestor**:
  - Removido a exibição direta da tabela de operadores no painel do gestor e implementado um menu ("cardápio") contendo três botões quadrados principais: **Cadastrar Operador**, **Consultar Operador** e **Lista Completa**.
  - Criado três novos modais de sobreposição (`modalCadastroEdicao`, `modalConsultar` e `modalListaCompleta`) integrados ao sistema de sobreposição e com suporte ao tema claro/escuro.
  - Movido o formulário de cadastro/edição de operador do painel `sub-disponibilidade` para o modal centralizado `modalCadastroEdicao`, adicionando um redirecionamento inteligente no painel original.
  - Implementado formulário e lógica de consulta/busca no modal `modalConsultar` com inputs específicos de Nome e Matrícula.
  - Atualizada a listagem completa de operadores para incluir um botão explícito de "Editar", facilitando o carregamento dos dados no formulário modal.
- **Melhorias no Script de Deploy (deploy-staging.ps1)**:
  - Adicionado o parâmetro `-OnlyChanged` que permite implantar apenas arquivos modificados/adicionados no repositório git (detectando alterações locais, arquivos não rastreados e commits não enviados/últimos commits).
  - Corrigido o bug na regex de `ignoredPatterns` que causava o envio incorreto de arquivos ignorados (como `project_memory.md` e `ftp_config.json`).
- **Ajuste de Validação de CPF**:
  - Desativada temporariamente a obrigatoriedade do campo CPF no formulário de operadores para agilizar o processo de homologação.

### [2026-06-19]
- **Edição em Lote de Operadores (Batch Bulk Edits)**:
  - Adicionados checkboxes de seleção na tabela de operadores e controle de seleção geral no cabeçalho em [gestor.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/gestor.html).
  - Desenvolvida barra de ações em lote flutuante (Batch Action Bar) que surge na parte inferior do painel quando um ou mais operadores são selecionados.
  - Criado modal overlay de Edição em Lote com controle seletivo de campos, garantindo que apenas os atributos explicitamente marcados sejam sobrescritos nos operadores selecionados.
  - Desenvolvido o endpoint assíncrono [api/salvar_operadores_lote.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/salvar_operadores_lote.php) que cria dinamicamente o comando `UPDATE ... WHERE id IN (...)` com prepared statements seguros e insere um log de auditoria correspondente na tabela `historico_logs`.
- **Gestão, Criação e Edição de Escalas (CLT & Persistência Relacional)**:
  - Migração de banco de dados (`api/migrate_db.php`) adicionando novas colunas contratuais nos operadores, regras nos postos e armazenamento JSON estruturado (`escala_data`) na tabela `escalas`.
  - Desenvolvimento de APIs PHP (`salvar_escala.php`, `obter_escalas.php`, `obter_escala_operador.php`, `salvar_posto.php`, `obter_postos.php`, `obter_historico.php`, `obter_horario_servidor.php`) com suporte completo para persistência relacional e geração de logs no histórico do sistema (`historico_logs`).
  - Atualização do painel do gestor (`gestor.html`) para inicializar dados a partir do banco de dados (fetches assíncronos) e validar alocações em tempo real seguindo normas da CLT (interjornada de 11h, intrajornada, limite de 8h/12h diárias, restrições médicas, férias programadas).
  - Atualização do painel do operador (`operador.html`) para recuperar escalas ativas do banco, usar o horário oficial do servidor (respeitando a cidade/fuso horário do seu posto cadastrado) para batidas de ponto, marcas d'água e registros de escalas, mitigando fraudes no relógio do dispositivo do usuário e indicando `[Offline]` como fallback seguro.
- **Gestor de Tempo para Logout Automático por Inatividade**:
  - Implementado monitoramento de inatividade do usuário com limite diferenciado: 5 minutos para operadores e 5 horas para gestores/admins.
  - Redirecionamento amigável para a tela de login ([index.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/index.html)) exibindo a mensagem descritiva *"Sessão expirada por inatividade. Faça login novamente."* e limpando parâmetros do histórico do navegador.
- **Check-in e Check-out com Selfie Watermarkada**:
  - Implementado sistema de captura de foto (selfie) obrigatória ao bater ponto (Check-in e Checkout) em [operador.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/operador.html).
  - A foto capturada é redimensionada via Canvas para 320x240px e recebe uma estampa/marca d'água semi-transparente contendo o nome/usuário do operador, data/hora da captura e as coordenadas de geolocalização do dispositivo (latitude e longitude capturadas no login).
  - Adicionado ícone de câmera (📷) nos logs de escala do operador e no painel do gestor ([gestor.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/gestor.html)) para abrir um modal de visualização da foto correspondente.
- **Painel de Testes Automatizados (SGO TEST PANEL)**:
  - Adicionado painel de testes flutuante ativo via query string `?testMode=true` que permite simular de forma limpa e programática:
    - Mock de localização GPS com coordenadas fixas de São Paulo.
    - Simulação de Check-in e Checkout com foto mockada (PNG verde base64), contornando diálogos de arquivos do sistema operacional e facilitando testes automatizados/agente.
    - Simulação rápida de inatividade de 6 minutos para testar o redirecionamento automático de sessão expirada.
  - Implementado mecanismo de invalidação automática de cache na inicialização do `testMode` (unregistrando service workers antigos e limpando caches).
- **Service Worker (Atualização)**:
  - Incrementado o versionamento do cache em [service-worker.js](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/service-worker.js) to `'sgo-mvp-v2'` para forçar a atualização de arquivos em cache nos dispositivos dos operadores e gestores.

### [2026-06-18]
- **Correção de Segurança e Usabilidade no Logout**:
  - Adicionada verificação de privilégios (`roles`) na função `loadUser` em [gestor.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/gestor.html). Operadores comuns tentando acessar o painel de gestão diretamente via URL são bloqueados e redirecionados para a tela de login.
  - Removido o diálogo `confirm()` nativo no evento de logout (`btnSair`) em [operador.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/operador.html) e [gestor.html](file:///c:/Users/mario/OneDrive/Área de Trabalho/sft/sgo_mvp/gestor.html). O logout agora limpa as credenciais do `localStorage` (`sgo_auth_token` e `sgo_usuario`) e redireciona de forma instantânea e robusta, evitando bloqueios de pop-up do navegador.
- **Gestão e Criação de Usuários pelo Painel**:
  - Implementada a listagem de usuários do banco no painel do gestor em [gestor.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/gestor.html) por meio do novo endpoint [api/obter_operadores.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/obter_operadores.php).
  - Adicionados campos de Matrícula, Usuário, Senha e Papel de Acesso no formulário de edição de operador.
  - Criado o endpoint [api/salvar_operador.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/salvar_operador.php) para salvar (cadastrar ou editar) operadores diretamente no banco de dados relacional, criptografando as senhas com hash seguro bcrypt.
- **Automação de Deploy Manual**:
  - Criado o script [deploy-staging.ps1](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/deploy-staging.ps1) e o arquivo de configuração [ftp_config.json](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/ftp_config.json) para gerenciar o upload em lote de arquivos para a hospedagem via PowerShell, incluindo segurança de timeout para evitar travamentos de rede.
- **Transição para Banco de Dados Relacional**:
  - Modelado e estruturado o banco de dados do SGO em [database.sql](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/database.sql), contendo tabelas e dados mockados com hashes de senhas corrigidos para verificação via bcrypt.
  - Implementada a conexão PDO em [db.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/db.php) com leitura de credenciais externas e ocultas em [db_config.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/db_config.php).
  - Criado o endpoint de autenticação segura [api/login.php](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/api/login.php).
  - Migrado o login do frontend em [index.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/index.html) para validar as credenciais consultando a API PHP em vez do array mockado local.
  - Criado o arquivo [.gitignore](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/.gitignore) para proteger as credenciais do banco.
- **Melhoria Estética (index.html)**:
  - Alterada a cor de destaque do título principal `<h1>Login</h1>` em [index.html](file:///c:/Users/mario.henrique/Desktop/Git_SGO/sgo_mvp/index.html) para o tom de vermelho vibrante `#ef4444`, tornando a identidade visual mais marcante no tema escuro e claro.
- **Configuração de Ambiente local**:
  - Remoção de credenciais ativas do GitHub no repositório local utilizando o utilitário `git credential reject` para forçar novo login no próximo ciclo de sincronização de código.
- **Implementação do Arquivo de Memória**:
  - Criação deste arquivo `project_memory.md` para otimização de tokens e portabilidade de contexto entre máquinas distintas.

---

## 5. Guia para Assistentes de IA (Instruções de Inicialização)
> [!TIP]
> Se você for uma inteligência artificial atendendo este projeto em um novo prompt ou em outra máquina, copie/utilize as diretrizes abaixo para se contextualizar sem gastar tokens com varredura completa.

### Prompt de Carregamento de Contexto
```
Você é um desenvolvedor especialista trabalhando no projeto SGO MVP. 
Antes de programar, leia e compreenda a arquitetura documentada no arquivo `/project_memory.md` localizado na raiz do projeto.
Diretrizes fundamentais para este projeto:
1. Trabalhamos exclusivamente com Vanilla HTML, Vanilla JavaScript e Vanilla CSS para manter a leveza do MVP.
2. Não utilize frameworks adicionais nem pacotes npm adicionais no frontend sem autorização explícita do usuário.
3. Respeite as variáveis CSS definidas no :root de cada arquivo HTML para suportar a alternância dinâmica entre tema Light/Dark.
4. Conecte novas features dinâmicas a endpoints PHP na pasta `api/` consumindo dados reais do banco MySQL via `db.php`.
5. Sempre atualize a seção "Histórico de Alterações" do `/project_memory.md` após terminar de alterar códigos.
6. Ao fazer deploy para hospedagem (staging), utilize sempre o script seletivo (`.\deploy-staging.ps1 -OnlyChanged`) para enviar apenas os arquivos alterados e economizar banda/recursos.
```
