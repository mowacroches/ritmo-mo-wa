const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let c = fs.readFileSync(file, 'utf8');

// ══════════════════════════════════════════════════════════
// 1. CORRIGIR BUG DE EXCLUSÃO — trocar onclick inline por addEventListener
// ══════════════════════════════════════════════════════════
const oldAcoes = `        var hora = '<span class="modal-tarefa-hora">' + fmt(t.i) + (t.f ? " \u2014 " + fmt(t.f) : "") + '</span>';
        var cat  = t.cat ? '<p class="modal-tarefa-cat">' + t.cat + '</p>' : "";
        var info = '<div class="modal-tarefa-info"><p class="modal-tarefa-nome">' +
                   t.n.replace(/</g, "&lt;") + '</p>' + cat + '</div>';

        var acoes = "";
        if (t.tipo === "builtin") {
          // Escapa o tid para uso em onclick
          var tidEsc = t.tid.replace(/\\\\/g, "\\\\\\\\").replace(/'/g, "\\\\'");
          acoes = '<div class="modal-tarefa-acoes">' +
            '<button class="modal-btn-acao" title="Excluir" onclick="excluirBuiltin(\\'' + tidEsc + '\\')">×</button>' +
            '</div>';
        } else if (t.tipo === "extra") {
          acoes = '<div class="modal-tarefa-acoes">' +
            '<button class="modal-btn-acao" title="Editar" onclick="editarExtra(\\'' + t.id + '\\')">&#9998;</button>' +
            '<button class="modal-btn-acao" title="Remover" onclick="removerExtra(\\'' + t.id + '\\')">&#10005;</button>' +
            '</div>';
        }

        item.innerHTML = hora + info + acoes;
        lista.appendChild(item);`;

const newAcoes = `        // Hora
        var horaSpan = document.createElement("span");
        horaSpan.className = "modal-tarefa-hora";
        horaSpan.textContent = fmt(t.i) + (t.f ? " \u2014 " + fmt(t.f) : "");

        // Info
        var infoDiv = document.createElement("div");
        infoDiv.className = "modal-tarefa-info";
        var nomeP = document.createElement("p");
        nomeP.className = "modal-tarefa-nome";
        nomeP.textContent = t.n;
        infoDiv.appendChild(nomeP);
        if (t.cat) {
          var catP = document.createElement("p");
          catP.className = "modal-tarefa-cat";
          catP.textContent = t.cat;
          infoDiv.appendChild(catP);
        }

        // Botões via addEventListener — sem escaping de onclick
        var acoesDiv = document.createElement("div");
        acoesDiv.className = "modal-tarefa-acoes";
        if (t.tipo === "builtin") {
          var btnX = document.createElement("button");
          btnX.className = "modal-btn-acao";
          btnX.title = "Excluir";
          btnX.textContent = "×";
          (function(tid) {
            btnX.addEventListener("click", function(e) {
              e.stopPropagation();
              excluirBuiltin(tid);
            });
          })(t.tid);
          acoesDiv.appendChild(btnX);
        } else if (t.tipo === "extra") {
          var btnEd = document.createElement("button");
          btnEd.className = "modal-btn-acao";
          btnEd.title = "Editar";
          btnEd.innerHTML = "&#9998;";
          (function(id) {
            btnEd.addEventListener("click", function(e) {
              e.stopPropagation();
              editarExtra(id);
            });
          })(t.id);
          var btnRm = document.createElement("button");
          btnRm.className = "modal-btn-acao";
          btnRm.title = "Remover";
          btnRm.innerHTML = "&#10005;";
          (function(id) {
            btnRm.addEventListener("click", function(e) {
              e.stopPropagation();
              removerExtra(id);
            });
          })(t.id);
          acoesDiv.appendChild(btnEd);
          acoesDiv.appendChild(btnRm);
        }

        item.appendChild(horaSpan);
        item.appendChild(infoDiv);
        item.appendChild(acoesDiv);
        lista.appendChild(item);`;

