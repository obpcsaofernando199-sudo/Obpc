/* Senha das páginas de administração (painel e financeiro — a agenda ficou sem senha a pedido do Pastor) — 23/11/2026.
   Pede uma senha de números. Depois de acertar uma vez, o aparelho fica liberado
   (vale para todas essas páginas). Para trocar a senha, troque o HASH abaixo.
   Observação: é uma proteção simples, contra curiosos; não substitui login de verdade. */
(function () {
  var HASH = '565922c67654bee7bb955d873f77279de96c2fb2646e8e4428e910117afd3833';
  var CHAVE = 'obpc_adm_ok';
  try { if (localStorage.getItem(CHAVE) === HASH) return; } catch (e) {}
  var html = document.documentElement;
  html.classList.add('trancado');
  var st = document.createElement('style');
  st.textContent = 'html.trancado body>*:not(#tranca){display:none!important}html.trancado body{overflow:hidden!important}' +
    '#tranca{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;' +
    'background:radial-gradient(60% 40% at 20% 0,rgba(46,90,190,.35),transparent 70%),#070B18;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#tranca .cx{width:100%;max-width:360px;background:linear-gradient(180deg,#121B36,#0C1328);border:1.5px solid #F2C14E;border-radius:22px;padding:26px 22px;text-align:center;color:#F4F1EA;box-shadow:0 24px 50px -20px rgba(0,0,0,.8)}' +
    '#tranca h1{margin:6px 0 4px;font:700 1.35rem Georgia,serif;color:#F2C14E}#tranca p{margin:0 0 18px;color:#C9CEDC;font-size:.98rem}' +
    '#tranca input{width:100%;box-sizing:border-box;text-align:center;letter-spacing:.5em;font:800 1.7rem system-ui,sans-serif;padding:14px;border-radius:14px;border:1.5px solid rgba(242,193,78,.5);background:#070B18;color:#fff;outline:none}' +
    '#tranca input:focus{border-color:#F2C14E;box-shadow:0 0 0 3px rgba(242,193,78,.25)}' +
    '#tranca button{margin-top:14px;width:100%;border:0;border-radius:14px;padding:15px;font:900 1.1rem system-ui,sans-serif;background:linear-gradient(135deg,#FFE29A,#F2C14E 45%,#C8902E);color:#0A0F1F;cursor:pointer}' +
    '#tranca .er{min-height:1.3em;margin-top:10px;color:#FCA5A5;font-weight:700}#tranca a{display:inline-block;margin-top:14px;color:#C9CEDC;font-size:.9rem}';
  (document.head || html).appendChild(st);

  /* SHA-256 (funciona mesmo em aparelho antigo) */
  function sha256(s) {
    function r(n, x) { return (x >>> n) | (x << (32 - n)); }
    var K = [], H = [], p = 2, n = 0;
    function primo(v) { for (var d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; }
    while (n < 64) { if (primo(p)) { if (n < 8) H[n] = (Math.pow(p, 1 / 2) * 4294967296) | 0; K[n++] = (Math.pow(p, 1 / 3) * 4294967296) | 0; } p++; }
    s = unescape(encodeURIComponent(s));
    var b = [], L = s.length * 8, i;
    for (i = 0; i < s.length; i++) b[i >> 2] |= s.charCodeAt(i) << ((3 - i % 4) * 8);
    b[L >> 5] |= 0x80 << (24 - L % 32); b[((L + 64 >> 9) << 4) + 15] = L;
    for (i = 0; i < b.length; i += 16) {
      var w = [], a = H.slice(0), j;
      for (j = 0; j < 64; j++) {
        if (j < 16) w[j] = b[i + j] | 0;
        else { var x = w[j - 15], y = w[j - 2]; w[j] = (w[j - 16] + (r(7, x) ^ r(18, x) ^ (x >>> 3)) + w[j - 7] + (r(17, y) ^ r(19, y) ^ (y >>> 10))) | 0; }
        var t1 = (a[7] + (r(6, a[4]) ^ r(11, a[4]) ^ r(25, a[4])) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[j] + w[j]) | 0;
        var t2 = ((r(2, a[0]) ^ r(13, a[0]) ^ r(22, a[0])) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]))) | 0;
        a = [(t1 + t2) | 0].concat(a); a[4] = (a[4] + t1) | 0; a.length = 8;
      }
      for (j = 0; j < 8; j++) H[j] = (H[j] + a[j]) | 0;
    }
    return H.map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
  }

  function monta() {
    if (document.getElementById('tranca')) return;
    var d = document.createElement('div'); d.id = 'tranca';
    d.innerHTML = '<form class="cx" autocomplete="off"><div style="font-size:2.4rem">🔒</div><h1>Área da liderança</h1>' +
      '<p>Digite a senha para entrar.</p><input id="tranca-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="10" aria-label="Senha">' +
      '<div class="er" id="tranca-er"></div><button type="submit">Entrar</button><br><a href="index.html">Voltar ao site</a></form>';
    document.body.appendChild(d);
    var inp = document.getElementById('tranca-pin'), er = document.getElementById('tranca-er');
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 100);
    function tenta() {
      var v = inp.value.replace(/\D/g, '');
      if (sha256('obpc-sf:' + v) === HASH) {
        try { localStorage.setItem(CHAVE, HASH); } catch (e) {}
        html.classList.remove('trancado'); d.remove();
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      } else { er.textContent = 'Senha errada. Tente de novo.'; inp.value = ''; inp.focus(); }
    }
    d.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); tenta(); });
    inp.addEventListener('input', function () { er.textContent = ''; var v = inp.value.replace(/\D/g, ''); if (v.length >= 4 && sha256('obpc-sf:' + v) === HASH) tenta(); });
  }
  if (document.body) monta(); else document.addEventListener('DOMContentLoaded', monta);
})();
