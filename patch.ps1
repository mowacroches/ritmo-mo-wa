$f = 'c:\Users\Jaqueline\Desktop\app rotina de mo wa\index.html'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
Write-Host "Lido: $($c.Length) bytes"

# ─── 1. BUG EXCLUSAO: substituir renderModalLista completa ──────────────────
$newModal = @'
    function renderModalLista() {
      var rotina     = usuarioAtivo === "naomi" ? naomiRoutine : jaquelineRoutine;
      var builtinAll = getTarefasHoje(rotina, modalDiaKey);
      var excluidos  = carregarExcluidos(usuarioAtivo, modalDiaKey);
      var builtin    = builtinAll.filter(function(t) {
        return excluidos.indexOf(taskId(t)) === -1;
      });
      var extras = carregarExtras(usuarioAtivo, modalDiaKey);
      var todas = builtin.map(function(t) {
        return { i: t.i, f: t.f, n: t.n, cat: "", tipo: "builtin", tid: taskId(t) };
      }).concat(extras.map(function(t) {
        return { i: t.i, f: t.f, n: t.n, cat: t.cat || "", tipo: "extra", id: t.id };
      }));
      todas.sort(function(a, b) { return toMin(a.i) - toMin(b.i); });
      var lista = document.getElementById("modal-lista");
      lista.innerHTML = "";
      if (todas.length === 0) {
        lista.innerHTML = '<p style="font-size:0.83rem;color:#cccccc;font-style:italic">Nenhuma tarefa neste dia.</p>';
        renderSonoModal(rotina);
        return;
      }
      todas.forEach(function(t) {
        var item = document.createElement("div");
        item.className = "modal-tarefa";
        var horaSpan = document.createElement("span");
        horaSpan.className = "modal-tarefa-hora";
        horaSpan.textContent = fmt(t.i) + (t.f ? " \u2014 " + fmt(t.f) : "");
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
        var acoesDiv = document.createElement("div");
        acoesDiv.className = "modal-tarefa-acoes";
        if (t.tipo === "builtin") {
          var btnX = document.createElement("button");
          btnX.className = "modal-btn-acao"; btnX.title = "Excluir"; btnX.textContent = "\u00d7";
          (function(tid) {
            btnX.addEventListener("click", function(e) { e.stopPropagation(); excluirBuiltin(tid); });
          })(t.tid);
          acoesDiv.appendChild(btnX);
        } else if (t.tipo === "extra") {
          var btnEd = document.createElement("button");
          btnEd.className = "modal-btn-acao"; btnEd.title = "Editar"; btnEd.innerHTML = "&#9998;";
          (function(id) {
            btnEd.addEventListener("click", function(e) { e.stopPropagation(); editarExtra(id); });
          })(t.id);
          var btnRm = document.createElement("button");
          btnRm.className = "modal-btn-acao"; btnRm.title = "Remover"; btnRm.innerHTML = "&#10005;";
          (function(id) {
            btnRm.addEventListener("click", function(e) { e.stopPropagation(); removerExtra(id); });
          })(t.id);
          acoesDiv.appendChild(btnEd);
          acoesDiv.appendChild(btnRm);
        }
        item.appendChild(horaSpan);
        item.appendChild(infoDiv);
        item.appendChild(acoesDiv);
        lista.appendChild(item);
      });
      renderSonoModal(rotina);
    }
'@
$c = [regex]::Replace($c, '(?s)    function renderModalLista\(\) \{.*?\n    \}(\s*\n    function mostrarFormAdd)', $newModal + '    function mostrarFormAdd')
Write-Host "1. renderModalLista substituida"

# ─── 2. NAV BUTTON Bem-estar ────────────────────────────────────────────────
$old2 = 'trocarAba(''rel'')">Relat' + [char]0xF3 + 'rio</button>' + "`n  </nav>"
$new2 = 'trocarAba(''rel'')">Relat' + [char]0xF3 + 'rio</button>' + "`n    <button id=`"btn-aba-bemestar`" onclick=`"trocarAba('bemestar')`">Bem-estar</button>`n  </nav>"
if ($c.Contains('btn-aba-bemestar')) { Write-Host "2. Botao ja existe" }
elseif ($c -match 'trocarAba..rel..>Relat') {
  $c = [regex]::Replace($c, '(trocarAba\(''rel''\)">Relat[^<]+</button>)\s*</nav>', '$1' + "`n    <button id=`"btn-aba-bemestar`" onclick=`"trocarAba('bemestar')`">Bem-estar</button>`n  </nav>")
  Write-Host "2. Botao Bem-estar adicionado"
} else { Write-Host "2. FALHA botao nav" }