if (c.includes(oldAcoes)) {
  c = c.replace(oldAcoes, newAcoes);
  console.log('✓ Bug de exclusão corrigido');
} else {
  // Fallback: busca pelo comentário único
  const anchor = '// Escapa o tid para uso em onclick';
  if (c.includes(anchor)) {
    // Encontra o bloco que contém o comentário
    const idx = c.indexOf('        var hora = \'<span class="modal-tarefa-hora">\'', c.indexOf(anchor) - 500);
    const idxEnd = c.indexOf('lista.appendChild(item);', idx) + 'lista.appendChild(item);'.length;
    if (idx > 0 && idxEnd > idx) {
      c = c.slice(0, idx) + newAcoes + c.slice(idxEnd);
      console.log('✓ Bug de exclusão corrigido (fallback)');
    } else {
      console.log('✗ Não encontrou bloco de exclusão');
    }
  } else {
    console.log('✗ Bug exclusão: bloco não encontrado (pode já estar corrigido)');
  }
}

// ══════════════════════════════════════════════════════════
// 2. ADICIONAR ABA BEM-ESTAR — botão de navegação
// ══════════════════════════════════════════════════════════
const oldNavBtn = `<button id="btn-aba-rel" onclick="trocarAba('rel')">Relat\u00f3rio</button>
  </nav>`;
const newNavBtn = `<button id="btn-aba-rel" onclick="trocarAba('rel')">Relat\u00f3rio</button>
    <button id="btn-aba-bemestar" onclick="trocarAba('bemestar')">Bem-estar</button>
  </nav>`;
if (c.includes(oldNavBtn)) {
  c = c.replace(oldNavBtn, newNavBtn);
  console.log('✓ Botão Bem-estar adicionado');
} else {
  console.log('✗ Botão nav não encontrado');
}

// ══════════════════════════════════════════════════════════
// 3. CSS — estilos da aba Bem-estar
// ══════════════════════════════════════════════════════════
const cssBemestar = `
    /* \u2500\u2500 Aba Bem-estar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .be-secao {
      width: 90%;
      max-width: 420px;
      margin-top: 32px;
    }
    .be-titulo {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #bbbbbb;
      margin-bottom: 14px;
    }
    .be-subtitulo {
      font-size: 0.75rem;
      font-weight: 600;
      color: #888888;
      margin-bottom: 12px;
      margin-top: 24px;
    }
    .be-cuidado {
      background: #f9f5f0;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 0.88rem;
      color: #7a6652;
      line-height: 1.6;
      margin-bottom: 20px;
      font-style: italic;
    }
    .be-humor-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .be-humor-btn {
      padding: 7px 14px;
      border: 1.5px solid #e8e8e8;
      border-radius: 100px;
      background: transparent;
      font-family: inherit;
      font-size: 0.82rem;
      color: #888888;
      cursor: pointer;
      transition: all 0.18s ease;
    }
    .be-humor-btn.ativo {
      background: #1a1a1a;
      border-color: #1a1a1a;
      color: #ffffff;
    }
    .be-campo label {
      display: block;
      font-size: 0.7rem;
      color: #aaaaaa;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      margin-top: 16px;
    }
    .be-campo textarea {
      width: 100%;
      border: 1.5px solid #e8e8e8;
      border-radius: 10px;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 0.88rem;
      color: #1a1a1a;
      background: #fafafa;
      resize: none;
      outline: none;
      line-height: 1.5;
      transition: border-color 0.18s;
    }
    .be-campo textarea:focus { border-color: #aaaaaa; }
    .be-campo input[type="date"] {
      width: 100%;
      border: 1.5px solid #e8e8e8;
      border-radius: 10px;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 0.88rem;
      color: #555555;
      background: #fafafa;
      outline: none;
    }
    .be-btn-salvar {
      display: block;
      width: 100%;
      margin-top: 20px;
      padding: 12px;
      border: none;
      border-radius: 100px;
      background: #1a1a1a;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.18s;
    }
    .be-btn-salvar:active { opacity: 0.75; }
    .be-salvo-msg {
      text-align: center;
      font-size: 0.78rem;
      color: #aaaaaa;
      margin-top: 10px;
      min-height: 1.2em;
    }
    .be-ciclo-ativo {
      display: inline-block;
      background: #f9f0f5;
      color: #a06080;
      font-size: 0.75rem;
      padding: 4px 12px;
      border-radius: 100px;
      margin-bottom: 12px;
    }
    .be-hist-item {
      border-left: 2px solid #eeeeee;
      padding: 8px 0 8px 14px;
      margin-bottom: 12px;
    }
    .be-hist-data {
      font-size: 0.7rem;
      color: #aaaaaa;
      margin-bottom: 4px;
    }
    .be-hist-humor {
      font-size: 0.82rem;
      font-weight: 500;
      color: #555555;
    }
    .be-hist-obs {
      font-size: 0.8rem;
      color: #888888;
      margin-top: 2px;
      white-space: pre-wrap;
    }
    .be-vazio {
      font-size: 0.83rem;
      color: #cccccc;
      font-style: italic;
      margin-top: 8px;
    }`;

