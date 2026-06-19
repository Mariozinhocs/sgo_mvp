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
```
