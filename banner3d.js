/* ═══ BANNER 3D REALISTA — OBPC Jd. São Fernando ═══
   Desenha banners parados (sem animação), com luz, profundidade e letras douradas em relevo.
   Só imagens de Bíblia (nada de cruz ou santos).
   Uso:  Banner3D.aniversario(canvas, {nome, msg, rodape, foto, tema})  -> Promise
         Banner3D.culto(canvas, {titulo, versiculo, referencia, dia, data, horario, local, tema}) -> Promise */
(function(){
'use strict';
var FONTES='https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=EB+Garamond:ital,wght@0,500;0,600;1,400;1,500&family=Manrope:wght@500;600;700;800&display=swap';
var BIBLIAS=['photo-1499652848871-1527a310b13a','photo-1772939119762-98d63c75b337','photo-1777421389250-b8488f933832','photo-1772939119764-7aac08ea201c','photo-1777421389268-ebefab72e96d'].map(function(id){return 'https://images.unsplash.com/'+id+'?w=1400&q=80&fm=jpg&fit=crop';});

function fontesProntas(){
  if(!document.querySelector('link[data-b3d]')){var l=document.createElement('link');l.rel='stylesheet';l.href=FONTES;l.setAttribute('data-b3d','1');document.head.appendChild(l);}
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  var t=["900 100px 'Cinzel'","700 60px 'Cinzel'","italic 500 40px 'EB Garamond'","600 40px 'EB Garamond'","700 40px 'Manrope'","800 40px 'Manrope'"];
  return Promise.race([Promise.all(t.map(function(f){return document.fonts.load(f).catch(function(){});})),new Promise(function(r){setTimeout(r,2500);})]);
}
function carregar(src){return new Promise(function(ok,no){if(!src)return no();var im=new Image();if(!/^data:/.test(src))im.crossOrigin='anonymous';im.onload=function(){ok(im);};im.onerror=no;im.src=src;setTimeout(no,9000);});}
function rnd(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function hashStr(t){var h=2166136261;t=String(t||'');for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function hexRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function rgba(h,a){var c=hexRgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}

/* foto de fundo "fora de foco" (desfoque por redução, funciona em qualquer celular) */
function fotoDesfocada(g,im,W,H,forca){
  var esc=Math.max(W/im.width,H/im.height),w=im.width*esc,h=im.height*esc;
  var f=Math.max(1,forca||1),c=document.createElement('canvas');c.width=Math.max(8,Math.round(W/(6*f)));c.height=Math.max(8,Math.round(H/(6*f)));
  var cg=c.getContext('2d');cg.imageSmoothingQuality='high';cg.drawImage(im,(W-w)/2*c.width/W,(H-h)/2*c.height/H,w*c.width/W,h*c.height/H);
  g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(c,0,0,W,H);g.restore();
}
function fotoNitida(g,im,x,y,w,h){var esc=Math.max(w/im.width,h/im.height),iw=im.width*esc,ih=im.height*esc;g.drawImage(im,x+(w-iw)/2,y+(h-ih)/2,iw,ih);}

/* luz quente vinda de cima, com raios suaves */
function luz(g,W,H,cor,y0){
  g.save();g.globalCompositeOperation='screen';
  var r=g.createRadialGradient(W/2,y0,10,W/2,y0,W*0.95);r.addColorStop(0,rgba(cor,.55));r.addColorStop(.35,rgba(cor,.18));r.addColorStop(1,rgba(cor,0));
  g.fillStyle=r;g.fillRect(0,0,W,H);
  for(var i=-5;i<=5;i++){var a=i*0.11;var lg=g.createLinearGradient(W/2,y0,W/2+Math.sin(a)*H,y0+H);lg.addColorStop(0,rgba(cor,.16));lg.addColorStop(1,rgba(cor,0));
    g.fillStyle=lg;g.beginPath();g.moveTo(W/2-6,y0);g.lineTo(W/2+Math.sin(a-.035)*H*1.2,y0+H*1.1);g.lineTo(W/2+Math.sin(a+.035)*H*1.2,y0+H*1.1);g.lineTo(W/2+6,y0);g.closePath();g.fill();}
  g.restore();
}
/* bolinhas de luz desfocadas (bokeh), paradas */
function bokeh(g,W,H,n,seed,cores,yMin,yMax){
  var R=rnd(seed);g.save();g.globalCompositeOperation='screen';
  for(var i=0;i<n;i++){var x=R()*W,y=yMin+R()*(yMax-yMin),r=18+R()*R()*110,c=cores[i%cores.length],a=.08+R()*.22;
    var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(c,a*.9));gr.addColorStop(.75,rgba(c,a*.7));gr.addColorStop(.93,rgba(c,a));gr.addColorStop(1,rgba(c,0));
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  g.restore();
}
function vinheta(g,W,H,forca){var v=g.createRadialGradient(W/2,H*0.45,H*0.25,W/2,H*0.5,H*0.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,'+(forca||.7)+')');g.fillStyle=v;g.fillRect(0,0,W,H);}
function grao(g,W,H,seed){var R=rnd(seed),c=document.createElement('canvas');c.width=160;c.height=160;var cg=c.getContext('2d'),d=cg.createImageData(160,160);for(var i=0;i<d.data.length;i+=4){var v=128+(R()-.5)*60;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=14;}cg.putImageData(d,0,0);g.save();g.fillStyle=g.createPattern(c,'repeat');g.globalCompositeOperation='overlay';g.fillRect(0,0,W,H);g.restore();}

/* ouro metálico para preencher letras e molduras */
function ouro(g,y,h,paleta){var p=paleta||OURO,lg=g.createLinearGradient(0,y,0,y+h);lg.addColorStop(0,p[0]);lg.addColorStop(.28,p[1]);lg.addColorStop(.5,p[2]);lg.addColorStop(.56,p[3]);lg.addColorStop(.8,p[1]);lg.addColorStop(1,p[4]);return lg;}
var OURO=['#FFF6D5','#F6D27A','#C8902E','#E9B655','#8A5A10'];
var ROSE=['#FFF1EA','#F3C4B2','#C98470','#E5A894','#7E4535'];
var PRATA=['#FFFFFF','#E3E8F0','#9AA4B5','#C7CEDA','#5D6678'];

/* texto em relevo 3D: sombra no chão, corpo com profundidade, face metálica e brilho */
function texto3D(g,txt,x,y,fonte,tam,op){
  op=op||{};var prof=op.prof||Math.round(tam*0.09),pal=op.paleta||OURO,esp=op.esp||0;
  g.save();g.font=fonte;g.textAlign=op.align||'center';g.textBaseline='alphabetic';
  if(esp&&'letterSpacing' in g)g.letterSpacing=esp+'px';
  // sombra projetada
  g.save();g.shadowColor='rgba(0,0,0,.75)';g.shadowBlur=tam*.45;g.shadowOffsetY=tam*.22;g.fillStyle='rgba(0,0,0,.6)';g.fillText(txt,x,y+prof);g.restore();
  // corpo (extrusão)
  for(var i=prof;i>0;i--){var k=i/prof;g.fillStyle='rgb('+Math.round(70+60*(1-k))+','+Math.round(42+38*(1-k))+','+Math.round(8+10*(1-k))+')';if(pal===PRATA)g.fillStyle='rgb('+Math.round(50+60*(1-k))+','+Math.round(56+60*(1-k))+','+Math.round(70+60*(1-k))+')';if(pal===ROSE)g.fillStyle='rgb('+Math.round(90+60*(1-k))+','+Math.round(44+40*(1-k))+','+Math.round(34+30*(1-k))+')';g.fillText(txt,x+i*0.25,y+i);}
  // face
  g.fillStyle=ouro(g,y-tam*.85,tam,pal);g.fillText(txt,x,y);
  // contorno fino escuro para nitidez
  g.lineWidth=Math.max(1,tam*0.012);g.strokeStyle='rgba(60,35,5,.55)';g.strokeText(txt,x,y);
  // brilho na metade de cima
  g.save();g.globalCompositeOperation='source-atop';var hl=g.createLinearGradient(0,y-tam*.85,0,y-tam*.3);hl.addColorStop(0,'rgba(255,255,255,.55)');hl.addColorStop(1,'rgba(255,255,255,0)');g.restore();
  g.save();g.beginPath();g.rect(0,y-tam*.95,g.canvas.width,tam*.5);g.clip();g.globalAlpha=.35;g.fillStyle='#fff';g.fillText(txt,x,y);g.restore();
  g.fillStyle=ouro(g,y-tam*.85,tam,pal);g.globalAlpha=.55;g.fillText(txt,x,y);g.globalAlpha=1;
  g.restore();
}
function ajustarFonte(g,txt,max,tamMax,tamMin,fam){var t=tamMax;g.font=fam.replace('$',t);while(t>tamMin&&g.measureText(txt).width>max){t-=2;g.font=fam.replace('$',t);}return t;}
function quebrar(g,txt,max){var p=String(txt||'').split(/\s+/),ls=[],l='';p.forEach(function(w){var t=l?l+' '+w:w;if(g.measureText(t).width>max&&l){ls.push(l);l=w;}else l=t;});if(l)ls.push(l);return ls;}
/* não deixa uma palavrinha ("E", "DE") sozinha numa linha */
function juntarCurtas(ls){var o=[];for(var i=0;i<ls.length;i++){if(ls[i].length<=3&&i+1<ls.length){ls[i+1]=ls[i]+' '+ls[i+1];continue;}if(ls[i].length<=3&&o.length){o[o.length-1]+=' '+ls[i];continue;}o.push(ls[i]);}return o;}
function espacado(g,txt,x,y,fonte,cor,esp){g.save();g.font=fonte;g.fillStyle=cor;g.textAlign='center';if('letterSpacing' in g){g.letterSpacing=esp+'px';g.fillText(txt,x+esp/2,y);}else g.fillText(txt.split('').join(' '),x,y);g.restore();}

/* placa de vidro escuro com borda dourada e sombra (dá profundidade) */
function placa(g,x,y,w,h,r,cor){
  g.save();g.shadowColor='rgba(0,0,0,.65)';g.shadowBlur=60;g.shadowOffsetY=28;rr(g,x,y,w,h,r);g.fillStyle='rgba(8,11,24,.62)';g.fill();g.restore();
  g.save();rr(g,x,y,w,h,r);g.clip();var s=g.createLinearGradient(0,y,0,y+h);s.addColorStop(0,'rgba(255,255,255,.13)');s.addColorStop(.18,'rgba(255,255,255,.03)');s.addColorStop(1,'rgba(0,0,0,.18)');g.fillStyle=s;g.fillRect(x,y,w,h);g.restore();
  rr(g,x+1,y+1,w-2,h-2,r);var b=g.createLinearGradient(x,y,x+w,y+h);b.addColorStop(0,rgba(cor||'#F2C14E',.9));b.addColorStop(.5,rgba(cor||'#F2C14E',.25));b.addColorStop(1,rgba(cor||'#F2C14E',.75));g.strokeStyle=b;g.lineWidth=3;g.stroke();
  rr(g,x+10,y+10,w-20,h-20,Math.max(4,r-8));g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=2;g.stroke();
}
/* filete dourado com losango no meio */
function filete(g,cx,y,larg,pal){var lg=g.createLinearGradient(cx-larg/2,0,cx+larg/2,0);lg.addColorStop(0,'rgba(242,193,78,0)');lg.addColorStop(.5,(pal||OURO)[1]);lg.addColorStop(1,'rgba(242,193,78,0)');g.fillStyle=lg;g.fillRect(cx-larg/2,y-1.5,larg,3);g.save();g.translate(cx,y);g.rotate(Math.PI/4);g.fillStyle=ouro(g,-9,18,pal);g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=8;g.fillRect(-9,-9,18,18);g.restore();}

/* moldura redonda de metal para a foto (ou iniciais em relevo) */
function medalhao(g,cx,cy,r,im,iniciais,pal){
  pal=pal||OURO;
  g.save();g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=70;g.shadowOffsetY=36;g.beginPath();g.arc(cx,cy,r+34,0,Math.PI*2);g.fillStyle='#2a1c08';g.fill();g.restore();
  // aro externo metálico
  g.beginPath();g.arc(cx,cy,r+34,0,Math.PI*2);g.fillStyle=ouro(g,cy-r-34,(r+34)*2,pal);g.fill();
  g.beginPath();g.arc(cx,cy,r+20,0,Math.PI*2);var bv=g.createLinearGradient(0,cy-r,0,cy+r);bv.addColorStop(0,'rgba(60,35,5,.8)');bv.addColorStop(1,'rgba(255,240,200,.6)');g.fillStyle=bv;g.fill();
  g.beginPath();g.arc(cx,cy,r+14,0,Math.PI*2);g.fillStyle=ouro(g,cy+r,-(r*2),pal);g.fill();
  // foto
  g.save();g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.clip();
  if(im){fotoNitida(g,im,cx-r,cy-r,r*2,r*2);}
  else{var f=g.createRadialGradient(cx-r*.3,cy-r*.4,10,cx,cy,r*1.2);f.addColorStop(0,'#1F2B57');f.addColorStop(1,'#070B18');g.fillStyle=f;g.fillRect(cx-r,cy-r,r*2,r*2);
    if(iniciais){var t=Math.round(r*.9);texto3D(g,iniciais,cx,cy+t*.34,"900 "+t+"px 'Cinzel'",t,{paleta:pal,prof:Math.round(t*.07)});}}
  // sombra interna + reflexo de vidro
  var is=g.createRadialGradient(cx,cy,r*.72,cx,cy,r);is.addColorStop(0,'rgba(0,0,0,0)');is.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=is;g.fillRect(cx-r,cy-r,r*2,r*2);
  g.beginPath();g.ellipse(cx-r*.18,cy-r*.55,r*.78,r*.36,-.25,0,Math.PI*2);var gl=g.createLinearGradient(0,cy-r,0,cy-r*.2);gl.addColorStop(0,'rgba(255,255,255,.28)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fill();
  g.restore();
  // brilho no aro
  g.save();g.globalCompositeOperation='screen';var sp=g.createRadialGradient(cx-r*.6,cy-r*.75,0,cx-r*.6,cy-r*.75,r*.5);sp.addColorStop(0,'rgba(255,255,255,.75)');sp.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sp;g.beginPath();g.arc(cx,cy,r+34,0,Math.PI*2);g.arc(cx,cy,r,0,Math.PI*2,true);g.fill();g.restore();
}
/* medalha com o dia e o mês */
function medalhaData(g,cx,cy,r,dia,mes,pal){
  g.save();g.shadowColor='rgba(0,0,0,.75)';g.shadowBlur=40;g.shadowOffsetY=20;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.fillStyle=ouro(g,cy-r,r*2,pal);g.fill();g.restore();
  g.beginPath();g.arc(cx,cy,r-12,0,Math.PI*2);var f=g.createRadialGradient(cx-r*.3,cy-r*.4,4,cx,cy,r);f.addColorStop(0,'#1F2B57');f.addColorStop(1,'#070B18');g.fillStyle=f;g.fill();
  if(dia){var t=Math.round(r*.78);texto3D(g,dia,cx,cy+t*.18,"900 "+t+"px 'Cinzel'",t,{paleta:pal,prof:Math.round(t*.06)});}
  if(mes){g.save();g.font="800 "+Math.round(r*.24)+"px 'Manrope'";g.fillStyle=(pal||OURO)[1];g.textAlign='center';if('letterSpacing' in g)g.letterSpacing='4px';g.fillText(mes.toUpperCase(),cx,cy+r*.55);g.restore();}
  g.save();g.globalCompositeOperation='screen';g.beginPath();g.ellipse(cx-r*.2,cy-r*.55,r*.6,r*.25,-.3,0,Math.PI*2);g.fillStyle='rgba(255,255,255,.12)';g.fill();g.restore();
}

/* ═══ ANIVERSÁRIO (1080×1350) ═══ */
var TEMAS_ANV={
  m:{pal:OURO,luz:'#F2C14E',bok:['#F2C14E','#FFE29A','#C8902E','#7FA7FF'],fundo:['#0C1328','#070B18']},
  f:{pal:ROSE,luz:'#F3C4B2',bok:['#F3C4B2','#FFE2D6','#E5A894','#F2C14E'],fundo:['#2A1322','#0E0710']},
  k:{pal:OURO,luz:'#FFD36B',bok:['#FFD36B','#7FE0D0','#FF9F7A','#9FC4FF'],fundo:['#0E2233','#06101A']}
};
function aniversario(cv,o){
  o=o||{};var t=TEMAS_ANV[o.tema]||TEMAS_ANV.m,W=cv.width,H=cv.height,g=cv.getContext('2d'),seed=hashStr((o.nome||'')+(o.tema||''));
  return Promise.all([fontesProntas(),o.foto?carregar(o.foto).catch(function(){return null;}):Promise.resolve(null)]).then(function(r){
    var foto=r[1];
    // fundo: veludo escuro + luzes desfocadas + (se houver foto) a própria foto bem fora de foco
    var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,t.fundo[0]);bg.addColorStop(1,t.fundo[1]);g.fillStyle=bg;g.fillRect(0,0,W,H);
    if(foto){g.save();g.globalAlpha=.35;fotoDesfocada(g,foto,W,H,3);g.restore();}
    bokeh(g,W,H,46,seed,t.bok,0,H*.62);
    luz(g,W,H,t.luz,-40);
    bokeh(g,W,H,10,seed+7,t.bok,H*.7,H);
    vinheta(g,W,H,.72);
    // chão com reflexo
    var ch=g.createLinearGradient(0,H*.86,0,H);ch.addColorStop(0,'rgba(0,0,0,0)');ch.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=ch;g.fillRect(0,H*.86,W,H*.14);
    espacado(g,'FELIZ ANIVERSÁRIO',W/2,128,"700 34px 'Manrope'",t.pal[1],10);
    filete(g,W/2,162,460,t.pal);
    var ini=String(o.nome||'').trim().split(/\s+/).slice(0,2).map(function(p){return p[0]||'';}).join('').toUpperCase()||'♥';
    medalhao(g,W/2,430,200,foto,ini,t.pal);
    // PARABÉNS em relevo
    texto3D(g,'Parabéns',W/2,790,"900 118px 'Cinzel'",118,{paleta:t.pal});
    // nome
    var nome=String(o.nome||'Nome do aniversariante').trim();
    var tn=ajustarFonte(g,nome,W*.84,74,40,"italic 500 $px 'EB Garamond'");
    g.save();g.font="italic 500 "+tn+"px 'EB Garamond'";g.textAlign='center';g.fillStyle='#FFFFFF';g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=18;g.shadowOffsetY=6;g.fillText(nome,W/2,880);g.restore();
    // mensagem numa placa de vidro
    var msg=String(o.msg||'Que Deus te abençoe neste novo ano de vida!').replace(/\s+/g,' ').trim();
    g.font="600 38px 'EB Garamond'";var ls=quebrar(g,msg,W*.7).slice(0,3);
    var ph=70+ls.length*50+78,py=930;
    placa(g,W*.1,py,W*.8,ph,30,t.pal[1]);
    g.save();g.textAlign='center';g.fillStyle='#F4F1EA';g.font="600 38px 'EB Garamond'";ls.forEach(function(l,i){g.fillText(l,W/2,py+70+i*50);});
    g.font="italic 400 28px 'EB Garamond'";g.fillStyle=t.pal[1];g.fillText('“Este é o dia que o Senhor fez.” — Salmos 118:24',W/2,py+70+ls.length*50+30);g.restore();
    // rodapé
    var rod=String(o.rodape||'Com carinho, Família OBPC Jd. São Fernando');
    g.save();g.textAlign='center';g.font="700 30px 'Manrope'";g.fillStyle='rgba(244,241,234,.82)';g.fillText(rod,W/2,H-62);g.restore();
    grao(g,W,H,seed);
    return cv;
  });
}

/* ═══ CULTO (1080×1920) ═══
   Cada culto tem visual próprio: cores do fundo, da luz, das bolinhas de luz e do metal do título.
   topo = palavra pequena acima do título; sub = frase abaixo do título. Sempre só Bíblia ao fundo. */
var ESTILOS={
  celebracao:{topo:'CULTO DE',sub:'Venha celebrar ao Senhor conosco',c1:'#2A1A06',c2:'#0B0702',luz:'#FFC94D',bk:['#FFD36B','#FFB03A','#FFF0B8'],nBk:34,pal:'OURO'},
  familia:{topo:'CULTO DA',sub:'Traga toda a sua família',c1:'#2B1A10',c2:'#0C0704',luz:'#F0B070',bk:['#F5C08A','#E89A55','#FFE2B8'],nBk:22,pal:'OURO'},
  ensino:{topo:'CULTO DE',sub:'Crescendo na Palavra de Deus',c1:'#14223F',c2:'#050914',luz:'#F2C14E',bk:['#F2C14E','#FFE29A'],nBk:16,pal:'OURO'},
  estudo:{topo:'QUARTA-FEIRA',sub:'Abra a sua Bíblia e venha aprender',c1:'#1C2A2E',c2:'#060B0C',luz:'#F4D7A0',bk:['#F4D7A0','#D9B77A'],nBk:12,pal:'OURO'},
  qoracao:{topo:'QUARTA-FEIRA',sub:'Buscando a face de Deus',c1:'#141A3A',c2:'#04050F',luz:'#AFC2FF',bk:['#AFC2FF','#E3E8FF','#7F95E0'],nBk:20,pal:'PRATA'},
  oracao:{topo:'CULTO DE',sub:'Buscando a face de Deus',c1:'#141A3A',c2:'#04050F',luz:'#AFC2FF',bk:['#AFC2FF','#E3E8FF'],nBk:20,pal:'PRATA'},
  quarta:{topo:'QUARTA-FEIRA',sub:'Uma noite de adoração',c1:'#251238',c2:'#0A0414',luz:'#D8B4E8',bk:['#D8B4E8','#B58AE0','#FFE29A'],nBk:28,pal:'OURO'},
  louvor:{topo:'CULTO DE',sub:'Cante ao Senhor um cântico novo',c1:'#2E1608',c2:'#0D0602',luz:'#E9C877',bk:['#E9C877','#FFB45A','#FFF0C0'],nBk:36,pal:'OURO'},
  ceia:{topo:'CULTO DE',sub:'Fazei isto em memória de mim',c1:'#2A0B12',c2:'#0D0306',luz:'#E9C877',bk:['#E9C877','#B0485A'],nBk:14,pal:'OURO'},
  missoes:{topo:'CULTO DE',sub:'Ide por todo o mundo',c1:'#0E2B26',c2:'#03100D',luz:'#8FD9C4',bk:['#8FD9C4','#F2C14E'],nBk:22,pal:'OURO'},
  jubrac:{topo:'JUBRAC',sub:'Juventude que adora a Deus',c1:'#3A0D22',c2:'#0E0308',luz:'#FF7A3D',bk:['#FF7A3D','#FF3D7F','#FFD36B'],nBk:44,pal:'OURO'},
  menibrac:{topo:'MENIBRAC',sub:'Deixai vir a mim as crianças',c1:'#0D2A44',c2:'#04101C',luz:'#FFE08A',bk:['#FFE08A','#6FD3FF','#FF8FC7','#9BF07A'],nBk:46,pal:'OURO'},
  ufebrac:{topo:'UFEBRAC',sub:'Mulheres que servem ao Senhor',c1:'#3A1028',c2:'#10040B',luz:'#F3B6C9',bk:['#F3B6C9','#E58AAE','#FFE0EA'],nBk:30,pal:'ROSE'},
  umasbrac:{topo:'UMASBRAC',sub:'Homens de fé e de oração',c1:'#14202E',c2:'#04070B',luz:'#B9C6D8',bk:['#B9C6D8','#7E93AE'],nBk:14,pal:'PRATA'},
  especial:{topo:'CULTO',sub:'Você é nosso convidado',c1:'#121B36',c2:'#04060E',luz:'#F2C14E',bk:['#F2C14E','#FFE29A'],nBk:22,pal:'OURO'}
};
var MESES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
function culto(cv,o){
  o=o||{};var es=ESTILOS[o.tema]||ESTILOS.especial,PAL={OURO:OURO,ROSE:ROSE,PRATA:PRATA}[es.pal]||OURO;
  var W=cv.width,H=cv.height,g=cv.getContext('2d'),cor=es.luz||o.cor||'#F2C14E',seed=hashStr((o.titulo||'')+(o.tema||''));
  var topo=o.topo!=null?o.topo:es.topo,sub=o.sub!=null?o.sub:es.sub,t1=hexRgb(es.c1),t2=hexRgb(es.c2);
  function tint(a,c){c=c||t2;return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
  var fotoUrl=o.fundo||BIBLIAS[seed%BIBLIAS.length];
  return Promise.all([fontesProntas(),carregar(fotoUrl).catch(function(){return null;})]).then(function(r){
    var bib=r[1];
    var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,es.c1);bg.addColorStop(1,es.c2);g.fillStyle=bg;g.fillRect(0,0,W,H);
    if(bib){
      // Bíblia aberta: nítida no meio, desfocada em volta (profundidade de câmera)
      fotoDesfocada(g,bib,W,H,2.2);
      g.save();var m=g.createLinearGradient(0,H*.18,0,H*.72);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.35,'rgba(0,0,0,1)');m.addColorStop(.75,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');
      var c=document.createElement('canvas');c.width=W;c.height=H;var cg=c.getContext('2d');fotoNitida(cg,bib,0,0,W,H);cg.globalCompositeOperation='destination-in';cg.fillStyle=m;cg.fillRect(0,0,W,H);g.globalAlpha=.85;g.drawImage(c,0,0);g.restore();
      var esc=g.createLinearGradient(0,0,0,H);esc.addColorStop(0,tint(.84,t1));esc.addColorStop(.3,tint(.5,t1));esc.addColorStop(.62,tint(.58));esc.addColorStop(1,tint(.95));g.fillStyle=esc;g.fillRect(0,0,W,H);
    }else{bokeh(g,W,H,40,seed,es.bk,0,H);}
    luz(g,W,H,cor,-60);
    bokeh(g,W,H,es.nBk||18,seed+3,es.bk,0,H*.42);
    bokeh(g,W,H,Math.round((es.nBk||18)/2),seed+7,es.bk,H*.62,H);
    vinheta(g,W,H,.65);
    // topo
    if(topo){espacado(g,String(topo).toUpperCase(),W/2,260,"800 40px 'Manrope'",PAL[1],16);filete(g,W/2,300,420,PAL);}
    // título em relevo
    var tit=String(o.titulo||'CULTO').toUpperCase();
    g.font="900 10px 'Cinzel'";var palavras=tit.split(/\s+/),linhas=[],tam=150;
    while(tam>70){g.font="900 "+tam+"px 'Cinzel'";linhas=juntarCurtas(quebrar(g,tit,W*.86));if(linhas.length<=3&&linhas.every(function(l){return g.measureText(l).width<=W*.88;}))break;tam-=6;}
    var y=420+tam*.8;linhas.forEach(function(l){texto3D(g,l,W/2,y,"900 "+tam+"px 'Cinzel'",tam,{paleta:PAL});y+=tam*1.12;});
    if(sub){g.save();g.textAlign='center';g.font="italic 500 50px 'EB Garamond'";g.fillStyle=rgba(cor,.95);g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=12;
      var sl=quebrar(g,String(sub),W*.8).slice(0,2);sl.forEach(function(l,i){g.fillText(l,W/2,y+6+i*58);});g.restore();y+=sl.length*58+10;}
    // versículo
    var vers=String(o.versiculo||'').trim(),ref=String(o.referencia||'').trim();
    if(vers){g.font="italic 500 46px 'EB Garamond'";var vl=quebrar(g,'“'+vers.replace(/^["“]|["”]$/g,'')+'”',W*.74).slice(0,4);
      var vy=y+30,vh=60+vl.length*58+(ref?60:10);placa(g,W*.08,vy,W*.84,vh,34,cor);
      g.save();g.textAlign='center';g.fillStyle='#F4F1EA';g.font="italic 500 46px 'EB Garamond'";vl.forEach(function(l,i){g.fillText(l,W/2,vy+72+i*58);});
      if(ref){g.font="700 34px 'Manrope'";g.fillStyle=OURO[1];if('letterSpacing' in g)g.letterSpacing='3px';g.fillText(ref.toUpperCase(),W/2,vy+72+vl.length*58+16);}g.restore();}
    // bloco de data/hora
    var data=String(o.data||'').trim(),dia='',mes='';var md=data.match(/^(\d{1,2})[\/\-.](\d{1,2})/);if(md){dia=String(+md[1]);mes=MESES[(+md[2]-1)%12]||'';}
    var by=H-470,bh=320;placa(g,W*.06,by,W*.88,bh,40,cor);
    var temMed=!!dia;if(temMed)medalhaData(g,W*.06+170,by+bh/2,118,dia,mes,PAL);
    var tx=temMed?W*.06+330:W/2,al=temMed?'left':'center';
    g.save();g.textAlign=al;g.fillStyle='#FFFFFF';g.font="800 64px 'Manrope'";g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=10;
    var diaSem=String(o.dia||'').trim();g.fillText(diaSem||'Venha adorar',tx,by+118);
    g.font="800 58px 'Manrope'";g.fillStyle=PAL[1];var hr=String(o.horario||'').trim();if(hr)g.fillText('às '+hr.replace(/^às\s*/i,''),tx,by+196);
    var loc=String(o.local||'').trim();if(loc){g.font="600 30px 'Manrope'";g.fillStyle='rgba(244,241,234,.8)';var ll=quebrar(g,loc,temMed?W*.5:W*.78).slice(0,2);ll.forEach(function(l,i){g.fillText(l,tx,by+250+i*38);});}
    g.restore();
    // rodapé
    g.save();g.textAlign='center';g.font="600 34px 'EB Garamond'";g.fillStyle='rgba(244,241,234,.78)';if('letterSpacing' in g)g.letterSpacing='4px';g.fillText('OBPC JD. SÃO FERNANDO',W/2,H-70);g.restore();
    grao(g,W,H,seed);
    return cv;
  });
}
window.Banner3D={aniversario:aniversario,culto:culto,estilos:ESTILOS};
})();
