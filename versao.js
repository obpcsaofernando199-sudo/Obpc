/* Número da versão no topo (pedido do Pastor, 26/11/2026).
   Sai sozinho da hora em que o site foi publicado (cabeçalho Last-Modified do GitHub Pages),
   então muda a cada publicação sem ninguém precisar lembrar de trocar. Formato: Versão 26.11.1158 (dia.mês.horaminuto). */
(function(){
  function pinta(txt,tit){document.querySelectorAll('[data-versao]').forEach(function(el){el.textContent=txt;el.title=tit;el.hidden=false;});}
  function dois(n){return String(n).padStart(2,'0');}
  try{
    fetch('index.html?v='+Date.now(),{method:'HEAD',cache:'no-store'}).then(function(r){
      var lm=r.headers.get('last-modified');if(!lm)return;var d=new Date(lm);if(isNaN(d))return;
      pinta('Versão '+dois(d.getDate())+'.'+dois(d.getMonth()+1)+'.'+dois(d.getHours())+dois(d.getMinutes()),
            'Publicada em '+d.toLocaleDateString('pt-BR')+' às '+dois(d.getHours())+':'+dois(d.getMinutes()));
    }).catch(function(){});
  }catch(e){}
})();