const cssAnchor = '    .cal-dia.clicavel:hover { background: #f0f0f0; }';
if (c.includes(cssAnchor)) {
  c = c.replace(cssAnchor, cssAnchor + cssBemestar);
  console.log('✓ CSS Bem-estar adicionado');
} else {
  console.log('✗ Âncora CSS não encontrada');
}

// ══════════════════════════════════════════════════════════
// 4. HTML — aba Bem-estar (inserir antes do modal)
// ══════════════════════════════════════════════════════════
const htmlBemestar = `
  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 ABA: BEM-ESTAR \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
  <div id="aba-bemestar" style="display:none; width:100%; flex-direction:column; align-items:center;">

    <!-- Mensagem de cuidado (aparece durante o ciclo) -->
    <div class="be-secao" id="be-cuidado-bloco" style="display:none">
      <div class="be-cuidado" id="be-cuidado-msg"></div>
    </div>

    <!-- Humor do dia -->
    <div class="be-secao">
      <p class="be-titulo">Bem-estar</p>

      <p class="be-subtitulo" id="be-pessoa-titulo">Jaqueline</p>
      <p id="be-ciclo-badge" class="be-ciclo-ativo" style="display:none">\ud83e\udd0d Per\u00edodo ativo</p>

      <p class="be-subtitulo">Como voc\u00ea est\u00e1 hoje?</p>
      <div class="be-humor-grid" id="be-humor-grid">
        <button class="be-humor-btn" data-humor="leve">leve</button>
        <button class="be-humor-btn" data-humor="tranquila">tranquila</button>
        <button class="be-humor-btn" data-humor="energ\u00e9tica">energ\u00e9tica</button>
        <button class="be-humor-btn" data-humor="cansada">cansada</button>
        <button class="be-humor-btn" data-humor="sens\u00edvel">sens\u00edvel</button>
        <button class="be-humor-btn" data-humor="sobrecarregada">sobrecarregada</button>
        <button class="be-humor-btn" data-humor="exausta">exausta</button>
      </div>

      <div class="be-campo">
        <label>Observa\u00e7\u00f5es livres (corpo, energia, emo\u00e7\u00f5es...)</label>
        <textarea id="be-obs" rows="3" placeholder="Como seu corpo est\u00e1 te avisando hoje?"></textarea>
      </div>

      <button class="be-btn-salvar" onclick="salvarBemestar()">Salvar</button>
      <p class="be-salvo-msg" id="be-salvo-msg"></p>
    </div>

    <!-- Ciclo menstrual -->
    <div class="be-secao">
      <p class="be-subtitulo">Ciclo menstrual</p>
      <div class="be-campo">
        <label>In\u00edcio do ciclo</label>
        <input type="date" id="be-ciclo-inicio" />
      </div>
      <div class="be-campo">
        <label>Fim do ciclo</label>
        <input type="date" id="be-ciclo-fim" />
      </div>
      <button class="be-btn-salvar" onclick="salvarCiclo()">Salvar ciclo</button>
      <p class="be-salvo-msg" id="be-ciclo-msg"></p>
    </div>

    <!-- Hist\u00f3rico -->
    <div class="be-secao" style="margin-bottom:40px">
      <p class="be-subtitulo">Hist\u00f3rico recente</p>
      <div id="be-historico"></div>
    </div>

  </div><!-- fim aba-bemestar -->

`;

const htmlAnchor = '  <!-- Modal de dia -->';
if (c.includes(htmlAnchor)) {
  c = c.replace(htmlAnchor, htmlBemestar + htmlAnchor);
  console.log('✓ HTML Bem-estar adicionado');
} else {
  console.log('✗ Âncora HTML não encontrada');
}

// ══════════════════════════════════════════════════════════
// 5. JS — lógica do Bem-estar + atualizar trocarAba
// ══════════════════════════════════════════════════════════
const jsTrocarAba = `      document.getElementById("btn-aba-bemestar").classList.toggle("ativa",  aba === "bemestar");
      if (aba === "obs") { carregarFormulario(); renderHistorico(); }`;
const oldTrocarAbaLine = `      if (aba === "obs") { carregarFormulario(); renderHistorico(); }`;
if (c.includes(oldTrocarAbaLine) && !c.includes(jsTrocarAba)) {
  c = c.replace(oldTrocarAbaLine, jsTrocarAba);
  console.log('✓ trocarAba atualizado');
}