# ─── 3. CSS ─────────────────────────────────────────────────────────────────
$css = @'

    /* ── Bem-estar ──────────────────────────────────────────── */
    .be-secao { width:90%; max-width:420px; margin-top:32px; }
    .be-titulo { font-size:0.65rem; font-weight:600; letter-spacing:1.2px; text-transform:uppercase; color:#bbbbbb; margin-bottom:14px; }
    .be-subtitulo { font-size:0.75rem; font-weight:600; color:#888888; margin-bottom:12px; margin-top:24px; }
    .be-cuidado { background:#f9f5f0; border-radius:12px; padding:14px 16px; font-size:0.88rem; color:#7a6652; line-height:1.6; margin-bottom:20px; font-style:italic; }
    .be-humor-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
    .be-humor-btn { padding:7px 14px; border:1.5px solid #e8e8e8; border-radius:100px; background:transparent; font-family:inherit; font-size:0.82rem; color:#888888; cursor:pointer; transition:all 0.18s; }
    .be-humor-btn.ativo { background:#1a1a1a; border-color:#1a1a1a; color:#ffffff; }
    .be-campo label { display:block; font-size:0.7rem; color:#aaaaaa; letter-spacing:0.5px; margin-bottom:4px; margin-top:16px; }
    .be-campo textarea, .be-campo input[type=date], .be-campo input[type=time] { width:100%; border:1.5px solid #e8e8e8; border-radius:10px; padding:10px 12px; font-family:inherit; font-size:0.88rem; color:#555555; background:#fafafa; outline:none; }
    .be-campo textarea { color:#1a1a1a; resize:none; line-height:1.5; }
    .be-campo textarea:focus, .be-campo input:focus { border-color:#aaaaaa; }
    .be-btn-salvar { display:block; width:100%; margin-top:20px; padding:12px; border:none; border-radius:100px; background:#1a1a1a; color:#ffffff; font-family:inherit; font-size:0.88rem; font-weight:500; cursor:pointer; }
    .be-btn-salvar:active { opacity:0.75; }
    .be-salvo-msg { text-align:center; font-size:0.78rem; color:#aaaaaa; margin-top:10px; min-height:1.2em; }
    .be-ciclo-badge { display:inline-block; background:#f9f0f5; color:#a06080; font-size:0.75rem; padding:4px 12px; border-radius:100px; margin-bottom:12px; }
    .be-hist-item { border-left:2px solid #eeeeee; padding:8px 0 8px 14px; margin-bottom:12px; }
    .be-hist-data { font-size:0.7rem; color:#aaaaaa; margin-bottom:4px; }
    .be-hist-humor { font-size:0.82rem; font-weight:500; color:#555555; }
    .be-hist-obs { font-size:0.8rem; color:#888888; margin-top:2px; white-space:pre-wrap; }
    .be-vazio { font-size:0.83rem; color:#cccccc; font-style:italic; margin-top:8px; }
    /* Sono no modal */
    .sono-secao { margin-top:24px; padding-top:20px; border-top:1.5px solid #f0f0f0; }
    .sono-titulo { font-size:0.65rem; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#cccccc; margin-bottom:14px; }
    .sono-linha { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
    .sono-campo label { display:block; font-size:0.68rem; color:#aaaaaa; margin-bottom:4px; }
    .sono-campo input[type=time] { width:100%; border:1.5px solid #e8e8e8; border-radius:8px; padding:8px 10px; font-family:inherit; font-size:0.85rem; color:#1a1a1a; background:#fafafa; outline:none; }
    .sono-campo input[type=time]:focus { border-color:#aaaaaa; }
    .sono-planejado { font-size:0.78rem; color:#bbbbbb; margin-bottom:12px; line-height:1.8; }
    .sono-salvo-msg { font-size:0.75rem; color:#aaaaaa; text-align:center; margin-top:6px; min-height:1em; }
    .sono-btn { width:100%; padding:10px; border:1.5px solid #e0e0e0; border-radius:100px; background:transparent; font-family:inherit; font-size:0.82rem; color:#888888; cursor:pointer; margin-top:8px; }
    .sono-btn:active { border-color:#aaaaaa; }
'@
if (-not ($c -match 'Bem-estar.*──')) {
  $c = $c -replace '(    \.cal-dia\.clicavel:hover \{ background: #f0f0f0; \})', "`$1$css"
  Write-Host "3. CSS adicionado"
} else { Write-Host "3. CSS ja existe" }

# ─── 4. HTML aba Bem-estar ───────────────────────────────────────────────────
$htmlBe = @'
  <!-- ═══════════ ABA: BEM-ESTAR ═══════════ -->
  <div id="aba-bemestar" style="display:none; width:100%; flex-direction:column; align-items:center;">
    <div class="be-secao" id="be-cuidado-bloco" style="display:none">
      <div class="be-cuidado" id="be-cuidado-msg"></div>
    </div>
    <div class="be-secao">
      <p class="be-titulo">Bem-estar</p>
      <p class="be-subtitulo" id="be-pessoa-titulo">Jaqueline</p>
      <span id="be-ciclo-badge" class="be-ciclo-badge" style="display:none">&#129293; Per&#237;odo ativo</span>
      <p class="be-subtitulo">Como voc&#234; est&#225; hoje?</p>
      <div class="be-humor-grid" id="be-humor-grid">
        <button class="be-humor-btn" data-humor="leve">leve</button>
        <button class="be-humor-btn" data-humor="tranquila">tranquila</button>
        <button class="be-humor-btn" data-humor="energ&#233;tica">energ&#233;tica</button>
        <button class="be-humor-btn" data-humor="cansada">cansada</button>
        <button class="be-humor-btn" data-humor="sens&#237;vel">sens&#237;vel</button>
        <button class="be-humor-btn" data-humor="sobrecarregada">sobrecarregada</button>
        <button class="be-humor-btn" data-humor="exausta">exausta</button>
      </div>
      <div class="be-campo">
        <label>Corpo, energia, emo&#231;&#245;es...</label>
        <textarea id="be-obs" rows="3" placeholder="Como seu corpo est&#225; te avisando hoje?"></textarea>
      </div>
      <button class="be-btn-salvar" onclick="salvarBemestar()">Salvar</button>
      <p class="be-salvo-msg" id="be-salvo-msg"></p>
    </div>
    <div class="be-secao">
      <p class="be-subtitulo">Ciclo menstrual</p>
      <div class="be-campo"><label>In&#237;cio</label><input type="date" id="be-ciclo-inicio" /></div>
      <div class="be-campo"><label>Fim</label><input type="date" id="be-ciclo-fim" /></div>
      <button class="be-btn-salvar" onclick="salvarCiclo()">Salvar ciclo</button>
      <p class="be-salvo-msg" id="be-ciclo-msg"></p>
    </div>
    <div class="be-secao" style="margin-bottom:40px">
      <p class="be-subtitulo">Hist&#243;rico recente</p>
      <div id="be-historico"></div>
    </div>
  </div><!-- fim aba-bemestar -->

'@
if (-not ($c -match 'aba-bemestar')) {
  $c = $c -replace '(  <!-- Modal de dia -->)', $htmlBe + '$1'
  Write-Host "4. HTML Bem-estar adicionado"
} else { Write-Host "4. HTML ja existe" }

# ─── 5. HTML sono no modal (antes do btn-add) ───────────────────────────────
$htmlSono = @'
      <div class="sono-secao" id="modal-sono-secao">
        <p class="sono-titulo">Sono real</p>
        <p class="sono-planejado" id="modal-sono-planejado"></p>
        <div class="sono-linha">
          <div class="sono-campo"><label>Dormiu</label><input type="time" id="sono-dormiu" /></div>
          <div class="sono-campo"><label>Acordou</label><input type="time" id="sono-acordou" /></div>
        </div>
        <button class="sono-btn" onclick="salvarSono()">Salvar sono</button>
        <p class="sono-salvo-msg" id="sono-salvo-msg"></p>
      </div>
'@
if (-not ($c -match 'modal-sono-secao')) {
  $c = $c -replace '(      <button class="modal-btn-add")', $htmlSono + '$1'
  Write-Host "5. HTML Sono adicionado"
} else { Write-Host "5. HTML Sono ja existe" }

# ─── 6. trocarAba: adicionar bemestar ───────────────────────────────────────
$old6 = "      if (aba === `"rel`") { `n        relAno"
$old6b = "if (aba === `"rel`") {`n        relAno"
if (-not ($c -match "aba-bemestar.*style.*display")) {
  $c = [regex]::Replace($c, "(if \(aba === `"rel`"\) \{[^}]+\})\s*\n    \};", '$1' + "`n      if (aba === `"bemestar`") iniciarBemestar();`n      document.getElementById(`"aba-bemestar`").style.display = aba === `"bemestar`" ? `"flex`" : `"none`";`n    };")
  Write-Host "6. trocarAba atualizado"
} else { Write-Host "6. trocarAba ja atualizado" }

# Garantir btn-aba-bemestar no classList do trocarAba
if (-not ($c -match 'btn-aba-bemestar.*classList')) {
  $c = $c -replace '(btn-aba-rel.*classList[^;]+;)', '$1' + "`n      document.getElementById(`"btn-aba-bemestar`").classList.toggle(`"ativa`", aba === `"bemestar`");"
  Write-Host "6b. classList bemestar adicionado"
}

# ─── 7. JS Bem-estar + Sono ──────────────────────────────────────────────────
$jsAll = @'

    // ── Bem-estar ────────────────────────────────────────────────────────────
    var beHumor = "";
    var MSGS_CUIDADO = [
      "Seu corpo pode precisar de mais pausa hoje.",
      "Tudo bem desacelerar.",
      "Respeitar seu ritmo tamb\u00e9m faz parte da rotina.",
      "Cuidado tamb\u00e9m \u00e9 produtividade saud\u00e1vel.",
      "Voc\u00ea n\u00e3o precisa produzir no mesmo ritmo todos os dias.",
      "Pausas s\u00e3o parte do processo, n\u00e3o interrup\u00e7\u00f5es.",
      "Escutar o corpo \u00e9 uma forma de intelig\u00eancia.",
    ];

    function beKey(u, d) { return "ritmo_bemestar_" + u + "_" + d; }
    function cicloKey(u) { return "ritmo_ciclo_" + u; }
    function carregarCiclos(u) { return JSON.parse(localStorage.getItem(cicloKey(u)) || "[]"); }
    function salvarCiclos(u, l) { localStorage.setItem(cicloKey(u), JSON.stringify(l)); }

    function estaEmCiclo(u) {
      var h = dataHojeStr();
      return carregarCiclos(u).some(function(c) { return c.ini && c.fim && h >= c.ini && h <= c.fim; });
    }

    function iniciarBemestar() {
      var p = usuarioAtivo, h = dataHojeStr();
      document.getElementById("be-pessoa-titulo").textContent = p === "naomi" ? "Naomi" : "Jaqueline";
      beHumor = "";
      var salvo = JSON.parse(localStorage.getItem(beKey(p, h)) || "{}");
      document.querySelectorAll(".be-humor-btn").forEach(function(b) {
        b.classList.remove("ativo");
        b.onclick = function() {
          document.querySelectorAll(".be-humor-btn").forEach(function(x) { x.classList.remove("ativo"); });
          b.classList.add("ativo"); beHumor = b.dataset.humor;
        };
        if (salvo.humor && b.dataset.humor === salvo.humor) { b.classList.add("ativo"); beHumor = salvo.humor; }
      });
      document.getElementById("be-obs").value = salvo.obs || "";
      var ciclos = carregarCiclos(p), ultimo = ciclos.length ? ciclos[ciclos.length - 1] : null;
      document.getElementById("be-ciclo-inicio").value = ultimo ? (ultimo.ini || "") : "";
      document.getElementById("be-ciclo-fim").value    = ultimo ? (ultimo.fim || "") : "";
      var em = estaEmCiclo(p);
      document.getElementById("be-ciclo-badge").style.display = em ? "" : "none";
      var cb = document.getElementById("be-cuidado-bloco");
      if (em) {
        document.getElementById("be-cuidado-msg").textContent = MSGS_CUIDADO[Math.floor(Math.random() * MSGS_CUIDADO.length)];
        cb.style.display = "";
      } else { cb.style.display = "none"; }
      renderBeHistorico();
    }

    function salvarBemestar() {
      var p = usuarioAtivo, h = dataHojeStr();
      localStorage.setItem(beKey(p, h), JSON.stringify({ humor: beHumor, obs: document.getElementById("be-obs").value.trim(), data: h, pessoa: p, salvoEm: new Date().toISOString() }));
      var m = document.getElementById("be-salvo-msg");
      m.textContent = "Salvo."; setTimeout(function() { m.textContent = ""; }, 2000);
      renderBeHistorico();
    }

    function salvarCiclo() {
      var p = usuarioAtivo, ini = document.getElementById("be-ciclo-inicio").value, fim = document.getElementById("be-ciclo-fim").value;
      if (!ini) { alert("Informe a data de in\u00edcio."); return; }
      var ciclos = carregarCiclos(p), ok = false;
      ciclos = ciclos.map(function(c) { if (c.ini === ini) { ok = true; return { ini: ini, fim: fim }; } return c; });
      if (!ok) ciclos.push({ ini: ini, fim: fim });
      salvarCiclos(p, ciclos);
      var m = document.getElementById("be-ciclo-msg");
      m.textContent = "Ciclo salvo."; setTimeout(function() { m.textContent = ""; }, 2000);
      var em = estaEmCiclo(p);
      document.getElementById("be-ciclo-badge").style.display = em ? "" : "none";
      var cb = document.getElementById("be-cuidado-bloco");
      if (em) { document.getElementById("be-cuidado-msg").textContent = MSGS_CUIDADO[Math.floor(Math.random() * MSGS_CUIDADO.length)]; cb.style.display = ""; }
      else { cb.style.display = "none"; }
    }

    function renderBeHistorico() {
      var p = usuarioAtivo, cont = document.getElementById("be-historico"), ents = [];
      for (var k = 0; k < localStorage.length; k++) {
        var ch = localStorage.key(k);
        if (!ch.startsWith("ritmo_bemestar_" + p + "_")) continue;
        var d = JSON.parse(localStorage.getItem(ch) || "{}");
        if (d.data) ents.push(d);
      }
      ents.sort(function(a, b) { return b.data.localeCompare(a.data); });
      ents = ents.slice(0, 8);
      if (!ents.length) { cont.innerHTML = '<p class="be-vazio">Nenhum registro ainda.</p>'; return; }
      var DS = ["dom","seg","ter","qua","qui","sex","s\u00e1b"];
      cont.innerHTML = ents.map(function(e) {
        var dO = new Date(e.data + "T12:00:00");
        return '<div class="be-hist-item"><p class="be-hist-data">' + DS[dO.getDay()] + ' ' + dO.getDate() + '</p>' +
          (e.humor ? '<p class="be-hist-humor">' + e.humor + '</p>' : '') +
          (e.obs   ? '<p class="be-hist-obs">'   + e.obs.replace(/</g,"&lt;") + '</p>' : '') + '</div>';
      }).join("");
    }

    // ── Sono real ────────────────────────────────────────────────────────────
    function sonoKey(u, d) { return "ritmo_sono_" + u + "_" + d; }

    function renderSonoModal(rotina) {
      var sec = document.getElementById("modal-sono-secao");
      if (!sec) return;
      var tarefas = getTarefasHoje(rotina, modalDiaKey);
      var tDormir  = tarefas.find(function(t) { return t.n.toLowerCase().indexOf("dormir") !== -1; });
      var tAcordar = tarefas.find(function(t) { return t.n.toLowerCase().indexOf("acordar") !== -1; });
      var plan = "";
      if (tDormir)  plan += "Dormir planejado: " + fmt(tDormir.i)  + "\n";
      if (tAcordar) plan += "Acordar planejado: " + fmt(tAcordar.i);
      document.getElementById("modal-sono-planejado").textContent = plan || "";

      var salvo = JSON.parse(localStorage.getItem(sonoKey(usuarioAtivo, modalDiaKey)) || "{}");
      document.getElementById("sono-dormiu").value  = salvo.dormiu  || "";
      document.getElementById("sono-acordou").value = salvo.acordou || "";
      document.getElementById("sono-salvo-msg").textContent = "";
    }

    function salvarSono() {
      var dormiu  = document.getElementById("sono-dormiu").value;
      var acordou = document.getElementById("sono-acordou").value;
      if (!dormiu && !acordou) return;
      localStorage.setItem(sonoKey(usuarioAtivo, modalDiaKey), JSON.stringify({ dormiu: dormiu, acordou: acordou, data: modalDiaKey, pessoa: usuarioAtivo }));
      var m = document.getElementById("sono-salvo-msg");
      m.textContent = "Sono salvo."; setTimeout(function() { m.textContent = ""; }, 2000);
    }

'@
if (-not ($c -match 'ritmo_sono_')) {
  $c = $c -replace '(  </script>)', $jsAll + '$1'
  Write-Host "7. JS adicionado"
} else { Write-Host "7. JS ja existe" }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "`n OK - arquivo salvo: $($c.Length) bytes"
