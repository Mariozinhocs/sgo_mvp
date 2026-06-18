# Memória de Projeto – SGO (Sistema de Gestão de Operações)

Este arquivo serve como repositório central de conhecimento, arquitetura, regras de negócio e histórico de alterações do SGO (MVP). **Sempre atualize este arquivo ao concluir qualquer tarefa relevante no projeto.**

---

## 1. Visão Geral do Projeto
O SGO é um sistema focado no gerenciamento operacional de equipes e escalas de trabalho. Esta versão é um **MVP (Minimum Viable Product)** funcional que roda inteiramente no cliente (Frontend), simulando o comportamento de persistência de dados no navegador (`localStorage`) e possuindo suporte offline via PWA (Progressive Web App).

---

## 2. Tecnologias & Arquitetura
- **Core**: HTML5 sem frameworks pesados, garantindo carregamento rápido e controle total.
- **Estilização**: Vanilla CSS puro, estruturado com variáveis customizadas para temas (Light/Dark).
- **Lógica e Persistência**: JavaScript Vanilla ES6. Armazenamento e estados mockados via `localStorage` (Ex: `sgo_auth_token`, `sgo_usuario`, `sgo_theme_login`, `sgo_geo_pos`).
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

---

## 4. Histórico de Alterações (Últimas Primeiro)

### [2026-06-18]
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
4. Qualquer dado de novos cadastros de postos, operadores, pontos batidos, ou mensagens deve ser persistido mockado em localStorage ou na memória local de arrays (MOCK_POSTOS, MOCK_OPERADORES, etc.) já presentes nas páginas, simulando o backend.
5. Sempre atualize a seção "Histórico de Alterações" do `/project_memory.md` após terminar de alterar códigos.
```
