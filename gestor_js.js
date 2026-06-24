
  const THEME_KEY='sgo_theme_login';
  const btnTheme=document.getElementById('btnTheme');
  const themeIcon=document.getElementById('themeIcon');
  const themeLabel=document.getElementById('themeLabel');
  const overlayBackdrop=document.getElementById('overlayBackdrop');
  const overlayContent=document.getElementById('overlayContent');
  const overlayTitle=document.getElementById('overlayTitle');
  const overlayDesc=document.getElementById('overlayDesc');

  let MOCK_POSTOS=[];
  const MOCK_EQUIPES=[{nome:'Equipe Alfa',posto:'Posto Central',turno:'Dia',operadores:9,lider:'Ana Silva'},{nome:'Equipe Bravo',posto:'Posto Central',turno:'Noite',operadores:9,lider:'Bruno Costa'},{nome:'Equipe Leste 01',posto:'Base Leste',turno:'Comercial',operadores:8,lider:'João Pedro'},{nome:'Equipe Leste 02',posto:'Base Leste',turno:'Noite',operadores:6,lider:'Marina Costa'},{nome:'Equipe Norte 01',posto:'Posto Norte',turno:'12x36',operadores:9,lider:'Ursula Mendes'}];
  let MOCK_OPERADORES=[];
  let MOCK_ESCALAS=[];
  const MOCK_TROCAS=[{sol:'Troca de turno',operador:'Ana Silva',turno:'Dia',status:'Aguardando aprovação'},{sol:'Cobertura de falta',operador:'João Pedro',turno:'Noite',status:'Aguardando aprovação'},{sol:'Oferta de shift',operador:'Victor Hugo',turno:'12x36',status:'Pendente'}];
  let MOCK_HISTORICO=[];
  let MOCK_DISPONIBILIDADE=[];
  const planningQueue=['Posto Central: reforçar turno das 13:00','Base Leste: 1 cobertura pendente no noturno','Posto Norte: validar conflito de dupla alocação'];

  let currentScaleData={};
  let currentPostoId=0, currentOperadorId=0;
  const postoModel={id:'',nome:'',cidade:'Manaus/AM',status:'ATIVO',jornada:'8h',turno:'Diurno',intrajornada:'1h',interjornada:'11h',extras:'2h/dia',banco:'Sim',dsr:'Sim',especial:'',descricao:'',funcionalidades:'',revezamentoNecessario:'Não',adicionalNoturno:'Não',endereco:'',latitude:'',longitude:'',telefone_contato:'',operador_responsavel_id:null};
  let opModel={id:'',nome:'',cpf:'',cargo:'',hierarquia:'',jornada:'Tradicional 8h/44h',turno:'Fixo',preferencia:'Diurno',status:'Ativo',disponibilidade:'',restricoes:'',qualificacoes:'',ferias:'',afastamentos:'',matricula:'',usuario:'',senha:'',roles:'OPERADOR',postoPrincipal:'Centro de Cooperação da Cidade'};

  function badge(status){ const s=(status||'').toLowerCase(); if(s.includes('publicada')||s.includes('confirm')||s==='ativo'||s.includes('dispon')||s==='disponível') return '<span class="status-badge active">Ativo</span>'; if(s.includes('rascunho')||s.includes('draft')||s.includes('aguard')||s==='pending'||s.includes('conflit')) return '<span class="status-badge pending">Pendente</span>'; return '<span class="status-badge inactive">Inativo</span>'; }
  function applyTheme(){ let saved=null; try{saved=localStorage.getItem(THEME_KEY)}catch(e){}; const light=saved==='light'; document.body.classList.toggle('theme-light', light); themeIcon.textContent=light?'??':'??'; themeLabel.textContent=light?'Dark':'Light'; document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#f3f4f6' : '#020826'); }
  applyTheme();
  btnTheme.addEventListener('click',()=>{ const light=document.body.classList.toggle('theme-light'); try{localStorage.setItem(THEME_KEY, light?'light':'dark')}catch(e){} applyTheme(); });
  document.getElementById('btnSair').addEventListener('click',()=>{
    localStorage.removeItem('sgo_auth_token');
    localStorage.removeItem('sgo_usuario');
    window.location.href='index.html';
  });
  document.getElementById('btnVoltarOperador').addEventListener('click',()=>window.location.href='operador.html');

  const topTabs=document.querySelectorAll('.tab-button'); const tabPanels=document.querySelectorAll('.tab-panel');
  function setTab(id){
    topTabs.forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
    tabPanels.forEach(p=>p.classList.toggle('active', p.id===id));
    if (id === 'tab-dashboard') voltarAoMenuDashboard();
    if (id === 'tab-postos') voltarAoMenuPostos();
    if (id === 'tab-equipes') voltarAoMenuEquipes();
  }
  topTabs.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));

  const subTabs=document.querySelectorAll('.subtab-button'); const subPanels=document.querySelectorAll('.subtab-panel');
  function setSubTab(id){ subTabs.forEach(b=>b.classList.toggle('active', b.dataset.subtab===id)); subPanels.forEach(p=>p.classList.toggle('active', p.id===id)); }
  subTabs.forEach(b=>b.addEventListener('click',()=>setSubTab(b.dataset.subtab)));

  // --- SISTEMA DE NAVEGAÇÃO INTERNA DO DASHBOARD ---
  window.showDashboardSubPanel = function(panelId) {
    document.getElementById('dashboardCardapio').style.display = 'none';
    document.getElementById('dashboardSubtabs').style.display = 'none';
    
    const tabs = document.querySelectorAll('[data-dashtab]');
    const panels = document.querySelectorAll('#tab-dashboard .subtab-panel');
    
    tabs.forEach(t => t.classList.toggle('active', t.dataset.dashtab === panelId));
    panels.forEach(p => p.style.display = p.id === panelId ? 'block' : 'none');
    
    if (panelId === 'dash-mapa') {
      setTimeout(inicializarMapa, 100);
    }
  };

  window.voltarAoMenuDashboard = function() {
    const panels = document.querySelectorAll('#tab-dashboard .subtab-panel');
    panels.forEach(p => p.style.display = 'none');
    document.getElementById('dashboardSubtabs').style.display = 'none';
    document.getElementById('dashboardCardapio').style.display = 'grid';
  };

  // --- SISTEMA DE NAVEGAÇÃO INTERNA DE POSTOS ---
  window.showPostosSubPanel = function(panelId) {
    document.getElementById('postosCardapio').style.display = 'none';
    const panel = document.getElementById(panelId);
    if (panel) panel.style.display = 'block';
  };

  window.voltarAoMenuPostos = function() {
    const panels = document.querySelectorAll('#tab-postos .subtab-panel');
    panels.forEach(p => p.style.display = 'none');
    document.getElementById('postosCardapio').style.display = 'grid';
  };

  // --- SISTEMA DE NAVEGAÇÃO INTERNA DE EQUIPES ---
  window.showEquipesSubPanel = function(panelId) {
    document.getElementById('equipesCardapio').style.display = 'none';
    const panel = document.getElementById(panelId);
    if (panel) panel.style.display = 'block';
  };

  window.voltarAoMenuEquipes = function() {
    const panels = document.querySelectorAll('#tab-equipes .subtab-panel');
    panels.forEach(p => p.style.display = 'none');
    document.getElementById('equipesCardapio').style.display = 'grid';
  };

  // --- SISTEMA DE MAPA OPERACIONAL (LEAFLET) ---
  let mapInstance = null;
  let mapMarkers = [];
  
  window.filtrarMapaPorCidade = function(cidade) {
    if (!mapInstance) return;
    const bounds = [];
    mapMarkers.forEach(m => {
      if (cidade === '' || m.postoObj.cidade === cidade) {
        if (!mapInstance.hasLayer(m)) mapInstance.addLayer(m);
        bounds.push(m.getLatLng());
      } else {
        if (mapInstance.hasLayer(m)) mapInstance.removeLayer(m);
      }
    });
    if (bounds.length > 0) {
      mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  function inicializarMapa() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    if (!window.L) {
      mapDiv.innerHTML = '<div style="padding:20px; text-align:center; color:var(--muted);">Aguardando biblioteca do mapa (Leaflet)...</div>';
      return;
    }

    const isLight = document.body.classList.contains('theme-light');
    
    if (!mapInstance) {
      mapInstance = L.map('map').setView([-23.550520, -46.633308], 11);
    }

    // Limpar camadas de tiles e marcadores anteriores
    mapInstance.eachLayer(layer => {
      if (layer instanceof L.TileLayer || layer instanceof L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

    // Sempre usar tileset Positron Light (Inversão aplicada via CSS no dark mode)
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance);

    const bounds = [];
    const cidadesSet = new Set();

    // Adicionar marcadores de Postos
    MOCK_POSTOS.forEach(p => {
      let coords = null;
      if (p.latitude && p.longitude && p.latitude !== '' && p.longitude !== '') {
        coords = [parseFloat(p.latitude), parseFloat(p.longitude)];
      }

      if (p.cidade && p.cidade.trim() !== '') {
        cidadesSet.add(p.cidade.trim());
      }

      if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const statusText = p.status === 'ATIVO' ? 'Ativo' : 'Inativo';
        const opCount = p.operadores || 0;
        
        // Calcular Operadores Ativos para este posto (via PONTOS_HOJE)
        let ativosHoje = 0;
        if (typeof PONTOS_HOJE !== 'undefined') {
          ativosHoje = PONTOS_HOJE.filter(pt => 
            (pt.posto_id == p.id || pt.posto_nome === p.nome) && 
            (pt.tipo === 'ENTRADA' || pt.tipo === 'RETORNO_ALMOCO')
          ).length;
        }

        const respName = p.responsavel_nome || 'Nenhum';
        const respClick = p.responsavel_nome ? `onclick="abrirContatoPosto('${p.id}', '${p.nome}', '${p.responsavel_nome}', '${p.telefone_contato||''}')" style="cursor:pointer; color:var(--primary); text-decoration:underline;"` : '';

        // Criar ícone customizado com cores baseadas no status
        let color = '#22c55e'; // OK = verde
        const stat = (p.status || '').toUpperCase();
        if (stat === 'INATIVO') {
          color = '#64748b'; // cinza
        } else if (stat === 'ATENÇÃO' || stat === 'ATENCAO') {
          color = '#f59e0b'; // laranja
        } else if (stat === 'ALERTA' || stat === 'CRÍTICO' || stat === 'CRITICO') {
          color = '#ef4444'; // vermelho
        }
        
        const iconHtml = `<div style="background-color:${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const popupContent = `
          <div style="font-family:system-ui,sans-serif; font-size:12px; color:${isLight ? '#020617' : '#e5e7eb'}; background:${isLight ? '#fff' : '#020617'}; padding: 4px; text-align:center;">
            <strong style="font-size:16px; display:block; margin-bottom:8px;">${p.nome}</strong>
            <div style="font-size:24px; font-weight:bold; line-height:1;">${ativosHoje}</div>
            <div style="font-size:11px; margin-bottom:8px;">Operadores Ativos</div>
            <hr style="border-color:${isLight ? '#ccc' : '#333'}; margin:8px 0;" />
            <div style="font-size:11px; color:var(--muted);">Operador Responsável</div>
            <div ${respClick}><strong>${respName}</strong></div>
          </div>
        `;

        const marker = L.marker(coords, { icon: customIcon })
          .addTo(mapInstance)
          .bindPopup(popupContent);
          
        marker.postoObj = p;
        mapMarkers.push(marker);
        bounds.push(coords);
      }
    });

    // Atualizar dropdown de cidades
    const selectCity = document.getElementById('mapCityFilter');
    if (selectCity) {
      const selectedVal = selectCity.value;
      selectCity.innerHTML = '<option value="">Todas as Cidades</option>';
      Array.from(cidadesSet).sort().forEach(c => {
        selectCity.innerHTML += `<option value="${c}">${c}</option>`;
      });
      selectCity.value = selectedVal; // Restaurar a seleção
    }

    // Plotar posição do Operador se disponível no localStorage (Ponto ou Login)
    try {
      const geoRaw = localStorage.getItem('sgo_geo_pos');
      if (geoRaw) {
        const geo = JSON.parse(geoRaw);
        if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
          const operatorCoords = [geo.lat, geo.lng];
          
          const iconHtml = `<div style="background-color:#ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #ef4444;"></div>`;
          const operatorIcon = L.divIcon({
            html: iconHtml,
            className: 'operator-map-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const popupContent = `
            <div style="font-family:system-ui,sans-serif; font-size:12px; color:${isLight ? '#020617' : '#e5e7eb'}; padding: 4px;">
              <strong style="color:#ef4444; font-size:13px; display:block; margin-bottom:4px;">?? Último Login Operador</strong>
              <div><strong>Coordenadas:</strong> ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}</div>
              <div><strong>Capturado em:</strong> ${new Date(geo.ts).toLocaleTimeString('pt-BR')}</div>
            </div>
          `;

          L.marker(operatorCoords, { icon: operatorIcon })
            .addTo(mapInstance)
            .bindPopup(popupContent);

          bounds.push(operatorCoords);
        }
      }
    } catch (e) {
      console.warn("Erro ao ler geolocalização do operador para o mapa:", e);
    }

    // Ajustar o zoom do mapa para enquadrar todos os pontos
    if (bounds.length > 0) {
      mapInstance.fitBounds(bounds, { padding: [40, 40] });
    }

    // Forçar atualização do tamanho para renderizar corretamente
    mapInstance.invalidateSize();
  }

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') {
      closeOverlay();
      modalFoto.style.display='none';
      modalFoto.style.pointerEvents='none';
      fecharModalCadastroEdicao();
      fecharModalConsultar();
      fecharModalListaCompleta();
      fecharModalVisualizarPerfil();
      fecharModalEscalas();
    }
  });
  document.getElementById('btnCloseOverlay').addEventListener('click', closeOverlay);
  overlayBackdrop.addEventListener('click', e=>{ if(e.target===overlayBackdrop) closeOverlay(); });
  
  /* New Modals Management */
  window.abrirModalEscalas = function() {
    try {
      voltarAoMenuEscalas();
      
      // Popular os seletores do Passo 1
      const selectPosto = document.getElementById('selectPlanningPosto');
      if (selectPosto) {
        selectPosto.innerHTML = MOCK_POSTOS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
      }
      const selectEquipe = document.getElementById('selectPlanningEquipe');
      if (selectEquipe) {
        selectEquipe.innerHTML = MOCK_EQUIPES.map(e => `<option value="${e.nome}">${e.nome}</option>`).join('');
      }
      
      document.getElementById('modalEscalas').classList.add('open');
      document.getElementById('modalEscalas').setAttribute('aria-hidden', 'false');
    } catch (e) {
      console.error("Erro ao abrir modal de escalas:", e);
    }
  };

  window.fecharModalEscalas = function() {
    document.getElementById('modalEscalas').classList.remove('open');
    document.getElementById('modalEscalas').setAttribute('aria-hidden', 'true');
  };

  window.showScalesSubPanel = function(subtabId) {
    // Esconder o cardápio inicial
    document.getElementById('scalesCardapio').style.display = 'none';
    
    // Exibir a barra de sub-abas superior para navegação alternativa
    document.getElementById('scalesSubtabs').style.display = 'flex';
    
    // Ativar a sub-aba desejada e seu painel correspondente
    const subButtons = document.querySelectorAll('.subtab-button');
    const subPanels = document.querySelectorAll('.subtab-panel');
    
    subButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === subtabId);
    });
    subPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === subtabId);
    });
    
    // Se a aba for planejamento, garantir que inicie no Passo 1 (Seleção)
    if (subtabId === 'sub-planejamento') {
      retornarAosConfiguracoesPlanejamento();
    }
  };

  window.voltarAoMenuEscalas = function() {
    // Esconder todos os sub-painéis e a barra de sub-abas
    const subPanels = document.querySelectorAll('.subtab-panel');
    subPanels.forEach(panel => panel.classList.remove('active'));
    
    document.getElementById('scalesSubtabs').style.display = 'none';
    
    // Exibir o cardápio de botões inicial
    document.getElementById('scalesCardapio').style.display = 'grid';
  };

  window.togglePlanningScope = function(scope) {
    const fieldPosto = document.getElementById('fieldSelectPosto');
    const fieldEquipe = document.getElementById('fieldSelectEquipe');
    if (scope === 'posto') {
      fieldPosto.style.display = 'flex';
      fieldEquipe.style.display = 'none';
    } else {
      fieldPosto.style.display = 'none';
      fieldEquipe.style.display = 'flex';
    }
  };

  window.retornarAosConfiguracoesPlanejamento = function() {
    document.getElementById('planningStepSelection').style.display = 'block';
    document.getElementById('planningStepCalendar').style.display = 'none';
  };

  window.iniciarPlanejamento = function() {
    const scopeRadio = document.querySelector('input[name="planningScope"]:checked');
    const scope = scopeRadio ? scopeRadio.value : 'posto';
    const mesAno = document.getElementById('selectPlanningMonthYear').value;
    
    let postoId = null;
    let labelText = '';
    
    if (scope === 'posto') {
      postoId = document.getElementById('selectPlanningPosto').value;
      const postoObj = MOCK_POSTOS.find(p => p.id == postoId);
      labelText = `Posto: ${postoObj ? postoObj.nome : 'Desconhecido'} - Período: ${mesAno}`;
    } else {
      const equipeNome = document.getElementById('selectPlanningEquipe').value;
      const equipeObj = MOCK_EQUIPES.find(e => e.nome === equipeNome);
      if (!equipeObj) {
        alert('Equipe selecionada inválida.');
        return;
      }
      // Resolver para o posto correspondente
      const postoObj = MOCK_POSTOS.find(p => p.nome === equipeObj.posto);
      if (!postoObj) {
        alert(`Não foi possível localizar o Posto de Trabalho vinculado à equipe ${equipeNome}.`);
        return;
      }
      postoId = postoObj.id;
      labelText = `Equipe: ${equipeNome} (${postoObj.nome}) - Período: ${mesAno}`;
    }
    
    // Atualizar os seletores internos de planejamento para compatibilidade
    const planningPostoEl = document.getElementById('planningPosto');
    const planningMonthYearEl = document.getElementById('planningMonthYear');
    if (planningPostoEl) planningPostoEl.value = postoId;
    if (planningMonthYearEl) planningMonthYearEl.value = mesAno;
    
    document.getElementById('labelEscopoAtivo').textContent = labelText;
    
    // Carregar os dados de escala e atualizar o calendário
    carregarEscalaDoServidor();
    
    // Transitar visualmente para o Passo 2 (Calendário)
    document.getElementById('planningStepSelection').style.display = 'none';
    document.getElementById('planningStepCalendar').style.display = 'block';
  };
  window.toggleDesignacaoPosto = function() {
    const chk = document.getElementById('chkDesignarPosto');
    const container = document.getElementById('designacaoContainer');
    const inputPosto = document.getElementById('opPostoDesignado');
    const selectEquipe = document.getElementById('opEquipeDesignada');
    
    if (chk.checked) {
      container.style.display = 'block';
      const dl = document.getElementById('dlPostosDesignacao');
      if (dl && typeof MOCK_POSTOS !== 'undefined') {
        dl.innerHTML = MOCK_POSTOS.map(p => <option value=" + p.nome + ">).join('');
      }
    } else {
      container.style.display = 'none';
      if(inputPosto) inputPosto.value = '';
      if(selectEquipe) selectEquipe.innerHTML = '<option value="">Selecione um posto primeiro...</option>';
    }
  };

  window.filtrarEquipesPorPosto = function(postoNome) {
    const selectEquipe = document.getElementById('opEquipeDesignada');
    if (!postoNome) {
      selectEquipe.innerHTML = '<option value="">Selecione um posto primeiro...</option>';
      return;
    }
    
    if (typeof MOCK_EQUIPES !== 'undefined') {
      const equipesFiltradas = MOCK_EQUIPES.filter(e => 
        e.posto === postoNome || e.nome.toLowerCase().includes('evento') || e.nome.toLowerCase().includes('especial')
      );
      
      if (equipesFiltradas.length > 0) {
        selectEquipe.innerHTML = '<option value="">Nenhuma equipe espec?fica</option>' + equipesFiltradas.map(e => <option value=" + e.nome + "> + e.nome + </option>).join('');
      } else {
        selectEquipe.innerHTML = '<option value="">Sem equipes cadastradas para este posto</option>';
      }
    }
  };

  window.abrirModalCadastro = function() {
    opModel = { id:'', nome:'', cpf:'', cargo:'', hierarquia:'', jornada:'Tradicional 8h/44h', turno:'Fixo', preferencia:'Diurno', status:'Ativo', disponibilidade:'', restricoes:'', qualificacoes:'', ferias:'', afastamentos:'', matricula:'', usuario:'', senha:'', roles:'OPERADOR', postoPrincipal:'Centro de Cooperação da Cidade' };
    syncOperadorForm();
    document.getElementById('modalCadastroEdicaoTitle').textContent = 'Cadastrar Operador';
    document.getElementById('modalCadastroEdicao').classList.add('open');
    document.getElementById('modalCadastroEdicao').setAttribute('aria-hidden', 'false');
  };

  window.fecharModalCadastroEdicao = function() {
    document.getElementById('modalCadastroEdicao').classList.remove('open');
    document.getElementById('modalCadastroEdicao').setAttribute('aria-hidden', 'true');
  };

  window.abrirModalConsultar = function() {
    limparConsulta();
    document.getElementById('modalConsultar').classList.add('open');
    document.getElementById('modalConsultar').setAttribute('aria-hidden', 'false');
  };

  window.fecharModalConsultar = function() {
    document.getElementById('modalConsultar').classList.remove('open');
    document.getElementById('modalConsultar').setAttribute('aria-hidden', 'true');
  };

  window.abrirModalListaCompleta = function() {
    try {
      renderOperadores();
      document.getElementById('modalListaCompleta').classList.add('open');
      document.getElementById('modalListaCompleta').setAttribute('aria-hidden', 'false');
    } catch (e) {
      alert("Erro ao renderizar ou abrir a lista completa: " + e.message);
      console.error(e);
    }
  };

  window.fecharModalListaCompleta = function() {
    document.getElementById('modalListaCompleta').classList.remove('open');
    document.getElementById('modalListaCompleta').setAttribute('aria-hidden', 'true');
  };

  window.editarOperadorPorMatricula = function(matricula) {
    const idx = MOCK_OPERADORES.findIndex(o => o.matricula === matricula);
    if (idx !== -1) {
      loadOperador(idx);
      document.getElementById('modalCadastroEdicaoTitle').textContent = 'Editar Operador';
      document.getElementById('modalCadastroEdicao').classList.add('open');
      document.getElementById('modalCadastroEdicao').setAttribute('aria-hidden', 'false');
    }
  };

  window.realizarConsulta = function() {
    const nomeVal = document.getElementById('consultarNome').value.trim().toLowerCase();
    const matriculaVal = document.getElementById('consultarMatricula').value.trim().toLowerCase();
    
    if (!nomeVal && !matriculaVal) {
      alert('Por favor, informe o nome ou a matrícula para consultar.');
      return;
    }
    
    const filtrados = MOCK_OPERADORES.filter(op => {
      const matchNome = nomeVal ? op.nome.toLowerCase().includes(nomeVal) : true;
      const matchMatricula = matriculaVal ? op.matricula.toLowerCase().includes(matriculaVal) : true;
      return matchNome && matchMatricula;
    });
    
    const tbody = document.getElementById('tbodyResultadosConsulta');
    tbody.innerHTML = '';
    
    if (filtrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:10px;">Nenhum operador encontrado.</td></tr>';
    } else {
      filtrados.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${o.nome}</strong></td>
          <td>${o.matricula}</td>
          <td>${badge(o.status)}</td>
          <td>
            <button class="primary" type="button" onclick="event.stopPropagation(); visualizarPerfilDesdeConsulta('${o.matricula}')" style="padding: 4px 8px; font-size:11px; margin-right:4px;">Visualizar</button>
            <button class="secondary" type="button" onclick="event.stopPropagation(); editarDesdeConsulta('${o.matricula}')" style="padding: 4px 8px; font-size:11px;">Editar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    
    document.getElementById('resultadosConsultaSec').style.display = 'block';
  };

  window.editarDesdeConsulta = function(matricula) {
    fecharModalConsultar();
    editarOperadorPorMatricula(matricula);
  };

  window.gerarLinhaDoTempoCarreira = function(op) {
    let seed = 0;
    if (op.matricula) {
      for (let i = 0; i < op.matricula.length; i++) {
        seed += op.matricula.charCodeAt(i);
      }
    } else {
      seed = op.id || 1;
    }
    
    const anosAtras = 1 + (seed % 4);
    const mesAdmissao = (seed % 12);
    const diaAdmissao = 1 + (seed % 28);
    
    const hoje = new Date();
    const dataAdmissao = new Date(hoje.getFullYear() - anosAtras, mesAdmissao, diaAdmissao);
    const dataAdmissaoStr = dataAdmissao.toLocaleDateString('pt-BR');

    const eventos = [];

    eventos.push({
      data: dataAdmissaoStr,
      titulo: "Admissão na Empresa",
      desc: `Admitido sob a matrícula <strong>${op.matricula}</strong> no cargo de <strong>${op.cargo || 'Operador'}</strong>.`
    });

    const dataTreinamento = new Date(dataAdmissao);
    dataTreinamento.setMonth(dataTreinamento.getMonth() + 1);
    eventos.push({
      data: dataTreinamento.toLocaleDateString('pt-BR'),
      titulo: "Treinamento de Integração Concluído",
      desc: "Conclusão com sucesso do treinamento básico de operações, normas de segurança e uso dos sistemas SGO."
    });

    const dataPosto = new Date(dataAdmissao);
    dataPosto.setMonth(dataPosto.getMonth() + 2);
    eventos.push({
      data: dataPosto.toLocaleDateString('pt-BR'),
      titulo: "Alocação no Posto",
      desc: `Definido como posto principal: <strong>${op.posto || 'Centro de Cooperação da Cidade'}</strong>.`
    });

    if (op.qualificacoes && op.qualificacoes.trim()) {
      const dataQual = new Date(hoje);
      dataQual.setMonth(dataQual.getMonth() - 3);
      if (dataQual > dataPosto) {
        eventos.push({
          data: dataQual.toLocaleDateString('pt-BR'),
          titulo: "Qualificação Registrada",
          desc: `Certificação adicionada ao perfil: <em>${op.qualificacoes}</em>.`
        });
      }
    }

    if (op.preferencia_turno && op.preferencia_turno.trim()) {
      const dataPref = new Date(hoje);
      dataPref.setMonth(dataPref.getMonth() - 2);
      if (dataPref > dataPosto) {
        eventos.push({
          data: dataPref.toLocaleDateString('pt-BR'),
          titulo: "Atualização de Preferência de Escala",
          desc: `Registrada preferência pelo turno <strong>${op.preferencia_turno}</strong>.`
        });
      }
    }
    if (op.ferias_programadas && op.ferias_programadas.trim()) {
      eventos.push({
        data: op.ferias_programadas.split('-')[0].trim(),
        titulo: "Programação de Férias",
        desc: `Período planejado e aprovado de férias: <strong>${op.ferias_programadas}</strong>.`
      });
    }

    eventos.sort((a, b) => {
      const parseDate = (dStr) => {
        const parts = dStr.split('/');
        if (parts.length === 3) {
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        return new Date();
      };
      return parseDate(b.data) - parseDate(a.data);
    });

    return eventos;
  };

  window.visualizarPerfilDesdeConsulta = function(matricula) {
    window.currentVisualizarMatricula = matricula;
    const op = MOCK_OPERADORES.find(o => o.matricula === matricula);
    if (!op) {
      alert('Operador não encontrado.');
      return;
    }
    
    document.getElementById('viewOpNome').textContent = op.nome || '—';
    document.getElementById('viewOpMatricula').textContent = op.matricula || '—';
    document.getElementById('viewOpCpf').textContent = op.cpf || '—';
    document.getElementById('viewOpCargo').textContent = op.cargo || '—';
    document.getElementById('viewOpHierarquia').textContent = op.hierarquia || '—';
    document.getElementById('viewOpJornada').textContent = op.jornada_contratual || '—';
    document.getElementById('viewOpTurno').textContent = op.turno_atual || '—';
    document.getElementById('viewOpPosto').textContent = op.posto || '—';
    document.getElementById('viewOpStatus').innerHTML = badge(op.status);
    document.getElementById('viewOpQualificacoes').textContent = op.qualificacoes || 'Nenhuma qualificação registrada.';
    document.getElementById('viewOpRestricoes').textContent = op.restricoes_medicas || 'Nenhuma restrição registrada.';
    
    let feriasText = '';
    if (op.ferias_programadas) feriasText += `Férias: ${op.ferias_programadas}`;
    if (op.afastamentos) {
      if (feriasText) feriasText += ' | ';
      feriasText += `Afastamentos: ${op.afastamentos}`;
    }
    document.getElementById('viewOpFerias').textContent = feriasText || 'Nenhum período de férias ou afastamento registrado.';

    const timelineContainer = document.getElementById('careerTimelineContainer');
    const eventos = gerarLinhaDoTempoCarreira(op);
    timelineContainer.innerHTML = eventos.map(ev => `
      <div class="timeline-item">
        <div class="timeline-badge"></div>
        <div class="timeline-date">${ev.data}</div>
        <div class="timeline-title">${ev.titulo}</div>
        <div class="timeline-desc">${ev.desc}</div>
      </div>
    `).join('');

    setProfileTab('info');

    document.getElementById('modalVisualizarPerfil').classList.add('open');
    document.getElementById('modalVisualizarPerfil').setAttribute('aria-hidden', 'false');
  };

  window.editarOperadorDaVisualizacao = function() {
    fecharModalVisualizarPerfil();
    if (window.currentVisualizarMatricula) {
      editarOperadorPorMatricula(window.currentVisualizarMatricula);
    }
  };

  window.setProfileTab = function(tab) {
    const infoTab = document.getElementById('profileTabInfo');
    const carreiraTab = document.getElementById('profileTabCarreira');
    const btnInfo = document.getElementById('btnTabInfoGerais');
    const btnCarreira = document.getElementById('btnTabHistoricoCarreira');
    
    if (tab === 'info') {
      infoTab.style.display = 'block';
      carreiraTab.style.display = 'none';
      btnInfo.className = 'primary';
      btnCarreira.className = 'secondary';
    } else {
      infoTab.style.display = 'none';
      carreiraTab.style.display = 'block';
      btnInfo.className = 'secondary';
      btnCarreira.className = 'primary';
    }
  };

  window.fecharModalVisualizarPerfil = function() {
    document.getElementById('modalVisualizarPerfil').classList.remove('open');
    document.getElementById('modalVisualizarPerfil').setAttribute('aria-hidden', 'true');
  };

  window.limparConsulta = function() {
    document.getElementById('consultarNome').value = '';
    document.getElementById('consultarMatricula').value = '';
    document.getElementById('tbodyResultadosConsulta').innerHTML = '';
    document.getElementById('resultadosConsultaSec').style.display = 'none';
  };

  // Add click backdrop listeners
  setTimeout(() => {
    document.getElementById('modalCadastroEdicao').addEventListener('click', e => {
      if (e.target === document.getElementById('modalCadastroEdicao')) fecharModalCadastroEdicao();
    });
    document.getElementById('modalConsultar').addEventListener('click', e => {
      if (e.target === document.getElementById('modalConsultar')) fecharModalConsultar();
    });
    document.getElementById('modalListaCompleta').addEventListener('click', e => {
      if (e.target === document.getElementById('modalListaCompleta')) fecharModalListaCompleta();
    });
    document.getElementById('modalVisualizarPerfil').addEventListener('click', e => {
      if (e.target === document.getElementById('modalVisualizarPerfil')) fecharModalVisualizarPerfil();
    });
    document.getElementById('modalEscalas').addEventListener('click', e => {
      if (e.target === document.getElementById('modalEscalas')) fecharModalEscalas();
    });
  }, 100);

  function openOverlay(title, desc, html){ overlayTitle.textContent=title; overlayDesc.textContent=desc; overlayContent.innerHTML=html; overlayBackdrop.classList.add('open'); overlayBackdrop.setAttribute('aria-hidden','false'); }
  function closeOverlay(){ overlayBackdrop.classList.remove('open'); overlayBackdrop.setAttribute('aria-hidden','true'); overlayContent.innerHTML=''; }

  /* Modal foto */
  const modalFoto = document.getElementById('modalFoto');
  const imgModalFoto = document.getElementById('imgModalFoto');
  const btnFecharModalFoto = document.getElementById('btnFecharModalFoto');

  window.visualizarFoto = function(fotoBase64) {
    imgModalFoto.src = fotoBase64;
    modalFoto.style.display = 'flex';
    modalFoto.style.pointerEvents = 'auto';
  };

  btnFecharModalFoto.addEventListener('click', () => {
    modalFoto.style.display = 'none';
    modalFoto.style.pointerEvents = 'none';
  });

  function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  function renderPlanningCalendar() {
    const cal = document.getElementById('planningCalendar');
    if (!cal) return;
    cal.innerHTML = '';

    const selectPosto = document.getElementById('planningPosto');
    if (!selectPosto || !selectPosto.value) {
      cal.innerHTML = '<div style="grid-column: span 7; text-align: center; padding: 20px; color: var(--muted); font-size:11px;">Selecione um posto para planejar a escala.</div>';
      return;
    }

    const monthYear = document.getElementById('planningMonthYear').value;
    const [mesStr, anoStr] = monthYear.split('/');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    const totalDias = getDaysInMonth(mes, ano);

    for (let d = 1; d <= totalDias; d++) {
      const dayKey = String(d);
      const shifts = currentScaleData[dayKey] || [];
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.style.cssText = 'border: 1px solid var(--border-subtle); padding: 8px; border-radius: 6px; min-height: 80px; position: relative; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; transition: background 0.2s;';
      
      cell.addEventListener('mouseover', () => { cell.style.background = 'rgba(255,255,255,0.03)'; });
      cell.addEventListener('mouseout', () => { cell.style.background = 'transparent'; });
      cell.addEventListener('click', () => openShiftAssignmentDialog(d));

      const shiftsHtml = shifts.map(s => {
        return `<div class="shift-chip" style="background: rgba(0,255,0,0.05); border: 1px solid rgba(0,255,0,0.15); padding: 2px 4px; border-radius: 4px; font-size: 8px; margin-top: 4px; color: #4ade80; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <strong>${s.nome.split(' ')[0]}</strong> (${s.horario_inicio}-${s.horario_fim})
        </div>`;
      }).join('');

      cell.innerHTML = `
        <div>
          <div class="day-head" style="font-weight: bold; font-size: 11px;">${d}</div>
          <div class="day-shifts">${shiftsHtml}</div>
        </div>
        <div style="text-align: right; margin-top: 4px;">
          ${shifts.length > 0 ? '<span style="font-size: 9px; color: #4ade80;">?</span>' : '<span style="font-size: 8px; color: #ef4444; font-weight:bold;">Sem cob.</span>'}
        </div>
      `;
      cal.appendChild(cell);
    }
  }

  function isDateInPeriod(checkDate, periodStr) {
    if (!periodStr) return false;
    const parts = periodStr.split('-');
    if (parts.length === 2) {
      const startStr = parts[0].trim();
      const endStr = parts[1].trim();
      const parseDate = (dStr) => {
        const p = dStr.split('/');
        return new Date(parseInt(p[2],10), parseInt(p[1],10)-1, parseInt(p[0],10));
      };
      try {
        const start = parseDate(startStr);
        const end = parseDate(endStr);
        return checkDate >= start && checkDate <= end;
      } catch(e) {}
    }
    return false;
  }

  function validateCLTAssignment(op, day, start, end) {
    const errs = [];
    const monthYear = document.getElementById('planningMonthYear').value;
    const [mesStr, anoStr] = monthYear.split('/');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);
    const checkDate = new Date(ano, mes - 1, day);

    // 1. Férias
    if (op.ferias_programadas && isDateInPeriod(checkDate, op.ferias_programadas)) {
      errs.push(`Operador de férias programadas (${op.ferias_programadas}).`);
    }

    // 2. Afastamento
    if (op.afastamentos && isDateInPeriod(checkDate, op.afastamentos)) {
      errs.push(`Operador afastado (${op.afastamentos}).`);
    }

    // 3. Alocação dupla no mesmo posto
    const dayKey = String(day);
    const existing = (currentScaleData[dayKey] || []).find(s => s.usuario_id === op.id);
    if (existing) {
      errs.push(`Operador já está alocado para este dia.`);
    }

    // 4. Interjornada (11h) com dia anterior e posterior
    const yesterdayAlloc = (currentScaleData[String(day - 1)] || []).find(s => s.usuario_id === op.id);
    if (yesterdayAlloc) {
      const [yH, yM] = yesterdayAlloc.horario_fim.split(':').map(Number);
      const [tH, tM] = start.split(':').map(Number);
      const diff = (tH * 60 + tM) + (24 * 60 - (yH * 60 + yM));
      if (diff < 11 * 60) {
        errs.push(`Intervalo interjornada inferior a 11h. (Folga de apenas ${(diff/60).toFixed(1)}h).`);
      }
    }

    const tomorrowAlloc = (currentScaleData[String(day + 1)] || []).find(s => s.usuario_id === op.id);
    if (tomorrowAlloc) {
      const [tH, tM] = end.split(':').map(Number);
      const [mH, mM] = tomorrowAlloc.horario_inicio.split(':').map(Number);
      const diff = (mH * 60 + mM) + (24 * 60 - (tH * 60 + tM));
      if (diff < 11 * 60) {
        errs.push(`Intervalo interjornada com o dia posterior inferior a 11h. (Folga de apenas ${(diff/60).toFixed(1)}h).`);
      }
    }

    // 5. Limite diário (8h ou 12h)
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let dur = (eH * 60 + eM) - (sH * 60 + sM);
    if (dur < 0) dur += 24 * 60;
    const durHours = dur / 60;

    const is12x36 = (op.jornada_contratual || '').toLowerCase().includes('12x36');
    if (durHours > 8 && !is12x36) {
      errs.push(`Jornada diária superior a 8h para regime tradicional (turno: ${durHours.toFixed(1)}h).`);
    }
    if (durHours > 12) {
      errs.push(`Jornada de trabalho excede o limite legal de 12 horas consecutivas.`);
    }

    return errs;
  }

  window.openShiftAssignmentDialog = function(day) {
    const dayKey = String(day);
    const shifts = currentScaleData[dayKey] || [];
    const monthYear = document.getElementById('planningMonthYear').value;

    let html = `
      <div style="margin-bottom:12px; font-size: 13px;">
        <strong>Escala para o dia ${day}/${monthYear}</strong>
      </div>
      <div id="dayShiftsList" style="margin-bottom:12px; max-height:180px; overflow-y:auto; border: 1px solid var(--border-subtle); padding: 8px; border-radius: 6px;">
        ${shifts.map((s, idx) => `
          <div class="detail-box" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:11px; padding: 6px; background: rgba(255,255,255,0.02); border-radius: 4px;">
            <div>
              <strong>${s.nome}</strong><br/>
              <span style="color:var(--muted);">${s.horario_inicio} - ${s.horario_fim}</span>
            </div>
            <button onclick="removeShiftFromDay(${day}, ${idx})" class="secondary" style="font-size:9px; padding:4px 8px; background:#c00; color:#fff; border:none; border-radius:3px; cursor:pointer;" type="button">Remover</button>
          </div>
        `).join('') || '<div class="small" style="color:var(--muted); text-align:center; padding:10px;">Nenhum operador escalado.</div>'}
      </div>
      <div style="border-top: 1px solid var(--border-subtle); padding-top:8px;">
        <strong>Adicionar Operador</strong>
        <div class="form-grid" style="margin-top:6px; grid-template-columns:1fr; gap:6px;">
          <div class="field">
            <label class="small">Selecione o Operador</label>
            <select id="addShiftOperador" style="width:100%; border-radius:10px; padding: 6px; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle);">
              ${MOCK_OPERADORES.map((op, idx) => `<option value="${idx}">${op.nome} (${op.jornada_contratual || 'Tradicional'})</option>`).join('')}
            </select>
          </div>
          <div class="field" style="display:flex; gap:6px;">
            <div style="flex:1;">
              <label class="small">Início</label>
              <input id="addShiftInicio" type="time" value="08:00" style="width:100%; border-radius:6px; padding:4px;" />
            </div>
            <div style="flex:1;">
              <label class="small">Fim</label>
              <input id="addShiftFim" type="time" value="17:00" style="width:100%; border-radius:6px; padding:4px;" />
            </div>
          </div>
        </div>
        <div class="validation" id="addShiftValidation" style="margin-top:6px; color:#ef4444; font-size:10px; display:none; padding:6px; border:1px solid rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); border-radius:4px;"></div>
        <div class="row" style="margin-top:8px;">
          <button onclick="addShiftToDay(${day})" class="primary" type="button" style="width:100%; padding:6px; cursor:pointer;">Adicionar Alocação</button>
        </div>
      </div>
    `;
    
    openOverlay(`Dia ${day}`, "Escala de Posto", html);
  };

  window.addShiftToDay = function(day) {
    const opIdx = parseInt(document.getElementById('addShiftOperador').value, 10);
    const start = document.getElementById('addShiftInicio').value;
    const end = document.getElementById('addShiftFim').value;
    
    const op = MOCK_OPERADORES[opIdx];
    if (!op) return;
    
    const errs = validateCLTAssignment(op, day, start, end);
    const valEl = document.getElementById('addShiftValidation');
    if (errs.length > 0) {
      valEl.innerHTML = errs.join('<br/>');
      valEl.style.display = 'block';
      return;
    }
    valEl.style.display = 'none';
    
    const dayKey = String(day);
    if (!currentScaleData[dayKey]) {
      currentScaleData[dayKey] = [];
    }
    
    currentScaleData[dayKey].push({
      usuario_id: op.id,
      nome: op.nome,
      usuario: op.usuario,
      horario_inicio: start,
      horario_fim: end,
      status: 'confirmed'
    });
    
    openShiftAssignmentDialog(day);
    renderPlanningCalendar();
  };

  window.removeShiftFromDay = function(day, idx) {
    const dayKey = String(day);
    if (currentScaleData[dayKey]) {
      currentScaleData[dayKey].splice(idx, 1);
      if (currentScaleData[dayKey].length === 0) {
        delete currentScaleData[dayKey];
      }
    }
    openShiftAssignmentDialog(day);
    renderPlanningCalendar();
  };

  function atualizarKpis(){ document.getElementById('kpiPostosAtivos').textContent=MOCK_POSTOS.filter(p=>p.status==='ATIVO').length; document.getElementById('kpiPostosTotal').textContent=MOCK_POSTOS.length; document.getElementById('kpiOperadoresAtivos').textContent=MOCK_OPERADORES.filter(o=>o.status==='ATIVO').length; document.getElementById('kpiOperadoresTotal').textContent=MOCK_OPERADORES.length; document.getElementById('kpiEquipesAtivas').textContent=MOCK_EQUIPES.length; document.getElementById('kpiEquipesTotal').textContent=MOCK_EQUIPES.length; document.getElementById('kpiPendencias').textContent=MOCK_TROCAS.length+3; }
  function renderPostos(list=MOCK_POSTOS){ const tbody=document.getElementById('tbodyPostos'); tbody.innerHTML=''; list.forEach(p=>{ const tr=document.createElement('tr'); tr.className='clickable-row'; tr.dataset.postoNome=p.nome; const respName = p.responsavel_nome || 'Nenhum'; const respHtml = p.responsavel_nome ? `<a href="javascript:void(0)" onclick="event.stopPropagation(); abrirContatoPosto('${p.id}', '${p.nome}', '${p.responsavel_nome}', '${p.telefone_contato||''}')">${p.responsavel_nome}</a>` : 'Nenhum'; tr.innerHTML=`<td>${p.nome}</td><td>${p.cidade || 'Manaus/AM'}</td><td>${badge(p.status)}</td><td>${p.operadores || '-'}</td><td>${respHtml}</td>`; tbody.appendChild(tr); }); }
  function renderEquipes(list=MOCK_EQUIPES){ const tbody=document.getElementById('tbodyEquipes'); tbody.innerHTML=''; list.forEach(e=>{ const tr=document.createElement('tr'); tr.className='clickable-row'; tr.dataset.equipeNome=e.nome; tr.innerHTML=`<td>${e.nome}</td><td>${e.posto}</td><td>${e.turno}</td><td>${e.operadores}</td>`; tbody.appendChild(tr); }); }
  function renderOperadores(list=MOCK_OPERADORES){
    const tbody=document.getElementById('tbodyOperadores');
    tbody.innerHTML='';
    list.forEach(o=>{
      const tr=document.createElement('tr');
      tr.className='clickable-row';
      tr.dataset.opId = o.id;
      const isChecked = selectedOpIds.has(o.id) ? 'checked' : '';
      tr.innerHTML=`
        <td style="width: 40px; text-align: center;"><input type="checkbox" class="select-op-checkbox" data-op-id="${o.id}" ${isChecked} onclick="event.stopPropagation(); toggleOpSelection('${o.id}')" /></td>
        <td>${o.nome}</td>
        <td>${o.matricula}</td>
        <td>${o.usuario}</td>
        <td>${o.posto}</td>
        <td>${badge(o.status)}</td>
        <td><button class="secondary" type="button" onclick="event.stopPropagation(); editarOperadorPorMatricula('${o.matricula}')" style="padding: 3px 8px; font-size: 11px;">Editar</button></td>
      `;
      tbody.appendChild(tr);
    });
    updateSelectAllCheckbox();
  }
  function renderEscalas(){ const tbody=document.getElementById('tbodyEscalas'); tbody.innerHTML=''; MOCK_ESCALAS.forEach(e=>{ const tr=document.createElement('tr'); tr.className='clickable-row'; tr.innerHTML=`<td>${e.posto}</td><td>${e.mesAno}</td><td>${e.operadores}</td><td>${badge(e.status)}</td><td>${e.assinatura}</td>`; tbody.appendChild(tr); }); }
  function renderTrocas(){ const tbody=document.getElementById('tbodyTrocas'); tbody.innerHTML=''; MOCK_TROCAS.forEach(t=>{ const tr=document.createElement('tr'); tr.className='clickable-row'; tr.innerHTML=`<td>${t.sol}</td><td>${t.operador}</td><td>${t.turno}</td><td>${badge('pending')}</td><td><button class="primary" type="button">Aprovar</button> <button class="secondary" type="button">Recusar</button></td>`; tbody.appendChild(tr); }); }
  function renderHistorico(){ const tbody=document.getElementById('tbodyHistorico'); tbody.innerHTML=''; MOCK_HISTORICO.forEach(h=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${h.dt}</td><td>${h.evento}</td><td>${h.resp}</td><td>${h.det}</td>`; tbody.appendChild(tr); }); }
  function renderDisponibilidade(list=MOCK_DISPONIBILIDADE){ const tbody=document.getElementById('tbodyDisponibilidade'); tbody.innerHTML=''; list.forEach(d=>{ const tr=document.createElement('tr'); tr.className='clickable-row'; tr.dataset.nome=d.nome; tr.innerHTML=`<td>${d.nome}</td><td>${d.posto}</td><td>${badge(d.disp)}</td>`; tbody.appendChild(tr); }); }
  function renderPlanning(){ renderPlanningCalendar(); }

  function renderEscalaHoje(){
    const tbody = document.getElementById('tbodyEscalaHojeGestor');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:12px;">Carregando check-ins de hoje...</td></tr>';

    fetch('api/obter_pontos_hoje.php')
      .then(res => res.json())
      .then(data => {
        if (!data.sucesso || !data.pontos || data.pontos.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:12px;">Nenhum check-in registrado hoje.</td></tr>';
          return;
        }

        tbody.innerHTML = '';
        data.pontos.forEach(p => {
          const checkinStr = p.checkin ? new Date(p.checkin.replace(/-/g, '/')).toLocaleTimeString('pt-BR') : '—';
          const intInicioStr = p.intervalo_inicio ? new Date(p.intervalo_inicio.replace(/-/g, '/')).toLocaleTimeString('pt-BR') : '—';
          const intFimStr = p.intervalo_fim ? new Date(p.intervalo_fim.replace(/-/g, '/')).toLocaleTimeString('pt-BR') : '—';
          const checkoutStr = p.checkout ? new Date(p.checkout.replace(/-/g, '/')).toLocaleTimeString('pt-BR') : '—';
          
          const coords = (p.lat && p.lng) ? `${parseFloat(p.lat).toFixed(4)}, ${parseFloat(p.lng).toFixed(4)}` : '—';
          
          const checkinFotoBtn = p.foto_checkin 
            ? `<button class="btn-ver-foto" onclick="visualizarFoto('${p.foto_checkin}')" style="background:none;border:none;cursor:pointer;padding:0;font-size:14px;margin-left:4px;" title="Ver foto Check-in">??</button>` 
            : '';
            
          const checkoutFotoBtn = p.foto_checkout 
            ? `<button class="btn-ver-foto" onclick="visualizarFoto('${p.foto_checkout}')" style="background:none;border:none;cursor:pointer;padding:0;font-size:14px;margin-left:4px;" title="Ver foto Checkout">??</button>` 
            : '';

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${p.usuario_nome}</strong></td>
            <td>${p.usuario_matricula}</td>
            <td>${checkinStr} ${checkinFotoBtn}</td>
            <td>${intInicioStr}</td>
            <td>${intFimStr}</td>
            <td>${checkoutStr} ${checkoutFotoBtn}</td>
            <td>${coords}</td>
            <td>${badge(p.status)}</td>
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(err => {
        console.error('Erro ao carregar escala de hoje:', err);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--red);padding:12px;">Falha ao carregar registros do servidor.</td></tr>';
      });
  }

  function fillSelects(){ const sp=document.getElementById('selectEditPosto'); if(sp) sp.innerHTML=MOCK_POSTOS.map((p,i)=>`<option value="${i}">${p.nome}</option>`).join(''); const dl=document.getElementById('datalistOperadores'); if(dl) dl.innerHTML=MOCK_OPERADORES.map(o=>`<option value="${o.nome}"></option>`).join(''); }

  // Parser do GMaps
  const linkGmapsEl = document.getElementById('postoLinkGMaps');
  if(linkGmapsEl) {
    linkGmapsEl.addEventListener('input', (e) => {
      const url = e.target.value;
      const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        const lat = match[1];
        const lng = match[2];
        const latEl = document.getElementById('postoLatitude');
        const lngEl = document.getElementById('postoLongitude');
        if (latEl) latEl.value = lat;
        if (lngEl) lngEl.value = lng;
      }
    });
  }
  function loadPosto(i=0){ const p=MOCK_POSTOS[i]; if(!p) { postoModel.id=''; postoModel.nome=''; postoModel.cidade='Manaus/AM'; postoModel.status='ATIVO'; postoModel.jornada='8h'; postoModel.turno='Diurno'; postoModel.intrajornada='1h'; postoModel.interjornada='11h'; postoModel.extras='2h/dia'; postoModel.banco='Sim'; postoModel.dsr='Sim'; postoModel.especial=''; postoModel.descricao=''; postoModel.funcionalidades=''; postoModel.revezamentoNecessario='Não'; postoModel.adicionalNoturno='Não'; } else { currentPostoId=p.id; postoModel.id=p.id; postoModel.nome=p.nome; postoModel.cidade=p.cidade||'Manaus/AM'; postoModel.status=p.status||'ATIVO'; postoModel.jornada=p.jornada||'8h'; postoModel.turno=p.turno_preferencial||'Diurno'; postoModel.intrajornada=p.intrajornada||'1h'; postoModel.interjornada=p.interjornada||'11h'; postoModel.extras=p.extras||'2h/dia'; postoModel.banco=p.banco_horas||'Sim'; postoModel.dsr=p.dsr||'Sim'; postoModel.especial=p.especial||''; postoModel.descricao=p.descricao||''; postoModel.funcionalidades=p.funcionalidades||''; postoModel.revezamentoNecessario=p.revezamento_necessario||'Não'; postoModel.adicionalNoturno=p.adicional_noturno||'Não'; postoModel.endereco=p.endereco||''; postoModel.latitude=p.latitude||''; postoModel.longitude=p.longitude||''; postoModel.telefone_contato=p.telefone_contato||''; postoModel.operador_responsavel_id=p.operador_responsavel_id||null; } syncPostoForm(); }
  function syncPostoForm(){
    document.getElementById('postoNome').value = postoModel.nome || '';
    document.getElementById('postoCidade').value = postoModel.cidade || 'Manaus/AM';
    document.getElementById('postoJornada').value = postoModel.jornada || '';
    document.getElementById('postoTurno').value = postoModel.turno || '';
    document.getElementById('postoIntrajornada').value = postoModel.intrajornada || '';
    document.getElementById('postoInterjornada').value = postoModel.interjornada || '';
    document.getElementById('postoExtras').value = postoModel.extras || '';
    document.getElementById('postoBanco').value = postoModel.banco || '';
    document.getElementById('postoDsr').value = postoModel.dsr || '';
    document.getElementById('postoEspecial').value = postoModel.especial || '';
    document.getElementById('postoDescricao').value = postoModel.descricao || '';
    document.getElementById('postoFuncionalidades').value = postoModel.funcionalidades || '';
    document.getElementById('postoRevezamento').value = postoModel.revezamentoNecessario || 'Não';
    document.getElementById('postoAdicionalNoturno').value = postoModel.adicionalNoturno || 'Não';
    
    // Novos campos
    const elEnd = document.getElementById('postoEndereco'); if(elEnd) elEnd.value = postoModel.endereco || '';
    const elLat = document.getElementById('postoLatitude'); if(elLat) elLat.value = postoModel.latitude || '';
    const elLng = document.getElementById('postoLongitude'); if(elLng) elLng.value = postoModel.longitude || '';
    const elTel = document.getElementById('postoTelefone'); if(elTel) elTel.value = postoModel.telefone_contato || '';
    
    // Atualizar opções do Responsável e setar valor
    const respSelect = document.getElementById('postoResponsavel');
    if (respSelect) {
      respSelect.innerHTML = '<option value="">Nenhum</option>';
      if (typeof MOCK_OPERADORES !== 'undefined' && Array.isArray(MOCK_OPERADORES)) {
        MOCK_OPERADORES.forEach(op => {
          const opt = document.createElement('option');
          opt.value = op.id;
          opt.textContent = op.nome;
          respSelect.appendChild(opt);
        });
      }
      if (postoModel.operador_responsavel_id) {
        respSelect.value = postoModel.operador_responsavel_id;
      }
    }
  }
  
  function buscarPostosDoServidor() {
    let loggedUser = null;
    try { loggedUser = JSON.parse(localStorage.getItem('sgo_usuario')); } catch(e) {}
    
    fetch('api/obter_postos.php')
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) {
          MOCK_POSTOS = data.postos;
          
          // Filtrar por escopo se for supervisor ou gestor com escopo de UNIDADE
          if (loggedUser && loggedUser.roles && !loggedUser.roles.includes('ADMIN')) {
            if (loggedUser.scope_type === 'UNIDADE' && loggedUser.scope_value) {
              MOCK_POSTOS = MOCK_POSTOS.filter(p => p.nome === loggedUser.scope_value);
            }
          }
          
          renderPostos();
          fillSelects();
          
          const pp = document.getElementById('planningPosto');
          if (pp) {
            pp.innerHTML = MOCK_POSTOS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
          }
          
          const selectPosto = document.getElementById('selectPlanningPosto');
          if (selectPosto) {
            selectPosto.innerHTML = MOCK_POSTOS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
          }
          
          // Popular select de postos no modal de cadastro de equipe
          const equipePostoSelect = document.getElementById('equipePostoId');
          if (equipePostoSelect) {
            equipePostoSelect.innerHTML = MOCK_POSTOS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
          }
          
          // Popular select de postos no form de mensagens
          const msgSelectPosto = document.getElementById('msgDestPosto');
          if (msgSelectPosto) {
            msgSelectPosto.innerHTML = MOCK_POSTOS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
          }
          
          atualizarKpis();
          if (MOCK_POSTOS.length > 0) {
            loadPosto(0);
            carregarEscalaDoServidor();
          }
        }
      })
      .catch(err => console.error('Erro ao buscar postos:', err));
  }

  function buscarOperadoresDoServidor() {
    let loggedUser = null;
    try { loggedUser = JSON.parse(localStorage.getItem('sgo_usuario')); } catch(e) {}
    
    fetch('api/obter_operadores.php')
      .then(r => {
        if (!r.ok) throw new Error('Falha HTTP ao buscar operadores (' + r.status + ').');
        return r.json();
      })
      .then(data => {
        if (data.sucesso) {
          MOCK_OPERADORES = data.usuarios.map(u => ({
            id: u.id,
            nome: u.nome,
            matricula: u.matricula,
            usuario: u.usuario,
            posto: u.posto_principal || 'Centro de Cooperação da Cidade',
            status: u.status,
            roles: u.roles,
            cpf: u.cpf || '',
            cargo: u.cargo || '',
            hierarquia: u.hierarquia || '',
            jornada_contratual: u.jornada_contratual || '',
            turno_atual: u.turno_atual || 'Fixo',
            preferencia_turno: u.preferencia_turno || '',
            disponibilidade: u.disponibilidade || '',
            restricoes_medicas: u.restricoes_medicas || '',
            qualificacoes: u.qualificacoes || '',
            ferias_programadas: u.ferias_programadas || '',
            afastamentos: u.afastamentos || '',
            scope_type: u.scope_type || 'GLOBAL',
            scope_value: u.scope_value || ''
          }));
          
          // Filtrar por escopo se aplicável
          if (loggedUser && loggedUser.roles && !loggedUser.roles.includes('ADMIN')) {
            if (loggedUser.scope_type === 'UNIDADE' && loggedUser.scope_value) {
              MOCK_OPERADORES = MOCK_OPERADORES.filter(o => o.posto === loggedUser.scope_value);
            }
          }
          
          MOCK_DISPONIBILIDADE = MOCK_OPERADORES.map(o => ({
            nome: o.nome,
            posto: o.posto,
            disp: o.status === 'ATIVO' ? 'Disponível' : (o.status === 'FÉRIAS' ? 'Férias' : 'Indisponível')
          }));

          renderOperadores();
          renderDisponibilidade();
          fillSelects();
          
          // Popular select de operadores no form de mensagens
          const msgSelectOp = document.getElementById('msgDestOp');
          if (msgSelectOp) {
            msgSelectOp.innerHTML = MOCK_OPERADORES.map(o => `<option value="${o.id}">${o.nome} (${o.posto})</option>`).join('');
          }
          
          atualizarKpis();
          if (MOCK_OPERADORES.length > 0) {
            loadOperador(0);
          }
        } else {
          alert('Erro do servidor ao carregar operadores: ' + (data.erro || 'Desconhecido'));
        }
      })
      .catch(err => {
        console.error('Erro ao sincronizar operadores:', err);
        alert('Falha de comunicação com o banco de dados (Operadores): ' + err.message);
      });
  }

  function loadOperador(i=0){
    currentOperadorId=i;
    const o=MOCK_OPERADORES[i];
    if(!o) {
      opModel = { id:'', nome:'', cpf:'', cargo:'', hierarquia:'', jornada:'Tradicional 8h/44h', turno:'Fixo', preferencia:'Diurno', status:'Ativo', disponibilidade:'', restricoes:'', qualificacoes:'', ferias:'', afastamentos:'', matricula:'', usuario:'', senha:'', roles:'OPERADOR', postoPrincipal:'Centro de Cooperação da Cidade', scopeType:'UNIDADE', scopeValue:'' };
    } else {
      opModel.id=o.id;
      opModel.nome=o.nome;
      opModel.cpf=o.cpf || '';
      opModel.cargo=o.cargo || '';
      opModel.hierarquia=o.hierarquia || '';
      opModel.jornada=o.jornada_contratual || 'Tradicional 8h/44h';
      opModel.turno=o.turno_atual || 'Fixo';
      opModel.preferencia=o.preferencia_turno || 'Diurno';
      opModel.status=o.status==='ATIVO'?'Ativo':(o.status==='FÉRIAS'?'Em férias':'Inativo');
      opModel.disponibilidade=o.disponibilidade || '';
      opModel.restricoes=o.restricoes_medicas || '';
      opModel.qualificacoes=o.qualificacoes || '';
      opModel.ferias=o.ferias_programadas || '';
      opModel.afastamentos=o.afastamentos || '';
      opModel.matricula=o.matricula;
      opModel.usuario=o.usuario;
      opModel.senha='';
      opModel.roles=o.roles || 'OPERADOR';
      opModel.postoPrincipal=o.posto;
      opModel.scopeType=o.scope_type || 'UNIDADE';
      opModel.scopeValue=o.scope_value || '';
    }
    syncOperadorForm();
  }

  function syncOperadorForm(){
    opNome.value=opModel.nome;
    opCpf.value=opModel.cpf;
    opCargo.value=opModel.cargo;
    opHierarquia.value=opModel.hierarquia;
    opJornada.value=opModel.jornada;
    opTurno.value=opModel.turno;
    opPreferencia.value=opModel.preferencia;
    opStatus.value=opModel.status;
    opDisponibilidade.value=opModel.disponibilidade;
    opRestricoes.value=opModel.restricoes;
    opQualificacoes.value=opModel.qualificacoes;
    opFerias.value=opModel.ferias;
    opAfastamentos.value=opModel.afastamentos;
    
    opMatricula.value=opModel.matricula || '';
    opUsuario.value=opModel.usuario || '';
    opSenha.value='';
    opRoles.value=opModel.roles || 'OPERADOR';
          const chkDesignar = document.getElementById('chkDesignarPosto');
      const inputDesignado = document.getElementById('opPostoDesignado');
      const selectEq = document.getElementById('opEquipeDesignada');
      if (opModel.postoPrincipal && opModel.postoPrincipal.trim() !== '') {
        if(chkDesignar) chkDesignar.checked = true;
        if(typeof toggleDesignacaoPosto === 'function') toggleDesignacaoPosto();
        if(inputDesignado) inputDesignado.value = opModel.postoPrincipal;
        if(typeof filtrarEquipesPorPosto === 'function') filtrarEquipesPorPosto(opModel.postoPrincipal);
        if (opModel.equipe && selectEq) {
          selectEq.value = opModel.equipe;
        }
      } else {
        if(chkDesignar) chkDesignar.checked = false;
        if(typeof toggleDesignacaoPosto === 'function') toggleDesignacaoPosto();
      }
    
    document.getElementById('opScopeType').value=opModel.scopeType || 'UNIDADE';
    document.getElementById('opScopeValue').value=opModel.scopeValue || '';
    toggleFormScopeFields();

    const inputSel = document.getElementById('inputEditOperador');
    if (inputSel) {
      inputSel.value = opModel.nome || '';
    }
  }

  function validatePosto(){
    const errs=[];
    if (!postoNome.value.trim()) {
      errs.push('Nome do posto é obrigatório.');
    }
    const j = parseFloat((postoJornada.value||'').replace('h','').replace(',','.'));
    const is12x36 = postoEspecial.value.trim().toLowerCase() === '12x36' || postoJornada.value.trim().toLowerCase() === '12h';
    if (!isNaN(j)) {
      if (j > 8 && !is12x36) {
        errs.push('Jornada diária deve ser = 8h, exceto se for regime 12x36.');
      }
      if (j <= 0) {
        errs.push('Jornada diária deve ser maior que zero.');
      }
    }
    const inter = parseFloat((postoInterjornada.value||'').replace('h','').replace(',','.'));
    if (!isNaN(inter) && inter < 11) {
      errs.push('Intervalo interjornada mínimo obrigatório é de 11h.');
    }
    const intra = (postoIntrajornada.value || '').trim();
    if (!isNaN(j)) {
      if (j > 6) {
        let intraVal = parseFloat(intra.replace('h', '').replace('min', ''));
        if (intra.includes('min')) {
          intraVal = intraVal / 60;
        }
        if (intraVal < 1) {
          errs.push('Jornada > 6h exige intervalo intrajornada de no mínimo 1h.');
        }
      } else if (j >= 4 && j <= 6) {
        let intraVal = parseFloat(intra.replace('h', '').replace('min', ''));
        if (!intra.includes('min') && intraVal < 0.25) {
          errs.push('Jornada entre 4h e 6h exige intervalo intrajornada de no mínimo 15 minutos.');
        }
      }
    }
    const ext = parseFloat((postoExtras.value||'').replace('h','').replace(',','.'));
    if (!isNaN(ext) && ext > 2) {
      errs.push('Horas extras permitidas não podem exceder 2 horas diárias.');
    }
    const adNoturno = document.getElementById('postoAdicionalNoturno').value;
    if (postoTurno.value === 'Noturno' && adNoturno === 'Não') {
      errs.push('Aviso: Turno noturno exige a aplicação de adicional noturno.');
    }
    return errs;
  }
  
  function validateOperador(){
    const errs=[];
    if(!opNome.value.trim()) errs.push('Nome é obrigatório.');
    if(!opMatricula.value.trim()) errs.push('Matrícula é obrigatória.');
    if(!opUsuario.value.trim()) errs.push('Nome de usuário é obrigatório.');
    if(!opModel.id && !opSenha.value.trim()) {
      errs.push('Senha é obrigatória para criar novo usuário.');
    }
    return errs;
  }
  
  function showValidation(id, errs){
    const el=document.getElementById(id);
    if(el) {
      el.innerHTML=errs.join('<br/>');
      el.classList.toggle('show', !!errs.length);
    }
  }

  document.getElementById('btnSalvarOperador').addEventListener('click',()=>{
    const errs=validateOperador();
    showValidation('opValidation', errs);
    if(errs.length) return;

    const btn = document.getElementById('btnSalvarOperador');
    btn.disabled = true;

    const payload = {
      id: opModel.id || null,
      nome: opNome.value.trim(),
      cpf: opCpf.value.trim(),
      cargo: opCargo.value.trim(),
      hierarquia: opHierarquia.value.trim(),
      jornadaContratual: opJornada.value.trim(),
      turnoAtual: opTurno.value,
      preferenciaTurno: opPreferencia.value.trim(),
      status: opStatus.value === 'Ativo' ? 'ATIVO' : (opStatus.value === 'Em férias' ? 'FÉRIAS' : 'INATIVO'),
      disponibilidade: opDisponibilidade.value.trim(),
      restricoesMedicas: opRestricoes.value.trim(),
      qualificacoes: opQualificacoes.value.trim(),
      feriasProgramadas: opFerias.value.trim(),
      afastamentos: opAfastamentos.value.trim(),
      matricula: opMatricula.value.trim(),
      usuario: opUsuario.value.trim(),
      senha: opSenha.value.trim(),
      roles: opRoles.value,
            postoPrincipal: document.getElementById('chkDesignarPosto') && document.getElementById('chkDesignarPosto').checked ? document.getElementById('opPostoDesignado').value.trim() : '',
      equipe: document.getElementById('chkDesignarPosto') && document.getElementById('chkDesignarPosto').checked && document.getElementById('opEquipeDesignada') ? document.getElementById('opEquipeDesignada').value : '',
      scopeType: document.getElementById('opScopeType').value,
      scopeValue: document.getElementById('opScopeValue').value
    };

    fetch('api/salvar_operador.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(r => {
      if (!r.ok) {
        return r.json().then(err => { throw new Error(err.erro || 'Erro ao salvar.'); });
      }
      return r.json();
    })
    .then(data => {
      btn.disabled = false;
      alert(data.mensagem);
      opSenha.value = '';
      buscarOperadoresDoServidor();
      fecharModalCadastroEdicao();
    })
    .catch(err => {
      btn.disabled = false;
      alert('Erro: ' + err.message);
    });
  });

  function carregarEscalaDoServidor() {
    const postoId = document.getElementById('planningPosto').value;
    const mesAno = document.getElementById('planningMonthYear').value;
    if (!postoId || !mesAno) return;
    
    fetch(`api/obter_escalas.php?posto_id=${postoId}&mes_ano=${mesAno}`)
      .then(r => r.json())
      .then(data => {
        if (data.sucesso && data.existe) {
          currentScaleData = data.escala.escala_data || {};
        } else {
          currentScaleData = {};
        }
        renderPlanningCalendar();
      })
      .catch(err => {
        console.error('Erro ao carregar escala:', err);
        currentScaleData = {};
        renderPlanningCalendar();
      });
  }

  function salvarEscalaDoServidor(status = 'Rascunho') {
    const postoId = parseInt(document.getElementById('planningPosto').value, 10);
    const mesAno = document.getElementById('planningMonthYear').value;
    
    if (!postoId || !mesAno) {
      alert('Selecione um posto e um mês válidos.');
      return;
    }
    
    const uniqueOps = new Set();
    Object.values(currentScaleData).forEach(dayShifts => {
      dayShifts.forEach(s => uniqueOps.add(s.usuario_id));
    });
    
    const payload = {
      posto_id: postoId,
      mes_ano: mesAno,
      operadores_total: uniqueOps.size,
      status: status,
      assinatura: 'Pendente',
      escala_data: currentScaleData
    };
    
    fetch('api/salvar_escala.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) {
        alert(data.mensagem);
        carregarEscalaDoServidor();
        buscarEscalasDoServidor();
        buscarHistoricoDoServidor();
      } else {
        alert('Erro ao salvar: ' + data.erro);
      }
    })
    .catch(err => {
      alert('Erro de conexão: ' + err.message);
    });
  }

  function buscarEscalasDoServidor() {
    fetch('api/obter_escalas.php')
      .then(r => r.json())
      .then(data => {
        if (data.sucesso && data.lista) {
          MOCK_ESCALAS = data.lista;
          renderEscalas();
        }
      })
      .catch(err => console.error('Erro ao buscar lista de escalas:', err));
  }

  function buscarHistoricoDoServidor() {
    fetch('api/obter_historico.php')
      .then(r => r.json())
      .then(data => {
        if (data.sucesso && data.historico) {
          MOCK_HISTORICO = data.historico;
          renderHistorico();
        }
      })
      .catch(err => console.error('Erro ao buscar logs de histórico:', err));
  }

  window.gerarEscalaAutomatica = function() {
    const postoIdVal = parseInt(document.getElementById('planningPosto').value, 10);
    const posto = MOCK_POSTOS.find(p => p.id === postoIdVal);
    if (!posto) {
      alert('Selecione um posto válido.');
      return;
    }
    
    const [mesStr, anoStr] = document.getElementById('planningMonthYear').value.split('/');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);
    const totalDias = getDaysInMonth(mes, ano);
    
    currentScaleData = {};
    
    const shiftStart = posto.turno_preferencial === 'Noturno' ? '22:00' : '08:00';
    const shiftEnd = posto.turno_preferencial === 'Noturno' ? '06:00' : '17:00';
    
    const operators = MOCK_OPERADORES.filter(op => op.status === 'ATIVO');
    if (operators.length === 0) {
      alert('Nenhum operador ativo cadastrado para a escala.');
      return;
    }
    
    let opIdx = 0;
    
    for (let d = 1; d <= totalDias; d++) {
      const checkDate = new Date(ano, mes - 1, d);
      
      const availableOps = operators.filter(op => {
        if (isDateInPeriod(checkDate, op.ferias_programadas)) return false;
        if (isDateInPeriod(checkDate, op.afastamentos)) return false;
        return true;
      });
      
      if (availableOps.length === 0) continue;
      
      let opsToAssign = [];
      
      for (let i = 0; i < availableOps.length; i++) {
        const op = availableOps[(opIdx + i) % availableOps.length];
        
        const yesterdayShifts = currentScaleData[String(d - 1)] || [];
        const workedYesterday = yesterdayShifts.some(s => s.usuario_id === op.id);
        
        const is12x36 = (op.jornada_contratual || '').toLowerCase().includes('12x36');
        if (is12x36 && workedYesterday) {
          continue; 
        }
        
        opsToAssign.push(op);
        opIdx = (opIdx + i + 1) % availableOps.length;
        break;
      }
      
      if (opsToAssign.length === 0) {
        opsToAssign.push(availableOps[opIdx % availableOps.length]);
        opIdx++;
      }
      
      currentScaleData[String(d)] = opsToAssign.map(op => ({
        usuario_id: op.id,
        nome: op.nome,
        usuario: op.usuario,
        horario_inicio: shiftStart,
        horario_fim: shiftEnd,
        status: 'confirmed'
      }));
    }
    
    renderPlanningCalendar();
    alert('Escala gerada automaticamente! Revise os dias para garantir total conformidade CLT.');
  };

  function addHistory(evento, resp, det){ 
    // mock add log via DB and reload historico
  }

  const btnHistoricoPosto = document.getElementById('btnHistoricoPosto');
  if (btnHistoricoPosto) {
    btnHistoricoPosto.addEventListener('click',()=>setSubTab('sub-historico'));
  }
  
  const btnLoadPosto = document.getElementById('btnLoadPosto');
  if (btnLoadPosto) {
    btnLoadPosto.addEventListener('click',()=>loadPosto(parseInt(selectEditPosto.value||'0',10)));
  }
  
  const btnLoadOperador = document.getElementById('btnLoadOperador');
  if (btnLoadOperador) {
    btnLoadOperador.addEventListener('click',()=>{
      const val = (document.getElementById('inputEditOperador').value || '').trim().toLowerCase();
      const idx = MOCK_OPERADORES.findIndex(o => o.nome.toLowerCase() === val);
      if (idx !== -1) {
        loadOperador(idx);
      } else {
        alert('Operador não encontrado. Pesquise e escolha um nome da lista sugerida.');
      }
    });
  }
  const btnNovoPosto = document.getElementById('btnNovoPosto');
  if (btnNovoPosto) {
    btnNovoPosto.addEventListener('click',()=>{ abrirCadastroPostoDireto(); });
  }
  const btnNovoOperador = document.getElementById('btnNovoOperador');
  if (btnNovoOperador) {
    btnNovoOperador.addEventListener('click',()=>{
      opModel = { id:'', nome:'', cpf:'', cargo:'', hierarquia:'', jornada:'Tradicional 8h/44h', turno:'Fixo', preferencia:'Diurno', status:'Ativo', disponibilidade:'', restricoes:'', qualificacoes:'', ferias:'', afastamentos:'', matricula:'', usuario:'', senha:'', roles:'OPERADOR', postoPrincipal:'Centro de Cooperação da Cidade' };
      syncOperadorForm();
    });
  }

  document.getElementById('tbodyPostos').addEventListener('click',e=>{ const tr=e.target.closest('tr'); if(tr?.dataset.postoNome) openPosto(tr.dataset.postoNome); });
  document.getElementById('tbodyEquipes').addEventListener('click',e=>{ const tr=e.target.closest('tr'); if(tr?.dataset.equipeNome) openEquipe(tr.dataset.equipeNome); });
  document.getElementById('tbodyOperadores').addEventListener('click',e=>{
    if (e.target.type === 'checkbox') return;
    const tr=e.target.closest('tr');
    if(!tr) return;
    const mat=tr.children[2]?.textContent.trim();
    if(mat){
      visualizarPerfilDesdeConsulta(mat);
    }
  });
  document.getElementById('tbodyDisponibilidade').addEventListener('click',e=>{ const tr=e.target.closest('tr'); if(!tr) return; const op=MOCK_OPERADORES.find(o=>o.nome===tr.dataset.nome); document.getElementById('dispSelected').textContent=tr.dataset.nome; document.getElementById('dispStatus').value=MOCK_DISPONIBILIDADE.find(d=>d.nome===tr.dataset.nome)?.disp||'Disponível'; document.getElementById('dispObs').value=`Disponibilidade atual de ${tr.dataset.nome}.`; if(op) openOperadorSession(op.matricula); });

  document.getElementById('filtroPostos').addEventListener('input',e=>renderPostos(MOCK_POSTOS.filter(p=>(p.nome+p.cidade).toLowerCase().includes(e.target.value.toLowerCase()))));
  document.getElementById('filtroEquipes').addEventListener('input',e=>renderEquipes(MOCK_EQUIPES.filter(x=>(x.nome+x.posto+x.turno).toLowerCase().includes(e.target.value.toLowerCase()))));
  document.getElementById('filtroOperadores').addEventListener('input',e=>renderOperadores(MOCK_OPERADORES.filter(x=>(x.nome+x.matricula+x.posto).toLowerCase().includes(e.target.value.toLowerCase()))));
  document.getElementById('filtroDisponibilidade').addEventListener('input',e=>renderDisponibilidade(MOCK_DISPONIBILIDADE.filter(x=>(x.nome+x.posto+x.disp).toLowerCase().includes(e.target.value.toLowerCase()))));
  document.querySelectorAll('.kpi-card[data-goto-tab]').forEach(card => {
    card.addEventListener('click', () => {
      const targetTab = card.dataset.gotoTab;
      if (targetTab === 'tab-escalas') {
        abrirModalEscalas();
      } else {
        setTab(targetTab);
        if (targetTab === 'tab-postos') {
          showPostosSubPanel('postos-lista');
        } else if (targetTab === 'tab-equipes') {
          showEquipesSubPanel('equipes-lista');
        } else if (targetTab === 'tab-operadores') {
          abrirModalListaCompleta();
        }
      }
    });
  });

  document.getElementById('planningPosto').addEventListener('change', carregarEscalaDoServidor);
  document.getElementById('planningMonthYear').addEventListener('change', carregarEscalaDoServidor);
  document.getElementById('btnGerarEscala').addEventListener('click', gerarEscalaAutomatica);
  document.getElementById('btnSalvarRascunho').addEventListener('click', () => salvarEscalaDoServidor('Rascunho'));
  document.getElementById('btnPublicarEscala').addEventListener('click', () => salvarEscalaDoServidor('Publicada'));

  function openPosto(nome){
    const posto=MOCK_POSTOS.find(p=>p.nome===nome);
    if(!posto) return;
    const equipes=MOCK_EQUIPES.filter(e=>e.posto===nome);
    const operadores=MOCK_OPERADORES.filter(o=>o.posto===nome);
    
    let editBtn = '';
    let u = {};
    try { u = JSON.parse(localStorage.getItem('sgo_usuario') || '{}'); } catch(e) {}
    const roles = u.roles || [];
    if (roles.includes('GESTOR') || roles.includes('ADMIN')) {
      editBtn = `<div style="margin-top:12px; text-align:right;"><button class="primary" onclick="fecharModalPostoEEditar('${posto.nome}')" style="padding: 4px 10px; font-size:11px;">Editar Posto ??</button></div>`;
    }

    openOverlay(posto.nome, `${posto.cidade} • sessão do posto`, `<div class="detail-box"><div><strong>Status:</strong> ${badge(posto.status)}</div><div><strong>Operadores:</strong> ${posto.operadores || '-'}</div></div><div class="overlay-section"><div class="row-between"><strong>Equipes empenhadas</strong></div><div class="table-box">${equipes.length ? equipes.map(e=>`<div style="padding:4px 0;"><strong>${e.nome}</strong> • ${e.turno} • ${e.operadores} operadores</div>`).join('') : '<div class="small">Sem equipes vinculadas.</div>'}</div></div><div class="overlay-section"><div class="row-between"><strong>Operadores do posto</strong><span class="small">Clique para travar a sessão do operador</span></div><div class="table-box"><div class="list-row" style="font-size:11px;color:var(--muted)"><div>Nome</div><div>Status</div></div><div id="postoOps" class="operadores-list" style="max-height:260px"></div></div></div>${editBtn}`);
    
    const postoOps=document.getElementById('postoOps');
    postoOps.innerHTML=operadores.map(op=>`<div class="list-row" data-mat="${op.matricula}"><div><div><strong>${op.nome}</strong></div><div class="small">Matrícula ${op.matricula} • ${op.usuario}</div></div><div>${badge(op.status)}</div></div>`).join('');
    postoOps.querySelectorAll('.list-row').forEach(row=>row.addEventListener('click',()=>openOperadorSession(row.dataset.mat)));
  }

  window.fecharModalPostoEEditar = function(nome) {
    closeOverlay();
    editarPostoDireto(nome);
  };

  function openOperadorSession(matricula){ const op=MOCK_OPERADORES.find(o=>o.matricula===matricula); if(!op) return; openOverlay(op.nome, `${op.posto} • sessão do operador`, `<div class="detail-box"><div><strong>Matrícula:</strong> ${op.matricula}</div><div><strong>Usuário:</strong> ${op.usuario}</div><div><strong>Posto principal:</strong> ${op.posto}</div><div><strong>Status:</strong> ${badge(op.status)}</div></div><div class="overlay-section"><div class="row-between"><strong>Rotina do mês</strong><button class="secondary" id="btnMoreOp">+ Info</button></div><div id="opMore" style="display:none"><div class="detail-box"><div><strong>Rotinas:</strong></div><ul class="overlay-list"><li>08:00 – conferência inicial da rotina.</li><li>12:00 – apoio operacional no posto.</li><li>18:00 – fechamento e observações do mês.</li></ul><div style="margin-top:8px;"><strong>Observações:</strong></div><ul class="overlay-list"><li>Mantém boa comunicação.</li><li>Alta aderência ao posto.</li><li>Revisar passagens de turno.</li></ul></div></div></div>`); document.getElementById('btnMoreOp').addEventListener('click',()=>{ const box=document.getElementById('opMore'); box.style.display=box.style.display==='none'?'block':'none'; }); }

  function openEquipe(nome){
    const eq=MOCK_EQUIPES.find(e=>e.nome===nome);
    if(!eq) return;
    const membros=MOCK_OPERADORES.filter(o=>o.posto===eq.posto);
    
    let editBtn = '';
    let u = {};
    try { u = JSON.parse(localStorage.getItem('sgo_usuario') || '{}'); } catch(e) {}
    const roles = u.roles || [];
    if (roles.includes('GESTOR') || roles.includes('ADMIN')) {
      editBtn = `<div style="margin-top:12px; text-align:right;"><button class="primary" onclick="editarEquipeDireto('${eq.nome}')" style="padding: 4px 10px; font-size:11px;">Editar Equipe ??</button></div>`;
    }

    openOverlay(eq.nome, `${eq.posto} • sessão da equipe`, `<div class="detail-box"><div><strong>Líder:</strong> ${eq.lider}</div><div><strong>Posto:</strong> ${eq.posto}</div><div><strong>Turno:</strong> ${eq.turno}</div><div><strong>Operadores previstos:</strong> ${eq.operadores}</div></div><div class="overlay-section"><div class="row-between"><strong>Membros da equipe</strong><button class="secondary" id="btnMoreTeam">+ Info</button></div><div class="table-box" style="max-height:260px;overflow:auto;">${membros.map(m=>`<div class="list-row" data-mat="${m.matricula}"><div><div><strong>${m.nome}</strong></div><div class="small">Matrícula ${m.matricula} • ${m.usuario}</div></div><div>${badge(m.status)}</div></div>`).join('')}</div><div id="teamMore" style="display:none"></div></div>${editBtn}`);
    
    document.getElementById('btnMoreTeam').addEventListener('click',()=>{
      const box=document.getElementById('teamMore');
      if(box.style.display==='none' || !box.style.display){
        box.style.display='block';
        box.innerHTML=`<div class="detail-box"><div><strong>Rotinas da equipe:</strong></div><ul class="overlay-list"><li>Ronda e verificação de ponto.</li><li>Passagem de turno com checagem de pendências.</li><li>Observação de fluxo e apoio em cobertura.</li></ul><div style="margin-top:8px;"><strong>Observações do mês:</strong></div><ul class="overlay-list"><li>Bom entrosamento operacional.</li><li>Validar escalas de folga antes de publicar.</li><li>Sem ocorrências críticas no período.</li></ul></div>`;
      } else {
        box.style.display='none';
        box.innerHTML='';
      }
    });
    document.querySelectorAll('#overlayContent .list-row').forEach(row=>row.addEventListener('click',()=>openOperadorSession(row.dataset.mat)));
  }

  function loadUser(){
    try {
      const raw = localStorage.getItem('sgo_usuario');
      if (!raw) {
        window.location.href = 'index.html';
        return;
      }
      const u = JSON.parse(raw);
      const roles = u.roles || [];
      if (!roles.includes('GESTOR') && !roles.includes('ADMIN') && !roles.includes('SUPERVISOR')) {
        alert('Acesso negado. Usuário sem permissão de gestão.');
        window.location.href = 'index.html';
        return;
      }
      
      document.getElementById('subtitleGestor').textContent = `${u.roles || 'Gestor'} logado – ${u.nome || u.username || 'Gestor'}`;
      
      // Aplicar restrições para SUPERVISOR
      if (roles.includes('SUPERVISOR')) {
        const idsToHide = [
          'btnMenuCadastrar', 'btnNovoPostoPrincipal', 'btnNovaEquipePrincipal',
          'btnNovoPosto', 'btnSalvarPosto', 'btnSalvarEquipe',
          'btnGerarEscala', 'btnSalvarRascunho', 'btnPublicarEscala',
          'btnSalvarOperador', 'btnExcluirPosto'
        ];
        idsToHide.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        
        const batchBar = document.getElementById('batchEditBar');
        if (batchBar) batchBar.style.display = 'none';
      }
    } catch(e) {
      window.location.href = 'index.html';
    }
  }

  // Operações de Postos em Modal
  window.abrirCadastroPostoDireto = function() {
    postoModel.id = '';
    postoModel.nome = '';
    postoModel.cidade = 'Manaus/AM';
    postoModel.status = 'ATIVO';
    postoModel.jornada = '8h';
    postoModel.turno = 'Diurno';
    postoModel.intrajornada = '1h';
    postoModel.interjornada = '11h';
    postoModel.extras = '2h/dia';
    postoModel.banco = 'Sim';
    postoModel.dsr = 'Sim';
    postoModel.especial = '';
    postoModel.descricao = '';
    postoModel.funcionalidades = '';
    postoModel.revezamentoNecessario = 'Não';
    postoModel.adicionalNoturno = 'Não';
    postoModel.endereco = '';
    postoModel.latitude = '';
    postoModel.longitude = '';
    postoModel.telefone_contato = '';
    postoModel.operador_responsavel_id = null;
    
    syncPostoForm();
    document.getElementById('postoLinkGMaps').value = '';
    document.getElementById('modalCadastroPostoTitle').textContent = 'Novo Posto de Trabalho';
    document.getElementById('btnExcluirPosto').style.display = 'none';
    document.getElementById('modalCadastroPosto').classList.add('open');
    document.getElementById('modalCadastroPosto').setAttribute('aria-hidden', 'false');
  };

  window.fecharModalCadastroPosto = function() {
    document.getElementById('modalCadastroPosto').classList.remove('open');
    document.getElementById('modalCadastroPosto').setAttribute('aria-hidden', 'true');
  };

  window.editarPostoDireto = function(nome) {
    const idx = MOCK_POSTOS.findIndex(p => p.nome === nome);
    if (idx !== -1) {
      loadPosto(idx);
      document.getElementById('modalCadastroPostoTitle').textContent = 'Editar Posto de Trabalho';
      document.getElementById('btnExcluirPosto').style.display = 'block';
      document.getElementById('modalCadastroPosto').classList.add('open');
      document.getElementById('modalCadastroPosto').setAttribute('aria-hidden', 'false');
    }
  };

  window.editarPostoSelecionadoNaEscala = function() {
    const sel = document.getElementById('selectEditPosto');
    if (sel && sel.value !== '') {
      const postoId = parseInt(sel.value, 10);
      const idx = MOCK_POSTOS.findIndex(p => p.id == postoId);
      if (idx !== -1) {
        loadPosto(idx);
        document.getElementById('modalCadastroPostoTitle').textContent = 'Editar Posto de Trabalho';
        document.getElementById('btnExcluirPosto').style.display = 'block';
        document.getElementById('modalCadastroPosto').classList.add('open');
        document.getElementById('modalCadastroPosto').setAttribute('aria-hidden', 'false');
      }
    } else {
      alert('Selecione um posto para editar.');
    }
  };

  window.excluirPostoDireto = async function() {
    if (!postoModel.id) return;
    const confirmacao = await sgoConfirm('Tem certeza que deseja excluir este posto? Todos os pontos vinculados a ele podem perder a referência.', 'Excluir Posto');
    if (!confirmacao) return;

    const btn = document.getElementById('btnExcluirPosto');
    btn.disabled = true;

    fetch('api/excluir_posto.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postoModel.id })
    })
    .then(r => r.json())
    .then(data => {
      btn.disabled = false;
      if (data.sucesso) {
        alert(data.mensagem);
        fecharModalCadastroPosto();
        buscarPostosDoServidor();
      } else {
        alert('Erro ao excluir: ' + data.erro);
      }
    })
    .catch(err => {
      btn.disabled = false;
      alert('Erro de conexão: ' + err.message);
    });
  };

  window.salvarPostoDireto = function() {
    const errs = validatePosto();
    showValidation('postoValidation', errs);
    if (errs.length > 0) return;

    const btn = document.getElementById('btnSalvarPosto');
    btn.disabled = true;

    const payload = {
      id: postoModel.id || null,
      nome: document.getElementById('postoNome').value.trim(),
      cidade: document.getElementById('postoCidade') ? document.getElementById('postoCidade').value.trim() : (postoModel.cidade || 'Manaus/AM'),
      status: postoModel.status || 'ATIVO',
      jornada: document.getElementById('postoJornada').value.trim(),
      turnoPreferencial: document.getElementById('postoTurno').value,
      intrajornada: document.getElementById('postoIntrajornada').value.trim(),
      interjornada: document.getElementById('postoInterjornada').value.trim(),
      extras: document.getElementById('postoExtras').value.trim(),
      bancoHoras: document.getElementById('postoBanco').value,
      dsr: document.getElementById('postoDsr').value,
      especial: document.getElementById('postoEspecial').value.trim(),
      descricao: document.getElementById('postoDescricao').value.trim(),
      funcionalidades: document.getElementById('postoFuncionalidades').value.trim(),
      revezamentoNecessario: document.getElementById('postoRevezamento').value,
      adicionalNoturno: document.getElementById('postoAdicionalNoturno').value,
      latitude: document.getElementById('postoLatitude') ? document.getElementById('postoLatitude').value.trim() : null,
      longitude: document.getElementById('postoLongitude') ? document.getElementById('postoLongitude').value.trim() : null,
      endereco: document.getElementById('postoEndereco') ? document.getElementById('postoEndereco').value.trim() : '',
      telefone_contato: document.getElementById('postoTelefone') ? document.getElementById('postoTelefone').value.trim() : '',
      operador_responsavel_id: document.getElementById('postoResponsavel') ? document.getElementById('postoResponsavel').value : null
    };

    fetch('api/salvar_posto.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      btn.disabled = false;
      if (data.sucesso) {
        alert(data.mensagem);
        fecharModalCadastroPosto();
        buscarPostosDoServidor();
      } else {
        alert('Erro ao salvar posto: ' + data.erro);
      }
    })
    .catch(err => {
      btn.disabled = false;
      alert('Erro de rede: ' + err.message);
    });
  };

  // Operações de Equipes
  let currentEquipeId = null;
  window.abrirCadastroEquipeDireto = function() {
    currentEquipeId = null;
    document.getElementById('equipeNome').value = '';
    document.getElementById('equipeTurno').value = '';
    document.getElementById('equipeLider').value = '';
    if (MOCK_POSTOS.length > 0) {
      document.getElementById('equipePostoId').value = MOCK_POSTOS[0].id;
    }
    
    document.getElementById('modalCadastroEquipeTitle').textContent = 'Cadastrar Equipe';
    document.getElementById('modalCadastroEquipe').classList.add('open');
    document.getElementById('modalCadastroEquipe').setAttribute('aria-hidden', 'false');
  };

  window.fecharModalCadastroEquipe = function() {
    document.getElementById('modalCadastroEquipe').classList.remove('open');
    document.getElementById('modalCadastroEquipe').setAttribute('aria-hidden', 'true');
  };

  window.editarEquipeDireto = function(nome) {
    closeOverlay(); // fecha a sessão da equipe
    const eq = MOCK_EQUIPES.find(e => e.nome === nome);
    if (eq) {
      currentEquipeId = eq.id;
      document.getElementById('equipeNome').value = eq.nome;
      document.getElementById('equipeTurno').value = eq.turno;
      document.getElementById('equipeLider').value = eq.lider || '';
      document.getElementById('equipePostoId').value = eq.posto_id || '';
      
      document.getElementById('modalCadastroEquipeTitle').textContent = 'Editar Equipe';
      document.getElementById('modalCadastroEquipe').classList.add('open');
      document.getElementById('modalCadastroEquipe').setAttribute('aria-hidden', 'false');
    }
  };

  window.salvarEquipeDireto = function() {
    const nome = document.getElementById('equipeNome').value.trim();
    const posto_id = document.getElementById('equipePostoId').value;
    const turno = document.getElementById('equipeTurno').value.trim();
    const lider = document.getElementById('equipeLider').value.trim();
    
    if (!nome) {
      alert('O nome da equipe é obrigatório.');
      return;
    }
    
    const btn = document.getElementById('btnSalvarEquipe');
    btn.disabled = true;
    
    const payload = {
      id: currentEquipeId,
      nome,
      posto_id: posto_id || null,
      turno,
      lider
    };
    
    fetch('api/salvar_equipe.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      btn.disabled = false;
      if (data.sucesso) {
        sgoAlert(data.mensagem);
        fecharModalCadastroEquipe();
        buscarEquipesDoServidor();
      } else {
        alert('Erro ao salvar equipe: ' + data.erro);
      }
    })
    .catch(err => {
      btn.disabled = false;
      alert('Erro de rede: ' + err.message);
    });
  };

  window.buscarEquipesDoServidor = function() {
    let loggedUser = null;
    try { loggedUser = JSON.parse(localStorage.getItem('sgo_usuario')); } catch(e) {}
    
    fetch('api/obter_equipes.php')
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) {
          MOCK_EQUIPES = data.equipes;
          
          // Filtrar equipes por escopo se aplicável
          if (loggedUser && loggedUser.roles && !loggedUser.roles.includes('ADMIN')) {
            if (loggedUser.scope_type === 'UNIDADE' && loggedUser.scope_value) {
              MOCK_EQUIPES = MOCK_EQUIPES.filter(e => e.posto === loggedUser.scope_value);
            }
          }
          
          renderEquipes();
          
          const selectEquipe = document.getElementById('selectPlanningEquipe');
          if (selectEquipe) {
            selectEquipe.innerHTML = MOCK_EQUIPES.map(e => `<option value="${e.nome}">${e.nome}</option>`).join('');
          }
          
          const msgSelectEquipe = document.getElementById('msgDestEquipe');
          if (msgSelectEquipe) {
            msgSelectEquipe.innerHTML = MOCK_EQUIPES.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
          }
        }
      })
      .catch(err => console.error('Erro ao buscar equipes:', err));
  };

  // Serviço de Mensagens
  let MOCK_MENSAGENS = [];
  window.showMessagesSubPanel = function(panelId) {
    document.getElementById('messagesCardapio').style.display = 'none';
    document.getElementById('messagesSubtabs').style.display = 'flex';
    
    const tabs = document.querySelectorAll('[data-msgtab]');
    const panels = document.querySelectorAll('#tab-mensagens .subtab-panel');
    
    tabs.forEach(t => t.classList.toggle('active', t.dataset.msgtab === panelId));
    panels.forEach(p => p.style.display = p.id === panelId ? 'block' : 'none');
  };

  window.voltarAoMenuMensagens = function() {
    const panels = document.querySelectorAll('#tab-mensagens .subtab-panel');
    panels.forEach(p => p.style.display = 'none');
    document.getElementById('messagesSubtabs').style.display = 'none';
    document.getElementById('messagesCardapio').style.display = 'grid';
  };

  window.toggleMsgDestType = function() {
    const tipo = document.getElementById('msgDestTipo').value;
    document.getElementById('fieldMsgDestOp').style.display = tipo === 'INDIVIDUAL' ? 'block' : 'none';
    document.getElementById('fieldMsgDestPosto').style.display = tipo === 'POSTO' ? 'block' : 'none';
    document.getElementById('fieldMsgDestEquipe').style.display = tipo === 'EQUIPE' ? 'block' : 'none';
  };

  window.buscarMensagensDoServidor = function() {
    let loggedUser = null;
    try {
      loggedUser = JSON.parse(localStorage.getItem('sgo_usuario'));
    } catch(e) {}
    if (!loggedUser) return;
    
    fetch(`api/obter_mensagens.php?usuario_id=${loggedUser.id}&role=${loggedUser.roles}`)
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) {
          MOCK_MENSAGENS = data.mensagens;
          renderMensagensGestao();
        }
      })
      .catch(err => console.error('Erro ao obter mensagens:', err));
  };

  window.renderMensagensGestao = function() {
    let loggedUser = null;
    try {
      loggedUser = JSON.parse(localStorage.getItem('sgo_usuario'));
    } catch(e) {}
    const uid = loggedUser ? loggedUser.id : 0;
    
    const tbodyRecebidas = document.getElementById('tbodyMsgRecebidasGestao');
    const tbodyEnviadas = document.getElementById('tbodyMsgEnviadasGestao');
    
    if (tbodyRecebidas) tbodyRecebidas.innerHTML = '';
    if (tbodyEnviadas) tbodyEnviadas.innerHTML = '';
    
    const recebidas = MOCK_MENSAGENS.filter(m => m.remetente_id !== uid);
    const enviadas = MOCK_MENSAGENS.filter(m => m.remetente_id === uid);
    
    if (tbodyRecebidas) {
      if (recebidas.length === 0) {
        tbodyRecebidas.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:12px;">Nenhuma mensagem recebida.</td></tr>';
      } else {
        recebidas.forEach(m => {
          const tr = document.createElement('tr');
          const dataStr = new Date(m.data_envio).toLocaleString('pt-BR');
          const anexoBtn = m.anexo_path ? `<button class="primary" onclick="visualizarFoto('${m.anexo_path}')" style="padding: 2px 6px; font-size:10px; display:inline-flex;">?? Ver</button>` : '';
          tr.innerHTML = `
            <td>${dataStr}</td>
            <td><strong>${m.remetente_nome}</strong></td>
            <td>${m.assunto}</td>
            <td style="white-space:normal; max-width:300px;">${m.corpo}</td>
            <td>${anexoBtn}</td>
          `;
          tbodyRecebidas.appendChild(tr);
        });
      }
    }
    
    if (tbodyEnviadas) {
      if (enviadas.length === 0) {
        tbodyEnviadas.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:12px;">Nenhuma mensagem enviada.</td></tr>';
      } else {
        enviadas.forEach(m => {
          const tr = document.createElement('tr');
          const dataStr = new Date(m.data_envio).toLocaleString('pt-BR');
          let dest = 'Geral (Todos)';
          if (m.tipo_destinatario === 'INDIVIDUAL') dest = m.destinatario_nome || 'Individual';
          else if (m.tipo_destinatario === 'POSTO') dest = `Posto: ${m.posto_nome || 'Desconhecido'}`;
          else if (m.tipo_destinatario === 'EQUIPE') dest = `Equipe: ${m.equipe_nome || 'Desconhecida'}`;
          
          tr.innerHTML = `
            <td>${dataStr}</td>
            <td><strong>${dest}</strong></td>
            <td>${m.assunto}</td>
            <td style="white-space:normal; max-width:300px;">${m.corpo}</td>
            <td>—</td>
          `;
          tbodyEnviadas.appendChild(tr);
        });
      }
    }
  };

  window.enviarMensagemGestao = function() {
    let loggedUser = null;
    try {
      loggedUser = JSON.parse(localStorage.getItem('sgo_usuario'));
    } catch(e) {}
    if (!loggedUser) return;
    
    const tipo = document.getElementById('msgDestTipo').value;
    const destinatario_id = document.getElementById('msgDestOp').value;
    const posto_id = document.getElementById('msgDestPosto').value;
    const equipe_id = document.getElementById('msgDestEquipe').value;
    const assunto = document.getElementById('msgSendAssunto').value.trim();
    const corpo = document.getElementById('msgSendCorpo').value.trim();
    
    if (!assunto || !corpo) {
      alert('Assunto e mensagem são obrigatórios.');
      return;
    }
    
    const btn = document.getElementById('btnEnviarMensagemGestao');
    btn.disabled = true;
    
    const payload = {
      remetente_id: loggedUser.id,
      tipo_destinatario: tipo,
      destinatario_id: tipo === 'INDIVIDUAL' ? destinatario_id : null,
      posto_id: tipo === 'POSTO' ? posto_id : null,
      equipe_id: tipo === 'EQUIPE' ? equipe_id : null,
      assunto: assunto,
      corpo: corpo,
      anexo_base64: ''
    };
    
    fetch('api/salvar_mensagem.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      btn.disabled = false;
      if (data.sucesso) {
        alert(data.mensagem);
        document.getElementById('msgSendAssunto').value = '';
        document.getElementById('msgSendCorpo').value = '';
        buscarMensagensDoServidor();
        showMessagesSubPanel('msg-enviadas');
      } else {
        alert('Erro ao enviar mensagem: ' + data.erro);
      }
    })
    .catch(err => {
      btn.disabled = false;
      alert('Erro de conexão: ' + err.message);
    });
  };

  // Escopos dinâmicos no form do operador
  window.toggleFormScopeFields = function() {
    const roles = document.getElementById('opRoles').value;
    const isOperador = roles === 'OPERADOR';
    document.getElementById('fieldOpScopeType').style.display = isOperador ? 'none' : 'block';
    document.getElementById('fieldOpScopeValue').style.display = isOperador ? 'none' : 'block';
  };

  // Lógica de Edição em Lote
  let selectedOpIds = new Set();
  window.selectedOpIds = selectedOpIds;

  window.toggleOpSelection = function(opId) {
    opId = parseInt(opId, 10);
    if (selectedOpIds.has(opId)) {
      selectedOpIds.delete(opId);
    } else {
      selectedOpIds.add(opId);
    }
    updateBatchActionBar();
  };

  window.updateSelectAllCheckbox = function() {
    const chkAll = document.getElementById('selectAllOps');
    if (!chkAll) return;
    const checkboxes = document.querySelectorAll('.select-op-checkbox');
    if (checkboxes.length === 0) {
      chkAll.checked = false;
      return;
    }
    let allChecked = true;
    checkboxes.forEach(c => {
      if (!c.checked) allChecked = false;
    });
    chkAll.checked = allChecked;
  };

  window.updateBatchActionBar = function() {
    const bar = document.getElementById('batchEditBar');
    const countSpan = document.getElementById('batchCount');
    if (!bar || !countSpan) return;
    
    const count = selectedOpIds.size;
    countSpan.textContent = count;
    
    if (count >= 1) {
      bar.style.transform = 'translateX(-50%) translateY(0)';
    } else {
      bar.style.transform = 'translateX(-50%) translateY(120%)';
    }
    updateSelectAllCheckbox();
  };

  window.limparSelecaoLote = function() {
    selectedOpIds.clear();
    const checkboxes = document.querySelectorAll('.select-op-checkbox');
    checkboxes.forEach(c => c.checked = false);
    const chkAll = document.getElementById('selectAllOps');
    if (chkAll) chkAll.checked = false;
    updateBatchActionBar();
  };

  window.abrirModalEdicaoLote = function() {
    const count = selectedOpIds.size;
    if (count === 0) return;
    
    let html = `
      <div style="margin-bottom:12px; font-size: 13px;">
        Você está editando <strong>${count}</strong> operador(es) simultaneamente. 
        <div class="small" style="color: var(--yellow); margin-top:2px;">Marque a caixa ao lado de cada campo para habilitá-lo e aplicar a alteração em lote.</div>
      </div>
      
      <div class="form-grid" style="grid-template-columns: 1fr; gap: 10px; margin-top:10px;">
        <!-- Posto Principal -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchPosto" onchange="toggleBatchField('batchPosto')" />
          <div style="flex:1;">
            <label class="small">Posto Principal</label>
            <select id="batchPosto" disabled style="width:100%; border-radius:10px; padding:6px; background:var(--bg-card); color:var(--text-main); border:1px solid var(--border-subtle);">
              ${MOCK_POSTOS.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Jornada Contratual -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchJornada" onchange="toggleBatchField('batchJornada')" />
          <div style="flex:1;">
            <label class="small">Jornada Contratual</label>
            <input type="text" id="batchJornada" disabled value="Tradicional 8h/44h" style="width:100%; border-radius:6px; padding:4px;" />
          </div>
        </div>

        <!-- Turno Atual -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchTurno" onchange="toggleBatchField('batchTurno')" />
          <div style="flex:1;">
            <label class="small">Turno Atual</label>
            <select id="batchTurno" disabled style="width:100%; border-radius:10px; padding:6px; background:var(--bg-card); color:var(--text-main); border:1px solid var(--border-subtle);">
              <option>Fixo</option>
              <option>Alternado</option>
              <option>Revezamento</option>
            </select>
          </div>
        </div>

        <!-- Status -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchStatus" onchange="toggleBatchField('batchStatus')" />
          <div style="flex:1;">
            <label class="small">Status</label>
            <select id="batchStatus" disabled style="width:100%; border-radius:10px; padding:6px; background:var(--bg-card); color:var(--text-main); border:1px solid var(--border-subtle);">
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="FÉRIAS">Em férias</option>
            </select>
          </div>
        </div>

        <!-- Férias Programadas -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchFerias" onchange="toggleBatchField('batchFerias')" />
          <div style="flex:1;">
            <label class="small">Férias Programadas (ex: DD/MM/AAAA - DD/MM/AAAA)</label>
            <input type="text" id="batchFerias" disabled placeholder="01/06/2026 - 15/06/2026" style="width:100%; border-radius:6px; padding:4px;" />
          </div>
        </div>

        <!-- Afastamentos -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchAfastamentos" onchange="toggleBatchField('batchAfastamentos')" />
          <div style="flex:1;">
            <label class="small">Afastamentos</label>
            <input type="text" id="batchAfastamentos" disabled placeholder="Licença Médica" style="width:100%; border-radius:6px; padding:4px;" />
          </div>
        </div>

        <!-- Qualificações -->
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="chk_batchQualificacoes" onchange="toggleBatchField('batchQualificacoes')" />
          <div style="flex:1;">
            <label class="small">Qualificações</label>
            <input type="text" id="batchQualificacoes" disabled placeholder="Monitoramento" style="width:100%; border-radius:6px; padding:4px;" />
          </div>
        </div>
      </div>
      
      <div style="margin-top:14px; border-top:1px solid var(--border-subtle); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
        <button class="secondary" type="button" onclick="closeOverlay()" style="padding:6px 12px;">Cancelar</button>
        <button class="primary" type="button" id="btnSalvarLote" onclick="salvarAlteracoesLote()" style="padding:6px 16px;">Salvar Lote</button>
      </div>
    `;
    
    openOverlay("Edição de Operadores em Lote", "Ações em Lote", html);
  };

  window.toggleBatchField = function(fieldId) {
    const chk = document.getElementById('chk_' + fieldId);
    const input = document.getElementById(fieldId);
    if (chk && input) {
      input.disabled = !chk.checked;
    }
  };

  window.salvarAlteracoesLote = function() {
    const ids = Array.from(selectedOpIds);
    if (ids.length === 0) {
      alert('Nenhum operador selecionado.');
      return;
    }

    const campos = {};
    let hasField = false;

    if (document.getElementById('chk_batchPosto').checked) {
      campos['postoPrincipal'] = document.getElementById('batchPosto').value;
      hasField = true;
    }
    if (document.getElementById('chk_batchJornada').checked) {
      campos['jornadaContratual'] = document.getElementById('batchJornada').value.trim();
      hasField = true;
    }
    if (document.getElementById('chk_batchTurno').checked) {
      campos['turnoAtual'] = document.getElementById('batchTurno').value;
      hasField = true;
    }
    if (document.getElementById('chk_batchStatus').checked) {
      campos['status'] = document.getElementById('batchStatus').value;
      hasField = true;
    }
    if (document.getElementById('chk_batchFerias').checked) {
      campos['feriasProgramadas'] = document.getElementById('batchFerias').value.trim();
      hasField = true;
    }
    if (document.getElementById('chk_batchAfastamentos').checked) {
      campos['afastamentos'] = document.getElementById('batchAfastamentos').value.trim();
      hasField = true;
    }
    if (document.getElementById('chk_batchQualificacoes').checked) {
      campos['qualificacoes'] = document.getElementById('batchQualificacoes').value.trim();
      hasField = true;
    }

    if (!hasField) {
      alert('Selecione pelo menos um campo para alteração em lote.');
      return;
    }

    const btn = document.getElementById('btnSalvarLote');
    if (btn) btn.disabled = true;

    fetch('api/salvar_operadores_lote.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids, campos })
    })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) {
        alert(data.mensagem);
        closeOverlay();
        limparSelecaoLote();
        buscarOperadoresDoServidor();
        buscarHistoricoDoServidor();
      } else {
        alert('Erro ao salvar em lote: ' + data.erro);
        if (btn) btn.disabled = false;
      }
    })
    .catch(err => {
      alert('Erro de conexão: ' + err.message);
      if (btn) btn.disabled = false;
    });
  };

  function init(){
    buscarPostosDoServidor();
    buscarOperadoresDoServidor();
    buscarEscalasDoServidor();
    buscarHistoricoDoServidor();
    buscarEquipesDoServidor();
    buscarMensagensDoServidor();
    renderTrocas();
    renderEscalaHoje();
    loadUser();
    
    // Add escape key closing for new modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        fecharModalCadastroPosto();
        fecharModalCadastroEquipe();
      }
    });

    // Add backdrop click listeners for new modals
    setTimeout(() => {
      const modalPosto = document.getElementById('modalCadastroPosto');
      if (modalPosto) {
        modalPosto.addEventListener('click', e => {
          if (e.target === modalPosto) fecharModalCadastroPosto();
        });
      }
      const modalEquipe = document.getElementById('modalCadastroEquipe');
      if (modalEquipe) {
        modalEquipe.addEventListener('click', e => {
          if (e.target === modalEquipe) fecharModalCadastroEquipe();
        });
      }
    }, 100);
    
    setTimeout(() => {
      const selectAllOpsCheckbox = document.getElementById('selectAllOps');
      if (selectAllOpsCheckbox) {
        selectAllOpsCheckbox.addEventListener('change', (e) => {
          const checked = e.target.checked;
          const checkboxes = document.querySelectorAll('.select-op-checkbox');
          checkboxes.forEach(c => {
            c.checked = checked;
            const opId = parseInt(c.dataset.opId, 10);
            if (checked) {
              selectedOpIds.add(opId);
            } else {
              selectedOpIds.delete(opId);
            }
          });
          updateBatchActionBar();
        });
      }
    }, 100);
  }
  init();

  (function initInactivityTimeout() {
    const INACTIVITY_KEY = 'sgo_last_activity';
    
    let userObj = null;
    try {
      const raw = localStorage.getItem('sgo_usuario');
      if (raw) userObj = JSON.parse(raw);
    } catch(e) {}
    
    if (!userObj) return;

    const roles = userObj.roles || [];
    const isGestor = roles.includes('GESTOR') || roles.includes('ADMIN');
    const timeoutLimit = isGestor 
      ? 5 * 60 * 60 * 1000 // 5 hours in ms
      : 5 * 60 * 1000;     // 5 minutes in ms

    function updateActivity() {
      try {
        localStorage.setItem(INACTIVITY_KEY, Date.now().toString());
      } catch(e) {}
    }

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach(evt => document.addEventListener(evt, updateActivity, { passive: true }));

    if (!localStorage.getItem(INACTIVITY_KEY)) {
      updateActivity();
    }

    function checkTimeout() {
      const lastActivity = parseInt(localStorage.getItem(INACTIVITY_KEY) || Date.now(), 10);
      if (Date.now() - lastActivity > timeoutLimit) {
        localStorage.removeItem('sgo_auth_token');
        localStorage.removeItem('sgo_usuario');
        localStorage.removeItem(INACTIVITY_KEY);
        window.location.href = 'index.html?reason=inactivity';
      }
    }

    checkTimeout();
    setInterval(checkTimeout, 10000);
  })();


  // GLOBAL ALERTS
  const originalAlert = window.alert;
  window.sgoAlert = function(mensagem, titulo = 'SGO diz') {
    const modal = document.getElementById('modalAlerta');
    const msgEl = document.getElementById('modalAlertaMensagem');
    const titEl = document.getElementById('modalAlertaTitulo');
    if (modal && msgEl && titEl) {
      titEl.textContent = titulo;
      msgEl.textContent = mensagem;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    } else {
      originalAlert(mensagem);
    }
  };

  window.sgoConfirm = function(mensagem, titulo = 'Atenção') {
    return new Promise((resolve) => {
      const modal = document.getElementById('modalConfirm');
      const msgEl = document.getElementById('modalConfirmMensagem');
      const titEl = document.getElementById('modalConfirmTitulo');
      const btnCancelar = document.getElementById('btnModalConfirmCancelar');
      const btnConfirmar = document.getElementById('btnModalConfirmConfirmar');
      
      if (modal && msgEl && titEl && btnCancelar && btnConfirmar) {
        titEl.textContent = titulo;
        msgEl.textContent = mensagem;
        
        const cleanup = () => {
          modal.classList.remove('open');
          modal.setAttribute('aria-hidden', 'true');
          btnCancelar.removeEventListener('click', onCancel);
          btnConfirmar.removeEventListener('click', onConfirm);
        };
        
        const onCancel = () => { cleanup(); resolve(false); };
        const onConfirm = () => { cleanup(); resolve(true); };
        
        btnCancelar.addEventListener('click', onCancel);
        btnConfirmar.addEventListener('click', onConfirm);
        
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      } else {
        resolve(window.confirm(mensagem));
      }
    });
  };

  // Sobrescreve o alert nativo para usar o nosso customizado em todo o sistema gestor
  window.alert = function(msg) {
    sgoAlert(msg);
  };

  const btnModalAlertaFechar = document.getElementById('btnModalAlertaFechar');
  if (btnModalAlertaFechar) {
    btnModalAlertaFechar.addEventListener('click', () => {
      const modal = document.getElementById('modalAlerta');
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }


  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('SW Registrado: ', reg.scope))
        .catch(err => console.log('SW Falha: ', err));
    });
  }


  window.togglePainelNotificacoes = function() {
    const painel = document.getElementById("painelNotificacoes");
    if (painel.style.display === "none") {
      painel.style.display = "block";
    } else {
      painel.style.display = "none";
    }
  };

  window.verificarNotificacoesGestor = function() {
    let notificacoes = [];
    if (typeof MOCK_TROCAS !== "undefined") {
      const trocasPendentes = MOCK_TROCAS.filter(t => t.status === "pending" || t.status.toLowerCase().includes("aguardando"));
      if (trocasPendentes.length > 0) {
        notificacoes.push({
          texto: "Você possui " + trocasPendentes.length + " pendência(s) de troca de turno.",
          acao: () => { togglePainelNotificacoes(); }
        });
      }
    }
    
    const badge = document.getElementById("badgeNotificacoes");
    const lista = document.getElementById("listaNotificacoes");
    
    if (badge && lista) {
      if (notificacoes.length > 0) {
        badge.style.display = "block";
        badge.textContent = notificacoes.length;
        lista.innerHTML = "";
        notificacoes.forEach(n => {
          const div = document.createElement("div");
          div.style.padding = "10px";
          div.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
          div.style.cursor = "pointer";
          div.textContent = "?? " + n.texto;
          div.onclick = n.acao;
          div.onmouseover = () => div.style.background = "rgba(255,255,255,0.1)";
          div.onmouseout = () => div.style.background = "transparent";
          lista.appendChild(div);
        });
      } else {
        badge.style.display = "none";
        lista.innerHTML = "<div style=\"padding: 10px; text-align: center; color: var(--muted);\">Nenhuma pendência nova.</div>";
      }
    }
  };

  setTimeout(verificarNotificacoesGestor, 3000);
  setInterval(verificarNotificacoesGestor, 30000);


