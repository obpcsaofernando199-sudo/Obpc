/* Número da versão no topo (pedido do Pastor, 26/11/2026).
   Mostra a versão que a pessoa está VENDO (hora em que esta página foi publicada) no formato dia.mês.horaminuto.
   E se já existir uma versão mais nova publicada, a página se atualiza sozinha (uma vez), sem precisar apertar Ctrl+F5. */
(function(){
  function dois(n){return String(n).padStart(2,'0');}
  function fmt(d){return 'Versão '+dois(d.getDate())+'.'+dois(d.getMonth()+1)+'.'+dois(d.getHours())+dois(d.getMinutes());}
  function pinta(d){document.querySelectorAll('[data-versao]').forEach(function(el){el.textContent=fmt(d);el.title='Publicada em '+d.toLocaleDateString('pt-BR')+' às '+dois(d.getHours())+':'+dois(d.getMinutes());el.hidden=false;});}
  /* tira o ?v= do endereço depois da atualização automática (fica limpo para compartilhar) */
  try{var u0=new URL(location.href);if(u0.searchParams.has('v')){u0.searchParams.delete('v');history.replaceState(null,'',u0.pathname+u0.search+u0.hash);}}catch(e){}
  var minha=new Date(document.lastModified);
  if(!isNaN(minha))pinta(minha);
  function conferir(){
    try{
      fetch(location.pathname+'?v='+Date.now(),{method:'HEAD',cache:'no-store'}).then(function(r){
        var lm=r.headers.get('last-modified');if(!lm)return;var nova=new Date(lm);if(isNaN(nova))return;
        if(isNaN(minha)){minha=nova;pinta(nova);return;}
        if(nova-minha>60000){
          var k='obpc_atualizou',ult=0;try{ult=+sessionStorage.getItem(k)||0;}catch(e){}
          if(Date.now()-ult>120000){try{sessionStorage.setItem(k,String(Date.now()));}catch(e){}
            /* recarrega pedindo a página nova (o endereço com ?v= força o navegador a não usar a cópia antiga) */
            var u=new URL(location.href);u.searchParams.set('v',String(nova.getTime()));location.replace(u.toString());}
        }
      }).catch(function(){});
    }catch(e){}
  }
  conferir();setInterval(conferir,5*60000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)conferir();});
})();