const jsBemestar = `
    // ── Aba Bem-estar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    var beHumorSelecionado = "";

    var MENSAGENS_CUIDADO = [
      "Seu corpo pode precisar de mais pausa hoje.",
      "Tudo bem desacelerar.",
      "Respeitar seu ritmo tamb\u00e9m faz parte da rotina.",
      "Cuidado tamb\u00e9m \u00e9 produtividade saud\u00e1vel.",
      "Voc\u00ea n\u00e3o precisa produzir no mesmo ritmo todos os dias.",
      "Pausas s\u00e3o parte do processo, n\u00e3o interrup\u00e7\u00f5es.",
      "Escutar o corpo \u00e9 uma forma de intelig\u00eancia.",
      "Gentileza com voc\u00ea mesma tamb\u00e9m conta.",
    ];

    function bemestarKey(usuario, data) {
      return "ritmo_bemestar_" + usuario + "_" + data;
    }

    function cicloKey(usuario) {
      return "ritmo_ciclo_" + usuario;
    }

    function carregarCiclos(usuario) {
      return JSON.parse(localStorage.getItem(cicloKey(usuario)) || "[]");
    }

    function salvarCiclos(usuario, lista) {
      localStorage.setItem(cicloKey(usuario), JSON.stringify(lista));
    }

    function estaEmCiclo(usuario) {
      var hoje = dataHojeStr();
      var ciclos = carregarCiclos(usuario);
      return ciclos.some(function(c) {
        return c.inicio && c.fim && hoje >= c.inicio && hoje <= c.fim;
      });
    }

    function mensagemCuidado() {
      var idx = Math.floor(Math.random() * MENSAGENS_CUIDADO.length);
      return MENSAGENS_CUIDADO[idx];
    }

    function iniciarBemestar() {
      var pessoa = usuarioAtivo;
      document.getElementById("be-pessoa-titulo").textContent =
        pessoa === "naomi" ? "Naomi" : "Jaqueline";

      // Humor — resetar sele\u00e7\u00e3o e carregar salvo
      beHumorSelecionado = "";
      var hoje = dataHojeStr();
      var salvo = JSON.parse(localStorage.getItem(bemestarKey(pessoa, hoje)) || "{}");

      document.querySelectorAll(".be-humor-btn").forEach(function(btn) {
        btn.classList.remove("ativo");
        btn.onclick = function() {
          document.querySelectorAll(".be-humor-btn").forEach(function(b) { b.classList.remove("ativo"); });
          btn.classList.add("ativo");
          beHumorSelecionado = btn.dataset.humor;
        };
        if (salvo.humor && btn.dataset.humor === salvo.humor) {
          btn.classList.add("ativo");
          beHumorSelecionado = salvo.humor;
        }
      });

      document.getElementById("be-obs").value = salvo.obs || "";

      // Ciclo — carregar datas salvas
      var ciclos = carregarCiclos(pessoa);
      var ultimo = ciclos.length ? ciclos[ciclos.length - 1] : null;
      document.getElementById("be-ciclo-inicio").value = ultimo ? (ultimo.inicio || "") : "";
      document.getElementById("be-ciclo-fim").value    = ultimo ? (ultimo.fim    || "") : "";

      // Badge e mensagem de cuidado
      var emCiclo = estaEmCiclo(pessoa);
      document.getElementById("be-ciclo-badge").style.display = emCiclo ? "" : "none";
      var cuidadoBloco = document.getElementById("be-cuidado-bloco");
      if (emCiclo) {
        document.getElementById("be-cuidado-msg").textContent = mensagemCuidado();
        cuidadoBloco.style.display = "";
      } else {
        cuidadoBloco.style.display = "none";
      }

      renderBemestarHistorico();
    }

    function salvarBemestar() {
      var pessoa = usuarioAtivo;
      var hoje   = dataHojeStr();
      var dados  = {
        humor: beHumorSelecionado,
        obs:   document.getElementById("be-obs").value.trim(),
        data:  hoje,
        pessoa: pessoa,
        salvoEm: new Date().toISOString(),
      };
      localStorage.setItem(bemestarKey(pessoa, hoje), JSON.stringify(dados));
      var msg = document.getElementById("be-salvo-msg");
      msg.textContent = "Salvo com sucesso.";
      setTimeout(function() { msg.textContent = ""; }, 2500);
      renderBemestarHistorico();
    }

    function salvarCiclo() {
      var pessoa = usuarioAtivo;
      var inicio = document.getElementById("be-ciclo-inicio").value;
      var fim    = document.getElementById("be-ciclo-fim").value;
      if (!inicio) { alert("Informe ao menos a data de in\u00edcio."); return; }

      var ciclos = carregarCiclos(pessoa);
      // Atualiza ou adiciona ciclo para este per\u00edodo
      var encontrado = false;
      ciclos = ciclos.map(function(c) {
        if (c.inicio === inicio) { encontrado = true; return { inicio: inicio, fim: fim }; }
        return c;
      });
      if (!encontrado) ciclos.push({ inicio: inicio, fim: fim });
      salvarCiclos(pessoa, ciclos);

      var msg = document.getElementById("be-ciclo-msg");
      msg.textContent = "Ciclo salvo.";
      setTimeout(function() { msg.textContent = ""; }, 2500);

      // Atualiza badge
      var emCiclo = estaEmCiclo(pessoa);
      document.getElementById("be-ciclo-badge").style.display = emCiclo ? "" : "none";
      var cuidadoBloco = document.getElementById("be-cuidado-bloco");
      if (emCiclo) {
        document.getElementById("be-cuidado-msg").textContent = mensagemCuidado();
        cuidadoBloco.style.display = "";
      } else {
        cuidadoBloco.style.display = "none";
      }
    }

    function renderBemestarHistorico() {
      var pessoa = usuarioAtivo;
      var container = document.getElementById("be-historico");
      var entradas = [];
      for (var k = 0; k < localStorage.length; k++) {
        var chave = localStorage.key(k);
        if (!chave.startsWith("ritmo_bemestar_" + pessoa + "_")) continue;
        var d = JSON.parse(localStorage.getItem(chave) || "{}");
        if (d.data) entradas.push(d);
      }
      entradas.sort(function(a, b) { return b.data.localeCompare(a.data); });
      entradas = entradas.slice(0, 10);

      if (entradas.length === 0) {
        container.innerHTML = '<p class="be-vazio">Nenhum registro ainda.</p>';
        return;
      }

      var DIAS = ["domingo","segunda","ter\u00e7a","quarta","quinta","sexta","s\u00e1bado"];
      container.innerHTML = entradas.map(function(e) {
        var dObj = new Date(e.data + "T12:00:00");
        var diaSem = DIAS[dObj.getDay()];
        var diaNum = dObj.getDate();
        var obsHtml = e.obs ? '<p class="be-hist-obs">' + e.obs.replace(/</g, "&lt;") + '</p>' : '';
        var humorHtml = e.humor ? '<p class="be-hist-humor">' + e.humor + '</p>' : '';
        return '<div class="be-hist-item">' +
          '<p class="be-hist-data">' + diaSem + ', ' + diaNum + '</p>' +
          humorHtml + obsHtml + '</div>';
      }).join("");
    }`;

// Atualizar trocarAba para incluir bemestar
const oldAbaRel = `      if (aba === "rel") {
        relAno = new Date().getFullYear();
        relMes = new Date().getMonth();
        renderRelatorio();
      }
    };`;
const newAbaRel = `      if (aba === "rel") {
        relAno = new Date().getFullYear();
        relMes = new Date().getMonth();
        renderRelatorio();
      }
      if (aba === "bemestar") iniciarBemestar();

      document.getElementById("aba-bemestar").style.display = aba === "bemestar" ? "flex" : "none";
    };`;
if (c.includes(oldAbaRel)) {
  c = c.replace(oldAbaRel, newAbaRel);
  console.log('✓ trocarAba bemestar integrado');
} else {
  console.log('✗ trocarAba rel não encontrado');
}

// Inserir JS antes de </script>
const scriptClose = '  </script>';
if (c.includes(scriptClose) && !c.includes('ritmo_bemestar_')) {
  c = c.replace(scriptClose, jsBemestar + '\n' + scriptClose);
  console.log('✓ JS Bem-estar adicionado');
} else if (c.includes('ritmo_bemestar_')) {
  console.log('✓ JS Bem-estar já existe');
} else {
  console.log('✗ </script> não encontrado');
}

// Salvar
fs.writeFileSync(file, c, 'utf8');
console.log('\n✅ Patch aplicado com sucesso!');
console.log('Tamanho do arquivo: ' + c.length + ' bytes');
